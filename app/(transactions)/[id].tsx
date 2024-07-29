import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import { Category, Transaction } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import CategoryButton from "@/components/categories/categoryButton";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { insertTransaction, updateTransaction } from "@/utils/Database";
import { Drawer } from "expo-router/drawer";
import React, { useEffect, useState, useCallback } from "react";

type TransactionWithOptionalIDAndStringAmount = Partial<
  Pick<Transaction, "id">
> &
  Omit<Transaction, "id" | "amount"> & { amount: string };

const TransactionPage = () => {
  const { id, categoryId, description, amount, type, date } =
    useLocalSearchParams<{
      id: string;
      categoryId: string;
      description: string;
      amount: string;
      type: string;
      date: string;
    }>();

  const [datePickerDate, setDatePickerDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<Boolean>(false);

  const [currentTab, setCurrentTab] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentTransaction, setCurrentTransaction] =
    useState<TransactionWithOptionalIDAndStringAmount>({
      category_id: 1,
      amount: "",
      date: new Date().getTime(),
      description: "",
      type: "Expense",
    });

  const db = useSQLiteContext();

  useFocusEffect(
    useCallback(() => {
      initTransactionInfo();
    }, [id, categoryId, description, amount, type, date])
  );

  useEffect(() => {
    getExpenseType(currentTab);
  }, [currentTab]);

  const initTransactionInfo = () => {
    setCurrentTransaction({
      category_id: Number(categoryId),
      amount: amount || "",
      date: new Date().getTime(),
      description: description || "",
      type: (type as "Expense" | "Income") || "Expense",
    });

    if (date) {
      setDatePickerDate(new Date(Number(date)));
    } else {
      setDatePickerDate(new Date());
    }

    if (type === "Income") {
      setCurrentTab(1);
    } else {
      setCurrentTab(0);
    }

    getExpenseType(currentTab);
  };

  const updateAmount = (amount: string) => {
    setCurrentTransaction((prevTransaction) => ({
      ...prevTransaction,
      amount,
    }));
  };

  const updateDescription = (description: string) => {
    setCurrentTransaction((prevTransaction) => ({
      ...prevTransaction,
      description,
    }));
  };

  const updateType = (type: "Expense" | "Income") => {
    setCurrentTransaction((prevTransaction) => ({
      ...prevTransaction,
      type,
    }));
  };

  const updateCategoryId = (id: number) => {
    setCurrentTransaction((prevTransaction) => ({
      ...prevTransaction,
      category_id: id,
    }));
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = selectedDate;
      setDatePickerDate(currentDate);
    }
  };

  async function getExpenseType(currentTab: number) {
    updateType(currentTab === 0 ? "Expense" : "Income");
    const type = currentTab === 0 ? "Expense" : "Income";

    const result = await db.getAllAsync<Category>(
      `SELECT * FROM Categories WHERE type = ?;`,
      [type]
    );
    setCategories(result);
  }

  async function handleSave(transactionId?: string) {
    try {
      if (transactionId !== "null") {
        await updateTransaction(
          db,
          {
            amount: Number(currentTransaction.amount),
            description: currentTransaction.description,
            category_id: currentTransaction.category_id,
            date: datePickerDate.getTime(),
            type: currentTransaction.type as "Expense" | "Income",
          },
          Number(transactionId)
        );
      } else {
        await insertTransaction(db, {
          amount: Number(currentTransaction.amount),
          description: currentTransaction.description,
          category_id: currentTransaction.category_id,
          date: datePickerDate.getTime(),
          type: currentTransaction.type as "Expense" | "Income",
        });
      }

      router.back();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  }

  return (
    <View>
      <Drawer.Screen
        options={{
          title: `${id !== "null" ? "Edit" : "Create"} Transaction`,
        }}
      />
      <View style={{ padding: 10 }}>
        <TextInput
          placeholder="$Amount"
          style={{ fontSize: 32, marginBottom: 15, fontWeight: "bold" }}
          keyboardType="numeric"
          value={currentTransaction.amount.toString()}
          onChangeText={(text) => {
            // Remove any non-numeric characters before setting the state
            const numericValue = text.replace(/[^0-9.]/g, "");
            updateAmount(numericValue);
          }}
        />
        <TextInput
          placeholder="Description"
          style={{ marginBottom: 15 }}
          value={currentTransaction.description}
          onChangeText={updateDescription}
        />
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <TouchableOpacity
            style={{ marginRight: 20 }}
            onPress={showDatepicker}
          >
            <Ionicons name="calendar-outline" size={24} color={"dark"} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24 }}>
            {datePickerDate && datePickerDate.toDateString()}
          </Text>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={datePickerDate}
              mode={"date"}
              is24Hour={true}
              onChange={onChangeDate}
            />
          )}
        </View>
        <Text style={{ marginBottom: 6 }}>Select a entry type</Text>
        <SegmentedControl
          values={["Expense", "Income"]}
          style={{ marginBottom: 15 }}
          selectedIndex={currentTab}
          onChange={(event) => {
            setCurrentTab(event.nativeEvent.selectedSegmentIndex);
          }}
        />
        {categories.map((cat) => (
          <CategoryButton
            key={cat.name}
            // @ts-ignore
            id={cat.id}
            title={cat.name}
            color={cat.color}
            isSelected={currentTransaction.category_id === cat.id}
            setCategoryId={updateCategoryId}
          />
        ))}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          padding: 10,
        }}
      >
        <Button title="Cancel" color="red" onPress={router.back} />
        <Button
          title="Save"
          disabled={!currentTransaction.category_id}
          onPress={() => handleSave(id)}
        />
      </View>
    </View>
  );
};

export default TransactionPage;
