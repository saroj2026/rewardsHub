import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../theme/colors";
import type { RootStackParamList } from "../navigation/types";

export function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const fade = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    const pulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0.3, duration: 450, useNativeDriver: true }),
        ]),
      ).start();
    pulse(dot1, 0);
    pulse(dot2, 150);
    pulse(dot3, 300);

    const timer = setTimeout(() => navigation.replace("Onboarding"), 2200);
    return () => clearTimeout(timer);
  }, [navigation, fade, dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      <View style={styles.cardWrap}>
        <View style={styles.cardGlow} />
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={styles.chip}>
              <View style={styles.chipLine} />
              <View style={styles.chipLine} />
            </View>
            <Feather name="wifi" size={16} color="rgba(255,255,255,0.5)" style={{ transform: [{ rotate: "90deg" }] }} />
          </View>
          <View>
            <View style={styles.dotsRow}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={styles.cardDot} />
              ))}
            </View>
            <View style={styles.cardBottomRow}>
              <View style={styles.cardNumberBar} />
              <Text style={styles.cardIqLabel}>IQ</Text>
            </View>
          </View>
        </View>
      </View>

      <Animated.View style={[styles.textBlock, { opacity: fade }]}>
        <Text style={styles.title}>RewardIQ</Text>
        <Text style={styles.subtitle}>POWERED BY AI</Text>
        <Text style={styles.tagline}>Maximum rewards, every swipe.</Text>
      </Animated.View>

      <View style={styles.dotsLoading}>
        <Animated.View style={[styles.loadingDot, { opacity: dot1 }]} />
        <Animated.View style={[styles.loadingDot, { opacity: dot2 }]} />
        <Animated.View style={[styles.loadingDot, { opacity: dot3 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    paddingHorizontal: 32,
  },
  cardWrap: {
    width: 224,
    aspectRatio: 1.586,
    transform: [{ rotate: "-6deg" }],
  },
  cardGlow: {
    position: "absolute",
    top: -16,
    left: -16,
    right: -16,
    bottom: -16,
    borderRadius: 40,
    backgroundColor: colors.highlight,
    opacity: 0.15,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    padding: 20,
    justifyContent: "space-between",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  chip: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "rgba(165,255,0,0.35)",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 4,
    gap: 2,
  },
  chipLine: {
    width: 11,
    height: 11,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  dotsRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
  cardDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.25)" },
  cardBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  cardNumberBar: { width: 64, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.2)" },
  cardIqLabel: { fontSize: 10, fontWeight: "900", color: colors.highlight, letterSpacing: 2 },
  textBlock: { alignItems: "center", gap: 6 },
  title: { fontSize: 44, fontWeight: "900", color: colors.highlight, letterSpacing: -1 },
  subtitle: { fontSize: 11, fontWeight: "800", color: colors.accent, letterSpacing: 4, marginTop: 2 },
  tagline: { fontSize: 14, color: colors.mutedForeground, marginTop: 10 },
  dotsLoading: { flexDirection: "row", gap: 6 },
  loadingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.highlight },
});
