import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/passwords";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Credentials({
      name: "Email a heslo",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@kamenice.cz" },
        password: { label: "Heslo", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        if (!email || !password) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user) {
          return null;
        }

        if (!user.passwordHash) {
          // Přechodový most pro staré účty, které vznikly ještě bez hesla.
          const [updatedUser] = await db
            .update(users)
            .set({ passwordHash: hashPassword(password) })
            .where(eq(users.id, user.id))
            .returning();

          return updatedUser;
        }

        if (!verifyPassword(password, user.passwordHash)) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Čerstvé přihlášení — nastavíme data z DB objektu
        token.sub = user.id;
        token.role = user.role;
        return token;
      }

      // Každý další požadavek — ověříme, zda uživatel stále existuje v DB,
      // a načteme aktuální roli (aby se změna role projevila okamžitě)
      if (token.sub) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, token.sub),
        });

        if (!dbUser) {
          // Uživatel byl smazán — zneplatníme token
          return null;
        }

        token.role = dbUser.role;
      }

      return token;
    },
  },
  session: { strategy: "jwt" },
});
