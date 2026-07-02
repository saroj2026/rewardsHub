import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, type CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { EmptyState } from "../../components/EmptyState";
import { getLiveOffers, type Offer } from "../../lib/api-client";
import { describeDiscount, expiresInLabel } from "../../lib/offer-display";
import type { OffersStackParamList, MainTabParamList } from "../../navigation/types";

const categories = ["All", "Dining", "Travel", "Shopping", "Entertainment", "Fuel"] as const;

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<OffersStackParamList, "OffersList">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function OffersListScreen() {
  const navigation = useNavigation<Nav>();
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getLiveOffers(category === "All" ? undefined : category)
      .then(setOffers)
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, [category]);

  useFocusEffect(useCallback(() => load(), [load]));

  const featured = category === "All" ? offers[0] : undefined;
  const list = featured ? offers.slice(1) : offers;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconButton} onPress={() => navigation.navigate("Home")} accessibilityLabel="Back">
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <Text style={styles.h1}>Live Offers</Text>
        <View style={styles.iconButton} />
      </View>

      {featured && (
        <Pressable
          style={styles.featured}
          onPress={() => navigation.navigate("OfferDetail", { offer: featured })}
        >
          <View style={styles.featuredGlow} />
          <Text style={styles.featuredEyebrow}>FEATURED</Text>
          <Text style={styles.featuredTitle}>{featured.description}</Text>
          <Text style={styles.featuredSub}>
            {featured.merchant?.name} · with your {featured.cardProduct?.name ?? "eligible card"}
          </Text>
        </Pressable>
      )}

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[...categories]}
        keyExtractor={(c) => c}
        style={{ flexGrow: 0, marginBottom: 16 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
        renderItem={({ item }) => {
          const active = category === item;
          return (
            <Pressable
              style={[styles.categoryPill, active && styles.categoryPillActive]}
              onPress={() => setCategory(item)}
            >
              <Text style={[styles.categoryPillText, active && styles.categoryPillTextActive]}>{item}</Text>
            </Pressable>
          );
        }}
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 12 }}
          ListEmptyComponent={
            <EmptyState title="No offers in this category" body="Check back soon, or browse a different category above." />
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.offerRow}
              onPress={() => navigation.navigate("OfferDetail", { offer: item })}
            >
              <View style={styles.rowTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.merchant?.name?.[0] ?? "?"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.merchant}>{item.merchant?.name}</Text>
                  <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
                </View>
                <View style={styles.liveBadge}>
                  <Feather name="zap" size={9} color={colors.highlight} />
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              </View>
              <View style={styles.rowBottom}>
                <Text style={styles.rowBottomText}>
                  {describeDiscount(item)} · {item.cardProduct?.name ?? "Any card"}
                </Text>
                <View style={styles.expiryWrap}>
                  <Feather name="clock" size={11} color={colors.mutedForeground} />
                  <Text style={styles.rowBottomText}>{expiresInLabel(item.expiresAt)}</Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  h1: { fontSize: 17, fontWeight: "800", color: colors.foreground },
  featured: {
    marginHorizontal: 20, marginBottom: 16, padding: 20, borderRadius: 24, overflow: "hidden",
    backgroundColor: "rgba(165,255,0,0.1)", borderWidth: 1, borderColor: "rgba(165,255,0,0.3)",
  },
  featuredGlow: { position: "absolute", right: -32, top: -32, width: 128, height: 128, borderRadius: 64, backgroundColor: colors.highlight, opacity: 0.2 },
  featuredEyebrow: { fontSize: 10, fontWeight: "800", color: colors.highlight, letterSpacing: 2, marginBottom: 6 },
  featuredTitle: { fontSize: 22, fontWeight: "900", color: colors.foreground, lineHeight: 26 },
  featuredSub: { fontSize: 12, color: colors.mutedForeground, marginTop: 8 },
  categoryPill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  categoryPillActive: { backgroundColor: "#fff", borderColor: "#fff" },
  categoryPillText: { fontSize: 12, fontWeight: "700", color: colors.mutedForeground },
  categoryPillTextActive: { color: "#000" },
  offerRow: { padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(165,255,0,0.15)", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 14, fontWeight: "900", color: colors.highlight },
  merchant: { fontSize: 13, fontWeight: "800", color: colors.foreground },
  description: { fontSize: 11.5, color: colors.mutedForeground, marginTop: 2 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(165,255,0,0.15)", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 },
  liveBadgeText: { fontSize: 8, fontWeight: "800", color: colors.highlight, letterSpacing: 0.5 },
  rowBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  rowBottomText: { fontSize: 11, color: colors.mutedForeground },
  expiryWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
});
