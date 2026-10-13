import { NextRequest, NextResponse } from "next/server";
import { CofoloError, placeOrder } from "@/lib/cofolo";
import { rememberOnResponse, rememberOrder } from "@/lib/order-index";
import type { PlaceOrderInput } from "@/lib/types";

interface CheckoutBody {
  cart?: { sku?: string; productId?: string; quantity?: number }[];
  customer?: { name?: string; email?: string; phone?: string; company?: string };
  place?: string;
  notes?: string;
  checkoutId?: string;
  website?: string;
}

function trackingToken(orderUrl: string) {
  const hex = orderUrl.match(/[a-f0-9]{32,128}/i)?.[0];
  if (hex) return hex;
  try {
    return new URL(orderUrl).pathname.split("/").filter(Boolean).pop() ?? "";
  } catch {
    return "";
  }
}

function addressFrom(place: string): PlaceOrderInput["shippingAddress"] | undefined {
  const trimmed = place.trim();
  if (!trimmed) return undefined;
  const postalCode = trimmed.match(/\b\d{6}\b/)?.[0] ?? "";
  const city = trimmed.replace(/\b\d{6}\b/, "").replace(/[/,]+/g, " ").replace(/\s+/g, " ").trim();
  const line = city || trimmed;
  return { line1: line, line2: "", city: line, postalCode, country: "India" };
}

export async function POST(request: NextRequest) {
  let payload: CheckoutBody;
  try {
    payload = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ message: "Could not read the quote." }, { status: 400 });
  }

  if (typeof payload.website === "string" && payload.website.trim()) {
    return NextResponse.json({ message: "Could not send the quote.", details: ["This request was rejected."] }, { status: 400 });
  }
  if (!payload.checkoutId || typeof payload.checkoutId !== "string") {
    return NextResponse.json({ message: "Missing checkout id.", details: ["checkoutId is required."] }, { status: 400 });
  }

  const cart = Array.isArray(payload.cart) ? payload.cart : [];
  if (cart.length === 0 || cart.length > 100) {
    return NextResponse.json({ message: "Add at least one gift.", details: ["items are required."] }, { status: 400 });
  }

  const items: { sku?: string; productId?: string; quantity: number }[] = [];
  for (const line of cart) {
    const quantity = Math.floor(Number(line.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 100000) {
      return NextResponse.json({ message: "Check the quantities.", details: ["Each quantity must be a whole number."] }, { status: 400 });
    }
    if (typeof line.sku === "string" && line.sku) items.push({ sku: line.sku, quantity });
    else if (typeof line.productId === "string" && line.productId) items.push({ productId: line.productId, quantity });
    else return NextResponse.json({ message: "A gift in the list is missing.", details: ["Each item needs a sku."] }, { status: 400 });
  }

  const customer = payload.customer ?? {};
  const name = customer.name?.trim() ?? "";
  const phone = customer.phone?.trim() ?? "";
  const email = customer.email?.trim() ?? "";
  const shippingAddress = addressFrom(payload.place ?? "");
  const missing: string[] = [];
  if (!email) missing.push("customer.email is required.");
  if (!shippingAddress?.line1) missing.push("shippingAddress.line1 is required.");
  if (!shippingAddress?.city) missing.push("shippingAddress.city is required.");
  if (!shippingAddress?.postalCode) missing.push("shippingAddress.postalCode is required.");
  if (missing.length || !shippingAddress) {
    return NextResponse.json({ message: missing[0] ?? "A 6-digit pincode is required.", details: missing }, { status: 400 });
  }
  try {
    const { order } = await placeOrder(
      {
        customer: {
          name,
          email,
          phone,
          company: customer.company?.trim() ?? "",
        },
        shippingAddress,
        notes: typeof payload.notes === "string" ? payload.notes : "",
        items,
        website: "",
      },
      payload.checkoutId,
    );
    const token = trackingToken(order.orderUrl);
    if (!token) {
      return NextResponse.json(
        { message: "The quote was saved, but its order ID could not be read.", number: order.number },
        { status: 502 },
      );
    }
    try {
      await rememberOrder(phone, token, order.number);
    } catch (error) {
      console.error("Could not remember the order for the phone lookup", error);
    }
    const response = NextResponse.json({
      token,
      number: order.number,
      needsPricing: order.needsPricing,
      status: order.status,
    });
    return rememberOnResponse(response, request.cookies.get("aamaira-orders")?.value, phone, token, order.number);
  } catch (error) {
    if (error instanceof CofoloError) {
      return NextResponse.json(
        { message: error.message, details: error.details, requestId: error.requestId, retryAfter: error.retryAfter },
        {
          status: error.status,
          headers: error.retryAfter ? { "Retry-After": String(error.retryAfter) } : undefined,
        },
      );
    }
    throw error;
  }
}
