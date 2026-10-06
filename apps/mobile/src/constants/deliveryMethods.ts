export type RecipientDeliveryMethod = 'bank_transfer' | 'mobile_money' | 'cash_pickup';

export interface DeliveryMethodOption {
  value: RecipientDeliveryMethod;
  label: string;
  description: string;
  icon: string; // Ionicons name
}

// Note: the backend's Recipient model supports 'bank_transfer' | 'mobile_money' | 'cash_pickup'.
// 'airtime' is not implemented on the backend yet, so it's intentionally left out here
// rather than silently offering an option that would fail on submit.
export const DELIVERY_METHODS: DeliveryMethodOption[] = [
  {
    value: 'bank_transfer',
    label: 'Bank transfer',
    description: 'Delivered directly to a bank account',
    icon: 'business-outline',
  },
  {
    value: 'mobile_money',
    label: 'Mobile money',
    description: 'Delivered to a mobile wallet',
    icon: 'phone-portrait-outline',
  },
  {
    value: 'cash_pickup',
    label: 'Cash pickup',
    description: 'Collected in cash at an agent location',
    icon: 'cash-outline',
  },
];

export const getDeliveryMethodLabel = (method: RecipientDeliveryMethod): string => {
  return DELIVERY_METHODS.find(m => m.value === method)?.label || method;
};
