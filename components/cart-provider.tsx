"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Product } from "@/lib/types";

const CART_KEY = "aamaira-cart";
const LABEL_KEY = "aamaira-cart-labels";
const GUEST_KEY = "aamaira-guests";
const CHANGE = "aamaira-cart-change";

export interface CartLine {
  sku?: string;
  productId?: string;
  quantity: number;
}

export interface CartLabel {
  key: string;
  sku: string | null;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  imageAlt: string | null;
  priceOnRequest: boolean;
  minQuantity: number;
  maxQuantity: number | null;
  unit: string;
  inStock: boolean;
}

interface CartContextValue {
  lines: CartLine[];
  labels: Record<string, CartLabel>;
  guests: number;
  setGuests: (value: number) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  toast: string | null;
  dismissToast: () => void;
  itemCount: number;
  pieceCount: number;
  hasQuoteItem: boolean;
  lineFor: (product: Product) => CartLine | undefined;
  remember: (product: Product) => void;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (product: Product, quantity: number) => void;
  setQuantityFromKey: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  applyGuests: (guests: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function lineKey(line: Pick<CartLine, "sku" | "productId">) {
  return line.sku || line.productId || "";
}

export function productKey(product: Pick<Product, "sku" | "id">) {
  return product.sku || product.id;
}

function emit() {
  window.dispatchEvent(new Event(CHANGE));
}

function parseLines(raw: string): CartLine[] {
  try {
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed.filter((line) => lineKey(line) && line.quantity > 0) : [];
  } catch {
    return [];
  }
}

function parseLabels(raw: string): Record<string, CartLabel> {
  try {
    const parsed = JSON.parse(raw) as Record<string, CartLabel>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function clampQuantity(quantity: number, min: number, max: number | null) {
  const next = Math.max(0, Math.floor(Number(quantity) || 0));
  if (next === 0) return 0;
  const floored = Math.max(min, next);
  return max == null ? floored : Math.min(max, floored);
}

function toLabel(product: Product): CartLabel {
  const image = product.images[0];
  return {
    key: productKey(product),
    sku: product.sku,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: image?.url ?? null,
    imageAlt: image?.alt ?? product.name,
    priceOnRequest: product.priceOnRequest || product.price == null,
    minQuantity: product.minQuantity || 1,
    maxQuantity: product.maxQuantity,
    unit: product.unit,
    inStock: product.inStock,
  };
}

const EMPTY_LINES: CartLine[] = [];
const EMPTY_LABELS: Record<string, CartLabel> = {};

let lineSnapshot = { raw: "[]", value: EMPTY_LINES };
let labelSnapshot = { raw: "{}", value: EMPTY_LABELS };

function readLines() {
  const raw = localStorage.getItem(CART_KEY) ?? "[]";
  if (lineSnapshot.raw !== raw) lineSnapshot = { raw, value: parseLines(raw) };
  return lineSnapshot.value;
}

function readLabels() {
  const raw = localStorage.getItem(LABEL_KEY) ?? "{}";
  if (labelSnapshot.raw !== raw) labelSnapshot = { raw, value: parseLabels(raw) };
  return labelSnapshot.value;
}

function readGuests() {
  return Math.max(1, Number(localStorage.getItem(GUEST_KEY) ?? "50") || 50);
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE, callback);
  };
}

function save(lines: CartLine[], labels: Record<string, CartLabel>) {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify(
      lines.map((line) => (line.sku ? { sku: line.sku, quantity: line.quantity } : { productId: line.productId, quantity: line.quantity })),
    ),
  );
  localStorage.setItem(LABEL_KEY, JSON.stringify(labels));
  emit();
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, readLines, () => EMPTY_LINES);
  const labels = useSyncExternalStore(subscribe, readLabels, () => EMPTY_LABELS);
  const guests = useSyncExternalStore(subscribe, readGuests, () => 50);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.body.classList.toggle("has-items", lines.length > 0);
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lines.length, drawerOpen]);

  const setGuests = useCallback((value: number) => {
    localStorage.setItem(GUEST_KEY, JSON.stringify(Math.max(1, Math.floor(value) || 1)));
    emit();
  }, []);

  const remember = useCallback((product: Product) => {
    const label = toLabel(product);
    const current = parseLabels(localStorage.getItem(LABEL_KEY) ?? "{}");
    const previous = current[label.key];
    if (
      previous &&
      previous.name === label.name &&
      previous.image === label.image &&
      previous.priceOnRequest === label.priceOnRequest &&
      previous.minQuantity === label.minQuantity &&
      previous.maxQuantity === label.maxQuantity &&
      previous.inStock === label.inStock
    ) {
      return;
    }
    localStorage.setItem(LABEL_KEY, JSON.stringify({ ...current, [label.key]: label }));
    emit();
  }, []);

  const add = useCallback((product: Product, quantity?: number) => {
    if (!product.inStock) return;
    const label = toLabel(product);
    const qty = clampQuantity(quantity ?? Math.max(label.minQuantity, guests), label.minQuantity, label.maxQuantity);
    const current = parseLines(localStorage.getItem(CART_KEY) ?? "[]");
    const nextLabels = { ...parseLabels(localStorage.getItem(LABEL_KEY) ?? "{}"), [label.key]: label };
    const existing = current.find((line) => lineKey(line) === label.key);
    const next = existing
      ? current.map((line) => (lineKey(line) === label.key ? { ...line, quantity: qty } : line))
      : [...current, { sku: product.sku ?? undefined, productId: product.id, quantity: qty }];
    save(next, nextLabels);
    setToast(`Added “${product.name}” × ${qty}`);
  }, [guests]);

  const setQuantity = useCallback((product: Product, quantity: number) => {
    const label = toLabel(product);
    const nextLabels = { ...parseLabels(localStorage.getItem(LABEL_KEY) ?? "{}"), [label.key]: label };
    const nextQty = clampQuantity(quantity, label.minQuantity, label.maxQuantity);
    const current = parseLines(localStorage.getItem(CART_KEY) ?? "[]");
    const existing = current.find((line) => lineKey(line) === label.key);
    const next =
      nextQty <= 0
        ? current.filter((line) => lineKey(line) !== label.key)
        : existing
          ? current.map((line) => (lineKey(line) === label.key ? { ...line, quantity: nextQty } : line))
          : [...current, { sku: product.sku ?? undefined, productId: product.id, quantity: nextQty }];
    save(next, nextLabels);
    if (nextQty <= 0) setToast(`Removed “${product.name}”`);
  }, []);

  const setQuantityFromKey = useCallback((key: string, quantity: number) => {
    const currentLabels = parseLabels(localStorage.getItem(LABEL_KEY) ?? "{}");
    const label = currentLabels[key];
    const min = label?.minQuantity ?? 1;
    const max = label?.maxQuantity ?? null;
    let nextQty = Math.floor(Number(quantity) || 0);
    if (nextQty > 0 && nextQty < min) nextQty = min;
    if (nextQty > 0 && max != null) nextQty = Math.min(max, nextQty);
    const current = parseLines(localStorage.getItem(CART_KEY) ?? "[]");
    const next =
      nextQty <= 0
        ? current.filter((line) => lineKey(line) !== key)
        : current.map((line) => (lineKey(line) === key ? { ...line, quantity: nextQty } : line));
    save(next, currentLabels);
  }, []);

  const remove = useCallback((key: string) => {
    const current = parseLines(localStorage.getItem(CART_KEY) ?? "[]").filter((line) => lineKey(line) !== key);
    save(current, parseLabels(localStorage.getItem(LABEL_KEY) ?? "{}"));
  }, []);

  const applyGuests = useCallback((value: number) => {
    const nextGuests = Math.max(1, Math.floor(value) || 1);
    localStorage.setItem(GUEST_KEY, JSON.stringify(nextGuests));
    const currentLabels = parseLabels(localStorage.getItem(LABEL_KEY) ?? "{}");
    const next = parseLines(localStorage.getItem(CART_KEY) ?? "[]").map((line) => {
      const label = currentLabels[lineKey(line)];
      const min = label?.minQuantity ?? 1;
      const max = label?.maxQuantity ?? null;
      return { ...line, quantity: clampQuantity(Math.max(min, nextGuests), min, max) };
    });
    save(next, currentLabels);
    setToast(`All quantities set to ${nextGuests}`);
  }, []);

  const clear = useCallback(() => {
    save([], parseLabels(localStorage.getItem(LABEL_KEY) ?? "{}"));
    setDrawerOpen(false);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const pieceCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const hasQuoteItem = lines.length === 0 || lines.some((line) => labels[lineKey(line)]?.priceOnRequest !== false);
    return {
      lines,
      labels,
      guests,
      setGuests,
      drawerOpen,
      setDrawerOpen,
      toast,
      dismissToast: () => setToast(null),
      itemCount: lines.length,
      pieceCount,
      hasQuoteItem,
      lineFor: (product) => lines.find((line) => lineKey(line) === productKey(product)),
      remember,
      add,
      setQuantity,
      setQuantityFromKey,
      remove,
      applyGuests,
      clear,
    };
  }, [lines, labels, guests, setGuests, drawerOpen, toast, remember, add, setQuantity, setQuantityFromKey, remove, applyGuests, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
