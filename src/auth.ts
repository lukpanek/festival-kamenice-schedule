import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    // Přidáno dummy přihlášení pro admina/návštěvníka, aby se s tím dalo hned hrát
    Credentials({
      name: "Test credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@kamenice.cz" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        // V reálu tady bude kontrola hesla/OAuth, pro teď dovolíme login emailu,
        // Pokud neexistuje, tak ho vytvoříme (protože jsme v credentials provideru)
        if (!user) {
           const newUser = await db.insert(users).values({
               email: credentials.email as string,
               name: (credentials.email as string).split("@")[0],
               role: (credentials.email as string).includes("admin") ? "admin" : "visitor",
           }).returning();
           return newUser[0];
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
