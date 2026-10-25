import { list } from "../api.js";

export default function Gantt({ tasks, totalWeeks }) {
  const rows = list(tasks);
  if (!rows.length) return null;
  const total = Math.max(totalWeeks || 1, 1);
  return (
    <div className="gantt" role="table" aria-label="Construction schedule">
      {rows.map((t) => (
        <div className="gantt-row" role="row" key={t.id}>
          <div className="gantt-label" role="cell"><span>{t.name}</span><small>{t.phase}</small></div>
          <div className="gantt-track" role="cell">
            <div className="gantt-bar" style={{ left: `${(t.start_week / total) * 100}%`, width: `${Math.max((t.duration_weeks / total) * 100, 1.5)}%` }}
                 title={`Week ${t.start_week + 1}–${t.start_week + t.duration_weeks}`}>
              {t.duration_weeks}w
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
