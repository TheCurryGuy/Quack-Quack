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
    adapter: PrismaAdapter(prismaClient),
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            // This logic correctly adds the user ID from the database 'user' object
            // to the client-side 'session.user' object.
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
