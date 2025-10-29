// apps/participant-client/app/api/hackathons/[hackathonId]/my-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface TeamDetails {
    id: string;
    name: string;
    bio: string | null;
    skills: string | null;
    members: {
        name: string | null;
        image: string | null;
    }[];
}

interface SubmissionDetails {
    id: string;
    teamId: string;
    title: string;
    about: string;
    problem: string;
    githubUrl: string;
    techStacks: string[];
    aiScore: number | null;
    createdAt: Date;
}

interface MyStatusResponse {
    registrationStatus: string | null;
    teamDetails: TeamDetails | null;
    submissionDetails: SubmissionDetails | null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ hackathonId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { hackathonId } = await params;
    const userId = session.user.id;

    try {
        let registrationStatus: string | null = null;
        let teamDetails: TeamDetails | null = null;
        let submissionDetails: SubmissionDetails | null = null;

        // Check for an individual registration
        const individualReg = await prismaClient.individualRegistration.findUnique({
            where: { hackathonId_userId: { hackathonId, userId } }
        });

        if (individualReg) {
            registrationStatus = individualReg.status;
        } else {
            // If no individual reg, check for a team registration
            const teamRegMember = await prismaClient.pendingTeamMember.findFirst({
                where: { claimedByUserId: userId, teamRegistration: { hackathonId: hackathonId } },
                include: { teamRegistration: true }
            });
            if (teamRegMember) {
                registrationStatus = teamRegMember.teamRegistration.status;
            }
        }
        
        // If the registration was approved, find the finalized team
        if (registrationStatus === 'APPROVED') {
            const finalTeam = await prismaClient.team.findFirst({
                where: {
                    hackathonId: hackathonId,
                    members: { some: { userId: userId } }
                },
                include: {
                    members: { include: { user: { select: { name: true, image: true } } } },
                    submission: true
                }
            });
            if (finalTeam) {
                teamDetails = {
                    id: finalTeam.id,
                    name: finalTeam.name,
                    bio: finalTeam.bio,
                    skills: finalTeam.skills,
                    members: finalTeam.members.map((m: { user: { name: string | null; image: string | null; }; }) => m.user)
                };
                if (finalTeam.submission){
                    submissionDetails = finalTeam.submission;
                }
            }
        }

        if (!registrationStatus) {
            return NextResponse.json({ message: 'User not registered for this hackathon.' }, { status: 404 });
        }

        const response: MyStatusResponse = { registrationStatus, teamDetails, submissionDetails };
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error('Error fetching my-status:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}