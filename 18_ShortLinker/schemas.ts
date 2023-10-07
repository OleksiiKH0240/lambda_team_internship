import { int, text, varchar, index, mysqlTable } from 'drizzle-orm/mysql-core';


export const UrlsStorage = mysqlTable("UrlsStorage", {
    id: int("id").primaryKey().autoincrement(),
    realUrl: text("real_url").notNull(),
    urlHash: varchar("url_hash", { length: 64 }).notNull(),
    numberInGroup: int("number_in_group").notNull()
}, (table) => {
    return {
        urlHashIndex: index("url_hash_index").on(table.urlHash)
    }
});
