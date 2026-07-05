'use client';
import React, { useState, useEffect } from 'react';
import {
  Search, Car, Plus, Check, X, Package, ChevronLeft,
  Hash, Tag, ChevronRight, RotateCcw, Wrench, LayoutDashboard, Paintbrush, LogOut,
  Camera,
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
  return res.json();
}
async function addModel(makeId, name) {
  const res = await fetch(`/api/makes/${makeId}/models`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return res.json();
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
  return res.json();
}
async function updateOrderStatus(vehicleId, orderId, status) {
  await fetch(`/api/vehicles/${vehicleId}/orders/${orderId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}
async function updateOrderInvoicePhoto(vehicleId, orderId, dataUrl) {
  const res = await fetch(`/api/vehicles/${vehicleId}/orders/${orderId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoice_photo: dataUrl }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Could not save the photo. Please try again.');
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
  return res.json();
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
  return res.json();
}
async function removeVehiclePaintItem(vehicleId, itemId) {
  await fetch(`/api/vehicles/${vehicleId}/paint/${itemId}`, { method: 'DELETE' });
}
async function updateVehiclePaintStatus(vehicleId, itemId, status) {
  const res = await fetch(`/api/vehicles/${vehicleId}/paint/${itemId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
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
  await fetch(`/api/vehicles/${vehicleId}/photos/${photoId}`, { method: 'DELETE' });
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
// ROOT
// ============================================================
export default function App() {
  const [tab, setTab]               = useState('dashboard');
  const [view, setView]             = useState('main');   // 'main' | 'vehicle' | 'add-part'
  const [vehicles, setVehicles]     = useState([]);
  const [dealerships, setDealerships] = useState([]);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [orders, setOrders]         = useState([]);

  useEffect(() => {
    getVehicles().then(setVehicles);
    getDealerships().then(setDealerships);
  }, []);

  const dealerName = id => dealerships.find(d => String(d.id) === String(id))?.name || null;

  async function openVehicle(v) {
    setActiveVehicle(v);
    setOrders(await getOrdersForVehicle(v.id));
    setView('vehicle');
  }
  async function refreshOrders() {
    if (activeVehicle) setOrders(await getOrdersForVehicle(activeVehicle.id));
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
            dealerName={dealerName}
            onBack={() => setView('main')}
            onAddPart={() => setView('add-part')}
            onPaint={() => setView('paint')}
            onStatus={async (orderId, status) => {
              await updateOrderStatus(activeVehicle.id, orderId, status);
              refreshOrders();
            }}
            onInvoicePhoto={async (orderId, dataUrl) => {
              await updateOrderInvoicePhoto(activeVehicle.id, orderId, dataUrl);
              refreshOrders();
            }}
          />
        )}

        {view === 'add-part' && activeVehicle && (
          <AddPart
            vehicle={activeVehicle}
            dealerships={dealerships}
            dealerName={dealerName}
            onCancel={() => setView('vehicle')}
            onPlaced={async () => { await refreshOrders(); setView('vehicle'); }}
          />
        )}

        {view === 'paint' && activeVehicle && (
          <PaintPage
            vehicle={activeVehicle}
            onBack={() => setView('vehicle')}
          />
        )}
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
function Dashboard({ onOpenVehicle }) {
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    getDashboardStats().then(d => { setStats(d.stats); setRecent(d.recent); });
  }, []);

  return (
    <>
      <Header title="MB Smash Repair" subtitle="Parts Management" action={
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
      } />
      <div style={{ padding: 18 }}>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            <StatCard label="Vehicles"       value={stats.vehicle_count}   accent="#794ee6" />
            <StatCard label="Parts Pending"  value={stats.pending_count}   accent="#fcd34d" />
            <StatCard label="Received Today" value={stats.received_today}  accent="#a78bfa" />
            <StatCard label="Outstanding"    value={`$${Number(stats.outstanding_cost).toFixed(0)}`} accent="#f472b6" />
          </div>
        )}

        <SectionLabel>Recent Vehicles</SectionLabel>
        <div style={{ display: 'grid', gap: 8 }}>
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
function VehicleList({ vehicles, onOpen, onAdded }) {
  const [adding, setAdding]         = useState(false);
  const [search, setSearch]         = useState('');
  const [reg, setReg]               = useState('');
  const [dateIn, setDateIn]         = useState('');
  const [makes, setMakes]           = useState([]);
  const [models, setModels]         = useState([]);
  const [makeId, setMakeId]         = useState('');
  const [modelId, setModelId]       = useState('');
  const [addingMake, setAddingMake] = useState(false);
  const [addingModel, setAddingModel] = useState(false);
  const [newName, setNewName]       = useState('');
  const [makesLoading, setMakesLoading] = useState(false);
  const [saving, setSaving]         = useState(false);
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

  function openAdd() {
    setReg(''); setMakeId(''); setModelId(''); setModels([]);
    setAddingMake(false); setAddingModel(false); setNewName('');
    setSaveError(''); setSaving(false);
    setDateIn(new Date().toISOString().slice(0, 10));
    setAdding(true);
    setMakesLoading(true);
    getMakes()
      .then(setMakes)
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
    setMakes(await getMakes());
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
    if (!reg.trim() || saving) return;
    const makeName  = makes.find(m  => String(m.id) === String(makeId))?.name  || '';
    const modelName = models.find(m => String(m.id) === String(modelId))?.name || '';
    setSaving(true); setSaveError('');
    try {
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
    } catch (err) {
      setSaveError(err.message || 'Could not save the vehicle. Please try again.');
    } finally {
      setSaving(false);
    }
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
                <button onClick={saveNewMake} style={addChip}><Check size={16} color={T.accent} /></button>
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
                <button onClick={saveNewModel} style={addChip}><Check size={16} color={T.accent} /></button>
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

          <button onClick={save} disabled={!reg.trim() || saving}
            style={{ ...primaryBtn, marginTop: 6, opacity: reg.trim() && !saving ? 1 : 0.5 }}>
            <Check size={18} /> {saving ? 'Saving…' : 'Save vehicle'}
          </button>
        </Modal>
      )}
    </>
  );
}

// ------------------------------------------------------------
// VEHICLE PAGE
// ------------------------------------------------------------
function VehiclePage({ vehicle, orders, dealerName, onBack, onAddPart, onPaint, onStatus, onInvoicePhoto }) {
  const total   = orders.reduce((s, o) => s + (o.unit_price || 0) * (o.quantity || 1), 0);
  const pending = orders.filter(o => o.status === 'ordered').length;
  const [invoiceBusyId, setInvoiceBusyId]   = useState(null);
  const [invoiceErrorId, setInvoiceErrorId] = useState(null);
  const [invoiceError, setInvoiceError]     = useState('');

  async function onPickInvoicePhoto(e, orderId) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setInvoiceBusyId(orderId); setInvoiceErrorId(null);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      await onInvoicePhoto(orderId, dataUrl);
    } catch (err) {
      setInvoiceErrorId(orderId);
      setInvoiceError(err.message || 'Could not save the photo. Please try again.');
    } finally {
      setInvoiceBusyId(null);
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
          <Stat label="Parts"   value={orders.length} />
          <Stat label="Pending" value={pending} />
          <Stat label="Cost"    value={total ? `$${total.toFixed(0)}` : '—'} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onAddPart} style={{ ...primaryBtn, flex: 1 }}>
            <Plus size={18} /> Order part
          </button>
          <button onClick={onPaint} style={{ ...outlineBtn, flex: 1 }}>
            <Paintbrush size={18} /> Paint
          </button>
        </div>

        {orders.length === 0 ? (
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>
                        {fmt(o.part_name)}{o.quantity > 1 ? ` ×${o.quantity}` : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12.5, color: T.dim }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Hash size={12} />{o.part_number || '—'}
                        </span>
                        {dealerName(o.dealership_id) && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Tag size={12} />{dealerName(o.dealership_id)}
                          </span>
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
                      <button onClick={() => onStatus(o.id, 'received')} style={miniBtn(T.accent)}>
                        <Check size={14} /> Received
                      </button>
                    )}
                    {o.status !== 'returned' && (
                      <button onClick={() => onStatus(o.id, 'returned')} style={miniBtn(T.dim)}>
                        <RotateCcw size={14} /> Return
                      </button>
                    )}
                    {o.status === 'returned' && (
                      <button onClick={() => onStatus(o.id, 'ordered')} style={miniBtn(T.dim)}>
                        Undo
                      </button>
                    )}
                  </div>

                  {o.status === 'received' && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {o.invoice_photo ? (
                        <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                          <img src={o.invoice_photo} alt="Invoice"
                            style={{ width: '100%', height: '100%', objectFit: 'cover',
                              borderRadius: 8, border: `1px solid ${T.line}` }} />
                          <button onClick={() => onInvoicePhoto(o.id, null)} title="Delete invoice photo" style={{
                            position: 'absolute', top: -6, right: -6, width: 18, height: 18, padding: 0,
                            borderRadius: 999, border: `1px solid ${T.line}`, background: T.panel,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <X size={11} color="#f472b6" />
                          </button>
                        </div>
                      ) : (
                        <label style={{
                          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600,
                          color: T.dim, cursor: invoiceBusyId === o.id ? 'wait' : 'pointer',
                          opacity: invoiceBusyId === o.id ? 0.5 : 1,
                        }}>
                          <Camera size={15} color={T.accent} />
                          {invoiceBusyId === o.id ? 'Saving…' : 'Add invoice photo'}
                          <input type="file" accept="image/*" capture="environment"
                            onChange={e => onPickInvoicePhoto(e, o.id)}
                            disabled={invoiceBusyId === o.id} style={{ display: 'none' }} />
                        </label>
                      )}
                    </div>
                  )}
                  {invoiceErrorId === o.id && (
                    <div style={{ fontSize: 12.5, color: '#f472b6', marginTop: 6 }}>{invoiceError}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
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

  useEffect(() => { searchCatalog('').then(setResults); }, []);
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
  async function deletePhoto(photoId) {
    await removeVehiclePhoto(vehicle.id, photoId);
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  }

  async function run(v) { setTerm(v); setResults(await searchCatalog(v)); setAddingNew(false); }
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
    await placeOrder({
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
    onPlaced();
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
              <img src={p.data_url} alt="Accident photo"
                style={{ width: '100%', height: '100%', objectFit: 'cover',
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
                    <button onClick={saveNewPart} style={addChip}><Check size={16} color={T.accent} /></button>
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

            <button onClick={confirm} style={{ ...primaryBtn, marginTop: 20 }}>
              <Check size={18} /> Add to {vehicle.registration}
            </button>
          </>
        )}
      </div>
    </>
  );
}

// ------------------------------------------------------------
// PAINT PAGE
// ------------------------------------------------------------
function PaintPage({ vehicle, onBack }) {
  const [catalog, setCatalog]     = useState([]);
  const [items, setItems]         = useState([]);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName]     = useState('');

  useEffect(() => {
    Promise.all([getPaintCatalog(), getVehiclePaint(vehicle.id)])
      .then(([cat, its]) => { setCatalog(cat); setItems(its); });
  }, [vehicle.id]);

  const isSelected = name => items.some(i => i.part_name === name);
  const getItem    = name => items.find(i => i.part_name === name);

  async function toggle(partName) {
    if (isSelected(partName)) {
      const item = getItem(partName);
      await removeVehiclePaintItem(vehicle.id, item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      const item = await addVehiclePaintItem(vehicle.id, partName);
      setItems(prev => [...prev, item]);
    }
  }

  async function setStatus(itemId, status) {
    const updated = await updateVehiclePaintStatus(vehicle.id, itemId, status);
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
  }

  async function saveNewPart() {
    if (!newName.trim()) return;
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
            <button onClick={saveNewPart} style={addChip}><Check size={16} color={T.accent} /></button>
            <button onClick={() => setAddingNew(false)} style={addChip}><X size={16} color={T.dim} /></button>
          </div>
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

        {items.length === 0 && (
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
