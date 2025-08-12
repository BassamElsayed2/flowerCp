"use client";

import React, { useEffect } from "react";
import { useUser } from "./Authentication/useUser";
import { useRouter } from "next/navigation";
import loading from "@/app/loading";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { isPending, isAuthanticated } = useUser();

  useEffect(() => {
    if (!isAuthanticated && !isPending) {
      router.replace("/authentication/sign-in");
    }
  }, [isAuthanticated, isPending, router]);

  if (isPending) return loading();

  return <>{children}</>;
}
