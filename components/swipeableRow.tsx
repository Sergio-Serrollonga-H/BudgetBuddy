import React, { Component } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  I18nManager,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";

import { RectButton, Swipeable } from "react-native-gesture-handler";

type SwipeableRowProps = {
  children: React.ReactNode;
  onDelete: () => void;
  style?: ViewStyle;
};

export default class SwipeableRow extends Component<SwipeableRowProps> {
  private renderRightAction = (
    text: string,
    color: string,
    x: number,
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    const pressHandler = () => {
      this.close();
      this.props.onDelete();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX: trans }],
        }}
      >
        <RectButton
          style={[styles.rightAction, { backgroundColor: color }]}
          onPress={pressHandler}
        >
          <Text style={styles.actionText}>{text}</Text>
        </RectButton>
      </Animated.View>
    );
  };

  private renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragAnimatedValue: Animated.AnimatedInterpolation<number>
  ) => (
    <View
      style={{
        width: 192,
        flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
      }}
    >
      {this.renderRightAction("Delete", "#dd2c00", 64, progress)}
    </View>
  );

  private swipeableRow?: Swipeable;

  private updateRef = (ref: Swipeable) => {
    this.swipeableRow = ref;
  };
  private close = () => {
    this.swipeableRow?.close();
  };
  render() {
    const { children, style } = this.props;
    return (
      <Swipeable
        containerStyle={{
          borderRadius: 15,
          shadowColor: "#000",
          shadowRadius: 8,
          shadowOffset: { height: 6, width: 0 },
          ...style,
        }}
        ref={this.updateRef}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={this.renderRightActions}
      >
        {children}
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  actionText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "transparent",
    padding: 10,
  },
  rightAction: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});
