import { useState } from "react";
import { postForm, useRun } from "../api.js";
import { Block, Button, Empty, Field, ImageDrop, Pill, Workspace } from "../components/ui.jsx";

const URGENCY = { monitor: "Monitor", repair_soon: "Repair soon", immediate: "Act immediately", consult_engineer: "Call a structural engineer" };

export default function CrackPage() {
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState("");
  const [element, setElement] = useState("");
  const state = useRun(() => postForm("/crack", { notes, element }, files));

  const form = (
    <>
      <h2>Crack photos</h2>
      <ImageDrop files={files} setFiles={setFiles} />
      <p className="field-hint">Tip: place a coin or ruler next to the crack so width can be estimated.</p>
      <Field label="Building element"><input value={element} maxLength={120} onChange={(e) => setElement(e.target.value)} placeholder="e.g. external wall, beam, slab soffit" /></Field>
      <Field label="Notes" hint="When it appeared, whether it is growing, any water seepage.">
        <textarea rows={4} value={notes} maxLength={3000} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <Button loading={state.loading} onClick={() => state.run()} disabled={!files.length && !notes.trim()}>Analyse crack</Button>
    </>
  );

  return (
    <Workspace form={form} state={state}
      empty={<Empty title="No crack analysis yet">Add a close-up photo to get the crack type, severity, likely causes and repair steps.</Empty>}>
      {(d) => (
        <>
          <article className={`card result risk-${d.severity === "none" ? "low" : d.severity}`}>
            <div className="stripe" />
            <div className="row between"><h2>Crack analysis</h2><Pill level={d.severity === "none" ? "low" : d.severity}>{d.severity} severity</Pill></div>
            <p>{d.summary}</p>
            <dl className="facts">
              <div><dt>Crack found</dt><dd>{d.crack_detected ? "Yes" : "No"}</dd></div>
              <div><dt>Type</dt><dd>{d.crack_type.replace("_", " ")}</dd></div>
              <div><dt>Width</dt><dd>{d.estimated_width_mm != null ? `≈ ${d.estimated_width_mm} mm` : "Not measurable"}</dd></div>
              <div><dt>Structural concern</dt><dd>{d.structural_concern ? "Possible" : "Unlikely"}</dd></div>
              <div><dt>Next step</dt><dd>{URGENCY[d.urgency]}</dd></div>
              <div><dt>Confidence</dt><dd>{Math.round(d.confidence * 100)}%</dd></div>
            </dl>
            {!d.image_quality?.usable && <div className="notice warn">Image problem: {d.image_quality?.notes}</div>}
          </article>
          <article className="card result">
            <Block title="Probable causes" items={d.probable_causes} />
            <Block title="Recommended actions" items={d.recommended_actions} ordered />
            {d.monitoring_advice && <section className="block"><h3>Monitoring</h3><p>{d.monitoring_advice}</p></section>}
          </article>
        </>
      )}
    </Workspace>
  );
}
