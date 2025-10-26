// apps/host-client/app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Get the filename from the URL parameters (e.g., /api/upload?filename=logo.png)
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  // 2. We need both a filename and the request body to proceed.
  if (!filename || !request.body) {
    return NextResponse.json(
      { message: 'Filename and file body are required.' },
      { status: 400 },
    );
  }

  // 3. Use the 'put' function from @vercel/blob/server.
  // This function is designed to take the raw request body (which is a file stream)
  // and upload it directly to Vercel Blob.
  const blob = await put(filename, request.body, {
    access: 'public', // This is CRUCIAL. It makes the uploaded images viewable by anyone on the web.
  });

  // 4. 'put' returns a JSON object with the URL and other details. We send this back to the client.
  return NextResponse.json(blob);
}