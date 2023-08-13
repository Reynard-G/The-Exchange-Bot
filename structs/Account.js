const client = require("../index.js");
const { AlreadyRegisteredError } = require("./Errors.js");

class Account {
  async register(discordID, username) {
    const isRegistered = await this.isRegistered(discordID);
    if (isRegistered) throw new AlreadyRegisteredError(discordID);

    await client.query("INSERT INTO accounts (discord_id, ign) VALUES (?, ?)",
      [discordID, username]);
  }

  async databaseID(discordID) {
    const id = (await client.query("SELECT id FROM accounts WHERE discord_id = ?",
      [discordID]));
    return id.length > 0 ? id[0].id : null;
  }

  async discordID(databaseID) {
    const id = (await client.query("SELECT discord_id FROM accounts WHERE id = ?",
      [databaseID]));
    return id.length > 0 ? id[0].discord_id : null;
  }

  async username(discordID) {
    const username = (await client.query("SELECT ign FROM accounts WHERE discord_id = ?",
      [discordID]));
    return username.length > 0 ? username[0].ign : null;
  }

  async balance(discordID) {
    const accountID = await this.databaseID(discordID);
    const result = await client.query(`
      SELECT 
          t.account_id,
          SUM(CASE 
                  WHEN t.amount_transaction_type = 'CR' THEN t.amount 
                  WHEN t.amount_transaction_type = 'DR' THEN -t.amount 
                  ELSE 0 
              END) - SUM(t.fee) - COALESCE(o.total_buy_amount, 0) AS balance
      FROM transactions t
      LEFT JOIN (
          SELECT 
              account_id,
              SUM(amount) AS total_buy_amount
          FROM orders
          WHERE order_transaction_type = 'BUY'
          AND active = 1
          GROUP BY account_id
      ) o ON t.account_id = o.account_id
      WHERE t.account_id = ?
      GROUP BY t.account_id;
    `,
      [accountID]);

    const balance = result[0] ? result[0].balance : 0;
    return balance;
  }

  async transactions(discord_id) {
    const account_id = await this.databaseID(discord_id);
    const transactions = (await client.query("SELECT *, UNIX_TIMESTAMP(created_at) AS created_at_unix FROM transactions WHERE account_id = ? ORDER BY created_at DESC",
      [account_id]));
    return transactions.length > 0 ? transactions : null;
  }

  async orders(discord_id) {
    const account_id = await this.databaseID(discord_id);
    const orders = (await client.query("SELECT *, UNIX_TIMESTAMP(created_at) AS created_at_unix FROM orders WHERE account_id = ? AND active = 1 ORDER BY created_at DESC",
      [account_id]));
    return orders.length > 0 ? orders : null;
  }

  async order(orderID) {
    const order = (await client.query("SELECT * FROM orders WHERE id = ?",
      [orderID]));
    return order.length > 0 ? order[0] : null;
  }

  async cancelOrder(orderID) {
    await client.query("UPDATE orders SET active = 0 WHERE id = ?",
      [orderID]);

    client.emitter.emit("orderCancelled", orderID);
  }

  async portfolio(discord_id) {
    const account_id = await this.databaseID(discord_id);
    const portfolio = (await client.query(`
      SELECT 
          t.account_id, t.ticker, 
          SUM(CASE 
                  WHEN t.ticker_transaction_type = 'CR' THEN t.ticker_amount 
                  WHEN t.ticker_transaction_type = 'DR' THEN -t.ticker_amount 
                  ELSE 0 
              END)
          - COALESCE((
              SELECT SUM(o.remaining_amount) 
              FROM orders o 
              WHERE o.active = 1 AND 
                    o.account_id = t.account_id AND 
                    o.ticker = t.ticker AND 
                    o.order_transaction_type = 'SELL'
              ), 0) as total_shares
      FROM 
          transactions t
      WHERE 
          t.account_id = ?
          AND t.ticker IS NOT NULL
      GROUP BY 
          t.account_id, t.ticker;
    `, [account_id]));

    return portfolio.length > 0 ? portfolio : [];
  }

  /**
   * ADMIN COMMANDS
   */

  async freeze(discordID) {
    await client.query("UPDATE accounts SET frozen = 1 WHERE discord_id = ?",
      [discordID]);

    client.emitter.emit("accountFrozen", discordID);
  }

  async unfreeze(discordID) {
    await client.query("UPDATE accounts SET frozen = 0 WHERE discord_id = ?",
      [discordID]);

    client.emitter.emit("accountUnfrozen", discordID);
  }

  /**
   * ALLOW NOTES FOR THE BELOW METHODS
   * 
   * WILL BE USED FOR WITHDRAWALS AND DEPOSITS
   */

  async addShares(discordID, ticker, amount, note) {
    const accountID = await this.databaseID(discordID);

    if (!note) note = `Admin added ${amount} shares of ${ticker} to ${accountID}`;

    await client.query("INSERT INTO transactions (account_id, ticker, ticker_amount, ticker_transaction_type, note) VALUES (?, ?, ?, ?, ?)",
      [accountID, ticker, amount, "CR", note]);

    client.emitter.emit("sharesAdded", discordID, ticker, amount, note);
  }

  async removeShares(discordID, ticker, amount, note) {
    const accountID = await this.databaseID(discordID);

    if (!note) note = `Admin removed ${amount} shares of ${ticker} from ${accountID}`;

    await client.query("INSERT INTO transactions (account_id, ticker, ticker_amount, ticker_transaction_type, note) VALUES (?, ?, ?, ?, ?)",
      [accountID, ticker, amount, "DR", note]);

    client.emitter.emit("sharesRemoved", discordID, ticker, amount, note);
  }

  async addBalance(discordID, amount, note) {
    const accountID = await this.databaseID(discordID);

    if (!note) note = `Admin added ${this.formatCurrency(amount)} to ${accountID}`;

    await client.query("INSERT INTO transactions (account_id, amount, amount_transaction_type, note) VALUES (?, ?, ?, ?)",
      [accountID, amount, "CR", note]);

    client.emitter.emit("balanceAdded", discordID, amount, note);
  }

  async removeBalance(discordID, amount, note) {
    const accountID = await this.databaseID(discordID);

    if (!note) note = `Admin removed ${this.formatCurrency(amount)} from ${accountID}`;

    await client.query("INSERT INTO transactions (account_id, amount, amount_transaction_type, note) VALUES (?, ?, ?, ?)",
      [accountID, amount, "DR", note]);

    client.emitter.emit("balanceRemoved", discordID, amount, note);
  }

  /**
   * UTILITY METHODS
   */

  async isRegistered(discordID) {
    const registered = (await client.query("SELECT IF(id IS NULL, false, true) AS registered FROM accounts WHERE discord_id = ?",
      [discordID]));

    return registered.length > 0 ? true : false;
  }

  async isFrozen(discordID) {
    const frozen = (await client.query("SELECT IF(frozen = 1, true, false) AS frozen FROM accounts WHERE discord_id = ?",
      [discordID]))[0].frozen;
    return frozen;
  }

  formatCurrency(amount) {
    // format to 4 decimal places
    return Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 4 }).format(amount);
  }
}

module.exports = Account;