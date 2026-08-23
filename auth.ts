import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ADMIN_ROLE, getAuthConfiguration } from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/password";

const isProduction = process.env.NODE_ENV === "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  cookies: {
    sessionToken: {
      name: isProduction
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const configuration = getAuthConfiguration();
        if (!configuration) {
          console.error(
            "Admin authentication is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD_HASH_BASE64, and AUTH_SECRET.",
          );
          return null;
        }
        const username =
          typeof credentials?.username === "string"
            ? credentials.username.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (username !== configuration.username || !password)
          return null;
        if (!(await verifyPassword(password, configuration.passwordHash)))
          return null;

        return {
          id: "bootstrap-admin",
          name: configuration.username,
          role: ADMIN_ROLE,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id === "bootstrap-admin") token.role = ADMIN_ROLE;
      return token;
    },
    session({ session, token }) {
      if (token.sub === "bootstrap-admin" && token.role === ADMIN_ROLE) {
        session.user.role = ADMIN_ROLE;
      }
      return session;
    },
  },
});
