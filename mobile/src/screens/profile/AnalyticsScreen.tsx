import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { EmptyState } from "../../components/EmptyState";
import { formatCategory } from "../../lib/card-display";
import { getUserTransactions, type Card, type Transaction } from "../../lib/api-client";
import { useAppSelector } from "../../store/hooks";
import { TAB_BAR_CLEARANCE } from "../../theme/layout";
import type { ProfileStackParamList } from "../../navigation/types";

const BAR_COLORS = [colors.highlight, colors.accent, "#8B5CF6", "#F97316", "#EC4899"];

export function AnalyticsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const userId = useAppSelector((s) => s.user.current?.id);
  const [transactions, setTransactions] = useState<(Transaction & { card: Card })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!userId) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getUserTransactions(userId, 100)
      .then(setTransactions)
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [userId]);

  useFocusEffect(useCallback(() => load(), [load]));

  const totalSpend = transactions.reduce((s, t) => s + Number(t.amount), 0);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount));
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      const label = new Date(t.enteredAt).toLocaleDateString("en-IN", { month: "short" });
      map.set(label, (map.get(label) ?? 0) + Number(t.amount));
    }
    return [...map.entries()].slice(-6);
  }, [transactions]);
  const maxMonthly = Math.max(1, ...monthlyTrend.map(([, v]) => v));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => navigation.navigate("ProfileHome")}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Ionicons name="sparkles" size={14} color={colors.highlight} />
          <Text style={styles.h1}>Analytics</Text>
        </View>
        <Pressable style={styles.iconButton} onPress={load}>
          <Feather name="refresh-cw" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {!userId ? (
        <View style={{ paddingHorizontal: 20 }}>
          <EmptyState title="Sign in to see analytics" body="Your real spend breakdown shows up here once you're signed in." />
        </View>
      ) : loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <View style={styles.heroGlow} />
            <Text style={styles.heroLabel}>TOTAL TRACKED SPEND</Text>
            <Text style={styles.heroValue}>₹{totalSpend.toLocaleString("en-IN")}</Text>
            <Text style={styles.heroSub}>
              Across {transactions.length} transaction{transactions.length === 1 ? "" : "s"} on your linked cards.
            </Text>
          </View>

          {monthlyTrend.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Spend Trend</Text>
              <View style={styles.trendCard}>
                {monthlyTrend.map(([label, value]) => (
                  <View key={label} style={styles.trendCol}>
                    <View style={styles.trendBarTrack}>
                      <View style={[styles.trendBarFill, { height: `${Math.max(6, (value / maxMonthly) * 100)}%` }]} />
                    </View>
                    <Text style={styles.trendLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {byCategory.length === 0 ? (
            <EmptyState title="No spend data yet" body="Log a spend on any card and your analytics will show up here." />
          ) : (
            <>
              <Text style={styles.sectionLabel}>Spend by Category</Text>
              <View style={{ gap: 10, marginBottom: 22 }}>
                {byCategory.map(([category, amount], i) => {
                  const pct = Math.round((amount / totalSpend) * 100);
                  return (
                    <View key={category} style={styles.categoryCard}>
                      <View style={styles.categoryTopRow}>
                        <View style={styles.categoryNameRow}>
                          <View style={[styles.dot, { backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }]} />
                          <Text style={styles.categoryName}>{formatCategory(category)}</Text>
                        </View>
                        <Text style={styles.categoryAmount}>₹{amount.toLocaleString("en-IN")}</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }]} />
                      </View>
                      <Text style={styles.categoryPct}>{pct}% of tracked spend</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  h1: { fontSize: 17, fontWeight: "800", color: colors.foreground },
  content: { paddingHorizontal: 20, paddingBottom: 40 + TAB_BAR_CLEARANCE },
  hero: { borderRadius: 24, padding: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 22, overflow: "hidden" },
  heroGlow: { position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: colors.highlight, opacity: 0.12 },
  heroLabel: { fontSize: 10, fontWeight: "700", color: colors.accent, letterSpacing: 2, marginBottom: 4 },
  heroValue: { fontSize: 32, fontWeight: "900", color: colors.foreground, letterSpacing: -1 },
  heroSub: { fontSize: 12, color: colors.mutedForeground, marginTop: 8, lineHeight: 17 },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: colors.mutedForeground, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },
  trendCard: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", height: 140, padding: 16, borderRadius: 24,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 22,
  },
  trendCol: { alignItems: "center", gap: 8, flex: 1, height: "100%", justifyContent: "flex-end" },
  trendBarTrack: { width: 18, flex: 1, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.06)", justifyContent: "flex-end", overflow: "hidden" },
  trendBarFill: { width: "100%", backgroundColor: colors.accent, borderRadius: 6 },
  trendLabel: { fontSize: 9, color: colors.mutedForeground, fontWeight: "700" },
  categoryCard: { padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  categoryTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  categoryNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  categoryName: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  categoryAmount: { fontSize: 13, fontWeight: "800", color: colors.foreground },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 6 },
  progressFill: { height: 6, borderRadius: 3 },
  categoryPct: { fontSize: 10.5, color: colors.mutedForeground },
});
