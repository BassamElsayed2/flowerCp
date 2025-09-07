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

  const { data: createdProduct, error: productError } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single();

  if (productError) {
    console.error("خطأ في إنشاء المنتج:", productError);
    throw new Error("تعذر إنشاء المنتج");
  }

  if (types && types.length > 0) {
    for (const type of types) {
      const { sizes, ...typeData } = type;

      const { data: createdType, error: typeError } = await supabase
        .from("product_types")
        .insert([{ ...typeData, product_id: createdProduct.id }])
        .select()
        .single();

      if (typeError) {
        console.error("خطأ في إنشاء نوع المنتج:", typeError);
        continue;
      }

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
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError);
    throw new Error("حدث خطأ أثناء جلب بيانات المنتج");
  }

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

  if (types !== undefined) {
    const { data: existingTypes } = await supabase
      .from("product_types")
      .select("id")
      .eq("product_id", id);

    const existingTypeIds = existingTypes?.map(t => t.id) || [];
    const processedTypeIds: string[] = [];

    for (const type of types) {
      const { sizes, ...typeData } = type;
      let typeId: string;

      if (type.id && existingTypeIds.includes(type.id)) {
        await supabase.from("product_types").update(typeData).eq("id", type.id);
        typeId = type.id;
        processedTypeIds.push(typeId);
      } else {
        const { data: createdType } = await supabase
          .from("product_types")
          .insert([{ ...typeData, product_id: id }])
          .select()
          .single();

        typeId = createdType.id;
        processedTypeIds.push(typeId);
      }

      if (sizes !== undefined) {
        const { data: existingSizes } = await supabase
          .from("product_sizes")
          .select("id")
          .eq("type_id", typeId);

        const existingSizeIds = existingSizes?.map(s => s.id) || [];
        const processedSizeIds: string[] = [];

        for (const size of sizes) {
          const { id, created_at, ...sizeData } = size;

          if (id && existingSizeIds.includes(id)) {
            await supabase
              .from("product_sizes")
              .update({
                ...sizeData,
                price: Number(size.price) || 0,
                offer_price: size.offer_price ? Number(size.offer_price) : null,
              })
              .eq("id", id);

            processedSizeIds.push(id);
          } else {
            const { data: createdSize } = await supabase
              .from("product_sizes")
              .insert([{
                ...sizeData,
                type_id: typeId,
                price: Number(size.price) || 0,
                offer_price: size.offer_price ? Number(size.offer_price) : null,
              }])
              .select()
              .single();

            processedSizeIds.push(createdSize.id);
          }
        }

        const sizesToDelete = existingSizeIds.filter(
          id => !processedSizeIds.includes(id)
        );
        if (sizesToDelete.length > 0) {
          await supabase.from("product_sizes").delete().in("id", sizesToDelete);
        }
      }
    }

    const typesToDelete = existingTypeIds.filter(
      id => !processedTypeIds.includes(id)
    );
    if (typesToDelete.length > 0) {
      await supabase.from("product_types").delete().in("id", typesToDelete);
    }
  }

  return data;
}

export async function updateProductBasic(
  id: string,
  updatedProduct: Partial<Product>
) {
  const { data, error } = await supabase
    .from("products")
    .update(updatedProduct)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("خطأ في تحديث المنتج:", error.message);
    throw new Error("تعذر تحديث المنتج");
  }

  return data;
}
