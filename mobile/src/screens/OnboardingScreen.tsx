import { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import type { RootStackParamList } from "../navigation/types";
import CreditCardImg from "../assets/images/credit-card.svg";
import ChooseCardImg from "../assets/images/choose-card.svg";
import GiftCardImg from "../assets/images/gift-card.svg";

const { width } = Dimensions.get("window");

const slides = [
  {
    Image: CreditCardImg,
    title: "One Wallet.\nEvery Card.",
    body: "Bring all your credit cards into a single, intelligent wallet — track points and value in one place.",
  },
  {
    Image: ChooseCardImg,
    title: "AI Picks Your\nBest Card",
    body: "Tell RewardIQ where you're spending and it instantly recommends the card that earns you the most back.",
  },
  {
    Image: GiftCardImg,
    title: "Never Miss\na Reward",
    body: "Get alerted before points expire, and see every live offer across your cards in real time.",
  },
];

export function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scrollRef = useRef<ScrollView>(null);
  const [current, setCurrent] = useState(0);
  const isLast = current === slides.length - 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== current) setCurrent(i);
  };

  const goToSignIn = () => navigation.replace("SignIn");

  const handleNext = () => {
    if (isLast) {
      goToSignIn();
      return;
    }
    scrollRef.current?.scrollTo({ x: (current + 1) * width, animated: true });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.skipRow}>
        <Pressable onPress={goToSignIn} hitSlop={8}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={{ flex: 1 }}
      >
        {slides.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={styles.imageWrap}>
              <View style={styles.imageGlow} />
              <slide.Image width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
            </View>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideBody}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable onPress={handleNext} style={styles.cta}>
          <Text style={styles.ctaText}>{isLast ? "Get Started" : "Next"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  skipRow: { alignItems: "flex-end", paddingHorizontal: 24, paddingTop: 8 },
  skipText: { color: colors.mutedForeground, fontSize: 13, fontWeight: "600" },
  slide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 24 },
  imageWrap: { width: "100%", maxWidth: 260, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  imageGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.highlight,
    opacity: 0.12,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.foreground,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  slideBody: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8, paddingBottom: 24 },
  dot: { height: 6, width: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.15)" },
  dotActive: { width: 24, backgroundColor: colors.highlight },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  cta: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.highlight,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: colors.highlightForeground, fontWeight: "900", fontSize: 15, letterSpacing: 0.5 },
});
