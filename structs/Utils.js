module.exports = class Utils {
  /**
   * Format a number to USD currency in 4 decimal places
   * 
   * @param {Number} amount - The amount to format
   * @returns {String} - The formatted amount
   */
  formatCurrency(amount) {
    return Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 4 }).format(amount);
  }

  /**
   * Convert tick data to OHLC data
   * 
   * @param {Array<Object>} ticks - The ticks to convert
   * @param {Number} interval - The miliseconds between each tick
   */
  convertToOHLC(ticks, interval) {
    const groupedTicks = ticks.reduce((result, tick) => {
      const timestamp = tick.date;
      const key = Math.floor(timestamp / interval) * interval;

      if (!result.has(key)) {
        result.set(key, []);
      }

      result.get(key).push(tick);
      return result;
    }, new Map());

    const ohlcData = Array.from(groupedTicks.values()).map((intervalTicks) => {
      const { date, price } = intervalTicks[0];
      const intervalData = {
        x: date,
        o: price,
        h: Math.max(...intervalTicks.map((tick) => tick.price)),
        l: Math.min(...intervalTicks.map((tick) => tick.price)),
        c: intervalTicks[intervalTicks.length - 1].price,
      };
      return intervalData;
    });

    return ohlcData;
  }
};