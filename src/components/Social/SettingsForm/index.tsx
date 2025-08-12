"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useAdminProfile } from "@/components/MyProfile/useAdminProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import supabase from "../../../../services/supabase";
import { profileSchema } from "./lib/validations/schema";
import { z } from "zod";

const SettingsForm: React.FC = () => {
  const { data: profile } = useAdminProfile();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  // تحديث قيم الفورم عندما تتغير بيانات profile
  useEffect(() => {
    if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  const handleProfilePictureChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setProfilePicture(event.target.files[0]);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const submit = async (formData: z.infer<typeof profileSchema>) => {
    try {
      let image_url = profile?.image_url;

      if (profilePicture) {
        image_url = await uploadImage(profilePicture);
      }

      const { error } = await supabase
        .from("admin_profiles")
        .update({
          ...formData,
          image_url,
        })
        .eq("user_id", profile?.user_id);

      if (error) throw error;

      router.refresh();
      router.push("/dashboard/my-profile");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Update error:", error.message);
      } else {
        console.error("Unknown error", error);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(submit)}>
        <div className="gap-[25px]">
          <div className="xl:col-span-3 2xl:col-span-2">
            <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
              <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
                <div className="trezo-card-title">
                  <h5 className="!mb-0">إعدادات الملف الشخصي</h5>
                </div>
              </div>
              <div className="trezo-card-content">
                <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      {...register("full_name")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      عنوان البريد الإلكتروني
                    </label>
                    <input
                      type="text"
                      id="email"
                      {...register("email")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      رقم الهاتف
                    </label>
                    <input
                      type="text"
                      id="phone"
                      {...register("phone")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      الوظيفة
                    </label>
                    <input
                      type="text"
                      id="job_title"
                      {...register("job_title")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                    {errors.job_title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.job_title.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      العنوان
                    </label>
                    <input
                      type="text"
                      id="address"
                      {...register("address")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      عنك
                    </label>
                    <textarea
                      id="about"
                      {...register("about")}
                      className="h-[140px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] p-[17px] block w-full outline-0 transition-all"
                    ></textarea>
                    {errors.about && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.about.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      صورة الملف الشخصي
                    </label>
                    <div id="fileUploader">
                      <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[88px] px-[20px] border border-gray-200 dark:border-[#172036]">
                        <div className="flex items-center justify-center">
                          <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-[12px] rtl:ml-[12px]">
                            <i className="ri-upload-2-line"></i>
                          </div>
                          <p className="leading-[1.5]">
                            <strong className="text-black dark:text-white">
                              انقر للتحميل
                            </strong>
                            <br /> ملفك هنا
                          </p>
                        </div>
                        <input
                          type="file"
                          id="fileInput"
                          accept="image/*"
                          className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                          onChange={handleProfilePictureChange}
                        />
                      </div>

                      {(profilePicture || profile?.image_url) && (
                        <div className="mt-[10px]">
                          <div className="relative w-[80px] h-[80px]">
                            <Image
                              src={
                                profilePicture
                                  ? URL.createObjectURL(profilePicture)
                                  : profile.image_url
                              }
                              alt="profile-preview"
                              width={80}
                              height={80}
                              className="rounded-md"
                            />
                            {profilePicture && (
                              <button
                                type="button"
                                className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs rtl:right-auto rtl:left-[-5px]"
                                onClick={handleRemoveProfilePicture}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-[20px] sm:mt-[25px]">
                  <button
                    type="reset"
                    className="font-medium inline-block transition-all rounded-md 2xl:text-md ltr:mr-[15px] rtl:ml-[15px] py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-danger-500 text-white hover:bg-danger-400"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="font-medium inline-block transition-all rounded-md 2xl:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400"
                  >
                    <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
                      <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                        add
                      </i>
                      حفظ المعلومات
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default SettingsForm;
