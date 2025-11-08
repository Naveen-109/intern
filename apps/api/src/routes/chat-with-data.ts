import { Router } from 'express';

export const chatRouter = Router();

chatRouter.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
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
      return res.status(response.status).json({
        error: 'Failed to process query',
        details: errorText,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

