export interface DayOff {
    id?: number;
    user_id?: number;
    init_hour: string; // ISO Date
    end_hour: string; // ISO Date
    repeat?: boolean;
    repeat_type?: 'weekly' | 'monthly' | 'daily' | 'none';
    repeat_value?: string;
    created_at?: string;
    updated_at?: string;
}
