export default function TrackOrderPage() {
  return (
    <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-bhor-lg border border-bhor-border bg-bhor-surface p-6 shadow-bhor-soft">
        <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
          Track Order
        </p>
        <h1 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
          Track Your BHORKIT Order
        </h1>
        <p className="mt-3 text-bhor-small leading-bhor-body text-bhor-text-muted">
          Order tracking will be connected to BHORKIT fulfillment once backend order data is available.
        </p>
        <label className="mt-6 block">
          <span className="text-bhor-small font-bhor-semibold text-bhor-text">Order ID or mobile number</span>
          <input
            type="text"
            placeholder="Enter order ID or mobile number"
            className="mt-2 min-h-12 w-full rounded-bhor-sm border border-bhor-border bg-bhor-cream px-4 text-bhor-small text-bhor-text outline-none focus:border-bhor-primary"
          />
        </label>
        <button
          type="button"
          className="mt-4 min-h-12 rounded-bhor-sm bg-bhor-primary px-6 text-bhor-button font-bhor-bold uppercase text-white"
        >
          Track Order
        </button>
      </section>
    </main>
  );
}
