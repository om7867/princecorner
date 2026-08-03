import { NextRequest, NextResponse } from "next/server";
import { createMockOrder, getMockOrders, getMockOrderById, updateMockOrderStatus } from "@/server/order-store";

const BACKEND_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path ? resolvedParams.path.join("/") : "";
  const search = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/${path}${search}`;

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host" && key.toLowerCase() !== "content-length") {
      headers[key] = value;
    }
  });

  let rawBodyText = "";
  let parsedBody: any = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      rawBodyText = await request.text();
      parsedBody = rawBodyText ? JSON.parse(rawBodyText) : null;
    } catch {
      rawBodyText = "";
    }
  }

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: rawBodyText || undefined,
      cache: "no-store",
    });

    if (res.ok) {
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });
      const data = await res.arrayBuffer();
      return new NextResponse(data, {
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
      });
    }
    
    // If backend returned error status, fallback for orders if path starts with orders
    if (path.startsWith("orders")) {
      throw new Error(`Backend returned status ${res.status}`);
    }
    
    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  } catch {
    // Graceful fallback for orders when backend FastAPI server is offline
    if (path === "orders" && request.method === "POST") {
      const created = createMockOrder(parsedBody);
      return NextResponse.json(created, { status: 201 });
    }

    if (path === "orders" && request.method === "GET") {
      const tableParam = request.nextUrl.searchParams.get("table") || undefined;
      const orders = getMockOrders(tableParam);
      return NextResponse.json(orders);
    }

    if (path.startsWith("orders/") && request.method === "GET") {
      const orderId = path.replace("orders/", "");
      const order = getMockOrderById(orderId);
      if (order) return NextResponse.json(order);
      return NextResponse.json({ detail: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { detail: "Backend connection error. Make sure FastAPI server is running on port 8000." },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
