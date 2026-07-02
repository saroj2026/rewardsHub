import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { describeDiscount, expiresInLabel } from "../../lib/offer-display";
import { ScreenHeader } from "../../components/ScreenHeader";
import { TAB_BAR_CLEARANCE } from "../../theme/layout";
import type { OffersStackParamList } from "../../navigation/types";

const steps = [
  "Pay using the eligible card at checkout",
  "The discount or cashback is applied automatically",
  "Track your reward value in the card's Offers tab",
];

export function OfferDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OffersStackParamList>>();
  const route = useRoute<RouteProp<OffersStackParamList, "OfferDetail">>();
  const { offer } = route.params;

  const terms = [
    offer.minTransaction &&
      `Valid on a minimum transaction of ₹${Number(offer.minTransaction).toLocaleString("en-IN")}`,
    offer.requiresEnrollment && "Requires prior enrollment with the issuer",
    `Valid from ${new Date(offer.startsAt).toLocaleDateString("en-IN")} to ${new Date(offer.expiresAt).toLocaleDateString("en-IN")}`,
    offer.source && `Source: ${offer.source}`,
  ].filter(Boolean) as string[];

  const redeem = () => {
    Alert.alert("Redeemed!", `${offer.description} is now active on your ${offer.cardProduct?.name ?? "eligible card"}.`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Reward Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{offer.merchant?.name?.[0] ?? "?"}</Text>
            </View>
            <View>
              <Text style={styles.merchant}>{offer.merchant?.name}</Text>
              <Text style={styles.category}>{offer.merchant?.category}</Text>
            </View>
          </View>
          <Text style={styles.title}>{offer.description}</Text>
        </View>

        <View style={styles.infoGrid}>
          <InfoCard icon="credit-card" label="Card" value={offer.cardProduct?.name ?? "Any card"} />
          <InfoCard icon="tag" label="Discount" value={describeDiscount(offer)} />
          <InfoCard icon="clock" label="Expires" value={expiresInLabel(offer.expiresAt)} />
          <InfoCard icon="gift" label="Enrollment" value={offer.requiresEnrollment ? "Required" : "Not required"} />
        </View>

        <Section title="How it works" icon="list">
          <View style={styles.stepsCard}>
            {steps.map((s, i) => (
              <View key={s} style={[styles.stepRow, i < steps.length - 1 && styles.stepBorder]}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{s}</Text>
              </View>
            ))}
          </View>
        </Section>

        {terms.length > 0 && (
          <Section title="Terms">
            <View style={{ gap: 8 }}>
              {terms.map((t) => (
                <View key={t} style={styles.termRow}>
                  <Text style={styles.termBullet}>•</Text>
                  <Text style={styles.termText}>{t}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        <Pressable style={styles.redeemBtn} onPress={redeem}>
          <Text style={styles.redeemText}>Redeem Now</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, icon, children }: { title: string; icon?: keyof typeof Feather.glyphMap; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <View style={styles.sectionHeader}>
        {icon && <Feather name={icon} size={13} color={colors.accent} />}
        <Text style={styles.sectionLabel}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function InfoCard({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <Feather name={icon} size={13} color={colors.mutedForeground} style={{ marginBottom: 8 }} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 40 + TAB_BAR_CLEARANCE },
  hero: {
    borderRadius: 24, padding: 20, marginBottom: 20, overflow: "hidden",
    backgroundColor: "rgba(165,255,0,0.1)", borderWidth: 1, borderColor: "rgba(165,255,0,0.3)",
  },
  heroGlow: { position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: colors.highlight, opacity: 0.2 },
  heroTopRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  heroBadge: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(165,255,0,0.2)", alignItems: "center", justifyContent: "center" },
  heroBadgeText: { fontSize: 15, fontWeight: "900", color: colors.highlight },
  merchant: { fontSize: 10, color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1 },
  category: { fontSize: 10, color: colors.mutedForeground, marginTop: 2 },
  title: { fontSize: 22, fontWeight: "900", color: colors.foreground, lineHeight: 26 },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 22 },
  infoCard: { width: "47.5%", padding: 12, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  infoLabel: { fontSize: 9, color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: "800", color: colors.foreground },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: colors.mutedForeground, letterSpacing: 2, textTransform: "uppercase" },
  stepsCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, overflow: "hidden" },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  stepBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  stepNumber: { width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginTop: 1 },
  stepNumberText: { fontSize: 10, fontWeight: "800", color: colors.foreground },
  stepText: { flex: 1, fontSize: 13, color: "#d4d4d8", lineHeight: 19 },
  termRow: { flexDirection: "row", gap: 8 },
  termBullet: { color: colors.mutedForeground, fontSize: 12 },
  termText: { flex: 1, fontSize: 12, color: colors.mutedForeground, lineHeight: 18 },
  redeemBtn: { height: 56, borderRadius: 16, backgroundColor: colors.highlight, alignItems: "center", justifyContent: "center" },
  redeemText: { fontSize: 14, fontWeight: "900", color: colors.highlightForeground, letterSpacing: 0.5 },
});
