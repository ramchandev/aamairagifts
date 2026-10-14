import "server-only";
import { get, put } from "@vercel/blob";

export interface IndexedOrder {
  token: string;
  number: string;
}

function ready() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function pathname(phone: string) {
  return `orders/${phone}.json`;
}

function validRow(row: unknown): row is IndexedOrder {
  if (!row || typeof row !== "object") return false;
  const entry = row as IndexedOrder;
  return /^[a-f0-9]{32,128}$/i.test(entry.token) && typeof entry.number === "string" && entry.number.length > 0 && entry.number.length <= 40;
}

async function readStored(phone: string) {
  if (!ready() || !/^\d{10}$/.test(phone)) return { rows: [] as IndexedOrder[], etag: null as string | null };
  const result = await get(pathname(phone), { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return { rows: [] as IndexedOrder[], etag: null as string | null };
  const text = await new Response(result.stream).text();
  let parsed: unknown = [];
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    parsed = [];
  }
  const rows = Array.isArray(parsed) ? parsed.filter(validRow) : [];
  return { rows, etag: result.blob.etag };
}

export async function directoryOrders(phone: string) {
  try {
    return (await readStored(phone)).rows;
  } catch (error) {
    console.error("Could not read the phone directory", error instanceof Error ? error.name : "error");
    return [];
  }
}

export async function addToDirectory(phone: string, entries: IndexedOrder[]) {
  if (!ready() || !/^\d{10}$/.test(phone)) return;
  const incoming = entries.filter(validRow);
  if (incoming.length === 0) return;

  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await readStored(phone);
    const seen = new Set(current.rows.map((row) => row.token.toLowerCase()));
    const next = [...current.rows];
    for (const entry of incoming) {
      if (seen.has(entry.token.toLowerCase())) continue;
      seen.add(entry.token.toLowerCase());
      next.push({ token: entry.token, number: entry.number });
    }
    if (next.length === current.rows.length) return;
    try {
      await put(pathname(phone), JSON.stringify(next.slice(-40)), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 60,
        ...(current.etag ? { ifMatch: current.etag } : {}),
      });
      const saved = await readStored(phone);
      const stillMissing = incoming.some((entry) => !saved.rows.some((row) => row.token.toLowerCase() === entry.token.toLowerCase()));
      if (!stillMissing) return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Could not save the phone directory");
}
