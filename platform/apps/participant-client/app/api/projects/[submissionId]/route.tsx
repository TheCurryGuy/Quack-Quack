// apps/participant-client/app/api/projects/[submissionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';

export async function GET(req: NextRequest, { params }: { params: { submissionId: string } }) {
    try {
        const { submissionId } = params;
        const submission = await prismaClient.projectSubmission.findUnique({
            where: { id: submissionId },
            include: {
                team: {
                    select: {
                        name: true,
                        hackathon: { select: { name: true } }
                    }
                }
            }
        });
        if (!submission) return NextResponse.json({ message: 'Project not found.' }, { status: 404 });
        return NextResponse.json(submission, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
}