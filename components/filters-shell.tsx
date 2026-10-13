"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, FilterIcon } from "@/components/icons";

const FiltersContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 901px)");
    const close = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);
  return <FiltersContext.Provider value={{ open, setOpen }}>{children}</FiltersContext.Provider>;
}

function useFilters() {
  const context = useContext(FiltersContext);
  if (!context) throw new Error("Filters must be used within FiltersProvider");
  return context;
}

export function FilterButton() {
  const { setOpen } = useFilters();
  return (
    <button className="filter-btn" type="button" onClick={() => setOpen(true)}>
      <FilterIcon /> Filters
    </button>
  );
}

export function FiltersAside({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useFilters();
  return (
    <>
      {open ? createPortal(<div className="scrim open" onClick={() => setOpen(false)} />, document.body) : null}
      <aside className={`filters${open ? " open" : ""}`} aria-label="Filters">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="f-title">Filter</div>
          <button className="x f-close" type="button" aria-label="Close filters" onClick={() => setOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        {children}
      </aside>
    </>
  );
}
