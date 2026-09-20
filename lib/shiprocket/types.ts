// ─── Pickup Address ────────────────────────────────────────────────────────

export interface AddPickupPayload {
  pickup_location: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  address_2?: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
}

export interface AddPickupResponse {
  success: boolean;
  pickup_id?: number;
  address?: {
    id: number;
    pickup_location: string;
  };
}
