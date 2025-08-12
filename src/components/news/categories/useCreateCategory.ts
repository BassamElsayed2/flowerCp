import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import supabase from "../../../../services/supabase";

export function useAddCategory() {
  const queryClient = useQueryClient();

  const { mutate: addCategory, isPending } = useMutation({
    mutationFn: async ({
      name_ar,
      name_en,
      image,
    }: {
      name_ar: string;
      name_en: string;
      image?: File;
    }) => {
      let image_url = undefined;

      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("cat-img")
          .upload(fileName, image);

        if (uploadError) throw new Error(uploadError.message);

        const {
          data: { publicUrl },
        } = supabase.storage.from("cat-img").getPublicUrl(fileName);

        image_url = publicUrl;
      }

      const { error } = await supabase
        .from("categories")
        .insert([{ name_ar, name_en, image_url }]);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("تمت إضافة التصنيف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error("فشل في إضافة التصنيف: " + error.message);
    },
  });

  return { addCategory, isPending };
}
