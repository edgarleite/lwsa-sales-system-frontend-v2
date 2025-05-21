export interface Sale {
  id: number;
  seller_id: number;
  seller_name?: string;
  amount: string;
  commission: string;
  sale_date: string;
  created_at: string;
  updated_at: string;
}

export interface SaleListResponse {
  data: Sale[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
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
  };
}