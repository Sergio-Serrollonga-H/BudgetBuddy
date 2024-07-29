import { ScrollView, Platform, View } from "react-native";
import { Category, Transaction } from "@/types";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import TransactionList from "@/components/transactions/transactionsList";
import AddTransaction from "@/components/addEntry";
import TransactionSummary from "@/components/transactions/transactionSummary";
import { TransactionsSummary } from "@/types";
import { useFocusEffect } from "expo-router";
import {
  getCategories,
  getTransactions,
  getTransactionsSummary,
  deleteTransactionById,
} from "@/utils/Database";
import DatePicker from "@/components/datePicker";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsByMonth, setTransactionsByMonth] =
    useState<TransactionsSummary>({
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
  }, [datePickerStartDate, datePickerEndDate, selectedCategory]);

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
      setDatePickerStartDate(selectedDate);
    }
  };

  const onChangeEndDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setDatePickerEndDate(selectedDate);
    }
  };

  const getData = useCallback(async () => {
    const transactionsResult = await getTransactions(
      db,
      datePickerStartDate,
      datePickerEndDate,
      selectedCategory
    );

    setTransactions(transactionsResult);

    const categoriesResult = await getCategories(db);
    setCategories(categoriesResult);

    const transactionsByMonth = await getTransactionsSummary(
      db,
      datePickerStartDate,
      datePickerEndDate,
      selectedCategory
    );

    setTransactionsByMonth(transactionsByMonth[0]);
  }, [datePickerStartDate, datePickerEndDate, selectedCategory, db]);

  const deleteTransaction = async (id: number) => {
    await deleteTransactionById(db, id);
    await getData();
  };

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
        <View>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            <Picker.Item label="All Categories" value={null} />
            {categories.map(({ id, name }) => {
              return <Picker.Item key={id} label={name} value={id} />;
            })}
          </Picker>
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
