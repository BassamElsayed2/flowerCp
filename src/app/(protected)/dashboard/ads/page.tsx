"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComboOffers,
  getComboOfferById,
  updateComboOffer,
  deleteComboOffer,
  uploadComboOfferImage,
  deleteComboOfferImage,
  type ComboOffer,
  type UpdateComboOfferData,
} from "../../../../../services/apiComboOffers";

type FormData = {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  total_price: number;
  starts_at: string | null;
  ends_at: string | null;
};

const ComboOffersList: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<ComboOffer | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const offersPerPage = 8;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>();

  // React Query hooks
  const { data: comboOffersList = [], isLoading } = useQuery({
    queryKey: ["comboOffers"],
    queryFn: getComboOffers,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateComboOfferData }) =>
      updateComboOffer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comboOffers"] });
      toast.success("تم تحديث العرض بنجاح");
      setIsEditModalOpen(false);
      reset();
      setSelectedImage(null);
      setPreviewImage(null);
      setSelectedOffer(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComboOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comboOffers"] });
      toast.success("تم حذف العرض بنجاح");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteOffer = async (id: string) => {
    // Show confirmation toast
    const confirmed = await new Promise((resolve) => {
      toast(
        (t) => (
          <div className="flex items-center gap-2">
            <span>هل أنت متأكد من حذف هذا العرض؟</span>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
              >
                نعم
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
              >
                لا
              </button>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: "top-center",
        }
      );
    });

    if (!confirmed) return;

    try {
      // First get the offer to get its image URL
      const offer = await getComboOfferById(id);

      // Delete the image from storage if it exists
      if (offer.image_url) {
        await deleteComboOfferImage(offer.image_url);
      }

      // Delete the combo offer record
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleEditClick = (offer: ComboOffer) => {
    setSelectedOffer(offer);
    setValue("title_ar", offer.title_ar);
    setValue("title_en", offer.title_en);
    setValue("description_ar", offer.description_ar || "");
    setValue("description_en", offer.description_en || "");
    setValue("total_price", offer.total_price);
    setValue(
      "starts_at",
      offer.starts_at ? offer.starts_at.split("T")[0] : null
    );
    setValue("ends_at", offer.ends_at ? offer.ends_at.split("T")[0] : null);
    setPreviewImage(offer.image_url);
    setIsEditModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onEditSubmit = async (data: FormData) => {
    if (!selectedOffer) return;

    try {
      let imageUrl = selectedOffer.image_url;

      if (selectedImage) {
        imageUrl = await uploadComboOfferImage(selectedImage);
      }

      const updateData: UpdateComboOfferData = {
        ...data,
        image_url: imageUrl,
        starts_at: data.starts_at || null,
        ends_at: data.ends_at || null,
      };

      await updateMutation.mutateAsync({
        id: selectedOffer.id,
        data: updateData,
      });
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // ✅ البحث والفلترة
  const filteredOffers = comboOffersList.filter((offer) => {
    const matchesSearch =
      offer.title_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.title_en.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredOffers.length / offersPerPage);
  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * offersPerPage,
    currentPage * offersPerPage
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
    }).format(price);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-EG");
  };

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
      <div className="trezo-tabs combo-offers-tabs">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-[20px] md:mb-[25px] gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="ابحث عن عرض..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-[#15203c] dark:text-white"
              />
              <i className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </i>
            </div>
          </div>
          <Link
            href="/dashboard/ads/create-combo-offer"
            className="inline-block transition-all rounded-md font-medium px-[13px] py-[6px] text-primary-500 border border-primary-500 hover:bg-primary-500 hover:text-white"
          >
            <span className="relative pl-6">
              <i className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2">
                add
              </i>
              أضف عرض جديد
            </span>
          </Link>
        </div>

        <div className="table-responsive overflow-x-auto">
          <table className="w-full">
            <thead className="text-black dark:text-white text-end">
              <tr>
                {[
                  "العنوان",
                  "الوصف",
                  "السعر",
                  "تاريخ البداية",
                  "تاريخ النهاية",
                  "الصورة",
                  "التاريخ",
                  "أجرأت",
                ].map((head, i) => (
                  <th
                    key={i}
                    className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-gray-50 dark:bg-[#15203c]"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-5 text-center text-gray-400">
                    جاري التحميل...
                  </td>
                </tr>
              ) : paginatedOffers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-5 text-center text-gray-400">
                    لا توجد عروض.
                  </td>
                </tr>
              ) : (
                paginatedOffers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="border-t border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-3 px-3 font-semibold">
                      {offer.title_ar}
                    </td>
                    <td className="py-3 px-3">
                      <div
                        className="max-w-[200px] truncate"
                        title={offer.description_ar || ""}
                      >
                        {offer.description_ar || "لا يوجد وصف"}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-primary-500">
                      {formatPrice(offer.total_price)}
                    </td>
                    <td className="py-3 px-3">{formatDate(offer.starts_at)}</td>
                    <td className="py-3 px-3">{formatDate(offer.ends_at)}</td>
                    <td className="py-3 px-3">
                      {offer.image_url ? (
                        <Image
                          src={offer.image_url}
                          alt={offer.title_en}
                          width={60}
                          height={40}
                          className="rounded"
                        />
                      ) : (
                        <div className="w-[60px] h-[40px] bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <i className="material-symbols-outlined text-gray-400">
                            image
                          </i>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {new Date(offer.created_at).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(offer)}
                          className="text-primary-500 leading-none"
                        >
                          <i className="material-symbols-outlined !text-md">
                            edit
                          </i>
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="text-danger-500 leading-none"
                        >
                          <i className="material-symbols-outlined !text-md">
                            delete
                          </i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#0c1427] p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-black dark:text-white">
                  تعديل العرض
                </h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    reset();
                    setSelectedImage(null);
                    setPreviewImage(null);
                    setSelectedOffer(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <i className="material-symbols-outlined">close</i>
                </button>
              </div>

              <form onSubmit={handleSubmit(onEditSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      العنوان (ar)
                    </label>
                    <input
                      {...register("title_ar", { required: true })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.title_ar && (
                      <p className="text-red-500 mt-1">مطلوب</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      العنوان (en)
                    </label>
                    <input
                      {...register("title_en", { required: true })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.title_en && (
                      <p className="text-red-500 mt-1">Required</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      الوصف (ar)
                    </label>
                    <textarea
                      {...register("description_ar")}
                      rows={3}
                      className="rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 py-2 block w-full outline-0 transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      الوصف (en)
                    </label>
                    <textarea
                      {...register("description_en")}
                      rows={3}
                      className="rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 py-2 block w-full outline-0 transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      السعر الإجمالي
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("total_price", { required: true, min: 0 })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.total_price && (
                      <p className="text-red-500 mt-1">مطلوب</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      تاريخ البداية
                    </label>
                    <input
                      type="date"
                      {...register("starts_at")}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      تاريخ النهاية
                    </label>
                    <input
                      type="date"
                      {...register("ends_at")}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      الصورة
                    </label>
                    <div className="relative flex items-center justify-center overflow-hidden rounded-md py-8 px-4 border border-gray-200 dark:border-[#172036]">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-3 rtl:ml-3">
                          <i className="ri-upload-2-line"></i>
                        </div>
                        <p className="text-black dark:text-white">
                          <strong>Click to upload</strong>
                          <br /> your file here
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                      />
                    </div>

                    {previewImage && (
                      <div className="mt-2 flex flex-wrap gap-2">
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

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      reset();
                      setSelectedImage(null);
                      setPreviewImage(null);
                      setSelectedOffer(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
                  >
                    {updateMutation.isPending
                      ? "جارٍ الحفظ..."
                      : "حفظ التغييرات"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md mx-1 text-sm ${
                  currentPage === i + 1
                    ? "bg-primary-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboOffersList;
