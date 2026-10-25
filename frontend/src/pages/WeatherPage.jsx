import { useState } from "react";
import { list, postJson, useRun } from "../api.js";
import { Block, Button, Empty, Field, Pill, Workspace } from "../components/ui.jsx";

const LEVEL = { good: "low", caution: "medium", avoid: "high" };

export default function WeatherPage() {
  const [city, setCity] = useState("Indore");
  const [activity, setActivity] = useState("concreting and plastering");
  const state = useRun(() => postJson("/weather", { city, activity }));

  const form = (
    <>
      <h2>Site location</h2>
      <Field label="City"><input value={city} onChange={(e) => setCity(e.target.value)} /></Field>
      <Field label="Planned work"><input value={activity} maxLength={200} onChange={(e) => setActivity(e.target.value)} /></Field>
      <Button loading={state.loading} onClick={() => state.run()} disabled={city.trim().length < 2}>Get 5-day advisory</Button>
    </>
  );

  return (
    <Workspace form={form} state={state}
      empty={<Empty title="No forecast yet">Enter a city to see which days suit your planned work.</Empty>}>
      {(d) => (
        <>
          <article className="card result"><div className="stripe" /><h2>{d.location}</h2><p>{d.summary}</p></article>
          <div className="days">
            {list(d.days).map((x) => (
              <article className={`card day day-${x.suitability}`} key={x.date}>
                <div className="row between"><strong>{new Date(x.date + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</strong><Pill level={LEVEL[x.suitability]}>{x.suitability}</Pill></div>
                <p>{x.condition}</p>
                <p className="muted">{Math.round(x.temp_min_c)}–{Math.round(x.temp_max_c)}°C · rain {x.rain_mm} mm · wind {Math.round(x.wind_kmh)} km/h</p>
                <p>{x.advice}</p>
              </article>
            ))}
          </div>
          <article className="card result">
            <Block title="Work recommendations" items={d.work_recommendations} />
            <Block title="Protect your materials" items={d.material_precautions} />
          </article>
        </>
      )}
    </Workspace>
  );
}
