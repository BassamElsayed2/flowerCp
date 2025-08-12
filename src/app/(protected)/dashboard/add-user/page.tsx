"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/components/Social/SettingsForm/lib/validations/schema";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type SignUpData = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
  };

  const supabase = createClientComponentClient();

  const submit = async (data: SignUpData) => {
    try {
      // 1. تسجيل المستخدم
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });

      if (signUpError) throw new Error(signUpError.message);

      const userId = signUpData.user?.id;
      if (!userId) throw new Error("فشل في الحصول على معرف المستخدم.");

      // 2. رفع الصورة إن وجدت
      let imageUrl = "";
      if (profilePicture) {
        const fileExt = profilePicture.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, profilePicture);

        if (uploadError) throw new Error(uploadError.message);

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // 3. حفظ البيانات في جدول admin_profiles
      const { error: profileError } = await supabase
        .from("admin_profiles")
        .insert({
          user_id: userId,
          full_name: data.full_name ?? "",
          email: data.email,
          phone: data.phone,
          job_title: data.job_title ?? "",
          address: data.address ?? "",
          about: data.about ?? "",
          image_url: imageUrl,
        });

      if (profileError) throw new Error(profileError.message);

      toast.success("تم إنشاء الحساب بنجاح");
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`فشل التسجيل: ${error.message}`);
      } else {
        toast.error("فشل التسجيل: حدث خطأ غير متوقع");
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
                  <h5 className="!mb-0">تسجيل حساب جديد</h5>
                </div>
              </div>
              <div className="trezo-card-content">
                <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
                  {/* Email */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      كلمة المرور *
                    </label>
                    <input
                      type="password"
                      {...register("password")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      رقم الهاتف *
                    </label>
                    <input
                      type="text"
                      {...register("phone")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Optional Fields */}

                  {/* Full Name */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      {...register("full_name")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                  </div>

                  {/* Job Title */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      الوظيفة
                    </label>
                    <input
                      type="text"
                      {...register("job_title")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                  </div>

                  {/* Address */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      العنوان
                    </label>
                    <input
                      type="text"
                      {...register("address")}
                      className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all"
                    />
                  </div>

                  {/* About */}
                  <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      عنك
                    </label>
                    <textarea
                      {...register("about")}
                      className="h-[140px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] p-[17px] block w-full outline-0 transition-all"
                    ></textarea>
                  </div>

                  {/* Profile Picture */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      صورة الملف الشخصي
                    </label>
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
                        accept="image/*"
                        className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                        onChange={handleProfilePictureChange}
                      />
                    </div>

                    {profilePicture && (
                      <div className="mt-[10px]">
                        <div className="relative w-[80px] h-[80px]">
                          <Image
                            src={URL.createObjectURL(profilePicture)}
                            alt="profile-preview"
                            width={80}
                            height={80}
                            className="rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs rtl:right-auto rtl:left-[-5px]"
                            onClick={handleRemoveProfilePicture}
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
                    className="font-medium inline-block transition-all rounded-md 2xl:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400"
                  >
                    إنشاء حساب
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
