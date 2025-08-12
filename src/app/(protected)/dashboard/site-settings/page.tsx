"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import { getAboutUs } from "../../../../../services/apiAboutUs";
import type { SiteSettings } from "../../../../../services/apiAboutUs";
import Image from "next/image";

export default function SiteSettings() {
  const { data: site_settings } = useQuery<SiteSettings>({
    queryKey: ["site_settings"],
    queryFn: getAboutUs,
  });

  console.log(site_settings);

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0">
          {" "}
          <Link href={"/dashboard/site-settings/edit"}>
            <i className="ri-edit-2-line text-2xl hover:text-blue-600 cursor-pointer"></i>
          </Link>{" "}
          إعدادات الصفحة
        </h5>

        <ol className="breadcrumb mt-[12px] md:mt-0">
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              href="/dashboard/ecommerce/"
              className="inline-block relative ltr:pl-[22px] rtl:pr-[22px] transition-all hover:text-primary-500"
            >
              <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 !text-lg -mt-px text-primary-500 top-1/2 -translate-y-1/2">
                home
              </i>
              لوحة التحكم
            </Link>
          </li>

          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            الصفحه الامامية
          </li>
        </ol>
      </div>

      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md text-center">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
          <div className="trezo-card-title">
            <h5 className="!mb-0"> الصفحه الامامية</h5>
          </div>
        </div>
        <div className="trezo-card-content">
          {site_settings?.logo_url && (
            <div className="mb-6">
              <Image
                src={site_settings.logo_url}
                alt="Site Logo"
                width={200}
                height={200}
                className="mx-auto"
              />
            </div>
          )}

          <ul>
            <li className="mb-[12.5px] last:mb-0">
              اسم الموقع بالعربي:
              <span className="text-black dark:text-white font-medium">
                {"  "}
                {site_settings?.site_name_ar}
              </span>
            </li>
          </ul>
          <ul>
            <li className="mb-[12.5px] last:mb-0">
              اسم الموقع بالانجليزي:
              <span className="text-black dark:text-white font-medium">
                {"  "}
                {site_settings?.site_name_en}
              </span>
            </li>
          </ul>

          <span className="text-black dark:text-white font-semibold block mb-[5px] mt-[16px]">
            عن الموقع بالعربي
          </span>

          <div>
            <div
              dangerouslySetInnerHTML={{
                __html: site_settings?.about_us_ar || "",
              }}
              className="text-black dark:text-white font-medium"
            />
          </div>

          <span className="text-black dark:text-white font-semibold block mb-[5px] mt-[16px]">
            About Us
          </span>

          <div>
            <div
              dangerouslySetInnerHTML={{
                __html: site_settings?.about_us_en || "",
              }}
              className="text-black dark:text-white font-medium"
            />
          </div>
        </div>
      </div>
    </>
  );
}
