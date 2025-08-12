"use client";

import { useState } from "react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import {
  Editor,
  EditorProvider,
  ContentEditableEvent,
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnRedo,
  BtnStrikeThrough,
  BtnStyles,
  BtnUnderline,
  BtnUndo,
  HtmlButton,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg";
import { useRouter } from "next/navigation";

const SiteSettings: React.FC = () => {
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // Text Editor
  const [aboutUsAr, setAboutUsAr] = useState<string>(
    "Type your message here..."
  );
  const [aboutUsEn, setAboutUsEn] = useState<string>(
    "Type your message here..."
  );
  const [siteNameAr, setSiteNameAr] = useState("");
  const [siteNameEn, setSiteNameEn] = useState("");

  function onChange(e: ContentEditableEvent) {
    setAboutUsAr(e.target.value);
  }

  function onChangeEn(e: ContentEditableEvent) {
    setAboutUsEn(e.target.value);
  }

  // Upload Image
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedImages((prevImages) => [...prevImages, ...filesArray]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !siteNameAr.trim() ||
      !siteNameEn.trim() ||
      aboutUsAr === "Type your message here..." ||
      aboutUsEn === "Type your message here..."
    ) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);

    try {
      let logoUrl = "";

      // Upload logo if exists
      if (selectedImages.length > 0) {
        const file = selectedImages[0];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("logo")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw new Error(uploadError.message);

        const {
          data: { publicUrl },
        } = supabase.storage.from("logo").getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      // Insert site settings
      const { error: insertError } = await supabase
        .from("site_settings")
        .upsert({
          site_name_ar: siteNameAr,
          site_name_en: siteNameEn,
          about_us_ar: aboutUsAr,
          about_us_en: aboutUsEn,
          logo_url: logoUrl,
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw new Error(insertError.message);

      toast.success("تم حفظ الإعدادات بنجاح");
      router.push("/dashboard/site-settings");
    } catch (error) {
      console.error("Error saving site settings:", error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
          <div className="trezo-card-content">
            <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
              <div className="mb-[20px] sm:mb-0">
                <label className="mb-[10px] text-black dark:text-white font-medium block">
                  اسم الموقع (العربي)
                </label>
                <input
                  type="text"
                  value={siteNameAr}
                  onChange={(e) => setSiteNameAr(e.target.value)}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                  placeholder="اسم الموقع"
                />
              </div>

              <div className="mb-[20px] sm:mb-0">
                <label className="mb-[10px] text-black dark:text-white font-medium block">
                  اسم الموقع (الانجليزي)
                </label>
                <input
                  type="text"
                  value={siteNameEn}
                  onChange={(e) => setSiteNameEn(e.target.value)}
                  className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                  placeholder="Site Name"
                />
              </div>

              <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                <label className="mb-[10px] text-black dark:text-white font-medium block">
                  وصف الموقع (العربي)
                </label>
                <EditorProvider>
                  <Editor
                    value={aboutUsAr}
                    onChange={onChange}
                    style={{ minHeight: "200px" }}
                    className="rsw-editor"
                  >
                    <Toolbar>
                      <BtnUndo />
                      <BtnRedo />
                      <Separator />
                      <BtnBold />
                      <BtnItalic />
                      <BtnUnderline />
                      <BtnStrikeThrough />
                      <Separator />
                      <BtnNumberedList />
                      <BtnBulletList />
                      <Separator />
                      <BtnLink />
                      <BtnClearFormatting />
                      <HtmlButton />
                      <Separator />
                      <BtnStyles />
                    </Toolbar>
                  </Editor>
                </EditorProvider>
              </div>

              <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                <label className="mb-[10px] text-black dark:text-white font-medium block">
                  وصف الموقع ( الانجليزي)
                </label>
                <EditorProvider>
                  <Editor
                    value={aboutUsEn}
                    onChange={onChangeEn}
                    style={{ minHeight: "200px" }}
                    className="rsw-editor"
                  >
                    <Toolbar>
                      <BtnUndo />
                      <BtnRedo />
                      <Separator />
                      <BtnBold />
                      <BtnItalic />
                      <BtnUnderline />
                      <BtnStrikeThrough />
                      <Separator />
                      <BtnNumberedList />
                      <BtnBulletList />
                      <Separator />
                      <BtnLink />
                      <BtnClearFormatting />
                      <HtmlButton />
                      <Separator />
                      <BtnStyles />
                    </Toolbar>
                  </Editor>
                </EditorProvider>
              </div>
            </div>

            <div className="my-[20px]">
              <label className="mb-[10px] text-black dark:text-white font-medium block">
                لوجو الموقع
              </label>
              <div id="fileUploader">
                <div className="relative flex items-center justify-center overflow-hidden rounded-md py-[88px] px-[20px] border border-gray-200 dark:border-[#172036]">
                  <div className="flex items-center justify-center">
                    <div className="w-[35px] h-[35px] border border-gray-100 dark:border-[#15203c] flex items-center justify-center rounded-md text-primary-500 text-lg ltr:mr-[12px] rtl:ml-[12px]">
                      <i className="ri-upload-2-line"></i>
                    </div>
                    <p className="leading-[1.5]">
                      <strong className="text-black dark:text-white">
                        اضافة صورة
                      </strong>
                      <br /> لوجو الموقع
                    </p>
                  </div>
                  <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                  />
                </div>

                {/* Image Previews */}
                <div className="mt-[10px] flex flex-wrap gap-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative w-[50px] h-[50px]">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt="product-preview"
                        width={50}
                        height={50}
                        className="rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs rtl:right-auto rtl:left-[-5px]"
                        onClick={() => handleRemoveImage(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-[20px] md:mt-[25px]">
              <button
                type="button"
                className="font-medium inline-block transition-all rounded-md md:text-md ltr:mr-[15px] rtl:ml-[15px] py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-danger-500 text-white hover:bg-danger-400"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
                  <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                    {isLoading ? "hourglass_empty" : "save"}
                  </i>
                  {isLoading ? "جاري الحفظ..." : "حفظ الإعدادات"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default SiteSettings;
