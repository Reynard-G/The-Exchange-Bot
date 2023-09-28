class InvalidStockTickerError extends Error {
  constructor(ticker) {
    super(`Invalid stock ticker: ${ticker}`);
    this.name = 'InvalidStockTickerError';
  }
}

class FrozenStockError extends Error {
  constructor(ticker) {
    super(`Stock is frozen: ${ticker}`);
    this.name = 'FrozenStockError';
  }
}

class FrozenUserError extends Error {
  constructor(discordID) {
    super(`User is frozen: ${discordID}`);
    this.name = 'FrozenUserError';
  }
}

class InsufficientPermissionsError extends Error {
  constructor(discordID) {
    super(`Insufficient permissions: ${discordID}`);
    this.name = 'InsufficientPermissionsError';
  }
}

class InsufficientFundsError extends Error {
  constructor(discordID) {
    super(`Insufficient funds: ${discordID}`);
    this.name = 'InsufficientFundsError';
  }
}

class InvalidSharesAmountError extends Error {
  constructor(amount) {
    super(`Invalid shares amount: ${amount}`);
    this.name = 'InvalidSharesAmountError';
  }
}

class InvalidLimitPriceError extends Error {
  constructor(price) {
    super(`Invalid limit price: ${price}`);
    this.name = 'InvalidLimitPriceError';
  }
}

class NotRegisteredError extends Error {
  constructor(discordID) {
    super(`User is not registered: ${discordID}`);
    this.name = 'NotRegisteredError';
  }
}

class AlreadyRegisteredError extends Error {
  constructor(discordID) {
    super(`User is already registered: ${discordID}`);
    this.name = 'AlreadyRegisteredError';
  }
}

class OrderNotFoundError extends Error {
  constructor(orderID) {
    super(`Order not found: ${orderID}`);
    this.name = 'OrderNotFoundError';
  }
}

class ImageTooLargeError extends Error {
  constructor() {
    super(`Image too large.`);
    this.name = 'ImageTooLargeError';
  }
}

class ConflictingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictingError';
    this.message = message;
  }
}

class NoParametersError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NoParametersError';
    this.message = message;
  }
}

module.exports = {
  InvalidStockTickerError,
  FrozenStockError,
  FrozenUserError,
  InsufficientPermissionsError,
  InsufficientFundsError,
  InvalidSharesAmountError,
  InvalidLimitPriceError,
  NotRegisteredError,
  AlreadyRegisteredError,
  OrderNotFoundError,
  ImageTooLargeError,
  ConflictingError,
  NoParametersError
};