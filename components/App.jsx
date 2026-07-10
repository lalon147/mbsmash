'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Car, Plus, Check, X, Package, ChevronLeft,
  Hash, Tag, ChevronRight, RotateCcw, Wrench, LayoutDashboard, Paintbrush, LogOut,
  Camera, Receipt, History, ChevronDown,
} from 'lucide-react';

// ============================================================
// DATA LAYER — Next.js API routes → local PostgreSQL
// ============================================================
async function getMakes() {
  const res = await fetch('/api/makes');
  return res.json();
}
async function getModels(makeId) {
  const res = await fetch(`/api/makes/${makeId}/models`);
  return res.json();
}
async function addMake(name) {
  const res = await fetch('/api/makes', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not add that make. Please try again.');
  return data;
}
async function addModel(makeId, name) {
  const res = await fetch(`/api/makes/${makeId}/models`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not add that model. Please try again.');
  return data;
}
async function getVehicles() {
  const res = await fetch('/api/vehicles');
  return res.json();
}
async function getOrdersForVehicle(id) {
  const res = await fetch(`/api/vehicles/${id}/orders`);
  return res.json();
}
async function getDealerships() {
  const res = await fetch('/api/dealerships');
  return res.json();
}
async function searchCatalog(term) {
  const res = await fetch(`/api/catalog?q=${encodeURIComponent(term)}`);
  return res.json();
}
async function addVehicle(v) {
  const res = await fetch('/api/vehicles', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(v),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not save the vehicle. Please try again.');
  return data;
}
async function placeOrder(order) {
  const res = await fetch(`/api/vehicles/${order.vehicle_id}/orders`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not add the part. Please try again.');
  return data;
}
async function updateOrderStatus(vehicleId, orderId, status) {
  const res = await fetch(`/api/vehicles/${vehicleId}/orders/${orderId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not update the part. Please try again.');
  return data;
}
async function updateOrderDetails(vehicleId, orderId, fields) {
  const res = await fetch(`/api/vehicles/${vehicleId}/orders/${orderId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not save changes. Please try again.');
  return data;
}
async function getDashboardStats() {
  const res = await fetch('/api/dashboard');
  return res.json();
}
async function addCatalogPart(name) {
  const res = await fetch('/api/catalog', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ part_name: name }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not add that part. Please try again.');
  return data;
}
async function getPaintCatalog() {
  const res = await fetch('/api/paint-catalog');
  return res.json();
}
async function addPaintCatalogPart(name) {
  const res = await fetch('/api/paint-catalog', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ part_name: name }),
  });
  return res.json();
}
async function getVehiclePaint(vehicleId) {
  const res = await fetch(`/api/vehicles/${vehicleId}/paint`);
  return res.json();
}
async function addVehiclePaintItem(vehicleId, partName) {
  const res = await fetch(`/api/vehicles/${vehicleId}/paint`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ part_name: partName }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not add that paint part. Please try again.');
  return data;
}
async function removeVehiclePaintItem(vehicleId, itemId) {
  const res = await fetch(`/api/vehicles/${vehicleId}/paint/${itemId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Could not remove that paint part. Please try again.');
}
async function updateVehiclePaintStatus(vehicleId, itemId, status) {
  const res = await fetch(`/api/vehicles/${vehicleId}/paint/${itemId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not update that paint part. Please try again.');
  return data;
}
async function getVehiclePhotos(vehicleId) {
  const res = await fetch(`/api/vehicles/${vehicleId}/photos`);
  return res.json();
}
async function addVehiclePhoto(vehicleId, dataUrl) {
  const res = await fetch(`/api/vehicles/${vehicleId}/photos`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data_url: dataUrl }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not save the photo. Please try again.');
  return data;
}
async function removeVehiclePhoto(vehicleId, photoId) {
  const res = await fetch(`/api/vehicles/${vehicleId}/photos/${photoId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Could not delete the photo. Please try again.');
}
async function getInvoiceTypes() {
  const res = await fetch('/api/invoice-types');
  return res.json();
}
async function addInvoiceType(name) {
  const res = await fetch('/api/invoice-types', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not add that invoice type. Please try again.');
  return data;
}
async function getVehicleInvoices(vehicleId) {
  const res = await fetch(`/api/vehicles/${vehicleId}/invoices`);
  return res.json();
}
async function addVehicleInvoice(vehicleId, invoice) {
  const res = await fetch(`/api/vehicles/${vehicleId}/invoices`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not save the invoice. Please try again.');
  return data;
}
async function updateVehicleInvoice(vehicleId, invoiceId, fields) {
  const res = await fetch(`/api/vehicles/${vehicleId}/invoices/${invoiceId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not save changes. Please try again.');
  return data;
}
async function removeVehicleInvoice(vehicleId, invoiceId) {
  const res = await fetch(`/api/vehicles/${vehicleId}/invoices/${invoiceId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Could not delete the invoice. Please try again.');
}
async function getVehicleHistory(vehicleId) {
  const res = await fetch(`/api/vehicles/${vehicleId}/history`);
  return res.json();
}
async function getCurrentUser() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return null;
  return res.json();
}

// Shrink a phone photo to a small JPEG data URL before uploading,
// so it fits comfortably in the database.
function fileToResizedDataUrl(file, maxDim = 1280, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image file.')); };
    img.src = url;
  });
}

// ============================================================
// THEME — deep purple cyber
// ============================================================
const T = {
  bg:         '#090612',
  panel:      '#20153c',
  panelHi:    '#362367',
  line:       '#4d3291',
  text:       '#e8edf7',
  dim:        '#9b8ec4',
  accent:     '#794ee6',
  accentMid:  '#6340bc',
};

const STATUS = {
  ordered:  { label: 'Ordered',   fg: '#fcd34d', bg: 'rgba(252,211,77,.12)',  bd: 'rgba(252,211,77,.4)' },
  received: { label: 'Received',  fg: '#a78bfa', bg: 'rgba(167,139,250,.12)', bd: 'rgba(167,139,250,.4)' },
  returned: { label: 'To return', fg: '#f472b6', bg: 'rgba(244,114,182,.12)', bd: 'rgba(244,114,182,.4)' },
};

// Part names come from DB in ALL CAPS — convert to Title Case, preserving
// auto-part abbreviations that are always uppercase.
const ABBREVS = new Set(['RH', 'LH', 'FR', 'RR', 'LPR', 'RPR', 'ASSY', 'LPR', 'RPR']);
function fmt(str) {
  if (!str) return str;
  return str.split(' ').map(w =>
    ABBREVS.has(w.toUpperCase())
      ? w.toUpperCase()
      : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  ).join(' ');
}

// ============================================================
// CHANGE HISTORY — who changed what, and when
// ============================================================
const FIELD_LABELS = {
  status: 'Status', dealership_id: 'Dealership', unit_price: 'Price',
  quantity: 'Quantity', part_number: 'Part number', expected_date: 'Expected',
  amount: 'Amount', invoice_date: 'Invoice date', invoice_type_id: 'Type',
  photo: 'Photo',
};

const ACTION_VERBS = { created: 'Added', updated: 'Edited', deleted: 'Deleted' };

// change_log stores raw column values as text. Turn them back into what the
// shop floor sees on the card — a dealership name, not its id.
function formatValue(field, value, ctx) {
  if (value == null) return '—';
  if (field === 'status')          return STATUS[value]?.label ?? value;
  if (field === 'dealership_id')   return ctx.dealerName?.(value) || 'No dealership';
  if (field === 'invoice_type_id') return ctx.typeName?.(value) || 'Uncategorised';
  if (field === 'unit_price' || field === 'amount') return `$${Number(value).toFixed(2)}`;
  if (field.endsWith('_date'))     return String(value).slice(0, 10);
  return String(value);
}

// Photo values are digests, never printable. What changed is whether one exists.
function describePhotoChange(oldValue, newValue) {
  if (!oldValue && newValue) return 'Photo added';
  if (oldValue && !newValue) return 'Photo removed';
  return 'Photo replaced';
}

function timeAgo(iso) {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60)    return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60)    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24)      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days < 30)       return days === 1 ? 'yesterday' : `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

// One edit that touched three columns wrote three rows, all sharing the
// transaction's changed_at. Fold them back into a single entry so the history
// reads "Lalon changed price and quantity", not the same edit three times.
function groupHistory(entries) {
  const groups = [];
  for (const entry of entries) {
    const last = groups[groups.length - 1];
    const sameEdit = last
      && last.changed_at === entry.changed_at
      && last.action === entry.action
      && last.username === entry.username;
    if (sameEdit) last.changes.push(entry);
    else groups.push({
      changed_at: entry.changed_at, action: entry.action,
      username: entry.username, display_name: entry.display_name,
      changes: [entry],
    });
  }
  return groups;
}

// The whole audit trail for a car, indexed by the record each entry belongs to.
// One request covers the vehicle, its parts, its invoices and its photos.
function useVehicleHistory(vehicleId) {
  const [byEntity, setByEntity] = useState(new Map());

  const reload = useCallback(() => getVehicleHistory(vehicleId)
    .then(rows => {
      const map = new Map();
      for (const row of rows) {
        const key = `${row.entity_type}:${row.entity_id}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(row);
      }
      setByEntity(map);
    })
    .catch(() => {}), [vehicleId]);

  useEffect(() => { reload(); }, [reload]);
  return { byEntity, reload };
}

// A record whose history hasn't loaded yet, or that predates the audit trail,
// renders nothing rather than an empty "Edited by nobody" line.
function ChangeHistory({ entries, ctx = {} }) {
  const [open, setOpen] = useState(false);
  if (!entries?.length) return null;

  const groups = groupHistory(entries);
  const [latest] = groups;
  const who = name => name || 'a removed user';

  return (
    <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${T.line}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
          color: T.dim, fontSize: 11.5, fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <History size={12} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1 }}>
          {ACTION_VERBS[latest.action]} by <strong style={{ color: T.text, fontWeight: 600 }}>
            {who(latest.display_name)}
          </strong> · {timeAgo(latest.changed_at)}
        </span>
        <ChevronDown size={13} style={{
          flexShrink: 0, transition: 'transform .15s',
          transform: open ? 'rotate(180deg)' : 'none',
        }} />
      </button>

      {open && (
        <div style={{ marginTop: 8, display: 'grid', gap: 7 }}>
          {groups.map(group => (
            <div key={`${group.changed_at}-${group.action}-${group.username}`}
              style={{ fontSize: 11.5, color: T.dim, lineHeight: 1.5 }}>
              <div style={{ color: T.text, fontWeight: 600 }}>
                {who(group.display_name)}
                <span style={{ color: T.dim, fontWeight: 400 }}> · {timeAgo(group.changed_at)}</span>
              </div>
              {group.action !== 'updated' ? (
                <div>{ACTION_VERBS[group.action]}</div>
              ) : group.changes.map(change => (
                <div key={change.id}>
                  {change.field === 'photo' || change.field === 'data_url'
                    ? describePhotoChange(change.old_value, change.new_value)
                    : <>
                        {FIELD_LABELS[change.field] || change.field}{' '}
                        {formatValue(change.field, change.old_value, ctx)}
                        {' → '}
                        <span style={{ color: T.text }}>
                          {formatValue(change.field, change.new_value, ctx)}
                        </span>
                      </>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Orders already fetched this session, keyed by vehicle id. Reopening a car
// paints its parts immediately while a fresh copy is fetched behind them.
// Dropped for a vehicle whenever we change one of its orders, so the next
// visit can never show a status we know is out of date.
const ordersCache = new Map();

// ============================================================
// ROOT
// ============================================================
export default function App() {
  const [tab, setTab]               = useState('dashboard');
  const [view, setView]             = useState('main');   // 'main' | 'vehicle' | 'add-part'
  const [vehicles, setVehicles]     = useState([]);
  const [dealerships, setDealerships] = useState([]);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [orders, setOrders]         = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Bumped on every orders fetch so a slow response for a vehicle the user has
  // already navigated away from can't overwrite the one they're looking at now.
  const ordersReq = useRef(0);
  // Optimistic edits that the server hasn't confirmed yet, keyed by order id.
  // A fetch issued before one of these lands would otherwise undo it.
  const unconfirmed = useRef(new Map());
  // Bumped on every mutation. A fetch that was already in flight when an order
  // changed carries pre-change rows, so its response is worthless.
  const cacheEpoch = useRef(0);

  useEffect(() => {
    getVehicles().then(setVehicles).catch(() => {});
    getDealerships().then(setDealerships).catch(() => {});
  }, []);

  const dealerName = id => dealerships.find(d => String(d.id) === String(id))?.name || null;

  // Call before sending anything that changes a vehicle's orders. Every fetch
  // still in flight left the server before the change, so it is written off,
  // and the cached rows can no longer be painted on a revisit.
  function invalidateOrders(vehicleId) {
    cacheEpoch.current++;
    ordersCache.delete(String(vehicleId));
  }

  // `showSkeleton` is off for a background revalidate, where the list on screen
  // is already good enough to keep showing while fresher rows arrive.
  function loadOrders(vehicleId, { showSkeleton = true } = {}) {
    const token = ++ordersReq.current;
    const epoch = cacheEpoch.current;
    setOrdersLoading(showSkeleton);
    return getOrdersForVehicle(vehicleId)
      .then(rows => {
        if (ordersReq.current !== token) return;
        // An order changed while this fetch was out, so `rows` predates the
        // change and mutateOrder has already reconciled that order itself.
        if (cacheEpoch.current !== epoch) return;
        // A mutation sent after this fetch may not have reached the server in
        // time to appear in `rows`, so its patch goes back on top. Only rows
        // nothing is pending against are worth keeping for the next visit.
        if (unconfirmed.current.size === 0) ordersCache.set(String(vehicleId), rows);
        setOrders(rows.map(o => (unconfirmed.current.has(o.id)
          ? { ...o, ...unconfirmed.current.get(o.id) }
          : o)));
      })
      .catch(() => {})
      .finally(() => { if (ordersReq.current === token) setOrdersLoading(false); });
  }

  // Switch to the vehicle page straight away and let its parts fill in, rather
  // than holding the tap until the orders come back. A car opened earlier this
  // session paints its parts at once and refreshes behind them, so returning to
  // one never costs a skeleton.
  function openVehicle(v) {
    const cached = ordersCache.get(String(v.id));
    setActiveVehicle(v);
    setOrders(cached || []);
    setView('vehicle');
    loadOrders(v.id, { showSkeleton: !cached });
  }

  // Apply `patch` to one order immediately, run the request, then reconcile with
  // the row the server returns — rolling that single order back if it fails.
  async function mutateOrder(orderId, patch, request) {
    const before = orders.find(o => o.id === orderId);
    if (activeVehicle) invalidateOrders(activeVehicle.id);
    unconfirmed.current.set(orderId, patch);
    setOrders(cur => cur.map(o => (o.id === orderId ? { ...o, ...patch } : o)));
    try {
      const updated = await request();
      unconfirmed.current.delete(orderId);
      if (updated) setOrders(cur => cur.map(o => (o.id === orderId ? updated : o)));
    } catch (err) {
      unconfirmed.current.delete(orderId);
      if (before) setOrders(cur => cur.map(o => (o.id === orderId ? before : o)));
      throw err;
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, color: T.text,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: 520, margin: '0 auto', paddingBottom: view === 'main' ? 80 : 40 }}>

        {view === 'main' && tab === 'dashboard' && (
          <Dashboard onOpenVehicle={openVehicle} />
        )}

        {view === 'main' && tab === 'vehicles' && (
          <VehicleList
            vehicles={vehicles}
            onOpen={openVehicle}
            onAdded={(v) => { setVehicles([v, ...vehicles]); openVehicle(v); }}
          />
        )}

        {view === 'vehicle' && activeVehicle && (
          <VehiclePage
            vehicle={activeVehicle}
            orders={orders}
            ordersLoading={ordersLoading}
            dealerships={dealerships}
            dealerName={dealerName}
            onBack={() => setView('main')}
            onAddPart={() => setView('add-part')}
            onPaint={() => setView('paint')}
            onInvoices={() => setView('invoices')}
            onStatus={(orderId, status) => mutateOrder(
              orderId, { status },
              () => updateOrderStatus(activeVehicle.id, orderId, status),
            )}
            onEditOrder={(orderId, fields) => mutateOrder(
              orderId, fields,
              () => updateOrderDetails(activeVehicle.id, orderId, fields),
            )}
          />
        )}

        {view === 'add-part' && activeVehicle && (
          <AddPart
            vehicle={activeVehicle}
            dealerships={dealerships}
            dealerName={dealerName}
            onCancel={() => setView('vehicle')}
            onPlaced={(order) => {
              // Show the new row straight away (the list is sorted by created_at,
              // so it belongs last), then refetch: the initial load may still have
              // been in flight and this order page can be reached before it lands.
              if (order) {
                invalidateOrders(activeVehicle.id);
                setOrders(cur => [...cur, order]);
                loadOrders(activeVehicle.id, { showSkeleton: false });
              }
              setView('vehicle');
            }}
          />
        )}

        {view === 'paint' && activeVehicle && (
          <PaintPage
            vehicle={activeVehicle}
            onBack={() => setView('vehicle')}
          />
        )}

        {view === 'invoices' && activeVehicle && (
          <InvoicesPage
            vehicle={activeVehicle}
            onBack={() => setView('vehicle')}
          />
        )}

        <Footer />
      </div>

      {view === 'main' && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: T.panel, borderTop: `1px solid ${T.line}`,
          display: 'flex', zIndex: 20,
        }}>
          {[
            { key: 'dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
            { key: 'vehicles',  Icon: Car,             label: 'Vehicles'  },
          ].map(({ key, Icon, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '12px 8px 16px', background: 'transparent', border: 'none',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              color: tab === key ? T.accent : T.dim,
              borderTop: `2px solid ${tab === key ? T.accent : 'transparent'}`,
              transition: 'color .15s, border-color .15s',
            }}>
              <Icon size={22} />
              <span style={{ fontSize: 11, fontWeight: tab === key ? 700 : 500 }}>{label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// DASHBOARD
// ------------------------------------------------------------
// Last dashboard payload, kept across tab switches so returning to the tab
// paints the previous numbers immediately while fresh ones are fetched.
let dashboardCache = null;

function Dashboard({ onOpenVehicle }) {
  const [stats, setStats]   = useState(dashboardCache?.stats ?? null);
  const [recent, setRecent] = useState(dashboardCache?.recent ?? []);
  const [me, setMe]         = useState(null);

  useEffect(() => {
    let alive = true;
    getDashboardStats().then(d => {
      dashboardCache = d;
      if (alive) { setStats(d.stats); setRecent(d.recent); }
    }).catch(() => {});
    getCurrentUser().then(u => { if (alive) setMe(u); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <>
      <Header title="MB Smash Repair" subtitle="Parts Management" action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {me && (
            <span style={{ fontSize: 12.5, color: T.dim, fontWeight: 600 }}>{me.name}</span>
          )}
          <button onClick={logout} title="Sign out" style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', padding: 6, borderRadius: 8,
            color: T.dim, transition: 'color .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = T.accent}
            onMouseLeave={e => e.currentTarget.style.color = T.dim}
          >
            <LogOut size={18} />
          </button>
        </div>
      } />
      <div style={{ padding: 18 }}>

        {stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            <StatCard label="Vehicles"       value={stats.vehicle_count}   accent="#794ee6" />
            <StatCard label="Parts Pending"  value={stats.pending_count}   accent="#fcd34d" />
            <StatCard label="Received Today" value={stats.received_today}  accent="#a78bfa" />
            <StatCard label="Outstanding"    value={`$${Number(stats.outstanding_cost).toFixed(0)}`} accent="#f472b6" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            <Skeleton rows={2} height={70} />
            <Skeleton rows={2} height={70} />
          </div>
        )}

        <SectionLabel>Recent Vehicles</SectionLabel>
        <div style={{ display: 'grid', gap: 8 }}>
          {!stats && recent.length === 0 && <Skeleton rows={3} height={64} />}
          {recent.map(v => (
            <button key={v.id} onClick={() => onOpenVehicle(v)} style={cardBtn}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: T.panelHi,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Car size={17} color={T.accent} />
                </div>
                <div style={{ textAlign: 'left', minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{v.registration}</div>
                  <div style={{ color: T.dim, fontSize: 12.5 }}>
                    {[v.make, v.model].filter(Boolean).join(' ') || 'No details set'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {Number(v.pending_parts) > 0 && (
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#fcd34d',
                    background: 'rgba(252,211,77,.12)', border: '1px solid rgba(252,211,77,.4)',
                    padding: '2px 8px', borderRadius: 999 }}>
                    {v.pending_parts} pending
                  </span>
                )}
                <ChevronRight size={16} color={T.dim} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: T.panel, border: `1px solid ${T.line}`, borderLeft: `3px solid ${accent}`,
      borderRadius: 14, padding: '16px 14px',
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: T.dim, marginTop: 6, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ------------------------------------------------------------
// VEHICLE LIST
// ------------------------------------------------------------
// Makes rarely change, so they're fetched once and reused — the Add vehicle
// modal can then open with the dropdown already populated.
let makesCache = null;

function VehicleList({ vehicles, onOpen, onAdded }) {
  const [adding, setAdding]         = useState(false);
  const [search, setSearch]         = useState('');
  const [reg, setReg]               = useState('');
  const [dateIn, setDateIn]         = useState('');
  const [makes, setMakes]           = useState(makesCache ?? []);
  const [models, setModels]         = useState([]);
  const [makeId, setMakeId]         = useState('');
  const [modelId, setModelId]       = useState('');
  const [addingMake, setAddingMake] = useState(false);
  const [addingModel, setAddingModel] = useState(false);
  const [newName, setNewName]       = useState('');
  const [makesLoading, setMakesLoading] = useState(false);
  const [saveError, setSaveError]   = useState('');

  const q = search.trim().toLowerCase();
  // Without a search the list shows only the last 14 days of vehicles;
  // searching by rego/make/model looks through all of them.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const filtered = q
    ? vehicles.filter(v =>
        v.registration?.toLowerCase().includes(q) ||
        v.make?.toLowerCase().includes(q) ||
        v.model?.toLowerCase().includes(q)
      )
    : vehicles.filter(v => new Date(v.date_in || v.created_at) >= cutoff);

  // Warm the cache in the background so the first Add vehicle tap is instant.
  useEffect(() => {
    if (makesCache) return;
    getMakes().then(rows => { makesCache = rows; setMakes(rows); }).catch(() => {});
  }, []);

  function openAdd() {
    setReg(''); setMakeId(''); setModelId(''); setModels([]);
    setAddingMake(false); setAddingModel(false); setNewName('');
    setSaveError('');
    setDateIn(new Date().toISOString().slice(0, 10));
    setAdding(true);
    if (makesCache) return;
    setMakesLoading(true);
    getMakes()
      .then(rows => { makesCache = rows; setMakes(rows); })
      .catch(err => console.error('Failed to load makes', err))
      .finally(() => setMakesLoading(false));
  }
  async function onMakeChange(id) {
    setMakeId(id); setModelId(''); setAddingModel(false);
    setModels(id ? await getModels(id) : []);
  }
  async function saveNewMake() {
    if (!newName.trim()) return;
    const m = await addMake(newName);
    const rows = await getMakes();
    makesCache = rows;
    setMakes(rows);
    setNewName(''); setAddingMake(false);
    onMakeChange(String(m.id));
  }
  async function saveNewModel() {
    if (!newName.trim() || !makeId) return;
    const m = await addModel(makeId, newName);
    setModels(await getModels(makeId));
    setNewName(''); setAddingModel(false);
    setModelId(String(m.id));
  }
  async function save() {
    if (!reg.trim()) return;
    const makeName  = makes.find(m  => String(m.id) === String(makeId))?.name  || '';
    const modelName = models.find(m => String(m.id) === String(modelId))?.name || '';
    setSaveError('');
    const v = await addVehicle({
      registration: reg.trim().toUpperCase(),
      make_id:  makeId  || null,
      model_id: modelId || null,
      make:     makeName,
      model:    modelName,
      date_in:  dateIn || new Date().toISOString().slice(0, 10),
    });
    setAdding(false);
    onAdded(v);
  }

  return (
    <>
      <Header title="Vehicles" subtitle="MB Smash Repair" />
      <div style={{ padding: 18 }}>
        <div style={{ ...searchBox, marginBottom: 12 }}>
          <Search size={18} color={T.accent} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search registration, make or model"
            style={searchInput}
          />
          {search && (
            <button onClick={() => setSearch('')} style={iconBtn}>
              <X size={16} color={T.dim} />
            </button>
          )}
        </div>

        <button onClick={openAdd} style={primaryBtn}>
          <Plus size={18} /> Add vehicle
        </button>

        <div style={{ fontSize: 12.5, color: T.dim, margin: '10px 0 0', textAlign: 'right' }}>
          {q
            ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search.trim()}"`
            : 'Showing last 14 days — search rego to find older vehicles'}
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: T.dim, border: `1px dashed ${T.line}`,
              borderRadius: 12, padding: '28px 16px', marginTop: 4 }}>
              <Car size={22} color={T.dim} style={{ marginBottom: 8 }} />
              <div style={{ fontWeight: 600, color: T.text }}>
                {q ? 'No vehicles found' : 'No vehicles in the last 14 days'}
              </div>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                {q ? 'Try a different registration or make' : 'Search rego to find older vehicles'}
              </div>
            </div>
          ) : filtered.map(v => (
            <button key={v.id} onClick={() => onOpen(v)} style={cardBtn}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: T.panelHi,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Car size={18} color={T.accent} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.5 }}>{v.registration}</div>
                  <div style={{ color: T.dim, fontSize: 13 }}>
                    {[v.make, v.model].filter(Boolean).join(' ') || 'Details not set'}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color={T.dim} />
            </button>
          ))}
        </div>
      </div>

      {adding && (
        <Modal onClose={() => setAdding(false)} title="Add vehicle">
          <Field label="Registration" required>
            <input autoFocus value={reg} onChange={e => setReg(e.target.value)}
              placeholder="e.g. R2890" style={inputStyle} />
          </Field>

          <Field label="Make">
            {!addingMake ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={makeId} onChange={e => onMakeChange(e.target.value)}
                  disabled={makesLoading} style={{ ...inputStyle, flex: 1, opacity: makesLoading ? 0.5 : 1 }}>
                  <option value="">{makesLoading ? 'Loading makes…' : 'Select make…'}</option>
                  {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <button onClick={() => { setAddingMake(true); setNewName(''); }} style={addChip} title="Add new make">
                  <Plus size={16} color={T.accent} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="New make name" style={{ ...inputStyle, flex: 1 }} />
                <ActionButton
                  onClick={saveNewMake}
                  onError={err => setSaveError(err.message || 'Could not add that make. Please try again.')}
                  pendingLabel=""
                  style={{ ...addChip, color: T.accent }}
                >
                  <Check size={16} color={T.accent} />
                </ActionButton>
                <button onClick={() => setAddingMake(false)} style={addChip}><X size={16} color={T.dim} /></button>
              </div>
            )}
          </Field>

          <Field label="Model">
            {!addingModel ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={modelId} onChange={e => setModelId(e.target.value)}
                  disabled={!makeId} style={{ ...inputStyle, flex: 1, opacity: makeId ? 1 : 0.5 }}>
                  <option value="">{makeId ? 'Select model…' : 'Pick a make first'}</option>
                  {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <button onClick={() => { setAddingModel(true); setNewName(''); }}
                  disabled={!makeId} style={{ ...addChip, opacity: makeId ? 1 : 0.4 }}>
                  <Plus size={16} color={T.accent} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="New model name" style={{ ...inputStyle, flex: 1 }} />
                <ActionButton
                  onClick={saveNewModel}
                  onError={err => setSaveError(err.message || 'Could not add that model. Please try again.')}
                  pendingLabel=""
                  style={{ ...addChip, color: T.accent }}
                >
                  <Check size={16} color={T.accent} />
                </ActionButton>
                <button onClick={() => setAddingModel(false)} style={addChip}><X size={16} color={T.dim} /></button>
              </div>
            )}
          </Field>

          <Field label="Order Date" required>
            <input type="date" value={dateIn} onChange={e => setDateIn(e.target.value)}
              style={inputStyle} />
          </Field>

          {saveError && (
            <div style={{ fontSize: 13.5, color: '#f472b6', background: 'rgba(244,114,182,.1)',
              border: '1px solid rgba(244,114,182,.4)', borderRadius: 10, padding: '10px 12px' }}>
              {saveError}
            </div>
          )}

          <ActionButton
            onClick={save}
            onError={err => setSaveError(err.message || 'Could not save the vehicle. Please try again.')}
            disabled={!reg.trim()}
            pendingLabel="Saving…"
            style={{ ...primaryBtn, marginTop: 6 }}
          >
            <Check size={18} /> Save vehicle
          </ActionButton>
        </Modal>
      )}
    </>
  );
}

// ------------------------------------------------------------
// VEHICLE PAGE
// ------------------------------------------------------------
function VehiclePage({ vehicle, orders, ordersLoading, dealerships, dealerName, onBack, onAddPart, onPaint, onInvoices, onStatus, onEditOrder }) {
  const total   = orders.reduce((s, o) => s + (o.unit_price || 0) * (o.quantity || 1), 0);
  const pending = orders.filter(o => o.status === 'ordered').length;
  const [errorId, setErrorId]               = useState(null);
  const [errorMsg, setErrorMsg]             = useState('');
  const [editingOrder, setEditingOrder]     = useState(null);
  const { byEntity, reload: reloadHistory }  = useVehicleHistory(vehicle.id);

  // The badge flips before this resolves, so a failure has to explain the revert.
  async function changeStatus(orderId, status) {
    setErrorId(null);
    try {
      await onStatus(orderId, status);
      reloadHistory();
    } catch (err) {
      setErrorId(orderId);
      setErrorMsg(err?.message || 'Could not update the part. Please try again.');
    }
  }

  return (
    <>
      <Header
        title={vehicle.registration}
        subtitle={[vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'Vehicle'}
        onBack={onBack}
      />
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <Stat label="Parts"   value={ordersLoading ? '—' : orders.length} />
          <Stat label="Pending" value={ordersLoading ? '—' : pending} />
          <Stat label="Cost"    value={ordersLoading || !total ? '—' : `$${total.toFixed(0)}`} />
        </div>

        <button onClick={onAddPart} style={primaryBtn}>
          <Plus size={18} /> Order part
        </button>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button onClick={onPaint} style={{ ...outlineBtn, flex: 1 }}>
            <Paintbrush size={18} /> Paint
          </button>
          <button onClick={onInvoices} style={{ ...outlineBtn, flex: 1 }}>
            <Receipt size={18} /> Invoices
          </button>
        </div>

        {ordersLoading ? (
          <div style={{ marginTop: 16 }}>
            <LoadingNote>Loading parts…</LoadingNote>
            <Skeleton rows={3} height={92} />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ marginTop: 18, textAlign: 'center', color: T.dim,
            border: `1px dashed ${T.line}`, borderRadius: 12, padding: '30px 16px' }}>
            <Wrench size={22} color={T.dim} style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 600, color: T.text }}>No parts ordered yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              Order parts as you assess the damage. If it can be repaired, there&apos;s nothing to add.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
            {orders.map(o => {
              const st = STATUS[o.status] || STATUS.ordered;
              return (
                <div key={o.id} style={{ background: T.panel, border: `1px solid ${T.line}`,
                  borderRadius: 12, padding: '13px 14px' }}>
                  <div onClick={() => setEditingOrder(o)} style={{
                    display: 'flex', justifyContent: 'space-between', gap: 10, cursor: 'pointer' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>
                        {fmt(o.part_name)}{o.quantity > 1 ? ` ×${o.quantity}` : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12.5, color: T.dim }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Hash size={12} />{o.part_number || '—'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Tag size={12} />{dealerName(o.dealership_id) || 'No dealership'}
                        </span>
                        {o.unit_price != null && (
                          <span>${Number(o.unit_price).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <span style={{ alignSelf: 'flex-start', fontSize: 11.5, fontWeight: 700,
                      color: st.fg, background: st.bg, border: `1px solid ${st.bd}`,
                      padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                      {st.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {o.status === 'ordered' && (
                      <button onClick={() => changeStatus(o.id, 'received')} style={miniBtn(T.accent)}>
                        <Check size={14} /> Received
                      </button>
                    )}
                    {o.status !== 'returned' && (
                      <button onClick={() => changeStatus(o.id, 'returned')} style={miniBtn(T.dim)}>
                        <RotateCcw size={14} /> Return
                      </button>
                    )}
                    {o.status === 'returned' && (
                      <button onClick={() => changeStatus(o.id, 'ordered')} style={miniBtn(T.dim)}>
                        Undo
                      </button>
                    )}
                  </div>

                  {errorId === o.id && (
                    <div style={{ fontSize: 12.5, color: '#f472b6', marginTop: 6 }}>{errorMsg}</div>
                  )}

                  <ChangeHistory entries={byEntity.get(`order:${o.id}`)} ctx={{ dealerName }} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          dealerships={dealerships}
          onCancel={() => setEditingOrder(null)}
          onSave={async fields => {
            await onEditOrder(editingOrder.id, fields);
            reloadHistory();
            setEditingOrder(null);
          }}
        />
      )}
    </>
  );
}

function EditOrderModal({ order, dealerships, onCancel, onSave }) {
  const [dealershipId, setDealershipId] = useState(order.dealership_id ? String(order.dealership_id) : '');
  const [quantity, setQuantity]         = useState(order.quantity ?? 1);
  const [price, setPrice]               = useState(order.unit_price != null ? String(order.unit_price) : '');
  const [partNumber, setPartNumber]     = useState(order.part_number || '');
  const [expected, setExpected]         = useState(order.expected_date ? order.expected_date.slice(0, 10) : '');
  const [error, setError]               = useState('');

  async function save() {
    setError('');
    await onSave({
      dealership_id: dealershipId || null,
      quantity:       Number(quantity) || 1,
      unit_price:     price ? Number(price) : null,
      part_number:    partNumber.trim() || null,
      expected_date:  expected || null,
    });
  }

  return (
    <Modal title={fmt(order.part_name)} onClose={onCancel}>
      <Field label="Part number">
        <input value={partNumber} onChange={e => setPartNumber(e.target.value)} style={inputStyle} />
      </Field>
      <Field label="Dealership">
        <select value={dealershipId} onChange={e => setDealershipId(e.target.value)} style={inputStyle}>
          <option value="">Not set</option>
          {dealerships.map(d => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
        </select>
      </Field>
      <div style={{ display: 'flex', gap: 12 }}>
        <Field label="Quantity" style={{ flex: 1 }}>
          <input type="number" min={1} value={quantity}
            onChange={e => setQuantity(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Unit price" style={{ flex: 1 }}>
          <input type="number" step="0.01" value={price}
            onChange={e => setPrice(e.target.value)} placeholder="0.00" style={inputStyle} />
        </Field>
      </div>
      <Field label="Expected delivery">
        <input type="date" value={expected} onChange={e => setExpected(e.target.value)} style={inputStyle} />
      </Field>
      {error && <div style={{ fontSize: 13, color: '#f472b6' }}>{error}</div>}
      <ActionButton
        onClick={save}
        onError={err => setError(err.message || 'Could not save changes. Please try again.')}
        pendingLabel="Saving…"
        style={primaryBtn}
      >
        <Check size={18} /> Save changes
      </ActionButton>
    </Modal>
  );
}

// ------------------------------------------------------------
// ADD PART
// ------------------------------------------------------------
function AddPart({ vehicle, dealerships, dealerName, onCancel, onPlaced }) {
  const [term, setTerm]             = useState('');
  const [results, setResults]       = useState([]);
  const [picked, setPicked]         = useState(null);
  const [dealershipId, setDealershipId] = useState('');
  const [quantity, setQuantity]     = useState(1);
  const [price, setPrice]           = useState('');
  const [expected, setExpected]     = useState('');
  const [addingNew, setAddingNew]   = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [photos, setPhotos]         = useState([]);
  const [photoBusy, setPhotoBusy]   = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [lightbox, setLightbox]     = useState(null);
  const [placeError, setPlaceError] = useState('');
  const searchReq = useRef(0);

  // Debounced so typing doesn't fire a request per keystroke, and stale
  // responses from earlier terms are dropped rather than replacing newer ones.
  useEffect(() => {
    const token = ++searchReq.current;
    const timer = setTimeout(() => {
      searchCatalog(term)
        .then(rows => { if (searchReq.current === token) setResults(rows); })
        .catch(() => {});
    }, term ? 180 : 0);
    return () => clearTimeout(timer);
  }, [term]);

  useEffect(() => {
    getVehiclePhotos(vehicle.id).then(p => Array.isArray(p) && setPhotos(p)).catch(() => {});
  }, [vehicle.id]);

  async function onPickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoBusy(true); setPhotoError('');
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      const p = await addVehiclePhoto(vehicle.id, dataUrl);
      setPhotos(prev => [...prev, p]);
    } catch (err) {
      setPhotoError(err.message || 'Could not save the photo. Please try again.');
    } finally {
      setPhotoBusy(false);
    }
  }
  // Drop the thumbnail on tap; put it back if the delete didn't land.
  async function deletePhoto(photoId) {
    const before = photos;
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    setPhotoError('');
    try {
      await removeVehiclePhoto(vehicle.id, photoId);
    } catch (err) {
      setPhotos(before);
      setPhotoError(err.message || 'Could not delete the photo. Please try again.');
    }
  }

  function run(v) { setTerm(v); setAddingNew(false); }
  function choose(p) {
    setPicked(p);
    setDealershipId(p.default_dealership_id ? String(p.default_dealership_id) : '');
    setPrice(p.typical_price != null ? String(p.typical_price) : '');
    setQuantity(1); setExpected('');
  }
  async function saveNewPart() {
    if (!newPartName.trim()) return;
    const p = await addCatalogPart(newPartName);
    setAddingNew(false);
    setNewPartName('');
    choose(p);
  }
  async function confirm() {
    setPlaceError('');
    const order = await placeOrder({
      vehicle_id:      vehicle.id,
      catalog_part_id: picked.id,
      part_name:       picked.part_name,
      part_number:     picked.part_number,
      dealership_id:   dealershipId || null,
      quantity:        Number(quantity),
      unit_price:      price ? Number(price) : null,
      expected_date:   expected || null,
      status:          'ordered',
    });
    onPlaced(order);
  }

  return (
    <>
      <Header
        title="Order part"
        subtitle={`for ${vehicle.registration}`}
        onBack={picked ? () => setPicked(null) : onCancel}
      />
      <div style={{ padding: 18 }}>
        <SectionLabel>Accident photos ({photos.length}/2)</SectionLabel>
        <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
          {photos.map(p => (
            <div key={p.id} style={{ position: 'relative', width: 92, height: 92, flexShrink: 0 }}>
              <img src={p.data_url} alt="Accident photo" onClick={() => setLightbox(p.data_url)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer',
                  borderRadius: 12, border: `1px solid ${T.line}` }} />
              <button onClick={() => deletePhoto(p.id)} title="Delete photo" style={{
                position: 'absolute', top: -6, right: -6, width: 24, height: 24,
                borderRadius: 999, border: `1px solid ${T.line}`, background: T.panel,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={14} color="#f472b6" />
              </button>
            </div>
          ))}
          {photos.length < 2 && (
            <label style={{
              width: 92, height: 92, borderRadius: 12, border: `1px dashed ${T.line}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 6, cursor: photoBusy ? 'wait' : 'pointer', color: T.dim,
              opacity: photoBusy ? 0.5 : 1, flexShrink: 0,
            }}>
              <Camera size={20} color={T.accent} />
              <span style={{ fontSize: 11.5, fontWeight: 600 }}>
                {photoBusy ? 'Saving…' : 'Add photo'}
              </span>
              <input type="file" accept="image/*" capture="environment"
                onChange={onPickPhoto} disabled={photoBusy} style={{ display: 'none' }} />
            </label>
          )}
        </div>
        {photoError && (
          <div style={{ fontSize: 13, color: '#f472b6', marginBottom: 6 }}>{photoError}</div>
        )}

        {!picked ? (
          <>
            <div style={{ ...searchBox, marginTop: 12 }}>
              <Search size={18} color={T.accent} />
              <input autoFocus value={term} onChange={e => run(e.target.value)}
                placeholder="Search part number or name" style={searchInput} />
              {term && <button onClick={() => run('')} style={iconBtn}><X size={16} color={T.dim} /></button>}
            </div>

            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              {results.length === 0 && term && !addingNew && (
                <div style={{ textAlign: 'center', color: T.dim, border: `1px dashed ${T.line}`,
                  borderRadius: 12, padding: '22px 12px' }}>
                  <div style={{ marginBottom: 12 }}>No catalog match for &quot;{term}&quot;</div>
                  <button onClick={() => { setAddingNew(true); setNewPartName(term); }}
                    style={{ ...primaryBtn, width: 'auto', padding: '10px 20px', fontSize: 14 }}>
                    <Plus size={16} /> Add &quot;{term}&quot; to catalog
                  </button>
                </div>
              )}
              {results.map(p => (
                <button key={p.id} onClick={() => choose(p)} style={cardBtn}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; }}>
                  <div style={{ textAlign: 'left', minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{fmt(p.part_name)}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12.5, color: T.dim }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Hash size={12} />{p.part_number || '—'}
                      </span>
                      {dealerName(p.default_dealership_id) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Tag size={12} />{dealerName(p.default_dealership_id)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ color: p.typical_price != null ? T.accent : T.dim, fontWeight: 600, fontSize: 14 }}>
                    {p.typical_price != null ? `$${Number(p.typical_price).toFixed(2)}` : '—'}
                  </div>
                </button>
              ))}

              {/* Always-available new part option */}
              {!addingNew ? (
                <button onClick={() => { setAddingNew(true); setNewPartName(''); }}
                  style={{ background: 'transparent', border: `1px dashed ${T.line}`, borderRadius: 12,
                    padding: '12px', cursor: 'pointer', color: T.dim, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Plus size={16} color={T.accent} />
                  <span>Add new part to catalog</span>
                </button>
              ) : (
                <div style={{ background: T.panel, border: `1px solid ${T.accent}`,
                  borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12.5, color: T.dim, fontWeight: 600, marginBottom: 8 }}>
                    New part name
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input autoFocus value={newPartName} onChange={e => setNewPartName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveNewPart()}
                      placeholder="e.g. FRONT BUMPER" style={{ ...inputStyle, flex: 1 }} />
                    <ActionButton onClick={saveNewPart} pendingLabel="" style={{ ...addChip, color: T.accent }}>
                      <Check size={16} color={T.accent} />
                    </ActionButton>
                    <button onClick={() => setAddingNew(false)} style={addChip}><X size={16} color={T.dim} /></button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ background: T.panel, border: `1px solid ${T.line}`,
              borderLeft: `3px solid ${T.accent}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{fmt(picked.part_name)}</div>
              <div style={{ color: T.dim, fontSize: 13, marginTop: 4 }}>
                {picked.part_number ? `Part #${picked.part_number}` : 'No part number'}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
              <Field label="Dealership">
                <select value={dealershipId} onChange={e => setDealershipId(e.target.value)} style={inputStyle}>
                  <option value="">Not set</option>
                  {dealerships.map(d => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
                </select>
              </Field>
              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="Quantity" style={{ flex: 1 }}>
                  <input type="number" min={1} value={quantity}
                    onChange={e => setQuantity(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Unit price" style={{ flex: 1 }}>
                  <input type="number" step="0.01" value={price}
                    onChange={e => setPrice(e.target.value)} placeholder="0.00" style={inputStyle} />
                </Field>
              </div>
              <Field label="Expected delivery">
                <input type="date" value={expected} onChange={e => setExpected(e.target.value)} style={inputStyle} />
              </Field>
            </div>

            {placeError && (
              <div style={{ fontSize: 13, color: '#f472b6', marginTop: 12 }}>{placeError}</div>
            )}
            <ActionButton
              onClick={confirm}
              onError={err => setPlaceError(err.message || 'Could not add the part. Please try again.')}
              pendingLabel="Adding…"
              style={{ ...primaryBtn, marginTop: 20 }}
            >
              <Check size={18} /> Add to {vehicle.registration}
            </ActionButton>
          </>
        )}
      </div>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}

// ------------------------------------------------------------
// PAINT PAGE
// ------------------------------------------------------------
// Placeholder id for a paint item that exists on screen but not yet in the DB.
const isTempId = id => typeof id === 'string' && id.startsWith('tmp-');

function PaintPage({ vehicle, onBack }) {
  const [catalog, setCatalog]     = useState([]);
  const [items, setItems]         = useState([]);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName]     = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([getPaintCatalog(), getVehiclePaint(vehicle.id)])
      .then(([cat, its]) => { if (alive) { setCatalog(cat); setItems(its); } })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [vehicle.id]);

  const isSelected = name => items.some(i => i.part_name === name);
  const getItem    = name => items.find(i => i.part_name === name);

  // Paint the chip on tap and settle with the server afterwards. A chip whose
  // insert is still in flight has no real id yet, so it can't be removed.
  async function toggle(partName) {
    const existing = getItem(partName);
    setError('');
    if (existing) {
      if (isTempId(existing.id)) return;
      setItems(prev => prev.filter(i => i.id !== existing.id));
      try {
        await removeVehiclePaintItem(vehicle.id, existing.id);
      } catch (err) {
        setItems(prev => [...prev, existing]);
        setError(err.message || 'Could not remove that paint part. Please try again.');
      }
    } else {
      const tempId = `tmp-${partName}`;
      setItems(prev => [...prev, { id: tempId, part_name: partName, status: 'to_paint' }]);
      try {
        const item = await addVehiclePaintItem(vehicle.id, partName);
        setItems(prev => prev.map(i => (i.id === tempId ? item : i)));
      } catch (err) {
        setItems(prev => prev.filter(i => i.id !== tempId));
        setError(err.message || 'Could not add that paint part. Please try again.');
      }
    }
  }

  async function setStatus(itemId, status) {
    if (isTempId(itemId)) return;
    const before = items.find(i => i.id === itemId);
    setError('');
    setItems(prev => prev.map(i => (i.id === itemId ? { ...i, status } : i)));
    try {
      const updated = await updateVehiclePaintStatus(vehicle.id, itemId, status);
      setItems(prev => prev.map(i => (i.id === itemId ? updated : i)));
    } catch (err) {
      if (before) setItems(prev => prev.map(i => (i.id === itemId ? before : i)));
      setError(err.message || 'Could not update that paint part. Please try again.');
    }
  }

  async function saveNewPart() {
    if (!newName.trim()) return;
    setError('');
    const part = await addPaintCatalogPart(newName);
    setCatalog(prev => [...prev, part]);
    setAddingNew(false);
    setNewName('');
    const item = await addVehiclePaintItem(vehicle.id, part.part_name);
    setItems(prev => [...prev, item]);
  }

  const toPaint  = items.filter(i => i.status === 'to_paint');
  const painted  = items.filter(i => i.status === 'painted');

  return (
    <>
      <Header title="Paint Items" subtitle={`for ${vehicle.registration}`} onBack={onBack} />
      <div style={{ padding: 18 }}>

        <SectionLabel>Tap to select parts to paint</SectionLabel>
        {loading && <div style={{ marginBottom: 16 }}><Skeleton rows={2} height={38} /></div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {catalog.map(p => {
            const active    = isSelected(p.part_name);
            const isPainted = getItem(p.part_name)?.status === 'painted';
            return (
              <button key={p.id} onClick={() => toggle(p.part_name)} style={{
                padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all .15s',
                border: `1.5px solid ${active ? (isPainted ? '#a78bfa' : T.accent) : T.line}`,
                background: active
                  ? (isPainted ? 'rgba(167,139,250,.18)' : `rgba(121,78,230,.18)`)
                  : T.panel,
                color: active ? (isPainted ? '#a78bfa' : T.accent) : T.dim,
              }}>
                {fmt(p.part_name)}{isPainted ? ' ✓' : ''}
              </button>
            );
          })}
        </div>

        {!addingNew ? (
          <button onClick={() => setAddingNew(true)} style={{
            background: 'transparent', border: `1px dashed ${T.line}`, borderRadius: 10,
            padding: '10px 14px', cursor: 'pointer', color: T.dim, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, width: '100%',
          }}>
            <Plus size={15} color={T.accent} /> Add new paint part
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveNewPart()}
              placeholder="e.g. SPOILER" style={{ ...inputStyle, flex: 1 }} />
            <ActionButton
              onClick={saveNewPart}
              onError={err => setError(err.message || 'Could not add that paint part. Please try again.')}
              pendingLabel=""
              style={{ ...addChip, color: T.accent }}
            >
              <Check size={16} color={T.accent} />
            </ActionButton>
            <button onClick={() => setAddingNew(false)} style={addChip}><X size={16} color={T.dim} /></button>
          </div>
        )}

        {error && (
          <div style={{ fontSize: 13, color: '#f472b6', marginBottom: 16 }}>{error}</div>
        )}

        {toPaint.length > 0 && (
          <>
            <SectionLabel>{toPaint.length} part{toPaint.length > 1 ? 's' : ''} to paint</SectionLabel>
            <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
              {toPaint.map(item => (
                <div key={item.id} style={{ background: T.panel, border: `1px solid ${T.line}`,
                  borderRadius: 12, padding: '12px 14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{fmt(item.part_name)}</div>
                  <button onClick={() => setStatus(item.id, 'painted')}
                    style={{ ...miniBtn(T.accent), flex: 'none', padding: '7px 14px' }}>
                    <Check size={13} /> Mark painted
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {painted.length > 0 && (
          <>
            <SectionLabel>{painted.length} painted</SectionLabel>
            <div style={{ display: 'grid', gap: 8 }}>
              {painted.map(item => (
                <div key={item.id} style={{ background: T.panel, border: `1px solid ${T.line}`,
                  borderRadius: 12, padding: '12px 14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: T.dim }}>{fmt(item.part_name)}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa',
                      background: 'rgba(167,139,250,.12)', border: '1px solid rgba(167,139,250,.4)',
                      padding: '3px 10px', borderRadius: 999 }}>Painted</span>
                    <button onClick={() => setStatus(item.id, 'to_paint')} style={iconBtn}>
                      <RotateCcw size={14} color={T.dim} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && items.length === 0 && (
          <div style={{ marginTop: 8, textAlign: 'center', color: T.dim,
            border: `1px dashed ${T.line}`, borderRadius: 12, padding: '28px 16px' }}>
            <Paintbrush size={22} color={T.dim} style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 600, color: T.text }}>No paint items selected</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Tap parts above to mark them for painting</div>
          </div>
        )}
      </div>
    </>
  );
}

// ------------------------------------------------------------
// INVOICES PAGE
// ------------------------------------------------------------
function InvoicesPage({ vehicle, onBack }) {
  const [types, setTypes]         = useState([]);
  const [invoices, setInvoices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [adding, setAdding]       = useState(false);
  const [lightbox, setLightbox]   = useState(null);
  const [editing, setEditing]     = useState(null);
  const [error, setError]         = useState('');
  const { byEntity, reload: reloadHistory } = useVehicleHistory(vehicle.id);

  useEffect(() => {
    let alive = true;
    Promise.all([getInvoiceTypes(), getVehicleInvoices(vehicle.id)])
      .then(([ts, inv]) => { if (alive) { setTypes(ts); setInvoices(inv); } })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [vehicle.id]);

  const typeName = id => types.find(t => String(t.id) === String(id))?.name || null;

  const total = invoices.reduce((s, i) => s + Number(i.amount || 0), 0);

  // Group by type so the workshop can see, per car, what's been invoiced.
  const byType = types
    .map(t => ({ type: t, rows: invoices.filter(i => String(i.invoice_type_id) === String(t.id)) }))
    .filter(g => g.rows.length > 0);
  const untyped = invoices.filter(i => !i.invoice_type_id);

  async function remove(invoiceId) {
    const before = invoices;
    setError('');
    setInvoices(prev => prev.filter(i => i.id !== invoiceId));
    try {
      await removeVehicleInvoice(vehicle.id, invoiceId);
      reloadHistory();
    } catch (err) {
      setInvoices(before);
      setError(err.message || 'Could not delete the invoice. Please try again.');
    }
  }

  return (
    <>
      <Header title="Invoices" subtitle={`for ${vehicle.registration}`} onBack={onBack} />
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <Stat label="Invoices" value={loading ? '—' : invoices.length} />
          <Stat label="Total"    value={loading || !total ? '—' : `$${total.toFixed(0)}`} />
        </div>

        <button onClick={() => setAdding(true)} style={primaryBtn}>
          <Plus size={18} /> Add invoice
        </button>

        {error && (
          <div style={{ fontSize: 13, color: '#f472b6', marginTop: 12 }}>{error}</div>
        )}

        {loading ? (
          <div style={{ marginTop: 16 }}>
            <LoadingNote>Loading invoices…</LoadingNote>
            <Skeleton rows={2} height={80} />
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ marginTop: 18, textAlign: 'center', color: T.dim,
            border: `1px dashed ${T.line}`, borderRadius: 12, padding: '30px 16px' }}>
            <Receipt size={22} color={T.dim} style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 600, color: T.text }}>No invoices yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              Snap parts, wheel alignment and calibration invoices as they come in.
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 20 }}>
            {[...byType, ...(untyped.length ? [{ type: { id: 'none', name: 'Uncategorised' }, rows: untyped }] : [])]
              .map(({ type, rows }) => (
                <div key={type.id} style={{ marginBottom: 20 }}>
                  <SectionLabel>
                    {type.name} — ${rows.reduce((s, r) => s + Number(r.amount || 0), 0).toFixed(0)}
                  </SectionLabel>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {rows.map(inv => (
                      <InvoiceCard
                        key={inv.id}
                        invoice={inv}
                        history={byEntity.get(`invoice:${inv.id}`)}
                        typeName={typeName}
                        onOpenPhoto={() => setLightbox(inv.photo)}
                        onEdit={() => setEditing(inv)}
                        onDelete={() => remove(inv.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {adding && (
        <InvoiceModal
          title="Add invoice"
          types={types}
          onClose={() => setAdding(false)}
          onTypeAdded={t => setTypes(prev => [...prev, t])}
          onSave={async fields => {
            const created = await addVehicleInvoice(vehicle.id, fields);
            setInvoices(prev => [created, ...prev]);
            reloadHistory();
            setAdding(false);
          }}
        />
      )}

      {editing && (
        <InvoiceModal
          title="Edit invoice"
          types={types}
          invoice={editing}
          onClose={() => setEditing(null)}
          onTypeAdded={t => setTypes(prev => [...prev, t])}
          onSave={async fields => {
            const updated = await updateVehicleInvoice(vehicle.id, editing.id, fields);
            setInvoices(prev => prev.map(i => (i.id === updated.id ? updated : i)));
            reloadHistory();
            setEditing(null);
          }}
        />
      )}

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}

function InvoiceCard({ invoice, history, typeName, onOpenPhoto, onEdit, onDelete }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12,
      padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {invoice.photo ? (
          <img src={invoice.photo} alt="Invoice" onClick={onOpenPhoto}
            style={{ width: 52, height: 52, objectFit: 'cover', cursor: 'pointer', flexShrink: 0,
              borderRadius: 8, border: `1px solid ${T.line}` }} />
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: 8, border: `1px dashed ${T.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Receipt size={18} color={T.dim} />
          </div>
        )}

        <div onClick={onEdit} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {invoice.amount != null ? `$${Number(invoice.amount).toFixed(2)}` : 'No amount'}
          </div>
          <div style={{ fontSize: 12.5, color: T.dim, marginTop: 2 }}>
            {invoice.invoice_date ? invoice.invoice_date.slice(0, 10) : 'No date'}
          </div>
        </div>

        <button onClick={onDelete} title="Delete invoice" style={iconBtn}>
          <X size={16} color="#f472b6" />
        </button>
      </div>

      <ChangeHistory entries={history} ctx={{ typeName }} />
    </div>
  );
}

function InvoiceModal({ title, types, invoice, onClose, onSave, onTypeAdded }) {
  const [typeId, setTypeId]     = useState(invoice?.invoice_type_id ? String(invoice.invoice_type_id) : (types[0] ? String(types[0].id) : ''));
  const [amount, setAmount]     = useState(invoice?.amount != null ? String(invoice.amount) : '');
  const [date, setDate]         = useState(invoice?.invoice_date ? invoice.invoice_date.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [photo, setPhoto]       = useState(invoice?.photo || null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [addingType, setAddingType] = useState(false);
  const [newType, setNewType]   = useState('');
  const [error, setError]       = useState('');

  async function onPickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoBusy(true); setError('');
    try {
      setPhoto(await fileToResizedDataUrl(file));
    } catch (err) {
      setError(err.message || 'Could not read that image.');
    } finally {
      setPhotoBusy(false);
    }
  }

  async function saveNewType() {
    if (!newType.trim()) return;
    const t = await addInvoiceType(newType);
    onTypeAdded(t);
    setTypeId(String(t.id));
    setNewType(''); setAddingType(false);
  }

  async function save() {
    setError('');
    await onSave({
      invoice_type_id: typeId || null,
      amount:          amount === '' ? null : Number(amount),
      invoice_date:    date || null,
      photo:           photo || null,
    });
  }

  return (
    <Modal title={title} onClose={onClose}>
      <Field label="Type" required>
        {!addingType ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={typeId} onChange={e => setTypeId(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              <option value="">Select type…</option>
              {types.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
            </select>
            <button onClick={() => { setAddingType(true); setNewType(''); }} style={addChip} title="Add new type">
              <Plus size={16} color={T.accent} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input autoFocus value={newType} onChange={e => setNewType(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveNewType()}
              placeholder="e.g. Windscreen" style={{ ...inputStyle, flex: 1 }} />
            <ActionButton
              onClick={saveNewType}
              onError={err => setError(err.message || 'Could not add that type.')}
              pendingLabel=""
              style={{ ...addChip, color: T.accent }}
            >
              <Check size={16} color={T.accent} />
            </ActionButton>
            <button onClick={() => setAddingType(false)} style={addChip}><X size={16} color={T.dim} /></button>
          </div>
        )}
      </Field>

      <div style={{ display: 'flex', gap: 12 }}>
        <Field label="Amount" style={{ flex: 1 }}>
          <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0.00" style={inputStyle} />
        </Field>
        <Field label="Invoice date" style={{ flex: 1 }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        </Field>
      </div>

      <Field label="Photo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {photo && (
            <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
              <img src={photo} alt="Invoice" style={{ width: '100%', height: '100%', objectFit: 'cover',
                borderRadius: 10, border: `1px solid ${T.line}` }} />
              <button onClick={() => setPhoto(null)} title="Remove photo" style={{
                position: 'absolute', top: -6, right: -6, width: 22, height: 22, padding: 0,
                borderRadius: 999, border: `1px solid ${T.line}`, background: T.panel,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={13} color="#f472b6" />
              </button>
            </div>
          )}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
            color: T.dim, cursor: photoBusy ? 'wait' : 'pointer', opacity: photoBusy ? 0.5 : 1,
            border: `1px dashed ${T.line}`, borderRadius: 10, padding: '12px 14px',
          }}>
            <Camera size={16} color={T.accent} />
            {photoBusy ? 'Reading…' : photo ? 'Replace photo' : 'Add photo'}
            <input type="file" accept="image/*" capture="environment"
              onChange={onPickPhoto} disabled={photoBusy} style={{ display: 'none' }} />
          </label>
        </div>
      </Field>

      {error && <div style={{ fontSize: 13, color: '#f472b6' }}>{error}</div>}

      <ActionButton
        onClick={save}
        onError={err => setError(err.message || 'Could not save the invoice. Please try again.')}
        disabled={!typeId}
        pendingLabel="Saving…"
        style={primaryBtn}
      >
        <Check size={18} /> {invoice ? 'Save changes' : 'Save invoice'}
      </ActionButton>
    </Modal>
  );
}

// ============================================================
// SHARED UI COMPONENTS
// ============================================================
function Header({ title, subtitle, onBack, action }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: T.panel,
      borderBottom: `1px solid ${T.line}`,
      padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {onBack
        ? <button onClick={onBack} style={{ ...iconBtn, padding: 4 }}>
            <ChevronLeft size={22} color={T.accent} />
          </button>
        : <Package size={22} color={T.accent} />}
      <div style={{ lineHeight: 1.2, flex: 1 }}>
        <div style={{ fontWeight: 700, color: T.text, fontSize: 16, letterSpacing: 0.3 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: T.dim }}>{subtitle}</div>}
      </div>
      {action}
    </header>
  );
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11.5, color: T.dim, fontWeight: 700, letterSpacing: 1,
      textTransform: 'uppercase', marginBottom: 10 }}>
      {children}
    </div>
  );
}

function Spinner({ size = 15 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      border: '2px solid currentColor', borderTopColor: 'transparent',
      display: 'inline-block', animation: 'mb-spin .6s linear infinite',
    }} />
  );
}

// Placeholder rows shown while a list is still in flight, so tapping through to
// a page shows its shape immediately instead of an empty screen. A light band
// sweeps across each row — on this dark theme a dimmed panel is invisible, so
// the movement is what actually reads as "loading".
function Skeleton({ rows = 3, height = 76 }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{
          height, borderRadius: 12, background: T.panel, border: `1px solid ${T.line}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="mb-shimmer" style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(90deg, transparent, ${T.panelHi} 45%, ${T.line} 50%, ${T.panelHi} 55%, transparent)`,
            animation: 'mb-shimmer 1.25s ease-in-out infinite',
            animationDelay: `${i * 0.14}s`,
          }} />
        </div>
      ))}
    </div>
  );
}

// Sits under every view. `main` keeps the fixed bottom nav clear of it.
function Footer() {
  return (
    <footer style={{
      marginTop: 32, padding: '18px 16px 22px', borderTop: `1px solid ${T.line}`,
      textAlign: 'center', fontSize: 12, color: T.dim, lineHeight: 1.7,
    }}>
      <div>© {new Date().getFullYear()} MB Smash Repair. All rights reserved.</div>
      <div>
        Developed by{' '}
        <a
          href="https://github.com/lalon147"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: T.accent, fontWeight: 700, textDecoration: 'none' }}
        >
          LALON
        </a>
      </div>
    </footer>
  );
}

// Pairs with Skeleton: says in words what the moving bars only imply.
function LoadingNote({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      color: T.accent, fontSize: 13, fontWeight: 600, padding: '4px 0 12px' }}>
      <Spinner size={14} /> {children}
    </div>
  );
}

// Wraps an async click handler: swaps in a spinner while the request is in
// flight and swallows repeat taps, so a slow round trip can't be double-fired.
function ActionButton({ onClick, onError, children, pendingLabel = 'Saving…', style, disabled, ...rest }) {
  const [pending, setPending] = useState(false);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  async function handleClick(e) {
    if (pending || disabled) return;
    setPending(true);
    try {
      await onClick(e);
    } catch (err) {
      if (onError) onError(err);
      else console.error(err);
    } finally {
      if (mounted.current) setPending(false);
    }
  }

  const inactive = pending || disabled;
  return (
    <button
      {...rest}
      onClick={handleClick}
      disabled={inactive}
      style={{ ...style, opacity: inactive ? 0.6 : (style?.opacity ?? 1) }}
    >
      {pending ? <><Spinner /> {pendingLabel}</> : children}
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ flex: 1, background: T.panel, border: `1px solid ${T.line}`,
      borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: T.dim, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Field({ label, required, children, style }) {
  return (
    <label style={{ display: 'block', ...style }}>
      <div style={{ fontSize: 12.5, color: T.dim, marginBottom: 6, fontWeight: 600 }}>
        {label}{required && <span style={{ color: T.accent }}> *</span>}
      </div>
      {children}
    </label>
  );
}

function Lightbox({ src, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 20 }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16, width: 36, height: 36, padding: 0,
        borderRadius: 999, border: `1px solid ${T.line}`, background: T.panel,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <X size={20} color={T.text} />
      </button>
      <img src={src} alt="Full size" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
        borderRadius: 8 }} />
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 520,
        background: T.bg, borderTop: `2px solid ${T.accent}`,
        borderRadius: '16px 16px 0 0', padding: 18,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
          <button onClick={onClose} style={iconBtn}><X size={20} color={T.dim} /></button>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// STYLE CONSTANTS
// ============================================================
const primaryBtn = {
  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
  fontSize: 15, fontWeight: 700, cursor: 'pointer', color: '#fff',
  background: `linear-gradient(90deg, ${T.accentMid}, ${T.accent})`,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};
const outlineBtn = {
  width: '100%', padding: '14px', borderRadius: 12,
  border: `1.5px solid ${T.accent}`, background: 'transparent',
  fontSize: 15, fontWeight: 700, cursor: 'pointer', color: T.accent,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};
const cardBtn = {
  width: '100%', background: T.panel, border: `1px solid ${T.line}`,
  borderRadius: 12, padding: '13px 14px', cursor: 'pointer',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
  transition: 'border-color .15s',
};
const miniBtn = (color) => ({
  flex: 1, background: 'transparent', border: `1px solid ${T.line}`,
  color, borderRadius: 9, padding: '8px', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
});
const iconBtn = { background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' };
const addChip = {
  background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10,
  width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
};
const inputStyle = {
  width: '100%', background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10,
  padding: '11px 12px', color: T.text, fontSize: 15, outline: 'none', boxSizing: 'border-box',
  colorScheme: 'dark',
};
const searchBox = {
  display: 'flex', alignItems: 'center', gap: 8, background: T.panel,
  border: `1px solid ${T.line}`, borderRadius: 12, padding: '12px 14px',
};
const searchInput = {
  flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: 15,
};
