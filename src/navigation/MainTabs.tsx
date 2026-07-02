import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import { CardsStack } from "./CardsStack";
import { OffersStack } from "./OffersStack";
import { AssistantScreen } from "../screens/AssistantScreen";
import { ProfileStack } from "./ProfileStack";
import { MerchantsStack } from "./MerchantsStack";
import { BottomTabBar } from "./BottomTabBar";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cards" component={CardsStack} />
      <Tab.Screen name="Offers" component={OffersStack} />
      <Tab.Screen name="AI" component={AssistantScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
      <Tab.Screen name="Merchants" component={MerchantsStack} />
    </Tab.Navigator>
  );
}
