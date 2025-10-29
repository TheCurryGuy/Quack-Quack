// apps/host-client/app/api/protected/hackathons/[hackathonId]/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prismaClient } from 'db/client';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

interface HostJWTPayload { 
    hostId: string; 
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ hackathonId: string }> }) {
    // Decode the token to get the hostId
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, secret);
        const hostId = (payload as unknown as HostJWTPayload).hostId;
        const { hackathonId } = await params;

        // Verify this hackathon belongs to the host
        const hackathon = await prismaClient.hackathon.findFirst({
            where: {
                id: hackathonId,
                hostId: hostId,
            },
        });

        if (!hackathon) {
            return NextResponse.json(
                { message: 'Hackathon not found or access denied' },
                { status: 404 }
            );
        }

        // Get total registrations (both individual and team)
        const [individualCount, teamCount] = await Promise.all([
            prismaClient.individualRegistration.count({
                where: { hackathonId },
            }),
            prismaClient.teamRegistration.count({
                where: { hackathonId },
            }),
        ]);

        const totalRegistrations = individualCount + teamCount;

        // Get approved teams count (finalized teams that have been formed)
        const approvedTeams = await prismaClient.team.count({
            where: {
                hackathonId,
            },
        });

        // Get pending approvals (both individual and team registrations)
        const [pendingIndividual, pendingTeam] = await Promise.all([
            prismaClient.individualRegistration.count({
                where: {
                    hackathonId,
                    status: 'PENDING',
                },
            }),
            prismaClient.teamRegistration.count({
                where: {
                    hackathonId,
                    status: 'PENDING',
                },
            }),
        ]);

        const pendingApprovals = pendingIndividual + pendingTeam;

        // Get submissions count
        const submissions = await prismaClient.projectSubmission.count({
            where: {
                team: {
                    hackathonId,
                },
            },
        });

        return NextResponse.json(
            {
                totalRegistrations,
                approvedTeams,
                pendingApprovals,
                submissions,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching hackathon stats:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
