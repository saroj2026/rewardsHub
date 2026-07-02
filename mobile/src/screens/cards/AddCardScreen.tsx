import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { EmptyState } from "../../components/EmptyState";
import { ScreenHeader } from "../../components/ScreenHeader";
import { getCardProducts, addCard, type CardProduct } from "../../lib/api-client";
import { formatCategory } from "../../lib/card-display";
import { useAppSelector } from "../../store/hooks";
import { TAB_BAR_CLEARANCE } from "../../theme/layout";
import type { CardsStackParamList } from "../../navigation/types";

export function AddCardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CardsStackParamList>>();
  const userId = useAppSelector((s) => s.user.current?.id);
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    getCardProducts()
      .then(setProducts)
      .catch((err) => Alert.alert("Couldn't load card catalog", (err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (product: CardProduct) => {
    if (!userId) {
      Alert.alert("Sign in required", "Sign in to link a card to your wallet.");
      return;
    }
    setAddingId(product.id);
    try {
      await addCard(userId, product.id);
      navigation.navigate("CardsList");
    } catch (err) {
      Alert.alert("Couldn't add card", (err as Error).message);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Link a Card" onBack={() => navigation.goBack()} />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 + TAB_BAR_CLEARANCE }}
          ListEmptyComponent={<EmptyState title="No card catalog available" body="Check back later." />}
          renderItem={({ item }) => {
            const isAdding = addingId === item.id;
            const bestRate = item.rewardRules.length
              ? Math.max(...item.rewardRules.map((r) => Number(r.rateValue)))
              : null;
            return (
              <Pressable style={styles.card} onPress={() => handleAdd(item)} disabled={!!addingId}>
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.issuer}>{item.issuer.toUpperCase()}</Text>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.meta}>
                      {item.network.toUpperCase()} · {formatCategory(item.cardType)}
                      {!item.annualFee || Number(item.annualFee) === 0 ? " · Free" : ` · ₹${Number(item.annualFee).toLocaleString("en-IN")}/yr`}
                    </Text>
                  </View>
                  {isAdding ? (
                    <ActivityIndicator color={colors.highlight} />
                  ) : (
                    <View style={styles.addBadge}>
                      <Feather name="plus" size={16} color={colors.highlightForeground} />
                    </View>
                  )}
                </View>
                {bestRate !== null && (
                  <View style={styles.rateChip}>
                    <Text style={styles.rateChipText}>Up to {bestRate}% back</Text>
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { padding: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 10 },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  issuer: { fontSize: 10, fontWeight: "800", color: colors.mutedForeground, letterSpacing: 1 },
  name: { fontSize: 15, fontWeight: "800", color: colors.foreground, marginTop: 2 },
  meta: { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
  addBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.highlight, alignItems: "center", justifyContent: "center" },
  rateChip: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(165,255,0,0.12)" },
  rateChipText: { fontSize: 11, fontWeight: "700", color: colors.highlight },
});
