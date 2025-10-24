// apps/participant-client/app/api/project-score/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// This is the main handler for POST requests to /api/project-score
export async function POST(req: NextRequest) {
    // Security Check: Ensure a user is logged in before they can ping the AI service.
    // This prevents anonymous users from abusing your API endpoint.
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }
    
    try {
        // 1. Parse the incoming request body from our frontend wizard
        const body = await req.json();
        const { name, tech_stack_used } = body;

        // 2. Basic validation
        if (!name || !tech_stack_used) {
            return NextResponse.json({ message: 'Project name and tech stack are required.' }, { status: 400 });
        }
        
        // 3. --- IMPORTANT: REPLACE WITH YOUR PROJECT SCORING AI'S ACTUAL API ENDPOINT ---
        const externalApiUrl = 'https://your-ai-model-api.com/get-project-score';
        // ---

        // 4. Make the call to your external AI service
        const responseFromAi = await axios.post(externalApiUrl, {
            name: name,
            tech_stack_used: tech_stack_used,
        }, {
            headers: {
                // Add any necessary headers for your AI service, e.g., an API key
                // 'Authorization': `Bearer ${process.env.YOUR_PROJECT_AI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        // 5. Check for a successful response from the AI service
        if (responseFromAi.status !== 200) {
            throw new Error(`External API responded with status: ${responseFromAi.status}`);
        }

        // 6. Securely return the data from your AI service to our frontend
        // We are assuming your API returns a body like: { "name": "...", "score": 95 }
        return NextResponse.json(responseFromAi.data, { status: 200 });

    } catch (error: any) {
        // 7. Robust error handling
        console.error('Error in project-score API bridge:', error.response?.data || error.message);
        return NextResponse.json({ message: 'An error occurred while evaluating the project score.' }, { status: 502 }); // 502 Bad Gateway
    }
}