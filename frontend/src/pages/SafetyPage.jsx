import { useState } from "react";
import { postForm, useRun, list } from "../api.js";
import { Block, Button, Empty, Field, ImageDrop, Meter, Pill, Workspace } from "../components/ui.jsx";

export default function SafetyPage() {
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState("");
  const [ctx, setCtx] = useState("");
  const state = useRun(() => postForm("/safety", { notes, site_context: ctx }, files));

  const form = (
    <>
      <h2>Site photos</h2>
      <ImageDrop files={files} setFiles={setFiles} />
      <Field label="What should we know?" hint="Optional if you add a photo. Work being done, area, number of workers.">
        <textarea rows={4} value={notes} maxLength={3000} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <Field label="Site context"><input value={ctx} maxLength={500} onChange={(e) => setCtx(e.target.value)} placeholder="e.g. G+2 residential, slab casting" /></Field>
      <Button loading={state.loading} onClick={() => state.run()} disabled={!files.length && !notes.trim()}>Check site safety</Button>
    </>
  );

  return (
    <Workspace form={form} state={state}
      empty={<Empty title="No safety report yet">Add a site photo or a short description to find hazards and missing PPE.</Empty>}>
      {(d) => (
        <>
          <article className={`card result risk-${d.overall_risk}`}>
            <div className="stripe" />
            <div className="row between">
              <h2>Site safety report</h2>
              <Pill level={d.overall_risk}>{d.overall_risk} risk</Pill>
            </div>
            <p>{d.summary}</p>
            <Meter value={d.safety_score} label="Safety score" />
            <p className="muted">{d.workers_detected} worker(s) seen · confidence {Math.round(d.confidence * 100)}%</p>
            {!d.image_quality?.usable && <div className="notice warn">Image problem: {d.image_quality?.notes}</div>}
          </article>

          <article className="card result">
            <h3>Hazards</h3>
            {list(d.hazards).length === 0 && <p className="muted">No hazards identified.</p>}
            {list(d.hazards).map((h, i) => (
              <div className="item" key={i}>
                <div className="row between"><strong>{h.type}</strong><Pill level={h.severity} /></div>
                <p>{h.description}</p>
                {h.location_hint && <p className="muted">Where: {h.location_hint}</p>}
                {h.corrective_action && <p><b>Fix:</b> {h.corrective_action}</p>}
              </div>
            ))}
          </article>

          <article className="card result">
            <h3>PPE check</h3>
            <table>
              <thead><tr><th>Item</th><th>Status</th><th>Note</th></tr></thead>
              <tbody>
                {list(d.ppe_findings).map((p, i) => (
                  <tr key={i}><td>{p.item}</td>
                    <td><Pill level={p.status === "compliant" ? "low" : p.status === "missing" ? "high" : "medium"}>{p.status}</Pill></td>
                    <td>{p.note}</td></tr>
                ))}
              </tbody>
            </table>
          </article>
          <article className="card result"><Block title="Do this now" items={d.immediate_actions} ordered /></article>
        </>
      )}
    </Workspace>
  );
}
