import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { ScreenHeader } from "../../components/ScreenHeader";
import { TAB_BAR_CLEARANCE } from "../../theme/layout";
import type { ProfileStackParamList } from "../../navigation/types";

const permissions = [
  {
    key: "notifications",
    icon: "bell" as const,
    title: "Notifications",
    body: "Get alerted about expiring points, live offers, and milestone unlocks.",
    defaultOn: true,
  },
  {
    key: "sync",
    icon: "message-square" as const,
    title: "Transaction Sync",
    body: "Auto-detect card transactions from bank SMS/email to power AI recommendations.",
    defaultOn: true,
  },
  {
    key: "location",
    icon: "map-pin" as const,
    title: "Location",
    body: "Surface the best card and nearby offers when you're at a merchant.",
    defaultOn: false,
  },
];

export function PermissionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(permissions.map((p) => [p.key, p.defaultOn])),
  );

  useEffect(() => {
    Promise.all(permissions.map((p) => SecureStore.getItemAsync(`riq_perm_${p.key}`))).then((values) => {
      setEnabled((prev) => {
        const next = { ...prev };
        values.forEach((v, i) => {
          if (v !== null) next[permissions[i].key] = v === "true";
        });
        return next;
      });
    });
  }, []);

  const toggle = (key: string, value: boolean) => {
    setEnabled((prev) => ({ ...prev, [key]: value }));
    SecureStore.setItemAsync(`riq_perm_${key}`, String(value));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Alerts & Permissions" onBack={() => navigation.navigate("ProfileHome")} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>RewardIQ works best with a few permissions. You can change these anytime.</Text>
        <View style={{ gap: 12 }}>
          {permissions.map((p) => (
            <View key={p.key} style={styles.row}>
              <View style={styles.iconWrap}>
                <Feather name={p.icon} size={16} color="#d4d4d8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{p.title}</Text>
                <Text style={styles.body}>{p.body}</Text>
              </View>
              <Switch
                value={enabled[p.key]}
                onValueChange={(v) => toggle(p.key, v)}
                trackColor={{ false: colors.border, true: colors.highlight }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 40 + TAB_BAR_CLEARANCE },
  subtitle: { fontSize: 13, color: colors.mutedForeground, marginBottom: 20, lineHeight: 18 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  iconWrap: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  body: { fontSize: 11.5, color: colors.mutedForeground, marginTop: 4, lineHeight: 16 },
});
