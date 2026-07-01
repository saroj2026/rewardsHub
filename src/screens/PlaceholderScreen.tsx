import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export function PlaceholderScreen({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  title: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.mutedForeground,
    fontSize: 13,
    textAlign: "center",
  },
});
