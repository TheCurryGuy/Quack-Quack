// apps/host-client/app/api/protected/hackathons/[hackathonId]/register-formed-teams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import Papa from 'papaparse';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
interface HostJWTPayload { hostId: string; }

interface FormedTeamRow {
    team_name: string;
    members_emails: string; // Comma-separated emails
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ hackathonId: string }> }) {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    try {
        const { payload } = await jwtVerify(token, secret);
        const hostId = (payload as unknown as HostJWTPayload).hostId;
        const { hackathonId } = await params;

        // Verify host owns the hackathon
        const hackathon = await prismaClient.hackathon.findFirst({
            where: { id: hackathonId, hostId: hostId }
        });
        if (!hackathon) {
            return NextResponse.json({ message: 'Hackathon not found or access denied' }, { status: 404 });
        }
        
        const formData = await req.formData();
        const file = formData.get('file') as File;
        if (!file) return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });

        const csvText = await file.text();
        const parsed = Papa.parse<FormedTeamRow>(csvText, { header: true, skipEmptyLines: true });
        
        let teamsCreated = 0;
        let teamsSkipped = 0;
        const skippedTeams: string[] = [];
        
        for (const row of parsed.data) {
            const memberEmails = row.members_emails.split(',').map(email => email.trim());
            
            // Find all users associated with the emails in this row
            const users = await prismaClient.user.findMany({
                where: { email: { in: memberEmails } },
            });

            // Ensure all users were found
            if (users.length !== memberEmails.length) {
                const foundEmails = new Set(users.map(u => u.email));
                const missingEmails = memberEmails.filter(email => !foundEmails.has(email));
                console.warn(`⚠️  Skipping team "${row.team_name}" - missing users: ${missingEmails.join(', ')}`);
                teamsSkipped++;
                skippedTeams.push(`${row.team_name} (missing: ${missingEmails.join(', ')})`);
                continue;
            }

            // Create the new team and its members in a single transaction
            await prismaClient.team.create({
                data: {
                    name: row.team_name,
                    hackathonId: hackathonId,
                    members: {
                        create: users.map(user => ({ userId: user.id }))
                    }
                }
            });
            teamsCreated++;
        }
        
        const message = teamsSkipped > 0 
            ? `Teams registered: ${teamsCreated} created, ${teamsSkipped} skipped (users not found)`
            : `All ${teamsCreated} teams registered successfully.`;
        
        return NextResponse.json({ 
            message, 
            teamsCreated, 
            teamsSkipped,
            skippedTeams: teamsSkipped > 0 ? skippedTeams : undefined
        }, { status: 200 });

    } catch (error) {
        console.error('Error registering formed teams:', error);
        return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
}