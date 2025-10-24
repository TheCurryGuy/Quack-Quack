// apps/participant-client/app/api/hackathons/[hackathonId]/winners/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';

export async function GET(req: NextRequest, { params }: { params: { hackathonId: string } }) {
    try {
        const { hackathonId } = params;
        const winners = await prismaClient.team.findMany({
            where: { hackathonId: hackathonId, rank: { in: [1, 2, 3] } },
            select: { name: true, rank: true },
            orderBy: { rank: 'asc' }
        });
        return NextResponse.json(winners, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}