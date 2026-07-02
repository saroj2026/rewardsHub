import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileHomeScreen } from "../screens/profile/ProfileHomeScreen";
import { PlansScreen } from "../screens/profile/PlansScreen";
import { CheckoutScreen } from "../screens/profile/CheckoutScreen";
import { FamilyScreen } from "../screens/profile/FamilyScreen";
import { SecurityScreen } from "../screens/profile/SecurityScreen";
import { HelpScreen } from "../screens/profile/HelpScreen";
import { AnalyticsScreen } from "../screens/profile/AnalyticsScreen";
import { PermissionsScreen } from "../screens/profile/PermissionsScreen";
import type { ProfileStackParamList } from "./types";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} />
      <Stack.Screen name="Plans" component={PlansScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Family" component={FamilyScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
    </Stack.Navigator>
  );
}
