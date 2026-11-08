// An empty state in a React app (any bundler: Vite, Next.js, Remix ...). `npm install three` first.
import { EmptyState } from '../react/EmptyState.jsx';

export function OrdersPanel({ orders, theme }) {
  if (orders.length) return <OrdersTable orders={orders} />;
  return (
    <div className="empty">
      <EmptyState name="no-orders" look="mono" theme={theme} accent="indigo" size={200} />
      <h3>No orders yet</h3>
      <p>When customers buy something, their orders appear here.</p>
      <button>Share your store</button>
    </div>
  );
}

function OrdersTable() { return null; }
