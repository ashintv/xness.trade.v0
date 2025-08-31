/**
 * Decimal places for each asset
 * `asset`: decimal places
 */
export const Decimals = {
	BTCUSDT: 8,
	ETHUSDT: 8,
	BNBUSDT: 8,
	XRPUSDT: 8,
	ADAUSDT: 8,
};


/**
 * Spread for order book
 * 1 percent spread required ie 0.01 hence 0.005 for calculating bid/ask prices
 */
export const SPREAD = 0.005; 


/**
 * Channel for v0 trades
 */
export const CHANNEL_V0 = "trades_v0";


/**
 * Query for v0 trades 
 * "INSERT INTO trades (time, symbol, price, quantity, is_buyer_maker, decimal) VALUES %L"
 */
export const query_V0 =
	"INSERT INTO trades (time, symbol, price, quantity, is_buyer_maker, decimal) VALUES %L";


/**
 * query for trades (rounded)
 */
export const query =
	"INSERT INTO trade (time, asset, price) VALUES %L";