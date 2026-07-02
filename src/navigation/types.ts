import type { NavigatorScreenParams } from "@react-navigation/native";
import type { Card, Offer } from "../lib/api-client";

export type CardsStackParamList = {
  CardsList: undefined;
  CardDetail: { card: Card };
  AddCard: undefined;
};

export type OffersStackParamList = {
  OffersList: undefined;
  OfferDetail: { offer: Offer };
};

export type MainTabParamList = {
  Home: undefined;
  Cards: NavigatorScreenParams<CardsStackParamList>;
  Offers: NavigatorScreenParams<OffersStackParamList>;
  AI: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SignIn: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};
