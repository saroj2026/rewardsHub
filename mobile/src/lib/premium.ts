import * as SecureStore from "expo-secure-store";

const PREMIUM_KEY = "riq_premium_active";

export function getPremiumActive() {
  return SecureStore.getItemAsync(PREMIUM_KEY).then((v) => v === "true");
}

export function setPremiumActive() {
  return SecureStore.setItemAsync(PREMIUM_KEY, "true");
}
