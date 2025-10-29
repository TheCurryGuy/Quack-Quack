// apps/participant-client/app/api/hackathons/[hackathonId]/register-individual/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { getServerSession } from 'next-auth/next';
// We need to import the authOptions we created earlier
import { authOptions } from '@/lib/auth';


export async function POST(req: NextRequest, { params }: { params: Promise<{ hackathonId: string }> }):Promise<NextResponse> {
    const session = await getServerSession(authOptions);


    if (!session?.user?.id) {
        return NextResponse.json({ message: 'You must be logged in to register.' }, { status: 401 });
    }

    try {
        const { hackathonId } = await params;
        const body = await req.json();
        const { githubUrl, portfolioUrl, college, year, profileScore, eligibility } = body;

        // Server-side validation
        if (!githubUrl || !college || !year || !profileScore || !eligibility) {
            return NextResponse.json({ message: 'Missing required registration fields.' }, { status: 400 });
        }

        const newRegistration = await prismaClient.individualRegistration.create({
            data: {
                hackathonId: hackathonId,
                userId: session.user.id,
                status: 'PENDING',
                githubUrl,
                portfolioUrl,
                college,
                year,
                profileScore,
                eligibility,
            }
        });

        return NextResponse.json(newRegistration, { status: 201 });

    } catch (error: unknown) {
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as { code: unknown }).code === 'P2002'
        ) {
            return NextResponse.json({ message: 'You are already registered for this hackathon.' }, { status: 409 });
        }
        console.error('Error creating individual registration:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}