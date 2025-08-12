import { v4 as uuidv4 } from "uuid";
import supabase from "./supabase";

type NewGallery = {
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  image_urls: File[];
};

type UpdateGalleryData = {
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  image_urls: string[];
};

export async function CreateGallery(newGallery: NewGallery) {
  const uploadedUrls: string[] = [];

  for (const image of newGallery.image_urls) {
    const ext = image.name.split(".").pop();
    const fileName = `galleries/${Date.now()}-${uuidv4()}.${ext}`;

    // رفع الملف مباشرة بدون تحويل إلى ArrayBuffer
    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(fileName, image, {
        contentType: image.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("فشل رفع الصور");
    }

    const { data: publicUrlData } = supabase.storage
      .from("gallery")
      .getPublicUrl(fileName);

    uploadedUrls.push(publicUrlData.publicUrl);
  }

  const { data, error } = await supabase
    .from("galleries")
    .insert([
      {
        title_ar: newGallery.title_ar,
        title_en: newGallery.title_en,
        description_ar: newGallery.description_ar || "",
        description_en: newGallery.description_en || "",
        image_urls: uploadedUrls,
      },
    ])
    .select();

  if (error) {
    console.error("Insert error:", error);
    throw new Error("فشل في إنشاء المعرض");
  }

  return data;
}

export async function getGalleries() {
  const { data, error } = await supabase.from("galleries").select("*"); // أو حدد الأعمدة اللي محتاجها

  if (error) {
    console.error("فشل في جلب البيانات:", error.message);
    throw new Error("فشل في تحميل المعرض");
  }

  return data;
}

export async function getGalleriesById(id: string) {
  const { data, error } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function deleteGalleries(id: string) {
  // جلب المعرض أولاً للحصول على روابط الصور
  const { data: gallery, error: fetchError } = await supabase
    .from("galleries")
    .select("image_urls")
    .eq("id", id)
    .single();

  if (fetchError || !gallery) {
    throw new Error("حدث خطأ أثناء جلب بيانات المعرض");
  }

  const imageUrls: string[] = gallery.image_urls || [];

  // استخراج أسماء الملفات من الروابط
  const paths = imageUrls.map((url) => {
    const parts = url.split("/");
    return decodeURIComponent(
      parts.slice(parts.indexOf("gallery") + 1).join("/")
    );
  });

  // حذف الصور من التخزين
  const { error: deleteFilesError } = await supabase.storage
    .from("gallery")
    .remove(paths);

  if (deleteFilesError) {
    console.error(deleteFilesError);
    throw new Error("حدث خطأ أثناء حذف الصور من التخزين");
  }

  // حذف السجل من قاعدة البيانات
  const { error: deleteDbError, data } = await supabase
    .from("galleries")
    .delete()
    .eq("id", id);

  if (deleteDbError) {
    throw new Error("حدث خطأ أثناء حذف المعرض من قاعدة البيانات");
  }

  return data;
}

export async function updateGallery(id: string, updateData: UpdateGalleryData) {
  const { data, error } = await supabase
    .from("galleries")
    .update({
      title_ar: updateData.title_ar,
      title_en: updateData.title_en,
      description_ar: updateData.description_ar || "",
      description_en: updateData.description_en || "",
      image_urls: updateData.image_urls,
    })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Update error:", error);
    throw new Error("فشل في تحديث المعرض");
  }

  return data;
}
