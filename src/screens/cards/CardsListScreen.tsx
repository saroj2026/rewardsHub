import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, type CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { CreditCardVisual } from "../../components/CreditCardVisual";
import { EmptyState } from "../../components/EmptyState";
import { toCardFace, bestRewardRate, bestRewardCategory, sumActivePoints } from "../../lib/card-display";
import { getUserCards, type Card } from "../../lib/api-client";
import { useAppSelector } from "../../store/hooks";
import type { CardsStackParamList, MainTabParamList } from "../../navigation/types";

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<CardsStackParamList, "CardsList">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function CardsListScreen() {
  const navigation = useNavigation<Nav>();
  const userId = useAppSelector((s) => s.user.current?.id);
  const [cards, setCards] = useState<Card[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        setCards([]);
        return;
      }
      getUserCards(userId).then(setCards).catch(() => setCards([]));
    }, [userId]),
  );

  const totalValue = Math.round(cards.reduce((s, c) => s + sumActivePoints(c), 0) * 0.35);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerRow}>
        <Pressable
          style={styles.iconButton}
          onPress={() => navigation.navigate("Home")}
          accessibilityLabel="Back"
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <Text style={styles.h1}>Wallet</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate("AddCard")}
          accessibilityLabel="Add card"
        >
          <Feather name="plus" size={20} color={colors.highlightForeground} />
        </Pressable>
      </View>

      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.summaryEyebrow}>{cards.length} CARDS LINKED</Text>
          <Text style={styles.summaryValue}>₹{totalValue.toLocaleString("en-IN")}</Text>
          <Text style={styles.summaryCaption}>Redeemable value</Text>
        </View>
      </View>

      {!userId ? (
        <View style={{ paddingHorizontal: 20 }}>
          <EmptyState title="Sign in to see your cards" body="Your linked cards and reward balances show up here once you're signed in." />
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 20 }}
          ListEmptyComponent={
            <EmptyState title="No cards linked yet" body="Link a card to start tracking rewards and getting AI recommendations." />
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate("CardDetail", { card: item })} style={{ gap: 10 }}>
              <CreditCardVisual card={toCardFace(item)} />
              <View style={styles.statsGrid}>
                <MiniStat label="Reward Rate" value={`${bestRewardRate(item)}%`} highlight />
                <MiniStat label="Points Balance" value={sumActivePoints(item).toLocaleString("en-IN")} />
                <MiniStat label="Best For" value={bestRewardCategory(item)} />
              </View>
            </Pressable>
          )}
          ListFooterComponent={
            <Pressable style={styles.linkCard} onPress={() => navigation.navigate("AddCard")}>
              <Feather name="plus" size={14} color={colors.mutedForeground} />
              <Text style={styles.linkCardText}>Link a new card</Text>
            </Pressable>
          }
        />
      )}
    </SafeAreaView>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={[styles.miniStatValue, highlight && { color: colors.highlight }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.highlight, alignItems: "center", justifyContent: "center" },
  h1: { fontSize: 17, fontWeight: "800", color: colors.foreground },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 20, marginBottom: 22 },
  summaryEyebrow: { fontSize: 10, color: colors.mutedForeground, letterSpacing: 2, marginBottom: 4 },
  summaryValue: { fontSize: 30, fontWeight: "900", color: colors.foreground, letterSpacing: -1 },
  summaryCaption: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  statsGrid: { flexDirection: "row", gap: 10 },
  miniStat: { flex: 1, padding: 12, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  miniStatLabel: { fontSize: 9, color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  miniStatValue: { fontSize: 13, fontWeight: "800", color: colors.foreground },
  linkCard: {
    height: 56, borderRadius: 16, borderWidth: 2, borderStyle: "dashed", borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 6,
  },
  linkCardText: { fontSize: 13, fontWeight: "700", color: colors.mutedForeground },
});
