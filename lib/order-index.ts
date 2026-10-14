import "server-only";
import { cookies } from "next/headers";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { NextResponse } from "next/server";
import { addToDirectory, directoryOrders, type IndexedOrder } from "@/lib/order-directory";

export type { IndexedOrder };

const file = path.join(process.cwd(), "data", "order-index.json");
const COOKIE = "aamaira-orders";
const MAX_REMEMBERED = 8;

interface RememberedOrder extends IndexedOrder {
  phone: string;
}

function phoneKey(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function rememberedOrders(value: string | undefined): RememberedOrder[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as RememberedOrder[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row) =>
        typeof row?.phone === "string" &&
        /^\d{10}$/.test(row.phone) &&
        typeof row?.token === "string" &&
        /^[a-f0-9]{32,128}$/i.test(row.token) &&
        typeof row?.number === "string" &&
        row.number.length > 0 &&
        row.number.length <= 40,
    );
  } catch {
    return [];
  }
}

export function rememberOnResponse(response: NextResponse, existing: string | undefined, phone: string, token: string, number: string) {
  const key = phoneKey(phone);
  if (key.length < 10 || !/^[a-f0-9]{32,128}$/i.test(token) || !number) return response;
  const rows = rememberedOrders(existing).filter((row) => row.token !== token);
  rows.push({ phone: key, token, number });
  response.cookies.set({
    name: COOKIE,
    value: Buffer.from(JSON.stringify(rows.slice(-MAX_REMEMBERED))).toString("base64url"),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });
  return response;
}

async function readIndex(): Promise<Record<string, IndexedOrder[]>> {
  try {
    const parsed = JSON.parse(await readFile(file, "utf8")) as Record<string, IndexedOrder[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function rememberOrder(phone: string, token: string, number: string) {
  const key = phoneKey(phone);
  if (key.length < 10 || !/^[a-f0-9]{32,128}$/i.test(token) || !number) return;
  try {
    const all = await readIndex();
    const list = all[key] ?? [];
    if (!list.some((entry) => entry.token === token)) {
      all[key] = [...list, { token, number }];
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, JSON.stringify(all, null, 2));
    }
  } catch (error) {
    console.error("Could not write the local order index", error instanceof Error ? error.name : "error");
  }
  try {
    await addToDirectory(key, [{ token, number }]);
  } catch (error) {
    console.error("Could not save the shared phone directory", error instanceof Error ? error.name : "error");
  }
}

async function browserOrders(phone: string) {
  try {
    const jar = await cookies();
    return rememberedOrders(jar.get(COOKIE)?.value)
      .filter((row) => row.phone === phone)
      .map(({ token, number }) => ({ token, number }));
  } catch {
    return [];
  }
}

export async function tokensForPhone(phone: string) {
  const key = phoneKey(phone);
  if (key.length < 10) return [];
  const [fromDirectory, fromFile, fromBrowser] = await Promise.all([
    directoryOrders(key),
    readIndex().then((all) => all[key] ?? []),
    browserOrders(key),
  ]);
  const seen = new Set<string>();
  const merged: IndexedOrder[] = [];
  for (const entry of [...fromDirectory, ...fromBrowser, ...fromFile]) {
    const id = entry.token.toLowerCase();
    if (seen.has(id)) continue;
    seen.add(id);
    merged.push(entry);
  }
  const known = new Set(fromDirectory.map((entry) => entry.token.toLowerCase()));
  const missing = merged.filter((entry) => !known.has(entry.token.toLowerCase()));
  if (missing.length > 0) {
    try {
      await addToDirectory(key, missing);
    } catch (error) {
      console.error("Could not update the phone directory", error instanceof Error ? error.name : "error");
    }
  }
  return merged;
}

export function phoneDigits(phone: string) {
  return phoneKey(phone);
}
