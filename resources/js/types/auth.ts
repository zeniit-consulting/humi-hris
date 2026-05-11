export type User = {
    id: number;
    name: string;
    company_name?: string | null;
    email: string;
    phone?: string | null;
    phone_verified_at?: string | null;
    role?: string | null;
    parent_user_id?: number | null;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

export type SubscriptionInfo = {
    plan_slug: 'free' | 'core' | 'plus';
    status: 'trial' | 'active' | 'expired' | 'cancelled';
    employee_count: number;
    max_employees: number | null;
    current_period_end: string | null;
    days_remaining: number;
    locked_features: string[];
    is_trial: boolean;
};
