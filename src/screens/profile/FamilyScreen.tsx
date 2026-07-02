import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { ScreenHeader } from "../../components/ScreenHeader";
import { familyMembers } from "../../lib/mock-data";
import { TAB_BAR_CLEARANCE } from "../../theme/layout";
import type { ProfileStackParamList } from "../../navigation/types";

const INVITE_CODE = "RIQ-7F3K9";

export function FamilyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const [inviteInput, setInviteInput] = useState("");
  const totalPooled = familyMembers.reduce((s, m) => s + m.pooledValue, 0);

  const copyCode = async () => {
    try {
      await Clipboard.setStringAsync(INVITE_CODE);
      Alert.alert("Copied!", `Invite code ${INVITE_CODE} copied to clipboard.`);
    } catch {
      Alert.alert("Invite code", INVITE_CODE);
    }
  };

  const sendInvite = () => {
    if (!inviteInput.trim()) return;
    Alert.alert("Invite sent!", `${inviteInput.trim()} can join using code ${INVITE_CODE}.`);
    setInviteInput("");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Family Circle" onBack={() => navigation.navigate("ProfileHome")} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>POOLED REWARD VALUE</Text>
          <Text style={styles.heroValue}>₹{totalPooled.toLocaleString("en-IN")}</Text>
          <View style={styles.heroMetaRow}>
            <Feather name="users" size={12} color={colors.mutedForeground} />
            <Text style={styles.heroMeta}>
              {familyMembers.length} members · {familyMembers.reduce((s, m) => s + m.sharedCards, 0)} shared cards
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Members</Text>
        <View style={styles.membersCard}>
          {familyMembers.map((m, i) => (
            <View key={m.id} style={[styles.memberRow, i < familyMembers.length - 1 && styles.memberRowBorder]}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{m.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.memberNameRow}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  {m.role === "Owner" && <Feather name="award" size={11} color={colors.highlight} />}
                </View>
                <Text style={styles.memberMeta}>{m.relation} · {m.sharedCards} card{m.sharedCards === 1 ? "" : "s"} shared</Text>
              </View>
              <Text style={styles.memberValue}>₹{m.pooledValue.toLocaleString("en-IN")}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Invite Family</Text>
        <View style={styles.codeCard}>
          <Text style={styles.codeCaption}>SHARE THIS CODE</Text>
          <View style={styles.codeRow}>
            <Text style={styles.code}>{INVITE_CODE}</Text>
            <Pressable style={styles.copyBtn} onPress={copyCode}>
              <Feather name="copy" size={15} color="#d4d4d8" />
            </Pressable>
          </View>
        </View>

        <View style={styles.inviteRow}>
          <TextInput
            value={inviteInput}
            onChangeText={setInviteInput}
            placeholder="Email or mobile number"
            placeholderTextColor={colors.mutedForeground}
            style={styles.inviteInput}
          />
          <Pressable style={styles.sendBtn} onPress={sendInvite}>
            <Feather name="send" size={16} color={colors.highlightForeground} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 40 + TAB_BAR_CLEARANCE },
  hero: { borderRadius: 24, padding: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 22 },
  heroLabel: { fontSize: 10, color: colors.mutedForeground, letterSpacing: 2, marginBottom: 6 },
  heroValue: { fontSize: 30, fontWeight: "900", color: colors.foreground, letterSpacing: -1 },
  heroMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  heroMeta: { fontSize: 12, color: colors.mutedForeground, fontWeight: "600" },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: colors.mutedForeground, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },
  membersCard: { borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginBottom: 22 },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  memberRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  memberAvatar: { width: 44, height: 44, borderRadius: 16, backgroundColor: "rgba(0,245,255,0.15)", alignItems: "center", justifyContent: "center" },
  memberAvatarText: { fontSize: 12, fontWeight: "800", color: colors.foreground },
  memberNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  memberName: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  memberMeta: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  memberValue: { fontSize: 13, fontWeight: "800", color: colors.foreground },
  codeCard: { borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  codeCaption: { fontSize: 9, color: colors.mutedForeground, letterSpacing: 1.5, marginBottom: 8 },
  codeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  code: { fontSize: 18, fontWeight: "900", color: colors.highlight, letterSpacing: 3, fontFamily: "monospace" },
  copyBtn: { width: 36, height: 36, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  inviteRow: { flexDirection: "row", gap: 10 },
  inviteInput: { flex: 1, height: 48, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, color: colors.foreground },
  sendBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.highlight, alignItems: "center", justifyContent: "center" },
});
