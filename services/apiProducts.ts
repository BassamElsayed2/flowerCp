import { decode } from "base64-arraybuffer";
import supabase from "./supabase";

export interface Product {
  id?: string;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  category_id: string;
  user_id: string;
  image_url?: string;
  created_at?: string;
}

export interface ProductType {
  id?: string;
  product_id: string;
  name_ar: string;
  name_en: string;
  image_url?: string;
  created_at?: string;
}

export interface ProductSize {
  id?: string;
  type_id: string;
  size_ar: string;
  size_en: string;
  price: number;
  offer_price?: number;
  created_at?: string;
}

export interface ProductTypeWithSizes extends ProductType {
  sizes?: ProductSize[];
}

export interface ProductWithTypes extends Product {
  types?: ProductTypeWithSizes[];
}

export async function getProducts(
  page = 1,
  limit = 10,
  filters?: {
    categoryId?: string;
    search?: string;
    date?: string;
  }
): Promise<{ products: ProductWithTypes[]; total: number }> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("products").select(
    `
      *,
      types:product_types(
        *,
        sizes:product_sizes(*)
      )
    `,
    { count: "exact" }
  );

  if (filters?.categoryId) {
    query = query.eq("category_id", filters.categoryId);
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

  const { data: products, error, count } = await query.range(from, to);

  if (error) {
    console.error("خطأ في جلب المنتجات:", error.message);
    throw new Error("تعذر تحميل المنتجات");
  }

  return {
    products: products || [],
    total: count ?? 0,
  };
}

export async function getProductById(id: string): Promise<ProductWithTypes> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      types:product_types(
        *,
        sizes:product_sizes(*)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function createProduct(
  productData: ProductWithTypes
): Promise<ProductWithTypes> {
  const { types, ...product } = productData;

  // Create the product first
  const { data: createdProduct, error: productError } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single();

  if (productError) {
    console.error("خطأ في إنشاء المنتج:", productError);
    throw new Error("تعذر إنشاء المنتج");
  }

  // If there are types, create them
  if (types && types.length > 0) {
    for (const type of types) {
      const { sizes, ...typeData } = type;

      // Create the type
      const { data: createdType, error: typeError } = await supabase
        .from("product_types")
        .insert([{ ...typeData, product_id: createdProduct.id }])
        .select()
        .single();

      if (typeError) {
        console.error("خطأ في إنشاء نوع المنتج:", typeError);
        continue;
      }

      // If there are sizes, create them
      if (sizes && sizes.length > 0) {
        const sizesWithTypeId = sizes.map((size) => ({
          ...size,
          type_id: createdType.id,
        }));

        const { error: sizesError } = await supabase
          .from("product_sizes")
          .insert(sizesWithTypeId);

        if (sizesError) {
          console.error("خطأ في إنشاء أحجام المنتج:", sizesError);
        }
      }
    }
  }

  return createdProduct;
}

export async function uploadProductImage(
  file: File | { base64: string; name: string },
  folder = "products"
): Promise<string> {
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
    // Base64 case
    fileExt = file.name.split(".").pop()!;
    fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    fileData = decode(file.base64);
  }

  const { error } = await supabase.storage
    .from("product-images")
    .upload(fileName, fileData, {
      contentType: file instanceof File ? file.type : `image/${fileExt}`,
    });

  if (error) {
    console.error("خطأ أثناء رفع صورة المنتج:", error.message);
    throw new Error("تعذر رفع صورة المنتج");
  }

  const { data: publicUrlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

export async function uploadProductTypeImage(
  file: File | { base64: string; name: string }
): Promise<string> {
  let fileExt: string;
  let fileName: string;
  let fileData: File | ArrayBuffer;

  if (file instanceof File) {
    fileExt = file.name.split(".").pop()!;
    fileName = `product-type-img/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    fileData = file;
  } else {
    // Base64 case
    fileExt = file.name.split(".").pop()!;
    fileName = `product-type-img/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    fileData = decode(file.base64);
  }

  const { error } = await supabase.storage
    .from("product-type-img")
    .upload(fileName, fileData, {
      contentType: file instanceof File ? file.type : `image/${fileExt}`,
    });

  if (error) {
    console.error("خطأ أثناء رفع صورة نوع المنتج:", error.message);
    throw new Error("تعذر رفع صورة نوع المنتج");
  }

  const { data: publicUrlData } = supabase.storage
    .from("product-type-img")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

export async function deleteProduct(id: string) {
  // First, get the product to check if it has an image
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError);
    throw new Error("حدث خطأ أثناء جلب بيانات المنتج");
  }

  // Delete the image if it exists
  if (product?.image_url) {
    const path = new URL(product.image_url).pathname;
    const match = path.match(
      /\/storage\/v1\/object\/public\/product-images\/(.+)/
    );
    const filePath = match?.[1];

    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from("product-images")
        .remove([filePath]);

      if (storageError) {
        console.error("فشل حذف صورة المنتج:", storageError);
      }
    }
  }

  // Delete the product (types and sizes will be deleted automatically due to CASCADE)
  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error("حدث خطأ أثناء حذف المنتج");
  }
}

export async function updateProduct(
  id: string,
  updatedProduct: Partial<ProductWithTypes>
) {
  const { types, ...product } = updatedProduct;

  // Update the product
  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("خطأ في تحديث المنتج:", error.message);
    throw new Error("تعذر تحديث المنتج");
  }

  // If there are types to update, handle them
  if (types) {
    // Delete existing types (sizes will be deleted automatically due to CASCADE)
    await supabase.from("product_types").delete().eq("product_id", id);

    // Insert new types
    if (types.length > 0) {
      for (const type of types) {
        const { sizes, ...typeData } = type;

        // Create the type
        const { data: createdType, error: typeError } = await supabase
          .from("product_types")
          .insert([{ ...typeData, product_id: id }])
          .select()
          .single();

        if (typeError) {
          console.error("خطأ في تحديث نوع المنتج:", typeError);
          continue;
        }

        // If there are sizes, create them
        if (sizes && sizes.length > 0) {
          const sizesWithTypeId = sizes.map((size) => ({
            ...size,
            type_id: createdType.id,
          }));

          const { error: sizesError } = await supabase
            .from("product_sizes")
            .insert(sizesWithTypeId);

          if (sizesError) {
            console.error("خطأ في تحديث أحجام المنتج:", sizesError);
          }
        }
      }
    }
  }

  return data;
}
