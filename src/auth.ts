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
    async session({ session, user, token }) {
      // Protože používáme databázi a možná jwt (pokud credentials), 
      // tak id a role taháme případně i z db.
      if (token && session.user) {
         session.user.id = token.sub as string;
         session.user.role = token.role as string;
      } else if (user) {
         session.user.id = user.id;
         session.user.role = user.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    }
  },
  session: { strategy: "jwt" } // Use JWT for simple credentials testing
});
