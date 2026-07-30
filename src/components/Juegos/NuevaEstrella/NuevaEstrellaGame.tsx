"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNuevaEstrella } from "@/hooks/useNuevaEstrella";
import {
  NuevaEstrellaEntrenar,
  NuevaEstrellaMedios,
} from "./NuevaEstrellaAcciones";
import { NuevaEstrellaHub } from "./NuevaEstrellaHub";
import { NuevaEstrellaPartido } from "./NuevaEstrellaPartido";
import { NuevaEstrellaResultadoPartido } from "./NuevaEstrellaResultadoPartido";
import { NuevaEstrellaRetiro } from "./NuevaEstrellaRetiro";
import { NuevaEstrellaSetup } from "./NuevaEstrellaSetup";
import { NuevaEstrellaTienda } from "./NuevaEstrellaTienda";
import { NuevaEstrellaTransferencia } from "./NuevaEstrellaTransferencia";

export function NuevaEstrellaGame() {
  const g = useNuevaEstrella();

  if (!g.hydrated) {
    return (
      <p className="text-sm text-muted-foreground animate-pulse">Cargando…</p>
    );
  }

  if (g.fase === "continuar" && g.partida) {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Partida guardada</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            {g.partida.jugador.apellido} · T{g.partida.jugador.temporadaActual} ·
            Semana {g.partida.jugador.semanaActual}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={g.continuarGuardada}>
            Continuar
          </Button>
          <Button className="flex-1" variant="outline" onClick={g.nuevaPartida}>
            Nueva carrera
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (g.fase === "setup" || (!g.partida && g.fase !== "retiro")) {
    return (
      <NuevaEstrellaSetup onStart={g.start} onImportar={g.cargarCodigo} />
    );
  }

  if (!g.partida) {
    return <NuevaEstrellaSetup onStart={g.start} onImportar={g.cargarCodigo} />;
  }

  if (g.fase === "entrenar" && g.atributoEntrenar) {
    return (
      <NuevaEstrellaEntrenar
        partida={g.partida}
        atributo={g.atributoEntrenar}
        onDone={g.finEntrenar}
        onCancel={() => g.setFase("hub")}
      />
    );
  }

  if (g.fase === "medios") {
    return (
      <NuevaEstrellaMedios
        partida={g.partida}
        onElegir={g.finMedios}
        onCancel={() => g.setFase("hub")}
      />
    );
  }

  if (g.fase === "partido") {
    return (
      <NuevaEstrellaPartido
        partida={g.partida}
        onMomento={g.momentoPartido}
      />
    );
  }

  if (g.fase === "resultado_partido" && g.ultimoPartido) {
    return (
      <NuevaEstrellaResultadoPartido
        partido={g.ultimoPartido}
        onContinuar={g.despuesResultado}
      />
    );
  }

  if (g.fase === "tienda") {
    return (
      <NuevaEstrellaTienda
        partida={g.partida}
        onComprar={g.comprar}
        onVolver={() => g.setFase("hub")}
        error={g.error}
      />
    );
  }

  if (g.fase === "transferencia" && g.partida.ofertaPendiente) {
    return (
      <NuevaEstrellaTransferencia
        oferta={g.partida.ofertaPendiente}
        onAceptar={g.aceptarOferta}
        onRechazar={g.rechazarOferta}
      />
    );
  }

  if (g.fase === "retiro" || g.partida.retirado) {
    return (
      <NuevaEstrellaRetiro partida={g.partida} onReiniciar={g.nuevaPartida} />
    );
  }

  return (
    <>
      <NuevaEstrellaHub
        partida={g.partida}
        onEntrenar={g.irEntrenar}
        onSocializar={g.socializar}
        onMedios={g.irMedios}
        onDescansar={g.descansar}
        onIrPartido={g.irPartido}
        onTienda={g.irTienda}
        onExportar={g.generarCodigo}
        onRetirar={g.retirarse}
      />
      {g.codigoExport && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Código de partida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <textarea
              className="w-full min-h-24 rounded-md border border-input bg-background p-2 text-xs font-mono"
              readOnly
              value={g.codigoExport}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  void navigator.clipboard?.writeText(g.codigoExport!);
                }}
              >
                Copiar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => g.setCodigoExport(null)}
              >
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
