import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface AddEntryProps {
  onAddEntry: () => void;
}

function AddButton({ onAddEntry }: { onAddEntry: () => void }) {
  return (
    <TouchableOpacity
      onPress={() => onAddEntry()}
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

const AddEntry: React.FC<AddEntryProps> = ({ onAddEntry }) => {
  return (
    <View style={{ marginBottom: 15 }}>
      <AddButton onAddEntry={onAddEntry} />
    </View>
  );
};

export default AddEntry;
