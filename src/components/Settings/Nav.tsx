"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Nav: React.FC = () => {
  const pathname = usePathname();

  return (
    <>
      <ul className="mb-[10px]">
        <li className="inline-block mb-[15px] ltr:mr-[11px] rtl:ml-[11px] ltr:last:mr-0 rtl:last:ml-0">
          <Link
            href="/dashboard/my-profile/edit/"
            className={`block rounded-md font-medium py-[8.5px] px-[15px] text-primary-500 border border-primary-500 transition-all  ${
              pathname === "/dashboard/my-profile/edit/"
                ? "bg-primary-500 text-white"
                : ""
            }`}
          >
            إعدادات الحساب
          </Link>
        </li>

        <li className="inline-block mb-[15px] ltr:mr-[11px] rtl:ml-[11px] ltr:last:mr-0 rtl:last:ml-0">
          <Link
            href="/dashboard/my-profile/change-password/"
            className={`block rounded-md font-medium py-[8.5px] px-[15px] text-primary-500 border border-primary-500 transition-all  ${
              pathname === "/dashboard/my-profile/change-password/"
                ? "bg-primary-500 text-white"
                : ""
            }`}
          >
            تغيير كلمة المرور
          </Link>
        </li>
      </ul>
    </>
  );
};

export default Nav;
