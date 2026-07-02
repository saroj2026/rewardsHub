import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, type CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { EmptyState } from "../../components/EmptyState";
import { getMerchants, type Merchant } from "../../lib/api-client";
import { TAB_BAR_CLEARANCE } from "../../theme/layout";
import type { MerchantsStackParamList, MainTabParamList } from "../../navigation/types";

const categories = ["All", "Dining", "Travel", "Shopping", "Entertainment", "Fuel"];

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<MerchantsStackParamList, "MerchantsList">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function MerchantsListScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMerchants().then(setMerchants).catch(() => setMerchants([])).finally(() => setLoading(false));
  }, []);

  const filtered = merchants.filter(
    (m) => m.name.toLowerCase().includes(query.toLowerCase()) && (category === "All" || m.category === category),
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => navigation.navigate("Home")}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <Text style={styles.h1}>Merchant Search</Text>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Amazon, Zomato, IndiGo…"
          placeholderTextColor={colors.mutedForeground}
          style={styles.searchInput}
          autoFocus
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(c) => c}
        style={{ flexGrow: 0, marginBottom: 16 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
        renderItem={({ item }) => {
          const active = category === item;
          return (
            <Pressable style={[styles.pill, active && styles.pillActive]} onPress={() => setCategory(item)}>
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{item}</Text>
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
          data={filtered}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 + TAB_BAR_CLEARANCE, gap: 10 }}
          ListEmptyComponent={
            <EmptyState
              title={merchants.length === 0 ? "No merchants in the catalog yet" : "No matches"}
              body={merchants.length === 0 ? "The merchant catalog is curated centrally and is currently empty." : "Try a different search or category."}
            />
          }
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => navigation.navigate("MerchantDetail", { merchantId: item.id })}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.category}>{item.category}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.3)" />
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  h1: { fontSize: 17, fontWeight: "800", color: colors.foreground },
  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 10, height: 52, borderRadius: 16, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, marginHorizontal: 20, marginBottom: 16,
  },
  searchInput: { flex: 1, color: colors.foreground, fontSize: 14 },
  pill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pillActive: { backgroundColor: "#fff", borderColor: "#fff" },
  pillText: { fontSize: 12, fontWeight: "700", color: colors.mutedForeground },
  pillTextActive: { color: "#000" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(0,245,255,0.15)", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 15, fontWeight: "900", color: colors.accent },
  name: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  category: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
});
