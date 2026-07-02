import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CardsListScreen } from "../screens/cards/CardsListScreen";
import { CardDetailScreen } from "../screens/cards/CardDetailScreen";
import { AddCardScreen } from "../screens/cards/AddCardScreen";
import type { CardsStackParamList } from "./types";

const Stack = createNativeStackNavigator<CardsStackParamList>();

export function CardsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CardsList" component={CardsListScreen} />
      <Stack.Screen name="CardDetail" component={CardDetailScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
    </Stack.Navigator>
  );
}
