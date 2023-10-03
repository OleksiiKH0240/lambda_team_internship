import { int, varchar, double, time, index, mysqlTable } from 'drizzle-orm/mysql-core';

// import { serial, varchar, decimal, timestamp, pgTable } from 'drizzle-orm/pg-core';


// export const CoinMarketCapSchema = pgTable("CoinMarketCap", {
//     id: serial("id").primaryKey(),
//     crypto_symbol: varchar("crypto_symbol"),
//     last15mins_price: decimal("last15min_price"),
//     last1hour_price: decimal("last1hour_price"),
//     last4hours_price: decimal("last4hours_price"),
//     last24hours_price: decimal("last24hours_price"),
//     last_updated: timestamp("last_updated"),
// });

// export const mySchema = mysqlSchema("crypto_markets");



// CoinMarketCapSchema --------------------------------------
export const CoinMarketCapSchema = mysqlTable("CoinMarketCap", {
    id: int("id").primaryKey().autoincrement(),
    crypto_symbol: varchar("crypto_symbol", { length: 256 }),
    price: double("price"),
    last_updated: time("last_updated"),
}, (table) => {
    return {
        crypto_symbol_idx: index("crypto_symbol_idx").on(table.crypto_symbol),
        last_updated_idx: index("last_updated_idx").on(table.last_updated)
    }
});


// CoinBaseSchema ---------------------------------
export const CoinBaseSchema = mysqlTable("CoinBase", {
    id: int("id").primaryKey().autoincrement(),
    crypto_symbol: varchar("crypto_symbol", { length: 256 }),
    price: double("price"),
    last_updated: time("last_updated"),
}, (table) => {
    return {
        crypto_symbol_idx: index("crypto_symbol_idx").on(table.crypto_symbol),
        last_updated_idx: index("last_updated_idx").on(table.last_updated)
    }
});


// CoinStatsSchema ----------------------------------
export const CoinStatsSchema = mysqlTable("CoinStats", {
    id: int("id").primaryKey().autoincrement(),
    crypto_symbol: varchar("crypto_symbol", { length: 256 }),
    price: double("price"),
    last_updated: time("last_updated"),
}, (table) => {
    return {
        crypto_symbol_idx: index("crypto_symbol_idx").on(table.crypto_symbol),
        last_updated_idx: index("last_updated_idx").on(table.last_updated)
    }
});



// KucoinSchema ----------------------------------
export const KucoinSchema = mysqlTable("Kucoin", {
    id: int("id").primaryKey().autoincrement(),
    crypto_symbol: varchar("crypto_symbol", { length: 256 }),
    price: double("price"),
    last_updated: time("last_updated"),
}, (table) => {
    return {
        crypto_symbol_idx: index("crypto_symbol_idx").on(table.crypto_symbol),
        last_updated_idx: index("last_updated_idx").on(table.last_updated)
    }
});

