import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, attach the role based on email mapping
      if (user && user.email) {
        // Detect Super Admin
        if (user.email === process.env.SUPER_ADMIN_EMAIL || user.email === "admin@unifiedledger.pro") {
          token.role = "super_admin";
        } 
        // Fetch dynamic role from backend database for standard users
        else {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users?email=${user.email}`);
            const dbUser = await res.json();
            if (dbUser && dbUser.role && !dbUser.error) {
              token.role = dbUser.role;
              token.orgId = dbUser.orgId;
            } else {
              token.role = "unauthorized";
            }
          } catch (e) {
            token.role = "unauthorized";
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Expose the role to the frontend session
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).orgId = token.orgId;
      }
      return session;
    }
  },
  pages: {
    signIn: '/', // Using your existing root landing page for login
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };