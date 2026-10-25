import { useEffect, useState } from "react";
import AssistantPage from "./pages/AssistantPage.jsx";
import CrackPage from "./pages/CrackPage.jsx";
import KnowledgePage from "./pages/KnowledgePage.jsx";
import PlanningPage from "./pages/PlanningPage.jsx";
import SafetyPage from "./pages/SafetyPage.jsx";
import ValuationPage from "./pages/ValuationPage.jsx";
import WeatherPage from "./pages/WeatherPage.jsx";

const MODULES = [
  { id: "safety", label: "Site safety", blurb: "Spot hazards and missing PPE from site photos.", Page: SafetyPage },
  { id: "crack", label: "Crack analysis", blurb: "Classify cracks, judge severity and plan repairs.", Page: CrackPage },
  { id: "planning", label: "Project planning", blurb: "Materials, cost, schedule and a concept floor plan.", Page: PlanningPage },
  { id: "valuation", label: "Property valuation", blurb: "Indicative value and price range for a property.", Page: ValuationPage },
  { id: "assistant", label: "Daily assistant", blurb: "Stage-aware checks and answers for today's work.", Page: AssistantPage },
  { id: "weather", label: "Weather advisory", blurb: "Which days suit your planned work.", Page: WeatherPage },
  { id: "knowledge", label: "Knowledge", blurb: "Plain answers on methods, materials and codes.", Page: KnowledgePage },
];

export default function App() {
  const initial = MODULES.find((m) => m.id === window.location.hash.slice(1))?.id ?? "safety";
  const [active, setActive] = useState(initial);
  const [mode, setMode] = useState(null);
  const current = MODULES.find((m) => m.id === active);

  useEffect(() => { window.location.hash = active; }, [active]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE ?? ""}/api/health`).then((r) => r.json()).then((j) => setMode(j.mode)).catch(() => setMode("offline"));
  }, []);

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand"><div className="stripe" /><h1>SiteSense</h1><p>Construction intelligence</p></div>
        <nav aria-label="Modules">
          {MODULES.map((m) => (
            <button key={m.id} className={m.id === active ? "nav on" : "nav"} onClick={() => setActive(m.id)} aria-current={m.id === active ? "page" : undefined}>
              {m.label}
            </button>
          ))}
        </nav>
        <div className={`status status-${mode ?? "wait"}`}>
          {mode === "live" && "AI connected"}
          {mode === "demo" && "Demo mode (sample data)"}
          {mode === "offline" && "Backend not reachable"}
          {mode === null && "Checking server…"}
        </div>
      </aside>
      <main className="main">
        <header className="page-head"><h2>{current.label}</h2><p>{current.blurb}</p></header>
        <current.Page key={current.id} />
      </main>
    </div>
  );
}
