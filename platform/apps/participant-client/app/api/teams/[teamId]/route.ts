// apps/participant-client/app/api/teams/[teamId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'You must be logged in.' }, { status: 401 });
    }

    try {
        const { teamId } = await params;
        const { bio, skills } = await req.json();

        // --- Security Check ---
        // Find the team AND verify that the current user is a member of it.
        const team = await prismaClient.team.findFirst({
            where: {
                id: teamId,
                members: {
                    some: { userId: session.user.id }
                }
            }
        });

        if (!team) {
            return NextResponse.json({ message: 'Team not found or you are not a member.' }, { status: 403 });
        }

        // Perform the update
        const updatedTeam = await prismaClient.team.update({
            where: { id: teamId },
            data: {
                bio: bio,
                skills: skills, // Assuming skills is a simple comma-separated string for now
            }
        });

        return NextResponse.json(updatedTeam, { status: 200 });

    } catch (error) {
        console.error('Error updating team:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}