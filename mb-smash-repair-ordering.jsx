import React, { useState } from 'react';
import {
  Search, Car, Plus, Check, X, Package, ChevronLeft,
  Hash, Tag, ChevronRight, RotateCcw, Wrench,
} from 'lucide-react';

// ============================================================
// DATA LAYER — all DB calls live here (mock now, supabase-js later)
// ------------------------------------------------------------
// Swap example when tables are live:
//   async function getVehicles() {
//     const { data } = await supabase
//       .from('vehicles').select('*').order('date_in', { ascending: false });
//     return data;
//   }
//   async function getOrdersForVehicle(vehicleId) {
//     const { data } = await supabase
//       .from('orders').select('*').eq('vehicle_id', vehicleId)
//       .order('created_at');
//     return data;
//   }
// ============================================================

let MOCK_VEHICLES = [
  { id: 1, registration: 'R2890', make: 'Toyota', model: 'Camry', date_in: '2026-06-24' },
  { id: 2, registration: '1XS3FS', make: 'Toyota', model: 'Hilux', date_in: '2026-06-20' },
  { id: 3, registration: 'U2765', make: 'Mazda', model: 'CX-5', date_in: '2026-06-18' },
];

let MOCK_ORDERS = {
  1: [
    { id: 11, part_name: 'REAR BUMPER BAR', part_number: null, dealership_id: 2, unit_price: null, quantity: 1, status: 'ordered' },
  ],
  2: [
    { id: 21, part_name: 'COVER FR BUMPER', part_number: '5211947949', dealership_id: 1, unit_price: 237.03, quantity: 1, status: 'received' },
    { id: 22, part_name: 'UNIT ASSY HEADLAMP', part_number: '8113047360', dealership_id: 1, unit_price: 250.61, quantity: 1, status: 'ordered' },
  ],
  3: [],
};

const MOCK_CATALOG = [
  { id: 1, part_number: '5211947949', part_name: 'COVER FR BUMPER', typical_price: 237.03, default_dealership_id: 1 },
  { id: 2, part_number: '7537447112', part_name: 'EMBLEM SIDE PANEL', typical_price: 42.80, default_dealership_id: 1 },
  { id: 3, part_number: '5211547030', part_name: 'SUPPORT FR BUMPER', typical_price: 58.87, default_dealership_id: 1 },
  { id: 4, part_number: '8113047360', part_name: 'UNIT ASSY HEADLAMP', typical_price: 250.61, default_dealership_id: 1 },
  { id: 5, part_number: null, part_name: 'FR BAR', typical_price: null, default_dealership_id: 2 },
  { id: 6, part_number: null, part_name: 'REAR BUMPER BAR', typical_price: null, default_dealership_id: 2 },
  { id: 7, part_number: null, part_name: 'LOWER GRILL', typical_price: null, default_dealership_id: null },
  { id: 8, part_number: null, part_name: 'LH HEADLIGHT', typical_price: null, default_dealership_id: 3 },
  { id: 9, part_number: null, part_name: 'RH HEADLIGHT', typical_price: null, default_dealership_id: 3 },
  { id: 10, part_number: null, part_name: 'TOP GRILL', typical_price: null, default_dealership_id: null },
  { id: 11, part_number: null, part_name: 'RH GUARD', typical_price: null, default_dealership_id: 2 },
  { id: 12, part_number: null, part_name: 'BONET', typical_price: null, default_dealership_id: 4 },
];

const MOCK_DEALERSHIPS = [
  { id: 1, name: 'Preston Toyota' },
  { id: 2, name: 'PT' },
  { id: 3, name: 'SSS' },
  { id: 4, name: 'Adil' },
];

let MOCK_MAKES = [
  { id: 1, name: 'Toyota' }, { id: 2, name: 'Lexus' }, { id: 3, name: 'Mazda' },
  { id: 4, name: 'Nissan' }, { id: 5, name: 'Honda' }, { id: 6, name: 'Hyundai' },
  { id: 7, name: 'Kia' }, { id: 8, name: 'Mitsubishi' }, { id: 9, name: 'Ford' },
  { id: 10, name: 'Volkswagen' }, { id: 11, name: 'Subaru' }, { id: 12, name: 'Holden' },
  { id: 13, name: 'BMW' }, { id: 14, name: 'Mercedes-Benz' }, { id: 15, name: 'Audi' },
  { id: 16, name: 'Suzuki' }, { id: 17, name: 'Isuzu' }, { id: 18, name: 'Volvo' },
  { id: 19, name: 'GWM' }, { id: 20, name: 'MG' },
];

let MOCK_MODELS = [
  ['Toyota', ['Corolla','Camry','Kluger','RAV4','Hilux','LandCruiser','Prado','Yaris','C-HR','Fortuner','86']],
  ['Lexus', ['IS','ES','RX','NX','UX','LX','LS','GX']],
  ['Mazda', ['Mazda2','Mazda3','Mazda6','CX-3','CX-30','CX-5','CX-8','CX-9','BT-50','MX-5']],
  ['Nissan', ['Micra','Pulsar','X-Trail','Qashqai','Navara','Patrol','Juke','Pathfinder','Leaf']],
  ['Honda', ['Jazz','Civic','Accord','CR-V','HR-V','Odyssey']],
  ['Hyundai', ['i20','i30','Accent','Elantra','Kona','Tucson','Santa Fe','Venue','iLoad']],
  ['Kia', ['Picanto','Rio','Cerato','Seltos','Sportage','Sorento','Carnival','Stinger']],
  ['Mitsubishi', ['Mirage','ASX','Eclipse Cross','Outlander','Pajero','Pajero Sport','Triton']],
  ['Ford', ['Fiesta','Focus','Mondeo','Puma','Escape','Everest','Ranger','Mustang']],
  ['Volkswagen', ['Polo','Golf','Passat','T-Cross','T-Roc','Tiguan','Touareg','Amarok']],
  ['Subaru', ['Impreza','WRX','Liberty','XV','Forester','Outback','BRZ']],
  ['Holden', ['Barina','Cruze','Commodore','Astra','Trax','Captiva','Colorado']],
  ['BMW', ['1 Series','2 Series','3 Series','5 Series','X1','X3','X5']],
  ['Mercedes-Benz', ['A-Class','C-Class','E-Class','GLA','GLC','GLE']],
  ['Audi', ['A1','A3','A4','Q2','Q3','Q5','Q7']],
  ['Suzuki', ['Swift','Baleno','Vitara','S-Cross','Jimny']],
  ['Isuzu', ['D-Max','MU-X']],
  ['Volvo', ['XC40','XC60','XC90','S60']],
  ['GWM', ['Haval H6','Haval Jolion','Ute']],
  ['MG', ['MG3','ZS','HS']],
].flatMap(([mk, list]) => {
  const makeId = MOCK_MAKES.find(m => m.name === mk).id;
  return list.map((name, i) => ({ id: makeId * 100 + i, make_id: makeId, name }));
});

async function getMakes() { return [...MOCK_MAKES].sort((a, b) => a.name.localeCompare(b.name)); }
async function getModels(makeId) {
  return MOCK_MODELS.filter(m => m.make_id === Number(makeId)).sort((a, b) => a.name.localeCompare(b.name));
}
async function addMake(name) {
  const rec = { id: Date.now(), name: name.trim() };
  MOCK_MAKES = [...MOCK_MAKES, rec];
  return rec;
}
async function addModel(makeId, name) {
  const rec = { id: Date.now(), make_id: Number(makeId), name: name.trim() };
  MOCK_MODELS = [...MOCK_MODELS, rec];
  return rec;
}

async function getVehicles() { return [...MOCK_VEHICLES]; }
async function getOrdersForVehicle(id) { return [...(MOCK_ORDERS[id] || [])]; }
async function getDealerships() { return MOCK_DEALERSHIPS; }
async function searchCatalog(term) {
  const t = term.trim().toLowerCase();
  const base = t
    ? MOCK_CATALOG.filter(p => p.part_name.toLowerCase().includes(t) || (p.part_number && p.part_number.toLowerCase().includes(t)))
    : MOCK_CATALOG.slice(0, 8);
  return base;
}
async function addVehicle(v) {
  const rec = { ...v, id: Date.now() };
  MOCK_VEHICLES = [rec, ...MOCK_VEHICLES];
  MOCK_ORDERS[rec.id] = [];
  return rec;
}
async function placeOrder(order) {
  const rec = { ...order, id: Date.now() };
  MOCK_ORDERS[order.vehicle_id] = [...(MOCK_ORDERS[order.vehicle_id] || []), rec];
  return rec;
}
async function updateOrderStatus(vehicleId, orderId, status) {
  MOCK_ORDERS[vehicleId] = MOCK_ORDERS[vehicleId].map(o =>
    o.id === orderId ? { ...o, status } : o
  );
}

// ============================================================
// THEME — GoalPath cyan/blue
// ============================================================
const T = {
  bg: '#0b1220', panel: '#121c2e', panelHi: '#1a2740', line: '#22304a',
  text: '#e8eef7', dim: '#8aa0bd', cyan: '#22d3ee', blue: '#3b82f6', blueDeep: '#1d4ed8',
};
const STATUS = {
  ordered:  { label: 'Ordered',  fg: '#fcd34d', bg: 'rgba(252,211,77,.12)', bd: 'rgba(252,211,77,.4)' },
  received: { label: 'Received', fg: '#22d3ee', bg: 'rgba(34,211,238,.12)', bd: 'rgba(34,211,238,.4)' },
  returned: { label: 'To return',fg: '#f472b6', bg: 'rgba(244,114,182,.12)', bd: 'rgba(244,114,182,.4)' },
};

export default function App() {
  const [view, setView] = useState('vehicles'); // vehicles | vehicle | add-part
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [dealerships] = useState(MOCK_DEALERSHIPS);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [orders, setOrders] = useState([]);

  const dealerName = id => dealerships.find(d => d.id === id)?.name || null;

  async function openVehicle(v) {
    setActiveVehicle(v);
    setOrders(await getOrdersForVehicle(v.id));
    setView('vehicle');
  }
  async function refreshOrders() {
    if (activeVehicle) setOrders(await getOrdersForVehicle(activeVehicle.id));
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', paddingBottom: 40 }}>

        {view === 'vehicles' && (
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
            onBack={() => setView('vehicles')}
            onAddPart={() => setView('add-part')}
            onStatus={async (orderId, status) => {
              await updateOrderStatus(activeVehicle.id, orderId, status);
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
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// VEHICLE LIST
// ------------------------------------------------------------
function VehicleList({ vehicles, onOpen, onAdded }) {
  const [adding, setAdding] = useState(false);
  const [reg, setReg] = useState('');
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [makeId, setMakeId] = useState('');
  const [modelId, setModelId] = useState('');
  const [addingMake, setAddingMake] = useState(false);
  const [addingModel, setAddingModel] = useState(false);
  const [newName, setNewName] = useState('');

  async function openAdd() {
    setReg(''); setMakeId(''); setModelId(''); setModels([]);
    setAddingMake(false); setAddingModel(false); setNewName('');
    setMakes(await getMakes());
    setAdding(true);
  }

  async function onMakeChange(id) {
    setMakeId(id);
    setModelId('');
    setAddingModel(false);
    setModels(id ? await getModels(id) : []);
  }

  async function saveNewMake() {
    if (!newName.trim()) return;
    const m = await addMake(newName);
    setMakes(await getMakes());
    setNewName(''); setAddingMake(false);
    onMakeChange(m.id);
  }
  async function saveNewModel() {
    if (!newName.trim() || !makeId) return;
    const m = await addModel(makeId, newName);
    setModels(await getModels(makeId));
    setNewName(''); setAddingModel(false);
    setModelId(m.id);
  }

  async function save() {
    if (!reg.trim()) return;
    const makeName = makes.find(m => m.id === Number(makeId))?.name || '';
    const modelName = models.find(m => m.id === Number(modelId))?.name || '';
    const v = await addVehicle({
      registration: reg.trim().toUpperCase(),
      make_id: makeId ? Number(makeId) : null,
      model_id: modelId ? Number(modelId) : null,
      make: makeName, model: modelName,
      date_in: new Date().toISOString().slice(0, 10),
    });
    setAdding(false);
    onAdded(v);
  }

  return (
    <>
      <Header title="Vehicles" subtitle="MB Smash Repair" />
      <div style={{ padding: 18 }}>
        <button onClick={openAdd} style={primaryBtn}>
          <Plus size={18} /> Add vehicle
        </button>

        <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
          {vehicles.map(v => (
            <button key={v.id} onClick={() => onOpen(v)} style={cardBtn}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.cyan; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: T.panelHi,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Car size={18} color={T.cyan} />
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

          {/* MAKE */}
          <Field label="Make">
            {!addingMake ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={makeId} onChange={e => onMakeChange(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                  <option value="">Select make…</option>
                  {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <button onClick={() => { setAddingMake(true); setNewName(''); }} style={addChip} title="Add new make">
                  <Plus size={16} color={T.cyan} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="New make name" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={saveNewMake} style={addChip}><Check size={16} color={T.cyan} /></button>
                <button onClick={() => setAddingMake(false)} style={addChip}><X size={16} color={T.dim} /></button>
              </div>
            )}
          </Field>

          {/* MODEL — depends on make */}
          <Field label="Model">
            {!addingModel ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={modelId} onChange={e => setModelId(e.target.value)}
                  disabled={!makeId} style={{ ...inputStyle, flex: 1, opacity: makeId ? 1 : 0.5 }}>
                  <option value="">{makeId ? 'Select model…' : 'Pick a make first'}</option>
                  {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <button onClick={() => { setAddingModel(true); setNewName(''); }}
                  disabled={!makeId} style={{ ...addChip, opacity: makeId ? 1 : 0.4 }} title="Add new model">
                  <Plus size={16} color={T.cyan} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="New model name" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={saveNewModel} style={addChip}><Check size={16} color={T.cyan} /></button>
                <button onClick={() => setAddingModel(false)} style={addChip}><X size={16} color={T.dim} /></button>
              </div>
            )}
          </Field>

          <button onClick={save} disabled={!reg.trim()}
            style={{ ...primaryBtn, marginTop: 6, opacity: reg.trim() ? 1 : 0.5 }}>
            <Check size={18} /> Save vehicle
          </button>
        </Modal>
      )}
    </>
  );
}

// ------------------------------------------------------------
// VEHICLE PAGE (hub)
// ------------------------------------------------------------
function VehiclePage({ vehicle, orders, dealerName, onBack, onAddPart, onStatus }) {
  const total = orders.reduce((s, o) => s + (o.unit_price || 0) * (o.quantity || 1), 0);
  const pending = orders.filter(o => o.status === 'ordered').length;

  return (
    <>
      <Header
        title={vehicle.registration}
        subtitle={[vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'Vehicle'}
        onBack={onBack}
      />
      <div style={{ padding: 18 }}>
        {/* summary strip */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <Stat label="Parts" value={orders.length} />
          <Stat label="Pending" value={pending} />
          <Stat label="Cost" value={total ? `$${total.toFixed(0)}` : '—'} />
        </div>

        <button onClick={onAddPart} style={primaryBtn}>
          <Plus size={18} /> Order part
        </button>

        {orders.length === 0 ? (
          <div style={{ marginTop: 18, textAlign: 'center', color: T.dim,
            border: `1px dashed ${T.line}`, borderRadius: 12, padding: '30px 16px' }}>
            <Wrench size={22} color={T.dim} style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 600, color: T.text }}>No parts ordered yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              Order parts as you assess the damage. If it can be repaired, there's nothing to add.
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
                        {o.part_name}{o.quantity > 1 ? ` ×${o.quantity}` : ''}
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
                      <button onClick={() => onStatus(o.id, 'received')} style={miniBtn(T.cyan)}>
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
// ADD PART (catalog search, vehicle locked in)
// ------------------------------------------------------------
function AddPart({ vehicle, dealerships, dealerName, onCancel, onPlaced }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(MOCK_CATALOG.slice(0, 8));
  const [picked, setPicked] = useState(null);
  const [dealershipId, setDealershipId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [expected, setExpected] = useState('');

  async function run(v) { setTerm(v); setResults(await searchCatalog(v)); }
  function choose(p) {
    setPicked(p);
    setDealershipId(p.default_dealership_id || '');
    setPrice(p.typical_price != null ? String(p.typical_price) : '');
    setQuantity(1); setExpected('');
  }
  async function confirm() {
    await placeOrder({
      vehicle_id: vehicle.id, catalog_part_id: picked.id,
      part_name: picked.part_name, part_number: picked.part_number,
      dealership_id: dealershipId ? Number(dealershipId) : null,
      quantity: Number(quantity), unit_price: price ? Number(price) : null,
      expected_date: expected || null, status: 'ordered',
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
        {!picked ? (
          <>
            <div style={searchBox}>
              <Search size={18} color={T.cyan} />
              <input autoFocus value={term} onChange={e => run(e.target.value)}
                placeholder="Search part number or name" style={searchInput} />
              {term && <button onClick={() => run('')} style={iconBtn}><X size={16} color={T.dim} /></button>}
            </div>

            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              {results.length === 0 && (
                <div style={{ textAlign: 'center', color: T.dim, border: `1px dashed ${T.line}`,
                  borderRadius: 12, padding: '26px 12px' }}>
                  No catalog match for "{term}".
                </div>
              )}
              {results.map(p => (
                <button key={p.id} onClick={() => choose(p)} style={cardBtn}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.cyan; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.line; }}>
                  <div style={{ textAlign: 'left', minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{p.part_name}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12.5, color: T.dim }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Hash size={12} />{p.part_number || '—'}</span>
                      {dealerName(p.default_dealership_id) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Tag size={12} />{dealerName(p.default_dealership_id)}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ color: p.typical_price != null ? T.cyan : T.dim, fontWeight: 600, fontSize: 14 }}>
                    {p.typical_price != null ? `$${p.typical_price.toFixed(2)}` : '—'}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{picked.part_name}</div>
              <div style={{ color: T.dim, fontSize: 13, marginTop: 4 }}>
                {picked.part_number ? `Part #${picked.part_number}` : 'No part number'}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
              <Field label="Dealership">
                <select value={dealershipId} onChange={e => setDealershipId(e.target.value)} style={{ ...inputStyle }}>
                  <option value="">Not set</option>
                  {dealerships.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>
              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="Quantity" style={{ flex: 1 }}>
                  <input type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Unit price" style={{ flex: 1 }}>
                  <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" style={inputStyle} />
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
// Shared UI
// ------------------------------------------------------------
function Header({ title, subtitle, onBack }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 10,
      background: `linear-gradient(90deg, ${T.blueDeep}, ${T.blue})`,
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
      borderBottom: `1px solid ${T.line}` }}>
      {onBack
        ? <button onClick={onBack} style={{ ...iconBtn, padding: 4 }}><ChevronLeft size={22} color="#fff" /></button>
        : <Package size={22} color="#fff" />}
      <div style={{ lineHeight: 1.15 }}>
        <div style={{ fontWeight: 700, color: '#fff', fontSize: 16, letterSpacing: 0.3 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'rgba(255,255,255,.82)' }}>{subtitle}</div>}
      </div>
    </header>
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
        {label}{required && <span style={{ color: T.blue }}> *</span>}
      </div>
      {children}
    </label>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 520,
        background: T.bg, borderTop: `2px solid ${T.blue}`, borderRadius: '16px 16px 0 0',
        padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
          <button onClick={onClose} style={iconBtn}><X size={20} color={T.dim} /></button>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>{children}</div>
      </div>
    </div>
  );
}

// styles
const primaryBtn = {
  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
  fontSize: 15, fontWeight: 700, cursor: 'pointer', color: '#fff',
  background: `linear-gradient(90deg, ${T.blue}, ${T.cyan})`,
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
};
const searchBox = {
  display: 'flex', alignItems: 'center', gap: 8, background: T.panel,
  border: `1px solid ${T.line}`, borderRadius: 12, padding: '12px 14px',
};
const searchInput = {
  flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: 15,
};
