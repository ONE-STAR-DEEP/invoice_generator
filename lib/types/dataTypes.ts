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
  sub_total: string;  
  grand_total: string;    
  created_at: string;     
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