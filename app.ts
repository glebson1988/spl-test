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
} from "@solana/spl-token";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Function to fetch and validate environment variables
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

// Function to create a new token
async function createNewToken(
  authority: Keypair,
  connection: Connection,
  numDecimals: number
): Promise<{ initSignature: string; mint: PublicKey }> {
  try {
    const requiredBalance = await getMinimumBalanceForRentExemptMint(connection);
    const mintKeypair = Keypair.generate();

    // Instructions to create a token
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

// Placeholder for minting tokens
async function mintTokens(
  mint: PublicKey,
  authority: Keypair,
  connection: Connection,
  numTokens: number
): Promise<void> {
  // TODO: Implement token minting logic
}

// Placeholder for transferring tokens
async function transferTokens(
  mint: PublicKey,
  authority: Keypair,
  destination: PublicKey,
  connection: Connection,
  numTokens: number
): Promise<void> {
  // TODO: Implement token transfer logic
}

// Placeholder for burning tokens
async function burnTokens(
  mint: PublicKey,
  authority: Keypair,
  connection: Connection,
  numberTokens: number,
  decimals: number
): Promise<void> {
  // TODO: Implement token burning logic
}

// Main function
async function main(): Promise<void> {
  try {
    const { initSignature, mint } = await createNewToken(tokenAuthority, connection, 0);
    console.log(`Init Token Tx: https://explorer.solana.com/tx/${initSignature}?cluster=devnet`);
    console.log(`Mint ID: ${mint.toBase58()}`);
  } catch (error) {
    console.error("Error in main execution:", error);
  } finally {
    process.exit();
  }
}

main();
