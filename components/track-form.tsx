export function TrackForm({ phone = "" }: { phone?: string }) {
  return (
    <form className="track-bar" action="/track" method="get">
      <h2>Track an order</h2>
      <label className="sr-only" htmlFor="phone">
        Phone number
      </label>
      <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Phone number" defaultValue={phone} required />
      <button className="btn-primary" type="submit">
        Show orders
      </button>
    </form>
  );
}
