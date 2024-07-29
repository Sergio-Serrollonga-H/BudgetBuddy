import { type SQLiteDatabase } from "expo-sqlite";
import { Category, Transaction } from "@/types";
import * as FileSystem from "expo-file-system";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const dbFilePath = `${FileSystem.documentDirectory}`;
  console.log(dbFilePath);
  const DATABASE_VERSION = 2;
  let result = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");

  let currentDbVersion = result?.user_version ?? 0;
  console.log(currentDbVersion);

  if (currentDbVersion >= DATABASE_VERSION) {
    console.log("Database with latest version");
    return;
  }
  if (currentDbVersion === 0) {
    console.log("Upating Db ...");
    const result = await db.execAsync(`
        PRAGMA journal_mode = 'wal';
        CREATE TABLE IF NOT EXISTS Categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('Expense', 'Income')),
        color Text
        );

        CREATE TABLE IF NOT EXISTS Transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        amount REAL NOT NULL,
        date INTEGER NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK (type IN ('Expense', 'Income')),
        FOREIGN KEY (category_id) REFERENCES Categories (id)
        );
        `);

    console.log("Result: ", result);

    currentDbVersion = 1;
  }

  if (currentDbVersion === 1) {
    console.log("Updating Db to version 2 ...");
    await db.execAsync(`
        ALTER TABLE Categories ADD COLUMN color TEXT;
    `);
    currentDbVersion = 2;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

//Transactions

export async function insertTransaction(
  db: SQLiteDatabase,
  transaction: Omit<Transaction, "id">
) {
  return await db.runAsync(
    `
        INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (?, ?, ?, ?, ?);
      `,
    [
      transaction.category_id,
      transaction.amount,
      transaction.date,
      transaction.description,
      transaction.type,
    ]
  );
}

export async function updateTransaction(
  db: SQLiteDatabase,
  transaction: Omit<Transaction, "id">,
  transactionId: number
) {
  return await db.runAsync(
    `
        UPDATE Transactions
        SET category_id = ?, amount = ?, date = ?, description = ?, type = ?
        WHERE id = ?;
      `,
    [
      transaction.category_id,
      transaction.amount,
      transaction.date,
      transaction.description,
      transaction.type,
      transactionId,
    ]
  );
}

export async function deleteTransactionById(db: SQLiteDatabase, id: number) {
  return await db.runAsync(`DELETE FROM Transactions WHERE id = ?;`, [id]);
}

//Categories

export async function insertCategory(
  db: SQLiteDatabase,
  category: Omit<Category, "id">
) {
  return await db.runAsync(
    `
        INSERT INTO Categories (name, type, color) VALUES (?, ?, ?);
      `,
    [category.name, category.type, category.color]
  );
}

export async function updateCategory(
  db: SQLiteDatabase,
  category: Omit<Category, "id">,
  categoryId: number
) {
  return await db.runAsync(
    `
        UPDATE Categories
        SET name = ?, type = ?, color = ?
        WHERE id = ?;
      `,
    [category.name, category.type, category.color, categoryId]
  );
}

export async function deleteCategory(db: SQLiteDatabase, id: number) {
  return await db.runAsync(`DELETE FROM Categories WHERE id = ?;`, [id]);
}
