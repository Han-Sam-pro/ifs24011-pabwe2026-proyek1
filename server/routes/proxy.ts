import { Router, Request, Response } from 'express';

export const proxyRouter = Router();

// Proxy all requests from /api-proxy/* to Delcom Open API https://open-api.delcom.org/api/v1/*
proxyRouter.use('/', async (req: Request, res: Response) => {
  const targetUrl = `https://open-api.delcom.org/api/v1${req.url}`;
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (req.headers.authorization) headers['Authorization'] = req.headers.authorization as string;
    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'] as string;

    const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0;

    const options: RequestInit = {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    };

    const response = await fetch(targetUrl, options);
    const textResponse = await response.text();

    let data;
    try {
      data = JSON.parse(textResponse);
    } catch {
      data = { status: 'fail', message: textResponse || 'Format tanggapan server tidak valid' };
    }

    res.status(response.status).json(data);
  } catch (e: unknown) {
    console.error('Delcom API Proxy Error:', e);
    res.status(500).json({
      status: 'fail',
      message: e instanceof Error ? e.message : 'Terjadi kesalahan pada server proxy',
    });
  }
});
