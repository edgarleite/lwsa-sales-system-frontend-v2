export interface SellerLinks {
  self: string;
  sales: string;
}

export interface Seller {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  links: SellerLinks;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface SellerListResponse {
  data: Seller[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface Sale {
  id: number;
  seller_id: number;
  amount: string;
  commission: string;
  sale_date: string;
  created_at: string;
  updated_at: string;
}

export interface SellerSalesResponse {
  data: {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    sales: Sale[];
    links: {
      self: string;
      sales: string;
    };
  }[];
}