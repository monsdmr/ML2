import { useState } from "react";
import { Search, Package, CheckCircle2, Truck, MapPin, Clock, Loader2, CalendarDays, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import mercadoLivreLogo from "@/assets/mercado-livre-logo.png";

const DELIVERY_DAYS = 30;

// Timeline stages with day ranges (out of 30)
const stages = [
  { label: "Pedido confirmado", icon: CheckCircle2, dayStart: 0 },
  { label: "En preparación", icon: Package, dayStart: 2 },
  { label: "En camino", icon: Truck, dayStart: 8 },
  { label: "Entregado", icon: MapPin, dayStart: 28 },
];

// Daily update messages mapped to day ranges
const dailyUpdates: { minDay: number; maxDay: number; message: string }[] = [
  { minDay: 0, maxDay: 0, message: "Tu pedido fue recibido y está siendo procesado." },
  { minDay: 1, maxDay: 1, message: "Confirmamos tu pago. Estamos preparando tu pedido." },
  { minDay: 2, maxDay: 3, message: "Tu pedido está siendo preparado en el depósito." },
  { minDay: 4, maxDay: 5, message: "Estamos empaquetando tu producto con cuidado." },
  { minDay: 6, maxDay: 7, message: "Tu paquete fue embalado y está listo para ser despachado." },
  { minDay: 8, maxDay: 9, message: "Tu pedido salió del depósito hacia el centro de distribución." },
  { minDay: 10, maxDay: 12, message: "Tu paquete llegó al centro de distribución regional." },
  { minDay: 13, maxDay: 15, message: "Tu pedido está en tránsito hacia tu provincia." },
  { minDay: 16, maxDay: 18, message: "Tu paquete pasó por el control de aduana." },
  { minDay: 19, maxDay: 21, message: "Tu pedido llegó al centro de distribución local." },
  { minDay: 22, maxDay: 24, message: "Tu paquete está siendo clasificado para la entrega." },
  { minDay: 25, maxDay: 26, message: "Tu pedido será entregado en los próximos días." },
  { minDay: 27, maxDay: 27, message: "Tu paquete está en camino con el repartidor." },
  { minDay: 28, maxDay: 29, message: "Tu pedido está muy cerca. Entrega prevista para hoy." },
  { minDay: 30, maxDay: 999, message: "¡Tu pedido fue entregado! Gracias por tu compra." },
];

function getStoredOrderDate(key: string): Date {
  const storageKey = `rastreo_${key}`;
  const stored = localStorage.getItem(storageKey);
  if (stored) return new Date(stored);
  const now = new Date();
  localStorage.setItem(storageKey, now.toISOString());
  return now;
}

function getDaysSince(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function getCurrentStage(days: number): number {
  let current = 0;
  for (let i = stages.length - 1; i >= 0; i--) {
    if (days >= stages[i].dayStart) {
      current = i;
      break;
    }
  }
  return current;
}

function getDailyMessage(days: number): string {
  const update = dailyUpdates.find((u) => days >= u.minDay && days <= u.maxDay);
  return update?.message || "Tu pedido está en camino.";
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface FakeOrder {
  orderDate: Date;
  days: number;
  stage: number;
  message: string;
  deliveryDate: Date;
  delivered: boolean;
}

function buildFakeOrder(queryKey: string): FakeOrder {
  const orderDate = getStoredOrderDate(queryKey);
  const days = getDaysSince(orderDate);
  const stage = getCurrentStage(days);
  const message = getDailyMessage(days);
  const deliveryDate = new Date(orderDate.getTime() + DELIVERY_DAYS * 24 * 60 * 60 * 1000);
  const delivered = days >= 30;

  return { orderDate, days, stage, message, deliveryDate, delivered };
}

export default function Rastreo() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<FakeOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);

    // Simulate a brief loading delay
    setTimeout(() => {
      const fakeOrder = buildFakeOrder(trimmed);
      setOrder(fakeOrder);
      setLoading(false);
    }, 1200);
  };

  const statusLabel = order
    ? order.delivered
      ? "Entregado"
      : order.stage >= 2
      ? "En camino"
      : order.stage >= 1
      ? "En preparación"
      : "Confirmado"
    : "";

  const statusColor = order
    ? order.delivered
      ? "bg-green-100 text-green-800 border-green-300"
      : order.stage >= 2
      ? "bg-purple-100 text-purple-800 border-purple-300"
      : order.stage >= 1
      ? "bg-blue-100 text-blue-800 border-blue-300"
      : "bg-yellow-100 text-yellow-800 border-yellow-300"
    : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-accent py-3 px-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <img src={mercadoLivreLogo} alt="Mercado Libre" className="h-9 w-9 rounded-full object-contain" />
          <span className="text-accent-foreground font-bold text-lg">Rastrear pedido</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h1 className="text-xl font-bold text-foreground mb-1">Rastreá tu pedido</h1>
            <p className="text-muted-foreground text-sm mb-4">
              Ingresá tu e-mail o DNI para ver el estado de tu compra.
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="E-mail o DNI"
                className="flex-1"
                maxLength={100}
              />
              <Button type="submit" disabled={loading || !query.trim()}>
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
                <span className="hidden sm:inline ml-1">Buscar</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        {order && !loading && (
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="pt-6">
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDateShort(order.orderDate)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Día {Math.min(order.days, DELIVERY_DAYS)} de {DELIVERY_DAYS}
                    </p>
                  </div>
                  <Badge className={`${statusColor} border`}>{statusLabel}</Badge>
                </div>

                {/* Daily update message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3 mb-6">
                  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Última actualización</p>
                    <p className="text-sm text-blue-700 mt-0.5">{order.message}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center justify-between mb-2">
                  {stages.map((s, idx) => {
                    const completed = idx <= order.stage;
                    const isCurrent = idx === order.stage;
                    const Icon = s.icon;

                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 relative">
                        {idx > 0 && (
                          <div
                            className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                              idx <= order.stage ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        )}
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            completed
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          } ${isCurrent && !order.delivered ? "ring-2 ring-primary/30 ring-offset-2" : ""}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs mt-1 text-center ${
                            completed ? "text-foreground font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Estimated delivery */}
                <div className="mt-5 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {order.delivered
                        ? "Entregado"
                        : `Llega el ${order.deliveryDate.toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "long",
                          })}`}
                    </p>
                    <p className="text-xs text-blue-700">
                      {order.delivered
                        ? "Tu pedido ya fue entregado"
                        : `Faltan ${DELIVERY_DAYS - order.days} días para la entrega`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading */}
        {loading && searched && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
            <p className="text-muted-foreground text-sm">Buscando tu pedido...</p>
          </div>
        )}
      </main>
    </div>
  );
}
