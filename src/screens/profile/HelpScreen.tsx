import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { ScreenHeader } from "../../components/ScreenHeader";
import { TAB_BAR_CLEARANCE } from "../../theme/layout";
import type { MainTabParamList, ProfileStackParamList } from "../../navigation/types";

const faqs = [
  {
    q: "How does RewardIQ pick the best card for me?",
    a: "Whenever you ask the AI Assistant, RewardIQ compares your linked cards' reward rates for that spend category and amount, then recommends the one that earns you the most cashback or points.",
  },
  {
    q: "Is my card information safe?",
    a: "RewardIQ never stores your full card number, CVV, or PIN — only the last 4 digits, for display. See Profile → Privacy & Security for the full policy.",
  },
  {
    q: "How do I add or remove a card?",
    a: "Go to the Cards tab and tap \"Link a new card\" to add one. To remove a card, open its Card Details page and use the Remove Card option there.",
  },
  {
    q: "What is Family Circle?",
    a: "Family Circle lets you pool reward value visibility and share cards with people you invite. Manage it from Profile → Family Circle.",
  },
  {
    q: "How does App Lock work?",
    a: "Enable it from Profile → Privacy & Security to require Fingerprint or Face unlock every time you open RewardIQ. Your biometric data stays on your device.",
  },
  {
    q: "Why do points expire?",
    a: "Expiry rules are set by your card issuer, not RewardIQ. We surface an alert whenever points are close to expiring so you don't lose value.",
  },
];

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, "Help">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function HelpScreen() {
  const navigation = useNavigation<Nav>();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Help & Support" onBack={() => navigation.navigate("ProfileHome")} />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.aiCard} onPress={() => navigation.navigate("AI")}>
          <View style={styles.aiIconWrap}>
            <Ionicons name="sparkles" size={18} color={colors.highlightForeground} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>Ask the AI Assistant</Text>
            <Text style={styles.aiBody}>Fastest way to get answers about cards, offers, and recommendations.</Text>
          </View>
        </Pressable>

        <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
        <View style={styles.faqCard}>
          {faqs.map((f, i) => {
            const open = openIndex === i;
            return (
              <View key={f.q} style={[styles.faqItem, i < faqs.length - 1 && styles.faqItemBorder]}>
                <Pressable style={styles.faqQuestionRow} onPress={() => setOpenIndex(open ? null : i)}>
                  <Text style={styles.faqQuestion}>{f.q}</Text>
                  <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
                </Pressable>
                {open && <Text style={styles.faqAnswer}>{f.a}</Text>}
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Contact Support</Text>
        <View style={styles.contactCard}>
          <ContactRow icon="message-circle" label="Live Chat" value="Avg reply in 2 min" onPress={() => Alert.alert("Live Chat", "Chat support isn't available in this preview.")} />
          <ContactRow icon="mail" label="Email" value="support@rewardiq.app" onPress={() => Linking.openURL("mailto:support@rewardiq.app")} />
          <ContactRow icon="phone" label="Call Us" value="+91 1800-123-4567" onPress={() => Linking.openURL("tel:+911800123456")} last />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactRow({
  icon,
  label,
  value,
  onPress,
  last,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable style={[styles.contactRow, !last && styles.contactRowBorder]} onPress={onPress}>
      <View style={styles.contactIconWrap}>
        <Feather name={icon} size={15} color="#d4d4d8" />
      </View>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactValue}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 40 + TAB_BAR_CLEARANCE },
  aiCard: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 20, marginBottom: 22,
    backgroundColor: "rgba(165,255,0,0.08)", borderWidth: 1, borderColor: "rgba(165,255,0,0.3)",
  },
  aiIconWrap: { width: 40, height: 40, borderRadius: 16, backgroundColor: colors.highlight, alignItems: "center", justifyContent: "center" },
  aiTitle: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  aiBody: { fontSize: 11, color: colors.mutedForeground, marginTop: 3, lineHeight: 15 },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: colors.mutedForeground, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },
  faqCard: { borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, marginBottom: 22, overflow: "hidden" },
  faqItem: { paddingVertical: 14 },
  faqItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  faqQuestionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  faqQuestion: { flex: 1, fontSize: 13, fontWeight: "700", color: colors.foreground },
  faqAnswer: { fontSize: 12.5, color: colors.mutedForeground, lineHeight: 18, marginTop: 10 },
  contactCard: { borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 15 },
  contactRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  contactIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  contactLabel: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.foreground },
  contactValue: { fontSize: 11, color: colors.mutedForeground },
});
