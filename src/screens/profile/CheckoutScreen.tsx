import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { getPlanDuration, getPlanTier } from "../../lib/plans";
import { setPremiumActive } from "../../lib/premium";
import type { ProfileStackParamList } from "../../navigation/types";

type PayMethod = "card" | "upi" | "netbanking" | "wallet";
type Stage = "select" | "processing" | "success";

const methods: { key: PayMethod; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "card", label: "Card", icon: "credit-card" },
  { key: "upi", label: "UPI", icon: "smartphone" },
  { key: "netbanking", label: "Netbanking", icon: "home" },
  { key: "wallet", label: "Wallet", icon: "briefcase" },
];

const wallets = ["Paytm", "Amazon Pay", "Mobikwik", "Freecharge"];

function generatePaymentId(seed: number) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  let n = seed;
  for (let i = 0; i < 14; i++) {
    n = (n * 9301 + 49297) % 233280;
    id += chars[n % chars.length];
  }
  return `pay_${id}`;
}

export function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<RouteProp<ProfileStackParamList, "Checkout">>();
  const { plan, months, price } = route.params;
  const tier = getPlanTier(plan);
  const duration = getPlanDuration(months);
  const planName = `RewardIQ ${tier.name}`;

  const [method, setMethod] = useState<PayMethod>("card");
  const [stage, setStage] = useState<Stage>("select");
  const [paymentId, setPaymentId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");

  const canPay =
    (method === "card" && cardNumber.replace(/\s/g, "").length === 16 && expiry.length === 5 && cvv.length === 3 && cardName.trim().length > 0) ||
    (method === "upi" && /^[\w.-]+@[\w]+$/.test(upiId)) ||
    (method === "netbanking") ||
    (method === "wallet" && !!selectedWallet);

  const close = () => navigation.navigate("ProfileHome");

  const pay = () => {
    if (!canPay) return;
    setStage("processing");
    setTimeout(() => {
      setPaymentId(generatePaymentId(Math.floor(Math.random() * 100000)));
      setPremiumActive();
      setStage("success");
    }, 1800);
  };

  if (stage === "processing") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.centerScreen}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.processingTitle}>Processing your payment…</Text>
          <Text style={styles.processingSub}>Please do not close the app.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (stage === "success") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.centerScreen}>
          <View style={styles.successIcon}>
            <Feather name="check-circle" size={36} color={colors.highlight} />
          </View>
          <Text style={styles.successTitle}>Payment Successful</Text>
          <Text style={styles.processingSub}>
            {planName} is now active for the next {duration.label.toLowerCase()}.
          </Text>
          <View style={styles.receiptCard}>
            <ReceiptRow label="Amount paid" value={`₹${price.toFixed(2)}`} />
            <ReceiptRow label="Payment ID" value={paymentId} mono />
            <ReceiptRow label="Method" value={methods.find((m) => m.key === method)?.label ?? ""} />
          </View>
          <Pressable style={styles.doneBtn} onPress={close}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>REWARDIQ AI</Text>
          <Text style={styles.headerSub}>{planName} · {duration.label}</Text>
        </View>
        <Pressable style={styles.closeBtn} onPress={close}>
          <Feather name="x" size={18} color={colors.foreground} />
        </Pressable>
      </View>
      <Text style={styles.bigPrice}>₹{price.toFixed(2)}</Text>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.methodRow}>
          {methods.map((m) => {
            const active = method === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMethod(m.key)}
                style={[styles.methodBtn, active && styles.methodBtnActive]}
              >
                <Feather name={m.icon} size={16} color={active ? colors.highlight : colors.mutedForeground} />
                <Text style={[styles.methodText, active && { color: colors.highlight }]}>{m.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {method === "card" && (
          <View style={{ gap: 12 }}>
            <Field label="Card Number">
              <TextInput
                value={cardNumber}
                onChangeText={(t) => {
                  const digits = t.replace(/\D/g, "").slice(0, 16);
                  setCardNumber(digits.replace(/(\d{4})(?=\d)/g, "$1 "));
                }}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                style={styles.input}
              />
            </Field>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Field label="Expiry" style={{ flex: 1 }}>
                <TextInput
                  value={expiry}
                  onChangeText={(t) => {
                    const digits = t.replace(/\D/g, "").slice(0, 4);
                    setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                  }}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </Field>
              <Field label="CVV" style={{ flex: 1 }}>
                <TextInput
                  value={cvv}
                  onChangeText={(t) => setCvv(t.replace(/\D/g, "").slice(0, 3))}
                  placeholder="123"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  secureTextEntry
                  style={styles.input}
                />
              </Field>
            </View>
            <Field label="Name on Card">
              <TextInput
                value={cardName}
                onChangeText={setCardName}
                placeholder="Arjun Khare"
                placeholderTextColor={colors.mutedForeground}
                style={styles.input}
              />
            </Field>
          </View>
        )}

        {method === "upi" && (
          <Field label="UPI ID">
            <TextInput
              value={upiId}
              onChangeText={setUpiId}
              placeholder="yourname@upi"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              style={styles.input}
            />
          </Field>
        )}

        {method === "netbanking" && (
          <View style={styles.rowCard}>
            <Feather name="info" size={14} color={colors.accent} />
            <Text style={styles.rowCardText}>You'll be redirected to your bank's secure login to complete payment.</Text>
          </View>
        )}

        {method === "wallet" && (
          <View style={{ gap: 8 }}>
            {wallets.map((w) => {
              const selected = selectedWallet === w;
              return (
                <Pressable
                  key={w}
                  onPress={() => setSelectedWallet(w)}
                  style={[styles.walletRow, selected && styles.walletRowSelected]}
                >
                  <Feather name="briefcase" size={14} color={colors.mutedForeground} />
                  <Text style={styles.walletText}>{w}</Text>
                  <View style={[styles.radio, selected && styles.radioSelected]} />
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.payBtn, !canPay && { opacity: 0.4 }]} onPress={pay} disabled={!canPay}>
          <Text style={styles.payBtnText}>Pay ₹{price.toFixed(2)}</Text>
        </Pressable>
        <View style={styles.securedRow}>
          <Feather name="lock" size={10} color={colors.mutedForeground} />
          <Text style={styles.securedText}>Secured payment (demo — no real charge)</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: object }) {
  return (
    <View style={style}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ReceiptRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={[styles.receiptValue, mono && { fontFamily: "monospace" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 8 },
  eyebrow: { fontSize: 10, fontWeight: "800", color: colors.accent, letterSpacing: 3 },
  headerSub: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  bigPrice: { fontSize: 32, fontWeight: "900", color: colors.foreground, paddingHorizontal: 20, marginTop: 16, marginBottom: 16 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  methodRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  methodBtn: { flex: 1, paddingVertical: 12, borderRadius: 16, alignItems: "center", gap: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  methodBtnActive: { borderColor: "rgba(165,255,0,0.4)", backgroundColor: "rgba(165,255,0,0.08)" },
  methodText: { fontSize: 10, fontWeight: "700", color: colors.mutedForeground },
  fieldLabel: { fontSize: 11, fontWeight: "700", color: colors.mutedForeground, marginBottom: 6 },
  input: { height: 48, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, color: colors.foreground, fontSize: 14 },
  rowCard: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 16, backgroundColor: "rgba(0,245,255,0.08)", borderWidth: 1, borderColor: "rgba(0,245,255,0.2)" },
  rowCardText: { flex: 1, fontSize: 12, color: "#d4d4d8", lineHeight: 17 },
  walletRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  walletRowSelected: { borderColor: "rgba(0,245,255,0.4)", backgroundColor: "rgba(0,245,255,0.06)" },
  walletText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.foreground },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.border },
  radioSelected: { borderColor: colors.accent, backgroundColor: colors.accent },
  footer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  payBtn: { height: 52, borderRadius: 16, backgroundColor: colors.highlight, alignItems: "center", justifyContent: "center" },
  payBtnText: { fontSize: 14, fontWeight: "900", color: colors.highlightForeground },
  securedRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5, marginTop: 10 },
  securedText: { fontSize: 10, color: colors.mutedForeground },
  centerScreen: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12 },
  processingTitle: { fontSize: 14, fontWeight: "700", color: colors.foreground, marginTop: 8 },
  processingSub: { fontSize: 12, color: colors.mutedForeground, textAlign: "center" },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(165,255,0,0.15)", alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 17, fontWeight: "800", color: colors.foreground },
  receiptCard: { width: "100%", borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginTop: 8, overflow: "hidden" },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  receiptLabel: { fontSize: 12, color: colors.mutedForeground },
  receiptValue: { fontSize: 12, fontWeight: "700", color: colors.foreground },
  doneBtn: { width: "100%", height: 50, borderRadius: 16, backgroundColor: colors.highlight, alignItems: "center", justifyContent: "center", marginTop: 8 },
  doneBtnText: { fontSize: 14, fontWeight: "900", color: colors.highlightForeground },
});
