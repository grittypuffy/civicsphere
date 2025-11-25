import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return await proxyRequest(req)
}

export async function POST(req: NextRequest) {
  return await proxyRequest(req)
}

export async function PUT(req: NextRequest) {
  return await proxyRequest(req)
}

export async function DELETE(req: NextRequest) {
  return await proxyRequest(req)
}

export async function PATCH(req: NextRequest) {
  return await proxyRequest(req)
}

async function proxyRequest(req: NextRequest) {
  const url = req.nextUrl;
  const backendApi = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendApi) {
    console.error('NEXT_PUBLIC_BACKEND_URL environment variable not set');
    return new Response('Backend API configuration error', { status: 500 });
  }

  const newUrl = `${backendApi}${url.pathname}${url.search}`;
  console.log('Proxying request to:', newUrl);

  try {
    // Create headers for the backend request, filtering out hop-by-hop headers
    const requestHeaders = new Headers();
    const hopByHopHeaders = [
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'transfer-encoding',
      'upgrade',
      'host' // Remove host header as it should be set to the backend host
    ];

    // Copy headers from original request, excluding hop-by-hop headers
    req.headers.forEach((value, key) => {
      if (!hopByHopHeaders.includes(key.toLowerCase())) {
        requestHeaders.set(key, value);
      }
    });

    // Get the request body if it exists
    let body: ArrayBuffer | null = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await req.arrayBuffer();
    }

    // Create the backend request
    const backendRequest = new Request(newUrl, {
      method: req.method,
      headers: requestHeaders,
      body: body,
    });

    const res = await fetch(backendRequest, {
      signal: AbortSignal.timeout(30000),
    });

    // Filter out hop-by-hop headers from the response
    const resHeaders = new Headers(res.headers);
    hopByHopHeaders.forEach(header => {
      resHeaders.delete(header);
    });

    // Check if this is a streaming response
    const contentType = res.headers.get('content-type') || '';
    const isStreaming = contentType.includes('text/event-stream') || contentType.includes('application/stream');

    if (isStreaming && res.body) {
      // For streaming responses, pass through the body directly
      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
      });
    } else {
      // For non-streaming responses, buffer the entire response
      const responseBody = await res.arrayBuffer();
      console.log('Proxied response body:', new TextDecoder().decode(responseBody).slice(0, 100));
      return new Response(responseBody, {
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
      });
    }
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
