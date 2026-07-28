"use client";

import { getClubById } from "@/data/carrera/clubes";
import type { EstadoCarrera, NivelSeleccion } from "@/data/carrera/types";
import { construirDatosVitrina } from "@/utils/carrera/engine";

function labelNivel(nivel: NivelSeleccion): string {
  if (nivel === "mayor") return "Mayor";
  if (nivel === "sub23") return "Sub-23";
  return "Sub-20";
}

interface Props {
  estado: EstadoCarrera;
  onCerrar: () => void;
}

export function CarreraVitrina({ estado, onCerrar }: Props) {
  const data = construirDatosVitrina(estado);
  const j = estado.jugador;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center">
      <div
        role="dialog"
        aria-labelledby="vitrina-title"
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-background shadow-xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur">
          <h2 id="vitrina-title" className="text-base font-semibold">
            Vitrina · {j.apellido}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-5 px-4 py-4">
          <section>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-mundial-gold">
              Títulos por club
            </p>
            {data.titulosPorClub.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún sin copas.</p>
            ) : (
              <ul className="space-y-3">
                {data.titulosPorClub.map((g) => (
                  <li key={g.clubId}>
                    <p className="text-sm font-medium">{g.clubNombre}</p>
                    <ul className="mt-1 space-y-0.5 pl-2 text-sm text-muted-foreground">
                      {g.titulos.map((t) => (
                        <li key={t.nombre}>
                          {t.nombre}
                          {t.cantidad > 1 ? ` ×${t.cantidad}` : ""}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-mundial-gold">
              Premios individuales
            </p>
            {data.premios.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin premios todavía.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {data.premios.map((p, i) => (
                  <li key={`${p.nombre}-${i}`} className="flex justify-between gap-2">
                    <span>{p.nombre}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {p.edadInicio}–{p.edad}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-mundial-gold">
              Selección Colombia
            </p>
            <p className="text-sm tabular-nums">
              <span className="font-semibold">{data.capsSeleccion}</span> caps ·{" "}
              <span className="font-semibold">{data.golesSeleccion}</span> G ·{" "}
              <span className="font-semibold">{data.asistenciasSeleccion}</span> A
            </p>
            {j.convocatoriaSeleccion && (
              <p className="mt-1 text-xs text-muted-foreground">
                Nómina actual · {labelNivel(j.convocatoriaSeleccion)}
                {getClubById(j.clubActualId)
                  ? ` · ${getClubById(j.clubActualId)!.nombre}`
                  : ""}
              </p>
            )}
            {data.primeraConvocatoria && (
              <p className="mt-2 text-sm">
                Primera convocatoria · {labelNivel(data.primeraConvocatoria.nivel)}{" "}
                (edad {data.primeraConvocatoria.edad})
              </p>
            )}
            {data.highlightsSeleccion.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {data.highlightsSeleccion.map((h, i) => (
                  <li key={`${h.edad}-${i}`}>
                    {h.edad} · {labelNivel(h.nivel)} · {h.nota}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
