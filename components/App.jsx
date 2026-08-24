'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Car, Plus, Check, X, Package, ChevronLeft,
  Hash, Tag, ChevronRight, RotateCcw, Wrench, LayoutDashboard, Paintbrush, LogOut,
  Camera, Receipt, History, ChevronDown, Download, RotateCw, Wand2, Clock,
  Layers, Pencil, StickyNote, Mail, Phone, Building2, AlertTriangle, Copy,
} from 'lucide-react';
import { readInvoicePhoto } from '@/lib/scan';
import { MIN_YEAR, maxYear } from '@/lib/year';
import { jpegToPdf, dataUrlToBytes } from '@/lib/pdf.mjs';

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
async function getRepairs(vehicleId) {
  const res = await fetch(`/api/vehicles/${vehicleId}/repairs`);
  return res.json();
}
async function addRepair(vehicleId, body = {}) {
  const res = await fetch(`/api/vehicles/${vehicleId}/repairs`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not start a new repair. Please try again.');
  return data;
}
async function updateRepair(vehicleId, repairId, fields) {
  const res = await fetch(`/api/vehicles/${vehicleId}/repairs/${repairId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not save changes. Please try again.');
  return data;
}
async function getDealerships(make) {
  const res = await fetch(`/api/dealerships?make=${encodeURIComponent(make || '')}`);
  return res.json();
}
async function updateDealership(id, fields) {
  const res = await fetch(`/api/dealerships/${id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not save the supplier. Please try again.');
  return data;
}
async function getUnassignedOrders() {
  const res = await fetch('/api/orders/unassigned');
  return res.json();
}
// The car is part of the question: what a part costs and what number is on it
// depend on which make, model and year it is going on, so the search carries
// the vehicle and gets that car's history back with each result.
async function searchCatalog(term, vehicleId) {
  const res = await fetch(
    `/api/catalog?q=${encodeURIComponent(term)}&vehicle_id=${encodeURIComponent(vehicleId ?? '')}`,
  );
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
async function updateVehicleNotes(vehicleId, notes) {
  const res = await fetch(`/api/vehicles/${vehicleId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not save the note. Please try again.');
  return data;
}
async function updateVehicleYear(vehicleId, year) {
  const res = await fetch(`/api/vehicles/${vehicleId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ year }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not save the year. Please try again.');
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

// A session can lapse while the app is still open — the phone sits on the
// counter for a month and the token behind it expires. Every data call then
// comes back 401, and without this each one surfaces as its own "Could not
// save…" message with no hint that signing in again is all that is needed.
// Installed once here rather than repeated at all 38 fetch sites.
//
// /api/auth/* is deliberately excluded: a wrong password is also a 401, and
// bouncing that to the login page would wipe the message explaining why.
if (typeof window !== 'undefined' && !window.__authRedirectInstalled) {
  window.__authRedirectInstalled = true;
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url ?? '');
    if (response.status === 401 && url.startsWith('/api/') && !url.startsWith('/api/auth/')) {
      window.location.href = '/login';
    }
    return response;
  };
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
  // A part that was never going to come. The column has always allowed it; now
  // the chase list can set it, so it needs a badge of its own — without one it
  // fell through to "Ordered" and the part looked like it was still on its way.
  cancelled: { label: 'Cancelled', fg: '#94a3b8', bg: 'rgba(148,163,184,.12)', bd: 'rgba(148,163,184,.4)' },
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
  photo: 'Photo', notes: 'Note', title: 'Name',
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
  // A note runs to sentences. The history says what changed, not what it now
  // says — the note itself is right there on the page above.
  const text = String(value);
  return text.length > 40 ? `${text.slice(0, 40)}…` : text;
}

// Photo values are digests, never printable. What changed is whether one exists.
function describePhotoChange(oldValue, newValue) {
  if (!oldValue && newValue) return 'Photo added';
  if (oldValue && !newValue) return 'Photo removed';
  return 'Photo replaced';
}

/**
 * "5 Jul 2026", from either a timestamp or a plain 'YYYY-MM-DD' date.
 *
 * The two need different treatment. A DATE has no zone — lib/db.js hands it
 * through as a bare string — so it must be built in local time; passing it to
 * `new Date()` would read it as UTC midnight and show the day before for
 * anyone east of Greenwich. A timestamptz is a real instant and converts fine.
 */
function shortDate(value) {
  if (!value) return null;
  const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  const date = plain
    ? new Date(Number(plain[1]), Number(plain[2]) - 1, Number(plain[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
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
// reads "Sam changed price and quantity", not the same edit three times.
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
  // Which repair (accident/job) the vehicle page is showing. Held here, not in
  // VehiclePage, so it survives the trip out to the Order-part screen and back —
  // a part added while viewing an older accident stays on that accident.
  const [activeRepairId, setActiveRepairId] = useState(null);
  // Bumped when suppliers have been assigned, so the Suppliers tab re-counts
  // what is left instead of showing the number it loaded on the way in.
  const [assignEpoch, setAssignEpoch] = useState(0);

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
  const dealer     = id => dealerships.find(d => String(d.id) === String(id)) || null;

  // A supplier edited anywhere — the Suppliers tab, or the email screen when it
  // turns out nobody ever wrote the address down — has to change everywhere it
  // is shown, without refetching and losing the make ranking on the list.
  const applyDealership = updated =>
    setDealerships(cur => cur.map(d => (d.id === updated.id ? { ...d, ...updated } : d)));

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
    // The dashboard's cards and the chasing list carry only enough of a car to
    // draw a row — no note, no booked-in date. Opened as-is, the vehicle page
    // would show an empty note for a car that has one, which is the one thing
    // that page exists to put in front of whoever picks the car up next. The
    // full row is already in memory from startup, so fill it in from there
    // rather than asking the server again.
    const full = vehicles.find(x => String(x.id) === String(v.id));
    const vehicle = full ? { ...v, ...full } : v;

    const cached = ordersCache.get(String(v.id));
    setActiveVehicle(vehicle);
    setOrders(cached || []);
    // Let VehiclePage pick the default repair for this car once its repairs load;
    // a leftover id from the last car would point at the wrong vehicle.
    setActiveRepairId(null);
    setView('vehicle');
    loadOrders(v.id, { showSkeleton: !cached });
    // Re-rank the suppliers for this car's make, so the dropdown on its parts
    // opens on the dealership this make actually comes from. It's the same list
    // either way — only the order changes — so dealerName() keeps resolving
    // every id while the new ranking is on its way.
    if (vehicle.make) getDealerships(vehicle.make).then(setDealerships).catch(() => {});
  }

  // A note belongs to the car, so it has to change everywhere the car is shown:
  // the page it was typed on, and the list behind it that flags cars carrying a
  // note. Only what the server confirms is kept.
  async function saveVehicleNotes(notes) {
    const updated = await updateVehicleNotes(activeVehicle.id, notes);
    setActiveVehicle(cur => (cur && cur.id === updated.id ? { ...cur, ...updated } : cur));
    setVehicles(cur => cur.map(v => (v.id === updated.id ? { ...v, ...updated } : v)));
  }

  // Same for the year — and it has to reach the page the parts are ordered
  // from, because that screen asks the car's year which part numbers it can
  // offer. Filling the year in has to change the next answer, not the one after.
  async function saveVehicleYear(year) {
    const updated = await updateVehicleYear(activeVehicle.id, year);
    setActiveVehicle(cur => (cur && cur.id === updated.id ? { ...cur, ...updated } : cur));
    setVehicles(cur => cur.map(v => (v.id === updated.id ? { ...v, ...updated } : v)));
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
      minHeight: '100dvh', background: T.bg, color: T.text,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        maxWidth: 520, margin: '0 auto',
        // Clear the fixed bottom nav plus the iPhone home-indicator gutter, and
        // keep content off the rounded corners / notch when in landscape.
        paddingBottom: view === 'main'
          ? 'calc(80px + env(safe-area-inset-bottom))'
          : 'calc(40px + env(safe-area-inset-bottom))',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}>

        {view === 'main' && tab === 'dashboard' && (
          <Dashboard onOpenVehicle={openVehicle} onOrdersChanged={invalidateOrders} />
        )}

        {view === 'main' && tab === 'vehicles' && (
          <VehicleList
            vehicles={vehicles}
            onOpen={openVehicle}
            onAdded={(v) => { setVehicles([v, ...vehicles]); openVehicle(v); }}
          />
        )}

        {view === 'main' && tab === 'suppliers' && (
          <SuppliersPage
            dealerships={dealerships}
            onSaved={applyDealership}
            onAssign={() => setView('assign-suppliers')}
            assignEpoch={assignEpoch}
          />
        )}

        {view === 'assign-suppliers' && (
          <AssignSuppliersPage
            dealerships={dealerships}
            onBack={() => setView('main')}
            onDone={() => {
              // Those orders now have a supplier, so anything cached about them
              // is stale — the vehicle pages that showed them, and the count on
              // the Suppliers tab that sent the user here.
              ordersCache.clear();
              cacheEpoch.current++;
              setAssignEpoch(e => e + 1);
              setView('main');
            }}
          />
        )}

        {view === 'vehicle' && activeVehicle && (
          <VehiclePage
            vehicle={activeVehicle}
            orders={orders}
            ordersLoading={ordersLoading}
            dealerships={dealerships}
            dealerName={dealerName}
            activeRepairId={activeRepairId}
            onSelectRepair={setActiveRepairId}
            onSaveNotes={saveVehicleNotes}
            onSaveYear={saveVehicleYear}
            onBack={() => setView('main')}
            onAddPart={() => setView('add-part')}
            onEmailOrder={() => setView('order-email')}
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
            repairId={activeRepairId}
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

        {view === 'order-email' && activeVehicle && (
          <OrderEmailPage
            vehicle={activeVehicle}
            orders={orders}
            lookupDealer={dealer}
            onSavedDealership={applyDealership}
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
          // Sit the tab bar above the home indicator, and center it within the
          // safe width so buttons don't slide under the notch in landscape.
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}>
          {[
            { key: 'dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
            { key: 'vehicles',  Icon: Car,             label: 'Vehicles'  },
            { key: 'suppliers', Icon: Building2,       label: 'Suppliers' },
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

// Live date + time for the dashboard. Ticks once a minute — seconds aren't shown,
// so there's no point re-rendering every second. Locale formatting runs on the
// client only, so the first paint after hydration is when the clock appears.
function DashboardClock() {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const date = now && now.toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const time = now && now.toLocaleTimeString(undefined, {
    hour: 'numeric', minute: '2-digit',
  });

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
      background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14,
      padding: '12px 14px',
    }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: T.panelHi,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Clock size={17} color={T.accent} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
          {time || ' '}
        </div>
        <div style={{ color: T.dim, fontSize: 12.5 }}>{date || ' '}</div>
      </div>
    </div>
  );
}

// How many cars the chase list shows before asking to be expanded. Counted in
// cars, not parts: one car with seven late parts is one phone call.
const CHASE_PREVIEW = 4;

function Dashboard({ onOpenVehicle, onOrdersChanged }) {
  const [stats, setStats]   = useState(dashboardCache?.stats ?? null);
  const [recent, setRecent] = useState(dashboardCache?.recent ?? []);
  const [chasing, setChasing] = useState(dashboardCache?.chasing ?? []);
  const [showAllChasing, setShowAllChasing] = useState(false);
  const [me, setMe]         = useState(null);

  useEffect(() => {
    let alive = true;
    getDashboardStats().then(d => {
      dashboardCache = d;
      if (alive) { setStats(d.stats); setRecent(d.recent); setChasing(d.chasing || []); }
    }).catch(() => {});
    getCurrentUser().then(u => { if (alive) setMe(u); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // One card per car. The rows arrive worst-part-first, so each car first shows
  // up at its own worst part, and taking them in that order puts the car worth
  // ringing about at the top.
  const chaseGroups = [];
  for (const order of chasing) {
    let group = chaseGroups.find(g => String(g.vehicle.id) === String(order.vehicle_id));
    if (!group) {
      chaseGroups.push(group = {
        vehicle: { id: order.vehicle_id, registration: order.registration,
                   make: order.make, model: order.model },
        orders: [],
      });
    }
    group.orders.push(order);
  }

  // Settling a late part from the dashboard, without a trip to the vehicle
  // page. A part that has sat here for weeks is nearly always one of two
  // things: it turned up and nobody ticked it off, or it was never coming and
  // the car went out without it. Both need saying, and neither was sayable from
  // here — which is how the list filled with parts for cars long since fixed.
  async function clearChase(orders, status) {
    const ids = new Set(orders.map(o => o.id));
    // The car's parts may already be sitting in the cache from an earlier
    // visit. Drop them before the change lands, so opening the car afterwards
    // doesn't paint the part as still on order.
    for (const id of new Set(orders.map(o => o.vehicle_id))) onOrdersChanged?.(id);
    try {
      await Promise.all(orders.map(o => updateOrderStatus(o.vehicle_id, o.id, status)));
      setChasing(cur => cur.filter(o => !ids.has(o.id)));
    } finally {
      // Re-ask the server for the totals above the list rather than keeping
      // five counts in step by hand — five chances to get one wrong. In a
      // `finally` because a batch that failed halfway through still moved some
      // parts, and the screen should show which.
      const d = await getDashboardStats().catch(() => null);
      if (d) {
        dashboardCache = d;
        setStats(d.stats); setRecent(d.recent); setChasing(d.chasing || []);
      }
    }
  }

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

        <DashboardClock />

        {stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            <StatCard label="Vehicles"       value={stats.vehicle_count}   accent="#794ee6" />
            <StatCard label="Parts Pending"  value={stats.pending_count}   accent="#fcd34d" />
            <StatCard label="Received Today" value={stats.received_today}  accent="#a78bfa" />
            {/* Not "Outstanding": that reads as money owed, and this shop pays
                suppliers before ordering as often as a week after, so an amount
                owed is not something this number could ever know. It is the
                cost of the parts currently out — stock in flight, not a bill. */}
            <StatCard label="Value on Order" hint="parts not yet received"
              value={`$${Number(stats.outstanding_cost).toFixed(0)}`} accent="#f472b6" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            <Skeleton rows={2} height={70} />
            <Skeleton rows={2} height={70} />
          </div>
        )}

        {chaseGroups.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <SectionLabel>
              {`Chasing (${stats?.chasing_count ?? chasing.length} across `
                + `${chaseGroups.length} car${chaseGroups.length === 1 ? '' : 's'})`}
            </SectionLabel>
            <div style={{ display: 'grid', gap: 10 }}>
              {/* A few cars at a time. The whole list at once is a wall that
                  pushes everything else off the screen, and the top of it is
                  the car that has been waiting longest anyway. */}
              {(showAllChasing ? chaseGroups : chaseGroups.slice(0, CHASE_PREVIEW)).map(g => (
                <ChaseCar key={g.vehicle.id} group={g}
                  onOpenVehicle={onOpenVehicle} onClear={clearChase} />
              ))}
            </div>
            {chaseGroups.length > CHASE_PREVIEW && (
              <button onClick={() => setShowAllChasing(v => !v)} style={{
                width: '100%', marginTop: 8, padding: '10px', borderRadius: 10,
                background: 'transparent', border: `1px dashed ${T.line}`,
                color: T.dim, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                {showAllChasing ? 'Show fewer' : `Show all ${chaseGroups.length} cars`}
              </button>
            )}
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

function StatCard({ label, value, accent, hint }) {
  return (
    <div style={{
      background: T.panel, border: `1px solid ${T.line}`, borderLeft: `3px solid ${accent}`,
      borderRadius: 14, padding: '16px 14px',
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: T.dim, marginTop: 6, fontWeight: 600 }}>{label}</div>
      {hint && (
        <div style={{ fontSize: 11, color: T.dim, marginTop: 3, opacity: 0.75, lineHeight: 1.35 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// A date `days` from today as 'YYYY-MM-DD', the format a date input and every
// DATE column in this app expect. Built from the local calendar date rather
// than toISOString(), which would answer in UTC and give yesterday all evening
// in AEST.
function inDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Whole days between a 'YYYY-MM-DD' date column and today, local time. Parsed
// with an explicit midnight so the string isn't read as UTC and shifted a day
// back in AEST — the same trap lib/db.js turns off the DATE parser for.
function daysSince(isoDate) {
  if (!isoDate) return null;
  const then = new Date(`${isoDate.slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today - then) / 86_400_000);
}

// Every late part for one car. Grouped this way because "that car went out
// weeks ago" is the usual explanation for a part sitting here — and that is an
// answer about the car, not about each part in turn. So the whole car clears in
// one tap, and a list that had grown to forty-odd parts is a dozen decisions.
function ChaseCar({ group, onOpenVehicle, onClear }) {
  const { vehicle, orders } = group;
  const [error, setError] = useState('');
  const desc = [vehicle.make, vehicle.model].filter(Boolean).join(' ');

  return (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`,
      borderLeft: '3px solid #fcd34d', borderRadius: 12, padding: '12px 14px' }}>
      <button onClick={() => onOpenVehicle(vehicle)} style={{
        width: '100%', background: 'transparent', border: 'none', padding: 0,
        cursor: 'pointer', color: 'inherit', font: 'inherit', textAlign: 'left',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{vehicle.registration}</div>
          <div style={{ color: T.dim, fontSize: 12.5, marginTop: 2 }}>
            {orders.length} part{orders.length === 1 ? '' : 's'} late
            {desc ? ` · ${desc}` : ''}
          </div>
        </div>
        <ChevronRight size={16} color={T.dim} style={{ flexShrink: 0 }} />
      </button>

      <div style={{ marginTop: 6 }}>
        {orders.map(o => (
          <ChasePart key={o.id} order={o} onError={setError}
            onClear={status => onClear([o], status)} />
        ))}
      </div>

      {/* Only worth offering when it saves taps. One late part already has its
          own Arrived button an inch above this. */}
      {orders.length > 1 && (
        <ActionButton
          onClick={() => onClear(orders, 'received')}
          onError={err => setError(err.message || 'Could not update. Please try again.')}
          pendingLabel="Clearing…"
          style={{ ...miniBtn(T.accent), width: '100%', flex: 'none', marginTop: 10 }}
        >
          <Check size={14} /> All {orders.length} arrived
        </ActionButton>
      )}

      {error && (
        <div style={{ fontSize: 12.5, color: '#f472b6', marginTop: 8 }}>{error}</div>
      )}
    </div>
  );
}

// One part that should have arrived by now. It says which of the two ways it
// got here — a delivery date that passed, or no date at all and long enough
// that the silence is the problem — because the phone call is different: one
// asks what happened to a promised date, the other asks for a date.
function ChasePart({ order, onClear, onError }) {
  const late = Number(order.days_late);
  const dealer = order.dealership_name;
  const reason = order.expected_date
    ? `${late} day${late === 1 ? '' : 's'} past due`
    : `no delivery date, ordered ${daysSince(order.order_date)} days ago`;
  const fail = err => onError(err.message || 'Could not update. Please try again.');

  return (
    <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 10, marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <AlertTriangle size={13} color="#fcd34d" style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>{fmt(order.part_name)}</span>
        {Number(order.quantity) > 1 && (
          <span style={{ fontSize: 12, color: T.dim }}>×{order.quantity}</span>
        )}
      </div>
      <div style={{ color: T.dim, fontSize: 12, marginTop: 3 }}>
        <span style={{ color: '#fcd34d', fontWeight: 600 }}>{reason}</span>
        {dealer ? ` · ${dealer}` : ' · no supplier set'}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {order.dealership_phone && (
          <a href={`tel:${order.dealership_phone.replace(/\s/g, '')}`}
            style={{ ...miniBtn(T.accent), textDecoration: 'none' }}>
            <Phone size={13} /> Call
          </a>
        )}
        <ActionButton onClick={() => onClear('received')} onError={fail}
          pendingLabel="…" style={miniBtn(T.accent)}>
          <Check size={13} /> Arrived
        </ActionButton>
        {/* The other half of the answer. Without it the only way off this list
            was a part turning up, so anything that never came sat here for
            good. Cancelled keeps the row on the car with its reason visible,
            rather than deleting the fact that it was ever ordered. */}
        <ActionButton onClick={() => onClear('cancelled')} onError={fail}
          pendingLabel="…" style={miniBtn(T.dim)}>
          <X size={13} /> Not coming
        </ActionButton>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// SUPPLIERS — the dealerships, and how to reach them
// ------------------------------------------------------------
// Alphabetical here, deliberately, even though every other list of dealerships
// in the app is most-used-first. That ranking is for picking a supplier while
// standing at a car; this is a contact book, where you already know the name
// you're looking for and want it where the alphabet says it is.
function SuppliersPage({ dealerships, onSaved, onAssign, assignEpoch }) {
  const [editing, setEditing] = useState(null);
  const [unassigned, setUnassigned] = useState(null);
  const sorted = [...dealerships].sort((a, b) => a.name.localeCompare(b.name));
  const missing = sorted.filter(d => !d.email && !d.phone).length;

  // Re-counted whenever the assign screen has been through, so the prompt goes
  // away the moment there is nothing left to assign.
  useEffect(() => {
    getUnassignedOrders().then(r => setUnassigned(r.length)).catch(() => {});
  }, [assignEpoch]);

  return (
    <>
      <Header title="Suppliers" subtitle={`${sorted.length} dealerships`} />
      <div style={{ padding: 18 }}>
        {unassigned > 0 && (
          <button onClick={onAssign} style={{ ...cardBtn, marginBottom: 12,
            borderLeft: '3px solid #fcd34d', textAlign: 'left' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>
                {unassigned} part{unassigned === 1 ? '' : 's'} on order with no supplier
              </div>
              <div style={{ color: T.dim, fontSize: 12.5, marginTop: 3 }}>
                Set them from what each make usually comes from
              </div>
            </div>
            <ChevronRight size={16} color={T.dim} />
          </button>
        )}
        {missing > 0 && (
          <div style={{ background: T.panel, border: `1px solid ${T.line}`,
            borderLeft: '3px solid #fcd34d', borderRadius: 12, padding: 14, marginBottom: 18,
            fontSize: 13, color: T.dim, lineHeight: 1.5 }}>
            {missing} of these {missing === 1 ? 'has' : 'have'} no phone or email saved.
            A supplier with an email can be sent a whole car&apos;s parts order in one tap
            from the vehicle page; one with a phone number can be called from the
            chasing list.
          </div>
        )}

        <div style={{ display: 'grid', gap: 8 }}>
          {sorted.map(d => (
            <button key={d.id} onClick={() => setEditing(d)} style={cardBtn}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; }}>
              <div style={{ textAlign: 'left', minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{d.name}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12.5,
                  color: T.dim, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={12} />{d.phone || '—'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                    <Mail size={12} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.email || '—'}</span>
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {Number(d.order_count) > 0 && (
                  <span style={{ fontSize: 11.5, color: T.dim }}>
                    {d.order_count} order{Number(d.order_count) === 1 ? '' : 's'}
                  </span>
                )}
                <Pencil size={15} color={T.dim} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {editing && (
        <SupplierModal
          dealership={editing}
          onCancel={() => setEditing(null)}
          onSave={async fields => {
            onSaved(await updateDealership(editing.id, fields));
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

// ------------------------------------------------------------
// ASSIGN SUPPLIERS — fill in who is supplying the parts on order
// ------------------------------------------------------------
// Each row arrives with the supplier that car's make usually comes from, and
// says how often that has been true, so accepting it is a judgement rather
// than a shrug. Nothing is written until Save, and what gets written is
// attributed to whoever pressed it like any other change — which is the whole
// reason this is a screen and not a bulk update run against the database.
function AssignSuppliersPage({ dealerships, onBack, onDone }) {
  const [rows, setRows]       = useState(null);
  const [choice, setChoice]   = useState({});   // order id -> dealership id ('' = leave alone)
  const [error, setError]     = useState('');
  const [savedCount, setSaved] = useState(0);

  useEffect(() => {
    getUnassignedOrders()
      .then(list => {
        setRows(list);
        // Pre-select the suggestion, so the common case is read-and-save. A
        // make with no history gets a blank, not a nearest guess.
        setChoice(Object.fromEntries(
          list.map(o => [o.id, o.suggested_id ? String(o.suggested_id) : '']),
        ));
      })
      .catch(() => setRows([]));
  }, []);

  const byName = [...dealerships].sort((a, b) => a.name.localeCompare(b.name));
  const chosen = rows?.filter(o => choice[o.id]) ?? [];

  async function save() {
    setError('');
    let done = 0;
    for (const order of chosen) {
      await updateOrderDetails(order.vehicle_id, order.id, {
        dealership_id: choice[order.id],
      });
      setSaved(++done);
    }
    onDone(done);
  }

  if (rows === null) {
    return (
      <>
        <Header title="Set suppliers" onBack={onBack} />
        <div style={{ padding: 18 }}><Skeleton rows={3} height={90} /></div>
      </>
    );
  }

  return (
    <>
      <Header title="Set suppliers" subtitle={`${rows.length} parts on order`} onBack={onBack} />
      <div style={{ padding: 18 }}>
        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', color: T.dim, border: `1px dashed ${T.line}`,
            borderRadius: 12, padding: '26px 12px', fontSize: 14 }}>
            Every part on order has a supplier against it.
          </div>
        ) : (
          <>
            <div style={{ background: T.panel, border: `1px solid ${T.line}`,
              borderLeft: '3px solid #fcd34d', borderRadius: 12, padding: 14, marginBottom: 18,
              fontSize: 13, color: T.dim, lineHeight: 1.5 }}>
              Each part is set to the supplier that make usually comes from — check
              them and change any that are wrong. Parts already received are left
              alone: those arrived long ago and guessing who supplied them would
              be inventing history.
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {rows.map(o => (
                <div key={o.id} style={{ background: T.panel, border: `1px solid ${T.line}`,
                  borderRadius: 12, padding: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>
                    {Number(o.quantity) > 1 && <span style={{ color: T.dim }}>{o.quantity} × </span>}
                    {fmt(o.part_name)}
                  </div>
                  <div style={{ color: T.dim, fontSize: 12.5, marginTop: 3 }}>
                    {o.registration}
                    {o.make ? ` · ${[o.make, o.model].filter(Boolean).join(' ')}` : ' · make not recorded'}
                  </div>

                  <select value={choice[o.id] ?? ''}
                    onChange={e => setChoice(c => ({ ...c, [o.id]: e.target.value }))}
                    style={{ ...inputStyle, marginTop: 10 }}>
                    <option value="">Leave unset</option>
                    {byName.map(d => (
                      <option key={d.id} value={String(d.id)}>{d.name}</option>
                    ))}
                  </select>

                  {/* Says why this one is preselected, and how much to trust it. */}
                  <div style={{ fontSize: 12, color: T.dim, marginTop: 7 }}>
                    {o.suggested_id
                      ? `${o.suggested_pct}% of ${o.make} parts came from ${o.suggested_name} (${o.suggested_n} orders)`
                      : o.make
                        ? `No ${o.make} part has ever had a supplier recorded — nothing to go on.`
                        : 'This car has no make recorded, so there is nothing to go on.'}
                  </div>
                </div>
              ))}
            </div>

            {error && <div style={{ fontSize: 13, color: '#f472b6', marginTop: 14 }}>{error}</div>}
            <ActionButton
              onClick={save}
              onError={err => setError(
                `${err.message || 'Could not save.'} ${savedCount} of ${chosen.length} were saved.`)}
              pendingLabel={`Saving ${savedCount}/${chosen.length}…`}
              disabled={chosen.length === 0}
              style={{ ...primaryBtn, marginTop: 20 }}
            >
              <Check size={18} /> Set {chosen.length} supplier{chosen.length === 1 ? '' : 's'}
            </ActionButton>
          </>
        )}
      </div>
    </>
  );
}

function SupplierModal({ dealership, onCancel, onSave }) {
  const [name, setName]   = useState(dealership.name || '');
  const [phone, setPhone] = useState(dealership.phone || '');
  const [email, setEmail] = useState(dealership.email || '');
  const [error, setError] = useState('');

  return (
    <Modal title={dealership.name} onClose={onCancel}>
      <Field label="Name" required>
        <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
      </Field>
      <Field label="Phone">
        <input type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="03 9xxx xxxx" style={inputStyle} />
      </Field>
      <Field label="Email">
        <input type="email" inputMode="email" autoCapitalize="none" autoCorrect="off"
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="parts@dealership.com.au" style={inputStyle} />
      </Field>
      {error && <div style={{ fontSize: 13, color: '#f472b6' }}>{error}</div>}
      <ActionButton
        onClick={() => onSave({ name, phone, email })}
        onError={err => setError(err.message || 'Could not save the supplier. Please try again.')}
        pendingLabel="Saving…"
        style={primaryBtn}
      >
        <Check size={18} /> Save supplier
      </ActionButton>
    </Modal>
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
  const [year, setYear]             = useState('');
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
    setReg(''); setYear(''); setMakeId(''); setModelId(''); setModels([]);
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
      year:     year.trim() || null,
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
                    {[v.make, v.model, v.year].filter(Boolean).join(' ') || 'Details not set'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {/* Something unusual was written up on this car — worth knowing
                    before opening it, not after. */}
                {v.notes && <StickyNote size={15} color="#fcd34d" />}
                <ChevronRight size={18} color={T.dim} />
              </div>
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

          <Field label="Year">
            <input type="number" inputMode="numeric" value={year}
              onChange={e => setYear(e.target.value)}
              min={MIN_YEAR} max={maxYear()} placeholder="e.g. 2016" style={inputStyle} />
            {/* Two Camrys a year apart take different front bars. Without the
                year the app can only offer part numbers to check by eye; with
                it, the number that fits this car fills itself in. */}
            <div style={{ fontSize: 12, color: T.dim, marginTop: 6 }}>
              Worth the four taps — part numbers are matched on make, model and year.
            </div>
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
/**
 * When the car came in, and when it was entered into the app. They differ
 * whenever a job is typed up after the fact, so both are worth seeing.
 */
function VehicleDates({ vehicle }) {
  const dates = [
    ['Booked in', shortDate(vehicle.date_in)],
    ['Created',   shortDate(vehicle.created_at)],
  ].filter(([, value]) => value);

  if (!dates.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', marginBottom: 14,
      fontSize: 12.5, color: T.dim }}>
      {dates.map(([label, value]) => (
        <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {label} <strong style={{ color: T.text, fontWeight: 600 }}>{value}</strong>
        </span>
      ))}
    </div>
  );
}

/**
 * The car's model year, editable in place.
 *
 * It is the difference between a 2016 Camry's front bar and a 2017 one, and the
 * app can only offer the right part number for a car whose year it knows — so a
 * car without one says so plainly rather than sitting blank, and takes four
 * taps to fix. Every car booked in before the year existed is missing it.
 */
function VehicleYear({ vehicle, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(vehicle.year ? String(vehicle.year) : '');
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!editing) setDraft(vehicle.year ? String(vehicle.year) : '');
  }, [vehicle.year, editing]);

  async function save() {
    setError('');
    await onSave(draft.trim() || null);
    setEditing(false);
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <input autoFocus type="number" inputMode="numeric" value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            min={MIN_YEAR} max={maxYear()} placeholder="e.g. 2016" style={inputStyle} />
          {error && <div style={{ fontSize: 12.5, color: '#f472b6', marginTop: 6 }}>{error}</div>}
        </div>
        <button onClick={() => { setEditing(false); setError(''); }}
          style={{ ...miniBtn(T.dim), flex: 'none', padding: '10px 12px' }}>
          Cancel
        </button>
        <ActionButton
          onClick={save}
          onError={err => setError(err.message || 'Could not save the year. Please try again.')}
          pendingLabel="Saving…"
          style={{ ...miniBtn(T.accent), flex: 'none', padding: '10px 12px' }}
        >
          <Check size={14} /> Save
        </ActionButton>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
      fontSize: 12.5, color: T.dim }}>
      {vehicle.year ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          Year <strong style={{ color: T.text, fontWeight: 600 }}>{vehicle.year}</strong>
        </span>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fcd34d' }}>
          <AlertTriangle size={13} /> No year — part numbers can&apos;t be matched to this car
        </span>
      )}
      <button onClick={() => setEditing(true)} style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
        color: T.accent, fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
      }}>
        {vehicle.year ? <><Pencil size={11} /> Edit</> : <><Plus size={12} /> Set year</>}
      </button>
    </div>
  );
}

/**
 * When the part was ordered, when it was due, when it turned up. A missing date
 * is left out rather than shown as a dash — an empty 'Received' would read as
 * "arrived, date unknown" when what it means is "still waiting".
 */
function OrderDates({ order }) {
  const dates = [
    ['Ordered',  shortDate(order.order_date),    T.text],
    ['Expected', shortDate(order.expected_date), T.text],
    ['Received', shortDate(order.received_date), T.accent],
  ].filter(([, value]) => value);

  if (!dates.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', marginTop: 5,
      fontSize: 12, color: T.dim }}>
      {dates.map(([label, value, color]) => (
        <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {label} <strong style={{ color, fontWeight: 600 }}>{value}</strong>
        </span>
      ))}
    </div>
  );
}

/**
 * Anything out of the ordinary on this car: a part that turned up damaged, a
 * dealership that back-ordered, what the customer was told on the phone. It
 * sits above the parts because it's what the next person needs to read before
 * they touch anything, and it stays with the car across every repair it comes
 * back for.
 */
function VehicleNotes({ notes, history, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(notes || '');
  const [error, setError]     = useState('');

  // Someone else's edit lands while this is just being read: take it. While it
  // is being typed in, leave the draft alone — that text is unsaved work.
  useEffect(() => { if (!editing) setDraft(notes || ''); }, [notes, editing]);

  async function save() {
    setError('');
    await onSave(draft);
    setEditing(false);
  }

  return (
    <div style={{
      background: T.panel, border: `1px solid ${T.line}`,
      borderLeft: `3px solid ${notes ? '#fcd34d' : T.line}`,
      borderRadius: 12, padding: '12px 14px', marginBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <StickyNote size={13} color={notes ? '#fcd34d' : T.dim} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6,
          color: T.dim, textTransform: 'uppercase' }}>
          Notes
        </span>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
            color: T.accent, fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
          }}>
            {notes ? <><Pencil size={12} /> Edit</> : <><Plus size={13} /> Add note</>}
          </button>
        )}
      </div>

      {editing ? (
        <>
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={4}
            placeholder="Anything unusual — a damaged part, a delay, what the customer was told"
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit' }}
          />
          {error && <div style={{ fontSize: 12.5, color: '#f472b6', marginTop: 8 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => { setEditing(false); setDraft(notes || ''); setError(''); }}
              style={miniBtn(T.dim)}>
              Cancel
            </button>
            <ActionButton
              onClick={save}
              onError={err => setError(err.message || 'Could not save the note. Please try again.')}
              pendingLabel="Saving…"
              style={miniBtn(T.accent)}
            >
              <Check size={14} /> Save note
            </ActionButton>
          </div>
        </>
      ) : notes ? (
        // Typed as it was written: line breaks are how a note keeps two separate
        // things separate.
        <div style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {notes}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: T.dim }}>
          Nothing unusual recorded on this vehicle.
        </div>
      )}

      {/* Only edits, and the note is the only thing on a vehicle that can be
          edited. The car's own "created" entry belongs to the dates above —
          under this heading it would read as though the note were added then. */}
      <ChangeHistory entries={history?.filter(e => e.action === 'updated')} />
    </div>
  );
}

function VehiclePage({ vehicle, orders, ordersLoading, dealerships, dealerName, activeRepairId, onSelectRepair, onSaveNotes, onSaveYear, onBack, onAddPart, onEmailOrder, onPaint, onInvoices, onStatus, onEditOrder }) {
  const [repairs, setRepairs]               = useState([]);
  const [repairModal, setRepairModal]       = useState(null);   // repair being renamed/closed
  const [errorId, setErrorId]               = useState(null);
  const [errorMsg, setErrorMsg]             = useState('');
  const [editingOrder, setEditingOrder]     = useState(null);
  const [receiving, setReceiving]           = useState(null);
  const { byEntity, reload: reloadHistory }  = useVehicleHistory(vehicle.id);

  useEffect(() => {
    getRepairs(vehicle.id).then(rows => Array.isArray(rows) && setRepairs(rows)).catch(() => {});
  }, [vehicle.id]);

  // The repair currently on screen: the one the app remembers, or the newest
  // (the accident most likely being worked on) once the list has loaded.
  const selected = repairs.find(r => String(r.id) === String(activeRepairId))
    || repairs[repairs.length - 1] || null;

  // Adopt that default so "Order part" — which reads the remembered id up in the
  // root — attaches to the repair actually showing, not to nothing.
  useEffect(() => {
    if (selected && String(selected.id) !== String(activeRepairId)) onSelectRepair(selected.id);
  }, [selected, activeRepairId, onSelectRepair]);

  // Only this repair's parts. Everything on the page — list, stats, counts —
  // is scoped to it, so a second accident never muddles the first.
  const repairOrders = selected
    ? orders.filter(o => String(o.repair_id) === String(selected.id))
    : orders;
  const total   = repairOrders.reduce((s, o) => s + (o.unit_price || 0) * (o.quantity || 1), 0);
  const pending = repairOrders.filter(o => o.status === 'ordered').length;
  // An order email is addressed to a supplier about a car, not about one
  // accident on it, so it covers everything still outstanding — including a
  // part left over from an earlier repair, which is exactly the one worth
  // asking about. Counted across the whole vehicle for the same reason.
  const vehiclePending = orders.filter(o => o.status === 'ordered').length;

  async function createRepair() {
    const repair = await addRepair(vehicle.id);
    setRepairs(prev => [...prev, repair]);
    onSelectRepair(repair.id);
  }

  async function saveRepair(repairId, fields) {
    const updated = await updateRepair(vehicle.id, repairId, fields);
    setRepairs(prev => prev.map(r => (String(r.id) === String(repairId) ? { ...r, ...updated } : r)));
    setRepairModal(null);
  }

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

  // Arriving and costing something are one event, so they go in one update —
  // the part is never briefly received at the old price, and the history shows
  // a single change rather than two.
  async function receivePart(orderId, fields) {
    setErrorId(null);
    await onEditOrder(orderId, { status: 'received', ...fields });
    reloadHistory();
    setReceiving(null);
  }

  return (
    <>
      <Header
        title={vehicle.registration}
        subtitle={[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' ') || 'Vehicle'}
        onBack={onBack}
      />
      <div style={{ padding: 18 }}>
        <VehicleDates vehicle={vehicle} />

        <VehicleYear vehicle={vehicle} onSave={onSaveYear} />

        <VehicleNotes
          notes={vehicle.notes}
          history={byEntity.get(`vehicle:${vehicle.id}`)}
          onSave={async notes => { await onSaveNotes(notes); reloadHistory(); }}
        />

        <RepairBar
          repairs={repairs}
          orders={orders}
          selectedId={selected?.id}
          onSelect={onSelectRepair}
          onNew={createRepair}
          onEdit={setRepairModal}
        />

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <Stat label="Parts"   value={ordersLoading ? '—' : repairOrders.length} />
          <Stat label="Pending" value={ordersLoading ? '—' : pending} />
          <Stat label="Cost"    value={ordersLoading || !total ? '—' : `$${total.toFixed(0)}`} />
        </div>

        <button onClick={onAddPart} style={primaryBtn}>
          <Plus size={18} /> Order part
        </button>
        {/* Only worth showing once there is something on order to send. */}
        {vehiclePending > 0 && (
          <button onClick={onEmailOrder} style={{ ...outlineBtn, width: '100%', marginTop: 10 }}>
            <Mail size={18} /> Email order to supplier
          </button>
        )}
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
        ) : repairOrders.length === 0 ? (
          <div style={{ marginTop: 18, textAlign: 'center', color: T.dim,
            border: `1px dashed ${T.line}`, borderRadius: 12, padding: '30px 16px' }}>
            <Wrench size={22} color={T.dim} style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 600, color: T.text }}>No parts on this repair yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              Order parts as you assess the damage. If it can be repaired, there&apos;s nothing to add.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
            {repairOrders.map(o => {
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
                      <OrderDates order={o} />
                    </div>
                    <span style={{ alignSelf: 'flex-start', fontSize: 11.5, fontWeight: 700,
                      color: st.fg, background: st.bg, border: `1px solid ${st.bd}`,
                      padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                      {st.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {o.status === 'ordered' && (
                      // Asks what it cost on the way past, rather than flipping
                      // the badge and losing the invoice in someone's hand.
                      <button onClick={() => setReceiving(o)} style={miniBtn(T.accent)}>
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

      {receiving && (
        <ReceiveModal
          order={receiving}
          vehicle={vehicle}
          onCancel={() => setReceiving(null)}
          onReceive={fields => receivePart(receiving.id, fields)}
        />
      )}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          dealerships={dealerships}
          make={vehicle.make}
          onCancel={() => setEditingOrder(null)}
          onSave={async fields => {
            await onEditOrder(editingOrder.id, fields);
            reloadHistory();
            setEditingOrder(null);
          }}
        />
      )}

      {repairModal && (
        <RepairModal
          repair={repairModal}
          onCancel={() => setRepairModal(null)}
          onSave={fields => saveRepair(repairModal.id, fields)}
        />
      )}
    </>
  );
}

// ------------------------------------------------------------
// REPAIR BAR — one chip per accident/job, with a way to start another
// ------------------------------------------------------------
// A repair's shown name: whatever it was renamed to, else "Repair N" by the
// order it was opened. Counting from the position in the list keeps the label
// stable and human even when titles were never set.
function repairLabel(repair, index) {
  return repair.title?.trim() || `Repair ${index + 1}`;
}

function RepairBar({ repairs, orders, selectedId, onSelect, onNew, onEdit }) {
  const [busy, setBusy] = useState(false);
  if (!repairs.length) return null;

  const selected = repairs.find(r => String(r.id) === String(selectedId));
  const selectedIndex = repairs.findIndex(r => String(r.id) === String(selectedId));

  async function startNew() {
    if (busy) return;
    setBusy(true);
    try { await onNew(); } catch { /* surfaced elsewhere; chip just won't appear */ }
    finally { setBusy(false); }
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
        fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, color: T.dim, textTransform: 'uppercase' }}>
        <Layers size={13} color={T.accent} /> Repairs
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {repairs.map((r, i) => {
          const active  = String(r.id) === String(selectedId);
          const pending = orders.filter(o => String(o.repair_id) === String(r.id) && o.status === 'ordered').length;
          const closed  = r.status === 'closed';
          return (
            <button key={r.id} onClick={() => onSelect(r.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', flexShrink: 0,
              padding: '8px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all .15s',
              border: `1.5px solid ${active ? T.accent : T.line}`,
              background: active ? 'rgba(121,78,230,.18)' : T.panel,
              color: active ? T.accent : (closed ? T.dim : T.text),
            }}>
              <span>{repairLabel(r, i)}</span>
              {closed && <span style={{ fontSize: 11, color: T.dim }}>· closed</span>}
              {pending > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fcd34d',
                  background: 'rgba(252,211,77,.14)', borderRadius: 999, padding: '1px 7px' }}>
                  {pending}
                </span>
              )}
            </button>
          );
        })}
        <button onClick={startNew} disabled={busy} title="Start a new repair" style={{
          display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0,
          padding: '8px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600,
          cursor: busy ? 'wait' : 'pointer', color: T.accent, background: 'transparent',
          border: `1.5px dashed ${T.line}`, opacity: busy ? 0.6 : 1,
        }}>
          <Plus size={15} /> {busy ? 'Adding…' : 'New repair'}
        </button>
      </div>
      {selected && (
        <button onClick={() => onEdit(selected)} style={{
          display: 'flex', alignItems: 'center', gap: 5, marginTop: 8,
          background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
          color: T.dim, fontSize: 12, fontFamily: 'inherit',
        }}>
          <Pencil size={12} /> Rename or close {repairLabel(selected, selectedIndex)}
        </button>
      )}
    </div>
  );
}

function RepairModal({ repair, onCancel, onSave }) {
  const [title, setTitle]   = useState(repair.title || '');
  const [error, setError]   = useState('');
  const closed = repair.status === 'closed';

  return (
    <Modal title="Repair details" onClose={onCancel}>
      <Field label="Name">
        <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Rear-end, Front bar" style={inputStyle} />
      </Field>
      {error && <div style={{ fontSize: 13, color: '#f472b6' }}>{error}</div>}
      <div style={{ display: 'flex', gap: 10 }}>
        <ActionButton
          onClick={() => onSave({ status: closed ? 'open' : 'closed' })}
          onError={err => setError(err.message || 'Could not update the repair. Please try again.')}
          pendingLabel="Saving…"
          style={{ ...outlineBtn, flex: 1 }}
        >
          {closed ? <><RotateCcw size={16} /> Reopen</> : <><Check size={16} /> Mark closed</>}
        </ActionButton>
        <ActionButton
          onClick={() => onSave({ title })}
          onError={err => setError(err.message || 'Could not save changes. Please try again.')}
          pendingLabel="Saving…"
          style={{ ...primaryBtn, flex: 1, marginTop: 0 }}
        >
          <Check size={18} /> Save name
        </ActionButton>
      </div>
    </Modal>
  );
}

// The supplier list arrives ranked for the car on screen (see the dealerships
// route), and this splits it where the ranking changes meaning: the ones this
// make has been ordered from before, then everyone else. Without the split the
// order looks arbitrary — a dealership near the top for a good reason is
// indistinguishable from one that drifted there. Cars with no make, and makes
// nobody has ordered for yet, get the plain most-used-first list.
function DealershipSelect({ dealerships, make, value, onChange, required }) {
  const familiar = dealerships.filter(d => Number(d.make_count) > 0);
  const rest     = dealerships.filter(d => !Number(d.make_count));
  const option   = d => <option key={d.id} value={String(d.id)}>{d.name}</option>;

  return (
    <Field label="Dealership" required={required}>
      <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
        <option value="">Not set</option>
        {familiar.length > 0 ? (
          <>
            <optgroup label={`Used for ${make}`}>{familiar.map(option)}</optgroup>
            <optgroup label="Other dealerships">{rest.map(option)}</optgroup>
          </>
        ) : dealerships.map(option)}
      </select>
    </Field>
  );
}

// The part has arrived and the invoice is in someone's hand — the one moment
// its real price and part number are both known and both written down in front
// of them. Marking it received used to ask nothing, which is where most of the
// missing prices went. Skipping is one tap, because a prompt that can't be
// dismissed on a busy day gets answered with a wrong number.
function ReceiveModal({ order, vehicle, onCancel, onReceive }) {
  const [price, setPrice]           = useState(order.unit_price != null ? String(order.unit_price) : '');
  const [partNumber, setPartNumber] = useState(order.part_number || '');
  const [error, setError]           = useState('');

  const qty = Number(order.quantity) || 1;
  const total = price ? Number(price) * qty : null;

  return (
    <Modal title={fmt(order.part_name)} onClose={onCancel}>
      <div style={{ fontSize: 13, color: T.dim, marginTop: -4, lineHeight: 1.5 }}>
        Off the invoice, while you have it.
      </div>

      <Field label={qty > 1 ? `Unit price (${qty} ordered)` : 'Unit price'}>
        <input type="number" step="0.01" inputMode="decimal" autoFocus
          value={price} onChange={e => setPrice(e.target.value)}
          placeholder="0.00" style={inputStyle} />
        {total != null && qty > 1 && (
          <div style={{ fontSize: 12.5, color: T.dim, marginTop: 6 }}>
            ${total.toFixed(2)} for {qty}
          </div>
        )}
      </Field>

      <Field label="Part number">
        <input value={partNumber} onChange={e => setPartNumber(e.target.value)}
          placeholder="As printed on the invoice" style={inputStyle} />
        <div style={{ fontSize: 12, color: T.dim, marginTop: 6 }}>
          {(() => {
            const car = [vehicle?.make, vehicle?.model, vehicle?.year].filter(Boolean).join(' ');
            return car
              ? `Saved against this ${fmt(order.part_name)} for a ${car}, so the next one of those opens with it already filled in. Another year of the same model is offered to check, never filled in.`
              : `Saved against this ${fmt(order.part_name)} only. With no make, model and year on the car, nothing can be matched to it later.`;
          })()}
        </div>
      </Field>

      {error && <div style={{ fontSize: 13, color: '#f472b6' }}>{error}</div>}

      <ActionButton
        onClick={() => onReceive({
          unit_price:  price === '' ? null : Number(price),
          part_number: partNumber.trim() || null,
        })}
        onError={err => setError(err.message || 'Could not save. Please try again.')}
        pendingLabel="Saving…"
        style={primaryBtn}
      >
        <Check size={18} /> Mark received
      </ActionButton>

      <ActionButton
        onClick={() => onReceive({})}
        onError={err => setError(err.message || 'Could not save. Please try again.')}
        pendingLabel="Saving…"
        style={{ ...outlineBtn, width: '100%' }}
      >
        Received — don&apos;t have the invoice
      </ActionButton>
    </Modal>
  );
}

function EditOrderModal({ order, dealerships, make, onCancel, onSave }) {
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
      <DealershipSelect
        dealerships={dealerships} make={make}
        value={dealershipId} onChange={setDealershipId}
      />
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
// ORDER BY EMAIL — one message per supplier, for one car
// ------------------------------------------------------------
// Written the way the order would be dictated over the phone, because that is
// what it replaces: what's needed, then the car it's for, then the two things
// the parts desk always has to ring back about — price and a date.
function orderEmailSubject(vehicle) {
  const desc = [vehicle.make, vehicle.model].filter(Boolean).join(' ');
  return `Parts order — ${vehicle.registration}${desc ? ` (${desc})` : ''}`;
}

function orderEmailBody(vehicle, lines) {
  const desc = [vehicle.make, vehicle.model].filter(Boolean).join(' ');
  return [
    'Hi,',
    '',
    'Could you please supply the following:',
    '',
    // A dash rather than an indent: Gmail lays the body out as HTML, where a
    // run of leading spaces collapses to nothing and the list loses its shape.
    // A dash survives whatever the reader's client does with whitespace.
    ...lines.map(o => {
      const qty = Number(o.quantity) || 1;
      const number = o.part_number ? ` (part no. ${o.part_number})` : '';
      return `- ${qty} x ${fmt(o.part_name)}${number}`;
    }),
    '',
    `Vehicle: ${desc || '(details to follow)'}`,
    `Rego: ${vehicle.registration}`,
    '',
    'Could you please confirm the price and expected delivery date.',
    '',
    'Thanks,',
    'MB Smash Repair',
  ].join('\n');
}

// The same body, wrapped for a mailto: link. RFC 6068 says the lines of a body
// are separated by CRLF, and Gmail holds it to the letter — hand it bare LFs
// and it drops every one of them, so a six-part order arrives as a single
// run-on line. Outlook is forgiving and always looked fine, which is why this
// went unnoticed. CRLF is correct for both.
function mailtoHref(email, vehicle, lines) {
  const body = orderEmailBody(vehicle, lines).replace(/\n/g, '\r\n');
  return `mailto:${encodeURIComponent(email)}`
    + `?subject=${encodeURIComponent(orderEmailSubject(vehicle))}`
    + `&body=${encodeURIComponent(body)}`;
}

function OrderEmailPage({ vehicle, orders, lookupDealer, onSavedDealership, onBack }) {
  const pending = orders.filter(o => o.status === 'ordered');
  // Everything starts ticked: the common case is ordering the lot, and it is
  // easier to untick the one part already phoned through than to tick six.
  const [selected, setSelected] = useState(() => new Set(pending.map(o => o.id)));
  const [copied, setCopied] = useState(null);

  const toggle = id => setSelected(cur => {
    const next = new Set(cur);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // One group per supplier, biggest order first, with the parts nobody has
  // assigned a supplier to last — they can't be sent anywhere until they are.
  const groups = [];
  for (const order of pending) {
    const key = order.dealership_id ? String(order.dealership_id) : 'none';
    let group = groups.find(g => g.key === key);
    if (!group) {
      groups.push(group = {
        key,
        dealership: order.dealership_id ? lookupDealer(order.dealership_id) : null,
        orders: [],
      });
    }
    group.orders.push(order);
  }
  groups.sort((a, b) =>
    (a.dealership ? 0 : 1) - (b.dealership ? 0 : 1) || b.orders.length - a.orders.length);

  async function copyBody(group, lines) {
    const text = orderEmailBody(vehicle, lines);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(group.key);
      setTimeout(() => setCopied(cur => (cur === group.key ? null : cur)), 2000);
    } catch {
      // Clipboard access can be refused (an insecure origin, a locked-down
      // webview). Falling back to a prompt still gets the text into the
      // user's hands, which is the whole job.
      window.prompt('Copy the order:', text);
    }
  }

  return (
    <>
      <Header title="Email order" subtitle={`for ${vehicle.registration}`} onBack={onBack} />
      <div style={{ padding: 18 }}>
        {pending.length === 0 ? (
          <div style={{ textAlign: 'center', color: T.dim, border: `1px dashed ${T.line}`,
            borderRadius: 12, padding: '26px 12px', fontSize: 14 }}>
            Nothing is on order for {vehicle.registration}.
          </div>
        ) : groups.map(group => {
          const lines = group.orders.filter(o => selected.has(o.id));
          const email = group.dealership?.email;

          return (
            <div key={group.key} style={{ background: T.panel, border: `1px solid ${T.line}`,
              borderLeft: `3px solid ${group.dealership ? T.accent : '#fcd34d'}`,
              borderRadius: 12, padding: 16, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {group.dealership?.name || 'No supplier set'}
              </div>

              {!group.dealership ? (
                <div style={{ fontSize: 12.5, color: T.dim, marginTop: 6, lineHeight: 1.5 }}>
                  These parts have no supplier on them, so there is nobody to send them to.
                  Set one from the part on the vehicle page.
                </div>
              ) : email ? (
                <div style={{ fontSize: 12.5, color: T.dim, marginTop: 4 }}>{email}</div>
              ) : (
                <AddSupplierEmail dealership={group.dealership} onSaved={onSavedDealership} />
              )}

              <div style={{ display: 'grid', gap: 2, marginTop: 12 }}>
                {group.orders.map(o => (
                  <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 0', cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)}
                      style={{ width: 18, height: 18, accentColor: T.accent, flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      {Number(o.quantity) > 1 && (
                        <span style={{ color: T.dim }}>{o.quantity} × </span>
                      )}
                      {fmt(o.part_name)}
                      {o.part_number && (
                        <span style={{ color: T.dim, fontSize: 12.5 }}> · {o.part_number}</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <a
                  href={lines.length && email ? mailtoHref(email, vehicle, lines) : undefined}
                  style={{ ...primaryBtn, flex: 1, textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: lines.length && email ? 1 : 0.4,
                    pointerEvents: lines.length && email ? 'auto' : 'none' }}
                >
                  <Mail size={17} /> Send {lines.length || ''}
                </a>
                <button onClick={() => copyBody(group, lines)} disabled={!lines.length}
                  title="Copy the order text"
                  style={{ ...addChip, height: 46, width: 52, opacity: lines.length ? 1 : 0.4,
                    color: copied === group.key ? T.accent : T.dim }}>
                  {copied === group.key ? <Check size={17} /> : <Copy size={17} />}
                </button>
              </div>
              {group.dealership && !email && (
                <div style={{ fontSize: 12, color: T.dim, marginTop: 8 }}>
                  Add an email above to send, or copy the order and paste it wherever you like.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// Catching the missing address at the moment it blocks the send, rather than
// sending the user off to the Suppliers tab and back.
function AddSupplierEmail({ dealership, onSaved }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={value} onChange={e => setValue(e.target.value)}
          type="email" inputMode="email" autoCapitalize="none" autoCorrect="off"
          placeholder={`Email for ${dealership.name}`} style={{ ...inputStyle, flex: 1 }} />
        <ActionButton
          onClick={async () => {
            if (!value.trim()) return;
            setError('');
            onSaved(await updateDealership(dealership.id, {
              phone: dealership.phone, email: value,
            }));
          }}
          onError={err => setError(err.message || 'Could not save that address.')}
          pendingLabel=""
          style={{ ...addChip, color: T.accent }}
        >
          <Check size={16} />
        </ActionButton>
      </div>
      {error && <div style={{ fontSize: 12.5, color: '#f472b6', marginTop: 6 }}>{error}</div>}
    </div>
  );
}

// ------------------------------------------------------------
// ADD PART
// ------------------------------------------------------------
// "Toyota Camry 2016", or "Toyota Camry (year not recorded)" — the car a
// remembered part number or price was last taken from. Naming it is the whole
// point: a number is only worth reusing if it came off a car like this one.
function fitCar(vehicle, fitYear) {
  const car = [vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'this model';
  return `${car} ${fitYear || '(year not recorded)'}`;
}

function AddPart({ vehicle, repairId, dealerships, dealerName, onCancel, onPlaced }) {
  const [term, setTerm]             = useState('');
  const [results, setResults]       = useState([]);
  const [picked, setPicked]         = useState(null);
  const [dealershipId, setDealershipId] = useState('');
  const [quantity, setQuantity]     = useState(1);
  const [price, setPrice]           = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [expected, setExpected]     = useState('');
  const [addingNew, setAddingNew]   = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [photos, setPhotos]         = useState([]);
  const [photoBusy, setPhotoBusy]   = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [lightbox, setLightbox]     = useState(null);
  const [placeError, setPlaceError] = useState('');
  // Set once the "no supplier" warning has been shown, so a second tap goes
  // through. Cleared if a supplier is chosen, and when a different part is
  // picked — each part gets asked about on its own terms.
  const [noSupplierAck, setNoSupplierAck] = useState(false);
  const searchReq = useRef(0);

  // Debounced so typing doesn't fire a request per keystroke, and stale
  // responses from earlier terms are dropped rather than replacing newer ones.
  useEffect(() => {
    const token = ++searchReq.current;
    const timer = setTimeout(() => {
      searchCatalog(term, vehicle.id)
        .then(rows => { if (searchReq.current === token) setResults(rows); })
        .catch(() => {});
    }, term ? 180 : 0);
    return () => clearTimeout(timer);
  }, [term, vehicle.id]);

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
  // Only what is known to fit THIS car is filled in: the part number from the
  // last one of these ordered for the same make, model and year. A number off a
  // different year is offered underneath the box instead, to be looked at and
  // tapped in deliberately — it is how a Camry front bar ended up on a Jolion.
  // Price is a guess either way, so a different year's price still fills in;
  // the box says which car it came from.
  function choose(p) {
    setPicked(p);
    setDealershipId(p.default_dealership_id ? String(p.default_dealership_id) : '');
    setPrice(p.fit_price != null ? String(p.fit_price) : '');
    setPartNumber(p.fit_number_same_year ? p.fit_part_number : '');
    setQuantity(1); setExpected('');
    setNoSupplierAck(false);
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
    // Whoever placed the order knows who they placed it with — it is the one
    // fact that is always available at this moment and cannot be recovered
    // later. So it gets asked for once, plainly, and then gets out of the way:
    // a form that refuses to save is a form that gets written on paper.
    if (!dealershipId && !noSupplierAck) {
      setNoSupplierAck(true);
      return;
    }
    const order = await placeOrder({
      vehicle_id:      vehicle.id,
      repair_id:       repairId || null,
      catalog_part_id: picked.id,
      part_name:       picked.part_name,
      part_number:     partNumber.trim() || null,
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
                      {/* The number this shop has used for this part on a car
                          like the one in front of them — dashed out when there
                          isn't one, rather than borrowed from another model. */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4,
                        color: p.fit_number_same_year ? T.accent : T.dim }}>
                        <Hash size={12} />{p.fit_part_number || '—'}
                        {p.fit_part_number && !p.fit_number_same_year && (
                          <em style={{ fontStyle: 'normal', opacity: 0.8 }}>
                            {p.fit_number_year ? `(${p.fit_number_year})` : '(no year)'}
                          </em>
                        )}
                      </span>
                      {dealerName(p.default_dealership_id) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Tag size={12} />{dealerName(p.default_dealership_id)}
                        </span>
                      )}
                      {/* Says why this one is near the top of the list. */}
                      {Number(p.order_count) > 0 && (
                        <span>Ordered {p.order_count}×</span>
                      )}
                    </div>
                  </div>
                  <div style={{ color: p.fit_price != null ? T.accent : T.dim, fontWeight: 600, fontSize: 14 }}>
                    {p.fit_price != null ? `$${Number(p.fit_price).toFixed(2)}` : '—'}
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
                for {[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' ')
                     || vehicle.registration}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
              {/* The part number is asked for here, on the car it belongs to,
                  instead of being carried in from the catalog. What a 2016
                  Camry takes is not what a 2017 one takes, and the app can only
                  fill this in when it has seen the same part on the same year. */}
              <Field label="Part number">
                <input value={partNumber} onChange={e => setPartNumber(e.target.value)}
                  placeholder="As quoted, or off the invoice when it lands"
                  style={inputStyle} />
                {picked.fit_part_number && picked.fit_number_same_year ? (
                  <div style={{ fontSize: 12, color: T.dim, marginTop: 6 }}>
                    The number on the last {fmt(picked.part_name)} ordered for a{' '}
                    {fitCar(vehicle, picked.fit_number_year)}. Change it if the invoice says otherwise.
                  </div>
                ) : picked.fit_part_number ? (
                  <div style={{ fontSize: 12.5, color: T.dim, marginTop: 8, lineHeight: 1.5,
                    background: T.panel, border: `1px solid ${T.line}`,
                    borderLeft: '3px solid #fcd34d', borderRadius: 10, padding: '10px 12px' }}>
                    A {fitCar(vehicle, picked.fit_number_year)} took{' '}
                    <strong style={{ color: T.text }}>{picked.fit_part_number}</strong>.{' '}
                    {vehicle.year
                      ? 'Different year, so it may be a different part — check before using it.'
                      : 'This car has no year on it, so nothing can be matched to it — set the year on the vehicle page.'}
                    <button type="button" onClick={() => setPartNumber(picked.fit_part_number)}
                      style={{ ...miniBtn(T.accent), flex: 'none', width: 'fit-content',
                        padding: '6px 12px', marginTop: 8 }}>
                      Use it anyway
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: T.dim, marginTop: 6 }}>
                    Nothing on record for this part on a{' '}
                    {[vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'car like this'}.
                    Whatever goes in here is what the next one will be offered.
                  </div>
                )}
              </Field>

              <DealershipSelect
                required
                dealerships={dealerships} make={vehicle.make}
                value={dealershipId} onChange={id => { setDealershipId(id); setNoSupplierAck(false); }}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="Quantity" style={{ flex: 1 }}>
                  <input type="number" min={1} value={quantity}
                    onChange={e => setQuantity(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Unit price" style={{ flex: 1 }}>
                  <input type="number" step="0.01" value={price}
                    onChange={e => setPrice(e.target.value)} placeholder="0.00" style={inputStyle} />
                  {picked.fit_price != null && (
                    <div style={{ fontSize: 12, color: T.dim, marginTop: 6 }}>
                      Last paid on a {fitCar(vehicle, picked.fit_price_year)}
                    </div>
                  )}
                </Field>
              </div>
              <Field label="Expected delivery">
                <input type="date" value={expected} onChange={e => setExpected(e.target.value)} style={inputStyle} />
                {/* Almost nothing on order has a delivery date, so nothing can
                    be called late. Typing one into a date picker on a phone is
                    the reason why — these are the three answers a parts desk
                    actually gives, one tap each. */}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  {[['3 days', 3], ['1 week', 7], ['2 weeks', 14]].map(([label, days]) => (
                    <button key={days} type="button" onClick={() => setExpected(inDays(days))}
                      style={{
                        flex: 1, padding: '8px 4px', borderRadius: 10, cursor: 'pointer',
                        fontSize: 12.5, fontWeight: 600,
                        background: expected === inDays(days) ? T.panelHi : 'transparent',
                        border: `1px solid ${expected === inDays(days) ? T.accent : T.line}`,
                        color: expected === inDays(days) ? T.accent : T.dim,
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {noSupplierAck && !dealershipId && (
              <div style={{ background: T.panel, border: `1px solid ${T.line}`,
                borderLeft: '3px solid #fcd34d', borderRadius: 12, padding: 14, marginTop: 16,
                fontSize: 13, color: T.dim, lineHeight: 1.5 }}>
                No supplier picked. Without one this part can&apos;t be emailed to
                anyone or chased when it&apos;s late, and nobody will remember later
                who it came from. Tap again to add it anyway.
              </div>
            )}
            {placeError && (
              <div style={{ fontSize: 13, color: '#f472b6', marginTop: 12 }}>{placeError}</div>
            )}
            <ActionButton
              onClick={confirm}
              onError={err => setPlaceError(err.message || 'Could not add the part. Please try again.')}
              pendingLabel="Adding…"
              style={{ ...primaryBtn, marginTop: 20 }}
            >
              {noSupplierAck && !dealershipId
                ? <>Add without a supplier</>
                : <><Check size={18} /> Add to {vehicle.registration}</>}
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

  // The photo is already a JPEG, so the PDF is built in the browser from the
  // bytes we have — no round trip, and nothing to re-encode.
  function download(invoice) {
    setError('');
    const label = [
      vehicle.registration,
      typeName(invoice.invoice_type_id) || 'Invoice',
      invoice.invoice_date ? String(invoice.invoice_date).slice(0, 10) : null,
    ].filter(Boolean).join(' - ');

    let url;
    try {
      const pdf = jpegToPdf(dataUrlToBytes(invoice.photo), { title: label });
      url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${label.replace(/[^\w\s.-]/g, '')}.pdf`;
      link.click();
    } catch (err) {
      setError(err.message || 'Could not build a PDF from that photo.');
    } finally {
      // Revoking immediately can cancel the download in some browsers; the next
      // frame is late enough that the click has been handed off.
      if (url) requestAnimationFrame(() => URL.revokeObjectURL(url));
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
                        onDownload={() => download(inv)}
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

function InvoiceCard({ invoice, history, typeName, onOpenPhoto, onEdit, onDelete, onDownload }) {
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

        {invoice.photo && (
          <button onClick={onDownload} title="Download as PDF" style={iconBtn}>
            <Download size={16} color={T.dim} />
          </button>
        )}
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

  // The photo the cleanup is derived from — a freshly picked File, or the data
  // URL of the photo already on this invoice. Kept so that rotating can go back
  // to it rather than compounding a rotation onto an already-rotated JPEG.
  const [source, setSource]       = useState(null);
  const [variants, setVariants]   = useState(null);   // { original, cleaned }
  const [useCleaned, setUseCleaned] = useState(true);
  const [turns, setTurns]         = useState(0);

  async function render(nextSource, nextTurns, cleaned) {
    setPhotoBusy(true); setError('');
    try {
      const next = await readInvoicePhoto(nextSource, nextTurns);
      setVariants(next);
      setPhoto(cleaned ? next.cleaned : next.original);
    } catch (err) {
      setError(err.message || 'Could not read that image.');
    } finally {
      setPhotoBusy(false);
    }
  }

  async function onPickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setSource(file); setTurns(0); setUseCleaned(true);
    await render(file, 0, true);
  }

  // Clean or rotate a photo that was saved before any of this existed.
  async function cleanUp() {
    const from = source ?? photo;
    setSource(from); setTurns(0); setUseCleaned(true);
    await render(from, 0, true);
  }

  async function rotate() {
    const from = source ?? photo;
    const next = (turns + 1) % 4;
    setSource(from); setTurns(next);
    await render(from, next, useCleaned);
  }

  function choose(cleaned) {
    setUseCleaned(cleaned);
    setPhoto(cleaned ? variants.cleaned : variants.original);
  }

  function clearPhoto() {
    setPhoto(null); setVariants(null); setSource(null); setTurns(0);
  }

  const chip = active => ({
    display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center',
    fontSize: 12.5, fontWeight: 600, padding: '9px 10px', borderRadius: 9, cursor: 'pointer',
    color: active ? T.accent : T.dim,
    background: active ? 'rgba(121,78,230,0.16)' : 'transparent',
    border: `1px solid ${active ? T.accent : T.line}`,
  });

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
        {photo && (
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <img src={photo} alt="Invoice" style={{
              display: 'block', width: '100%', maxHeight: 260, objectFit: 'contain',
              background: T.bg, borderRadius: 10, border: `1px solid ${T.line}`,
              opacity: photoBusy ? 0.4 : 1, transition: 'opacity .15s',
            }} />
            <button onClick={clearPhoto} title="Remove photo" style={{
              position: 'absolute', top: -6, right: -6, width: 24, height: 24, padding: 0,
              borderRadius: 999, border: `1px solid ${T.line}`, background: T.panel,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={14} color="#f472b6" />
            </button>
          </div>
        )}

        {photo && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {variants ? (
              <>
                <button onClick={() => choose(true)}  disabled={photoBusy} style={chip(useCleaned)}>
                  <Wand2 size={14} /> Cleaned
                </button>
                <button onClick={() => choose(false)} disabled={photoBusy} style={chip(!useCleaned)}>
                  Original
                </button>
              </>
            ) : (
              <button onClick={cleanUp} disabled={photoBusy} style={chip(false)}>
                <Wand2 size={14} /> Clean up
              </button>
            )}
            <button onClick={rotate} disabled={photoBusy} title="Rotate a quarter turn"
              style={{ ...chip(false), flex: '0 0 auto', padding: '9px 12px' }}>
              <RotateCw size={14} />
            </button>
          </div>
        )}

        <label style={{
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
          color: T.dim, cursor: photoBusy ? 'wait' : 'pointer', opacity: photoBusy ? 0.5 : 1,
          border: `1px dashed ${T.line}`, borderRadius: 10, padding: '12px 14px',
        }}>
          <Camera size={16} color={T.accent} />
          {photoBusy ? 'Cleaning up…' : photo ? 'Replace photo' : 'Add photo'}
          <input type="file" accept="image/*" capture="environment"
            onChange={onPickPhoto} disabled={photoBusy} style={{ display: 'none' }} />
        </label>
      </Field>

      {error && <div style={{ fontSize: 13, color: '#f472b6' }}>{error}</div>}

      <ActionButton
        onClick={save}
        onError={err => setError(err.message || 'Could not save the invoice. Please try again.')}
        disabled={!typeId || photoBusy}
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
      // Extra top padding clears the status bar / Dynamic Island in standalone mode.
      padding: '14px 16px',
      paddingTop: 'calc(14px + env(safe-area-inset-top))',
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
  // fontSize must be >= 16px: iOS Safari auto-zooms the page on focus otherwise.
  width: '100%', background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10,
  padding: '11px 12px', color: T.text, fontSize: 16, outline: 'none', boxSizing: 'border-box',
  colorScheme: 'dark',
};
const searchBox = {
  display: 'flex', alignItems: 'center', gap: 8, background: T.panel,
  border: `1px solid ${T.line}`, borderRadius: 12, padding: '12px 14px',
};
const searchInput = {
  // 16px keeps iOS from zooming when the search field gains focus.
  flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: 16,
};
