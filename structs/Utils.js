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
};