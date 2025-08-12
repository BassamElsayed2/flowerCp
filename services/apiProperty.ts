import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface PropertyFormData {
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  status: string;
  price: string;
  type: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  addressAr: string;
  addressEn: string;
  descriptionAr: string;
  descriptionEn: string;
  images: string[];
}

export const uploadPropertyImages = async (
  files: FileList
): Promise<string[]> => {
  const supabase = createClientComponentClient();
  const imageUrls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;

      // Log file details for debugging
      console.log("Uploading file:", {
        name: file.name,
        type: file.type,
        size: file.size,
        fileName: fileName,
      });

      const { data, error } = await supabase.storage
        .from("property-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned from upload");
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("property-images").getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error("Failed to get public URL for uploaded image");
      }

      imageUrls.push(publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      // Rethrow with more context
      throw new Error(
        `Failed to upload image ${file.name}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  return imageUrls;
};

export const createProperty = async (
  formData: PropertyFormData,
  imageUrls: string[]
) => {
  const supabase = createClientComponentClient();

  try {
    const { error: insertError } = await supabase.from("properties").insert([
      {
        name_ar: formData.nameAr,
        name_en: formData.nameEn,
        city_ar: formData.cityAr,
        city_en: formData.cityEn,
        status: formData.status,
        price: formData.price,
        type: formData.type,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area: formData.area,
        address_ar: formData.addressAr,
        address_en: formData.addressEn,
        description_ar: formData.descriptionAr,
        description_en: formData.descriptionEn,
        images: imageUrls,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) throw insertError;
    return { success: true };
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
};
