// apps/participant-client/app/api/hackathons/[hackathonId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ hackathonId: string }> }): Promise<NextResponse> {
    try {
        const { hackathonId } = await params;

        if (!hackathonId) {
            return NextResponse.json({ message: 'Hackathon ID is required' }, { status: 400 });
        }

        const hackathon = await prismaClient.hackathon.findUnique({
            where: {
                id: hackathonId,
            },
            // Select only the fields that are safe and necessary for the public page
            select: {
                id: true,
                name: true,
                body: true, // The main markdown content
                logoUrl: true,
                bannerUrl: true,
                startDate: true,
                durationHours: true,
                registrationDeadline: true,
                teamSize: true,
                isRegistrationOpen: true,
                status: true,
                actualStartTime: true, // Need this for timer and status calculations
            }
        });

        if (!hackathon) {
            return NextResponse.json({ message: 'Hackathon not found' }, { status: 404 });
        }

        return NextResponse.json(hackathon, { status: 200 });

    } catch (error) {
        console.error(`Error fetching hackathon:`, error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}