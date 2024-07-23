import { Stack } from "expo-router";
import { View, Text } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import "react-native-reanimated";

import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import React, { useState, useEffect } from "react";

const loadDatabase = async () => {
  const dbName = "test.db";
  const dbAsset = require("./../assets/test.db");
  const dbUri = Asset.fromModule(dbAsset).uri;
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

  try {
    const fileInfo = await FileSystem.getInfoAsync(dbFilePath);

    /*     if (fileInfo.exists) {
      await FileSystem.deleteAsync(dbFilePath);
    } */

    if (!fileInfo.exists) {
      await FileSystem.makeDirectoryAsync(
        `${FileSystem.documentDirectory}SQLite/`,
        { intermediates: true }
      );
      await FileSystem.downloadAsync(dbUri, dbFilePath);
    }
  } catch (err) {
    console.error(err);
  }
};

export default function RootLayout() {
  const [dbLoaded, setDbLoaded] = useState<boolean>(false);

  useEffect(() => {
    loadDatabase()
      .then(() => {
        setDbLoaded(true);
        console.log("DB loaded");
      })
      .catch((e) => console.error(e));
  }, []);

  if (!dbLoaded)
    return (
      <View style={{ flex: 1 }}>
        <Text>Loading Database...</Text>
      </View>
    );

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
        useSuspense
        assetSource={{ assetId: require("./../assets/test.db") }}
      >
        <Stack>
          <Stack.Screen
            name="index"
            options={{ headerShown: true, headerTitle: "Budget Buddy" }}
          />
          <Stack.Screen name="transactions/[id]" />
        </Stack>
      </SQLiteProvider>
    </React.Suspense>
  );
}
