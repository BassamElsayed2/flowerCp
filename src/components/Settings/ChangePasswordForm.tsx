"use client";

import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  const handleChangePassword = async () => {
    setMessage("");
    setLoading(true);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("يرجى ملء جميع الحقول.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("كلمة السر الجديدة غير متطابقة.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClientComponentClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        setMessage("لم يتم العثور على المستخدم.");
        setLoading(false);
        return;
      }

      // تسجيل الدخول لتأكيد كلمة السر الحالية
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setMessage("كلمة السر الحالية غير صحيحة.");
        setLoading(false);
        return;
      }

      // تحديث كلمة السر
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setMessage("حدث خطأ أثناء تحديث كلمة السر.");
      } else {
        setMessage("تم تحديث كلمة السر بنجاح.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.push("/dashboard/my-profile");
      }
    } catch (err) {
      setMessage("حدث خطأ غير متوقع.");
      console.error("Error changing password:", err);
    }

    setLoading(false);
  };

  return (
    <>
      <form>
        <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
          <div className="mb-[20px] sm:mb-0 relative" id="passwordHideShow">
            <label className="mb-[10px] text-black dark:text-white font-medium block">
              الرقم السري الحالي
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              id="password"
              placeholder="Type password"
            />
          </div>

          <div className="mb-[20px] sm:mb-0 relative" id="passwordHideShow2">
            <label className="mb-[10px] text-black dark:text-white font-medium block">
              الرقم السري الجديد
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              id="password2"
              placeholder="Type password"
            />
          </div>

          <div
            className="sm:col-span-2 mb-[20px] sm:mb-0 relative"
            id="passwordHideShow3"
          >
            <label className="mb-[10px] text-black dark:text-white font-medium block">
              تاكيد الرقم السري
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              id="password3"
              placeholder="Type password"
            />
          </div>
        </div>

        {message && <div className="text-sm text-red-500 mt-4">{message}</div>}

        <div className="mt-[20px] md:mt-[25px]">
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={loading}
            className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400"
          >
            <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
              <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                check
              </i>
              {loading ? "جاري التحديث..." : "تاكيد"}
            </span>
          </button>
        </div>
      </form>
    </>
  );
};

export default ChangePasswordForm;
