import { TouchableOpacity, View } from "react-native";
import { Category, Transaction } from "@/types";
import { router } from "expo-router";
import TransactionListItem from "./transactionListItem";

export default function TransactionList({
  transactions,
  categories,
  deleteTransaction,
}: {
  categories: Category[];
  transactions: Transaction[];
  deleteTransaction: (id: number) => Promise<void>;
}) {
  return (
    <View style={{ gap: 15 }}>
      {transactions.map((transaction) => {
        const categoryForCurrentItem = categories.find(
          (category) => category.id === transaction.category_id
        );
        return (
          <TouchableOpacity
            key={transaction.id}
            activeOpacity={0.7}
            onLongPress={() => {
              router.push({
                pathname: `/(transactions)/${transaction.id}`,
                params: {
                  categoryId: transaction.category_id,
                  description: transaction.description,
                  amount: transaction.amount,
                  type: transaction.type,
                  date: transaction.date,
                },
              });
            }}
          >
            <TransactionListItem
              transaction={transaction}
              categoryInfo={categoryForCurrentItem}
              onDelete={() => deleteTransaction(transaction.id)}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
