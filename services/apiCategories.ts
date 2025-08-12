import supabase from "./supabase";

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name_ar, name_en, image_url");

  if (error) throw error;
  return data;
}

export async function getCategoryById(id: number) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name_ar, name_en, image_url")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
