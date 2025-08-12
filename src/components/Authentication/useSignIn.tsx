import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login as loginApi } from "../../../services/apiauth";

export function useSignIn() {
  const router = useRouter();

  const {
    mutate: login,
    isPending,
    isError,
  } = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      return await loginApi({ email, password });
    },
    onSuccess: async () => {
      router.refresh(); // ⭐ ضروري علشان توصل الكوكيز للـ server
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  return { login, isPending, isError };
}
