import { NavigatorScreenParams } from '@react-navigation/native';

// --- Auth stack ---
export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  PersonalDetails: { email: string; password: string };
  Address: { registrationDraft: Record<string, unknown> };
  ForgotPassword: undefined;
};

// --- Send money stack (10 screens) ---
export type SendMoneyStackParamList = {
  SendHome: undefined;
  SelectRecipient: undefined;
  AddRecipient: { returnTo?: keyof SendMoneyStackParamList } | undefined;
  EnterAmount: { recipientId: string };
  DeliveryMethod: { recipientId: string; sendAmount: number; sendCurrency: string; receiveCurrency: string };
  ReviewTransfer: {
    recipientId: string;
    sendAmount: number;
    sendCurrency: string;
    receiveCurrency: string;
    deliveryMethod: string;
  };
  PinConfirm: { transferDraftId: string };
  Processing: { transferId: string };
  Success: { transferId: string };
  Failure: { message: string };
};

// --- Activity stack ---
export type ActivityStackParamList = {
  TransactionList: undefined;
  TransactionDetail: { transferId: string };
  TransactionReceipt: { transferId: string };
};

// --- Recipients stack ---
export type RecipientsStackParamList = {
  RecipientList: undefined;
  RecipientDetail: { recipientId: string };
  EditRecipient: { recipientId: string };
};

// --- Profile stack (Profile home + 8 sub-screens) ---
export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Appearance: undefined;
  NotificationPreferences: undefined;
  Security: undefined;
  KycStatus: undefined;
  KycSubmit: undefined;
  LinkedDevices: undefined;
  HelpSupport: undefined;
  About: undefined;
  LogoutConfirm: undefined;
};

// --- Main tabs ---
export type MainTabParamList = {
  Home: undefined;
  Send: NavigatorScreenParams<SendMoneyStackParamList>;
  Activity: NavigatorScreenParams<ActivityStackParamList>;
  Recipients: NavigatorScreenParams<RecipientsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// --- Root ---
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
