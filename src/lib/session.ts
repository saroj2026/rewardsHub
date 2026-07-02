import * as SecureStore from "expo-secure-store";

const USER_ID_KEY = "riq_user_id";
const ACCESS_TOKEN_KEY = "riq_access_token";

export async function setSession(userId: string, accessToken: string) {
  await SecureStore.setItemAsync(USER_ID_KEY, userId);
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
}

export function getCurrentUserId() {
  return SecureStore.getItemAsync(USER_ID_KEY);
}

export function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(USER_ID_KEY);
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
