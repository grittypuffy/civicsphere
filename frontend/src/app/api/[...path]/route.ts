import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return await proxyRequest(req)
}

export async function POST(req: NextRequest) {
  return await proxyRequest(req)
}

async function proxyRequest(req: NextRequest) {
  const url = req.nextUrl;
  const newUrl = `${process.env.BACKEND_ADDRESS}${url.pathname}${url.search}`;
  console.log('Proxying request to:', newUrl);

  const newReq = new Request(newUrl, req.clone())
  try {
    const res = await fetch(newReq);
    const resHeaders = new Headers(res.headers);

    // Remove hop-by-hop headers
    resHeaders.delete('connection');
    resHeaders.delete('keep-alive');
    resHeaders.delete('proxy-authenticate');
    resHeaders.delete('proxy-authorization');
    resHeaders.delete('te');
    resHeaders.delete('trailers');
    resHeaders.delete('transfer-encoding');
    resHeaders.delete('upgrade');

    const body = await res.arrayBuffer();
    return new Response(body, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (error) {
    console.error('Error proxying request:', error);
    return new Response('Error proxying request', { status: 500 });
  }
}
