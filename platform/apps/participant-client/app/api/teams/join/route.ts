// apps/participant-client/app/api/teams/join/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
        return NextResponse.json({ message: 'You must be logged in to join a team.' }, { status: 401 });
    }

    try {
        const { token } = await req.json();
        if (!token) {
            return NextResponse.json({ message: 'Join token is required.' }, { status: 400 });
        }

        // Find the pending member record by the token
        const pendingMember = await prismaClient.pendingTeamMember.findUnique({
            where: { joinToken: token },
        });

        if (!pendingMember) {
            return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 404 });
        }

        if (pendingMember.claimedByUserId) {
            return NextResponse.json({ message: 'This spot has already been claimed.' }, { status: 409 });
        }

        // Security check: The logged-in user's email must match the pre-filled email
        if (pendingMember.email.toLowerCase() !== session.user.email.toLowerCase()) {
            return NextResponse.json({ message: 'This invite is for a different user.' }, { status: 403 });
        }

        // Link the logged-in user to this spot
        await prismaClient.pendingTeamMember.update({
            where: { id: pendingMember.id },
            data: { claimedByUserId: session.user.id },
        });

        return NextResponse.json({ message: 'Successfully joined the team!' }, { status: 200 });

    } catch (error) {
        console.error('Error joining team:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}