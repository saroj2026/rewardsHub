import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { getUserCards } from "../../lib/api-client";
import { clearSession } from "../../lib/session";
import { getPremiumActive } from "../../lib/premium";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { signedOut } from "../../store/slices/userSlice";
import { ScreenHeader } from "../../components/ScreenHeader";
import type { MainTabParamList, ProfileStackParamList, RootStackParamList } from "../../navigation/types";

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, "ProfileHome">,
  CompositeNavigationProp<BottomTabNavigationProp<MainTabParamList>, NativeStackNavigationProp<RootStackParamList>>
>;

export function ProfileHomeScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user.current);
  const [premiumActive, setPremiumActiveState] = useState(false);
  const [cardCount, setCardCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getPremiumActive().then(setPremiumActiveState);
      if (!user?.id) {
        setCardCount(0);
        return;
      }
      getUserCards(user.id).then((c) => setCardCount(c.length)).catch(() => setCardCount(0));
    }, [user?.id]),
  );

  const displayName = user?.phone ?? user?.email ?? "Guest";
  const initials = user
    ? (user.phone ?? user.email ?? "U").replace(/\D/g, "").slice(-2) || (user.email?.[0].toUpperCase() ?? "U")
    : "G";

  const rows: { icon: keyof typeof Feather.glyphMap; label: string; value?: string; onPress: () => void }[] = [
    { icon: "credit-card", label: "Linked Cards", value: user ? `${cardCount} active` : undefined, onPress: () => navigation.navigate("Cards", { screen: "CardsList" }) },
    { icon: "bar-chart-2", label: "Analytics", onPress: () => navigation.navigate("Profile", { screen: "Analytics" }) },
    { icon: "bell", label: "Alerts & Reminders", value: "On", onPress: () => navigation.navigate("Profile", { screen: "Permissions" }) },
    { icon: "users", label: "Family Circle", onPress: () => navigation.navigate("Profile", { screen: "Family" }) },
    { icon: "shield", label: "Privacy & Security", onPress: () => navigation.navigate("Profile", { screen: "Security" }) },
    { icon: "life-buoy", label: "Help & Support", onPress: () => navigation.navigate("Profile", { screen: "Help" }) },
  ];

  const handleSignOut = async () => {
    await clearSession();
    dispatch(signedOut());
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "SignIn" }] }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Profile" onBack={() => navigation.navigate("Home")} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          {!user && <Text style={styles.email}>Not signed in</Text>}
          <View style={styles.iqBadge}>
            <Feather name="award" size={12} color={colors.highlight} />
            <Text style={styles.iqBadgeText}>IQ SCORE 842 · TOP 8%</Text>
          </View>
        </View>

        <View style={styles.premiumCard}>
          <View style={styles.premiumGlow} />
          <View style={styles.premiumIconWrap}>
            <Ionicons name="sparkles" size={18} color={colors.highlightForeground} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.premiumTitle}>RewardIQ Premium</Text>
            <Text style={styles.premiumBody}>Live sync · Statement OCR · AI coach · Family plan</Text>
            {premiumActive ? (
              <View style={styles.premiumActiveBadge}>
                <Feather name="award" size={12} color={colors.highlight} />
                <Text style={styles.premiumActiveText}>Premium Active</Text>
              </View>
            ) : (
              <Pressable style={styles.premiumCta} onPress={() => navigation.navigate("Profile", { screen: "Plans" })}>
                <Text style={styles.premiumCtaText}>View plans</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.rowsCard}>
          {rows.map((r, i) => (
            <Pressable
              key={r.label}
              onPress={r.onPress}
              style={[styles.row, i < rows.length - 1 && styles.rowBorder]}
            >
              <View style={styles.rowIconWrap}>
                <Feather name={r.icon} size={16} color={colors.mutedForeground} />
              </View>
              <Text style={styles.rowLabel}>{r.label}</Text>
              {r.value && <Text style={styles.rowValue}>{r.value}</Text>}
              <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.3)" />
            </Pressable>
          ))}
        </View>

        {user ? (
          <Pressable style={styles.signOut} onPress={handleSignOut}>
            <Feather name="log-out" size={15} color={colors.destructive} />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.signOut} onPress={() => navigation.navigate("SignIn")}>
            <Feather name="log-in" size={15} color={colors.highlight} />
            <Text style={[styles.signOutText, { color: colors.highlight }]}>Sign in</Text>
          </Pressable>
        )}
        <Text style={styles.version}>REWARDIQ AI · V1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  avatarSection: { alignItems: "center", marginBottom: 22 },
  avatar: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: "rgba(0,245,255,0.2)",
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 24, fontWeight: "900", color: colors.foreground },
  name: { fontSize: 19, fontWeight: "800", color: colors.foreground, marginTop: 12 },
  email: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  iqBadge: {
    flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(165,255,0,0.15)",
    borderWidth: 1, borderColor: "rgba(165,255,0,0.3)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginTop: 12,
  },
  iqBadgeText: { fontSize: 10, fontWeight: "800", color: colors.highlight, letterSpacing: 1 },
  premiumCard: {
    flexDirection: "row", gap: 12, padding: 18, borderRadius: 24, marginBottom: 20, overflow: "hidden",
    backgroundColor: "rgba(165,255,0,0.08)", borderWidth: 1, borderColor: "rgba(165,255,0,0.3)",
  },
  premiumGlow: { position: "absolute", right: -24, top: -24, width: 120, height: 120, borderRadius: 60, backgroundColor: colors.highlight, opacity: 0.15 },
  premiumIconWrap: { width: 40, height: 40, borderRadius: 16, backgroundColor: colors.highlight, alignItems: "center", justifyContent: "center" },
  premiumTitle: { fontSize: 15, fontWeight: "900", color: colors.foreground },
  premiumBody: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  premiumCta: { marginTop: 12, height: 36, borderRadius: 999, backgroundColor: colors.highlight, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, alignSelf: "flex-start" },
  premiumCtaText: { fontSize: 12, fontWeight: "900", color: colors.highlightForeground },
  premiumActiveBadge: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, height: 36, borderRadius: 999,
    backgroundColor: "rgba(165,255,0,0.15)", borderWidth: 1, borderColor: "rgba(165,255,0,0.3)",
    paddingHorizontal: 16, alignSelf: "flex-start",
  },
  premiumActiveText: { fontSize: 12, fontWeight: "900", color: colors.highlight },
  rowsCard: { borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginBottom: 20 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 15 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontSize: 13.5, fontWeight: "600", color: colors.foreground },
  rowValue: { fontSize: 12, color: colors.mutedForeground },
  signOut: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 18,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: "rgba(229,72,77,0.25)",
  },
  signOutText: { fontSize: 13.5, fontWeight: "700", color: colors.destructive },
  version: { textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, marginTop: 18 },
});
