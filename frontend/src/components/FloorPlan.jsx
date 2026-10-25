import { list } from "../api.js";

const SHORT = { Bathroom: "Bath", "Passage and utility": "Utility", "Master bedroom": "Master", Bedroom: "Bed", "Open workspace": "Workspace", "Meeting room": "Meeting", "Production hall": "Production" };
const short = (n) => Object.entries(SHORT).reduce((acc, [k, v]) => acc.replace(k, v), n);

const TINTS = ["#E9E4D8", "#DDE3E0", "#E6DDD6", "#DCE1E8", "#E4E6D4", "#E8DADA"];

export default function FloorPlan({ plan }) {
  const rooms = list(plan?.rooms);
  if (!rooms.length) return null;
  const S = 560 / plan.plot_width_ft, pad = 14;
  const W = plan.plot_width_ft * S, H = plan.plot_depth_ft * S;
  return (
    <svg className="plan" viewBox={`0 0 ${W + pad * 2} ${H + pad * 2}`} role="img"
         aria-label={`Schematic floor plan, ${plan.plot_width_ft} by ${plan.plot_depth_ft} feet`}>
      {rooms.map((r, i) => {
        const x = pad + r.x * S, y = pad + r.y * S, w = r.w * S, h = r.d * S;
        const tight = w < 95, label = tight ? short(r.name) : r.name;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={TINTS[i % TINTS.length]} stroke="#2B3138" strokeWidth="2" />
            <text x={x + w / 2} y={y + h / 2 - 2} textAnchor="middle" className="plan-name" style={tight ? { fontSize: 10 } : undefined}>{label}</text>
            {w >= 60 && <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" className="plan-dim">{r.w}′ × {r.d}′</text>}
          </g>
        );
      })}
    </svg>
  );
}
