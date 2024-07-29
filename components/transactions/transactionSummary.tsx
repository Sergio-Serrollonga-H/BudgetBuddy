import { View, Text, TextStyle, StyleSheet } from "react-native";
import Card from "../card";
import { TransactionsByMonth } from "@/types";
import { commaDelimited } from "@/utils/filters";

interface TransactionSummaryProps extends TransactionsByMonth {
  startDate: Date;
  endDate: Date;
}

function TransactionSummary({
  totalIncome,
  totalExpenses,
  startDate,
  endDate,
}: TransactionSummaryProps) {
  const savings = totalIncome - totalExpenses;

  const getMonthAndMonthName = (startDate: Date) => {
    const date = startDate;

    const monthName = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);

    return monthName;
  };

  const getMoneyTextStyle = (value: number): TextStyle => ({
    fontWeight: "bold",
    color: value < 0 ? "#ff4500" : "#2e8b57",
  });

  const formatMoney = (value: number) => {
    const absValue = commaDelimited(Math.abs(value));

    return `${value < 0 ? "-" : ""}$${absValue}`;
  };

  return (
    <>
      <Card style={styles.container}>
        <Text style={styles.periodTitle}>Summary</Text>
        <Text style={styles.periodDate}>
          {getMonthAndMonthName(startDate)} to {getMonthAndMonthName(endDate)}
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

  periodDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
});

export default TransactionSummary;
