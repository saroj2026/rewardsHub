import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import { colors } from "../theme/colors";

// Matches the web app's `bg-gradient-to-br from-accent/40 to-highlight/40` —
// react-native-svg's LinearGradient is the only way to get a true diagonal
// gradient in RN without a separate native module.
export function GradientCircle({ size, children }: { size: number; children?: ReactNode }) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity={0.4} />
            <Stop offset="100%" stopColor={colors.highlight} stopOpacity={0.4} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#grad)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
