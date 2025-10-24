// apps/participant-client/app/api/hackathons/[hackathonId]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest, { params }: { params: { hackathonId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    try {
        const { hackathonId } = params;
        const body = await req.json();
        const { title, about, problem, githubUrl, techStacks, aiScore } = body;

        // Validation
        if (!title || !about || !problem || !githubUrl || !techStacks || aiScore === undefined) {
            return NextResponse.json({ message: 'All submission fields are required.' }, { status: 400 });
        }

        // Find the user's team for this specific hackathon
        const team = await prismaClient.team.findFirst({
            where: {
                hackathonId: hackathonId,
                members: { some: { userId: session.user.id } }
            }
        });

        if (!team) {
            return NextResponse.json({ message: 'You are not on an approved team for this hackathon.' }, { status: 403 });
        }
        
        // Check if a submission already exists for this team
        const existingSubmission = await prismaClient.projectSubmission.findUnique({
            where: { teamId: team.id }
        });
        if (existingSubmission) {
            return NextResponse.json({ message: 'Your team has already submitted a project.' }, { status: 409 });
        }
        
        // Create the new submission
        const newSubmission = await prismaClient.projectSubmission.create({
            data: {
                teamId: team.id,
                title,
                about,
                problem,
                githubUrl,
                techStacks,
                aiScore,
            }
        });

        return NextResponse.json(newSubmission, { status: 201 });

    } catch (error) {
        console.error('Error creating submission:', error);
        return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
}