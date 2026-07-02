import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import {
  planDurations,
  planTiers,
  monthlyEquivalent,
  type PlanDurationMonths,
  type PlanTierKey,
} from "../../lib/plans";
import type { ProfileStackParamList } from "../../navigation/types";

const tierIcons: Record<PlanTierKey, { lib: "feather" | "ionicons"; name: string }> = {
  basic: { lib: "feather", name: "credit-card" },
  moderate: { lib: "ionicons", name: "sparkles" },
  premium: { lib: "feather", name: "award" },
};

export function PlansScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const [months, setMonths] = useState<PlanDurationMonths>(3);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>REWARDIQ · PREMIUM</Text>
          <Text style={styles.h1}>Choose your plan</Text>
        </View>
        <Pressable style={styles.closeBtn} onPress={() => navigation.navigate("ProfileHome")}>
          <Feather name="x" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Unlock live sync, AI recommendations & more. Cancel anytime.</Text>

        <View style={styles.durationRow}>
          {planDurations.map((d) => {
            const active = d.months === months;
            return (
              <Pressable
                key={d.months}
                onPress={() => setMonths(d.months)}
                style={[styles.durationPill, active && styles.durationPillActive]}
              >
                {d.savePct && (
                  <View style={[styles.saveBadge, active && styles.saveBadgeActive]}>
                    <Text style={[styles.saveBadgeText, active && styles.saveBadgeTextActive]}>-{d.savePct}%</Text>
                  </View>
                )}
                <Text style={[styles.durationText, active && styles.durationTextActive]}>{d.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {planTiers.map((tier) => {
          const icon = tierIcons[tier.key];
          const price = tier.prices[months];
          const perMonth = monthlyEquivalent(tier, months);
          const durationShort = planDurations.find((d) => d.months === months)?.shortLabel;
          return (
            <View key={tier.key} style={[styles.card, tier.popular && styles.cardPopular]}>
              {tier.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}
              <View style={styles.cardTopRow}>
                <View style={[styles.iconWrap, tier.popular && styles.iconWrapPopular]}>
                  {icon.lib === "feather" ? (
                    <Feather name={icon.name as keyof typeof Feather.glyphMap} size={18} color={tier.popular ? colors.highlightForeground : "#d4d4d8"} />
                  ) : (
                    <Ionicons name={icon.name as keyof typeof Ionicons.glyphMap} size={18} color={tier.popular ? colors.highlightForeground : "#d4d4d8"} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tierName}>{tier.name}</Text>
                  <Text style={styles.tierTagline}>{tier.tagline}</Text>
                </View>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{price.toLocaleString("en-IN")}</Text>
                <Text style={styles.priceUnit}>/ {durationShort}</Text>
                <Text style={styles.priceMonthly}>≈₹{perMonth.toLocaleString("en-IN")}/mo</Text>
              </View>

              <View style={{ gap: 8, marginBottom: 18 }}>
                {tier.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Feather name="check" size={13} color={tier.popular ? colors.highlight : colors.accent} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                style={[styles.chooseBtn, tier.popular ? styles.chooseBtnPopular : styles.chooseBtnDefault]}
                onPress={() => navigation.navigate("Checkout", { plan: tier.key, months, price })}
              >
                <Text style={[styles.chooseBtnText, tier.popular && { color: colors.highlightForeground }]}>
                  Choose {tier.name}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  eyebrow: { fontSize: 10, fontWeight: "800", color: colors.accent, letterSpacing: 3 },
  h1: { fontSize: 20, fontWeight: "800", color: colors.foreground, marginTop: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  subtitle: { fontSize: 13, color: colors.mutedForeground, marginBottom: 20 },
  durationRow: { flexDirection: "row", gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 4, marginBottom: 24 },
  durationPill: { flex: 1, height: 56, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 2 },
  durationPillActive: { backgroundColor: colors.highlight },
  durationText: { fontSize: 12, fontWeight: "700", color: colors.mutedForeground },
  durationTextActive: { color: colors.highlightForeground },
  saveBadge: { position: "absolute", top: -6, right: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, backgroundColor: colors.accent },
  saveBadgeActive: { backgroundColor: colors.highlightForeground },
  saveBadgeText: { fontSize: 8, fontWeight: "900", color: "#000" },
  saveBadgeTextActive: { color: colors.highlight },
  card: { borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: 16, overflow: "hidden" },
  cardPopular: { borderColor: "rgba(165,255,0,0.4)", backgroundColor: "rgba(165,255,0,0.06)" },
  popularBadge: { position: "absolute", top: 14, right: 14, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.highlight },
  popularBadgeText: { fontSize: 9, fontWeight: "900", color: colors.highlightForeground, letterSpacing: 0.5 },
  cardTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  iconWrap: { width: 44, height: 44, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  iconWrapPopular: { backgroundColor: colors.highlight },
  tierName: { fontSize: 16, fontWeight: "900", color: colors.foreground },
  tierTagline: { fontSize: 11.5, color: colors.mutedForeground, marginTop: 2 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 16 },
  price: { fontSize: 28, fontWeight: "900", color: colors.foreground, letterSpacing: -0.5 },
  priceUnit: { fontSize: 12, color: colors.mutedForeground, fontWeight: "600" },
  priceMonthly: { fontSize: 11, color: colors.mutedForeground, marginLeft: "auto" },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  featureText: { flex: 1, fontSize: 12.5, color: "#d4d4d8" },
  chooseBtn: { height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  chooseBtnPopular: { backgroundColor: colors.highlight },
  chooseBtnDefault: { backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: colors.border },
  chooseBtnText: { fontSize: 13, fontWeight: "900", color: colors.foreground },
});
