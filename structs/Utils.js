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
   * Create gap candles between two candles
   * 
   * @param {Object} lastCandle
   * @param {Object} nextCandle
   * @param {Number} timeframe
   * @returns {Array<Object>} - The gap candles
   */
  makeGapCandles(lastCandle, nextCandle, timeframe) {
    const gapCandles = [];
    const intervalGap = (nextCandle.x - lastCandle.x - timeframe) / timeframe;

    if (intervalGap > 0 && lastCandle && nextCandle) {
      for (let i = 1; i < intervalGap; i++) {
        const gapCandle = {
          x: lastCandle.x + (i * timeframe),
          o: lastCandle.c,
          h: lastCandle.c,
          l: lastCandle.c,
          c: lastCandle.c,
        };
        gapCandles.push(gapCandle);
      }
    }

    return gapCandles;
  }

  /**
   * Convert tick data to OHLC data
   * 
   * @param {Array<Object>} ticks - The ticks to convert
   * @param {Number} interval - The seconds between each tick
   * @returns {Array<Object>} - The OHLC data
   */
  resampleTicksByTime(ticks, interval) {
    const timeframe = interval * 1000;
    const tickGroups = ticks.reduce((acc, tick) => {
      const key = tick.time - (tick.time % timeframe);
      if (!acc[key]) acc[key] = [];
      acc[key].push(tick);
      return acc;
    }, {});
    const candles = [];
    const sortedKeys = Object.keys(tickGroups).sort((a, b) => a - b); // Sort keys numerically
  
    for (let i = 0; i < sortedKeys.length; i++) {
      const timeOpen = sortedKeys[i];
      const ticks = tickGroups[timeOpen];
      const candle = {
        x: parseInt(timeOpen),
        o: ticks[0].price,
        h: Math.max(...ticks.map((tick) => tick.price)),
        l: Math.min(...ticks.map((tick) => tick.price)),
        c: ticks[ticks.length - 1].price,
      };
      if (candles.length) {
        const lastCandle = candles[candles.length - 1];
        candles.push(...this.makeGapCandles(lastCandle, candle, timeframe));
      }
      candles.push(candle);
    }
  
    const sortedCandles = candles.sort((a, b) => a.x - b.x);
  
    return sortedCandles;
  }
};