import { useState } from "react";
import { list, postForm, useRun } from "../api.js";
import { Block, Button, Empty, Field, ImageDrop, Pill, Select, Workspace } from "../components/ui.jsx";

const STAGES = [["foundation", "Foundation"], ["structure", "Structure (columns, beams, slabs)"], ["masonry", "Masonry"], ["finishing", "Finishing"]];

export default function AssistantPage() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [stage, setStage] = useState("structure");
  const state = useRun(() => postForm("/assistant", { message, stage }, files));

  const form = (
    <>
      <h2>Today on site</h2>
      <Field label="Current stage"><Select value={stage} onChange={setStage} options={STAGES} /></Field>
      <Field label="Question or update"><textarea rows={5} value={message} maxLength={2000} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. We are pouring the first-floor slab tomorrow. What should I check tonight?" /></Field>
      <ImageDrop files={files} setFiles={setFiles} max={2} />
      <Button loading={state.loading} onClick={() => state.run()} disabled={!files.length && !message.trim()}>Ask assistant</Button>
    </>
  );

  return (
    <Workspace form={form} state={state}
      empty={<Empty title="Nothing asked yet">Ask about today's work, or upload a photo for a quick review.</Empty>}>
      {(d) => (
        <>
          <article className="card result"><div className="stripe" /><h2>Answer</h2><p className="prewrap">{d.answer}</p></article>
          <article className="card result">
            <h3>Actions</h3>
            {list(d.action_items).map((a, i) => <div className="item row between" key={i}><span>{a.task}</span><Pill level={a.priority === "high" ? "high" : a.priority === "low" ? "low" : "medium"}>{a.priority}</Pill></div>)}
            <Block title="Checklist" items={d.checklist} />
            <Block title="Red flags" items={d.flags} />
          </article>
          {list(d.follow_up_questions).length > 0 && (
            <article className="card result">
              <h3>Tell me more</h3>
              <ul className="plain">{d.follow_up_questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
            </article>
          )}
        </>
      )}
    </Workspace>
  );
}
