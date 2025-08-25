"use server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function getSession() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function signInWithProvider(provider: "google"|"apple") {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signInWithOAuth({ 
    provider, 
    options: { redirectTo: process.env.NEXT_PUBLIC_APP_URL } 
  });
  if (error) throw error; 
  return data.url;
}

export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
}
