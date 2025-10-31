// apps/participant-client/app/api/hackathons/[hackathonId]/register-team/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest, { params }: { params: Promise<{ hackathonId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'You must be logged in to register a team.' }, { status: 401 });
    }

    try {
        const { hackathonId } = await params;
        const body = await req.json();
        const { teamName, members } = body;

        // --- Basic Validation ---
        if (!teamName || !members || members.length === 0) {
            return NextResponse.json({ message: 'Team name and member details are required.' }, { status: 400 });
        }
        const hackathon = await prismaClient.hackathon.findUnique({ where: { id: hackathonId }});
        if (!hackathon || members.length > hackathon.teamSize) {
            return NextResponse.json({ message: 'Invalid hackathon or team size exceeds limit.' }, { status: 400 });
        }
        
        const leaderData = members[0]; // Assuming the first member is the leader
        
        // Find the leader in our database to link them
        const leaderUser = await prismaClient.user.findUnique({
            where: { email: leaderData.email },
        });

        // Ensure the person registering the team matches the logged-in user and the first member's details
        if (!leaderUser || leaderUser.id !== session.user.id) {
            return NextResponse.json({ message: 'The first member must be the currently logged-in user.' }, { status: 403 });
        }

        interface TokenInfo {
            token: string;
            memberName: string;
            memberEmail: string;
        }
        
        const joinTokens: TokenInfo[] = [];
        
        await prismaClient.$transaction(async (tx) => {
            // 1. Create the main Team Registration record
            const teamRegistration = await tx.teamRegistration.create({
                data: {
                    teamName,
                    hackathonId,
                    leaderId: session.user.id,
                    status: 'PENDING'
                }
            });

            // 2. Create a PendingTeamMember for each person
            for (const member of members) {
                // The leader is pre-claimed. Other members need the token.
                const isLeader = member.email === leaderData.email;
                
                const token = randomBytes(16).toString('hex');
                
                // Only add token to the response if it's not the leader
                if (!isLeader) {
                    joinTokens.push({
                        token,
                        memberName: member.name,
                        memberEmail: member.email
                    });
                }

                await tx.pendingTeamMember.create({
                    data: {
                        teamRegistrationId: teamRegistration.id,
                        joinToken: token,
                        name: member.name,
                        email: member.email,
                        githubUrl: member.githubUrl,
                        portfolioUrl: member.portfolioUrl,
                        college: member.college,
                        year: member.year,
                        claimedByUserId: isLeader ? session.user.id : null, // Auto-claim for the leader
                    }
                });
            }
        });

        return NextResponse.json({ 
            message: 'Team registration initiated!', 
            teamName,
            leaderName: leaderData.name,
            leaderEmail: leaderData.email,
            joinTokens 
        }, { status: 201 });

    } catch (error) {
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as { code: unknown }).code === 'P2002'
        ) {
             return NextResponse.json({ message: 'A team with this name is already registered for this hackathon.' }, { status: 409 });
        }
        console.error('Error creating team registration:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}