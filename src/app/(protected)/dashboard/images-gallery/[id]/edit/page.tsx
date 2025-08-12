"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gallerySchema } from "@/components/Social/SettingsForm/lib/validations/schema";

import toast from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";

import { v4 as uuidv4 } from "uuid";
import supabase from "../../../../../../../services/supabase";
import {
  getGalleriesById,
  updateGallery,
} from "../../../../../../../services/apiGallery";

type GalleryFormData = z.infer<typeof gallerySchema>;

export default function EditGalleryPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
  });

  // جلب بيانات المعرض
  const { data: gallery, isLoading } = useQuery({
    queryKey: ["gallery", id],
    queryFn: () => getGalleriesById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (gallery) {
      reset({
        title_ar: gallery.title_ar,
        title_en: gallery.title_en,
        description_ar: gallery.description_ar || "",
        description_en: gallery.description_en || "",
      });
      setCurrentImages(gallery.image_urls || []);
      setDeletedImages([]);
      setSelectedImages([]);
    }
  }, [gallery, reset]);

  // حذف صورة من الصور الحالية
  const handleRemoveCurrentImage = (url: string) => {
    setCurrentImages((prev) => prev.filter((img) => img !== url));
    setDeletedImages((prev) => [...prev, url]);
  };

  // إضافة صور جديدة
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedImages((prevImages) => [...prevImages, ...filesArray]);
    }
  };

  // حذف صورة من الصور الجديدة قبل الرفع
  const handleRemoveNewImage = (index: number) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  // رفع صورة جديدة إلى supabase
  const uploadImageToSupabase = async (image: File) => {
    const ext = image.name.split(".").pop();
    const fileName = `galleries/${Date.now()}-${uuidv4()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(fileName, image, {
        contentType: image.type,
      });
    if (uploadError) throw new Error("فشل رفع الصور");
    const { data: publicUrlData } = supabase.storage
      .from("gallery")
      .getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  };

  // حذف صورة من supabase
  const deleteImageFromSupabase = async (url: string) => {
    const parts = url.split("/");
    const path = decodeURIComponent(
      parts.slice(parts.indexOf("gallery") + 1).join("/")
    );
    const { error } = await supabase.storage.from("gallery").remove([path]);
    if (error) throw new Error("فشل حذف الصورة من التخزين");
  };

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const title_ar = formData.get("title_ar") as string;
      const title_en = formData.get("title_en") as string;
      const description_ar = formData.get("description_ar") as string;
      const description_en = formData.get("description_en") as string;
      // حذف الصور من supabase
      for (const url of deletedImages) {
        await deleteImageFromSupabase(url);
      }
      // رفع الصور الجديدة
      const uploadedUrls: string[] = [];
      for (const file of selectedImages) {
        const url = await uploadImageToSupabase(file);
        uploadedUrls.push(url);
      }
      // جمع الصور النهائية
      const finalImageUrls = [...currentImages, ...uploadedUrls];
      await updateGallery(id!, {
        title_ar,
        title_en,
        description_ar,
        description_en,
        image_urls: finalImageUrls,
      });
    },
    onSuccess: () => {
      toast.success("تم تحديث المعرض بنجاح");
      queryClient.invalidateQueries({ queryKey: ["gallery", id] });
      router.push("/dashboard/images-gallery");
    },
    onError: () => {
      toast.error("فشل في تحديث المعرض");
    },
  });

  const onSubmit = (data: GalleryFormData) => {
    const formData = new FormData();
    formData.append("title_ar", data.title_ar);
    formData.append("title_en", data.title_en);
    formData.append("description_ar", data.description_ar || "");
    formData.append("description_en", data.description_en || "");
    mutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-10 text-center">جاري تحميل البيانات...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="gap-[25px]">
        <div className="xl:col-span-3 2xl:col-span-2">
          <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
              <div className="trezo-card-title">
                <h5 className="!mb-0">تعديل معرض الصور</h5>
              </div>
            </div>
            <div className="trezo-card-content sm:grid sm:grid-cols-2 sm:gap-[25px]">
              {/* العنوان بالعربية */}
              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  العنوان (ar) *
                </label>
                <input
                  {...register("title_ar")}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.title_ar && (
                  <p className="text-red-500 text-sm">
                    {errors.title_ar.message}
                  </p>
                )}
              </div>

              {/* العنوان بالإنجليزية */}
              <div className="mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  العنوان (en) *
                </label>
                <input
                  {...register("title_en")}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                />
                {errors.title_en && (
                  <p className="text-red-500 text-sm">
                    {errors.title_en.message}
                  </p>
                )}
              </div>

              {/* التفاصيل بالعربية */}
              <div className="sm:col-span-2 mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  تفاصيل (ar)
                </label>
                <textarea
                  {...register("description_ar")}
                  className="h-[140px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] p-[17px] block w-full outline-0 transition-all"
                />
              </div>

              {/* التفاصيل بالإنجليزية */}
              <div className="sm:col-span-2 mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  تفاصيل (en)
                </label>
                <textarea
                  {...register("description_en")}
                  className="h-[140px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] p-[17px] block w-full outline-0 transition-all"
                />
              </div>

              {/* الصور الحالية */}
              <div className="sm:col-span-2 mb-[20px]">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  الصور الحالية
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentImages.map((img, idx) => (
                    <div key={idx} className="relative w-[50px] h-[50px]">
                      <Image
                        src={img}
                        alt="preview"
                        width={50}
                        height={50}
                        className="rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-[-5px] right-[-5px] bg-red-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                        onClick={() => handleRemoveCurrentImage(img)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* رفع الصور الجديدة */}
              <div className="sm:col-span-2">
                <label className="mb-[10px] block font-medium text-black dark:text-white">
                  إضافة صور جديدة
                </label>
                <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[65px] px-[20px] border border-gray-200 dark:border-[#172036]">
                  <div className="flex items-center justify-center">
                    <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-[12px] rtl:ml-[12px]">
                      <i className="ri-upload-2-line"></i>
                    </div>
                    <p>
                      <strong>اضافة صورة</strong>
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="mt-[10px] flex flex-wrap gap-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative w-[50px] h-[50px]">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt="preview"
                        width={50}
                        height={50}
                        className="rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                        onClick={() => handleRemoveNewImage(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-[20px] sm:mt-[25px]">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="font-medium inline-block transition-all rounded-md 2xl:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400"
              >
                {mutation.isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
