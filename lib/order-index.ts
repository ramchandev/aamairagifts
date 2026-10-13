import "server-only";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const file = path.join(process.cwd(), "data", "order-index.json");

export interface IndexedOrder {
  token: string;
  number: string;
}

function phoneKey(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
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
  if (key.length < 10 || !token) return;
  const all = await readIndex();
  const list = all[key] ?? [];
  if (list.some((entry) => entry.token === token)) return;
  all[key] = [...list, { token, number }];
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(all, null, 2));
}

export async function tokensForPhone(phone: string) {
  const key = phoneKey(phone);
  if (key.length < 10) return [];
  return (await readIndex())[key] ?? [];
}

export function phoneDigits(phone: string) {
  return phoneKey(phone);
}
