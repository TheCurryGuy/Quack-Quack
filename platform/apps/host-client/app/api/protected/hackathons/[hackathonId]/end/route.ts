// apps/host-client/app/api/protected/hackathons/[hackathonId]/end/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
interface HostJWTPayload { hostId: string; }

export async function POST(req: NextRequest, { params }: { params: Promise<{ hackathonId: string }> }) {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, secret);
        const hostId = (payload as unknown as HostJWTPayload).hostId;
        const { hackathonId } = await params;
        
        // Find the hackathon to ensure the host owns it
        const hackathonToEnd = await prismaClient.hackathon.findFirst({
            where: {
                id: hackathonId,
                hostId: hostId,
            }
        });

        if (!hackathonToEnd) {
            return NextResponse.json({ message: 'Hackathon not found or access denied.' }, { status: 404 });
        }
        
        if (hackathonToEnd.status === 'ENDED') {
            return NextResponse.json({ message: 'Hackathon is already ended.' }, { status: 409 });
        }

        // Update the hackathon status to ENDED
        const endedHackathon = await prismaClient.hackathon.update({
            where: {
                id: hackathonId,
            },
            data: {
                status: 'ENDED',
            }
        });

        return NextResponse.json({ message: 'Hackathon ended successfully!', hackathon: endedHackathon }, { status: 200 });

    } catch (error) {
        console.error('Error ending hackathon:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
