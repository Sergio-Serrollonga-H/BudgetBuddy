import { Stack } from "expo-router";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";

const CategoriesLayout = () => {
  const navigation = useNavigation();

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Categories",
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginRight: 20 }}
              onPress={() => toggleDrawer()}
            >
              <Ionicons name="menu" size={24} color={"dark"} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="[id]" />
    </Stack>
  );
};

export default CategoriesLayout;
