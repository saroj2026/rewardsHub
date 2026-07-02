import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OffersListScreen } from "../screens/offers/OffersListScreen";
import { OfferDetailScreen } from "../screens/offers/OfferDetailScreen";
import type { OffersStackParamList } from "./types";

const Stack = createNativeStackNavigator<OffersStackParamList>();

export function OffersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OffersList" component={OffersListScreen} />
      <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
    </Stack.Navigator>
  );
}
