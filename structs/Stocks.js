const db = require("../mysql.js");
const Decimal = require("decimal.js-light");
const { DateTime } = require("luxon");
const {
  InvalidStockTickerError,
  FrozenStockError,
  FrozenUserError,
  InsufficientFundsError,
  InvalidSharesAmountError,
  ImageTooLargeError,
  ConflictingError
} = require("./Errors.js");

module.exports = class Stocks {
  constructor(client) {
    this.client = client;
  }

  /**
   * Buy a specified amount of shares of a ticker
   * 
   * @param {String} discord_id 
   * @param {String} ticker 
   * @param {Number} amount 
   * @param {String} order_type 
   * @param {Object} order_type_details 
   */
  async buy(discord_id, ticker, amount, order_type, order_type_details) {
    const stock = await this.ticker(ticker);
    if (stock.frozen == 1) {
      throw new FrozenStockError(ticker);
    }

    // Check if account is frozen
    const isFrozen = await this.client.account.isFrozen(discord_id);
    if (isFrozen) {
      throw new FrozenUserError(discord_id);
    }

    // Check if account can afford the order
    const price_per_share = stock.price;
    const total_price = new Decimal(price_per_share).mul(amount);
    const fee = new Decimal(total_price).mul(process.env.ORDER_FEE_PERCENTAGE).toNumber();
    const balance = await this.client.account.balance(discord_id);
    if (balance < total_price.add(fee).toNumber()) {
      throw new InsufficientFundsError(discord_id, total_price, balance);
    }

    this.client.emitter.emit("buy", discord_id, ticker, amount, price_per_share, order_type, order_type_details);

    await this.processOrder(discord_id, ticker, amount, stock.price, order_type, order_type_details);
  }

  /**
   * Sell a specified amount of shares of a ticker
   * 
   * @param {String} discord_id 
   * @param {String} ticker 
   * @param {Number} amount 
   * @param {String} order_type 
   * @param {Object} order_type_details 
   */
  async sell(discord_id, ticker, amount, order_type, order_type_details) {
    const stock = await this.ticker(ticker);
    if (stock.frozen == 1) {
      throw new FrozenStockError(ticker);
    }

    // Check if account is frozen
    const isFrozen = await this.client.account.isFrozen(discord_id);
    if (isFrozen) {
      throw new FrozenUserError(discord_id);
    }

    // Check if account has enough shares to sell
    const price_per_share = stock.price;
    const shares = await this.client.account.portfolio(discord_id);
    const ticker_shares = shares.find(share => share.ticker === ticker);
    if (!ticker_shares || parseInt(ticker_shares.total_shares) < amount) {
      throw new InsufficientFundsError(discord_id, amount, shares[ticker] || 0);
    }

    this.client.emitter.emit("sell", discord_id, ticker, amount, price_per_share, order_type, order_type_details);

    await this.processOrder(discord_id, ticker, amount, stock.price, order_type, order_type_details);
  }

  /**
   * Process an order and match it with other orders
   * 
   * @param {String} discord_id 
   * @param {String} ticker 
   * @param {Number} amount 
   * @param {Number} price_per_share 
   * @param {String} order_type 
   * @param {Object} order_type_details 
   */
  async processOrder(discord_id, ticker, amount, price_per_share, order_type, order_type_details) {
    const original_account_id = await this.client.account.databaseID(discord_id);
    let leftoverAmount = new Decimal(amount);

    let queryParams;
    if (order_type_details.limit_price) {
      queryParams = [ticker, order_type_details.order_transaction_type === "BUY" ? "SELL" : "BUY", order_type_details.limit_price, price_per_share, price_per_share, original_account_id];
    } else {
      queryParams = [ticker, order_type_details.order_transaction_type === "BUY" ? "SELL" : "BUY", price_per_share, price_per_share, original_account_id];
    }

    // Get all orders that match the order type and ticker
    const orders = await db.query(`
      SELECT *
      FROM orders
      WHERE ticker = ?
        AND order_transaction_type = ?
        AND active = 1
        AND remaining_amount > 0
        ${order_type_details.limit_price ? `AND price_per_share ${order_type_details.order_transaction_type === "BUY" ? "<=" : ">="} ?` : ''}
        AND IF(order_type = "LIMIT",
              IF(order_transaction_type = "BUY",
                limit_price >= ?,
                limit_price <= ?),
              1
            )
        AND account_id != ?
      ORDER BY price_per_share ${order_type_details.order_transaction_type === "BUY" ? "ASC" : "DESC"} , created_at ASC`,
      queryParams
    );

    for (const order of orders) {
      const { id, account_id, remaining_amount, price_per_share, ipo } = order;
      const current_order_amount = new Decimal(remaining_amount).gte(leftoverAmount) ? new Decimal(leftoverAmount) : new Decimal(remaining_amount);
      const total_price = new Decimal(price_per_share).mul(current_order_amount).toNumber();
      const order_fee = new Decimal(total_price).mul(process.env.ORDER_FEE_PERCENTAGE).toNumber();
      const updated_remaining_amount = new Decimal(remaining_amount).minus(current_order_amount);

      // Update the order fulfilled & remaining amounts
      await db.query(`
        UPDATE orders
        SET fulfilled_amount = fulfilled_amount + ?,
            remaining_amount = remaining_amount - ?
        WHERE id = ?`,
        [current_order_amount.toNumber(), current_order_amount.toNumber(), id]
      );

      // Update the account balance
      const transactionQuery = `
        INSERT INTO transactions (account_id, counterparty_account_id, order_id, amount, fee, ticker, ticker_amount, amount_transaction_type, ticker_transaction_type, note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      // If the order is a buy, include the fee in the transaction
      if (order_type_details.order_transaction_type === "BUY") {
        await db.query(transactionQuery,
          [original_account_id, account_id, id, total_price, order_fee, ticker, current_order_amount.toNumber(), "DR", "CR", `Bought ${current_order_amount} shares of ${ticker} at $${price_per_share} per share`]
        );
        await db.query(transactionQuery,
          [account_id, original_account_id, id, total_price, 0, ticker, current_order_amount.toNumber(), "CR", "DR", `Sold ${current_order_amount} shares of ${ticker} at $${price_per_share} per share`]
        );

        // Check if the matching order is an IPO order
        if (ipo === 1) {
          await db.query(`
            UPDATE tickers
            SET available_shares = available_shares - ?
            WHERE ticker = ?`,
            [current_order_amount.toNumber(), ticker]
          );
        }
      } else {
        await db.query(transactionQuery,
          [original_account_id, account_id, id, total_price, 0, ticker, current_order_amount.toNumber(), "CR", "DR", `Sold ${current_order_amount} shares of ${ticker} at $${price_per_share} per share`]
        );
        await db.query(transactionQuery,
          [account_id, original_account_id, id, total_price, order_fee, ticker, current_order_amount.toNumber(), "DR", "CR", `Bought ${current_order_amount} shares of ${ticker} at $${price_per_share} per share`]
        );
      }

      // Update fulfilled order to inactive if remaining amount is 0
      if (updated_remaining_amount.eq(0)) {
        await db.query(`
          UPDATE orders
          SET active = 0
          WHERE id = ?`,
          [id]
        );
      }

      // Update leftover amount
      leftoverAmount = new Decimal(leftoverAmount).minus(current_order_amount);

      // Break out of the loop if there is no leftover amount
      if (leftoverAmount.eq(0)) {
        break;
      }

      const recipientOrderType = order_type_details.order_transaction_type === "BUY" ? "SELL" : "BUY";
      const initiatorOrderType = order_type_details.order_transaction_type;

      this.client.emitter.emit("orderMatched", account_id, original_account_id, current_order_amount.toNumber(), updated_remaining_amount.toNumber(), leftoverAmount.toNumber(), recipientOrderType, initiatorOrderType, price_per_share, ticker);
    }

    // Create a new order if there is any leftover amount, else create a empty order
    await db.query(`
      INSERT INTO orders (account_id, ticker, amount, price_per_share, fulfilled_amount, remaining_amount, order_transaction_type, order_type, limit_price, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [original_account_id, ticker, new Decimal(price_per_share).mul(amount).toNumber(), price_per_share, new Decimal(amount).minus(leftoverAmount).toNumber(), leftoverAmount.toNumber(), order_type_details.order_transaction_type, order_type, order_type_details.limit_price, leftoverAmount.gt(0) ? 1 : 0]
    );

    // Update the stock price
    const newStockPrice = await this.updatedPrice(amount, ticker, order_type_details.order_transaction_type);
    await db.query(`
      UPDATE tickers
      SET price = ?
      WHERE ticker = ?`,
      [newStockPrice, ticker]
    );

    this.client.logger.info(`Updated stock price from ${price_per_share} to ${newStockPrice} for ${ticker}`);
  }

  /**
   * Get all details of a specified ticker
   * 
   * @param {String} ticker - The ticker to get the details of
   * @returns {Object} The ticker details 
   */
  async ticker(ticker) {
    const stock = await db.query("SELECT * FROM tickers WHERE ticker = ?", [ticker]);

    if (stock.length === 0) {
      throw new InvalidStockTickerError(ticker);
    } else {
      return stock[0];
    }
  }

  /**
   * Get the price of a specified ticker
   * 
   * @param {String} ticker - The ticker to get the price of
   * @returns {Number} The price of the ticker
   */
  async price(ticker) {
    const price = (await db.query("SELECT price FROM tickers WHERE ticker = ?", [ticker]))[0].price;

    return price;
  }

  async bookValue(ticker) {
    const value = (await db.query("SELECT value FROM historical_ticker_value htv JOIN tickers t ON htv.ticker_id = t.id WHERE t.ticker = ? ORDER BY htv.date DESC LIMIT 1", [ticker]))[0]?.value;

    return value || 0;
  }

  /**
   * Get a list of all the tickers
   * 
   * @returns {Array<Object>} An array of all the tickers
   */
  async companies() {
    const companies = await db.query("SELECT ticker, company_name, frozen, delisted FROM tickers");

    return companies;
  }

  /**
   * Check if a ticker is frozen
   * 
   * @param {String} ticker - The ticker to check
   * @returns {Boolean} Whether the ticker is frozen or not
   */
  async isFrozen(ticker) {
    const frozen = (await db.query("SELECT frozen FROM tickers WHERE ticker = ?", [ticker]))[0].frozen;

    return frozen === 1;
  }

  /**
   * Check if a ticker is delisted
   * 
   * @param {String} ticker - The ticker to check
   * @returns {Boolean} Whether the ticker is delisted or not
   */
  async isDelisted(ticker) {
    const delisted = (await db.query("SELECT delisted FROM tickers WHERE ticker = ?", [ticker]))[0].delisted;

    return delisted === 1;
  }

  /**
   * Freeze a ticker
   * 
   * @param {String} ticker - The ticker to freeze
   */
  async freeze(ticker) {
    // Check if ticker is already frozen
    const stock = await this.ticker(ticker);
    if (stock.frozen === 1) {
      throw new ConflictingError("Stock is already frozen");
    }

    // Freeze the specified stock
    await db.query("UPDATE tickers SET frozen = 1 WHERE ticker = ?", [ticker]);

    this.client.emitter.emit("stockFrozen", ticker);
  }

  /**
   * Unfreeze a ticker
   * 
   * @param {String} ticker - The ticker to unfreeze
   */
  async unfreeze(ticker) {
    // Check if ticker is already unfrozen
    const stock = await this.ticker(ticker);
    if (stock.frozen === 0) {
      throw new ConflictingError("Stock is already unfrozen");
    }

    // Unfreeze the specified stock
    await db.query("UPDATE tickers SET frozen = 0 WHERE ticker = ?", [ticker]);

    this.client.emitter.emit("stockUnfrozen", ticker);
  }

  /**
   * Delist a ticker
   * 
   * @param {String} ticker - The ticker to delist
   */
  async delist(ticker) {
    // Check if ticker is already delisted
    const stock = await this.ticker(ticker);
    if (stock.delisted === 1) {
      throw new ConflictingError("Stock is already delisted");
    }

    // Delist the specified stock
    await db.query("UPDATE tickers SET delisted = 1 WHERE ticker = ?", [ticker]);

    this.client.emitter.emit("stockDelisted", ticker);
  }

  /**
   * Relist a ticker
   * 
   * @param {String} ticker - The ticker to relist
   */
  async relist(ticker) {
    // Check if ticker is already relisted
    const stock = await this.ticker(ticker);
    if (stock.delisted === 0) {
      throw new ConflictingError("Stock is already relisted");
    }

    // Relist the specified stock
    await db.query("UPDATE tickers SET delisted = 0 WHERE ticker = ?", [ticker]);

    this.client.emitter.emit("stockRelisted", ticker);
  }

  /**
   * Create a new ticker
   * 
   * @param {String} ticker - The ticker for the company
   * @param {String} company_name - The name of the company
   * @param {Number} available_shares - The amount of shares available for purchase
   * @param {Number} outstanding_shares - The amount of shares that are public
   * @param {Number} total_outstanding_shares - The total amount of shares
   * @param {Number} price - The price of the stock
   */
  async create(ticker, company_name, available_shares, outstanding_shares, total_outstanding_shares, price) {
    await db.query(`
      INSERT INTO tickers (ticker, company_name, available_shares, outstanding_shares, total_outstanding_shares, price)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [ticker, company_name, available_shares, outstanding_shares, total_outstanding_shares, price]);

    this.client.emitter.emit("stockCreated", ticker, company_name, available_shares, outstanding_shares, total_outstanding_shares, price);
  }

  /**
   * Set the image of a ticker
   * 
   * @param {String} ticker - The ticker to set the image of
   * @param {Buffer} imageBuffer - The image buffer to set
   */
  async setImage(ticker, imageBuffer) {
    // Check image size is less than 16MB
    if (imageBuffer.length > 16777215) {
      throw new ImageTooLargeError();
    }

    await db.query("UPDATE tickers SET image = ? WHERE ticker = ?", [imageBuffer, ticker]);

    this.client.emitter.emit("imageUpdated", ticker, imageBuffer);
  }

  /**
   * Set the amount of public shares available for purchase
   * 
   * @param {String} ticker - The ticker to set the available shares of
   * @param {Number} available_shares - The amount of shares available for purchase
   */
  async setAvailableShares(ticker, available_shares) {
    // Check if available shares is a more than outstanding shares
    const outstanding_shares = (await db.query("SELECT outstanding_shares FROM tickers WHERE ticker = ?", [ticker]))[0].outstanding_shares;
    if (available_shares > outstanding_shares) {
      throw new InvalidSharesAmountError(available_shares);
    }

    const totalShares = available_shares + this.shareholders(ticker).reduce((total, shareholder) => total + shareholder.total_shares, 0);
    if (available_shares > totalShares) {
      throw new ConflictingError("Available shares & distributed shares cannot be more than outstanding shares");
    }

    // Check if there is an active IPO order, if so, update the available shares
    const ipo_order = (await db.query("SELECT * FROM orders WHERE ticker = ? AND ipo = 1 AND active = 1", [ticker]))[0];
    if (ipo_order) await db.query("UPDATE orders SET remaining_amount = ? WHERE id = ?", [available_shares, ipo_order.id]);

    await db.query("UPDATE tickers SET available_shares = ? WHERE ticker = ?", [available_shares, ticker]);

    const ticker_details = await this.ticker(ticker);
    this.client.emitter.emit("availableSharesUpdated", ticker, ticker_details.available_shares, available_shares);
  }

  /**
   * Set the amount of public shares
   * 
   * @param {String} ticker - The ticker to set the outstanding shares of
   * @param {Number} outstanding_shares - The amount of shares that are public
   */
  async setOutstandingShares(ticker, outstanding_shares) {
    // Check if outstanding shares is a more than total outstanding shares
    const total_outstanding_shares = (await db.query("SELECT total_outstanding_shares FROM tickers WHERE ticker = ?", [ticker]))[0].total_outstanding_shares;
    if (outstanding_shares > total_outstanding_shares) {
      throw new InvalidSharesAmountError(outstanding_shares);
    }

    await db.query("UPDATE tickers SET outstanding_shares = ? WHERE ticker = ?", [outstanding_shares, ticker]);

    const ticker_details = await this.ticker(ticker);
    this.client.emitter.emit("outstandingSharesUpdated", ticker, ticker_details.outstanding_shares, outstanding_shares);
  }

  /**
   * Set the total amount of private & public shares
   * 
   * @param {String} ticker - The ticker to set the total outstanding shares of
   * @param {Number} total_outstanding_shares - The total amount of shares
   */
  async setTotalOutstandingShares(ticker, total_outstanding_shares) {
    // Check if total outstanding shares is a less than outstanding shares
    const outstanding_shares = (await db.query("SELECT outstanding_shares FROM tickers WHERE ticker = ?", [ticker]))[0].outstanding_shares;
    if (total_outstanding_shares < outstanding_shares) {
      throw new InvalidSharesAmountError(total_outstanding_shares);
    }

    await db.query("UPDATE tickers SET total_outstanding_shares = ? WHERE ticker = ?", [total_outstanding_shares, ticker]);

    const ticker_details = await this.ticker(ticker);
    this.client.emitter.emit("totalOutstandingSharesUpdated", ticker, ticker_details.total_outstanding_shares, total_outstanding_shares);
  }

  /**
   * Get the tick data for a ticker using a given date range
   * 
   * @param {String} ticker - The ticker to get the tick data of
   * @param {Number} start_date - The start unix date of the date range
   * @param {Number} end_date - The end unix date of the date range
   * @returns {Object} The tick data for the ticker using the given date range
   */
  async getTickData(ticker, start_date, end_date) {
    const stringStartDate = DateTime.fromSeconds(start_date).toFormat("yyyy-MM-dd HH:00:00");
    const stringEndDate = DateTime.fromSeconds(end_date).toFormat("yyyy-MM-dd HH:00:00");
    const data = await db.query(`
      SELECT
        t.ticker,
        UNIX_TIMESTAMP(htp.date) * 1000 AS time,
        htp.price
      FROM
        historical_ticker_prices htp
      JOIN
        tickers t ON htp.ticker_id = t.id
      WHERE
        t.ticker = ?
        AND UNIX_TIMESTAMP(htp.date) BETWEEN ? AND ?
      GROUP BY
        t.ticker,
        htp.date`,
      [ticker, start_date, end_date, stringStartDate, stringEndDate]
    );

    return data;
  }

  /**
   * Get the daily percentage change for a ticker
   * 
   * @param {String} ticker - The ticker to get the daily percentage change of
   * @returns {Number} The daily percentage change of the ticker
   */
  async dailyPercentageChange(ticker) {
    const midnight_date = DateTime.now().setZone("America/New_York").startOf("day").toSeconds();

    const prices = await db.query(`
      SELECT 
        (SELECT price FROM historical_ticker_prices WHERE ticker_id = t.id AND UNIX_TIMESTAMP(date) >= ? LIMIT 1) AS open,
        t.price AS current
      FROM tickers t
      JOIN historical_ticker_prices p ON t.id = p.ticker_id
      WHERE t.ticker = ?
      ORDER BY p.date DESC
      LIMIT 1`,
      [midnight_date, ticker]
    );

    // If there is no price data for the ticker, return 0
    if (prices.length === 0) {
      return 0;
    }

    const { open, current } = prices[0];
    const percentage_change = new Decimal(current).sub(open).div(open).mul(100).toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toNumber();

    return percentage_change;
  }

  /**
   * Set the price of a ticker
   * 
   * @param {String} ticker - The ticker to set the price of
   * @param {Number} price - The price to set the ticker to
   */
  async setPrice(ticker, price) {
    await db.query("UPDATE tickers SET price = ? WHERE ticker = ?", [price, ticker]);
  }

  /**
   * Set the valuation of a ticker
   * 
   * @param {String} ticker 
   * @param {Number} valuation 
   */
  async setValuation(ticker, valuation) {
    await db.query("INSERT INTO historical_ticker_value (ticker_id, value) VALUES ((SELECT id FROM tickers WHERE ticker = ?), ?)", [ticker, valuation]);
  }

  /**
   * Get the shareholders of a ticker
   * 
   * @param {String} ticker - The ticker to get the shareholders of
   * @param {String} exchange_discord_id - The discord id of the exchange bot
   * @returns {Array<Object>} An array of the shareholders of the ticker
   */
  async shareholders(ticker, exchange_discord_id) {
    // Get shareholder through transactions, differentiate between CR and DR
    const shareholders = await db.query(`
      SELECT
        SUM(CASE
          WHEN ticker_transaction_type = "CR" THEN t.ticker_amount
          WHEN ticker_transaction_type = "DR" THEN -t.ticker_amount
          ELSE 0
        END) AS shares,
        t.account_id,
        a.ign AS username
      FROM transactions t
      JOIN
        accounts a ON t.account_id = a.id
      WHERE ticker = ?
      AND active = 1
      GROUP BY username
      HAVING shares <> 0
      ORDER BY shares DESC`,
      [ticker, exchange_discord_id]
    );

    return shareholders;
  }

  /**
   * Calculate the updated price of a ticker
   * 
   * @param {Number} amount - The amount of shares bought/sold
   * @param {String} ticker - The ticker of the stock
   * @param {String} transaction_type - The type of transaction (BUY/SELL)
   * @returns {Number} The updated price of the ticker
   */
  async updatedPrice(amount, ticker, transaction_type) {
    const ticker_details = await this.ticker(ticker);
    const { price, total_outstanding_shares } = ticker_details;

    const k_value = 1.5;
    const shares_percentage_change = new Decimal(amount).div(total_outstanding_shares).toNumber();
    const updated_difference = new Decimal(price).mul(shares_percentage_change).mul(k_value);

    // If the transaction type is a buy, add the difference to the price
    // If the transaction type is a sell, subtract the difference from the price
    let updated_price = transaction_type === "BUY" ? new Decimal(price).add(updated_difference).toNumber() : new Decimal(price).sub(updated_difference).toNumber();
    updated_price = updated_price > 0 ? updated_price : 0.0001;

    return updated_price;
  }
};
