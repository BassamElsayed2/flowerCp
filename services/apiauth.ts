import supabase from "./supabase";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCurrentUser() {
  const supabase = createClientComponentClient();
  const { data: session } = await supabase.auth.getSession();

  if (!session.session) return null;

  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);

  return data?.user;
}

export async function getAdminProfileById(userId: string) {
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function logout() {
  const supabase = createClientComponentClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);
}
