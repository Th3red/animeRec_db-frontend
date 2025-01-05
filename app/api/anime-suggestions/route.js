import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const flaskResp = await fetch(`${apiBaseUrl}/api/anime-suggestions?query=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!flaskResp.ok) {
      const errorData = await flaskResp.json();
      return NextResponse.json({ error: errorData.error || "Failed to fetch anime suggestions" }, { status: flaskResp.status });
    }

    const data = await flaskResp.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
