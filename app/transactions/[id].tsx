import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import { Category, Transaction } from "@/types";
import { router } from "expo-router";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import CategoryButton from "@/components/categories/categoryButton";
import React, { useEffect, useState } from "react";

const TransactionPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [typeSelected, setTypeSelected] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("Expense");
  const [categoryId, setCategoryId] = useState<number>(1);
  const db = useSQLiteContext();

  useEffect(() => {
    getExpenseType(currentTab);
  }, [currentTab]);

  async function getExpenseType(currentTab: number) {
    setCategory(currentTab === 0 ? "Expense" : "Income");
    const type = currentTab === 0 ? "Expense" : "Income";

    const result = await db.getAllAsync<Category>(
      `SELECT * FROM Categories WHERE type = ?;`,
      [type]
    );
    setCategories(result);
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

      router.back();
    });
  }

  async function handleSave() {
    console.log({
      amount: Number(amount),
      description,
      category_id: categoryId,
      date: new Date().getTime(),
      type: category as "Expense" | "Income",
    });

    // @ts-ignore
    await insertTransaction({
      amount: Number(amount),
      description,
      category_id: categoryId,
      date: new Date().getTime(),
      type: category as "Expense" | "Income",
    });
  }

  return (
    <View>
      <Stack.Screen
        options={{
          title: `${id !== "null" ? "Edit" : "Create"} Transaction`,
        }}
      />
      <View style={{ padding: 10 }}>
        <TextInput
          placeholder="$Amount"
          style={{ fontSize: 32, marginBottom: 15, fontWeight: "bold" }}
          keyboardType="numeric"
          onChangeText={(text) => {
            // Remove any non-numeric characters before setting the state
            const numericValue = text.replace(/[^0-9.]/g, "");
            setAmount(numericValue);
          }}
        />
        <TextInput
          placeholder="Description"
          style={{ marginBottom: 15 }}
          onChangeText={setDescription}
        />
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
            isSelected={typeSelected === cat.name}
            setTypeSelected={setTypeSelected}
            setCategoryId={setCategoryId}
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
        <Button title="Save" onPress={handleSave} />
      </View>
    </View>
  );
};

export default TransactionPage;
