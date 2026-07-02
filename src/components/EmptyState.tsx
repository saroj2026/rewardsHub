import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Feather name="inbox" size={28} color={colors.mutedForeground} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {body && <Text style={styles.body}>{body}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 16 },
  iconWrap: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  title: { fontSize: 13, fontWeight: "700", color: "#d4d4d8", textAlign: "center" },
  body: { fontSize: 11, color: colors.mutedForeground, marginTop: 4, textAlign: "center", maxWidth: 220, lineHeight: 16 },
});
