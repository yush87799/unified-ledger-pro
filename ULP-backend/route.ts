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
        if (user.email.includes("superadmin") || user.email === "admin@unifiedledger.pro") {
          token.role = "super_admin";
        } 
        // Standard roles
        else if (user.email.includes("owner")) token.role = "owner";
        else if (user.email.includes("accountant")) token.role = "accountant";
        else token.role = "inventory";
      }
      return token;
    },
    async session({ session, token }) {
      // Expose the role to the frontend session
      if (session?.user) {
        (session.user as any).role = token.role;
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