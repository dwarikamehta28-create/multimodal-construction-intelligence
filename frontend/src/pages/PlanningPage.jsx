import { useState } from "react";
import { inr, list, postJson, useRun } from "../api.js";
import FloorPlan from "../components/FloorPlan.jsx";
import Gantt from "../components/Gantt.jsx";
import { Block, Button, Empty, Field, Select, Workspace } from "../components/ui.jsx";

export default function PlanningPage() {
  const [f, setF] = useState({ project_type: "residential", built_up_area_sqft: 2400, floors: 2, quality: "standard", city: "Indore", bedrooms: 3, bathrooms: 2, notes: "" });
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const num = (k) => (e) => set(k)(e.target.value === "" ? "" : Number(e.target.value));
  const state = useRun(() => postJson("/planning", { ...f, built_up_area_sqft: Number(f.built_up_area_sqft) }));

  const form = (
    <>
      <h2>Project details</h2>
      <Field label="Project type"><Select value={f.project_type} onChange={set("project_type")} options={["residential", "commercial", "industrial"]} /></Field>
      <div className="grid2">
        <Field label="Total built-up area (sq ft)"><input type="number" min="101" value={f.built_up_area_sqft} onChange={num("built_up_area_sqft")} /></Field>
        <Field label="Floors"><input type="number" min="1" max="40" value={f.floors} onChange={num("floors")} /></Field>
        <Field label="Bedrooms"><input type="number" min="0" max="12" value={f.bedrooms} onChange={num("bedrooms")} disabled={f.project_type !== "residential"} /></Field>
        <Field label="Bathrooms"><input type="number" min="0" max="12" value={f.bathrooms} onChange={num("bathrooms")} disabled={f.project_type !== "residential"} /></Field>
      </div>
      <Field label="Quality"><Select value={f.quality} onChange={set("quality")} options={["economy", "standard", "premium", "luxury"]} /></Field>
      <Field label="City" hint="Used to adjust rates."><input value={f.city} onChange={(e) => set("city")(e.target.value)} /></Field>
      <Field label="Notes"><textarea rows={3} value={f.notes} maxLength={2000} onChange={(e) => set("notes")(e.target.value)} placeholder="Basement, soil issues, deadline…" /></Field>
      <Button loading={state.loading} onClick={() => state.run()}>Create plan</Button>
    </>
  );

  return (
    <Workspace form={form} state={state}
      empty={<Empty title="No plan yet">Enter project details to get material quantities, a cost estimate, a schedule and a schematic floor plan.</Empty>}>
      {(d) => (
        <>
          <article className="card result">
            <div className="stripe" />
            <h2>Plan summary</h2>
            <p>{d.summary}</p>
            <dl className="facts">
              <div><dt>Estimated cost</dt><dd className="big">{inr(d.cost.total_inr)}</dd></div>
              <div><dt>Per sq ft</dt><dd>{inr(d.cost.per_sqft_inr)}</dd></div>
              <div><dt>Duration</dt><dd>{d.total_weeks} weeks</dd></div>
              <div><dt>Contingency (5%)</dt><dd>{inr(d.cost.contingency_inr)}</dd></div>
            </dl>
          </article>

          <article className="card result">
            <h3>Where the money goes</h3>
            {list(d.cost.items).map((c) => (
              <div className="bar-row" key={c.category}>
                <span>{c.category}</span>
                <div className="bar"><div style={{ width: `${c.share_pct}%` }} /></div>
                <b>{inr(c.amount_inr)}</b>
              </div>
            ))}
          </article>

          <article className="card result">
            <h3>Materials (incl. 5% wastage)</h3>
            <table><thead><tr><th>Material</th><th className="num">Quantity</th><th>Unit</th></tr></thead>
              <tbody>{list(d.materials).map((m) => <tr key={m.name}><td>{m.name}</td><td className="num">{m.quantity.toLocaleString("en-IN")}</td><td>{m.unit}</td></tr>)}</tbody></table>
          </article>

          <article className="card result">
            <h3>Schematic floor plan (one floor)</h3>
            <FloorPlan plan={d.floor_plan} />
            <p className="muted">Concept layout for discussion only. It is not an architectural drawing.</p>
          </article>

          <article className="card result">
            <h3>Schedule</h3>
            <Gantt tasks={d.schedule} totalWeeks={d.total_weeks} />
          </article>

          <article className="card result">
            <Block title="Key risks" items={d.risks} />
            <Block title="Assumptions" items={d.assumptions} />
          </article>
        </>
      )}
    </Workspace>
  );
}
