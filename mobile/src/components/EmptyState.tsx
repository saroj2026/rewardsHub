import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import OnlineTransactionsImg from "../assets/images/online-transactions.svg";

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <View style={styles.container}>
      <OnlineTransactionsImg width={160} height={96} style={{ marginBottom: 12, opacity: 0.9 }} />
      <Text style={styles.title}>{title}</Text>
      {body && <Text style={styles.body}>{body}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 16 },
  title: { fontSize: 13, fontWeight: "700", color: "#d4d4d8", textAlign: "center" },
  body: { fontSize: 11, color: colors.mutedForeground, marginTop: 4, textAlign: "center", maxWidth: 220, lineHeight: 16 },
});
