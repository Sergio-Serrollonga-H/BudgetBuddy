import { View, Text, TextStyle, StyleSheet } from "react-native";
import Card from "./card";
import { TransactionsByMonth } from "@/types";

interface TransactionSummaryProps extends TransactionsByMonth {
  month: number;
  year: number;
}

function TransactionSummary({
  totalIncome,
  totalExpenses,
  month,
  year,
}: TransactionSummaryProps) {
  const savings = totalIncome - totalExpenses;

  const getMonthName = (year: number, month: number) => {
    const adjustedMonth = month - 1;

    const date = new Date(year, adjustedMonth, 1);

    const monthName = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(date);

    return monthName;
  };

  const getMoneyTextStyle = (value: number): TextStyle => ({
    fontWeight: "bold",
    color: value < 0 ? "#ff4500" : "#2e8b57",
  });

  const formatMoney = (value: number) => {
    const absValue = Math.abs(value).toFixed(2);
    return `${value < 0 ? "-" : ""}$${absValue}`;
  };

  return (
    <>
      <Card style={styles.container}>
        <Text style={styles.periodTitle}>
          Summary for {getMonthName(year, month)}
        </Text>
        <Text style={styles.summaryText}>
          Income:{" "}
          <Text style={getMoneyTextStyle(totalIncome)}>
            {formatMoney(totalIncome)}
          </Text>
        </Text>
        <Text style={styles.summaryText}>
          Total Expenses:{" "}
          <Text style={getMoneyTextStyle(totalExpenses)}>
            {formatMoney(totalExpenses)}
          </Text>
        </Text>
        <Text style={styles.summaryText}>
          Savings:{" "}
          <Text style={getMoneyTextStyle(savings)}>{formatMoney(savings)}</Text>
        </Text>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingBottom: 7,
  },

  summaryText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 10,
  },

  periodTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
});

export default TransactionSummary;
