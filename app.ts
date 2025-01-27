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
