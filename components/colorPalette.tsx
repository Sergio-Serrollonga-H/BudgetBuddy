import { View, TouchableOpacity, StyleSheet } from "react-native";
import { simplePaletteColors } from "@/constants";
import React from "react";

interface ColorsPaletteProps {
  currentColor: string | null;
  onChangeColor: (color: string) => void;
}

const ColorPalette: React.FC<ColorsPaletteProps> = ({
  currentColor,
  onChangeColor,
}) => {
  return (
    <View style={styles.container}>
      {simplePaletteColors.map((color) => {
        const activeClass = currentColor === color;
        return (
          <TouchableOpacity key={color} onPress={() => onChangeColor(color)}>
            <View
              style={[
                styles.item,
                { backgroundColor: color },
                activeClass ? styles.active : null,
              ]}
            ></View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: 30,
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },

  item: {
    width: 70,
    height: 50,
  },

  active: {
    borderWidth: 4,
    borderColor: "black",
  },
});

export default ColorPalette;
