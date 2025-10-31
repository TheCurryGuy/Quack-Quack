// apps/host-client/app/api/protected/tools/register-teams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import Papa from 'papaparse';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
interface HostJWTPayload { hostId: string; }

// Expected CSV row format - supports multiple column name variations:
// All formats expect Individual Registration IDs (not User IDs directly)
interface FormedTeamRow {
    'Team Name'?: string;
    'Members'?: string; // Double-space separated registration IDs
    'team_id'?: string;
    'participant_names'?: string; // Double-space separated registration IDs
    'score_list'?: string; // Optional, not used
}

export async function POST(req: NextRequest) {
    // --- Security Verification ---
    const authHeader = req.headers.get('Authorization');
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
        
        // Auto-detect delimiter (tab or comma)
        const parsed = Papa.parse<FormedTeamRow>(csvText, { 
            header: true, 
            skipEmptyLines: true,
            delimiter: '', // Auto-detect
            delimitersToGuess: ['\t', ',', '  '] // Try tab first, then comma, then double-space
        });

        console.log(`Parsed ${parsed.data.length} rows from CSV`);
        console.log('First row sample:', parsed.data[0]);
        if (parsed.errors.length > 0) {
            console.warn('CSV parsing warnings:', parsed.errors);
        }

        // A transaction ensures that if any part fails, the whole operation is rolled back.
        await prismaClient.$transaction(async (tx) => {
            for (const row of parsed.data) {
                // Detect which column names are being used
                const teamName = row['Team Name'] || row['team_id'];
                const membersField = row['Members'] || row['participant_names'];

                if (!teamName || !membersField) {
                    throw new Error('CSV row must have team name and members. Columns should be either ("Team Name" + "Members") or ("team_id" + "participant_names")');
                }

                // Split by double space and filter out empty strings
                const individualRegIds = membersField.split('  ').map(id => id.trim()).filter(id => id.length > 0);

                console.log(`[Team: ${teamName}] Processing ${individualRegIds.length} registration IDs:`, individualRegIds);

                // Find the User IDs and full details from the provided Individual Registration IDs
                const individualRegistrations = await tx.individualRegistration.findMany({
                    where: { id: { in: individualRegIds } },
                    select: { 
                        userId: true, 
                        id: true,
                        githubUrl: true,
                        portfolioUrl: true,
                        college: true,
                        year: true
                    }
                });

                console.log(`[Team: ${teamName}] Found ${individualRegistrations.length} registrations in database`);

                if (individualRegistrations.length !== individualRegIds.length) {
                    const foundIds = individualRegistrations.map(reg => reg.id);
                    const missingIds = individualRegIds.filter(id => !foundIds.includes(id));
                    console.error(`[Team: ${teamName}] Missing registration IDs:`, missingIds);
                    throw new Error(`Could not find all members for team "${teamName}". Missing ${missingIds.length} registrations: ${missingIds.slice(0, 3).join(', ')}${missingIds.length > 3 ? '...' : ''}`);
                }
                
                const userIds = individualRegistrations.map(reg => reg.userId);

                if (userIds.length === 0) {
                    throw new Error(`No users found for team "${teamName}"`);
                }
                
                // Get user details for creating pending team members
                const users = await tx.user.findMany({
                    where: { id: { in: userIds } },
                    select: { id: true, email: true, name: true }
                });

                // 1. Create a TeamRegistration with APPROVED status
                const teamRegistration = await tx.teamRegistration.create({
                    data: {
                        teamName: teamName,
                        hackathonId: hackathonId,
                        status: 'APPROVED',
                        leaderId: userIds[0]!, // First user is the leader
                        pendingMembers: {
                            create: individualRegistrations.map((reg, index) => {
                                const user = users.find(u => u.id === reg.userId);
                                if (!reg.userId) {
                                    throw new Error(`Individual registration ${reg.id} has no userId - cannot claim pending member`);
                                }
                                return {
                                    joinToken: `auto-${teamName}-${index}-${Date.now()}`, // Auto-generated token
                                    name: user?.name || 'Team Member',
                                    email: user?.email || '',
                                    githubUrl: reg.githubUrl,
                                    portfolioUrl: reg.portfolioUrl,
                                    college: reg.college,
                                    year: reg.year,
                                    claimedByUserId: reg.userId // ALWAYS claimed - converted from individual registration
                                };
                            })
                        }
                    }
                });

                console.log(`[Team: ${teamName}] Created team registration with ${individualRegistrations.length} CLAIMED pending members`);

                // Verify all pending members are claimed
                const unclaimedMembers = await tx.pendingTeamMember.count({
                    where: {
                        teamRegistrationId: teamRegistration.id,
                        claimedByUserId: null
                    }
                });

                if (unclaimedMembers > 0) {
                    throw new Error(`[Team: ${teamName}] Error: ${unclaimedMembers} pending members are not claimed!`);
                }

                // 2. Create the finalized Team
                const newTeam = await tx.team.create({
                    data: {
                        name: teamName,
                        hackathonId: hackathonId,
                        members: {
                            create: userIds.map(id => ({ userId: id }))
                        }
                    }
                });

                console.log(`[Team: ${teamName}] Created finalized team with ${userIds.length} members`);

                // 3. Update (not delete) the individual registrations to APPROVED status
                await tx.individualRegistration.updateMany({
                    where: { id: { in: individualRegIds } },
                    data: { status: 'APPROVED' }
                });

                console.log(`[Team: ${teamName}] Updated ${individualRegIds.length} individual registrations to APPROVED`);
            }
        });
        
        return NextResponse.json({ message: 'All teams have been registered successfully!' }, { status: 200 });

    } catch (error: any) {
        console.error('Error in auto-register teams:', error);
        return NextResponse.json({ message: error.message || 'Internal server error.' }, { status: 500 });
    }
}