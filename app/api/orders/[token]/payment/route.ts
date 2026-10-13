import { NextResponse } from "next/server";
import { claimPayment, CofoloError, trackOrder } from "@/lib/cofolo";

const TOKEN = /^[a-f0-9]{32,128}$/i;

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token: raw } = await params;
  const token = decodeURIComponent(raw).trim();
  if (!TOKEN.test(token)) {
    return NextResponse.json({ message: "That order link isn't valid." }, { status: 400 });
  }

  let payload: { reference?: string; paidOn?: string; note?: string };
  try {
    payload = (await request.json()) as { reference?: string; paidOn?: string; note?: string };
  } catch {
    return NextResponse.json({ message: "Could not read the payment." }, { status: 400 });
  }

  const reference = payload.reference?.trim() ?? "";
  if (!reference || reference.length > 80) {
    return NextResponse.json(
      { message: "Enter the UPI or bank reference.", details: ["reference is required."] },
      { status: 400 },
    );
  }
  const paidOn = payload.paidOn?.trim() ?? "";
  if (paidOn && !/^\d{4}-\d{2}-\d{2}$/.test(paidOn)) {
    return NextResponse.json({ message: "Check the payment date.", details: ["paidOn must be a date."] }, { status: 400 });
  }
  const note = payload.note?.trim().slice(0, 500) ?? "";

  let amount: number | undefined;
  try {
    const tracked = await trackOrder(token);
    if (tracked.order.status !== "payment_pending" || !tracked.order.payment) {
      return NextResponse.json({ message: "This order isn't waiting for a payment." }, { status: 409 });
    }
    if (typeof tracked.order.payment.amountDue === "number") amount = tracked.order.payment.amountDue;
  } catch (error) {
    if (error instanceof CofoloError && (error.status === 404 || error.status === 400)) {
      return NextResponse.json({ message: "That order link isn't valid." }, { status: 404 });
    }
    if (error instanceof CofoloError && error.status === 429) {
      return NextResponse.json(
        { message: error.message, retryAfter: error.retryAfter },
        { status: 429, headers: error.retryAfter ? { "Retry-After": String(error.retryAfter) } : undefined },
      );
    }
    throw error;
  }

  try {
    const { order } = await claimPayment(token, {
      reference,
      ...(paidOn ? { paidOn } : {}),
      ...(note ? { note } : {}),
      ...(amount != null ? { amount } : {}),
    });
    return NextResponse.json({ ok: true, number: order.number, status: order.status }, { status: 201 });
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
