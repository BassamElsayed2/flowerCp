import supabase from "./supabase";

export interface ComboOffer {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  image_url: string | null;
  total_price: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface CreateComboOfferData {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  total_price: number;
  starts_at: string | null;
  ends_at: string | null;
  image_url?: string | null;
}

export interface UpdateComboOfferData {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  total_price: number;
  starts_at: string | null;
  ends_at: string | null;
  image_url?: string | null;
}

// Get all combo offers
export const getComboOffers = async (): Promise<ComboOffer[]> => {
  const { data, error } = await supabase
    .from("combo_offers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error fetching combo offers: ${error.message}`);
  }

  return data || [];
};

// Get single combo offer by ID
export const getComboOfferById = async (id: string): Promise<ComboOffer> => {
  const { data, error } = await supabase
    .from("combo_offers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Error fetching combo offer: ${error.message}`);
  }

  return data;
};

// Create new combo offer
export const createComboOffer = async (
  offerData: CreateComboOfferData
): Promise<ComboOffer> => {
  const { data, error } = await supabase
    .from("combo_offers")
    .insert([offerData])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating combo offer: ${error.message}`);
  }

  return data;
};

// Update combo offer
export const updateComboOffer = async (
  id: string,
  offerData: UpdateComboOfferData
): Promise<ComboOffer> => {
  const { data, error } = await supabase
    .from("combo_offers")
    .update(offerData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating combo offer: ${error.message}`);
  }

  return data;
};

// Delete combo offer
export const deleteComboOffer = async (id: string): Promise<void> => {
  const { error } = await supabase.from("combo_offers").delete().eq("id", id);

  if (error) {
    throw new Error(`Error deleting combo offer: ${error.message}`);
  }
};

// Upload image to storage
export const uploadComboOfferImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("combooffersmedia")
    .upload(fileName, file);

  if (uploadError) {
    throw new Error(`Error uploading image: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from("combooffersmedia")
    .getPublicUrl(fileName);

  return data.publicUrl;
};

// Delete image from storage
export const deleteComboOfferImage = async (
  imageUrl: string
): Promise<void> => {
  const urlParts = imageUrl.split("/");
  const fileName = urlParts[urlParts.length - 1];

  if (fileName) {
    const { error } = await supabase.storage
      .from("combooffersmedia")
      .remove([fileName]);

    if (error) {
      throw new Error(`Error deleting image: ${error.message}`);
    }
  }
};
