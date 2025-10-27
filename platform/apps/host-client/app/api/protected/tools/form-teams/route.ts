// apps/host-client/app/api/protected/tools/form-teams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: NextRequest) {
    // Security Check: Verify the host is logged in before proceeding.
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    try {
        await jwtVerify(token, secret);
    } catch (err) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ message: 'No CSV file was uploaded.' }, { status: 400 });
        }

        // We are acting as a secure proxy. We re-package the file into new form data
        // to send to your external service. This hides the external URL and any API keys.
        const externalApiFormData = new FormData();
        externalApiFormData.append('file', file);
        
        // --- IMPORTANT: REPLACE WITH YOUR TEAM FORMATION AI'S API ENDPOINT ---
        const externalApiUrl = 'https://your-ai-model-api.com/form-teams-by-id';
        // ---

        const responseFromAi = await axios.post(externalApiUrl, externalApiFormData, {
            headers: {
                // Add any secret API key your service might need. Store it in .env!
                // 'X-API-Key': process.env.YOUR_AI_SERVICE_API_KEY,
                'Content-Type': 'multipart/form-data',
            },
            // Crucially, we expect the raw CSV text as the response
            responseType: 'text' 
        });

        // The AI service returns a CSV string. We will send this back to the client.
        // The client will then trigger the download.
        return new NextResponse(responseFromAi.data, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="formed-teams-by-id.csv"',
            },
        });

    } catch (error: any) {
        console.error('Error in form-teams API bridge:', error.response?.data || error.message);
        return NextResponse.json({ message: 'An error occurred while communicating with the AI service.' }, { status: 502 });
    }
}