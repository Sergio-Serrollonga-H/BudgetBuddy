import {
  ScrollView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Category, Transaction } from "@/types";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import TransactionList from "@/components/transactions/transactionsList";
import AddTransaction from "@/components/addEntry";
import TransactionSummary from "@/components/transactions/transactionSummary";
import { TransactionsByMonth } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { deleteTransactionById } from "@/utils/Database";
import DatePicker from "@/components/datePicker";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState, useEffect, useCallback } from "react";

const App = () => {
  const [datePickerStartDate, setDatePickerStartDate] = useState<Date>(
    new Date()
  );
  const [datePickerEndDate, setDatePickerEndDate] = useState<Date>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] =
    useState<Boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<Boolean>(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsByMonth, setTransactionsByMonth] =
    useState<TransactionsByMonth>({
      totalExpenses: 0,
      totalIncome: 0,
    });

  const db = useSQLiteContext();

  useFocusEffect(
    useCallback(() => {
      initCurrentDate();
    }, [])
  );

  useEffect(() => {
    getData();
  }, [datePickerStartDate, datePickerEndDate]);

  useEffect(() => {
    db.withTransactionAsync(async () => {
      await getData();
    });
  }, [db]);

  const initCurrentDate = () => {
    const currentDate = new Date();
    const [month, year] = [currentDate.getMonth(), currentDate.getFullYear()];

    setDatePickerStartDate(new Date(year, month, 1));
    setDatePickerEndDate(new Date(year, month + 1, 0));
  };

  const openStartDatePicker = () => {
    setShowStartDatePicker(true);
  };

  const openEndDatePicker = () => {
    setShowEndDatePicker(true);
  };

  const onChangeStartDate = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const currentDate = selectedDate;
      setDatePickerStartDate(currentDate);
    }
  };

  const onChangeEndDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const currentDate = selectedDate;
      setDatePickerEndDate(currentDate);
    }
  };

  async function getData() {
    const transactionsResult = await db.getAllAsync<Transaction>(
      `SELECT * from Transactions WHERE date >= ? AND date <= ? ORDER BY date DESC Limit 30;`,
      [
        Math.floor(datePickerStartDate.getTime()),
        Math.floor(datePickerEndDate.getTime()),
      ]
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
      [
        Math.floor(datePickerStartDate.getTime()),
        Math.floor(datePickerEndDate.getTime()),
      ]
    );

    console.log(transactionsByMonth);
    setTransactionsByMonth(transactionsByMonth[0]);
  }

  async function deleteTransaction(id: number) {
    await deleteTransactionById(db, id);
    await getData();
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
          startDate={datePickerStartDate}
          endDate={datePickerEndDate}
        />
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <DatePicker
            showDatePicker={showStartDatePicker}
            datePickerDate={datePickerStartDate}
            textStyle={{ fontSize: 14 }}
            openDatepicker={openStartDatePicker}
            onChangeDate={onChangeStartDate}
          />
          <DatePicker
            showDatePicker={showEndDatePicker}
            datePickerDate={datePickerEndDate}
            textStyle={{ fontSize: 14 }}
            openDatepicker={openEndDatePicker}
            onChangeDate={onChangeEndDate}
          />
        </View>
        <AddTransaction
          onAddEntry={() => router.push(`/(transactions)/${null}`)}
        />
        <TransactionList
          categories={categories}
          transactions={transactions}
          deleteTransaction={deleteTransaction}
        />
      </ScrollView>
    </>
  );
};

export default App;
