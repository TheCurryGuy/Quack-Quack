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
    // Using PrismaAdapter to store users in database
    adapter: PrismaAdapter(prismaClient) as any,
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            // When using database strategy with adapter, user data comes from database
            if (session.user && user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
    session: {
        strategy: "database",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
        error: '/login', // Redirect to login page on error
    },
};
