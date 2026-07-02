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

export type MerchantsStackParamList = {
  MerchantsList: undefined;
  MerchantDetail: { merchantId: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Plans: undefined;
  Checkout: { plan: string; months: number; price: number };
  Family: undefined;
  Security: undefined;
  Help: undefined;
  Analytics: undefined;
  Permissions: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Cards: NavigatorScreenParams<CardsStackParamList>;
  Offers: NavigatorScreenParams<OffersStackParamList>;
  AI: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Merchants: NavigatorScreenParams<MerchantsStackParamList>;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SignIn: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};
