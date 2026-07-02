import { useCallback, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { CreditCardVisual } from "../../components/CreditCardVisual";
import { EmptyState } from "../../components/EmptyState";
import { toCardFace, bestRewardRate, redeemableValue } from "../../lib/card-display";
import {
  getLiveOffers,
  getCardTransactions,
  addTransaction,
  removeCard,
  type Offer,
  type Transaction,
} from "../../lib/api-client";
import { useAppSelector } from "../../store/hooks";
import { ScreenHeader } from "../../components/ScreenHeader";
import type { CardsStackParamList } from "../../navigation/types";

type Tab = "offers" | "history" | "benefits";

export function CardDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CardsStackParamList>>();
  const route = useRoute<RouteProp<CardsStackParamList, "CardDetail">>();
  const { card } = route.params;
  const userId = useAppSelector((s) => s.user.current?.id);
  const [tab, setTab] = useState<Tab>("offers");
  const [logOpen, setLogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cardOffers, setCardOffers] = useState<Offer[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);

  const refresh = useCallback(() => {
    getLiveOffers()
      .then((all) => setCardOffers(all.filter((o) => o.cardProductId === card.cardProductId)))
      .catch(() => setCardOffers([]));
    if (userId) {
      getCardTransactions(userId, card.id).then(setHistory).catch(() => setHistory([]));
    }
  }, [card.cardProductId, card.id, userId]);

  useFocusEffect(useCallback(() => refresh(), [refresh]));

  const canLogSpend = Number(amount) > 0 && category.trim().length > 0;
  const annualFee = card.cardProduct.annualFee;

  const logSpend = async () => {
    if (!userId) return;
    setSubmitting(true);
    try {
      await addTransaction(userId, card.id, { amount: Number(amount), category: category.trim() });
      setAmount("");
      setCategory("");
      setLogOpen(false);
      refresh();
    } catch (err) {
      Alert.alert("Couldn't log spend", (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      `Remove ${card.cardProduct.name}?`,
      "This unlinks the card from your wallet. Its reward balance, offers, and history will no longer show in RewardIQ.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove Card",
          style: "destructive",
          onPress: async () => {
            try {
              await removeCard(userId!, card.id);
              navigation.navigate("CardsList");
            } catch (err) {
              Alert.alert("Couldn't remove card", (err as Error).message);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title={card.cardProduct.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <CreditCardVisual card={toCardFace(card)} style={{ marginBottom: 20 }} />

        <View style={styles.statsRow}>
          <StatBox icon="briefcase" label="Reward Balance" value={`₹${redeemableValue(card).toLocaleString("en-IN")}`} highlight />
          <StatBox icon="file-text" label="Annual Fee" value={!annualFee || Number(annualFee) === 0 ? "₹0" : `₹${Number(annualFee).toLocaleString("en-IN")}`} />
          <StatBox icon="percent" label="Cashback" value={`${bestRewardRate(card)}%`} />
        </View>

        <View style={styles.tabBar}>
          {(["offers", "history", "benefits"] as Tab[]).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tabBtn, tab === t && styles.tabBtnActive]}>
              <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
                {t === "offers" ? "Offers" : t === "history" ? "History" : "Benefits"}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === "offers" && (
          <View style={{ gap: 10 }}>
            {cardOffers.length === 0 ? (
              <EmptyState title="No live offers for this card" body="We'll notify you the moment a new offer lands." />
            ) : (
              cardOffers.map((o) => (
                <View key={o.id} style={styles.rowCard}>
                  <Text style={styles.rowTitle}>{o.description}</Text>
                  <Text style={styles.rowSub}>
                    {o.merchant?.name} · ends {new Date(o.expiresAt).toLocaleDateString("en-IN")}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {tab === "history" && (
          <View style={{ gap: 8 }}>
            <Pressable style={styles.logSpendBtn} onPress={() => setLogOpen(true)}>
              <Feather name="plus" size={14} color={colors.mutedForeground} />
              <Text style={styles.logSpendText}>Log a Spend</Text>
            </Pressable>
            {history.length === 0 ? (
              <EmptyState title="No transactions yet" body="Spend on this card and it'll show up here." />
            ) : (
              history.map((h) => (
                <View key={h.id} style={styles.txRow}>
                  <View style={styles.txAvatar}>
                    <Text style={styles.txAvatarText}>{(h.merchant?.name ?? h.category)[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txMerchant}>{h.merchant?.name ?? h.category}</Text>
                    <Text style={styles.txDate}>
                      {new Date(h.enteredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </Text>
                  </View>
                  <Text style={styles.txAmount}>₹{Number(h.amount).toLocaleString("en-IN")}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {tab === "benefits" && (
          <View style={styles.benefitsCard}>
            {card.cardProduct.benefits.length === 0 ? (
              <EmptyState title="No benefits on file" body="Nothing curated for this card yet." />
            ) : (
              card.cardProduct.benefits.map((b, i) => (
                <View key={b} style={[styles.benefitRow, i < card.cardProduct.benefits.length - 1 && styles.benefitBorder]}>
                  <Feather name="gift" size={14} color={colors.highlight} />
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))
            )}
          </View>
        )}

        <Pressable style={styles.removeBtn} onPress={handleRemove}>
          <Feather name="trash-2" size={15} color={colors.destructive} />
          <Text style={styles.removeText}>Remove Card</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={logOpen} transparent animationType="slide" onRequestClose={() => setLogOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log a Spend</Text>
            <Text style={styles.modalSubtitle}>
              Manual entry for now — real bank statement sync is a planned upgrade.
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Amount (₹)"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
              style={styles.modalInput}
            />
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="Category (e.g. dining, travel)"
              placeholderTextColor={colors.mutedForeground}
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setLogOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSubmit, (!canLogSpend || submitting) && { opacity: 0.4 }]}
                onPress={logSpend}
                disabled={!canLogSpend || submitting}
              >
                <Text style={styles.modalSubmitText}>{submitting ? "Logging…" : "Log Spend"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatBox({ icon, label, value, highlight }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.statBox}>
      <Feather name={icon} size={13} color={colors.mutedForeground} style={{ marginBottom: 8 }} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && { color: colors.highlight }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12 },
  statLabel: { fontSize: 9, color: colors.mutedForeground, letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" },
  statValue: { fontSize: 13, fontWeight: "800", color: colors.foreground },
  tabBar: { flexDirection: "row", gap: 4, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: "center" },
  tabBtnActive: { backgroundColor: "rgba(255,255,255,0.08)" },
  tabBtnText: { fontSize: 12, fontWeight: "700", color: colors.mutedForeground },
  tabBtnTextActive: { color: colors.foreground },
  rowCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14 },
  rowTitle: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  rowSub: { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
  logSpendBtn: {
    height: 44, borderRadius: 16, borderWidth: 2, borderStyle: "dashed", borderColor: "rgba(255,255,255,0.15)",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4,
  },
  logSpendText: { fontSize: 12, fontWeight: "700", color: colors.mutedForeground },
  txRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  txAvatar: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  txAvatarText: { fontSize: 11, fontWeight: "800", color: colors.foreground },
  txMerchant: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  txDate: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  txAmount: { fontSize: 13, fontWeight: "800", color: colors.foreground },
  benefitsCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, overflow: "hidden" },
  benefitRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14 },
  benefitBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  benefitText: { flex: 1, fontSize: 12.5, color: colors.foreground, lineHeight: 18 },
  removeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 16,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: "rgba(229,72,77,0.25)", marginTop: 24,
  },
  removeText: { fontSize: 13, fontWeight: "700", color: colors.destructive },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 10, borderWidth: 1, borderColor: colors.border },
  modalTitle: { fontSize: 16, fontWeight: "800", color: colors.foreground },
  modalSubtitle: { fontSize: 12, color: colors.mutedForeground, marginBottom: 6 },
  modalInput: { height: 48, borderRadius: 14, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, color: colors.foreground },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 6 },
  modalCancel: { flex: 1, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  modalCancelText: { color: colors.mutedForeground, fontWeight: "700", fontSize: 13 },
  modalSubmit: { flex: 1, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.highlight },
  modalSubmitText: { color: colors.highlightForeground, fontWeight: "900", fontSize: 13 },
});
