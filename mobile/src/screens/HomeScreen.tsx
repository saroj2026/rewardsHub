import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { CreditCardVisual } from "../components/CreditCardVisual";
import { toCardFace, sumActivePoints } from "../lib/card-display";
import { getUserCards, getLiveOffers, getUserTransactions, type Card, type Offer, type Transaction } from "../lib/api-client";
import { useAppSelector } from "../store/hooks";
import { TAB_BAR_CLEARANCE } from "../theme/layout";
import type { MainTabParamList, RootStackParamList } from "../navigation/types";

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Home">,
  NativeStackNavigationProp<RootStackParamList>
>;

const quickActions = [
  { icon: "plus" as const, label: "Add Card", go: (n: Nav) => n.navigate("Cards", { screen: "AddCard" }) },
  { icon: "search" as const, label: "Merchants", go: (n: Nav) => n.navigate("Merchants", { screen: "MerchantsList" }) },
  { icon: "bar-chart-2" as const, label: "Analytics", go: (n: Nav) => n.navigate("Profile", { screen: "Analytics" }) },
  { icon: "tag" as const, label: "Offers", go: (n: Nav) => n.navigate("Offers", { screen: "OffersList" }) },
];

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const userId = useAppSelector((s) => s.user.current?.id);
  const [cards, setCards] = useState<Card[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [recentSpend, setRecentSpend] = useState<(Transaction & { card: Card })[]>([]);

  useFocusEffect(
    useCallback(() => {
      getLiveOffers().then(setOffers).catch(() => setOffers([]));
      if (!userId) {
        setCards([]);
        setRecentSpend([]);
        return;
      }
      getUserCards(userId).then(setCards).catch(() => setCards([]));
      getUserTransactions(userId, 4).then(setRecentSpend).catch(() => setRecentSpend([]));
    }, [userId]),
  );

  const points = cards.reduce((s, c) => s + sumActivePoints(c), 0);
  const value = Math.round(points * 0.35);
  const bestOffers = offers.slice(0, 2);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>REWARDIQ · AI</Text>
            <Text style={styles.h1}>Welcome back</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconCircle}>
              <Feather name="bell" size={16} color="rgba(255,255,255,0.7)" />
              <View style={styles.notifDot} />
            </Pressable>
            <Pressable style={styles.avatarCircle} onPress={() => navigation.navigate("Profile")}>
              <Ionicons name="sparkles" size={16} color={colors.accent} />
            </Pressable>
          </View>
        </View>

        {!userId && (
          <Pressable
            style={styles.signInBanner}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Feather name="log-in" size={14} color={colors.accent} />
            <Text style={styles.signInBannerText}>Sign in to sync your cards, points & offers</Text>
          </Pressable>
        )}

        {/* Wallet value hero */}
        <View style={styles.hero}>
          <View style={styles.heroGlowA} />
          <View style={styles.heroGlowB} />
          <Text style={styles.heroLabel}>WALLET VALUE</Text>
          <Text style={styles.heroValue}>₹{value.toLocaleString("en-IN")}</Text>
          <View style={styles.heroTrendRow}>
            <Feather name="trending-up" size={12} color={colors.highlight} />
            <Text style={styles.heroTrendText}>
              Estimated redeemable value across {cards.length} card{cards.length === 1 ? "" : "s"}
            </Text>
          </View>
          <View style={styles.heroStatsRow}>
            <Stat label="Points" value={`${(points / 1000).toFixed(1)}k`} />
            <Stat label="Cards" value={String(cards.length)} />
            <Stat label="Offers" value={String(offers.length)} />
          </View>
        </View>

        {/* Merchant search */}
        <Pressable style={styles.searchRow} onPress={() => navigation.navigate("Merchants", { screen: "MerchantsList" })}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <Text style={styles.searchPlaceholder}>Where are you shopping?</Text>
          <View style={styles.searchScanBadge}>
            <Feather name="maximize" size={14} color={colors.mutedForeground} />
          </View>
        </Pressable>

        {/* Quick actions */}
        <SectionLabel>Quick Actions</SectionLabel>
        <View style={styles.quickGrid}>
          {quickActions.map((qa) => (
            <Pressable key={qa.label} style={styles.quickItem} onPress={() => qa.go(navigation)}>
              <View style={styles.quickIconWrap}>
                <Feather name={qa.icon} size={16} color={colors.accent} />
              </View>
              <Text style={styles.quickLabel}>{qa.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* AI recommendation banner */}
        <SectionRow title="AI Recommendation" right={<LiveBadge />} />
        <Pressable style={styles.aiCard} onPress={() => navigation.navigate("AI")}>
          <View style={styles.aiGlow} />
          <View style={styles.aiIconWrap}>
            <Ionicons name="sparkles" size={20} color={colors.highlight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiEyebrow}>ASK THE AI ASSISTANT</Text>
            <Text style={styles.aiTitle}>
              Tell us where you're spending for a live best-card recommendation
            </Text>
          </View>
          <Feather name="arrow-up-right" size={16} color={colors.mutedForeground} />
        </Pressable>

        {/* Cards preview */}
        <SectionRow
          title="Your Cards"
          right={
            <Pressable onPress={() => navigation.navigate("Cards", { screen: "CardsList" })}>
              <Text style={styles.link}>View all →</Text>
            </Pressable>
          }
        />
        {cards.length === 0 ? (
          <View style={{ marginBottom: 28 }}>
            <EmptyRow text="No cards linked yet" />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 20 }}
            style={{ marginBottom: 28 }}
          >
            {cards.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => navigation.navigate("Cards", { screen: "CardDetail", params: { card: c } })}
              >
                <CreditCardVisual card={toCardFace(c)} style={{ width: 220 }} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Best offers */}
        <SectionRow
          title="Today's Best Offers"
          right={
            <Pressable onPress={() => navigation.navigate("Offers", { screen: "OffersList" })}>
              <Text style={styles.link}>View all →</Text>
            </Pressable>
          }
        />
        <View style={{ gap: 10, marginBottom: 28 }}>
          {bestOffers.length === 0 ? (
            <EmptyRow text="No live offers right now" />
          ) : (
            bestOffers.map((o) => (
              <Pressable
                key={o.id}
                style={styles.offerRow}
                onPress={() => navigation.navigate("Offers", { screen: "OfferDetail", params: { offer: o } })}
              >
                <View style={styles.offerBadge}>
                  <Text style={styles.offerBadgeText}>{o.merchant?.name?.[0] ?? "?"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.offerTitle} numberOfLines={1}>{o.description}</Text>
                  <Text style={styles.offerSub} numberOfLines={1}>
                    {o.merchant?.name} · {o.cardProduct?.name ?? "Any card"}
                  </Text>
                </View>
                <Feather name="arrow-up-right" size={16} color={colors.mutedForeground} />
              </Pressable>
            ))
          )}
        </View>

        {/* Recent spend */}
        <View style={styles.recentHeader}>
          <Feather name="file-text" size={13} color={colors.mutedForeground} />
          <SectionLabel noMargin>Recent Spend</SectionLabel>
        </View>
        {recentSpend.length === 0 ? (
          <EmptyRow text="No transactions yet" />
        ) : (
          <View style={styles.recentList}>
            {recentSpend.map((tx, i) => (
              <View
                key={tx.id}
                style={[styles.recentRow, i < recentSpend.length - 1 && styles.recentRowBorder]}
              >
                <View style={styles.recentAvatar}>
                  <Text style={styles.recentAvatarText}>{(tx.merchant?.name ?? tx.category)[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentMerchant}>{tx.merchant?.name ?? tx.category}</Text>
                  <Text style={styles.recentMeta}>
                    {tx.card.cardProduct.name} · {new Date(tx.enteredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </Text>
                </View>
                <Text style={styles.recentAmount}>₹{Number(tx.amount).toLocaleString("en-IN")}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function SectionLabel({ children, noMargin }: { children: React.ReactNode; noMargin?: boolean }) {
  return <Text style={[styles.sectionLabel, noMargin && { marginBottom: 0 }]}>{children}</Text>;
}

function SectionRow({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {right}
    </View>
  );
}

function LiveBadge() {
  return (
    <View style={styles.liveBadge}>
      <Text style={styles.liveBadgeText}>● AI LIVE</Text>
    </View>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <View style={styles.emptyRow}>
      <Text style={styles.emptyRowText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 + TAB_BAR_CLEARANCE },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  eyebrow: { fontSize: 10, fontWeight: "800", color: colors.accent, letterSpacing: 3 },
  h1: { fontSize: 21, fontWeight: "800", color: colors.foreground, marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center",
  },
  notifDot: { position: "absolute", top: 9, right: 9, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.highlight },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,245,255,0.15)",
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center",
  },
  signInBanner: {
    flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(0,245,255,0.1)",
    borderWidth: 1, borderColor: "rgba(0,245,255,0.25)", borderRadius: 14, padding: 12, marginBottom: 16,
  },
  signInBannerText: { flex: 1, fontSize: 12, fontWeight: "600", color: colors.accent },
  hero: {
    borderRadius: 24, backgroundColor: colors.surface, padding: 22, marginBottom: 20,
    borderWidth: 1, borderColor: colors.border, overflow: "hidden",
  },
  heroGlowA: { position: "absolute", right: -40, top: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: colors.accent, opacity: 0.12 },
  heroGlowB: { position: "absolute", left: -24, bottom: -24, width: 128, height: 128, borderRadius: 64, backgroundColor: colors.highlight, opacity: 0.1 },
  heroLabel: { fontSize: 11, fontWeight: "700", color: colors.mutedForeground, letterSpacing: 2, marginBottom: 4 },
  heroValue: { fontSize: 34, fontWeight: "900", color: colors.foreground, letterSpacing: -1 },
  heroTrendRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, marginBottom: 18 },
  heroTrendText: { fontSize: 12, fontWeight: "600", color: colors.highlight },
  heroStatsRow: {
    flexDirection: "row", justifyContent: "space-between", paddingTop: 16,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  statLabel: { fontSize: 10, color: colors.mutedForeground, letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" },
  statValue: { fontSize: 15, fontWeight: "800", color: colors.foreground },
  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 10, height: 52, borderRadius: 16,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, marginBottom: 24,
  },
  searchPlaceholder: { flex: 1, color: colors.mutedForeground, fontSize: 13 },
  searchScanBadge: { width: 30, height: 30, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: colors.mutedForeground, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },
  quickGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  quickItem: {
    width: "23%", alignItems: "center", gap: 8, paddingVertical: 12, borderRadius: 16,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  quickIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 10, fontWeight: "700", color: colors.mutedForeground, textAlign: "center" },
  liveBadge: { backgroundColor: "rgba(0,245,255,0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  liveBadgeText: { fontSize: 9, fontWeight: "800", color: colors.accent, letterSpacing: 1 },
  aiCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 18, borderRadius: 24,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: "rgba(0,245,255,0.25)", marginBottom: 28, overflow: "hidden",
  },
  aiGlow: { position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: colors.accent, opacity: 0.1 },
  aiIconWrap: { width: 46, height: 46, borderRadius: 16, backgroundColor: "rgba(165,255,0,0.15)", alignItems: "center", justifyContent: "center" },
  aiEyebrow: { fontSize: 10, color: colors.mutedForeground, letterSpacing: 1.5, marginBottom: 4 },
  aiTitle: { fontSize: 13, fontWeight: "700", color: colors.foreground, lineHeight: 18 },
  link: { fontSize: 12, fontWeight: "700", color: colors.accent },
  offerRow: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  offerBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(165,255,0,0.15)", alignItems: "center", justifyContent: "center" },
  offerBadgeText: { fontSize: 14, fontWeight: "900", color: colors.highlight },
  offerTitle: { fontSize: 13, fontWeight: "800", color: colors.foreground },
  offerSub: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  recentHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  recentList: { borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  recentRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  recentRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  recentAvatar: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  recentAvatarText: { fontSize: 12, fontWeight: "800", color: colors.foreground },
  recentMerchant: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  recentMeta: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  recentAmount: { fontSize: 13, fontWeight: "800", color: colors.foreground },
  emptyRow: { padding: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  emptyRowText: { fontSize: 12, color: colors.mutedForeground },
});
