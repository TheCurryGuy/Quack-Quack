// apps/participant-client/app/api/hackathons/[hackathonId]/winners/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ hackathonId: string }> }) {
    try {
        const { hackathonId } = await params;
        // Get all teams with a rank (not null), not just top 3
        const winners = await prismaClient.team.findMany({
            where: { hackathonId: hackathonId, rank: { not: null } },
            select: { name: true, rank: true },
            orderBy: { rank: 'asc' }
        });
        return NextResponse.json(winners, { status: 200 });
    } catch (error) {
        console.error("Error fetching winners:", error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}