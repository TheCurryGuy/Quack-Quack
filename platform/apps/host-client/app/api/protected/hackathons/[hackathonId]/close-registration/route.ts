// apps/host-client/app/api/protected/hackathons/[hackathonId]/close-registration/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { jwtVerify } from 'jose';
import Papa from 'papaparse';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
interface HostJWTPayload { hostId: string; }

export async function POST(req: NextRequest, { params }: { params: { hackathonId: string } }) {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, secret);
        const hostId = (payload as unknown as  HostJWTPayload).hostId;
        const { hackathonId } = params;

        // Using a transaction ensures all data is fetched consistently before we close registration.
        const result = await prismaClient.$transaction(async (tx) => {
            // 1. Verify host ownership and that registration is currently open.
            const hackathon = await tx.hackathon.findFirst({
                where: { id: hackathonId, hostId: hostId },
            });

            if (!hackathon) {
                throw new Error('Hackathon not found or access denied.');
            }
            if (!hackathon.isRegistrationOpen) {
                throw new Error('Registration for this event is already closed.');
            }

            // 2. Fetch all APPROVED individuals for this hackathon
            const approvedIndividuals = await tx.individualRegistration.findMany({
                where: {
                    hackathonId: hackathonId,
                    status: 'APPROVED',
                },
                select: {
                    id: true,
                    profileScore: true,
                    eligibility: true,
                }
            });

            // 3. Fetch all APPROVED teams for this hackathon
            const approvedTeams = await tx.team.findMany({
                where: { hackathonId: hackathonId },
                include: {
                    members: {
                        select: {
                            userId: true // Select the User ID for the member_ids column
                        }
                    }
                }
            });

            // 4. Update the hackathon to close registration
            await tx.hackathon.update({
                where: { id: hackathonId },
                data: { isRegistrationOpen: false },
            });

            return { approvedIndividuals, approvedTeams };
        });

        // 5. Format the data for the CSV files according to the new specifications

        // Individuals CSV: id, profileScore, eligibility
        const individualsData = result.approvedIndividuals;
        const individualsCsv = Papa.unparse(individualsData);

        // Teams CSV: team_name, member_ids (space-separated)
        const teamsData = result.approvedTeams.map(team => ({
            team_name: team.name,
            member_ids: team.members.map(member => member.userId).join(' '),
        }));
        const teamsCsv = Papa.unparse(teamsData);

        return NextResponse.json({
            message: 'Registration closed successfully. Your files are ready for download.',
            individualsCsv,
            teamsCsv
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error closing registration:', error);
        // We can send a more specific error message back to the client
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}