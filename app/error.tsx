"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="wrap" style={{ padding: "64px 24px" }}>
      <h1>Something went wrong</h1>
      <p>{error.message || "We couldn’t load this page."}</p>
      <button className="btn-primary" type="button" onClick={reset} style={{ maxWidth: 240 }}>
        Try again
      </button>
    </main>
  );
}
