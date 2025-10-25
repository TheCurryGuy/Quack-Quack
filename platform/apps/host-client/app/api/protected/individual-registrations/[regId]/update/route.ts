// apps/host-client/app/api/protected/individual-registrations/[regId]/update/route.ts
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
        const { status } = await req.json(); // Expecting { status: 'APPROVED' | 'REJECTED' }

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status provided' }, { status: 400 });
        }

        // Find the registration and verify the host owns the parent hackathon
        const registration = await prismaClient.individualRegistration.findFirst({
            where: {
                id: regId,
                hackathon: { hostId: hostId }
            },
            include: {
                user: { select: { email: true } },
                hackathon: { select: { name: true } }
            }
        });

        if (!registration) {
            return NextResponse.json({ message: 'Registration not found or access denied.' }, { status: 404 });
        }

        // Update the status in the database
        await prismaClient.individualRegistration.update({
            where: { id: regId },
            data: { status: status }
        });
        
        // Send the notification email
        const emailTemplate = status === 'APPROVED' 
            ? createApprovalEmail(registration.hackathon.name) 
            : createRejectionEmail(registration.hackathon.name);
            
        await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
            to: registration.user.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
        });

        return NextResponse.json({ message: `Registration ${status.toLowerCase()} and notification sent.` }, { status: 200 });
        
    } catch (error) {
        console.error('Error updating individual registration:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}