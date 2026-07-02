import { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { cards, offers, recommendCard } from "../lib/mock-data";
import { chatWithAssistant } from "../lib/api-client";
import { useAppSelector } from "../store/hooks";
import type { MainTabParamList } from "../navigation/types";

type Message = { id: string; role: "user" | "assistant"; text: string };

let nextId = 1;

const suggestions = [
  "What cards do I have?",
  "Best card for a ₹6500 Amazon order?",
  "Anything expiring soon?",
];

// Fallback used when signed out (no userId) or if the real backend call fails.
function localAnswer(query: string): string {
  const q = query.trim().toLowerCase();

  if (q.includes("what cards") || q.includes("my cards")) {
    return `You have ${cards.length} cards: ${cards.map((c) => c.name).join(", ")}.`;
  }
  if (q.includes("expir")) {
    const soonest = [...offers].sort((a, b) => parseInt(a.expiresIn) - parseInt(b.expiresIn))[0];
    return soonest
      ? `Yes — "${soonest.title}" at ${soonest.merchant} expires in ${soonest.expiresIn}. Use your ${soonest.card} before then.`
      : "Nothing expiring soon — you're all caught up.";
  }

  const match = recommendCard(query);
  if (match) {
    return `Use your ${match.card.name} at ${match.merchant.name} — you'll earn ${match.merchant.multiplier} rewards. ${match.merchant.tip}`;
  }
  return `I don't have data on that yet. Try asking about: ${cards.map((c) => c.name.split(" ")[0]).join(", ")}.`;
}

export function AssistantScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const userId = useAppSelector((s) => s.user.current?.id);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greet",
      role: "assistant",
      text: userId
        ? "Ask me anything about your cards, offers, or where to spend next — I'll check your real data before answering."
        : "Ask me anything about your cards, offers, or where to spend next.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const send = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || isLoading) return;
    setInput("");
    setMessages((prev) => [...prev, { id: `m${nextId++}`, role: "user", text: value }]);
    setIsLoading(true);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    let reply: string;
    if (userId) {
      try {
        reply = (await chatWithAssistant(userId, value)).reply;
      } catch (err) {
        reply = `Sorry, I couldn't reach the assistant: ${(err as Error).message}`;
      }
    } else {
      reply = localAnswer(value);
    }

    setMessages((prev) => [...prev, { id: `m${nextId++}`, role: "assistant", text: reply }]);
    setIsLoading(false);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconButton} onPress={() => navigation.navigate("Home")} accessibilityLabel="Back">
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Ionicons name="sparkles" size={15} color={colors.highlightForeground} />
          </View>
          <View>
            <Text style={styles.headerName}>RewardIQ</Text>
            <Text style={styles.headerStatus}>{isLoading ? "● Thinking" : "● Online"}</Text>
          </View>
        </View>
        <View style={styles.iconButton} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 14 }}
        renderItem={({ item }) =>
          item.role === "user" ? (
            <View style={styles.userRow}>
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{item.text}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.aiRow}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={13} color={colors.highlightForeground} />
              </View>
              <View style={styles.aiBubble}>
                <Text style={styles.aiText}>{item.text}</Text>
              </View>
            </View>
          )
        }
        ListFooterComponent={
          isLoading ? (
            <View style={styles.aiRow}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={13} color={colors.highlightForeground} />
              </View>
              <View style={[styles.aiBubble, { paddingVertical: 14 }]}>
                <Feather name="more-horizontal" size={16} color={colors.accent} />
              </View>
            </View>
          ) : null
        }
      />

      <View style={styles.suggestionsRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={suggestions}
          keyExtractor={(s) => s}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <Pressable style={styles.suggestionChip} onPress={() => send(item)} disabled={isLoading}>
              <Text style={styles.suggestionText}>{item}</Text>
            </Pressable>
          )}
        />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about any card, purchase, offer…"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            onSubmitEditing={() => send()}
            returnKeyType="send"
          />
          <Pressable style={styles.sendButton} onPress={() => send()} disabled={isLoading || !input.trim()}>
            <Feather name="arrow-up" size={18} color={colors.highlightForeground} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.highlight, alignItems: "center", justifyContent: "center" },
  headerName: { fontSize: 13, fontWeight: "800", color: colors.foreground },
  headerStatus: { fontSize: 9, color: colors.accent, letterSpacing: 1, textTransform: "uppercase", marginTop: 1 },
  userRow: { flexDirection: "row", justifyContent: "flex-end" },
  userBubble: { maxWidth: "80%", backgroundColor: "#fff", borderRadius: 20, borderTopRightRadius: 6, paddingHorizontal: 16, paddingVertical: 12 },
  userText: { fontSize: 13.5, fontWeight: "600", color: "#000" },
  aiRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.highlight, alignItems: "center", justifyContent: "center", marginTop: 2 },
  aiBubble: { maxWidth: "82%", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, borderTopLeftRadius: 6, paddingHorizontal: 16, paddingVertical: 12 },
  aiText: { fontSize: 13.5, color: colors.foreground, lineHeight: 19 },
  suggestionsRow: { paddingBottom: 8 },
  suggestionChip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  suggestionText: { fontSize: 11, fontWeight: "600", color: "#d4d4d8" },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 16, marginBottom: 16, marginTop: 4,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingLeft: 18, paddingRight: 6, height: 52,
  },
  input: { flex: 1, color: colors.foreground, fontSize: 14 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.highlight, alignItems: "center", justifyContent: "center" },
});
