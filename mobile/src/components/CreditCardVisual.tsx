import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";

// Only the visual "face" fields, independent of any specific card data source.
export type CardFace = {
  name: string;
  bank: string;
  tier: string;
  last4: string;
  points: number;
  tint: string;
};

// Native has no CSS-gradient equivalent without a linear-gradient native
// module (would require rebuilding the installed dev client), so each
// card's brand gradient is approximated with a single flat tint color.
export function CreditCardVisual({ card, style }: { card: CardFace; style?: ViewStyle }) {
  return (
    <View style={[styles.card, { backgroundColor: card.tint }, style]}>
      <View style={styles.grain} />
      <View style={styles.topRow}>
        <View>
          <View style={styles.chip} />
          <Text style={styles.bank}>{card.bank}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Feather name="wifi" size={16} color="rgba(255,255,255,0.6)" style={{ transform: [{ rotate: "90deg" }] }} />
          <Text style={styles.tier}>{card.tier}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.nameLabel}>{card.name}</Text>
          <Text style={styles.last4}>•••• {card.last4}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.pointsLabel}>POINTS</Text>
          <Text style={styles.points}>{card.points.toLocaleString("en-IN")}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 1.586,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  grain: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  chip: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 6,
  },
  bank: { fontSize: 9, fontFamily: "monospace", letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" },
  tier: { fontSize: 9, fontFamily: "monospace", letterSpacing: 2.5, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginTop: 4 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  nameLabel: { fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 },
  last4: { fontSize: 13, fontFamily: "monospace", letterSpacing: 2, color: "rgba(255,255,255,0.8)" },
  pointsLabel: { fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 },
  points: { fontSize: 14, fontWeight: "800", color: colors.highlight },
});
