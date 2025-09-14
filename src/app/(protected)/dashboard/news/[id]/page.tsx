"use client";

import { useCategories } from "@/components/news/categories/useCategories";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import {
  Editor,
  EditorProvider,
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnRedo,
  BtnStrikeThrough,
  BtnStyles,
  BtnUnderline,
  BtnUndo,
  HtmlButton,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg";
import {
  getProductById,
  updateProduct,
  uploadProductImage,
  uploadProductTypeImage,
  ProductWithTypes,
  ProductType,
  ProductSize,
} from "../../../../../../services/apiProducts";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Image from "next/image";
import toast from "react-hot-toast";

interface ProductFormData {
  title_ar: string;
  title_en: string;
  category_id: string;
  description_ar: string;
  description_en: string;
  image_url?: string;
}

export default function EditProductPage() {
  const [serverImage, setServerImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Types and Sizes management
  const [types, setTypes] = useState<(ProductType & { tempId?: string })[]>([]);
  const [sizesByType, setSizesByType] = useState<{
    [key: string]: ProductSize[];
  }>({});
  const [typeImages, setTypeImages] = useState<{ [key: string]: File | null }>(
    {}
  );
  const [serverTypeImages, setServerTypeImages] = useState<{
    [key: string]: string | null;
  }>({});
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [loadedProductId, setLoadedProductId] = useState<string | null>(null);

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      title_ar: "",
      title_en: "",
      category_id: "",
      description_ar: "",
      description_en: "",
    },
  });

  //get id
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  //get categories
  const { data: categories } = useCategories();

  const { data: product } = useQuery({
    queryKey: ["product", id],
    queryFn: () => {
      if (!id) throw new Error("No ID provided");
      return getProductById(id);
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (product && (!isDataInitialized || loadedProductId !== product.id)) {
      reset({
        title_ar: product.title_ar || "",
        title_en: product.title_en || "",
        category_id: product.category_id?.toString() || "",
        description_ar: product.description_ar || "",
        description_en: product.description_en || "",
      });

      if (product.image_url) {
        setServerImage(product.image_url);
      }

      // Set types and sizes with stable IDs
      if (product.types) {
        const typesWithIds = product.types.map((type, index) => ({
          ...type,
          tempId: `existing_${type.id || index}`,
        }));
        setTypes(typesWithIds);

        // Set server type images using tempId
        const typeImagesMap: { [key: string]: string | null } = {};
        typesWithIds.forEach((type) => {
          typeImagesMap[type.tempId!] = type.image_url || null;
        });
        setServerTypeImages(typeImagesMap);

        const sizesMap: { [key: string]: ProductSize[] } = {};
        typesWithIds.forEach((type) => {
          const originalType = product.types!.find((t) => t.id === type.id);
          if (originalType?.sizes) {
            sizesMap[type.tempId!] = originalType.sizes.map((size) => ({
              id: size.id,
              type_id: size.type_id,
              size_ar: size.size_ar,
              size_en: size.size_en,
              price: size.price,
              offer_price: size.offer_price,
            }));
          }
        });
        setSizesByType(sizesMap);
      }

      setIsDataInitialized(true);
      setLoadedProductId(product.id || null);
    }
  }, [product, isDataInitialized, loadedProductId, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  // Handle type image upload
  const handleTypeImageChange = (
    tempId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // التحقق من نوع الملف
      if (!file.type.startsWith("image/")) {
        toast.error(`الملف ${file.name} ليس صورة`);
        return;
      }

      // التحقق من حجم الملف (10MB كحد أقصى)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`حجم الصورة ${file.name} يجب أن لا يتجاوز 10MB`);
        return;
      }

      setTypeImages((prev) => ({
        ...prev,
        [tempId]: file,
      }));
    }
  };

  const handleRemoveTypeImage = (tempId: string) => {
    setTypeImages((prev) => ({
      ...prev,
      [tempId]: null,
    }));
  };

  const handleRemoveServerTypeImage = (tempId: string) => {
    setServerTypeImages((prev) => ({
      ...prev,
      [tempId]: null,
    }));
  };

  // Types management
  const addType = () => {
    const tempId = `new_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}`;
    const newType: ProductType & { tempId: string } = {
      product_id: id || "",
      name_ar: "",
      name_en: "",
      tempId: tempId,
    };
    setTypes([...types, newType]);

    // Initialize empty sizes array for new type
    setSizesByType((prev) => ({
      ...prev,
      [tempId]: [],
    }));
  };

  const removeType = (tempId: string) => {
    setTypes(types.filter((type) => type.tempId !== tempId));

    // Remove images for this type
    setTypeImages((prev) => {
      const newImages = { ...prev };
      delete newImages[tempId];
      return newImages;
    });

    setServerTypeImages((prev) => {
      const newImages = { ...prev };
      delete newImages[tempId];
      return newImages;
    });

    // Remove sizes for this type
    setSizesByType((prev) => {
      const newSizes = { ...prev };
      delete newSizes[tempId];
      return newSizes;
    });
  };

  const updateType = (
    tempId: string,
    field: keyof ProductType,
    value: string
  ) => {
    const updatedTypes = types.map((type) =>
      type.tempId === tempId ? { ...type, [field]: value } : type
    );
    setTypes(updatedTypes);
  };

  // Sizes management
  const addSize = (tempId: string) => {
    const newSize: ProductSize = {
      type_id: "",
      size_ar: "",
      size_en: "",
      price: 0,
      offer_price: undefined,
    };

    setSizesByType((prev) => ({
      ...prev,
      [tempId]: [...(prev[tempId] || []), newSize],
    }));
  };

  const removeSize = (tempId: string, sizeIndex: number) => {
    setSizesByType((prev) => ({
      ...prev,
      [tempId]: prev[tempId]?.filter((_, i) => i !== sizeIndex) || [],
    }));
  };

  const updateSize = (
    tempId: string,
    sizeIndex: number,
    field: keyof ProductSize,
    value: string | number | undefined
  ) => {
    setSizesByType((prev) => {
      const updatedSizes = [...(prev[tempId] || [])];
      updatedSizes[sizeIndex] = { ...updatedSizes[sizeIndex], [field]: value };
      return {
        ...prev,
        [tempId]: updatedSizes,
      };
    });
  };

  const queryClient = useQueryClient();

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    try {
      if (!id) throw new Error("No ID found");

      setIsSubmitting(true);
      let uploadedImageUrl: string | undefined;

      if (selectedImage) {
        setIsUploadingImage(true);
        uploadedImageUrl = await uploadProductImage(selectedImage);
        setIsUploadingImage(false);
      }

      // Prepare update data
      const updatedData: Partial<ProductWithTypes> = {
        ...data,
        image_url: uploadedImageUrl || serverImage || undefined,
      };

      // Only include types if there are any types to update
      if (types && types.length > 0) {
        // Upload type images if any
        const typesWithImages = await Promise.all(
          types.map(async (type, typeIndex) => {
            const tempId = type.tempId!;
            const typeImage = typeImages[tempId];
            let imageUrl = serverTypeImages[tempId] || "";

            if (typeImage) {
              try {
                imageUrl = await uploadProductTypeImage(typeImage);
              } catch (error) {
                console.error(`خطأ في رفع صورة النوع ${typeIndex + 1}:`, error);
                toast.error(`فشل في رفع صورة النوع ${typeIndex + 1}`);
              }
            }

            // Remove tempId from final object
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { tempId: _, ...typeWithoutTempId } = type;
            return {
              ...typeWithoutTempId,
              image_url: imageUrl,
              sizes: sizesByType[tempId] || [],
            };
          })
        );

        updatedData.types = typesWithImages;
      }

      // تنفيذ التحديث في Supabase
      const updated = await updateProduct(id, updatedData);

      console.log("تم تحديث المنتج بنجاح:", updated);

      // يمكنك هنا إعادة التوجيه أو عرض رسالة نجاح
      toast.success("تم تحديث المنتج بنجاح");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/dashboard/news");
    } catch (error: Error | unknown) {
      toast.error("حدث خطأ ما");
      console.log("حدث خطأ أثناء تحديث المنتج:", error);
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className=" gap-[25px]">
        <div className="lg:col-span-2">
          <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
              <div className="trezo-card-title">
                <h5 className="!mb-0">تعديل منتج</h5>
              </div>
            </div>

            <div className="trezo-card-content">
              <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
                {/* العنوانين */}
                <div>
                  <label className="block font-medium mb-2">العنوان (ع)</label>
                  <input
                    {...register("title_ar")}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">العنوان (EN)</label>
                  <input
                    {...register("title_en")}
                    className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                  />
                </div>

                {/* التصنيف */}
                {product && (
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] text-black dark:text-white font-medium block">
                      التصنيف
                    </label>
                    <select
                      {...register("category_id")}
                      className="h-[55px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500"
                    >
                      {categories?.map((category) => (
                        <option
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* الخبر بالعربية */}
                <div className="sm:col-span-2">
                  <EditorProvider>
                    <Controller
                      control={control}
                      name="description_ar"
                      render={({ field }) => (
                        <div className="sm:col-span-2">
                          <label className="block font-medium mb-2">
                            وصف المنتج (بالعربي)
                          </label>
                          <EditorProvider>
                            <Editor
                              style={{ minHeight: "200px" }}
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <Toolbar>
                                <BtnUndo />
                                <BtnRedo />
                                <Separator />
                                <BtnBold />
                                <BtnItalic />
                                <BtnUnderline />
                                <BtnStrikeThrough />
                                <Separator />
                                <BtnNumberedList />
                                <BtnBulletList />
                                <Separator />
                                <BtnLink />
                                <BtnClearFormatting />
                                <HtmlButton />
                                <Separator />
                                <BtnStyles />
                              </Toolbar>
                            </Editor>
                          </EditorProvider>
                        </div>
                      )}
                    />
                  </EditorProvider>
                </div>

                {/* الخبر بالانجليزية */}
                <div className="sm:col-span-2">
                  <EditorProvider>
                    <Controller
                      control={control}
                      name="description_en"
                      render={({ field }) => (
                        <div className="sm:col-span-2">
                          <label className="block font-medium mb-2">
                            وصف المنتج (بالانجليزي)
                          </label>
                          <EditorProvider>
                            <Editor
                              style={{ minHeight: "200px" }}
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <Toolbar>
                                <BtnUndo />
                                <BtnRedo />
                                <Separator />
                                <BtnBold />
                                <BtnItalic />
                                <BtnUnderline />
                                <BtnStrikeThrough />
                                <Separator />
                                <BtnNumberedList />
                                <BtnBulletList />
                                <Separator />
                                <BtnLink />
                                <BtnClearFormatting />
                                <HtmlButton />
                                <Separator />
                                <BtnStyles />
                              </Toolbar>
                            </Editor>
                          </EditorProvider>
                        </div>
                      )}
                    />
                  </EditorProvider>
                </div>

                {/* الصورة */}
                <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                  <label className="mb-[10px] text-black dark:text-white font-medium block">
                    صورة المنتج
                  </label>

                  <div id="fileUploader">
                    <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[88px] px-[20px] border border-gray-200 dark:border-[#172036]">
                      <div className="flex items-center justify-center">
                        <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-[12px] rtl:ml-[12px]">
                          <i className="ri-upload-2-line"></i>
                        </div>
                        <p className="leading-[1.5]">
                          <strong className="text-black dark:text-white">
                            اضغط لرفع
                          </strong>
                          <br /> صورة المنتج من هنا
                        </p>
                      </div>

                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                      />
                    </div>

                    {/* Image Preview */}
                    <div className="mt-[10px] flex flex-wrap gap-2">
                      {/* صورة السيرفر */}
                      {serverImage && (
                        <div className="relative w-[50px] h-[50px]">
                          <Image
                            src={serverImage}
                            alt="server-img"
                            width={50}
                            height={50}
                            className="rounded-md object-cover w-full h-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.png";
                            }}
                          />
                          <button
                            type="button"
                            className="absolute top-[-5px] right-[-5px] bg-red-600 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                            onClick={() => setServerImage(null)}
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* صورة الرفع الجديدة */}
                      {selectedImage && (
                        <div className="relative w-[50px] h-[50px]">
                          <Image
                            src={URL.createObjectURL(selectedImage)}
                            alt="selected-img"
                            width={50}
                            height={50}
                            className="rounded-md object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                            onClick={() => setSelectedImage(null)}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Types and Sizes Section */}
          <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
              <div className="trezo-card-title">
                <h5 className="!mb-0">أنواع وأحجام المنتج</h5>
              </div>
              <button
                type="button"
                onClick={addType}
                className="font-medium inline-block transition-all rounded-md md:text-md py-[8px] px-[16px] bg-primary-500 text-white hover:bg-primary-400"
              >
                <i className="material-symbols-outlined ltr:mr-2 rtl:ml-2">
                  add
                </i>
                إضافة نوع
              </button>
            </div>

            <div className="trezo-card-content">
              {types.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  لا توجد أنواع للمنتج. اضغط على &quot;إضافة نوع&quot; لإضافة
                  نوع جديد.
                </p>
              ) : (
                <div className="space-y-6">
                  {types.map((type, typeIndex) => (
                    <div
                      key={type.tempId || typeIndex}
                      className="border border-gray-200 dark:border-[#172036] rounded-md p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h6 className="text-black dark:text-white font-medium">
                          نوع {typeIndex + 1}
                        </h6>
                        <button
                          type="button"
                          onClick={() => removeType(type.tempId!)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="material-symbols-outlined">delete</i>
                        </button>
                      </div>

                      {/* Type Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="mb-[10px] text-black dark:text-white font-medium block">
                            اسم النوع (بالعربي)
                          </label>
                          <input
                            type="text"
                            className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                            placeholder="مثل: رول، مثلث، عادي"
                            value={type.name_ar}
                            onChange={(e) =>
                              updateType(
                                type.tempId!,
                                "name_ar",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className="mb-[10px] text-black dark:text-white font-medium block">
                            اسم النوع (بالانجليزي)
                          </label>
                          <input
                            type="text"
                            className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                            placeholder="مثل: Roll, Triangle, Regular"
                            value={type.name_en}
                            onChange={(e) =>
                              updateType(
                                type.tempId!,
                                "name_en",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* Type Image Upload */}
                      <div className="mb-4">
                        <label className="mb-[10px] text-black dark:text-white font-medium block">
                          صورة النوع (اختياري)
                        </label>
                        <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[88px] px-[20px] border border-gray-200 dark:border-[#172036]">
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg mb-3">
                              <i className="ri-upload-2-line"></i>
                            </div>
                            <p className="leading-[1.5] mb-2">
                              <strong className="text-black dark:text-white">
                                اضغط لرفع
                              </strong>
                              <br /> صورة النوع من هنا
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              حجم الصورة: حتى 10 ميجابايت
                            </p>
                          </div>

                          <input
                            type="file"
                            accept="image/*"
                            className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                            onChange={(e) =>
                              handleTypeImageChange(type.tempId!, e)
                            }
                          />
                        </div>

                        {/* Image Preview */}
                        <div className="mt-[10px] flex flex-wrap gap-2">
                          {/* صورة السيرفر للنوع */}
                          {serverTypeImages[type.tempId!] && (
                            <div className="relative w-[50px] h-[50px]">
                              <Image
                                src={
                                  serverTypeImages[type.tempId!] ||
                                  "/placeholder.png"
                                }
                                alt={`server-type-img-${typeIndex}`}
                                width={50}
                                height={50}
                                className="rounded-md object-cover w-full h-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.png";
                                }}
                              />
                              <button
                                type="button"
                                className="absolute top-[-5px] right-[-5px] bg-red-600 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                                onClick={() =>
                                  handleRemoveServerTypeImage(type.tempId!)
                                }
                              >
                                ✕
                              </button>
                            </div>
                          )}

                          {/* صورة الرفع الجديدة للنوع */}
                          {typeImages[type.tempId!] && (
                            <div className="relative w-[50px] h-[50px]">
                              <Image
                                src={URL.createObjectURL(
                                  typeImages[type.tempId!]!
                                )}
                                alt={`selected-type-img-${typeIndex}`}
                                width={50}
                                height={50}
                                className="rounded-md object-cover w-full h-full"
                              />
                              <button
                                type="button"
                                className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                                onClick={() =>
                                  handleRemoveTypeImage(type.tempId!)
                                }
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sizes for this type */}
                      <div className="border-t border-gray-200 dark:border-[#172036] pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <h6 className="text-black dark:text-white font-medium">
                            أحجام النوع {typeIndex + 1}
                          </h6>
                          <button
                            type="button"
                            onClick={() => addSize(type.tempId!)}
                            className="font-medium inline-block transition-all rounded-md text-sm py-[6px] px-[12px] bg-green-500 text-white hover:bg-green-400"
                          >
                            <i className="material-symbols-outlined ltr:mr-1 rtl:ml-1 text-sm">
                              add
                            </i>
                            إضافة حجم
                          </button>
                        </div>

                        {(sizesByType[type.tempId!] || []).length === 0 ? (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            لا توجد أحجام لهذا النوع. اضغط على &quot;إضافة
                            حجم&quot; لإضافة حجم جديد.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {(sizesByType[type.tempId!] || []).map(
                              (size, sizeIndex) => (
                                <div
                                  key={sizeIndex}
                                  className="border border-gray-200 dark:border-[#172036] rounded-md p-3"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="text-black dark:text-white font-medium text-sm">
                                      حجم {sizeIndex + 1}
                                    </h6>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeSize(type.tempId!, sizeIndex)
                                      }
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <i className="material-symbols-outlined text-sm">
                                        delete
                                      </i>
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="mb-[8px] text-black dark:text-white font-medium block text-sm">
                                        اسم الحجم (بالعربي)
                                      </label>
                                      <input
                                        type="text"
                                        className="h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[15px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                                        placeholder="مثل: صغير، متوسط، كبير"
                                        value={size.size_ar}
                                        onChange={(e) =>
                                          updateSize(
                                            type.tempId!,
                                            sizeIndex,
                                            "size_ar",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>

                                    <div>
                                      <label className="mb-[8px] text-black dark:text-white font-medium block text-sm">
                                        اسم الحجم (بالانجليزي)
                                      </label>
                                      <input
                                        type="text"
                                        className="h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[15px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                                        placeholder="مثل: Small, Medium, Large"
                                        value={size.size_en}
                                        onChange={(e) =>
                                          updateSize(
                                            type.tempId!,
                                            sizeIndex,
                                            "size_en",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>

                                    <div>
                                      <label className="mb-[8px] text-black dark:text-white font-medium block text-sm">
                                        السعر الأساسي
                                      </label>
                                      <input
                                        type="number"
                                        className="h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[15px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                                        placeholder="0.00"
                                        value={size.price}
                                        onChange={(e) =>
                                          updateSize(
                                            type.tempId!,
                                            sizeIndex,
                                            "price",
                                            Number(e.target.value)
                                          )
                                        }
                                      />
                                    </div>

                                    <div>
                                      <label className="mb-[8px] text-black dark:text-white font-medium block text-sm">
                                        سعر العرض (اختياري)
                                      </label>
                                      <input
                                        type="number"
                                        className="h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[15px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                                        placeholder="0.00"
                                        value={size.offer_price || ""}
                                        onChange={(e) =>
                                          updateSize(
                                            type.tempId!,
                                            sizeIndex,
                                            "offer_price",
                                            e.target.value
                                              ? Number(e.target.value)
                                              : undefined
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* الأزرار */}
      <div className="trezo-card mb-[25px]">
        <div className="trezo-card-content">
          <button
            type="reset"
            className="font-medium inline-block transition-all rounded-md md:text-md ltr:mr-[15px] rtl:ml-[15px] py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-danger-500 text-white hover:bg-danger-400"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
              {isUploadingImage ? (
                <>
                  <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2 animate-spin">
                    sync
                  </i>
                  جاري رفع الصورة...
                </>
              ) : isSubmitting ? (
                <>
                  <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2 animate-spin">
                    sync
                  </i>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                    save
                  </i>
                  حفظ التعديلات
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
