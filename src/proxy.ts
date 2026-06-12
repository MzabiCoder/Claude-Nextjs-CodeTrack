import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnProfile = req.nextUrl.pathname.startsWith("/profile");
  const isOnSettings = req.nextUrl.pathname.startsWith("/settings");
  const isOnItems = req.nextUrl.pathname.startsWith("/items");
  const isOnCollections = req.nextUrl.pathname.startsWith("/collections");
  const isOnFavorites = req.nextUrl.pathname.startsWith("/favorites");

  if ((isOnDashboard || isOnProfile || isOnSettings || isOnItems || isOnCollections || isOnFavorites) && !isLoggedIn) {
    const signInUrl = new URL("/sign-in", req.nextUrl);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
