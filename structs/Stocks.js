const client = require("../index.js");
const Account = require("./Account.js");
const Decimal = require("decimal.js-light");
const moment = require("moment-timezone");
const { InvalidStockTickerError, FrozenStockError, FrozenUserError, InsufficientFundsError, InvalidSharesAmountError, ImageTooLargeError, ConflictingError } = require("./Errors.js");

module.exports = class Stocks {

  constructor() {
    this.account = new Account();
  }

  async buy(discord_id, ticker, amount, order_type, order_type_details) {
    const stock = await this.ticker(ticker);
    if (!stock) {
      throw new InvalidStockTickerError(ticker);
    }

    if (stock.frozen == 1) {
      throw new FrozenStockError(ticker);
    }

    // Check if account is frozen
    const isFrozen = await this.account.isFrozen(discord_id);
    if (isFrozen) {
      throw new FrozenUserError(discord_id);
    }

    // Check if account can afford the order
    const price_per_share = stock.price;
    const total_price = new Decimal(price_per_share).mul(amount);
    const fee = new Decimal(total_price).mul(process.env.ORDER_FEE_PERCENTAGE).toNumber();
    const balance = await this.account.balance(discord_id);
    if (balance < total_price.add(fee).toNumber()) {
      throw new InsufficientFundsError(discord_id, total_price, balance);
    }

    client.emitter.emit("buy", ticker.toUpperCase(), amount, price_per_share, order_type, order_type_details);

    await this.processOrder(discord_id, ticker.toUpperCase(), amount, stock.price, order_type, order_type_details);
  }

  async sell(discord_id, ticker, amount, order_type, order_type_details) {
    const stock = await this.ticker(ticker);
    if (!stock) {
      throw new InvalidStockTickerError(ticker);
    }

    if (stock.frozen == 1) {
      throw new FrozenStockError(ticker);
    }

    // Check if account is frozen
    const isFrozen = await this.account.isFrozen(discord_id);
    if (isFrozen) {
      throw new FrozenUserError(discord_id);
    }

    // Check if account has enough shares to sell
    const price_per_share = stock.price;
    const shares = await this.account.portfolio(discord_id);
    const ticker_shares = shares.find(share => share.ticker === ticker.toUpperCase());
    if (!ticker_shares || parseInt(ticker_shares.total_shares) < amount) {
      throw new InsufficientFundsError(discord_id, amount, shares[ticker.toUpperCase()] || 0);
    }

    client.emitter.emit("sell", ticker.toUpperCase(), amount, price_per_share, order_type, order_type_details);

    await this.processOrder(discord_id, ticker.toUpperCase(), amount, stock.price, order_type, order_type_details);
  }

  async processOrder(discord_id, ticker, amount, price_per_share, order_type, order_type_details) {
    const original_account_id = await this.account.databaseID(discord_id);
    let leftoverAmount = new Decimal(amount);

    let queryParams;
    if (order_type_details.limit_price) {
      queryParams = [ticker, order_type_details.order_transaction_type === "BUY" ? "SELL" : "BUY", order_type_details.limit_price, price_per_share, price_per_share, original_account_id];
    } else {
      queryParams = [ticker, order_type_details.order_transaction_type === "BUY" ? "SELL" : "BUY", price_per_share, price_per_share, original_account_id];
    }

    // Get all orders that match the order type and ticker
    const orders = await client.query(`
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
      await client.query(`
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
        await client.query(transactionQuery,
          [original_account_id, account_id, id, total_price, order_fee, ticker, current_order_amount.toNumber(), "DR", "CR", `Bought ${current_order_amount} shares of ${ticker} at $${price_per_share} per share`]
        );
        await client.query(transactionQuery,
          [account_id, original_account_id, id, total_price, 0, ticker, current_order_amount.toNumber(), "CR", "DR", `Sold ${current_order_amount} shares of ${ticker} at $${price_per_share} per share`]
        );

        // Check if the matching order is an IPO order
        if (ipo === 1) {
          await client.query(`
            UPDATE tickers
            SET available_shares = available_shares - ?
            WHERE ticker = ?`,
            [current_order_amount.toNumber(), ticker]
          );
        }
      } else {
        await client.query(transactionQuery,
          [original_account_id, account_id, id, total_price, 0, ticker, current_order_amount.toNumber(), "CR", "DR", `Sold ${current_order_amount} shares of ${ticker} at $${price_per_share} per share`]
        );
        await client.query(transactionQuery,
          [account_id, original_account_id, id, total_price, order_fee, ticker, current_order_amount.toNumber(), "DR", "CR", `Bought ${current_order_amount} shares of ${ticker} at $${price_per_share} per share`]
        );
      }

      // Update fulfilled order to inactive if remaining amount is 0
      if (updated_remaining_amount.eq(0)) {
        await client.query(`
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
    }

    // Create a new order if there is any leftover amount, else create a empty order
    await client.query(`
      INSERT INTO orders (account_id, ticker, amount, price_per_share, fulfilled_amount, remaining_amount, order_transaction_type, order_type, limit_price, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [original_account_id, ticker, new Decimal(price_per_share).mul(amount).toNumber(), price_per_share, new Decimal(amount).minus(leftoverAmount).toNumber(), leftoverAmount.toNumber(), order_type_details.order_transaction_type, order_type, order_type_details.limit_price, leftoverAmount.gt(0) ? 1 : 0]
    );

    // Update the stock price
    const newStockPrice = await this.updatedPrice(amount, ticker, order_type_details.order_transaction_type);
    await client.query(`
      UPDATE tickers
      SET price = ?
      WHERE ticker = ?`,
      [newStockPrice, ticker]
    );

    client.logger.info(`Updated stock price from ${price_per_share} to ${newStockPrice} for ${ticker}`);
  }

  async ticker(ticker) {
    const stock = await client.query("SELECT * FROM tickers WHERE ticker = ?", [ticker]);

    if (stock.length === 0) {
      throw new InvalidStockTickerError(ticker);
    } else {
      return stock[0];
    }
  }

  async price(ticker) {
    const price = (await client.query("SELECT price FROM tickers WHERE ticker = ?", [ticker]))[0].price;
    return price;
  }

  async companies() {
    const companies = await client.query("SELECT ticker, company_name, frozen FROM tickers");
    return companies;
  }

  async isFrozen(ticker) {
    const frozen = (await client.query("SELECT frozen FROM tickers WHERE ticker = ?", [ticker]))[0].frozen;
    return frozen === 1;
  }

  /**
   * ADMIN COMMANDS
   */

  async freeze(ticker) {
    // Freeze the specified stock
    await client.query("UPDATE tickers SET frozen = 1 WHERE ticker = ?", [ticker]);

    client.emitter.emit("stockFrozen", ticker.toUpperCase());
  }

  async unfreeze(ticker) {
    // Unfreeze the specified stock
    await client.query("UPDATE tickers SET frozen = 0 WHERE ticker = ?", [ticker]);

    client.emitter.emit("stockUnfrozen", ticker.toUpperCase());
  }

  async create(ticker, company_name, available_shares, outstanding_shares, total_outstanding_shares, price) {
    await client.query(`
      INSERT INTO tickers (ticker, company_name, available_shares, outstanding_shares, total_outstanding_shares, price)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [ticker, company_name, available_shares, outstanding_shares, total_outstanding_shares, price]);

    client.emitter.emit("stockCreated", ticker.toUpperCase(), company_name, available_shares, outstanding_shares, total_outstanding_shares, price);
  }

  async setImage(ticker, imageBuffer) {
    // Check image size is less than 16MB
    if (imageBuffer.length > 16777215) {
      throw new ImageTooLargeError();
    }

    // Check if ticker exists
    const ticker_details = await this.ticker(ticker);
    if (!ticker_details) {
      throw new InvalidStockTickerError(ticker);
    }

    await client.query("UPDATE tickers SET image = ? WHERE ticker = ?", [imageBuffer, ticker]);

    client.emitter.emit("imageUpdated", ticker.toUpperCase(), imageBuffer);
  }

  async setAvailableShares(ticker, available_shares) {
    // Check if available shares is a more than outstanding shares
    const outstanding_shares = (await client.query("SELECT outstanding_shares FROM tickers WHERE ticker = ?", [ticker]))[0].outstanding_shares;
    if (available_shares > outstanding_shares) {
      throw new InvalidSharesAmountError(available_shares);
    }

    // Check if ticker exists
    const ticker_details = await this.ticker(ticker);
    if (!ticker_details) {
      throw new InvalidStockTickerError(ticker);
    }

    // Check if there is an active IPO order, if so, update the available shares
    const ipo_order = await client.query("SELECT * FROM orders WHERE ticker = ? AND ipo = 1 AND active = 1", [ticker]);
    if (ipo_order.length > 0 && ipo_order[0].remaining_amount + ipo_order[0].fulfilled_amount > available_shares) {
      const already_bought_shares = ipo_order[0].fulfilled_amount;
      const new_available_shares = new Decimal(available_shares).sub(already_bought_shares).toNumber();

      // If new_available_shares is less than 0, throw an error
      if (new_available_shares < 0) {
        throw new ConflictingError("Cannot set available shares to less than the amount of shares available for the IPO");
      } else {
        await client.query("UPDATE tickers SET available_shares = ? WHERE ticker = ?", [new_available_shares, ticker]);
      }
    } else {
      await client.query("UPDATE tickers SET available_shares = ? WHERE ticker = ?", [available_shares, ticker]);
    }

    client.emitter.emit("availableSharesUpdated", ticker.toUpperCase(), available_shares);
  }

  async setOutstandingShares(ticker, outstanding_shares) {
    // Check if outstanding shares is a more than total outstanding shares
    const total_outstanding_shares = (await client.query("SELECT total_outstanding_shares FROM tickers WHERE ticker = ?", [ticker]))[0].total_outstanding_shares;
    if (outstanding_shares > total_outstanding_shares) {
      throw new InvalidSharesAmountError(outstanding_shares);
    }

    // Check if ticker exists
    const ticker_details = await this.ticker(ticker);
    if (!ticker_details) {
      throw new InvalidStockTickerError(ticker);
    }

    await client.query("UPDATE tickers SET outstanding_shares = ? WHERE ticker = ?", [outstanding_shares, ticker]);

    client.emitter.emit("outstandingSharesUpdated", ticker.toUpperCase(), outstanding_shares);
  }

  async setTotalOutstandingShares(ticker, total_outstanding_shares) {
    // Check if total outstanding shares is a less than outstanding shares
    const outstanding_shares = (await client.query("SELECT outstanding_shares FROM tickers WHERE ticker = ?", [ticker]))[0].outstanding_shares;
    if (total_outstanding_shares < outstanding_shares) {
      throw new InvalidSharesAmountError(total_outstanding_shares);
    }

    // Check if ticker exists
    const ticker_details = await this.ticker(ticker);
    if (!ticker_details) {
      throw new InvalidStockTickerError(ticker);
    }

    await client.query("UPDATE tickers SET total_outstanding_shares = ? WHERE ticker = ?", [total_outstanding_shares, ticker]);

    client.emitter.emit("totalOutstandingSharesUpdated", ticker.toUpperCase(), total_outstanding_shares);
  }

  // method to get open, close, high, low prices for a ticker for a given date
  async getOHLC(ticker, date) {
  }

  async dailyPercentageChange(ticker) {
    // Get the midnight date in EST timezone
    const midnight_date = moment().tz("America/New_York").startOf("day").unix();

    const prices = await client.query(`
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

    const { open, current } = prices[0];
    const percentage_change = new Decimal(current).sub(open).div(open).mul(100).toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toNumber();

    return percentage_change;
  }

  async setPrice(ticker, price) {
    await client.query("UPDATE tickers SET price = ? WHERE ticker = ?", [price, ticker]);
  }

  /**
   * UTILITY FUNCTIONS
   */

  async shareholders(ticker, exchange_discord_id) {
    // Get shareholder through transactions, differentiate between CR and DR
    const shareholders = await client.query(`
      SELECT
        SUM(CASE
          WHEN ticker_transaction_type = "CR" THEN ticker_amount
          WHEN ticker_transaction_type = "DR" THEN -ticker_amount
          ELSE 0
        END) AS total_shares,
        account_id
      FROM transactions
      WHERE ticker = ?
      GROUP BY account_id
      HAVING total_shares <> 0
      ORDER BY total_shares DESC`,
      [ticker]
    );

    // Return without The Exchange's account
    const exchange_account_id = await this.account.databaseID(exchange_discord_id);
    const filtered_shareholders = shareholders.filter(shareholder => shareholder.account_id !== exchange_account_id);

    // Get the usernames & discord ids of the shareholders
    const promises = filtered_shareholders.map(async (shareholder) => {
      const { account_id, total_shares } = shareholder;
      const discord_id = await this.account.discordID(account_id);
      const username = await this.account.username(discord_id);
      return { discord_id, username, shares: total_shares };
    });

    const results = await Promise.all(promises);
    return results;
  }

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
