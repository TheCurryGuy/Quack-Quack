import { AuthOptions, User as NextAuthUser } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prismaClient } from "db/client";

// The module declaration needs to know about the base User type from next-auth
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
        } & NextAuthUser; // <-- Use the imported NextAuthUser type here
    }
}

// Define our configuration in a separate, exportable constant.
export const authOptions: AuthOptions = {
    // Commenting out adapter to use pure JWT - uncomment if you want database sessions
    // adapter: PrismaAdapter(prismaClient) as any,
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            // When using JWT strategy, user data comes from token
            if (session.user && token) {
                session.user.id = token.sub!;
            }
            return session;
        },
        async jwt({ token, account, profile }) {
            // Persist user info in JWT token
            if (account && profile) {
                token.sub = (profile as any).id?.toString() || token.sub;
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
        error: '/login', // Redirect to login page on error
    },
};
