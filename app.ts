import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import {
    getOrCreateAssociatedTokenAccount,
    getMinimumBalanceForRentExemptMint,
    getAssociatedTokenAddressSync,
    MINT_SIZE, TOKEN_PROGRAM_ID,
    createInitializeMintInstruction,
    createMintToInstruction,
    createAssociatedTokenAccountIdempotentInstruction,
    transfer,
    burnChecked
} from "@solana/spl-token";
import * as dotenv from "dotenv";

dotenv.config();

const secret = JSON.parse(process.env.SECRET_KEY || "[]");
const tokenAuthority = Keypair.fromSecretKey(new Uint8Array(secret));
const receiver = Keypair.generate();
const quickNodeEndpoint = JSON.parse(process.env.QUICKNODE_ENDPOINT || "");
const connection = new Connection(quickNodeEndpoint);

async function createNewToken(authority: Keypair, connection: Connection, numDecimals: number) {
  const requiredBalance = await getMinimumBalanceForRentExemptMint(connection);
  const mintKeypair = Keypair.generate();

  const ix1 = SystemProgram.createAccount({
    fromPubkey: authority.publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    lamports: requiredBalance,
    space: MINT_SIZE,
    programId: TOKEN_PROGRAM_ID
  });

  const ix2 = createInitializeMintInstruction(
    mintKeypair.publicKey,
    numDecimals,
    authority.publicKey,
    authority.publicKey
  );

  const createNewTokenTransaction = new Transaction().add(ix1, ix2);
  const initSignature = await sendAndConfirmTransaction(connection, createNewTokenTransaction, [tokenAuthority, mintKeypair]);
  return { initSignature, mint: mintKeypair.publicKey };
}

async function mintTokens(mint: PublicKey, authority: Keypair, connection: Connection, numTokens: number) {

}

async function transferTokens(mint: PublicKey, authority: Keypair, destination: PublicKey, connection: Connection, numTokens: number) {

}

async function burnTokens(mint: PublicKey, authority: Keypair, connection: Connection, numberTokens: number, decimals: number) {

}
