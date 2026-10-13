"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { SearchIcon } from "@/components/icons";

interface Hit {
  slug: string;
  name: string;
  summary: string | null;
  category: string | null;
  image: string | null;
  alt: string;
}

export function GiftSearch({ q, hidden }: { q: string; hidden: ReactNode }) {
  const router = useRouter();
  const listId = useId().replace(/:/g, "");
  const box = useRef<HTMLFormElement>(null);
  const [text, setText] = useState(q);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(-1);
  const [note, setNote] = useState("");

  useEffect(() => {
    setText(q);
  }, [q]);

  useEffect(() => {
    const query = text.trim();
    if (query.length < 3) {
      setHits([]);
      setTotal(0);
      setBusy(false);
      setNote("");
      setOpen(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setBusy(true);
      setOpen(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const body = (await response.json()) as { items?: Hit[]; total?: number; message?: string };
        if (!response.ok) {
          setHits([]);
          setTotal(0);
          setNote(body.message || "Search is busy. Try again in a moment.");
          return;
        }
        setHits(body.items ?? []);
        setTotal(body.total ?? body.items?.length ?? 0);
        setNote("");
        setActive(-1);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setHits([]);
        setTotal(0);
        setNote("Could not search just now.");
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }, 180);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [text]);

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  function goTo(slug: string) {
    setOpen(false);
    router.push(`/products/${slug}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open) return;
    const options = hits.length + (hits.length > 0 ? 1 : 0);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (current + 1) % Math.max(options, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (current <= 0 ? options - 1 : current - 1));
    } else if (event.key === "Enter" && active >= 0 && active < hits.length) {
      event.preventDefault();
      goTo(hits[active].slug);
    }
  }

  const show = open && text.trim().length >= 3;
  const allHref = `/?q=${encodeURIComponent(text.trim())}`;

  useEffect(() => {
    const header = box.current?.closest("header");
    if (!header) return;
    header.classList.toggle("search-open", show);
    return () => header.classList.remove("search-open");
  }, [show]);

  return (
    <form className="search" action="/" method="get" role="search" ref={box}>
      <label className="sr-only" htmlFor="gift-q">
        Search gifts
      </label>
      {hidden}
      <input
        id="gift-q"
        name="q"
        type="search"
        placeholder="Search diyas, dabbas, flasks, pouches…"
        value={text}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={show}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        onChange={(event) => setText(event.target.value)}
        onFocus={() => {
          if (text.trim().length >= 3) setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      <button type="submit" aria-label="Search">
        <SearchIcon />
      </button>
      {show ? (
        <div className="search-pop" id={listId} role="listbox" aria-label="Matching gifts">
          {busy && hits.length === 0 ? <p className="search-note">Searching…</p> : null}
          {!busy && note ? <p className="search-note">{note}</p> : null}
          {!busy && !note && hits.length === 0 ? <p className="search-note">No gifts match that.</p> : null}
          {hits.map((hit, index) => (
            <a
              key={hit.slug}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={active === index}
              href={`/products/${hit.slug}`}
              className="search-hit"
              onMouseEnter={() => setActive(index)}
              onClick={(event) => {
                event.preventDefault();
                goTo(hit.slug);
              }}
            >
              {hit.image ? (
                <Image src={hit.image} alt="" width={44} height={44} />
              ) : (
                <span className="search-blank" />
              )}
              <span>
                <b>{hit.name}</b>
                <span className="search-meta">{[hit.category, hit.summary].filter(Boolean).join(" · ")}</span>
              </span>
            </a>
          ))}
          {hits.length > 0 ? (
            <a id={`${listId}-${hits.length}`} className="search-more" href={allHref} aria-selected={active === hits.length} role="option">
              {`See all ${total} gifts`}
            </a>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
