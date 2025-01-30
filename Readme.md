# Solana Token Creator

This project provides a simple TypeScript script to **create a new SPL token**, **mint tokens**, **transfer tokens**, and **burn tokens** on the **Solana blockchain**. It uses `@solana/web3.js` and `@solana/spl-token` to interact with the Solana network.

## 🚀 Features
- ✅ Create a new SPL token
- ✅ Mint tokens to an associated token account
- ✅ Transfer tokens between accounts
- ✅ Burn tokens from an account
- ✅ Fully automated transaction processing
- ✅ Works with **Solana Devnet**

---

## 📦 Installation

Make sure you have **Node.js** and **TypeScript** installed.

1. Clone the repository:
   ```sh
   git clone https://github.com/glebson1988/solana-token-creator.git
   cd solana-token-creator
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file and add:
   ```ini
   SECRET_KEY=[YOUR_SECRET_KEY]
   QUICKNODE_ENDPOINT="https://your-quicknode-url"
   MINT_ADDRESS="YourExistingMintPublicKey" # (Optional) Use an existing token mint
   ```

   - **SECRET_KEY**: A valid Solana keypair in JSON format.
   - **QUICKNODE_ENDPOINT**: Your Solana RPC URL.
   - **MINT_ADDRESS** *(optional)*: The mint address of an existing token to use instead of creating a new one.

---

## 🏃‍♂️ Running the Script

To create, mint, transfer, and burn tokens, run:

```sh
ts-node app.ts
```

After execution, you will see transaction links like:

```sh
Token Created: https://explorer.solana.com/tx/your_tx_hash?cluster=devnet
Mint Tokens Tx: https://explorer.solana.com/tx/your_tx_hash?cluster=devnet
Transfer Tokens Tx: https://explorer.solana.com/tx/your_tx_hash?cluster=devnet
Burn Tokens Tx: https://explorer.solana.com/tx/your_tx_hash?cluster=devnet
```

Check them in the [Solana Explorer](https://explorer.solana.com/?cluster=devnet) to verify your transactions.

---

## 🤝 Contributing
Feel free to fork the project and submit **pull requests**! 🚀

---

**Happy coding! 🚀**
