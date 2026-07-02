import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { EmptyState } from "../../components/EmptyState";
import { ScreenHeader } from "../../components/ScreenHeader";
import {
  getMerchant,
  getBestCardRecommendation,
  getOffersForMerchant,
  addTransaction,
  type Merchant,
  type RecommendationResult,
  type Offer,
} from "../../lib/api-client";
import { useAppSelector } from "../../store/hooks";
import type { MerchantsStackParamList } from "../../navigation/types";

export function MerchantDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MerchantsStackParamList>>();
  const route = useRoute<RouteProp<MerchantsStackParamList, "MerchantDetail">>();
  const { merchantId } = route.params;
  const userId = useAppSelector((s) => s.user.current?.id);

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [amount, setAmount] = useState("1000");
  const [rec, setRec] = useState<RecommendationResult | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [logging, setLogging] = useState(false);

  const parsedAmount = Math.max(parseFloat(amount.replace(/,/g, "")) || 0, 0);

  useEffect(() => {
    getMerchant(merchantId).then(setMerchant).catch(() => setMerchant(null));
    getOffersForMerchant(merchantId).then(setOffers).catch(() => setOffers([]));
  }, [merchantId]);

  const loadRec = useCallback(() => {
    if (!userId || parsedAmount <= 0) {
      setRec(null);
      return;
    }
    setRecLoading(true);
    getBestCardRecommendation(userId, merchantId, parsedAmount)
      .then(setRec)
      .catch(() => setRec(null))
      .finally(() => setRecLoading(false));
  }, [userId, merchantId, parsedAmount]);

  useEffect(() => {
    const t = setTimeout(loadRec, 400);
    return () => clearTimeout(t);
  }, [loadRec]);

  const logSpend = async () => {
    if (!userId || !rec?.best) return;
    setLogging(true);
    try {
      await addTransaction(userId, rec.best.card.id, {
        amount: parsedAmount,
        category: rec.best.category,
        merchantId,
      });
      Alert.alert("Spend logged", `₹${parsedAmount.toLocaleString("en-IN")} at ${merchant?.name ?? "merchant"} on ${rec.best.card.cardProduct.name}.`);
    } catch (err) {
      Alert.alert("Couldn't log spend", (err as Error).message);
    } finally {
      setLogging(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title={merchant?.name ?? "Merchant"} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Amount you're spending</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amountPrefix}>₹</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.amountInput}
          />
        </View>

        {!userId ? (
          <EmptyState title="Sign in for AI recommendations" body="Link a card and sign in to see which card earns you the most here." />
        ) : recLoading ? (
          <View style={styles.recCardEmpty}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : !rec || !rec.best ? (
          <EmptyState title="No recommendation yet" body="Link a card and enter an amount to see which one earns you the most here." />
        ) : (
          <View style={styles.recCard}>
            <View style={styles.recGlow} />
            <View style={styles.recHeaderRow}>
              <Ionicons name="sparkles" size={14} color={colors.highlight} />
              <Text style={styles.recEyebrow}>AI RECOMMENDATION</Text>
            </View>
            <Text style={styles.recTitle}>
              Use <Text style={{ color: colors.highlight }}>{rec.best.card.cardProduct.name}</Text>
            </Text>
            <View style={styles.recStatsRow}>
              <View>
                <Text style={styles.recStatLabel}>REWARD RATE</Text>
                <Text style={styles.recStatValue}>{rec.best.rate}%</Text>
              </View>
              <View>
                <Text style={styles.recStatLabel}>CASHBACK</Text>
                <Text style={[styles.recStatValue, { color: colors.highlight }]}>₹{rec.best.value.toLocaleString("en-IN")}</Text>
              </View>
            </View>
            {rec.runnerUp && rec.diff > 0 && (
              <Text style={styles.recCompare}>
                Better than <Text style={{ fontWeight: "700", color: colors.foreground }}>{rec.runnerUp.card.cardProduct.name}</Text> by{" "}
                <Text style={{ fontWeight: "700", color: colors.highlight }}>₹{rec.diff.toLocaleString("en-IN")}</Text>
              </Text>
            )}
            <Pressable style={[styles.logBtn, logging && { opacity: 0.5 }]} onPress={logSpend} disabled={logging}>
              {logging ? (
                <ActivityIndicator color={colors.highlightForeground} />
              ) : (
                <Text style={styles.logBtnText}>Log this Spend on {rec.best.card.cardProduct.name}</Text>
              )}
            </Pressable>
          </View>
        )}

        {rec && rec.ranked.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Eligible Cards</Text>
            <View style={{ gap: 8, marginBottom: 22 }}>
              {rec.ranked.map((r, i) => (
                <View key={r.card.id} style={[styles.rankedRow, i === 0 && styles.rankedRowBest]}>
                  <View style={styles.rankedIconWrap}>
                    <Feather name="credit-card" size={14} color="#d4d4d8" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rankedName}>{r.card.cardProduct.name}</Text>
                    <Text style={styles.rankedMeta}>{r.rate}% · {r.eligible ? "Bonus category" : "Base rate"}</Text>
                  </View>
                  <Text style={[styles.rankedValue, i === 0 && { color: colors.highlight }]}>₹{r.value.toLocaleString("en-IN")}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>Available Offers</Text>
        {offers.length === 0 ? (
          <EmptyState title="No offers here right now" />
        ) : (
          <View style={{ gap: 8 }}>
            {offers.map((o) => (
              <View key={o.id} style={styles.offerRow}>
                <View style={styles.offerTopRow}>
                  <Text style={styles.offerTitle}>{o.description}</Text>
                  <Feather name="zap" size={13} color={colors.accent} />
                </View>
                <Text style={styles.offerExpiry}>ends {new Date(o.expiresAt).toLocaleDateString("en-IN")}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  label: { fontSize: 10, fontWeight: "800", color: colors.mutedForeground, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 },
  amountRow: { flexDirection: "row", alignItems: "center", height: 56, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, marginBottom: 20 },
  amountPrefix: { fontSize: 20, fontWeight: "800", color: colors.mutedForeground, marginRight: 6 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: "900", color: colors.foreground },
  recCardEmpty: { height: 140, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", marginBottom: 22 },
  recCard: { borderRadius: 24, padding: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: "rgba(165,255,0,0.3)", marginBottom: 22, overflow: "hidden" },
  recGlow: { position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: colors.highlight, opacity: 0.15 },
  recHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  recEyebrow: { fontSize: 10, fontWeight: "800", color: colors.highlight, letterSpacing: 1.5 },
  recTitle: { fontSize: 18, fontWeight: "900", color: colors.foreground, lineHeight: 24 },
  recStatsRow: { flexDirection: "row", gap: 24, marginTop: 14 },
  recStatLabel: { fontSize: 9, color: colors.mutedForeground, letterSpacing: 1, marginBottom: 4 },
  recStatValue: { fontSize: 22, fontWeight: "900", color: colors.foreground },
  recCompare: { fontSize: 12, color: colors.mutedForeground, marginTop: 12 },
  logBtn: { height: 48, borderRadius: 16, backgroundColor: colors.highlight, alignItems: "center", justifyContent: "center", marginTop: 16, paddingHorizontal: 10 },
  logBtnText: { fontSize: 12.5, fontWeight: "800", color: colors.highlightForeground, textAlign: "center" },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: colors.mutedForeground, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },
  rankedRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  rankedRowBest: { backgroundColor: "rgba(165,255,0,0.08)", borderColor: "rgba(165,255,0,0.3)" },
  rankedIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  rankedName: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  rankedMeta: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  rankedValue: { fontSize: 13, fontWeight: "900", color: colors.foreground },
  offerRow: { padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  offerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  offerTitle: { flex: 1, fontSize: 13, fontWeight: "700", color: colors.foreground, marginRight: 8 },
  offerExpiry: { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
});
