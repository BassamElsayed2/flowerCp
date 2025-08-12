"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLogout } from "@/components/Authentication/useLogout";

interface SidebarMenuProps {
  toggleActive: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ toggleActive }) => {
  const pathname = usePathname();

  const { logout } = useLogout();

  // Initialize openIndex to 0 to open the first item by default
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <>
      <div className="sidebar-area bg-white dark:bg-[#0c1427] fixed z-[7] top-0 h-screen transition-all rounded-r-md">
        <div className="logo bg-white dark:bg-[#0c1427] border-b border-gray-100 dark:border-[#172036] px-[25px] pt-[19px] pb-[15px] absolute z-[2] right-0 top-0 left-0">
          <Link
            href="/dashboard"
            className="transition-none relative flex items-center outline-none"
          >
            <Image
              src="/images/logo-icon.svg"
              alt="logo-icon"
              width={26}
              height={26}
            />
            <span className="font-bold text-black dark:text-white relative ltr:ml-[8px] rtl:mr-[8px] top-px text-xl">
              ENS
            </span>
          </Link>

          <button
            type="button"
            className="burger-menu inline-block absolute z-[3] top-[24px] ltr:right-[25px] rtl:left-[25px] transition-all hover:text-primary-500"
            onClick={toggleActive}
          >
            <i className="material-symbols-outlined">close</i>
          </button>
        </div>

        <div className="pt-[89px] px-[22px] pb-[20px] h-screen overflow-y-scroll sidebar-custom-scrollbar">
          <div className="accordion">
            <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs">
              رئيسي
            </span>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  openIndex === 0 ? "open" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(0)}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  newspaper
                </i>
                <span className="title leading-none">المنتجات</span>
              </button>

              {/* المنتجات */}
              <div className="pt-[4px]">
                <ul className="sidebar-sub-menu">
                  <div
                    className={`accordion-collapse ${
                      openIndex === 0 ? "open" : "hidden"
                    }`}
                  >
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/news"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard/news/" ? "active" : ""
                        }`}
                      >
                        <i className="ri-list-check-2  transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px"></i>
                        قائمة المنتجات
                      </Link>
                    </li>
                  </div>
                  <div
                    className={`accordion-collapse ${
                      openIndex === 0 ? "open" : "hidden"
                    }`}
                  >
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/news/create-news"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard/news/create-news"
                            ? "active"
                            : ""
                        }`}
                      >
                        <i className="ri-newspaper-line  transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px"></i>
                        إنشاء منتج
                      </Link>
                    </li>
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/news/categories/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard/news/categories/"
                            ? "active"
                            : ""
                        }`}
                      >
                        <i className="ri-price-tag-3-line  transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px"></i>
                        تصنيفات
                      </Link>
                    </li>
                  </div>
                </ul>
              </div>
            </div>

            {/* <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  openIndex === 1 ? "open" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(1)}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  photo_library
                </i>

                <span className="title leading-none">صور</span>
              </button>

              <div className="pt-[4px]">
                <ul className="sidebar-sub-menu">
                  <div
                    className={`accordion-collapse ${
                      openIndex === 1 ? "open" : "hidden"
                    }`}
                  >
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/images-gallery"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard/images-gallery/"
                            ? "active"
                            : ""
                        }`}
                      >
                        <i className="ri-multi-image-fill  transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px"></i>
                        معرض الصور
                      </Link>
                    </li>
                  </div>
                  <div
                    className={`accordion-collapse ${
                      openIndex === 1 ? "open" : "hidden"
                    }`}
                  >
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/images-gallery/create-gallery"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard/images/create-gallery"
                            ? "active"
                            : ""
                        }`}
                      >
                        <i className="ri-image-ai-line transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px"></i>
                        إنشاء معرض
                      </Link>
                    </li>
                  </div>
                </ul>
              </div>
            </div> */}

            {/* <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  openIndex === 2 ? "open" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(2)}
              >
                <span className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  paid
                </span>

                <span className="title leading-none">العروض</span>
              </button>

              <div className="pt-[4px]">
                <ul className="sidebar-sub-menu">
                  <div
                    className={`accordion-collapse ${
                      openIndex === 2 ? "open" : "hidden"
                    }`}
                  >
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/ads/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard/ads/" ? "active" : ""
                        }`}
                      >
                        <i className="ri-menu-search-line  transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px"></i>
                        قائمة العروض
                      </Link>
                    </li>
                  </div>
                  <div
                    className={`accordion-collapse ${
                      openIndex === 2 ? "open" : "hidden"
                    }`}
                  >
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/ads/create-combo-offer"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard/ads/create-combo-offer"
                            ? "active"
                            : ""
                        }`}
                      >
                        <i className="ri-file-add-line transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px"></i>
                        إنشاء عرض
                      </Link>
                    </li>
                  </div>
                </ul>
              </div>
            </div> */}

            {/* <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  openIndex === 3 ? "open" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(3)}
              >
                <span className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  map
                </span>

                <span className="title leading-none">الفروع</span>
              </button>

              <div className="pt-[4px]">
                <ul className="sidebar-sub-menu">
                  <div
                    className={`accordion-collapse ${
                      openIndex === 3 ? "open" : "hidden"
                    }`}
                  >
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/branches/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard/branches/" ? "active" : ""
                        }`}
                      >
                        <i className="ri-map-pin-line  transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px"></i>
                        قائمة الفروع
                      </Link>
                    </li>
                  </div>
                  <div
                    className={`accordion-collapse ${
                      openIndex === 3 ? "open" : "hidden"
                    }`}
                  >
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/branches/create-branch"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard/branches/create-branch"
                            ? "active"
                            : ""
                        }`}
                      >
                        <i className="ri-map-pin-add-line transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px"></i>
                        إنشاء فرع
                      </Link>
                    </li>
                  </div>
                </ul>
              </div>
            </div> */}

            <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs [&:not(:first-child)]:mt-[22px]">
              أخري
            </span>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/dashboard/my-profile/"
                className={`accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard/my-profile/" ? "active" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  account_circle
                </i>
                <span className="title leading-none">ملفي الشخصي</span>
              </Link>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  openIndex === 29 ? "open" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(29)}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  settings
                </i>
                <span className="title leading-none">إعدادات</span>
              </button>

              <div
                className={`accordion-collapse ${
                  openIndex === 29 ? "open" : "hidden"
                }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/my-profile/edit/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard/my-profile/edit/"
                            ? "active"
                            : ""
                        }`}
                      >
                        إعدادات الحساب
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/my-profile/change-password/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard/my-profile/change-password/"
                            ? "active"
                            : ""
                        }`}
                      >
                        تغيير كلمة المرور
                      </Link>
                    </li>
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/add-user/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                          pathname === "/dashboard/add-user/" ? "active" : ""
                        }`}
                      >
                        أضف مستخدم
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                onClick={() => logout()}
                className={`accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
                  pathname === "/" ? "active" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  logout
                </i>
                <span className="title leading-none">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
