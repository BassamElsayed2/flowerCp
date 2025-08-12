import supabase from "./supabase";

export interface SiteSettings {
  site_name_ar: string;
  site_name_en: string;
  about_us_ar: string;
  about_us_en: string;
  logo_url: string;
}

export async function getAboutUs(): Promise<SiteSettings> {
  const { data: site_settings, error } = await supabase
    .from("site_settings")
    .select("*")
    .single();

  if (error) throw error;
  return site_settings;
}
