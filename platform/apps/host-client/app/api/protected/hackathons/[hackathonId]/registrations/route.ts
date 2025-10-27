// apps/host-client/app/api/protected/hackathons/[hackathonId]/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

interface HostJWTPayload {
  hostId: string;
}

// The new, rewritten GET handler
export async function GET(req: NextRequest, { params }: { params: Promise<{ hackathonId: string }> }): Promise<NextResponse> {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, secret);
    const hostId = (payload as unknown as HostJWTPayload).hostId;
    const { hackathonId } = await params;

    // First, a security check to ensure the host owns this hackathon before proceeding.
    const hackathon = await prismaClient.hackathon.findFirst({
        where: { id: hackathonId, hostId: hostId }
    });
    if (!hackathon) {
        return NextResponse.json({ message: 'Hackathon not found or access denied' }, { status: 404 });
    }

    // --- NEW LOGIC: Perform two separate queries for each registration type ---

    // 1. Fetch all PENDING individual applications for this hackathon
    const individualApps = await prismaClient.individualRegistration.findMany({
      where: {
        hackathonId: hackathonId,
        status: 'PENDING',
      },
      // Include all the data the host needs to make a decision
      include: {
        user: { // Get the user's basic info
          select: {
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: {
          createdAt: 'asc'
      }
    });

    // 2. Fetch all PENDING team applications for this hackathon
    const teamApps = await prismaClient.teamRegistration.findMany({
        where: {
            hackathonId: hackathonId,
            status: 'PENDING',
        },
        // This is a deep query to get all the pre-filled member details
        include: {
            pendingMembers: true // Get the details of each person in the application
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    // 3. Return the data in a clean, structured format for the frontend
    return NextResponse.json({ individualApps, teamApps }, { status: 200 });

  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}