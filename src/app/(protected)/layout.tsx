// app/(protected)/layout.tsx
import LayoutProvider from "@/providers/LayoutProvider";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <LayoutProvider>
      {children}
      <Toaster />
    </LayoutProvider>
  );
}
