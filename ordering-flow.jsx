import React, { useState, useMemo } from 'react';
import { Search, Car, Plus, Check, X, Package, ChevronLeft, Hash, Tag } from 'lucide-react';

// ============================================================
// DATA LAYER
// ------------------------------------------------------------
// Every database call lives here. Right now these functions return
// mock data so the UI is fully clickable. When your Supabase tables
// are live, each function body gets swapped for a supabase-js call —
// the rest of the app doesn't change.
//
// Swap example (later):
//   export async function searchCatalog(term) {
//     const { data } = await supabase
//       .from('parts_catalog')
//       .select('*')
//       .or(`part_name.ilike.%${term}%,part_number.ilike.%${term}%`)
//       .limit(20);
//     return data;
//   }
// ============================================================

const MOCK_CATALOG = [
  { id: 1, part_number: '5211947949', part_name: 'COVER FR BUMPER', typical_price: 237.03, default_dealership_id: 1 },
  { id: 2, part_number: '7537447112', part_name: 'EMBLEM SIDE PANEL', typical_price: 42.80, default_dealership_id: 1 },
  { id: 3, part_number: '5211547030', part_name: 'SUPPORT FR BUMPER', typical_price: 58.87, default_dealership_id: 1 },
  { id: 4, part_number: '8113047360', part_name: 'UNIT ASSY HEADLAMP', typical_price: 250.61, default_dealership_id: 1 },
  { id: 5, part_number: null, part_name: 'FR BAR', typical_price: null, default_dealership_id: 2 },
  { id: 6, part_number: null, part_name: 'REAR BAR', typical_price: null, default_dealership_id: 2 },
  { id: 7, part_number: null, part_name: 'LOWER GRILL', typical_price: null, default_dealership_id: null },
  { id: 8, part_number: null, part_name: 'LH HEADLIGHT', typical_price: null, default_dealership_id: 3 },
  { id: 9, part_number: null, part_name: 'RH HEADLIGHT', typical_price: null, default_dealership_id: 3 },
  { id: 10, part_number: null, part_name: 'TOP GRILL', typical_price: null, default_dealership_id: null },
  { id: 11, part_number: null, part_name: 'RH GUARD', typical_price: null, default_dealership_id: 2 },
  { id: 12, part_number: null, part_name: 'BONET', typical_price: null, default_dealership_id: 4 },
];

const MOCK_VEHICLES = [
  { id: 1, registration: '1XS3FS', make: 'Toyota', model: 'Hilux' },
  { id: 2, registration: 'U2765', make: 'Mazda', model: 'CX-5' },
  { id: 3, registration: 'R2855', make: 'Nissan', model: 'X-Trail' },
];

const MOCK_DEALERSHIPS = [
  { id: 1, name: 'Preston Toyota' },
  { id: 2, name: 'PT' },
  { id: 3, name: 'SSS' },
  { id: 4, name: 'Adil' },
];

async function searchCatalog(term) {
  const t = term.trim().toLowerCase();
  if (!t) return MOCK_CATALOG.slice(0, 8);
  return MOCK_CATALOG.filter(
    (p) =>
      p.part_name.toLowerCase().includes(t) ||
      (p.part_number && p.part_number.toLowerCase().includes(t))
  );
}

async function getVehicles() {
  return MOCK_VEHICLES;
}

async function getDealerships() {
  return MOCK_DEALERSHIPS;
}

async function placeOrder(order) {
  // Later: await supabase.from('orders').insert(order)
  console.log('ORDER PLACED:', order);
  return { ...order, id: Math.floor(Math.random() * 100000) };
}

// ============================================================
// THEME — GoalPath cyan/blue, disciplined
// ============================================================
const T = {
  bg: '#0b1220',
  panel: '#121c2e',
  panelHi: '#1a2740',
  line: '#22304a',
  text: '#e8eef7',
  dim: '#8aa0bd',
  cyan: '#22d3ee',
  blue: '#3b82f6',
  blueDeep: '#1d4ed8',
};

export default function OrderingFlow() {
  const [step, setStep] = useState('search'); // search -> configure -> done
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(MOCK_CATALOG.slice(0, 8));
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [dealerships, setDealerships] = useState(MOCK_DEALERSHIPS);
  const [selectedPart, setSelectedPart] = useState(null);
  const [placed, setPlaced] = useState(null);

  // configure-step fields
  const [vehicleId, setVehicleId] = useState('');
  const [dealershipId, setDealershipId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [expected, setExpected] = useState('');

  const dealerName = (id) =>
    dealerships.find((d) => d.id === id)?.name || null;

  async function runSearch(value) {
    setTerm(value);
    setResults(await searchCatalog(value));
  }

  function choosePart(part) {
    setSelectedPart(part);
    setDealershipId(part.default_dealership_id || '');
    setPrice(part.typical_price != null ? String(part.typical_price) : '');
    setQuantity(1);
    setVehicleId('');
    setExpected('');
    setStep('configure');
  }

  async function confirmOrder() {
    if (!vehicleId) return;
    const veh = vehicles.find((v) => v.id === Number(vehicleId));
    const order = {
      vehicle_id: Number(vehicleId),
      catalog_part_id: selectedPart.id,
      part_name: selectedPart.part_name,
      part_number: selectedPart.part_number,
      dealership_id: dealershipId ? Number(dealershipId) : null,
      quantity: Number(quantity),
      unit_price: price ? Number(price) : null,
      expected_date: expected || null,
      status: 'ordered',
    };
    const saved = await placeOrder(order);
    setPlaced({ ...saved, _vehicle: veh });
    setStep('done');
  }

  function reset() {
    setSelectedPart(null);
    setPlaced(null);
    setTerm('');
    setResults(MOCK_CATALOG.slice(0, 8));
    setStep('search');
  }

  const canConfirm = vehicleId !== '';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        color: T.text,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 0 40px' }}>
        {/* Header */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: `linear-gradient(90deg, ${T.blueDeep}, ${T.blue})`,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderBottom: `1px solid ${T.line}`,
          }}
        >
          <Package size={22} color="#fff" />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>
              Order Parts
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)' }}>
              MB Smash Repair
            </div>
          </div>
        </header>

        {/* STEP 1 — SEARCH CATALOG */}
        {step === 'search' && (
          <div style={{ padding: 18 }}>
            <p style={{ color: T.dim, fontSize: 13, margin: '4px 0 14px' }}>
              Search the catalog by part number or name.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: T.panel,
                border: `1px solid ${T.line}`,
                borderRadius: 12,
                padding: '12px 14px',
              }}
            >
              <Search size={18} color={T.cyan} />
              <input
                autoFocus
                value={term}
                onChange={(e) => runSearch(e.target.value)}
                placeholder="e.g. 5211947949 or FR BAR"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: T.text,
                  fontSize: 15,
                }}
              />
              {term && (
                <button
                  onClick={() => runSearch('')}
                  style={iconBtn}
                  aria-label="Clear search"
                >
                  <X size={16} color={T.dim} />
                </button>
              )}
            </div>

            <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
              {results.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    color: T.dim,
                    padding: '28px 12px',
                    border: `1px dashed ${T.line}`,
                    borderRadius: 12,
                  }}
                >
                  No catalog match for "{term}".
                  <br />
                  <span style={{ fontSize: 13 }}>
                    You can add it as a new catalog part.
                  </span>
                </div>
              )}

              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => choosePart(p)}
                  style={{
                    textAlign: 'left',
                    background: T.panel,
                    border: `1px solid ${T.line}`,
                    borderRadius: 12,
                    padding: '13px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'border-color .15s, background .15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = T.cyan;
                    e.currentTarget.style.background = T.panelHi;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.line;
                    e.currentTarget.style.background = T.panel;
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {p.part_name}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        marginTop: 4,
                        fontSize: 12.5,
                        color: T.dim,
                      }}
                    >
                      <span
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Hash size={12} />
                        {p.part_number || '—'}
                      </span>
                      {dealerName(p.default_dealership_id) && (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Tag size={12} />
                          {dealerName(p.default_dealership_id)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      color: p.typical_price != null ? T.cyan : T.dim,
                      fontWeight: 600,
                      fontSize: 14,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.typical_price != null ? `$${p.typical_price.toFixed(2)}` : '—'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — CONFIGURE ORDER */}
        {step === 'configure' && selectedPart && (
          <div style={{ padding: 18 }}>
            <button onClick={() => setStep('search')} style={backBtn}>
              <ChevronLeft size={16} /> Back to search
            </button>

            <div
              style={{
                background: T.panel,
                border: `1px solid ${T.line}`,
                borderRadius: 12,
                padding: 16,
                marginTop: 12,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 17 }}>
                {selectedPart.part_name}
              </div>
              <div style={{ color: T.dim, fontSize: 13, marginTop: 4 }}>
                {selectedPart.part_number
                  ? `Part #${selectedPart.part_number}`
                  : 'No part number'}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
              <Field label="Vehicle" required>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: T.panel,
                    border: `1px solid ${vehicleId ? T.line : T.blue}`,
                    borderRadius: 10,
                    padding: '0 12px',
                  }}
                >
                  <Car size={16} color={T.cyan} />
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">Select a vehicle…</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registration}
                        {v.make ? ` — ${v.make} ${v.model || ''}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>

              <Field label="Dealership">
                <select
                  value={dealershipId}
                  onChange={(e) => setDealershipId(e.target.value)}
                  style={{ ...selectStyle, ...boxedSelect }}
                >
                  <option value="">Not set</option>
                  {dealerships.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </Field>

              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="Quantity" style={{ flex: 1 }}>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Unit price" style={{ flex: 1 }}>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Expected delivery">
                <input
                  type="date"
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                  style={inputStyle}
                />
              </Field>
            </div>

            <button
              onClick={confirmOrder}
              disabled={!canConfirm}
              style={{
                width: '100%',
                marginTop: 20,
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                fontSize: 15,
                fontWeight: 700,
                cursor: canConfirm ? 'pointer' : 'not-allowed',
                color: '#fff',
                background: canConfirm
                  ? `linear-gradient(90deg, ${T.blue}, ${T.cyan})`
                  : T.panelHi,
                opacity: canConfirm ? 1 : 0.6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Check size={18} /> Place order
            </button>
            {!canConfirm && (
              <p
                style={{
                  color: T.dim,
                  fontSize: 12.5,
                  textAlign: 'center',
                  marginTop: 8,
                }}
              >
                Pick a vehicle to place the order.
              </p>
            )}
          </div>
        )}

        {/* STEP 3 — CONFIRMATION */}
        {step === 'done' && placed && (
          <div style={{ padding: 18 }}>
            <div
              style={{
                background: T.panel,
                border: `1px solid ${T.cyan}`,
                borderRadius: 14,
                padding: 22,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: `linear-gradient(90deg, ${T.blue}, ${T.cyan})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                }}
              >
                <Check size={26} color="#fff" />
              </div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Order placed</div>
              <div style={{ color: T.dim, fontSize: 14, marginTop: 6 }}>
                {placed.part_name}
                {placed.quantity > 1 ? ` ×${placed.quantity}` : ''} for{' '}
                <strong style={{ color: T.text }}>
                  {placed._vehicle?.registration}
                </strong>
              </div>

              <div
                style={{
                  textAlign: 'left',
                  marginTop: 18,
                  borderTop: `1px solid ${T.line}`,
                  paddingTop: 14,
                  display: 'grid',
                  gap: 8,
                  fontSize: 13.5,
                }}
              >
                <Row k="Part #" v={placed.part_number || '—'} />
                <Row
                  k="Dealership"
                  v={dealerName(placed.dealership_id) || 'Not set'}
                />
                <Row
                  k="Unit price"
                  v={placed.unit_price != null ? `$${placed.unit_price.toFixed(2)}` : '—'}
                />
                <Row k="Expected" v={placed.expected_date || '—'} />
              </div>
            </div>

            <button onClick={reset} style={{ ...backBtn, marginTop: 18 }}>
              <Plus size={16} /> Order another part
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- small presentational helpers ----
function Field({ label, required, children, style }) {
  return (
    <label style={{ display: 'block', ...style }}>
      <div
        style={{
          fontSize: 12.5,
          color: '#8aa0bd',
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        {label}
        {required && <span style={{ color: '#3b82f6' }}> *</span>}
      </div>
      {children}
    </label>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: '#8aa0bd' }}>{k}</span>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  );
}

const iconBtn = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 2,
  display: 'flex',
};

const backBtn = {
  background: 'transparent',
  border: '1px solid #22304a',
  color: '#8aa0bd',
  borderRadius: 10,
  padding: '9px 12px',
  fontSize: 13,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

const inputStyle = {
  width: '100%',
  background: '#121c2e',
  border: '1px solid #22304a',
  borderRadius: 10,
  padding: '11px 12px',
  color: '#e8eef7',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#e8eef7',
  fontSize: 15,
  padding: '11px 0',
};

const boxedSelect = {
  background: '#121c2e',
  border: '1px solid #22304a',
  borderRadius: 10,
  padding: '11px 12px',
};
