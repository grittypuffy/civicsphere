import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return await proxyRequest(req)
}

export async function POST(req: NextRequest) {
  return await proxyRequest(req)
}

async function proxyRequest(req: NextRequest) {
  const url = req.nextUrl;
  const backendApi = process.env.NEXT_PUBLIC_BACKEND_API;
  if (!backendApi) {
    console.error('NEXT_PUBLIC_BACKEND_API environment variable not set');
    return new Response('Backend API configuration error', { status: 500 });
  }

  const newUrl = `${backendApi}${url.pathname}${url.search}`;
  console.log('Proxying request to:', newUrl);

  try {
    const newReq = new Request(newUrl, req.clone());

    const res = await fetch(newReq, {
      signal: AbortSignal.timeout(30000),
    });

    const resHeaders = new Headers(res.headers);
    const hopByHopHeaders = [
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'transfer-encoding',
      'upgrade'
    ];
    hopByHopHeaders.forEach(header => {
      resHeaders.delete(header);
    });

    const body = await res.arrayBuffer();
    return new Response(body, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.error('Request timeout:', newUrl);
      return new Response('Request timeout', { status: 504 });
    }

    console.error('Error proxying request:', error);
    return new Response('Error proxying request', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
