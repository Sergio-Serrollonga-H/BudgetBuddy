import { Button, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import { Category, Transaction } from "@/types";
import { router } from "expo-router";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import CategoryButton from "@/components/categories/categoryButton";
import { insertTransaction, updateTransaction } from "@/utils/Database";
import React, { useEffect, useState, useCallback } from "react";
import { Drawer } from "expo-router/drawer";

type TransactionWithOptionalIDAndStringAmount = Partial<
  Pick<Transaction, "id">
> &
  Omit<Transaction, "id" | "amount"> & { amount: string };

const TransactionPage = () => {
  const { id, categoryId, description, amount, type } = useLocalSearchParams<{
    id: string;
    categoryId: string;
    description: string;
    amount: string;
    type: string;
  }>();

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
      setCurrentTransaction({
        category_id: Number(categoryId),
        amount: amount || "",
        date: new Date().getTime(),
        description: description || "",
        type: (type as "Expense" | "Income") || "Expense",
      });

      if (type === "Income") {
        setCurrentTab(1);
      } else {
        setCurrentTab(0);
      }

      getExpenseType(currentTab);
    }, [id, categoryId, description, amount, type])
  );

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

  async function handleSave(transactionId?: string) {
    try {
      if (transactionId !== "null") {
        await updateTransaction(
          db,
          {
            amount: Number(currentTransaction.amount),
            description: currentTransaction.description,
            category_id: currentTransaction.category_id,
            date: new Date().getTime(),
            type: currentTransaction.type as "Expense" | "Income",
          },
          Number(transactionId)
        );
      } else {
        await insertTransaction(db, {
          amount: Number(currentTransaction.amount),
          description: currentTransaction.description,
          category_id: currentTransaction.category_id,
          date: new Date().getTime(),
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
