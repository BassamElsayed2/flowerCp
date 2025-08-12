import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";
import supabase from "../../../../services/supabase";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  const { mutate: deleteCategory, isPending } = useMutation({
    mutationFn: async (id: string) => {
      // First, get the category to check if it has an image
      const { data: category, error: fetchError } = await supabase
        .from("categories")
        .select("image_url")
        .eq("id", id)
        .single();

      if (fetchError) throw new Error(fetchError.message);

      // If the category has an image, delete it from storage
      if (category?.image_url) {
        // Extract the file name from the URL
        const imageUrl = new URL(category.image_url);
        const fileName = imageUrl.pathname.split("/").pop();

        if (fileName) {
          const { error: deleteImageError } = await supabase.storage
            .from("cat-img")
            .remove([fileName]);

          if (deleteImageError) {
            console.error("Error deleting image:", deleteImageError);
            // Continue with category deletion even if image deletion fails
          }
        }
      }

      // Delete the category
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("تم حذف التصنيف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error("فشل في حذف التصنيف: " + error.message);
    },
  });

  return { deleteCategory, isPending };
}
