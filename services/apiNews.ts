import { decode } from "base64-arraybuffer";
import supabase from "./supabase";

export interface News {
  title_ar: string;
  title_en: string;
  status?: string;
  category_id: string;
  author?: string;
  content_ar: string;
  content_en: string;
  images?: string[];
  yt_code?: string;
  created_at?: string;
  id?: string;
  user_id: string;
  price?: number;

  price_medium?: number;
  price_large?: number;
  price_family?: number;
}

export async function getNews(
  page = 1,
  limit = 10,
  filters?: {
    categoryId?: string;
    status?: string;
    search?: string;
    date?: string;
  }
): Promise<{ news: News[]; total: number }> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("news").select("*", { count: "exact" });

  if (filters?.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters?.status) {
    if (filters.status === "normal") {
      query = query.or("status.is.null,status.eq.''");
    } else {
      query = query.eq("status", filters.status);
    }
  }

  if (filters?.search) {
    query = query.or(
      `title_ar.ilike.%${filters.search}%,title_en.ilike.%${filters.search}%`
    );
  }

  if (filters?.date) {
    const now = new Date();
    const startDate = new Date();

    switch (filters.date) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    query = query.gte("created_at", startDate.toISOString());
  }

  query = query.order("created_at", { ascending: false });

  const { data: news, error, count } = await query.range(from, to);

  if (error) {
    console.error("خطأ في جلب الأخبار:", error.message);
    throw new Error("تعذر تحميل الأخبار");
  }

  return {
    news: news || [],
    total: count ?? 0,
  };
}

export async function getNewsById(id: string) {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function CreateNews(newNews: News): Promise<News[]> {
  const { data, error } = await supabase
    .from("news")
    .insert([newNews])
    .select();

  if (error) {
    console.log(error);
    throw new Error("News could not be Created");
  }
  return data;
}

export async function uploadImages(
  files: (File | { base64: string; name: string })[],
  folder = "news"
): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    let fileExt: string;
    let fileName: string;
    let fileData: File | ArrayBuffer;

    if (file instanceof File) {
      fileExt = file.name.split(".").pop()!;
      fileName = `${folder}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      fileData = file;
    } else {
      // الحالة base64
      fileExt = file.name.split(".").pop()!;
      fileName = `${folder}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      fileData = decode(file.base64);
    }

    const { error } = await supabase.storage
      .from("news-images")
      .upload(fileName, fileData, {
        contentType: file instanceof File ? file.type : `image/${fileExt}`,
      });

    if (error) {
      console.error("خطأ أثناء رفع الصورة:", error.message);
      continue;
    }

    const { data: publicUrlData } = supabase.storage
      .from("news-images")
      .getPublicUrl(fileName);

    uploadedUrls.push(publicUrlData.publicUrl);
  }

  return uploadedUrls;
}

export async function deleteNews(id: string) {
  console.log("ID to delete:", id);
  const { data: news, error: fetchError } = await supabase
    .from("news")
    .select("images")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError);
    throw new Error("حدث خطأ أثناء جلب بيانات الخبر");
  }

  if (news?.images && Array.isArray(news.images)) {
    const filePaths = news.images

      .map((url: string) => {
        const path = new URL(url).pathname;
        const match = path.match(
          /\/storage\/v1\/object\/public\/news-images\/(.+)/
        );
        return match?.[1];
      })
      .filter(Boolean) as string[];

    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("news-images")
        .remove(filePaths);

      if (storageError) {
        console.error("فشل حذف الصور:", storageError);
      }
    }
  }

  const { error: deleteError, data } = await supabase
    .from("news")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error("حدث خطأ أثناء حذف الخبر");
  }

  return data;
}

export async function updateNews(id: string, updatedNews: Partial<News>) {
  const { data, error } = await supabase
    .from("news")
    .update(updatedNews)
    .eq("id", id)
    .select();

  if (error) {
    console.error("خطأ في تحديث الخبر:", error.message);
    throw new Error("تعذر تحديث الخبر");
  }

  return data;
}
