import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AddTransaction() {
  return (
    <View style={{ marginBottom: 15 }}>
      <AddButton
        setIsAddingTransaction={() => router.push(`transactions/${null}`)}
      />
    </View>
  );
}

function AddButton({
  setIsAddingTransaction,
}: {
  setIsAddingTransaction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <TouchableOpacity
      onPress={() => setIsAddingTransaction(true)}
      activeOpacity={0.6}
      style={{
        height: 40,
        flexDirection: "row",
        alignItems: "center",

        justifyContent: "center",
        backgroundColor: "#007BFF20",
        borderRadius: 15,
      }}
    >
      <MaterialIcons name="add-circle-outline" size={24} color="#007BFF" />
      <Text style={{ fontWeight: "700", color: "#007BFF", marginLeft: 5 }}>
        New Entry
      </Text>
    </TouchableOpacity>
  );
}
