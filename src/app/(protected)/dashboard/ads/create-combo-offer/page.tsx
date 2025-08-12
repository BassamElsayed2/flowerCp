"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  createComboOffer,
  uploadComboOfferImage,
} from "../../../../../../services/apiComboOffers";
import toast from "react-hot-toast";

type FormData = {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  total_price: number;
  starts_at: string | null;
  ends_at: string | null;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function CreateComboOffer() {
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const createMutation = useMutation({
    mutationFn: createComboOffer,
    onSuccess: () => {
      reset();
      setSelectedImage(null);
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(null);
      toast.success("تم إنشاء العرض بنجاح");
      router.push("/dashboard/ads");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(
        "نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP"
      );
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("حجم الصورة كبير جداً. الحد الأقصى هو 50 ميجابايت");
      return;
    }

    // Cleanup previous preview URL
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormData) => {
    try {
      let imageUrl = null;

      if (selectedImage) {
        imageUrl = await uploadComboOfferImage(selectedImage);
      }

      const insertData = {
        ...data,
        image_url: imageUrl,
        starts_at: data.starts_at || null,
        ends_at: data.ends_at || null,
      };

      await createMutation.mutateAsync(insertData);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="gap-[25px]">
        <div className="xl:col-span-3 2xl:col-span-2">
          <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
              <div className="trezo-card-title">
                <h5 className="!mb-0">إنشاء عرض جديد</h5>
              </div>
            </div>

            <div className="trezo-card-content sm:grid sm:grid-cols-2 sm:gap-[25px]">
              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  العنوان (ar)
                </label>
                <input
                  {...register("title_ar", {
                    required: "العنوان مطلوب",
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.title_ar && (
                  <p className="text-red-500 mt-1">{errors.title_ar.message}</p>
                )}
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  العنوان (en)
                </label>
                <input
                  {...register("title_en", {
                    required: "العنوان مطلوب",
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.title_en && (
                  <p className="text-red-500 mt-1">{errors.title_en.message}</p>
                )}
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  الوصف (ar)
                </label>
                <textarea
                  {...register("description_ar")}
                  rows={3}
                  className="rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] py-[12px] block w-full outline-0 transition-all"
                  placeholder="وصف العرض باللغة العربية..."
                />
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  الوصف (en)
                </label>
                <textarea
                  {...register("description_en")}
                  rows={3}
                  className="rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] py-[12px] block w-full outline-0 transition-all"
                  placeholder="وصف العرض باللغة الإنجليزية..."
                />
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  السعر الإجمالي
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("total_price", {
                    required: "السعر مطلوب",
                    min: {
                      value: 0,
                      message: "السعر يجب أن يكون أكبر من صفر",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                  placeholder="0.00"
                />
                {errors.total_price && (
                  <p className="text-red-500 mt-1">
                    {errors.total_price.message}
                  </p>
                )}
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  تاريخ البداية
                </label>
                <input
                  type="date"
                  {...register("starts_at")}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  تاريخ النهاية
                </label>
                <input
                  type="date"
                  {...register("ends_at")}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  اختر الصورة (اختياري)
                </label>
                <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[65px] px-[20px] border border-gray-200 dark:border-[#172036]">
                  <div className="flex items-center justify-center">
                    <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-[12px] rtl:ml-[12px]">
                      <i className="ri-upload-2-line"></i>
                    </div>
                    <p className="text-black dark:text-white">
                      <strong>اضغط لرفع الصورة</strong>
                      <br /> JPG, PNG, WEBP (الحد الأقصى 50 ميجابايت)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>

                {previewImage && (
                  <div className="mt-[10px] flex flex-wrap gap-2">
                    <div className="relative w-[50px] h-[50px]">
                      <Image
                        src={previewImage}
                        alt="preview"
                        width={50}
                        height={50}
                        className="rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                        onClick={() => {
                          setSelectedImage(null);
                          if (previewImage) {
                            URL.revokeObjectURL(previewImage);
                          }
                          setPreviewImage(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-[20px] sm:mt-[25px]">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="font-medium inline-block transition-all rounded-md 2xl:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50"
              >
                {createMutation.isPending ? "جارٍ الإرسال..." : "إنشاء العرض"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
