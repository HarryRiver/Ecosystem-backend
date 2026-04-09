export class RegisterResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    role: 'customer' | 'admin';
    prepaid_required: boolean;
    is_blacklisted: boolean;
    no_show_count: number;
    status: string;
    created_at: string;
    updated_at: string;
  };
}
