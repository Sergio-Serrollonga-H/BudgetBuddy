import { StyleSheet, ScrollView, Platform } from "react-native";
import { Category, Transaction } from "@/types";
import { useSQLiteContext } from "expo-sqlite";
import TransactionList from "@/components/transactionsList";
import AddTransaction from "@/components/addTransaction";
import TransactionSummary from "@/components/transactionSummary";
import { TransactionsByMonth } from "@/types";
import React, { useState, useEffect } from "react";

const App = () => {
  const [year, setYear] = useState<number>(2024);
  const [month, setMonth] = useState<number>(7);

  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsByMonth, setTransactionsByMonth] =
    useState<TransactionsByMonth>({
      totalExpenses: 0,
      totalIncome: 0,
    });

  const db = useSQLiteContext();

  useEffect(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    setYear(currentYear);
    setMonth(currentMonth);
  }, []);

  useEffect(() => {
    async () => {
      await getData();
    };
  }, [year, month]);

  useEffect(() => {
    db.withTransactionAsync(async () => {
      await getData();
    });
  }, [db]);

  const getMonthStartEnd = (year: number, month: number) => {
    const adjustedMonth = month - 1;
    const startDate = new Date(year, adjustedMonth, 1);
    const endDate = new Date(year, adjustedMonth + 1, 0);

    return { startDate, endDate };
  };

  async function getData() {
    const { startDate, endDate } = getMonthStartEnd(year, month);
    console.log(startDate, endDate);

    const transactionsResult = await db.getAllAsync<Transaction>(
      `SELECT * from Transactions ORDER BY date DESC Limit 10;`
    );

    setTransactions(transactionsResult);

    const categoriesResult = await db.getAllAsync<Category>(
      "SELECT * from Categories;"
    );

    setCategories(categoriesResult);

    const transactionsByMonth = await db.getAllAsync<TransactionsByMonth>(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
        COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) AS totalIncome
      FROM Transactions
      WHERE date >= ? AND date <= ?;
    `,
      [Math.floor(startDate.getTime()), Math.floor(endDate.getTime())]
    );
    setTransactionsByMonth(transactionsByMonth[0]);
  }

  async function deleteTransaction(id: number) {
    db.withTransactionAsync(async () => {
      await db.runAsync(`DELETE FROM Transactions WHERE id = ?;`, [id]);
      await getData();
    });
  }

  async function insertTransaction(transaction: Transaction) {
    db.withTransactionAsync(async () => {
      await db.runAsync(
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
      await getData();
    });
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          padding: 15,
          paddingVertical: Platform.OS === "ios" ? 170 : 16,
        }}
      >
        <TransactionSummary
          totalExpenses={transactionsByMonth.totalExpenses}
          totalIncome={transactionsByMonth.totalIncome}
          year={year}
          month={month}
        />
        <AddTransaction insertTransaction={insertTransaction} />
        <TransactionList
          categories={categories}
          transactions={transactions}
          deleteTransaction={deleteTransaction}
        />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingVertical: 170,
  },
});

export default App;
