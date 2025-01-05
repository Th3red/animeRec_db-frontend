import { NextResponse } from "next/server";

// Proxy the request to Flask
export async function POST(request) {
  try {
    const body = await request.json();
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    // Make the request to your Flask server
    const flaskResponse = await fetch(`${apiBaseUrl}/users/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Return the JSON from Flask back to the Next.js client
    const data = await flaskResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


