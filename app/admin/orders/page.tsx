export const metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return (
    <div className="p-5 sm:p-8 max-w-5xl">
      <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-midnight-900">
        Orders
      </h1>
      <p className="mt-2 text-steel-600">
        Orders live here once Stripe Checkout ships in Phase 4.
      </p>
    </div>
  );
}
