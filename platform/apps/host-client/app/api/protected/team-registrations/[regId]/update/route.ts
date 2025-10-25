// apps/host-client/app/api/protected/team-registrations/[regId]/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'db/client';
import { jwtVerify } from 'jose';
import { transporter, createApprovalEmail, createRejectionEmail } from '@/lib/nodemailer';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
interface HostJWTPayload { hostId: string; }

export async function PUT(req: NextRequest, { params }: { params: Promise<{ regId: string }> }) {
    const authHeader = req.headers.get('authorization');
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
        
        // Use a transaction for the database operations
        await prismaClient.$transaction(async (tx) => {
            await tx.teamRegistration.update({
                where: { id: regId },
                data: { status: status }
            });
            
            // If APPROVED, create the official team and link the claimed members
            if (status === 'APPROVED') {
                const newTeam = await tx.team.create({
                    data: {
                        name: teamRegistration.teamName,
                        hackathonId: teamRegistration.hackathonId,
                    }
                });

                // Find members who have already claimed their spot via the token
                const claimedMembers = teamRegistration.pendingMembers.filter(m => m.claimedByUserId !== null);

                if (claimedMembers.length > 0) {
                    await tx.teamMember.createMany({
                        data: claimedMembers.map(m => ({
                            teamId: newTeam.id,
                            userId: m.claimedByUserId!,
                        }))
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

        return NextResponse.json({ message: `Team registration ${status.toLowerCase()} and notifications sent.` }, { status: 200 });
        
    } catch (error) {
        console.error('Error updating team registration:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}