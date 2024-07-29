import { Text, TouchableOpacity } from "react-native";
import { Category } from "@/types";
import { router } from "expo-router";
import React from "react";

interface CategoryEditableButtonProps {
  category: Category;
}

const CategoryEditableButton: React.FC<CategoryEditableButtonProps> = ({
  category,
}) => {
  return (
    <TouchableOpacity
      style={{
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: category.color ?? "#00000020",
        borderRadius: 15,
      }}
      onLongPress={() =>
        router.push({
          pathname: `/(categories)/${category.id}`,
          params: {
            name: category.name,
            type: category.type,
            color: category.color,
          },
        })
      }
    >
      <Text
        style={{
          fontWeight: "700",
          color: "#000000",
          marginLeft: 5,
        }}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

export default CategoryEditableButton;
