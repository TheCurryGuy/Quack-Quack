// apps/participant-client/app/api/my-hackathons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(_req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;

    try {
        // Find all individual registrations for this user
        const individualRegs = await prismaClient.individualRegistration.findMany({
            where: { userId: userId },
            select: { hackathon: true }
        });

        // Find all team registrations this user is a part of (claimed spots)
        const teamRegs = await prismaClient.pendingTeamMember.findMany({
            where: { claimedByUserId: userId },
            select: { 
                teamRegistration: {
                    select: { hackathon: true }
                }
            }
        });

        // Extract the unique hackathons from both lists
        const hackathonsById = new Map();
        
        individualRegs.forEach(reg => hackathonsById.set(reg.hackathon.id, reg.hackathon));
        teamRegs.forEach(reg => hackathonsById.set(reg.teamRegistration.hackathon.id, reg.teamRegistration.hackathon));
        
        const myHackathons = Array.from(hackathonsById.values());

        return NextResponse.json(myHackathons, { status: 200 });

    } catch (error) {
        console.error('Error fetching my-hackathons:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}