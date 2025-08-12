"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import supabase from "../../../../../services/supabase";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

export interface Branch {
  id: string;
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
  created_at: string;
}

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
};

const BranchesList: React.FC = () => {
  const [branchesList, setBranchesList] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const branchesPerPage = 8;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>();

  useEffect(() => {
    const fetchBranches = async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching branches:", error.message);
      } else {
        setBranchesList(data as Branch[]);
      }
    };

    fetchBranches();
  }, []);

  const handleDeleteBranch = async (id: string) => {
    try {
      // First get the branch to get its image URL
      const { data: branch, error: fetchError } = await supabase
        .from("branches")
        .select("image")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw new Error("فشل في جلب بيانات الفرع");
      }

      // Extract the file path from the image URL
      const imageUrl = branch.image;
      if (imageUrl) {
        const urlParts = imageUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];

        if (fileName) {
          // Delete the image from storage
          const { error: storageError } = await supabase.storage
            .from("branches")
            .remove([fileName]);

          if (storageError) {
            console.error("Error deleting image:", storageError);
            throw new Error("فشل في حذف الصورة من التخزين");
          }
        }
      }

      // Delete the branch record
      const { error: deleteError } = await supabase
        .from("branches")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw new Error("فشل في حذف الفرع");
      }

      setBranchesList((prev) => prev.filter((branch) => branch.id !== id));
      toast.success("تم حذف الفرع والصورة بنجاح");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleEditClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setValue("name_ar", branch.name_ar);
    setValue("name_en", branch.name_en);
    setValue("area_ar", branch.area_ar);
    setValue("area_en", branch.area_en);
    setValue("address_ar", branch.address_ar);
    setValue("address_en", branch.address_en);
    setValue("works_hours", branch.works_hours);
    setValue("phone", branch.phone);
    setValue("google_map", branch.google_map);
    setPreviewImage(branch.image);
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
    if (!selectedBranch) return;
    setLoading(true);

    try {
      let imageUrl = selectedBranch.image;

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

      const { error: updateError } = await supabase
        .from("branches")
        .update({ ...data, image: imageUrl })
        .eq("id", selectedBranch.id);

      if (updateError) {
        throw new Error("حدث خطأ أثناء تحديث البيانات");
      }

      setBranchesList((prev) =>
        prev.map((branch) =>
          branch.id === selectedBranch.id
            ? { ...branch, ...data, image: imageUrl }
            : branch
        )
      );

      toast.success("تم تحديث الفرع بنجاح");
      setIsEditModalOpen(false);
      reset();
      setSelectedImage(null);
      setPreviewImage(null);
      setSelectedBranch(null);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ البحث والفلترة
  const filteredBranches = branchesList.filter((branch) => {
    const matchesSearch =
      branch.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.area_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.area_en.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredBranches.length / branchesPerPage);
  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * branchesPerPage,
    currentPage * branchesPerPage
  );

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
      <div className="trezo-tabs branches-tabs">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-[20px] md:mb-[25px] gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="ابحث عن فرع..."
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
            href="/dashboard/branches/create-branch"
            className="inline-block transition-all rounded-md font-medium px-[13px] py-[6px] text-primary-500 border border-primary-500 hover:bg-primary-500 hover:text-white"
          >
            <span className="relative pl-6">
              <i className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2">
                add
              </i>
              أضف فرع جديد
            </span>
          </Link>
        </div>

        <div className="table-responsive overflow-x-auto">
          <table className="w-full">
            <thead className="text-black dark:text-white text-end">
              <tr>
                {[
                  "اسم الفرع",
                  "المنطقة",
                  "الصوره",
                  "رقم الهاتف",
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
              {paginatedBranches.map((branch) => (
                <tr
                  key={branch.id}
                  className="border-t border-gray-100 dark:border-gray-800"
                >
                  <td className="py-3 px-3 font-semibold">
                    <div>
                      <div className="font-bold">{branch.name_ar}</div>
                      <div className="text-sm text-gray-500">
                        {branch.name_en}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div>
                      <div className="font-medium">{branch.area_ar}</div>
                      <div className="text-sm text-gray-500">
                        {branch.area_en}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {branch.image ? (
                      <Image
                        src={branch.image}
                        alt={branch.name_ar}
                        width={60}
                        height={40}
                        className="rounded"
                      />
                    ) : (
                      <div className="w-[60px] h-[40px] bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 text-xs">
                        لا توجد صورة
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3">{branch.phone || "غير محدد"}</td>
                  <td className="py-3 px-3">
                    {new Date(branch.created_at).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(branch)}
                        className="text-primary-500 leading-none"
                      >
                        <i className="material-symbols-outlined !text-md">
                          edit
                        </i>
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="text-danger-500 leading-none"
                      >
                        <i className="material-symbols-outlined !text-md">
                          delete
                        </i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedBranches.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-5 text-center text-gray-400">
                    لا توجد فروع.
                  </td>
                </tr>
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
                  تعديل الفرع
                </h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    reset();
                    setSelectedImage(null);
                    setPreviewImage(null);
                    setSelectedBranch(null);
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
                      اسم الفرع (ar)
                    </label>
                    <input
                      {...register("name_ar", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "الاسم يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.name_ar && (
                      <p className="text-red-500 mt-1">
                        {errors.name_ar.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      اسم الفرع (en)
                    </label>
                    <input
                      {...register("name_en", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "الاسم يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.name_en && (
                      <p className="text-red-500 mt-1">
                        {errors.name_en.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      اسم المنطقة (ar)
                    </label>
                    <input
                      {...register("area_ar", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "اسم المنطقة يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.area_ar && (
                      <p className="text-red-500 mt-1">
                        {errors.area_ar.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      اسم المنطقة (en)
                    </label>
                    <input
                      {...register("area_en", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "اسم المنطقة يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.area_en && (
                      <p className="text-red-500 mt-1">
                        {errors.area_en.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      العنوان (ar)
                    </label>
                    <input
                      {...register("address_ar", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.address_ar && (
                      <p className="text-red-500 mt-1">
                        {errors.address_ar.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      العنوان (en)
                    </label>
                    <input
                      {...register("address_en", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.address_en && (
                      <p className="text-red-500 mt-1">
                        {errors.address_en.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      ساعات العمل
                    </label>
                    <input
                      {...register("works_hours", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "ساعات العمل يجب أن تكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.works_hours && (
                      <p className="text-red-500 mt-1">
                        {errors.works_hours.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      رقم الهاتف
                    </label>
                    <input
                      {...register("phone", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "رقم الهاتف يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.phone && (
                      <p className="text-red-500 mt-1">
                        {errors.phone.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      الموقع الجغرافي (google map)
                    </label>
                    <input
                      {...register("google_map", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "الرابط يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-4 block w-full outline-0 transition-all"
                    />
                    {errors.google_map && (
                      <p className="text-red-500 mt-1">
                        {errors.google_map.message || "مطلوب"}
                      </p>
                    )}
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
                      setSelectedBranch(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
                  >
                    {loading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
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

export default BranchesList;
