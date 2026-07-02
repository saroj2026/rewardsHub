import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

const sideTabs: { name: string; icon: keyof typeof Feather.glyphMap; label: string }[] = [
  { name: "Home", icon: "home", label: "Home" },
  { name: "Cards", icon: "credit-card", label: "Cards" },
];
const trailingTabs: { name: string; icon: keyof typeof Feather.glyphMap; label: string }[] = [
  { name: "Offers", icon: "tag", label: "Offers" },
  { name: "Profile", icon: "user", label: "Profile" },
];

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index].name;

  const renderTab = (tab: (typeof sideTabs)[number]) => {
    const active = activeName === tab.name;
    return (
      <Pressable
        key={tab.name}
        onPress={() => navigation.navigate(tab.name)}
        style={styles.tabButton}
        accessibilityLabel={tab.label}
      >
        <Feather name={tab.icon} size={20} color={active ? colors.accent : colors.mutedForeground} />
        <Text style={[styles.tabLabel, { color: active ? colors.accent : colors.mutedForeground }]}>
          {tab.label}
        </Text>
        {active && <View style={styles.activeDot} />}
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {sideTabs.map(renderTab)}

        <View style={styles.orbWrap}>
          <View style={styles.orbGlow} />
          <Pressable
            onPress={() => navigation.navigate("AI")}
            style={styles.orb}
            accessibilityLabel="Ask RewardIQ Assistant"
          >
            <Feather name="cpu" size={22} color={colors.highlightForeground} />
            <Text style={styles.orbLabel}>AI</Text>
          </Pressable>
        </View>

        {trailingTabs.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(20,20,20,0.92)",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  tabButton: { alignItems: "center", gap: 3, minWidth: 52 },
  tabLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
  activeDot: { position: "absolute", bottom: -8, width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent },
  orbWrap: { top: -28, alignItems: "center", justifyContent: "center" },
  orbGlow: {
    position: "absolute", width: 64, height: 64, borderRadius: 32, backgroundColor: colors.highlight, opacity: 0.35,
  },
  orb: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: colors.highlight,
    alignItems: "center", justifyContent: "center", gap: 1,
    borderWidth: 4, borderColor: colors.background,
    shadowColor: colors.highlight, shadowOpacity: 0.6, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, elevation: 8,
  },
  orbLabel: { fontSize: 8, fontWeight: "900", letterSpacing: 1, color: colors.highlightForeground, textTransform: "uppercase" },
});
