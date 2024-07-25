import { Button, Text, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import { Category, Transaction } from "@/types";
import { router } from "expo-router";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import CategoryButton from "@/components/categories/categoryButton";
import React, { useEffect, useState } from "react";

type TransactionWithOptionalIDAndStringAmount = Partial<
  Pick<Transaction, "id">
> &
  Omit<Transaction, "id" | "amount"> & { amount: string };

const TransactionPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
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

  useEffect(() => {
    if (id !== "null") {
      getTransaction(Number(id));
    }
  }, []);

  useEffect(() => {
    getExpenseType(currentTab);
  }, [currentTab]);

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

  async function getExpenseType(currentTab: number) {
    updateType(currentTab === 0 ? "Expense" : "Income");
    const type = currentTab === 0 ? "Expense" : "Income";

    const result = await db.getAllAsync<Category>(
      `SELECT * FROM Categories WHERE type = ?;`,
      [type]
    );
    setCategories(result);
  }

  async function getTransaction(id: number) {
    const result = await db.getFirstAsync<Transaction>(
      `SELECT * FROM Transactions WHERE id = ?;`,
      [id]
    );

    if (result) {
      updateAmount(result.amount.toString());
      updateDescription(result.description);
      updateCategoryId(result.category_id);
      updateType(result.type);
      if (result.type === "Income") {
        setCurrentTab(1);
      }
    }
  }

  async function insertTransaction(
    transaction: Omit<Transaction, "id">,
    transactionId?: string
  ) {
    db.withTransactionAsync(async () => {
      if (transactionId !== "null") {
        // Update existing transaction
        await db.runAsync(
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
            Number(transactionId),
          ]
        );
      } else {
        // Insert new transaction
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
      }

      router.back();
    });
  }

  async function handleSave(transactionId?: string) {
    console.log(
      {
        amount: Number(currentTransaction.amount),
        description: currentTransaction.description,
        category_id: currentTransaction.category_id,
        date: new Date().getTime(),
        type: currentTransaction.type as "Expense" | "Income",
      },
      transactionId
    );

    await insertTransaction(
      {
        amount: Number(currentTransaction.amount),
        description: currentTransaction.description,
        category_id: currentTransaction.category_id,
        date: new Date().getTime(),
        type: currentTransaction.type as "Expense" | "Income",
      },
      transactionId
    );
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
        <Button title="Save" onPress={() => handleSave(id)} />
      </View>
    </View>
  );
};

export default TransactionPage;
