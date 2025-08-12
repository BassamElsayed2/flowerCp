// hooks/useAdminProfile.ts
import { useQuery } from "@tanstack/react-query";

import { useUser } from "@/components/Authentication/useUser";
import { getAdminProfileById } from "../../../services/apiauth";

export function useAdminProfile() {
  const { user } = useUser();

  return useQuery({
    queryKey: ["adminProfile", user?.id],
    queryFn: () => getAdminProfileById(user!.id),
    enabled: !!user?.id, // ما يشتغلش غير لما يكون فيه user
  });
}
