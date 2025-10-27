// apps/host-client/app/api/protected/hackathons/[hackathonId]/team-names/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { jwtVerify } from 'jose';
import Papa from 'papaparse';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
interface HostJWTPayload { hostId: string; }

export async function GET(req: NextRequest, { params }: { params: { hackathonId: string } }) {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, secret);
        const hostId = (payload as unknown as HostJWTPayload).hostId;
        const { hackathonId } = params;

        // Fetch all approved teams for this hackathon, ensuring host ownership
        const teams = await prismaClient.team.findMany({
            where: {
                hackathonId: hackathonId,
                hackathon: { hostId: hostId }
            },
            select: { name: true }
        });

        // Convert to CSV with a 'team_name' header
        const teamsCsv = Papa.unparse(teams.map(t => ({ team_name: t.name })));

        return new NextResponse(teamsCsv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="team-names-${hackathonId}.csv"`,
            },
        });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}