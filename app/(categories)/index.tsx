import { Platform, ScrollView, View, StyleSheet } from "react-native";
import { Category } from "@/types";
import { useSQLiteContext } from "expo-sqlite/next";
import { router, useFocusEffect } from "expo-router";
import AddCategory from "@/components/addEntry";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import CategoryEditableButton from "@/components/categories/categoryEditableButton";
import SwipeableRow from "@/components/swipeableRow";
import Animated from "react-native-reanimated";
import { deleteCategory } from "@/utils/Database";
import React, { useEffect, useState, useCallback } from "react";

const Categories = () => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const db = useSQLiteContext();

  useFocusEffect(
    useCallback(() => {
      getCategories(currentTab);
    }, [currentTab])
  );

  async function getCategories(currentTab: number) {
    const type = currentTab === 0 ? "Expense" : "Income";

    const result = await db.getAllAsync<Category>(
      `SELECT * FROM Categories WHERE type = ?;`,
      [type]
    );
    setCategories(result);
  }

  async function removeCategoy(id: number) {
    await deleteCategory(db, id);
    getCategories(currentTab);
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 15,
        paddingVertical: Platform.OS === "ios" ? 170 : 16,
      }}
    >
      <SegmentedControl
        values={["Expense", "Income"]}
        style={{ marginBottom: 15 }}
        selectedIndex={currentTab}
        onChange={(event) => {
          setCurrentTab(event.nativeEvent.selectedSegmentIndex);
        }}
      />
      <View style={styles.categoriesContainer}>
        {categories.map((cat) => (
          <SwipeableRow key={cat.id} onDelete={() => removeCategoy(cat.id)}>
            <Animated.View>
              <CategoryEditableButton category={cat} />
            </Animated.View>
          </SwipeableRow>
        ))}

        <AddCategory onAddEntry={() => router.push(`/(categories)/${null}`)} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoriesContainer: {
    display: "flex",
    gap: 6,
  },
});

export default Categories;
