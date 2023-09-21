const db = require("../mysql.js");
const { AlreadyRegisteredError, ConflictingError } = require("./Errors.js");

module.exports = class Account {
  constructor(client) {
    this.client = client;
  }

  /**
   * Register a new account to a specific user
   * 
   * @param {Number} discordID - The Discord ID of the user
   * @param {String} username - The Minecraft Username of the user
   */
  async register(discordID, username) {
    const isRegistered = await this.isRegistered(discordID);
    if (isRegistered) throw new AlreadyRegisteredError(discordID);

    await db.query("INSERT INTO accounts (discord_id, ign) VALUES (?, ?)",
      [discordID, username]);
  }

  /**
   * Get the database ID of a user
   * 
   * @param {Number} discordID - The Discord ID of the user
   * @returns {Number} - The database ID of the user
   */
  async databaseID(discordID) {
    const id = (await db.query("SELECT id FROM accounts WHERE discord_id = ?",
      [discordID]));

    return id.length > 0 ? id[0].id : null;
  }

  /**
   * Get the Discord ID of a user
   * 
   * @param {Number} databaseID - The database ID of the user
   * @returns {Number} - The Discord ID of the user
   */
  async discordID(databaseID) {
    const id = (await db.query("SELECT discord_id FROM accounts WHERE id = ?",
      [databaseID]));

    return id.length > 0 ? id[0].discord_id : null;
  }

  /**
   * Get the Minecraft Username of a user
   * 
   * @param {Number} discordID - The Discord ID of the user
   * @returns {String} - The Minecraft Username of the user
   */
  async username(discordID) {
    const username = (await db.query("SELECT ign FROM accounts WHERE discord_id = ?",
      [discordID]));

    return username.length > 0 ? username[0].ign : null;
  }

  /**
   * Get the balance of a user
   * 
   * @param {Number} discordID - The Discord ID of the user
   * @returns {Number} - The balance of the user
   */
  async balance(discordID) {
    const accountID = await this.databaseID(discordID);
    const result = await db.query(`
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
              SUM(remaining_amount * price_per_share) AS total_buy_amount
          FROM orders
          WHERE order_transaction_type = 'BUY'
          AND active = 1
          GROUP BY account_id
      ) o ON t.account_id = o.account_id
      WHERE t.account_id = ?
      GROUP BY t.account_id;
    `,
      [accountID]);

    return result[0] ? result[0].balance : 0;
  }

  /**
   * Get the transactions history of a user
   * 
   * @param {Number} discord_id - The Discord ID of the user
   * @returns {Array<Object>} - The transactions history of the user
   */
  async transactions(discord_id) {
    const account_id = await this.databaseID(discord_id);
    const transactions = (await db.query("SELECT *, UNIX_TIMESTAMP(created_at) AS created_at_unix FROM transactions WHERE account_id = ? ORDER BY created_at DESC",
      [account_id]));

    return transactions.length > 0 ? transactions : null;
  }

  /**
   * Get the current active orders of a user
   * 
   * @param {Number} discord_id - The Discord ID of the user
   * @returns {Array<Object>} - The current active orders of the user
   */
  async orders(discord_id) {
    const account_id = await this.databaseID(discord_id);
    const orders = (await db.query("SELECT *, UNIX_TIMESTAMP(created_at) AS created_at_unix FROM orders WHERE account_id = ? AND active = 1 ORDER BY created_at DESC",
      [account_id]));

    return orders.length > 0 ? orders : null;
  }

  /**
   * Get a specific order of a user
   * 
   * @param {Number} orderID - The ID of the order
   * @returns {Object<Array>} - The order of a user
   */
  async order(orderID) {
    const order = (await db.query("SELECT * FROM orders WHERE id = ?",
      [orderID]));

    return order.length > 0 ? order[0] : null;
  }

  /**
   * Get the portfolio of a user
   * 
   * @param {Number} discord_id - The Discord ID of the user
   * @returns {Array<Object>} - The portfolio of the user
   */
  async portfolio(discord_id) {
    const account_id = await this.databaseID(discord_id);
    const portfolio = (await db.query(`
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
          t.account_id, t.ticker
      HAVING
          total_shares > 0;
    `, [account_id]));

    return portfolio.length > 0 ? portfolio : [];
  }

  /**
   * Freeze a user's account
   * 
   * @param {Number} discordID - The Discord ID of the user 
   */
  async freeze(discordID) {
    await db.query("UPDATE accounts SET frozen = 1 WHERE discord_id = ?",
      [discordID]);

    this.client.emitter.emit("accountFrozen", discordID);
  }

  /**
   * Unfreeze a user's account
   * 
   * @param {Number} discordID - The Discord ID of the user 
   */
  async unfreeze(discordID) {
    await db.query("UPDATE accounts SET frozen = 0 WHERE discord_id = ?",
      [discordID]);

    this.client.emitter.emit("accountUnfrozen", discordID);
  }

  /**
   * Add shares to a user's account
   * 
   * @param {Number} discordID - The Discord ID of the user
   * @param {String} ticker - The ticker of the stock
   * @param {Number} amount - The amount of shares to add
   * @param {String} note - The note to add to the transaction
   */
  async addShares(discordID, ticker, amount, note) {
    const accountID = await this.databaseID(discordID);

    // Check if existing shares & shares to add are greater than total outstanding shares
    const totalOutstandingShares = (await this.client.stocks.ticker(ticker)).total_outstanding_shares;
    const existingShares = (await this.client.stocks.shareholders(ticker)).map((shareholder) => shareholder.shares).reduce((a, b) => Number(a) + Number(b), 0);
    if (existingShares + amount > totalOutstandingShares) throw new ConflictingError("Failed to add more shares than amount supplied.");

    if (!note) note = `Admin added ${amount} shares of ${ticker} to ${accountID}`;

    await db.query("INSERT INTO transactions (account_id, ticker, ticker_amount, ticker_transaction_type, note) VALUES (?, ?, ?, ?, ?)",
      [accountID, ticker, amount, "CR", note]);

    this.client.emitter.emit("sharesAdded", discordID, ticker, amount, note);
  }

  /**
   * Remove shares from a user's account
   * 
   * @param {Number} discordID - The Discord ID of the user
   * @param {String} ticker - The ticker of the stock
   * @param {Number} amount - The amount of shares to remove
   * @param {String} note - The note to add to the transaction
   */
  async removeShares(discordID, ticker, amount, note) {
    const accountID = await this.databaseID(discordID);

    if (!note) note = `Admin removed ${amount} shares of ${ticker} from ${accountID}`;

    await db.query("INSERT INTO transactions (account_id, ticker, ticker_amount, ticker_transaction_type, note) VALUES (?, ?, ?, ?, ?)",
      [accountID, ticker, amount, "DR", note]);

    this.client.emitter.emit("sharesRemoved", discordID, ticker, amount, note);
  }

  /**
   * Add balance to a user's account
   * 
   * @param {Number} discordID - The Discord ID of the user
   * @param {Number} amount - The amount of balance to add
   * @param {String} note - The note to add to the transaction
   */
  async addBalance(discordID, amount, note) {
    const accountID = await this.databaseID(discordID);

    if (!note) note = `Admin added ${this.client.utils.formatCurrency(amount)} to ${accountID}`;

    await db.query("INSERT INTO transactions (account_id, amount, amount_transaction_type, note) VALUES (?, ?, ?, ?)",
      [accountID, amount, "CR", note]);

    this.client.emitter.emit("balanceAdded", discordID, amount, note);
  }

  /**
   * Remove balance from a user's account
   * 
   * @param {Number} discordID - The Discord ID of the user
   * @param {Number} amount - The amount of balance to remove
   * @param {String} note - The note to add to the transaction
   */
  async removeBalance(discordID, amount, note) {
    const accountID = await this.databaseID(discordID);

    if (!note) note = `Admin removed ${this.client.utils.formatCurrency(amount)} from ${accountID}`;

    await db.query("INSERT INTO transactions (account_id, amount, amount_transaction_type, note) VALUES (?, ?, ?, ?)",
      [accountID, amount, "DR", note]);

    this.client.emitter.emit("balanceRemoved", discordID, amount, note);
  }

  /**
   * Check if a user is registered
   * 
   * @param {Number} discordID - The Discord ID of the user
   * @returns {Boolean} - Whether or not the user is registered
   */
  async isRegistered(discordID) {
    const registered = (await db.query("SELECT IF(id IS NULL, false, true) AS registered FROM accounts WHERE discord_id = ?",
      [discordID]));

    return registered.length > 0 ? true : false;
  }

  /**
   * Check if a user is frozen
   * 
   * @param {Number} discordID - The Discord ID of the user 
   * @returns {Boolean} - Whether or not the user is frozen
   */
  async isFrozen(discordID) {
    const frozen = (await db.query("SELECT IF(frozen = 1, true, false) AS frozen FROM accounts WHERE discord_id = ?",
      [discordID]))[0].frozen;

    return frozen;
  }

  /**
   * Returns all user accounts
   * 
   * @returns {Array<Object>} - All user accounts
   */
  async accounts() {
    const accounts = (await db.query("SELECT *, UNIX_TIMESTAMP(created_at) AS created_at_unix FROM accounts"));

    return accounts;
  }

  /**
   * Returns the role's name of a user
   * 
   * @param {Number} discordID - The Discord ID of the user
   * @returns {String} - The role's name of the user
   */
  async role(discordID) {
    const accountID = await this.databaseID(discordID);
    const result = (await db.query("SELECT a.role, r.name FROM accounts a JOIN roles r ON a.role = r.id WHERE a.id = ?",
      [accountID]))[0];

    return result;
  }

  /**
   * Check if a user has the Exchange+ role
   * 
   * @param {Number} discordID - The Discord ID of the user
   * @returns {Boolean} - Whether or not the user has the Exchange+ role
   */
  async hasExchangePlus(discordID) {
    const role = (await this.role(discordID)).name;

    return role === "Exchange+" || role === "Admin";
  }
};