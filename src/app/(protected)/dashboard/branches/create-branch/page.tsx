"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import supabase from "../../../../../../services/supabase";
import toast from "react-hot-toast";

type FormData = {
  name_ar: string;
  name_en: string;
  area_ar: string;
  area_en: string;
  address_ar: string;
  address_en: string;
  works_hours: string;
  phone: string;
  google_map: string;
  image: string;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function CreateBranch() {
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

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
    setLoading(true);

    try {
      let imageUrl = null;

      if (selectedImage) {
        const fileExt = selectedImage.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: imageUploadError } = await supabase.storage
          .from("branches")
          .upload(fileName, selectedImage);

        if (imageUploadError) {
          throw new Error("فشل في رفع الصورة");
        }

        imageUrl = supabase.storage.from("branches").getPublicUrl(fileName)
          .data.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("branches")
        .insert([{ ...data, image: imageUrl }]);

      if (insertError) {
        throw new Error("حدث خطأ أثناء حفظ البيانات");
      }

      reset();
      setSelectedImage(null);
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(null);
      toast.success("تم إنشاء فرع بنجاح");
      router.push("/dashboard/branches");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="gap-[25px]">
        <div className="xl:col-span-3 2xl:col-span-2">
          <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
              <div className="trezo-card-title">
                <h5 className="!mb-0">إنشاء فرع</h5>
              </div>
            </div>

            <div className="trezo-card-content sm:grid sm:grid-cols-2 sm:gap-[25px]">
              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  اسم الفرع (ar)
                </label>
                <input
                  {...register("name_ar", {
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.name_ar && (
                  <p className="text-red-500 mt-1">{errors.name_ar.message}</p>
                )}
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  اسم الفرع (en)
                </label>
                <input
                  {...register("name_en", {
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.name_en && (
                  <p className="text-red-500 mt-1">{errors.name_en.message}</p>
                )}
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  اسم المنطقة (ar)
                </label>
                <input
                  {...register("area_ar", {
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.area_ar && (
                  <p className="text-red-500 mt-1">{errors.area_ar.message}</p>
                )}
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  اسم المنطقة (en)
                </label>
                <input
                  {...register("area_en", {
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.area_en && (
                  <p className="text-red-500 mt-1">{errors.area_en.message}</p>
                )}
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  العنوان(ar)
                </label>
                <input
                  {...register("address_ar", {
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.address_ar && (
                  <p className="text-red-500 mt-1">
                    {errors.address_ar.message}
                  </p>
                )}
              </div>
              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  العنوان (en)
                </label>
                <input
                  {...register("address_en", {
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.address_en && (
                  <p className="text-red-500 mt-1">
                    {errors.address_en.message}
                  </p>
                )}
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  ساعات العمل
                </label>
                <input
                  {...register("works_hours", {
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.works_hours && (
                  <p className="text-red-500 mt-1">
                    {errors.works_hours.message}
                  </p>
                )}
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  رقم الهاتف
                </label>
                <input
                  {...register("phone", {
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.phone && (
                  <p className="text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  الموقع الجغرافي (google map)
                </label>
                <input
                  {...register("google_map", {
                    minLength: {
                      value: 3,
                      message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.google_map && (
                  <p className="text-red-500 mt-1">
                    {errors.google_map.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  اختر الصوره (اختياري)
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
                disabled={loading}
                className="font-medium inline-block transition-all rounded-md 2xl:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50"
              >
                {loading ? "جارٍ الإرسال..." : "إنشاء"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
