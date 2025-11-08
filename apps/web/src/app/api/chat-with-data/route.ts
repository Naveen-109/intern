import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const vannaApiUrl = process.env.VANNA_API_BASE_URL || 'http://localhost:8000';
    const vannaApiKey = process.env.VANNA_API_KEY;

    const response = await fetch(`${vannaApiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(vannaApiKey && { 'Authorization': `Bearer ${vannaApiKey}` }),
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vanna API error:', errorText);
      return NextResponse.json(
        {
          error: 'Failed to process query',
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

