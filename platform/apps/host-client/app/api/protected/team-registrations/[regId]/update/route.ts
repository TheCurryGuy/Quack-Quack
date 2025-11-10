// apps/host-client/app/api/protected/team-registrations/[regId]/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { jwtVerify } from 'jose';
import { transporter, createApprovalEmail, createRejectionEmail } from '@/lib/nodemailer';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
interface HostJWTPayload { hostId: string; }

export async function PUT(req: NextRequest, { params }: { params: Promise<{ regId: string }> }) {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, secret);
        const hostId = (payload as unknown as HostJWTPayload).hostId;
        const { regId } = await params;
        const { status } = await req.json();

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status provided' }, { status: 400 });
        }
        
        const teamRegistration = await prismaClient.teamRegistration.findFirst({
            where: {
                id: regId,
                hackathon: { hostId: hostId }
            },
            include: {
                pendingMembers: true,
                hackathon: { select: { name: true } }
            }
        });

        if (!teamRegistration) {
            return NextResponse.json({ message: 'Team registration not found or access denied.' }, { status: 404 });
        }
        
        // Prevent duplicate approvals - check if already processed
        if (teamRegistration.status !== 'PENDING') {
            return NextResponse.json({ 
                message: `This registration has already been ${teamRegistration.status.toLowerCase()}.` 
            }, { status: 409 });
        }
        
        // Use a transaction for the database operations
        let teamCreationResult: { teamId?: string; membersAdded?: number; teamName?: string } = {};
        
        await prismaClient.$transaction(async (tx) => {
            // Double-check status inside transaction to prevent race conditions
            const currentReg = await tx.teamRegistration.findUnique({
                where: { id: regId },
                select: { status: true }
            });
            
            if (!currentReg || currentReg.status !== 'PENDING') {
                throw new Error('Registration already processed');
            }
            
            await tx.teamRegistration.update({
                where: { id: regId },
                data: { status: status }
            });
            
            // If APPROVED, create the official team and link the claimed members
            if (status === 'APPROVED') {
                console.log(`✅ Approving team: ${teamRegistration.teamName}`);
                
                const newTeam = await tx.team.create({
                    data: {
                        name: teamRegistration.teamName,
                        hackathonId: teamRegistration.hackathonId,
                    }
                });
                console.log(`✅ Created Team in database: ID=${newTeam.id}, Name=${newTeam.name}`);
                
                teamCreationResult.teamId = newTeam.id;
                teamCreationResult.teamName = newTeam.name;

                // Find members who have already claimed their spot via the token
                const claimedMembers = teamRegistration.pendingMembers.filter(m => m.claimedByUserId !== null);
                const totalMembers = teamRegistration.pendingMembers.length;
                
                console.log(`📊 Team ${teamRegistration.teamName}: ${claimedMembers.length}/${totalMembers} members claimed their spots`);

                if (claimedMembers.length === 0) {
                    console.warn(`⚠️  Team ${teamRegistration.teamName}: No members have claimed their spots yet!`);
                    teamCreationResult.membersAdded = 0;
                } else {
                    // Verify all claimed user IDs exist in the User table
                    const userIds = claimedMembers.map(m => m.claimedByUserId!);
                    const existingUsers = await tx.user.findMany({
                        where: { id: { in: userIds } },
                        select: { id: true, name: true, email: true }
                    });
                    
                    const existingUserIds = new Set(existingUsers.map(u => u.id));
                    const validMembers = claimedMembers.filter(m => existingUserIds.has(m.claimedByUserId!));
                    
                    if (validMembers.length > 0) {
                        // Create TeamMember records for all valid members
                        const teamMembers = await tx.teamMember.createMany({
                            data: validMembers.map(m => ({
                                teamId: newTeam.id,
                                userId: m.claimedByUserId!,
                            })),
                            skipDuplicates: true // Prevent errors if somehow duplicates exist
                        });
                        
                        teamCreationResult.membersAdded = teamMembers.count;
                        
                        console.log(`✅ Successfully added ${teamMembers.count} members to Team ${teamRegistration.teamName}:`);
                        existingUsers.forEach(user => {
                            console.log(`   - ${user.name} (${user.email})`);
                        });
                    }
                    
                    // Log warning if some users don't exist
                    if (validMembers.length < claimedMembers.length) {
                        const invalidCount = claimedMembers.length - validMembers.length;
                        console.error(`❌ Team ${teamRegistration.teamName}: ${invalidCount} member(s) skipped (user not found in database)`);
                    }
                    
                    // Verify the final team composition
                    const finalTeamMembers = await tx.teamMember.findMany({
                        where: { teamId: newTeam.id },
                        include: { user: { select: { name: true, email: true } } }
                    });
                    
                    console.log(`✅ FINAL VERIFICATION - Team ${teamRegistration.teamName} has ${finalTeamMembers.length} members in the Team table:`);
                    finalTeamMembers.forEach(tm => {
                        console.log(`   ✓ ${tm.user.name} (${tm.user.email})`);
                    });
                }
            }
        });

        // Send notification emails to all pre-filled members
        const recipientEmails = teamRegistration.pendingMembers.map(m => m.email);
        const emailTemplate = status === 'APPROVED' 
            ? createApprovalEmail(teamRegistration.hackathon.name) 
            : createRejectionEmail(teamRegistration.hackathon.name);
            
        await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
            to: recipientEmails.join(', '),
            subject: emailTemplate.subject,
            html: emailTemplate.html,
        });

        const responseMessage = status === 'APPROVED' && teamCreationResult.teamId
            ? `Team "${teamCreationResult.teamName}" approved! Created with ${teamCreationResult.membersAdded || 0} members in the Team table. Notifications sent.`
            : `Team registration ${status.toLowerCase()} and notifications sent.`;

        return NextResponse.json({ 
            message: responseMessage,
            teamCreated: teamCreationResult
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error updating team registration:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}