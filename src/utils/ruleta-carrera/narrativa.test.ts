import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CarreraGenerada } from "@/data/ruleta-carrera/types";
import { generarNarrativa, aplicarHabilidadAStats } from "./narrativa";
import { construirPasos } from "./pasos";
import { pickWeighted } from "./pickWeighted";

describe("pickWeighted", () => {
  it("elige la única opción", () => {
    const o = pickWeighted([{ id: "a", label: "A", valor: 1 }], () => 0.5);
    assert.equal(o.valor, 1);
  });

  it("respeta pesos extremos", () => {
    const opts = [
      { id: "a", label: "A", valor: "a", peso: 0.0001 },
      { id: "b", label: "B", valor: "b", peso: 1000 },
    ];
    const o = pickWeighted(opts, () => 0.99);
    assert.equal(o.valor, "b");
  });
});

describe("construirPasos", () => {
  it("incluye stats de arquero y vallas", () => {
    const p = construirPasos({
      posicion: "arquero",
      cantidadEquipos: 2,
      convocado: true,
      tieneHabilidad: true,
    });
    assert.ok(p.some((x) => x.kind === "stat"));
    assert.ok(p.some((x) => x.kind === "vallas"));
    assert.ok(p.some((x) => x.kind === "seleccionLogro"));
    assert.ok(p.some((x) => x.kind === "region"));
    assert.ok(p.some((x) => x.kind === "tieneHabilidad"));
    assert.ok(p.some((x) => x.kind === "habilidad"));
    assert.ok(p.some((x) => x.kind === "mejoraEnClub"));
    assert.equal(p.filter((x) => x.kind === "mejoraEnClub").length, 2);
  });

  it("one-club man no pide región", () => {
    const p = construirPasos({
      posicion: "delantero",
      cantidadEquipos: 1,
      convocado: false,
      tieneHabilidad: false,
    });
    assert.equal(p.filter((x) => x.kind === "region").length, 0);
    assert.ok(!p.some((x) => x.kind === "vallas"));
    assert.ok(!p.some((x) => x.kind === "seleccionLogro"));
    assert.ok(p.some((x) => x.kind === "tieneHabilidad"));
    assert.ok(!p.some((x) => x.kind === "habilidad"));
    assert.equal(p.filter((x) => x.kind === "mejoraEnClub").length, 1);
  });

  it("si mejoró abre ruedas de stat", () => {
    const p = construirPasos({
      posicion: "delantero",
      cantidadEquipos: 1,
      convocado: false,
      tieneHabilidad: false,
      mejorasEnClub: { 0: true },
      mejoraAttrPorClub: { 0: "tiro" },
    });
    assert.ok(p.some((x) => x.kind === "mejoraStatCual"));
    assert.ok(p.some((x) => x.kind === "mejoraStatValor"));
  });
});

describe("generarNarrativa", () => {
  it("arma texto con debut y retiro", () => {
    const c: CarreraGenerada = {
      apellido: "García",
      piernaHabil: "derecha",
      posicion: "delantero",
      edadDebut: 18,
      temporadas: 12,
      edadRetiro: 30,
      equipoDebut: "Millonarios",
      clubDebutId: "millonarios",
      statsBase: { ritmo: 7, tiro: 8, pase: 6, regate: 7, defensa: 4, fisico: 7 },
      statsNombres: {},
      atributosFinales: {
        ritmo: 70,
        tiro: 80,
        pase: 60,
        regate: 70,
        defensa: 40,
        fisico: 70,
      },
      habilidadEspecial: {
        id: "x",
        nombre: "Cabeza de gol",
        descripcion: "+2 tiro",
        efecto: { atributo: "tiro", bono: 2 },
      },
      cantidadEquipos: 2,
      equipos: [
        {
          region: "colombia",
          clubId: "millonarios",
          equipo: "Millonarios",
          ligaNombre: "Liga BetPlay",
          prestigio: 5,
          tituloNacional: "campeon",
          copaContinental: "jugo_libertadores",
          motivoSalida: "una mejor oferta económica",
        },
        {
          region: "sudamerica",
          clubId: "boca-juniors",
          equipo: "Boca Juniors",
          ligaNombre: "Liga Profesional",
          prestigio: 5,
          tituloNacional: "ninguno",
          copaContinental: "campeon_libertadores",
          motivoSalida: null,
        },
      ],
      golesTotales: 210,
      asistenciasTotales: 80,
      vallasInvictas: null,
      convocadoSeleccion: true,
      logroSeleccion: "fue campeón de Copa América",
      motivoRetiro: "quiso dedicarse a su familia",
    };
    const t = generarNarrativa(c);
    assert.match(t, /García debutó/);
    assert.match(t, /Boca Juniors/);
    assert.match(t, /210 goles/);
    assert.match(t, /retiró a los 30/);
  });
});

describe("aplicarHabilidadAStats", () => {
  it("aplica +2 en escala 1-10 → *10", () => {
    const attrs = aplicarHabilidadAStats(
      { tiro: 5, ritmo: 5, pase: 5, regate: 5, defensa: 5, fisico: 5 },
      {
        id: "t",
        nombre: "Tiro libre letal",
        descripcion: "+2",
        efecto: { atributo: "tiro", bono: 2 },
      },
      "delantero"
    );
    assert.equal(attrs.tiro, 70);
  });
});
