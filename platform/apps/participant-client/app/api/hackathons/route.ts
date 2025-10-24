// apps/participant-client/app/api/hackathons/route.ts
import { NextResponse } from 'next/server';
import { prismaClient } from 'db/client';

export async function GET(): Promise<NextResponse> {
    try {
        // We want to fetch hackathons that are actively seeking participants.
        // This means their registration is open and the event hasn't already ended.
        const hackathons = await prismaClient.hackathon.findMany({
            where: {
                isRegistrationOpen: true,
                status: {
                    in: ['UPCOMING', 'LIVE']
                },
                // Optional: You could also add a filter to not show events whose registration deadline has passed
                // registrationDeadline: {
                //     gte: now,
                // }
            },
            select: {
                id: true,
                name: true,
                body: true, // We'll show a snippet of this
                logoUrl: true,
                bannerUrl: true,
                startDate: true,
                status: true,
            },
            orderBy: {
                startDate: 'asc', // Show the soonest ones first
            },
        });

        return NextResponse.json(hackathons, { status: 200 });

    } catch (error) {
        console.error('Error fetching public hackathons:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}