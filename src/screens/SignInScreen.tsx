import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { getAuth, signInWithPhoneNumber, type FirebaseAuthTypes } from "@react-native-firebase/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { verifyFirebaseIdToken } from "../lib/api-client";
import { setSession } from "../lib/session";
import { useAppDispatch } from "../store/hooks";
import { signedIn } from "../store/slices/userSlice";
import type { RootStackParamList } from "../navigation/types";

type Step = "phone" | "otp";

export function SignInScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmationRef = useRef<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const enterMain = () => navigation.replace("Main");

  const sendOtp = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    try {
      const authInstance = getAuth();
      confirmationRef.current = await signInWithPhoneNumber(authInstance, `+91${phone}`);
      setStep("otp");
    } catch (err) {
      Alert.alert("Couldn't send OTP", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 6 || !confirmationRef.current) return;
    setLoading(true);
    try {
      const credential = await confirmationRef.current.confirm(otp);
      const idToken = await credential?.user.getIdToken();
      if (!idToken) throw new Error("No ID token returned by Firebase");
      const { accessToken, user } = await verifyFirebaseIdToken(idToken);
      await setSession(user.id, accessToken);
      dispatch(signedIn(user));
      enterMain();
    } catch (err) {
      Alert.alert("Couldn't verify OTP", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.badgeWrap}>
              <View style={styles.badgeGlowAccent} />
              <View style={styles.badgeGlowHighlight} />
              <View style={styles.badge}>
                <Ionicons name="sparkles" size={32} color={colors.accent} />
              </View>
              <View style={[styles.satellite, { top: 0, right: 0 }]}>
                <Feather name="phone" size={14} color={colors.highlight} />
              </View>
              <View style={[styles.satellite, { bottom: 0, left: 0 }]}>
                <Feather name="mail" size={14} color={colors.highlight} />
              </View>
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to sync your cards, points & offers.</Text>
          </View>

          {step === "phone" ? (
            <View style={styles.form}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.inputRow}>
                <Text style={styles.prefix}>+91</Text>
                <TextInput
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <Pressable
                onPress={sendOtp}
                disabled={loading || phone.length < 10}
                style={[styles.cta, (loading || phone.length < 10) && styles.ctaDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.highlightForeground} />
                ) : (
                  <Text style={styles.ctaText}>Send OTP</Text>
                )}
              </Pressable>
              <Text style={styles.hint}>
                Powered by Firebase Phone Auth — a real SMS will be sent.
              </Text>
            </View>
          ) : (
            <View style={styles.form}>
              <Pressable onPress={() => setStep("phone")} style={styles.backRow} hitSlop={8}>
                <Feather name="arrow-left" size={14} color={colors.mutedForeground} />
                <Text style={styles.backRowText}>+91 {phone}</Text>
              </Pressable>
              <Text style={styles.label}>Enter the 6-digit code</Text>
              <TextInput
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                style={[styles.input, styles.otpInput]}
              />
              <Pressable
                onPress={verifyOtp}
                disabled={loading || otp.length < 6}
                style={[styles.cta, (loading || otp.length < 6) && styles.ctaDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.highlightForeground} />
                ) : (
                  <Text style={styles.ctaText}>Verify & Continue</Text>
                )}
              </Pressable>
              <Pressable onPress={sendOtp} hitSlop={8}>
                <Text style={styles.resend}>Resend OTP</Text>
              </Pressable>
            </View>
          )}

          <Pressable onPress={enterMain} style={styles.guest} hitSlop={8}>
            <Text style={styles.guestText}>Continue as Guest →</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  header: { alignItems: "center", gap: 6, marginBottom: 28 },
  badgeWrap: { width: 112, height: 112, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  badgeGlowAccent: {
    position: "absolute",
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.accent,
    opacity: 0.15,
  },
  badgeGlowHighlight: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.highlight,
    opacity: 0.12,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,245,255,0.15)",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  satellite: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.foreground },
  subtitle: { fontSize: 13, color: colors.mutedForeground, textAlign: "center" },
  form: { gap: 12 },
  label: { fontSize: 11, fontWeight: "700", color: colors.mutedForeground, marginBottom: 2 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    gap: 8,
  },
  prefix: { color: colors.mutedForeground, fontWeight: "700", fontSize: 14 },
  input: { flex: 1, color: colors.foreground, fontSize: 15, fontFamily: Platform.select({ android: "monospace", ios: "Menlo" }) },
  otpInput: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: "center",
  },
  cta: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.highlight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: colors.highlightForeground, fontWeight: "900", fontSize: 14, letterSpacing: 0.5 },
  hint: { fontSize: 10, color: colors.mutedForeground, textAlign: "center", marginTop: 4 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  backRowText: { color: colors.mutedForeground, fontSize: 12, fontWeight: "600" },
  resend: { textAlign: "center", color: colors.mutedForeground, fontSize: 12, fontWeight: "600", marginTop: 4 },
  guest: { marginTop: "auto", alignItems: "center", paddingTop: 20 },
  guestText: { color: colors.mutedForeground, fontSize: 12, fontWeight: "600" },
});
