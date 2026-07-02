import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { ScreenHeader } from "../../components/ScreenHeader";
import { TAB_BAR_CLEARANCE } from "../../theme/layout";
import type { ProfileStackParamList } from "../../navigation/types";

type BiometricMethod = "fingerprint" | "face";

const LOCK_KEY = "riq_app_lock_enabled";
const METHOD_KEY = "riq_app_lock_method";

export function SecurityScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [method, setMethod] = useState<BiometricMethod>("fingerprint");

  useEffect(() => {
    SecureStore.getItemAsync(LOCK_KEY).then((v) => setAppLockEnabled(v === "true"));
    SecureStore.getItemAsync(METHOD_KEY).then((v) => {
      if (v === "fingerprint" || v === "face") setMethod(v);
    });
  }, []);

  const toggleAppLock = (enabled: boolean) => {
    setAppLockEnabled(enabled);
    SecureStore.setItemAsync(LOCK_KEY, String(enabled));
    Alert.alert(
      enabled ? "App Lock enabled" : "App Lock disabled",
      enabled
        ? `RewardIQ will ask for ${method === "fingerprint" ? "Fingerprint" : "Face"} unlock on open.`
        : "Anyone can open RewardIQ without unlocking.",
    );
  };

  const selectMethod = (m: BiometricMethod) => {
    setMethod(m);
    SecureStore.setItemAsync(METHOD_KEY, m);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Privacy & Security" onBack={() => navigation.navigate("ProfileHome")} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.lockRow}>
          <View style={styles.lockIconWrap}>
            <Feather name="lock" size={16} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.lockTitle}>App Lock</Text>
            <Text style={styles.lockBody}>Require biometric unlock every time you open RewardIQ.</Text>
          </View>
          <Switch
            value={appLockEnabled}
            onValueChange={toggleAppLock}
            trackColor={{ false: colors.border, true: colors.highlight }}
            thumbColor="#fff"
          />
        </View>

        <Text style={styles.sectionLabel}>Unlock Method</Text>
        <View style={{ gap: 8, marginBottom: 22 }}>
          <MethodOption
            icon="smile"
            title="Fingerprint"
            body="Use your device's fingerprint sensor to unlock."
            selected={method === "fingerprint"}
            disabled={!appLockEnabled}
            onSelect={() => selectMethod("fingerprint")}
          />
          <MethodOption
            icon="camera"
            title="Face Unlock"
            body="Use face recognition to unlock, just like Face ID."
            selected={method === "face"}
            disabled={!appLockEnabled}
            onSelect={() => selectMethod("face")}
          />
        </View>

        <View style={styles.noticeRow}>
          <Feather name="shield" size={14} color={colors.accent} style={{ marginTop: 1 }} />
          <Text style={styles.noticeText}>
            Biometric data never leaves your device — RewardIQ only receives a yes/no unlock
            confirmation from your phone's secure hardware.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Legal</Text>
        <Pressable
          style={styles.legalRow}
          onPress={() => Alert.alert("Privacy & Security Policy", "RewardIQ never stores your full card number, CVV, or PIN — only the last 4 digits, for display.")}
        >
          <View style={styles.legalIconWrap}>
            <Feather name="file-text" size={15} color="#d4d4d8" />
          </View>
          <Text style={styles.legalText}>Privacy & Security Policy</Text>
          <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.3)" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function MethodOption({
  icon,
  title,
  body,
  selected,
  disabled,
  onSelect,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      disabled={disabled}
      style={[styles.methodOption, selected && styles.methodOptionSelected, disabled && { opacity: 0.4 }]}
    >
      <View style={[styles.methodIconWrap, selected && styles.methodIconWrapSelected]}>
        <Feather name={icon} size={16} color={selected ? colors.highlight : "#d4d4d8"} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.methodTitle}>{title}</Text>
        <Text style={styles.methodBody}>{body}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 40 + TAB_BAR_CLEARANCE },
  lockRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 22 },
  lockIconWrap: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(0,245,255,0.15)", alignItems: "center", justifyContent: "center" },
  lockTitle: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  lockBody: { fontSize: 11.5, color: colors.mutedForeground, marginTop: 4, lineHeight: 16 },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: colors.mutedForeground, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },
  methodOption: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  methodOptionSelected: { borderColor: "rgba(165,255,0,0.35)", backgroundColor: "rgba(165,255,0,0.06)" },
  methodIconWrap: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  methodIconWrapSelected: { backgroundColor: "rgba(165,255,0,0.15)" },
  methodTitle: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  methodBody: { fontSize: 11, color: colors.mutedForeground, marginTop: 3, lineHeight: 15 },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.border },
  radioSelected: { borderColor: colors.highlight, backgroundColor: colors.highlight },
  noticeRow: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 18, backgroundColor: "rgba(0,245,255,0.08)", borderWidth: 1, borderColor: "rgba(0,245,255,0.2)", marginBottom: 22 },
  noticeText: { flex: 1, fontSize: 11, color: "#d4d4d8", lineHeight: 16 },
  legalRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  legalIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  legalText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.foreground },
});
