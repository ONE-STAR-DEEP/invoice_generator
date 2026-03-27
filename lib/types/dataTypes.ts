export type User = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: "admin" | "accounts" | "user";
};

export type ClientInput = {
  companyName: string;
  gstNumber?: string;
  pan?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  email: string;
  phone: string;
  assignedPerson?: string;
  designation?: string;
  notes?: string;
};

export type ClientData = {
  id: number;

  company_name: string;

  gst_number: string | null;
  pan: string | null;

  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;

  email: string | null;
  phone: string | null;

  assigned_person: string | null;
  designation: string | null;

  notes: string | null;

  created_at: string; // ISO date
  updated_at: string; // ISO date
};

export type Options = {
  value: string;
  label: string;
}

export type ServiceOptions = {
  value: string;
  label: string;
}

export type InvoiceItem = {
  id: string
  service: string | null
  serviceId: number | null
  hsn: string
  expiry: Date
  cost: string
}

export type InvoiceData = {
  clientId: number
  invoiceType: "GST" | "NON_GST" | "EXPORT"
  invoiceId: string
  invoiceDate: Date
  clientGst: string
  PONo: string
  PODate: Date
  reference: string
}

export type Service = {
  id: number
  name: string
  hsn_code: string
  created_at: string
  updated_at: string
}

export type SellerCompany = {
  id: number;
  name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  email: string;
  cin: string;
  gst: string;
  pan: string;
  created_at: Date;
  updated_at: Date;
};

export type Invoice = {
  id: number;
  invoice_id: string;
  client_id: number;

  client_name: string;
  client_gst_no: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  client_city: string | null;
  client_state: string | null;
  client_country: string | null;
  client_pincode: string | null;

  sub_total: string;
  grand_total: string;

  status: "paid" | "pending";
  created_at: string;

  total_items?: number;
};

export type InvoiceApiResponse = {
  invoice: FetchedInvoice;
};

export type FetchedInvoice = {
  id: number;
  invoiceId: string;
  createdAt: string;

  subTotal: number;
  grandTotal: number;
  status: "paid" | "pending"

  cgst: number;
  sgst: number;
  igst: number;

  poNo: string;
  poDate: string;
  reference: string;

  items: FetchedInvoiceItem[];
  client: Client;
};

export type FetchedInvoiceItem = {
  id: number;
  serviceId: number;

  service: string;
  hsn: string;

  cost: number;

  cgst: number;
  sgst: number;
  igst: number;

  expiry: string;
};

export type Client = {
  id: number;

  companyName: string;
  gstNumber: string;

  email: string;
  phone: string;

  address: string | null;

  city: string;
  state: string;
  pincode: string;
};

export type BankAccount = {
  id: number;
  company_id: number;

  account_name: string;
  account_number: string;

  ifsc_code: string;
  bank_name: string;
  branch: string;

  created_at: string;
  updated_at: string;
};

export type UserData = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: "admin" | "user" | "accounts";
  created_at: string;
};

export type SessionUser = {
  id: number
  role: "admin" | "user" | "accounts"
  iss: string
}

export type PendingInvoice = {
  id: number;
  invoice_id: string;
  client_id: number;
  sub_total: string;
  grand_total: string;
  created_at: string; 
  status: "pending" | "paid";
  company_name: string;
  gst_number: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  total_items: number;
};

export type InvoiceServiceRow = {
  id: number;
  invoice_id: string;
  invoiceId: number;
  service_id: number;
  cost: string;
  expiry: string;
  status: "pending" | "active" | "expired";
  name: string;
  hsn_code: string;
};

export type PageProps = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
};

export type ClientStateReport = {
  client_id: number;
  client_name: string;

  total_amount: number;

  paid_amount: number;
  pending_amount: number;

  total_invoices: number;
  paid_invoices: number;
  pending_invoices: number;

  total_items: number;
};

export type ClientLocationReport = {
  client_id: number;
  client_name: string;

  client_city: string;
  client_state: string;

  total_amount: number;

  total_invoices: number;
  total_items: number;
};