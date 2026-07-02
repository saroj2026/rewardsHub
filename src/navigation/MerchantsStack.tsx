import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MerchantsListScreen } from "../screens/merchants/MerchantsListScreen";
import { MerchantDetailScreen } from "../screens/merchants/MerchantDetailScreen";
import type { MerchantsStackParamList } from "./types";

const Stack = createNativeStackNavigator<MerchantsStackParamList>();

export function MerchantsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MerchantsList" component={MerchantsListScreen} />
      <Stack.Screen name="MerchantDetail" component={MerchantDetailScreen} />
    </Stack.Navigator>
  );
}
