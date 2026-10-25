import { useEffect, useRef, useState } from "react";
import { list } from "../api.js";

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => {
        const [v, l] = Array.isArray(o) ? o : [o, o];
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  );
}

export function Button({ loading, children, ...rest }) {
  return (
    <button className="btn" disabled={loading} {...rest}>
      {loading ? "Working…" : children}
    </button>
  );
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return <div className="error" role="alert">{message}</div>;
}

export function Pill({ level, children }) {
  return <span className={`pill pill-${level}`}>{children ?? level}</span>;
}

export function Meter({ value, label }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const tone = v >= 75 ? "low" : v >= 50 ? "medium" : v >= 30 ? "high" : "critical";
  return (
    <div className="meter" role="img" aria-label={`${label}: ${v} out of 100`}>
      <div className="meter-head"><span>{label}</span><strong>{v}/100</strong></div>
      <div className="meter-track"><div className={`meter-fill tone-${tone}`} style={{ width: `${v}%` }} /></div>
    </div>
  );
}

export function Block({ title, items, ordered }) {
  const rows = list(items);
  if (!rows.length) return null;
  const Tag = ordered ? "ol" : "ul";
  return (
    <section className="block">
      <h3>{title}</h3>
      <Tag className="plain">{rows.map((t, i) => <li key={i}>{t}</li>)}</Tag>
    </section>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}

export function Workspace({ form, state, empty, children }) {
  const { loading, error, result } = state;
  return (
    <div className="workspace">
      <form className="card form" onSubmit={(e) => e.preventDefault()}>{form}</form>
      <div className="results" aria-live="polite">
        <ErrorBox message={error} />
        {loading && <div className="card loading">Analysing… this can take up to a minute for images.</div>}
        {!loading && !result && !error && empty}
        {!loading && result && (
          <>
            {result.mode === "demo" && (
              <div className="notice">Demo data. Add an AI API key (GEMINI_API_KEY) on the server for live AI analysis.</div>
            )}
            {list(result.warnings).map((w, i) => <div key={i} className="notice warn">{w}</div>)}
            {children(result.data)}
          </>
        )}
      </div>
    </div>
  );
}

export function ImageDrop({ files, setFiles, max = 3, maxMb = 5 }) {
  const [err, setErr] = useState("");
  const input = useRef(null);
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    const u = files.map((f) => URL.createObjectURL(f));
    setUrls(u);
    return () => u.forEach(URL.revokeObjectURL);
  }, [files]);

  function add(fileList) {
    const next = [...files];
    setErr("");
    for (const f of Array.from(fileList)) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { setErr(`${f.name}: use JPEG, PNG or WebP.`); continue; }
      if (f.size > maxMb * 1024 * 1024) { setErr(`${f.name} is over ${maxMb} MB.`); continue; }
      if (next.length >= max) { setErr(`You can add up to ${max} images.`); break; }
      next.push(f);
    }
    setFiles(next);
  }

  return (
    <div className="drop-wrap">
      <div
        className="drop"
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
      >
        <strong>Drop photos here or click to choose</strong>
        <span>JPEG, PNG or WebP · up to {max} images · {maxMb} MB each</span>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden
               onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      </div>
      {err && <div className="field-hint err-text">{err}</div>}
      {files.length > 0 && (
        <div className="thumbs">
          {files.map((f, i) => (
            <figure key={f.name + i}>
              <img src={urls[i]} alt={f.name} />
              <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}>Remove</button>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
