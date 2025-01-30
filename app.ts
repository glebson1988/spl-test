import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createMintToInstruction,
  getOrCreateAssociatedTokenAccount,
  transfer,
  burnChecked,
} from "@solana/spl-token";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Fetch and validate an environment variable.
 * @param key - The key of the environment variable.
 * @param defaultValue - The default value if the variable is not set.
 * @returns The environment variable value.
 */
const getEnvVariable = (key: string, defaultValue: string = ""): string => {
  const value = process.env[key];
  if (!value) {
    console.warn(`Environment variable ${key} is not set. Using default value.`);
    return defaultValue;
  }
  return value;
};

// Read and validate environment variables
const secretKey: string = getEnvVariable("SECRET_KEY");
const quickNodeEndpoint: string = getEnvVariable("QUICKNODE_ENDPOINT");
if (!quickNodeEndpoint) {
  throw new Error("QUICKNODE_ENDPOINT is not set in the environment variables.");
}

let tokenAuthority: Keypair;
try {
  tokenAuthority = Keypair.fromSecretKey(new Uint8Array(JSON.parse(secretKey)));
} catch (error) {
  throw new Error("Failed to parse SECRET_KEY. Ensure it is a valid JSON array.");
}

// Create a connection to the Solana network
const connection: Connection = new Connection(quickNodeEndpoint);

/**
 * Creates a new token on the Solana blockchain.
 * @param authority - The keypair that has minting authority.
 * @param connection - The Solana blockchain connection.
 * @param numDecimals - Number of decimals for the token.
 * @returns A promise resolving to the mint's public key and transaction signature.
 */
async function createNewToken(
  authority: Keypair,
  connection: Connection,
  numDecimals: number
): Promise<{ initSignature: string; mint: PublicKey }> {
  try {
    const requiredBalance = await getMinimumBalanceForRentExemptMint(connection);
    const mintKeypair = Keypair.generate();

    // Instructions for creating the token
    const createAccountIx = SystemProgram.createAccount({
      fromPubkey: authority.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      lamports: requiredBalance,
      space: MINT_SIZE,
      programId: TOKEN_PROGRAM_ID,
    });

    const initializeMintIx = createInitializeMintInstruction(
      mintKeypair.publicKey,
      numDecimals,
      authority.publicKey,
      authority.publicKey
    );

    const transaction = new Transaction().add(createAccountIx, initializeMintIx);

    // Confirm the transaction
    const initSignature = await sendAndConfirmTransaction(connection, transaction, [
      authority,
      mintKeypair,
    ]);

    return { initSignature, mint: mintKeypair.publicKey };
  } catch (error) {
    console.error("Failed to create new token:", error);
    throw error;
  }
}

/**
 * Mints tokens to an associated token account.
 * @param mint - The public key of the mint (token).
 * @param authority - The keypair that has minting authority.
 * @param connection - The Solana blockchain connection.
 * @param numTokens - The number of tokens to mint.
 * @returns A promise resolving to the mint transaction signature.
 */
async function mintTokens(
  mint: PublicKey,
  authority: Keypair,
  connection: Connection,
  numTokens: number
): Promise<{ mintSignature: string }> {
  try {
    // Generate the associated token account address
    const tokenATA = getAssociatedTokenAddressSync(mint, authority.publicKey);

    // Instruction to create an associated token account (if it doesn't exist)
    const createTokenAccountIx = createAssociatedTokenAccountIdempotentInstruction(
      authority.publicKey,
      tokenATA,
      authority.publicKey,
      mint
    );

    // Instruction to mint tokens to the associated token account
    const mintTokensIx = createMintToInstruction(
      mint,
      tokenATA,
      authority.publicKey,
      numTokens
    );

    const transaction = new Transaction().add(createTokenAccountIx, mintTokensIx);
    const mintSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [authority],
      { skipPreflight: true }
    );

    return { mintSignature };
  } catch (error) {
    console.error("Failed to mint tokens:", error);
    throw error;
  }
}

/**
 * Transfers tokens from one account to another.
 *
 * @param mint - The token mint public key.
 * @param authority - The keypair with transfer authority.
 * @param destination - The recipient's wallet public key.
 * @param connection - The Solana blockchain connection.
 * @param numTokens - The amount of tokens to transfer.
 * @returns A promise resolving to the transaction signature.
 */
async function transferTokens(
  mint: PublicKey,
  authority: Keypair,
  destination: PublicKey,
  connection: Connection,
  numTokens: number
): Promise<{ transferSignature: string }> {
  try {
    // Ensure the recipient has an associated token account
    const destinationATA = await getOrCreateAssociatedTokenAccount(
      connection,
      authority,
      mint,
      destination,
      undefined,
      undefined,
      { skipPreflight: true }
    );

    // Ensure the sender's associated token account exists
    const sourceATA = await getOrCreateAssociatedTokenAccount(
      connection,
      authority,
      mint,
      authority.publicKey,
      undefined,
      undefined,
      { skipPreflight: true }
    );

    // Execute token transfer
    const transferSignature = await transfer(
      connection,
      authority,
      sourceATA.address,
      destinationATA.address,
      authority,
      numTokens
    );

    return { transferSignature };
  } catch (error) {
    console.error("Failed to transfer tokens:", error);
    throw error;
  }
}

/**
 * Burns a specified amount of tokens from the token authority's associated account.
 *
 * @param mint - The token mint public key.
 * @param authority - The keypair with burning authority.
 * @param connection - The Solana blockchain connection.
 * @param numTokens - The amount of tokens to burn.
 * @param decimals - Number of decimals for the token.
 * @returns A promise resolving to the burn transaction signature.
 */
async function burnTokens(
  mint: PublicKey,
  authority: Keypair,
  connection: Connection,
  numTokens: number,
  decimals: number
): Promise<{ burnSignature: string }> {
  try {
    // Ensure the token authority has an associated token account
    const tokenATA = await getOrCreateAssociatedTokenAccount(
      connection,
      authority,
      mint,
      authority.publicKey,
      undefined,
      undefined,
      { skipPreflight: true }
    );

    // Execute token burn
    const burnSignature = await burnChecked(
      connection,
      authority,
      tokenATA.address,
      mint,
      authority.publicKey,
      numTokens,
      decimals,
      undefined,
      { skipPreflight: true }
    );

    return { burnSignature };
  } catch (error) {
    console.error("Failed to burn tokens:", error);
    throw error;
  }
}

// Main execution function
async function main(): Promise<void> {
  try {
    let mint: PublicKey;

    // Use an existing token if provided in the .env file
    const existingMint = getEnvVariable("MINT_ADDRESS");
    if (existingMint) {
      mint = new PublicKey(existingMint);
      console.log(`Using existing token: ${mint.toBase58()}`);
    } else {
      // Create a new token only if no existing one is provided
      const { initSignature, mint: newMint } = await createNewToken(tokenAuthority, connection, 0);
      console.log(`Token Created: https://explorer.solana.com/tx/${initSignature}?cluster=devnet`);
      console.log(`Mint ID: ${newMint.toBase58()}`);
      mint = newMint;
    }

    // Step 2: Mint tokens
    const { mintSignature } = await mintTokens(mint, tokenAuthority, connection, 100);
    console.log(`Mint Tokens Tx: https://explorer.solana.com/tx/${mintSignature}?cluster=devnet`);

    // Step 3: Transfer tokens to another account
    const receiver = Keypair.generate();
    const { transferSignature } = await transferTokens(mint, tokenAuthority, receiver.publicKey, connection, 1);
    console.log(`Transfer Tokens Tx: https://explorer.solana.com/tx/${transferSignature}?cluster=devnet`);

    // Step 4: Burn tokens
    const { burnSignature } = await burnTokens(mint, tokenAuthority, connection, 10, 0);
    console.log(`Burn Tokens Tx: https://explorer.solana.com/tx/${burnSignature}?cluster=devnet`);

  } catch (error) {
    console.error("Error in main execution:", error);
  } finally {
    process.exit();
  }
}

main();
