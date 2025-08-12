import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../../../services/apiauth";

export function useUser() {
  const { data: user, isPending } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    enabled: true,
  });

  return { user, isPending, isAuthanticated: user?.role === "authenticated" };
}
