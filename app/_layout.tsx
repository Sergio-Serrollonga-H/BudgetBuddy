import "react-native-reanimated";
import { View, Text } from "react-native";
import { Drawer } from "expo-router/drawer";
import { SQLiteProvider } from "expo-sqlite";
import { migrateDbIfNeeded } from "@/utils/Database";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import React from "react";

export default function RootLayout() {
  return (
    <React.Suspense
      fallback={
        <View style={{ flex: 1 }}>
          <Text>Loading Database...</Text>
        </View>
      }
    >
      <SQLiteProvider
        databaseName="test.db"
        onInit={migrateDbIfNeeded}
        useSuspense
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Drawer>
            <Drawer.Screen
              name="index"
              options={{ drawerLabel: "Home", headerTitle: "Budget Buddy" }}
            />
            <Drawer.Screen
              name="(transactions)/[id]"
              options={{
                drawerItemStyle: { display: "none" },
              }}
            />
            <Drawer.Screen
              name="(categories)"
              options={{
                drawerLabel: "Categories",
                headerShown: false,
              }}
            />
          </Drawer>
        </GestureHandlerRootView>
      </SQLiteProvider>
    </React.Suspense>
  );
}
