import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";
import supabase from "../../../../services/supabase";

interface UpdateCategoryPayload {
  id: string;
  name_ar: string;
  name_en: string;
  image?: File;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  const { mutate: updateCategory, isPending } = useMutation({
    mutationFn: async ({
      id,
      name_ar,
      name_en,
      image,
    }: UpdateCategoryPayload) => {
      let image_url = undefined;

      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${id}-${Date.now()}.${fileExt}`;
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
        .update({ name_ar, name_en, image_url })
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("تم تحديث التصنيف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error("فشل في تحديث التصنيف: " + error.message);
    },
  });

  return { updateCategory, isPending };
}
