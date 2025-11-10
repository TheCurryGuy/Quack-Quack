// apps/host-client/app/api/protected/team-registrations/[regId]/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
interface HostJWTPayload { hostId: string; }

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ regId: string }> }
): Promise<NextResponse> {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, secret);
        const hostId = (payload as unknown as HostJWTPayload).hostId;
        const { regId } = await context.params;
        
        // Fetch team registration with all details
        const teamRegistration = await prismaClient.teamRegistration.findFirst({
            where: {
                id: regId,
                hackathon: { hostId: hostId }
            },
            include: {
                pendingMembers: {
                    include: {
                        claimedByUser: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                },
                hackathon: { select: { id: true, name: true } }
            }
        });

        if (!teamRegistration) {
            return NextResponse.json({ message: 'Team registration not found or access denied.' }, { status: 404 });
        }

        // Count claimed vs unclaimed members
        const totalMembers = teamRegistration.pendingMembers.length;
        const claimedMembers = teamRegistration.pendingMembers.filter(m => m.claimedByUserId !== null);
        const unclaimedMembers = teamRegistration.pendingMembers.filter(m => m.claimedByUserId === null);

        let finalizedTeam = null;
        let finalizedTeamMembers: Array<{ id: string; name: string | null; email: string | null }> = [];

        // If approved, check if the finalized team exists
        if (teamRegistration.status === 'APPROVED') {
            finalizedTeam = await prismaClient.team.findFirst({
                where: {
                    name: teamRegistration.teamName,
                    hackathonId: teamRegistration.hackathonId
                },
                include: {
                    members: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true }
                            }
                        }
                    }
                }
            });

            if (finalizedTeam) {
                finalizedTeamMembers = finalizedTeam.members.map(tm => tm.user);
            }
        }

        return NextResponse.json({
            teamRegistration: {
                id: teamRegistration.id,
                teamName: teamRegistration.teamName,
                status: teamRegistration.status,
                hackathonName: teamRegistration.hackathon.name
            },
            memberStats: {
                total: totalMembers,
                claimed: claimedMembers.length,
                unclaimed: unclaimedMembers.length
            },
            claimedMemberDetails: claimedMembers.map(m => ({
                name: m.name,
                email: m.email,
                userId: m.claimedByUser?.id,
                userName: m.claimedByUser?.name,
                userEmail: m.claimedByUser?.email
            })),
            unclaimedMemberDetails: unclaimedMembers.map(m => ({
                name: m.name,
                email: m.email,
                joinToken: m.joinToken
            })),
            finalizedTeam: finalizedTeam ? {
                id: finalizedTeam.id,
                name: finalizedTeam.name,
                memberCount: finalizedTeamMembers.length,
                members: finalizedTeamMembers
            } : null,
            isFullyClaimed: claimedMembers.length === totalMembers,
            isFinalized: teamRegistration.status === 'APPROVED' && finalizedTeam !== null,
            membersInTeamTable: finalizedTeamMembers.length
        }, { status: 200 });

    } catch (error) {
        console.error('Error verifying team registration:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
