import { useState } from "react";
import { inr, list, postJson, useRun } from "../api.js";
import { Button, Empty, Field, Pill, Select, Workspace } from "../components/ui.jsx";

const AMENITIES = ["Lift", "Parking", "Power backup", "Security", "Garden", "Gym", "Clubhouse", "Water supply"];
const TYPES = [["apartment", "Apartment"], ["independent_house", "Independent house"], ["villa", "Villa"], ["plot", "Plot"], ["commercial", "Commercial"]];

export default function ValuationPage() {
  const [f, setF] = useState({ city: "Indore", locality: "", property_type: "apartment", area_sqft: 1200, bedrooms: 2, age_years: 5, condition: "good", amenities: [], notes: "" });
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const num = (k) => (e) => set(k)(e.target.value === "" ? "" : Number(e.target.value));
  const toggle = (a) => set("amenities")(f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a]);
  const state = useRun(() => postJson("/valuation", { ...f, area_sqft: Number(f.area_sqft) }));

  const form = (
    <>
      <h2>Property details</h2>
      <div className="grid2">
        <Field label="City"><input value={f.city} onChange={(e) => set("city")(e.target.value)} /></Field>
        <Field label="Locality"><input value={f.locality} onChange={(e) => set("locality")(e.target.value)} placeholder="e.g. Vijay Nagar" /></Field>
      </div>
      <Field label="Property type"><Select value={f.property_type} onChange={set("property_type")} options={TYPES} /></Field>
      <div className="grid2">
        <Field label="Area (sq ft)"><input type="number" min="51" value={f.area_sqft} onChange={num("area_sqft")} /></Field>
        <Field label="Bedrooms"><input type="number" min="0" value={f.bedrooms} onChange={num("bedrooms")} /></Field>
        <Field label="Age (years)"><input type="number" min="0" value={f.age_years} onChange={num("age_years")} /></Field>
        <Field label="Condition"><Select value={f.condition} onChange={set("condition")} options={["poor", "fair", "good", "excellent"]} /></Field>
      </div>
      <fieldset className="chips"><legend>Amenities</legend>
        {AMENITIES.map((a) => (
          <label key={a} className={f.amenities.includes(a) ? "chip on" : "chip"}>
            <input type="checkbox" checked={f.amenities.includes(a)} onChange={() => toggle(a)} />{a}
          </label>
        ))}
      </fieldset>
      <Field label="Notes"><textarea rows={3} value={f.notes} maxLength={1500} onChange={(e) => set("notes")(e.target.value)} placeholder="Road width, facing, nearby metro…" /></Field>
      <Button loading={state.loading} onClick={() => state.run()}>Estimate value</Button>
    </>
  );

  return (
    <Workspace form={form} state={state}
      empty={<Empty title="No valuation yet">Enter property details for an indicative price and range.</Empty>}>
      {(d) => (
        <>
          <article className="card result">
            <div className="stripe" />
            <h2>Estimated value</h2>
            <p className="value">{inr(d.estimated_value_inr)}</p>
            <p>Likely range {inr(d.low_inr)} to {inr(d.high_inr)} · {inr(d.price_per_sqft_inr)} per sq ft</p>
            <p className="muted">Baseline {inr(d.baseline_rate_inr)}/sq ft, adjusted {d.adjustment_pct > 0 ? "+" : ""}{d.adjustment_pct}% · confidence {Math.round(d.confidence * 100)}%</p>
          </article>
          <article className="card result">
            <h3>What moves the price</h3>
            {list(d.factors).map((x, i) => (
              <div className="item" key={i}>
                <div className="row between"><strong>{x.name}</strong><Pill level={x.impact === "positive" ? "low" : x.impact === "negative" ? "high" : "medium"}>{x.impact}</Pill></div>
                <p>{x.note}</p>
              </div>
            ))}
            {d.comparable_notes && <p className="muted">{d.comparable_notes}</p>}
          </article>
          <div className="notice warn">{d.disclaimer}</div>
        </>
      )}
    </Workspace>
  );
}
