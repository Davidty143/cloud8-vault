import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // Await cookies() to ensure proper retrieval of the cookie store in server-side context
  const cookieStore = await cookies(); // Await the cookies store

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Get a specific cookie value
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // Set a cookie with specified options
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle error when `set` is called from a server-side component
          }
        },
        // Remove a specific cookie
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Handle error when `remove` is called from a server-side component
          }
        },
      },
    }
  );
}
