import { z } from "zod";

export const profileSchema = z.object({
  full_name: z.string().min(1, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  address: z.string().optional(),
  about: z.string().optional(),
});

export const signUpSchema = z.object({
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  full_name: z.string().min(1, "الاسم الكامل مطلوب"),
  job_title: z.string().optional(),
  address: z.string().optional(),
  about: z.string().optional(),
});

export const gallerySchema = z.object({
  title_ar: z.string().min(1, "العنوان بالعربية مطلوب").max(100),
  title_en: z.string().min(1, "العنوان بالإنجليزية مطلوب").max(100),
  description_ar: z.string().optional(),
  description_en: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
