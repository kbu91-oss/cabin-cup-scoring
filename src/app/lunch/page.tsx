'use client';

import { useState } from 'react';
import { useStore, type LunchLineItem, type LunchOrder } from '@/lib/store';
import { VOTERS, type Voter } from '@/lib/teams';
import {
  MENU_BY_ID,
  MENU_CATEGORIES,
  BREADS,
  CHEESES,
  VEGETABLES,
  CONDIMENTS,
  itemsByCategory,
  priceFor,
  type MenuItem,
  type MenuCategoryId,
  type SubSize,
} from '@/lib/menu';
import { Modal } from '@/components/Modal';

type ViewMode = 'me' | 'everyone';

function newLineId(): string {
  return `line-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function summarizeItem(item: LunchLineItem): string {
  const menu = MENU_BY_ID[item.itemId];
  if (!menu) return 'Unknown item';
  let s = menu.name;
  if (item.size) s = `${item.size}" ${s}`;
  return s;
}

export default function LunchPage() {
  const { state, patch } = useStore();
  const [mode, setMode] = useState<ViewMode>('me');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<LunchLineItem | null>(null);

  const selectedVoter = VOTERS.find(v => v.id === selectedPlayerId) ?? null;
  const myOrder = state.lunchOrders.find(o => o.playerId === selectedPlayerId) ?? null;

  function upsertItem(updated: LunchLineItem) {
    if (!selectedPlayerId) return;
    const existing = state.lunchOrders.find(o => o.playerId === selectedPlayerId);
    let nextOrders: LunchOrder[];
    if (existing) {
      const has = existing.items.some(i => i.lineId === updated.lineId);
      const nextItems = has
        ? existing.items.map(i => (i.lineId === updated.lineId ? updated : i))
        : [...existing.items, updated];
      nextOrders = state.lunchOrders.map(o =>
        o.playerId === selectedPlayerId
          ? { ...o, items: nextItems, timestamp: Date.now() }
          : o
      );
    } else {
      nextOrders = [
        ...state.lunchOrders,
        { playerId: selectedPlayerId, items: [updated], timestamp: Date.now() },
      ];
    }
    patch({ lunchOrders: nextOrders });
  }

  function removeItem(lineId: string) {
    if (!selectedPlayerId) return;
    const next = state.lunchOrders
      .map(o =>
        o.playerId === selectedPlayerId
          ? { ...o, items: o.items.filter(i => i.lineId !== lineId), timestamp: Date.now() }
          : o
      )
      .filter(o => o.items.length > 0); // drop empty orders
    patch({ lunchOrders: next });
  }

  return (
    <>
      <section className="text-center border-b border-border pb-6 mb-2">
        <h1 className="text-3xl font-black tracking-tight">Friday Lunch Order</h1>
        <p className="text-sm text-text-muted mt-1.5 font-medium">
          ADK Corner Store · 188 Newman Rd, Lake Placid · <a href="tel:15185231689" className="text-navy hover:underline">(518) 523-1689</a>
        </p>
      </section>

      {/* Tabs */}
      <div className="flex justify-center gap-1 bg-bg border border-border rounded-full p-1 max-w-md mx-auto">
        <TabButton active={mode === 'me'} onClick={() => setMode('me')}>My Order</TabButton>
        <TabButton active={mode === 'everyone'} onClick={() => setMode('everyone')}>Everyone&apos;s Orders</TabButton>
      </div>

      {mode === 'me' ? (
        <div className="flex flex-col gap-4 max-w-2xl w-full mx-auto">
          <VoterPicker
            voters={VOTERS}
            selectedId={selectedPlayerId}
            onSelect={setSelectedPlayerId}
            orders={state.lunchOrders}
          />
          {selectedVoter ? (
            <MyOrderCard
              voter={selectedVoter}
              order={myOrder}
              onAdd={() => { setEditingLine(null); setAddOpen(true); }}
              onEdit={(line) => { setEditingLine(line); setAddOpen(true); }}
              onRemove={removeItem}
            />
          ) : (
            <div className="bg-surface border border-border rounded-2xl p-6 text-center text-sm text-text-muted">
              Tap your name above to start your order.
            </div>
          )}
        </div>
      ) : (
        <EveryoneView orders={state.lunchOrders} />
      )}

      {addOpen && selectedVoter ? (
        <AddItemModal
          key={editingLine?.lineId ?? 'new'}
          onClose={() => { setAddOpen(false); setEditingLine(null); }}
          editing={editingLine}
          onSave={(line) => {
            upsertItem(line);
            setAddOpen(false);
            setEditingLine(null);
          }}
        />
      ) : null}
    </>
  );
}

// -- Sub-components --

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-2 rounded-full text-[13px] font-bold transition ${
        active ? 'bg-navy text-gold shadow-sm' : 'text-text-muted hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}

function VoterPicker({
  voters, selectedId, onSelect, orders,
}: {
  voters: Voter[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  orders: LunchOrder[];
}) {
  const hasOrder = (id: string) => orders.some(o => o.playerId === id && o.items.length > 0);
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
      <div className="text-[11px] font-bold tracking-wider text-text-muted mb-3">
        WHO&apos;S ORDERING?
      </div>
      <div className="flex flex-wrap gap-1.5">
        {voters.map(v => {
          const selected = v.id === selectedId;
          const ordered = hasOrder(v.id);
          const base = selected
            ? v.team === 'harvey' ? 'bg-navy text-white border-navy' : 'bg-gold text-navy border-gold-dark'
            : 'bg-surface text-text border-border hover:bg-c-gray-100';
          return (
            <button
              key={v.id}
              onClick={() => onSelect(v.id)}
              className={`px-3 py-2 rounded-full border text-[13px] font-semibold inline-flex items-center gap-1.5 transition ${base}`}
            >
              {v.display}
              {ordered ? <span className="text-[11px]">✓</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MyOrderCard({
  voter, order, onAdd, onEdit, onRemove,
}: {
  voter: Voter;
  order: LunchOrder | null;
  onAdd: () => void;
  onEdit: (line: LunchLineItem) => void;
  onRemove: (lineId: string) => void;
}) {
  const items = order?.items ?? [];
  const total = items.reduce((sum, it) => sum + (MENU_BY_ID[it.itemId] ? priceFor(MENU_BY_ID[it.itemId], it.size) : 0), 0);
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold">{voter.display}&apos;s order</div>
          <div className="text-xs text-text-muted">{items.length} item{items.length === 1 ? '' : 's'} · ${total.toFixed(2)}</div>
        </div>
        <button
          onClick={onAdd}
          className="bg-navy text-gold px-4 py-2 rounded-full text-[13px] font-bold hover:opacity-85"
        >
          + Add item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-bg rounded-xl py-5 text-center text-[13px] text-text-soft italic">
          No items yet. Tap &ldquo;Add item&rdquo; to get started.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map(line => <OrderLine key={line.lineId} line={line} onEdit={onEdit} onRemove={onRemove} />)}
        </ul>
      )}
    </div>
  );
}

function OrderLine({
  line, onEdit, onRemove,
}: {
  line: LunchLineItem;
  onEdit: (line: LunchLineItem) => void;
  onRemove: (lineId: string) => void;
}) {
  const menu = MENU_BY_ID[line.itemId];
  if (!menu) return null;
  const price = priceFor(menu, line.size);
  return (
    <li className="bg-bg rounded-xl p-3 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold">{summarizeItem(line)}</div>
        {menu.customizable ? (
          <div className="text-xs text-text-muted mt-0.5 flex flex-wrap gap-x-1.5 gap-y-0.5">
            {line.bread ? <span>{line.bread}</span> : null}
            {line.cheese && line.cheese !== 'No Cheese' ? <span>· {line.cheese}</span> : null}
            {line.vegetables && line.vegetables.length > 0
              ? <span>· {line.vegetables.join(', ')}</span> : null}
            {line.condiments && line.condiments.length > 0
              ? <span>· {line.condiments.join(', ')}</span> : null}
          </div>
        ) : menu.description ? (
          <div className="text-xs text-text-muted mt-0.5 leading-snug">{menu.description}</div>
        ) : null}
        {line.notes ? (
          <div className="text-xs text-navy mt-1 italic">&ldquo;{line.notes}&rdquo;</div>
        ) : null}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="text-xs font-bold text-text">${price.toFixed(2)}</div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(line)} className="text-xs text-navy font-semibold hover:underline">Edit</button>
          <span className="text-text-soft">·</span>
          <button onClick={() => onRemove(line.lineId)} className="text-xs text-red-600 font-semibold hover:underline">Remove</button>
        </div>
      </div>
    </li>
  );
}

// -- Everyone view --

function EveryoneView({ orders }: { orders: LunchOrder[] }) {
  const playersWithOrders = orders.filter(o => o.items.length > 0);
  const grandTotal = playersWithOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, it) => s + (MENU_BY_ID[it.itemId] ? priceFor(MENU_BY_ID[it.itemId], it.size) : 0), 0),
    0
  );

  // Tally for call-in: group identical orders together.
  // (React 19 compiler memoizes automatically — no useMemo needed.)
  const tally = (() => {
    const counts = new Map<string, { count: number; sample: LunchLineItem }>();
    playersWithOrders.forEach(o => {
      o.items.forEach(it => {
        const key = JSON.stringify({
          itemId: it.itemId,
          size: it.size,
          bread: it.bread,
          cheese: it.cheese,
          vegetables: it.vegetables?.slice().sort(),
          condiments: it.condiments?.slice().sort(),
          notes: it.notes,
        });
        const prev = counts.get(key);
        counts.set(key, { count: (prev?.count ?? 0) + 1, sample: it });
      });
    });
    return Array.from(counts.values()).sort((a, b) => b.count - a.count);
  })();

  function buildCallInScript(): string {
    const lines: string[] = [];
    lines.push('Cabin Cup lunch order — for pickup');
    lines.push('');
    tally.forEach(({ count, sample }) => {
      const menu = MENU_BY_ID[sample.itemId];
      if (!menu) return;
      let line = `${count}x ${summarizeItem(sample)}`;
      if (menu.customizable) {
        const parts: string[] = [];
        if (sample.bread)   parts.push(`bread: ${sample.bread}`);
        if (sample.cheese)  parts.push(`cheese: ${sample.cheese}`);
        if (sample.vegetables && sample.vegetables.length > 0) parts.push(`veg: ${sample.vegetables.join(', ')}`);
        if (sample.condiments && sample.condiments.length > 0) parts.push(`sauce: ${sample.condiments.join(', ')}`);
        if (parts.length > 0) line += `\n      ${parts.join(' · ')}`;
      }
      if (sample.notes) line += `\n      note: ${sample.notes}`;
      lines.push(line);
    });
    lines.push('');
    lines.push(`Total: ${playersWithOrders.reduce((n, o) => n + o.items.length, 0)} items · $${grandTotal.toFixed(2)}`);
    return lines.join('\n');
  }

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(buildCallInScript());
      alert('Call-in script copied to clipboard.');
    } catch {
      alert('Could not copy. Long-press to select the script manually.');
    }
  }

  if (playersWithOrders.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 text-center max-w-2xl w-full mx-auto">
        <div className="text-sm text-text-muted">No orders yet.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl w-full mx-auto">
      {/* Aggregated tally + call-in */}
      <div className="bg-surface border border-border border-t-4 border-t-gold rounded-2xl p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-text-muted">CALL-IN SCRIPT</div>
            <h2 className="text-lg font-black -tracking-[0.3px]">
              {tally.reduce((n, t) => n + t.count, 0)} items · ${grandTotal.toFixed(2)}
            </h2>
          </div>
          <button
            onClick={copyScript}
            className="bg-navy text-gold px-4 py-2 rounded-full text-[13px] font-bold hover:opacity-85"
          >
            📋 Copy
          </button>
        </div>
        <pre className="bg-bg rounded-xl p-4 text-[13px] text-text whitespace-pre-wrap font-mono leading-relaxed border border-border max-h-96 overflow-y-auto">
{buildCallInScript()}
        </pre>
        <div className="text-[11px] text-text-soft mt-2">
          Identical orders are grouped. Per-player details are below.
        </div>
      </div>

      {/* Per-player */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {playersWithOrders.map(o => {
          const voter = VOTERS.find(v => v.id === o.playerId);
          if (!voter) return null;
          const playerTotal = o.items.reduce((s, it) => s + (MENU_BY_ID[it.itemId] ? priceFor(MENU_BY_ID[it.itemId], it.size) : 0), 0);
          return (
            <div key={o.playerId} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${voter.team === 'harvey' ? 'bg-navy' : 'bg-gold'}`} />
                  {voter.display}
                </div>
                <div className="text-xs text-text-muted">${playerTotal.toFixed(2)}</div>
              </div>
              <ul className="flex flex-col gap-1.5">
                {o.items.map(it => (
                  <li key={it.lineId} className="text-[13px]">
                    <div className="font-semibold">{summarizeItem(it)}</div>
                    {MENU_BY_ID[it.itemId]?.customizable ? (
                      <div className="text-[11px] text-text-muted">
                        {[it.bread, it.cheese !== 'No Cheese' ? it.cheese : null,
                          it.vegetables?.join(', '), it.condiments?.join(', ')]
                          .filter(Boolean).join(' · ')}
                      </div>
                    ) : null}
                    {it.notes ? <div className="text-[11px] text-navy italic">&ldquo;{it.notes}&rdquo;</div> : null}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- Add / Edit item modal --

function AddItemModal({
  onClose, onSave, editing,
}: {
  onClose: () => void;
  onSave: (line: LunchLineItem) => void;
  editing: LunchLineItem | null;
}) {
  // Lazy init pulls editing target on mount — parent uses a `key` to remount on switch.
  const [category, setCategory] = useState<MenuCategoryId>(
    () => (editing ? MENU_BY_ID[editing.itemId]?.category ?? 'subs' : 'subs')
  );
  const [pickedId, setPickedId] = useState<string | null>(() => editing?.itemId ?? null);
  const [size, setSize] = useState<SubSize>(() => editing?.size ?? '6');
  const [bread, setBread] = useState<string>(() => editing?.bread ?? BREADS[0]);
  const [cheese, setCheese] = useState<string>(() => editing?.cheese ?? CHEESES[0]);
  const [vegs, setVegs] = useState<string[]>(() => editing?.vegetables ?? []);
  const [conds, setConds] = useState<string[]>(() => editing?.condiments ?? []);
  const [notes, setNotes] = useState(() => editing?.notes ?? '');

  const picked = pickedId ? MENU_BY_ID[pickedId] : null;

  function toggleVeg(v: string) {
    setVegs(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  }
  function toggleCond(c: string) {
    setConds(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  function save() {
    if (!picked) return;
    const line: LunchLineItem = {
      lineId: editing?.lineId ?? newLineId(),
      itemId: picked.id,
      size: picked.sizes ? size : undefined,
      bread: picked.customizable ? bread : undefined,
      cheese: picked.customizable ? cheese : undefined,
      vegetables: picked.customizable ? vegs : undefined,
      condiments: picked.customizable ? conds : undefined,
      notes: notes.trim() || undefined,
    };
    onSave(line);
  }

  return (
    <Modal open={true} onClose={onClose} maxWidth="max-w-lg">
      <h3 className="text-lg font-bold mb-1">{editing ? 'Edit item' : 'Add an item'}</h3>
      <p className="text-xs text-text-muted mb-3">From ADK Corner Store</p>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1 mb-2">
        {MENU_CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => { setCategory(c.id); setPickedId(null); }}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition ${
              c.id === category ? 'bg-navy text-gold' : 'bg-bg text-text-muted hover:text-text border border-border'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Item picker */}
      <div className="bg-bg rounded-xl p-2 mb-3 max-h-60 overflow-y-auto">
        {itemsByCategory(category).map(item => (
          <ItemPickerRow
            key={item.id}
            item={item}
            selected={pickedId === item.id}
            onSelect={() => setPickedId(item.id)}
          />
        ))}
      </div>

      {/* Customization */}
      {picked && picked.sizes ? (
        <div className="mb-3">
          <Label>SIZE</Label>
          <div className="flex gap-1.5">
            {picked.sizes.map(s => (
              <button
                key={s.id}
                onClick={() => setSize(s.id)}
                className={`px-3 py-2 rounded-full border text-[13px] font-semibold ${
                  size === s.id ? 'bg-navy text-white border-navy' : 'bg-surface text-text border-border'
                }`}
              >
                {s.label} · ${s.price.toFixed(2)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {picked && picked.customizable ? (
        <>
          <SelectRow label="BREAD" options={BREADS} value={bread} onChange={setBread} />
          <SelectRow label="CHEESE" options={CHEESES} value={cheese} onChange={setCheese} />
          <ChipRow label="VEGETABLES" options={VEGETABLES} values={vegs} toggle={toggleVeg} />
          <ChipRow label="CONDIMENTS" options={CONDIMENTS} values={conds} toggle={toggleCond} />
        </>
      ) : null}

      {picked ? (
        <div className="mb-4">
          <Label>NOTES (optional)</Label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. light mayo, extra crispy, sub fries for chips"
            className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-bg outline-none focus:border-navy"
          />
        </div>
      ) : null}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <button onClick={onClose} className="bg-c-gray-200 text-text px-4 py-2.5 rounded-full text-[13px] font-bold hover:opacity-85">
          Cancel
        </button>
        <button
          onClick={save}
          disabled={!picked}
          className="bg-navy text-gold px-4 py-2.5 rounded-full text-[13px] font-bold hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {editing ? 'Save changes' : 'Add to order'}
        </button>
      </div>
    </Modal>
  );
}

function ItemPickerRow({ item, selected, onSelect }: { item: MenuItem; selected: boolean; onSelect: () => void }) {
  const priceLabel = item.sizes
    ? `${item.sizes[0].price.toFixed(2)} / ${item.sizes[item.sizes.length - 1].price.toFixed(2)}`
    : item.price?.toFixed(2);
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-2 transition ${
        selected ? 'bg-navy text-white' : 'hover:bg-c-gray-100'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{item.name}</div>
        {item.description ? (
          <div className={`text-[11px] leading-snug ${selected ? 'text-white/80' : 'text-text-muted'}`}>{item.description}</div>
        ) : null}
      </div>
      <div className={`text-xs font-bold whitespace-nowrap ${selected ? 'text-white' : 'text-text-muted'}`}>${priceLabel}</div>
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold tracking-wider text-text-muted mb-1.5">{children}</div>;
}

function SelectRow<T extends string>({
  label, options, value, onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mb-3">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-bg outline-none focus:border-navy"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function ChipRow({
  label, options, values, toggle,
}: {
  label: string;
  options: readonly string[];
  values: string[];
  toggle: (v: string) => void;
}) {
  return (
    <div className="mb-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1">
        {options.map(opt => {
          const on = values.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`px-2.5 py-1.5 rounded-full border text-[12px] font-semibold transition ${
                on ? 'bg-navy text-white border-navy' : 'bg-surface text-text border-border hover:bg-c-gray-100'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
