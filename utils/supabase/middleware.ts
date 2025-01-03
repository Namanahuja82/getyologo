// utils/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const user = await supabase.auth.getUser();

    // Redirect to sign-in for protected routes when not authenticated
    if (request.nextUrl.pathname.startsWith("/protected") && user.error) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Redirect authenticated users from root to main-page
    if (request.nextUrl.pathname === "/" && !user.error) {
      return NextResponse.redirect(new URL("/main-page", request.url));
    }

    // Redirect to sign-up when trying to generate logos while not authenticated
    if (request.nextUrl.pathname === "/main-page" && user.error) {
      return NextResponse.redirect(new URL("/sign-up", request.url));
    }

    // Redirect authenticated users trying to access sign-in/sign-up to main-page
    if ((request.nextUrl.pathname === "/sign-in" || request.nextUrl.pathname === "/sign-up") && !user.error) {
      return NextResponse.redirect(new URL("/main-page", request.url));
    }

    return response;
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};