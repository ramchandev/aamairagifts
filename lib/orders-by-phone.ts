import "server-only";
import { CofoloError, trackOrder } from "@/lib/cofolo";
import { tokensForPhone } from "@/lib/order-index";
import type { Order } from "@/lib/types";

export interface PhoneOrder {
  token: string;
  order: Order;
}

export async function ordersForPhone(phone: string): Promise<PhoneOrder[]> {
  const entries = await tokensForPhone(phone);
  const loaded = await Promise.all(
    entries.map(async (entry) => {
      try {
        const result = await trackOrder(entry.token);
        return { token: entry.token, order: result.order };
      } catch (error) {
        if (error instanceof CofoloError && error.status === 404) return null;
        throw error;
      }
    }),
  );
  return loaded
    .filter((item): item is PhoneOrder => item !== null)
    .sort((a, b) => Date.parse(b.order.placedAt) - Date.parse(a.order.placedAt));
}
