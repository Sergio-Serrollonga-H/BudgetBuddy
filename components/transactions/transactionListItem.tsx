import { Text, View, StyleSheet } from "react-native";
import { Category, Transaction } from "@/types";
import { AutoSizeText, ResizeTextMode } from "react-native-auto-size-text";
import { AntDesign } from "@expo/vector-icons";
import { commaDelimited } from "@/utils/filters";
import SwipeableRow from "../swipeableRow";
import Animated from "react-native-reanimated";
import Card from "../card";
import React from "react";

interface TransactionListItemProps {
  transaction: Transaction;
  categoryInfo: Category | undefined;
  onDelete: () => void;
}

function TransactionInfo({
  id,
  date,
  description,
}: {
  id: number;
  date: number;
  description: string;
}) {
  return (
    <View style={{ flexGrow: 1, gap: 6, flexShrink: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>{description}</Text>
      <Text>Transaction number {id}</Text>
      <Text style={{ fontSize: 12, color: "gray" }}>
        {new Date(date).toDateString()}
      </Text>
    </View>
  );
}

function CategoryItem({
  categoryColor,
  categoryInfo,
}: {
  categoryColor: string;
  categoryInfo: Category | undefined;
}) {
  return (
    <View
      style={[
        styles.categoryContainer,
        { backgroundColor: categoryColor + "40" },
      ]}
    >
      <Text style={styles.categoryText}>{categoryInfo?.name}</Text>
    </View>
  );
}

function Amount({
  iconName,
  color,
  amount,
}: {
  iconName: "minuscircle" | "pluscircle";
  color: string;
  amount: number;
}) {
  return (
    <View style={styles.row}>
      <AntDesign name={iconName} size={18} color={color} />
      <AutoSizeText
        fontSize={32}
        mode={ResizeTextMode.max_lines}
        numberOfLines={1}
        style={[styles.amount, { maxWidth: "80%" }]}
      >
        ${commaDelimited(amount)}
      </AutoSizeText>
    </View>
  );
}

const TransactionListItem: React.FC<TransactionListItemProps> = ({
  transaction,
  categoryInfo,
  onDelete,
}) => {
  const iconName =
    transaction.type === "Expense" ? "minuscircle" : "pluscircle";
  const color = transaction.type === "Expense" ? "red" : "green";
  const categoryColor = categoryInfo?.color ?? "#D3D3D3";
  return (
    <SwipeableRow style={{ elevation: 8 }} onDelete={onDelete}>
      <Animated.View>
        <Card>
          <View style={styles.row}>
            <View style={{ width: "40%", gap: 3 }}>
              <Amount
                amount={transaction.amount}
                color={color}
                iconName={iconName}
              />
              {categoryInfo && (
                <CategoryItem
                  categoryColor={categoryColor}
                  categoryInfo={categoryInfo}
                />
              )}
            </View>
            <TransactionInfo
              date={transaction.date}
              description={transaction.description}
              id={transaction.id}
            />
          </View>
        </Card>
      </Animated.View>
    </SwipeableRow>
  );
};

const styles = StyleSheet.create({
  amount: {
    fontSize: 32,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryContainer: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 12,
  },
});

export default TransactionListItem;
