// apps/host-client/app/api/protected/tools/register-teams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import Papa from 'papaparse';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
interface HostJWTPayload { hostId: string; }

// Expected CSV row format
interface FormedTeamRow {
    'Team Name': string;
    'Members': string; // Double-space separated registration IDs
}

export async function POST(req: NextRequest) {
    // --- Security Verification ---
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    try { await jwtVerify(token, secret); } catch (err) { return NextResponse.json({ message: 'Invalid token' }, { status: 401 }); }
    
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const hackathonId = formData.get('hackathonId') as string; // We'll get this from the form

        if (!file || !hackathonId) {
            return NextResponse.json({ message: 'CSV file and Hackathon ID are required.' }, { status: 400 });
        }

        const csvText = await file.text();
        const parsed = Papa.parse<FormedTeamRow>(csvText, { header: true, skipEmptyLines: true });

        // A transaction ensures that if any part fails, the whole operation is rolled back.
        await prismaClient.$transaction(async (tx) => {
            for (const row of parsed.data) {
                const teamName = row['Team Name'];
                const individualRegIds = row['Members'].split('  ').map(id => id.trim()); // Split by double space

                // 1. Find the User IDs from the provided Individual Registration IDs
                const individualRegistrations = await tx.individualRegistration.findMany({
                    where: { id: { in: individualRegIds } },
                    select: { userId: true }
                });

                // If we didn't find all the users, something is wrong with the CSV.
                if (individualRegistrations.length !== individualRegIds.length) {
                    throw new Error(`Could not find all members for team "${teamName}". Please check the CSV.`);
                }
                const userIds = individualRegistrations.map(reg => reg.userId);
                
                // 2. Create the new, official Team
                const newTeam = await tx.team.create({
                    data: {
                        name: teamName,
                        hackathonId: hackathonId,
                        // 3. Simultaneously create all TeamMember links
                        members: {
                            create: userIds.map(id => ({ userId: id }))
                        }
                    }
                });

                // 4. Clean up: Delete the individual registrations that have been processed
                await tx.individualRegistration.deleteMany({
                    where: { id: { in: individualRegIds } }
                });
            }
        });
        
        return NextResponse.json({ message: 'All teams have been registered successfully!' }, { status: 200 });

    } catch (error: any) {
        console.error('Error in auto-register teams:', error);
        return NextResponse.json({ message: error.message || 'Internal server error.' }, { status: 500 });
    }
}