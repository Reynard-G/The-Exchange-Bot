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
   * @param {Number} interval - The seconds between each tick
   * @returns {Array<Object>} - The OHLC data
   */
  resampleTicksByTime(ticks, interval) {
    // Make an array of arrays, each array containing 2 unix timestamps representing the range of each candle
    // The range will be from now to the first tick's time, use the interval to determine the range of each candle
    const candleRanges = [];
    const firstTickTime = ticks[0].time;
    const now = Math.floor(Date.now() / 1000) * 1000;
    for (let i = now; i > firstTickTime; i -= interval * 1000) {
      candleRanges.push([i - interval * 1000, i]);
    }
    candleRanges.reverse();

    // Make an array of candles, each candle containing the OHLC data for each candle range
    // If there are no ticks in a candle range, the candle will use the previous candle's close price, or 0 if there is no previous candle
    const candles = [];
    let lastCandle = null;
    for (let i = 0; i < candleRanges.length; i++) {
      const candleRange = candleRanges[i];
      const candleTicks = ticks.filter((tick) => tick.time >= candleRange[0] && tick.time < candleRange[1]);

      const candle = {
        x: candleRange[0],
        o: lastCandle ? lastCandle.c : ticks[0].price,
        h: candleTicks.length > 0 ? Math.max(...candleTicks.map((tick) => tick.price)) : lastCandle ? lastCandle.c : ticks[0].price,
        l: candleTicks.length > 0 ? Math.min(...candleTicks.map((tick) => tick.price)) : lastCandle ? lastCandle.c : ticks[0].price,
        c: candleTicks.length > 0 ? candleTicks[candleTicks.length - 1].price : lastCandle ? lastCandle.c : ticks[0].price,
      };

      candles.push(candle);
      lastCandle = candle;
    }

    return candles;
  }
};