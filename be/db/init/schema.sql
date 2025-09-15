-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;
-- Note: timescaledb_toolkit not needed for basic functionality

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
    time TIMESTAMPTZ NOT NULL,
    symbol TEXT NOT NULL,
    price NUMERIC,
    quantity NUMERIC,
    is_buyer_maker BOOLEAN,
    decimal NUMERIC
);

-- Convert to hypertable
SELECT create_hypertable('trades', 'time', if_not_exists => TRUE);

-- Continuous aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS trades_1m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket(INTERVAL '1 minute', time) AS timestamp,
    symbol,
    FIRST(price, time) AS open_price,
    LAST(price, time) AS close_price,
    MAX(price) AS high_price,
    MIN(price) AS low_price
FROM trades
GROUP BY timestamp, symbol;

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_5m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket(INTERVAL '5 minutes', time) AS timestamp,
    symbol,
    FIRST(price, time) AS open_price,
    LAST(price, time) AS close_price,
    MAX(price) AS high_price,
    MIN(price) AS low_price
FROM trades
GROUP BY timestamp, symbol;

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_10m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket(INTERVAL '10 minutes', time) AS timestamp,
    symbol,
    FIRST(price, time) AS open_price,
    LAST(price, time) AS close_price,
    MAX(price) AS high_price,
    MIN(price) AS low_price
FROM trades
GROUP BY timestamp, symbol;

CREATE MATERIALIZED VIEW IF NOT EXISTS trades_30m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket(INTERVAL '30 minutes', time) AS timestamp,
    symbol,
    FIRST(price, time) AS open_price,
    LAST(price, time) AS close_price,
    MAX(price) AS high_price,
    MIN(price) AS low_price
FROM trades
GROUP BY timestamp, symbol;

-- Continuous aggregate refresh policies
SELECT add_continuous_aggregate_policy(
    'trades_1m',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute'
);

SELECT add_continuous_aggregate_policy(
    'trades_5m',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute'
);

SELECT add_continuous_aggregate_policy(
    'trades_10m',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute'
);

SELECT add_continuous_aggregate_policy(
    'trades_30m',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute'
);