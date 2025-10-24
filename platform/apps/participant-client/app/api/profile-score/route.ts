// apps/participant-client/app/api/profile-score/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// This is the main handler for POST requests to /api/profile-score
export async function POST(req: NextRequest) {
    try {
        // 1. Parse the incoming request body from our frontend
        const body = await req.json();
        const { name, tech_stack_used } = body;

        // 2. Basic validation to ensure we have the data we need
        if (!name || !tech_stack_used) {
            return NextResponse.json({ message: 'Name and tech stack are required.' }, { status: 400 });
        }
        
        // 3. --- IMPORTANT: REPLACE WITH YOUR AI MODEL'S ACTUAL API ENDPOINT ---
        const externalApiUrl = 'https://your-ai-model-api.com/get-profile-score';
        // ---

        // 4. Make the call to your external AI service
        // We're creating a new object to ensure the payload matches exactly what your API expects.
        const responseFromAi = await axios.post(externalApiUrl, {
            name: name,
            tech_stack_used: tech_stack_used,
        }, {
            headers: {
                // If your API requires an authorization key, you would add it here
                // 'Authorization': `Bearer ${process.env.YOUR_AI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        // 5. Check for a successful response from the AI service
        if (responseFromAi.status !== 200) {
            throw new Error(`External API responded with status: ${responseFromAi.status}`);
        }

        // 6. Securely return the data from your AI service to our frontend
        // We are assuming your API returns a body like: { name: "...", score: 82, eligible_to: "..." }
        return NextResponse.json(responseFromAi.data, { status: 200 });

    } catch (error: any) {
        // 7. Robust error handling
        console.error('Error in profile-score API bridge:', error.response?.data || error.message);
        
        // Return a generic error to the client to avoid leaking implementation details
        return NextResponse.json({ message: 'An error occurred while calculating the profile score.' }, { status: 502 }); // 502 Bad Gateway is appropriate for upstream errors
    }
}