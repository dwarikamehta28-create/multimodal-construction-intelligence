import { useState } from "react";
import { list, postJson, useRun } from "../api.js";
import { Block, Button, Empty, Field, Select, Workspace } from "../components/ui.jsx";

export default function KnowledgePage() {
  const [question, setQuestion] = useState("");
  const [level, setLevel] = useState("site_engineer");
  const state = useRun((q) => postJson("/knowledge", { question: q ?? question, level }));
  const ask = (q) => { setQuestion(q); state.run(q); };

  const form = (
    <>
      <h2>Ask a construction question</h2>
      <Field label="Question"><textarea rows={5} value={question} maxLength={1000} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. How long should slab concrete be cured?" /></Field>
      <Field label="Explain it for a"><Select value={level} onChange={setLevel} options={[["student", "Student"], ["site_engineer", "Site engineer"], ["expert", "Expert"]]} /></Field>
      <Button loading={state.loading} onClick={() => state.run()} disabled={question.trim().length < 3}>Ask</Button>
    </>
  );

  return (
    <Workspace form={form} state={state}
      empty={<Empty title="No question yet">Ask about methods, materials, codes or defects.</Empty>}>
      {(d) => (
        <>
          <article className="card result"><div className="stripe" /><h2>Answer</h2><p className="prewrap">{d.answer}</p>
            {d.caution && <div className="notice warn">{d.caution}</div>}</article>
          <article className="card result">
            <Block title="Key points" items={d.key_points} />
            <Block title="Standards" items={d.standards} />
            {list(d.related_topics).length > 0 && (
              <section className="block"><h3>Related topics</h3>
                <div className="chips">{d.related_topics.map((t) => <button type="button" className="chip" key={t} onClick={() => ask(t)}>{t}</button>)}</div>
              </section>
            )}
          </article>
        </>
      )}
    </Workspace>
  );
}
