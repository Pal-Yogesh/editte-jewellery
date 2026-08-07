export interface IthinkResponse<T> {
  status: "success" | "error";
  status_code: number;
  data?: T;
  html_message?: string;
}

export class IthinkError extends Error {
  public readonly status: string;
  public readonly htmlMessage: string;

  constructor(htmlMessage: string, status: string = "error") {
    super(htmlMessage);
    this.name = "IthinkError";
    this.status = status;
    this.htmlMessage = htmlMessage;
  }
}

// ─── Pincode ───────────────────────────────────────────────────────────────
// Actual response shape: data = { [pincode]: { [courierName]: serviceability } }

export interface PincodeServiceability {
  prepaid?: string; // "Y" | "N"
  cod?: string; // "Y" | "N"
  pickup?: string; // "Y" | "N"
  district?: string;
  state_code?: string;
  sort_code?: string;
}

export type PincodeCheckResult = Record<string, Record<string, PincodeServiceability>>;

// ─── Rate ──────────────────────────────────────────────────────────────────
// Actual response shape: data = [{ logistic_name, rate, ... }],
// plus top-level `zone` and `expected_delivery_date` siblings of `data`.

export interface RateResult {
  logistic_name?: string;
  logistic_service_type?: string;
  prepaid?: string; // "Y" | "N"
  cod?: string; // "Y" | "N"
  pickup?: string; // "Y" | "N"
  rev_pickup?: string; // "Y" | "N"
  rate?: number;
}

export interface GetRateData {
  from_pincode: string;
  to_pincode: string;
  shipping_length_cms: number;
  shipping_width_cms: number;
  shipping_height_cms: number;
  shipping_weight_kg: number;
  order_type: "forward";
  payment_method: "cod" | "prepaid";
  product_mrp: number;
}

// ─── Order / Shipment ──────────────────────────────────────────────────────

export interface IthinkProduct {
  product_name: string;
  product_sku: string;
  product_quantity: string;
  product_price: string;
  product_tax_rate?: string;
  product_hsn_code?: string;
  product_discount?: string;
}

export interface IthinkShipment {
  waybill?: string;
  order: string;
  sub_order?: string;
  order_date: string;
  total_amount: string;
  name: string;
  company_name?: string;
  add: string;
  add2?: string;
  add3?: string;
  pin: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  alt_phone?: string;
  email: string;
  is_billing_same_as_shipping: "yes" | "no";
  billing_name?: string;
  billing_company_name?: string;
  billing_add?: string;
  billing_add2?: string;
  billing_add3?: string;
  billing_pin?: string;
  billing_city?: string;
  billing_state?: string;
  billing_country?: string;
  billing_phone?: string;
  billing_alt_phone?: string;
  billing_email?: string;
  products: IthinkProduct[];
  shipment_length: string;
  shipment_width: string;
  shipment_height: string;
  weight: string;
  shipping_charges?: string;
  giftwrap_charges?: string;
  transaction_charges?: string;
  total_discount?: string;
  first_attemp_discount?: string;
  cod_charges?: string;
  advance_amount?: string;
  cod_amount?: string;
  payment_mode: "COD" | "Prepaid";
  reseller_name?: string;
  eway_bill_number?: string;
  gst_number?: string;
  return_address_id: string;
}

export interface CreateOrderPayload {
  shipments: IthinkShipment[];
  pickup_address_id: string;
  logistics?: string;
  s_type?: string;
  order_type?: string;
}

export interface CreateOrderResult {
  awb?: string;
  courier_company_id?: string;
  courier_name?: string;
  order_id?: string;
  pickup_address_id?: string;
  status?: string;
  shipment_id?: string;
  response?: Record<string, unknown>;
}

// ─── Tracking ──────────────────────────────────────────────────────────────

export interface TrackingResult {
  awb?: string;
  courier?: string;
  current_status?: string;
  current_status_code?: string;
  events?: TrackingEvent[];
  expected_delivery_date?: string;
}

export interface TrackingEvent {
  status?: string;
  status_code?: string;
  location?: string;
  date_time?: string;
  remark?: string;
}

// ─── Label ─────────────────────────────────────────────────────────────────

export interface LabelPayload {
  awb_numbers: string;
  page_size?: "A4" | "A6";
  display_cod_prepaid?: string;
  display_shipper_mobile?: string;
  display_shipper_address?: string;
}

// ─── Manifest ──────────────────────────────────────────────────────────────

export interface ManifestPayload {
  awb_numbers: string;
}

// ─── Cancel ────────────────────────────────────────────────────────────────

export interface CancelPayload {
  awb_numbers: string;
}

// ─── Warehouse ─────────────────────────────────────────────────────────────
// warehouse/get returns city_name/state_name/country_name + approval status.

export interface Warehouse {
  id?: string;
  name?: string;
  company_name?: string;
  address1?: string;
  address2?: string;
  mobile?: string;
  pincode?: string;
  city_id?: string;
  state_id?: string;
  country_id?: string;
  city_name?: string;
  state_name?: string;
  country_name?: string;
  status?: string; // "approved" | "Pending" — new warehouses start Pending
}
