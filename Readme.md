# Solana Token Creator

This project provides a simple TypeScript script to **create a new SPL token** on the **Solana blockchain** and **mint tokens** to an associated token account. It uses `@solana/web3.js` and `@solana/spl-token` to interact with the Solana network.

## 🚀 Features
- ✅ Create a new SPL token
- ✅ Mint tokens to an associated token account
- ✅ Fully automated transaction processing
- ✅ Works with **Solana Devnet**

---

## 📦 Installation

Make sure you have **Node.js** and **TypeScript** installed.

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/solana-token-creator.git
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
   ```

   - **SECRET_KEY**: A valid Solana keypair in JSON format.
   - **QUICKNODE_ENDPOINT**: Your Solana RPC URL.

---

## 🏃‍♂️ Running the Script

To create and mint tokens, run:

```sh
npm start
```

After execution, you will see transaction links like:

```sh
Token Created: https://explorer.solana.com/tx/your_tx_hash?cluster=devnet
Mint Tokens Tx: https://explorer.solana.com/tx/your_tx_hash?cluster=devnet
```

Check them in the [Solana Explorer](https://explorer.solana.com/?cluster=devnet) to verify your transactions.

---

## 📜 Future Enhancements
- 🔜 Implement **token transfers**
- 🔜 Implement **burning tokens**
- 🔜 Support multiple minting authorities

---

## 🤝 Contributing
Feel free to fork the project and submit **pull requests**! 🚀

---

## 📜 License
MIT License. See [LICENSE](LICENSE) for details.

---

**Happy coding! 🚀**
