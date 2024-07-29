import { type SQLiteDatabase } from "expo-sqlite";
import { Category, Transaction, TransactionsSummary } from "@/types";
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
export async function getTransactions(
  db: SQLiteDatabase,
  startDate: Date,
  endDate: Date,
  categoryId: number | null
) {
  let baseQuery = `SELECT * from Transactions WHERE date >= ? AND date <= ?`;
  const queryParams = [
    Math.floor(startDate.getTime()),
    Math.floor(endDate.getTime()),
  ];

  const fullQuery = categoryId
    ? `${baseQuery} AND category_id = ? ORDER BY date DESC Limit 30;`
    : `${baseQuery} ORDER BY date DESC Limit 30;`;

  if (categoryId) {
    queryParams.push(categoryId);
  }

  return await db.getAllAsync<Transaction>(fullQuery, queryParams);
}

export async function getTransactionsSummary(
  db: SQLiteDatabase,
  startDate: Date,
  endDate: Date,
  categoryId: number | null
) {
  let baseQuery = `
    SELECT
      COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
      COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) AS totalIncome
    FROM Transactions
    WHERE date >= ? AND date <= ?
  `;

  const queryParams = [
    Math.floor(startDate.getTime()),
    Math.floor(endDate.getTime()),
  ];

  const fullQuery = categoryId
    ? `${baseQuery} AND category_id = ?;`
    : `${baseQuery};`;

  if (categoryId) {
    queryParams.push(categoryId);
  }

  return await db.getAllAsync<TransactionsSummary>(fullQuery, queryParams);
}

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

export async function getCategories(
  db: SQLiteDatabase,
  type?: "Expense" | "Income"
) {
  let baseQuery = "SELECT * from Categories";

  const queryParams: ("Expense" | "Income")[] = [];

  const fullQuery = type ? `${baseQuery} WHERE type = ?;` : `${baseQuery};`;

  if (type) {
    queryParams.push(type);
  }

  return await db.getAllAsync<Category>(fullQuery, queryParams);
}

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
