export interface ProfileTypes {
  user_id: string;
  full_name: string;
  email: string;
  job_title: string;
  address: string;
  joined_at: string | Date | number;
  image_url?: string;
  about?: string;
  phone: number | string;
}
