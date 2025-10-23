// apps/participant-client/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prismaClient } from "db/client";
import type { Session, User } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: User & {
            id: string;
        };
    }
}

const handler = NextAuth({
    adapter: PrismaAdapter(prismaClient),
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    // Optional: Add custom callbacks if you need to perform actions on sign-in, etc.
    callbacks: {
        async session({ session, user }) {
            // Expose the user's ID to the session object
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
    // Define your session strategy
    session: {
        strategy: "jwt",
    },
    // Secret for JWT signing
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };