// ─── Serviceability / Rate Check ───────────────────────────────────────────

export interface ServiceabilityParams {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number;
  cod?: 0 | 1;
  length?: number;
  breadth?: number;
  height?: number;
  declared_value?: number;
}

export interface CourierRate {
  courier_company_id: number;
  courier_name: string;
  freight_charge: number;
  cod_charges: number;
  rate: number;
  estimated_delivery_days: string;
  etd: string;
  min_weight: number;
  charge_weight: number;
  coverage_charges?: number;
  rto_charges?: number;
}

export interface ServiceabilityResponse {
  status: number;
  data: {
    available_courier_companies: CourierRate[];
    currency: string;
  };
}

// ─── Create Order ──────────────────────────────────────────────────────────

export interface OrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: string;
}

export interface CreateOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: OrderItem[];
  payment_method: "Prepaid" | "COD";
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface CreateOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now?: number;
  awb_code: string;
  courier_company_id: number;
  courier_name: string;
}

// ─── Tracking ──────────────────────────────────────────────────────────────

export interface TrackingActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
  "sr-status"?: string;
  "sr-status-label"?: string;
}

export interface ShipmentTrackItem {
  id?: number;
  awb_code?: string;
  courier_company_id?: number;
  courier_name?: string;
  current_status?: string;
  delivered_date?: string;
  edd?: string;
  pickup_date?: string;
}

export interface ShipmentTrackingData {
  tracking_data: {
    track_status: number;
    shipment_status: number;
    shipment_track: ShipmentTrackItem[];
    shipment_track_activities: TrackingActivity[];
    track_url?: string;
    etd?: string;
  };
}

// ─── Cancel ────────────────────────────────────────────────────────────────

export interface CancelResponse {
  status: number;
  message: string;
}

// ─── Label ─────────────────────────────────────────────────────────────────

export interface LabelResponse {
  label_created: number;
  response: string;
  label_url?: string;
  not_created?: string[];
}

// ─── Manifest ──────────────────────────────────────────────────────────────

export interface ManifestResponse {
  manifest_url?: string;
  status: number;
}

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
