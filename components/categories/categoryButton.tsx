import { Text, TouchableOpacity } from "react-native";
import React from "react";

interface CategoryButtonProps {
  id: number;
  title: string;
  isSelected: boolean;
  setCategoryId: (id: number) => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({
  id,
  title,
  isSelected,
  setCategoryId,
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        setCategoryId(id);
      }}
      activeOpacity={0.6}
      style={{
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isSelected ? "#007BFF20" : "#00000020",
        borderRadius: 15,
        marginBottom: 6,
      }}
    >
      <Text
        style={{
          fontWeight: "700",
          color: isSelected ? "#007BFF" : "#000000",
          marginLeft: 5,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CategoryButton;
