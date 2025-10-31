// apps/host-client/app/api/protected/tools/allocate-rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: NextRequest) {
    // --- Security Verification ---
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    try { await jwtVerify(token, secret); } catch (err) { return NextResponse.json({ message: 'Invalid token' }, { status: 401 }); }
    
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const roomsAvailable = formData.get('roomsAvailable') as string;
        const roomCapacity = formData.get('roomCapacity') as string;

        if (!file || !roomsAvailable || !roomCapacity) {
            return NextResponse.json({ message: 'CSV file and all room details are required.' }, { status: 400 });
        }

        // Re-package all the data into new form data to send to your external service.
        const externalApiFormData = new FormData();
        externalApiFormData.append('file', file);
        externalApiFormData.append('no_of_rooms_available', roomsAvailable);
        externalApiFormData.append('each_room_capacity', roomCapacity);
        
        // --- IMPORTANT: REPLACE WITH YOUR ROOM ALLOCATION AI'S API ENDPOINT ---
        const externalApiUrl = 'http://localhost:8000/model2/upload';
        // ---

        const responseFromAi = await axios.post(externalApiUrl, externalApiFormData, {
            headers: {
                // 'X-API-Key': process.env.YOUR_AI_SERVICE_API_KEY,
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'text' // We expect the raw CSV content as the response
        });

        // The AI service returns a CSV string. We send this directly back to the client for download.
        return new NextResponse(responseFromAi.data, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="room-allocations.csv"',
            },
        });

    } catch (error: any) {
        console.error('Error in allocate-rooms API bridge:', error.response?.data || error.message);
        return NextResponse.json({ message: 'An error occurred while communicating with the AI service.' }, { status: 502 });
    }
}