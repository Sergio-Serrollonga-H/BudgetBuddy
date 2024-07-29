import { Button, View, Text, TextInput, StyleSheet } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import { Drawer } from "expo-router/drawer";
import { Category } from "@/types";
import { router } from "expo-router";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import ColorPalette from "@/components/colorPalette";
import { insertCategory, updateCategory } from "@/utils/Database";
import React, { useEffect, useState, useCallback } from "react";

type CategoryWithOptionalID = Partial<Pick<Category, "id">> &
  Omit<Category, "id">;

const CategoryPage = () => {
  const { id, type, color, name } = useLocalSearchParams<{
    id: string;
    color: string;
    name: string;
    type: string;
  }>();

  const [currentTab, setCurrentTab] = useState<number>(0);
  const [currentCategory, setCurrentCategory] =
    useState<CategoryWithOptionalID>({
      color: null,
      name: "",
      type: "Expense",
    });

  const db = useSQLiteContext();

  useFocusEffect(
    useCallback(() => {
      setCurrentCategory({
        name: name || "",
        color: color || null,
        type: (type as "Expense" | "Income") || "Expense",
      });
    }, [id, name, color, type])
  );

  useEffect(() => {
    setCurrentTab(currentCategory.type === "Expense" ? 0 : 1);
  }, [currentCategory.type]);

  const updateName = (name: string) => {
    setCurrentCategory((prevCategory) => ({
      ...prevCategory,
      name,
    }));
  };

  const updateType = (type: "Expense" | "Income") => {
    setCurrentCategory((prevCategory) => ({
      ...prevCategory,
      type,
    }));
  };

  const updateColor = (color: string) => {
    setCurrentCategory((prevCategory) => ({
      ...prevCategory,
      color,
    }));
  };

  async function handleSave(categoryId?: string) {
    if (categoryId !== "null") {
      await updateCategory(db, currentCategory, Number(categoryId));
    } else {
      await insertCategory(db, currentCategory);
    }
    router.back();
  }

  return (
    <View>
      <Drawer.Screen
        options={{
          title: `${id !== "null" ? "Edit" : "Create"} Category`,
        }}
      />

      <View style={{ padding: 10 }}>
        <TextInput
          placeholder="Name"
          style={{ fontSize: 32, marginBottom: 15, fontWeight: "bold" }}
          value={currentCategory.name}
          onChangeText={updateName}
        />

        <SegmentedControl
          values={["Expense", "Income"]}
          style={{ marginBottom: 15 }}
          selectedIndex={currentTab}
          onChange={(event) => {
            setCurrentTab(event.nativeEvent.selectedSegmentIndex);
            updateType(
              event.nativeEvent.selectedSegmentIndex === 0
                ? "Expense"
                : "Income"
            );
          }}
        />
        <View style={styles.colorContainer}>
          <Text>Color:</Text>
          <View
            style={[
              styles.colorItem,
              { backgroundColor: currentCategory.color ?? "none" },
            ]}
          ></View>
        </View>
        {!currentCategory.color && (
          <Text style={{ marginTop: 5 }}>
            No color selected, please select one from palette:
          </Text>
        )}
        <ColorPalette
          currentColor={currentCategory.color}
          onChangeColor={updateColor}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          padding: 10,
        }}
      >
        <Button title="Cancel" color="red" onPress={() => router.back()} />
        <Button
          title="Save"
          onPress={() => {
            handleSave(id);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  colorContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
  },

  colorItem: {
    width: 40,
    height: 25,
    borderWidth: 4,
    borderColor: "black",
  },
});
export default CategoryPage;
