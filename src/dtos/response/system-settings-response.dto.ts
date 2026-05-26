export type SystemSettingsResponse = {
  id: string;
  openingTime: string;
  closingTime: string;
  timezone: string;
  ordersEnabled: boolean;
  available: boolean;
  reason?: string;
  createdAt: string;
  updatedAt: string;
};
