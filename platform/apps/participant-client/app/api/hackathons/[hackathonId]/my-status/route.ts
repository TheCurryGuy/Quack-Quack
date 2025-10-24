// apps/participant-client/app/api/hackathons/[hackathonId]/my-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest, { params }: { params: { hackathonId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { hackathonId } = params;
    const userId = session.user.id;

    try {
        let registrationStatus: string | null = null;
        let teamDetails: any = null;
        let submissionDetails: any = null;

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
                    members: finalTeam.members.map(m => m.user)
                };
                if (finalTeam.submission){
                    submissionDetails = finalTeam.submission;
                }
            }
        }

        if (!registrationStatus) {
            return NextResponse.json({ message: 'User not registered for this hackathon.' }, { status: 404 });
        }

        return NextResponse.json({ registrationStatus, teamDetails, submissionDetails }, { status: 200 });

    } catch (error) {
        console.error('Error fetching my-status:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}