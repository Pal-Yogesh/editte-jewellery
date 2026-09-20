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

export type AddWarehousePayload = Omit<Warehouse, "id">;
