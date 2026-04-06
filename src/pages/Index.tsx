import { useState, useEffect } from "react";
import { Check, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/mercado-livre-logo.png";
import usePageTrack from "@/hooks/usePageTrack";

const steps = [
  { title: "Verificando conexión segura", subtitle: "Protocolo SSL/TLS", delay: 800 },
  { title: "Confirmando elegibilidad", subtitle: "Validando tu participación", delay: 1800 },
  { title: "Preparando tu acceso", subtitle: "Generando cupón exclusivo", delay: 2800 },
];

const Index = () => {
  usePageTrack("pressel");
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    steps.forEach((step, i) => {
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, i]);
        if (i === steps.length - 1) {
          setTimeout(() => setAllDone(true), 600);
        }
      }, step.delay);
    });
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-3 py-4 sm:px-4 sm:py-8">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-xl">
        <div className="h-1.5" style={{ background: "var(--gradient-top)" }} />

        <div className="flex flex-col items-center px-4 py-6 sm:px-10 sm:py-8">
          <img src={logo} alt="Mercado Libre" className="mb-4 h-14 w-14 sm:mb-6 sm:h-20 sm:w-20 object-contain" />

          <div className="mb-3 flex h-16 w-16 sm:mb-4 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/15">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary animate-check-pop" style={{ animationDelay: "0.3s" }}>
              <Check className="h-5 w-5 sm:h-7 sm:w-7 text-primary-foreground" strokeWidth={3} />
            </div>
          </div>

          <h1 className="mb-1 text-lg sm:text-xl font-bold text-card-foreground">¡Todo listo!</h1>
          <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-muted-foreground">Tu cupón exclusivo está disponible</p>

          <div className="mb-1 w-full rounded-full bg-muted h-2.5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary animate-progress-fill" />
          </div>
          <p className="mb-4 sm:mb-6 self-end text-xs text-muted-foreground">100%</p>

          <div className="w-full space-y-0">
            {steps.map((step, i) => (
              <div key={i}>
                <div
                  className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4 animate-fade-in-up"
                  style={{ animationDelay: `${step.delay}ms` }}
                >
                  <div className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    completedSteps.includes(i) ? "bg-primary" : "bg-muted"
                  }`}>
                    {completedSteps.includes(i) && (
                      <Check className="h-4 w-4 text-primary-foreground animate-check-pop" strokeWidth={3} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                  </div>
                </div>
                {i < steps.length - 1 && <div className="ml-4 h-px bg-border" />}
              </div>
            ))}
          </div>

          {allDone && (
            <p className="mt-4 mb-5 text-sm font-semibold text-primary animate-fade-in-up" style={{ animationDelay: "0ms" }}>
              ✓ ¡Completado con éxito!
            </p>
          )}

          {allDone && (
            <button
              onClick={() => navigate("/quiz")}
              className="w-full rounded-2xl bg-primary py-4 sm:py-5 text-base sm:text-lg font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg animate-pulse-glow"
            >
              VERIFICAR AHORA <ArrowRight className="h-6 w-6" strokeWidth={2.5} />
            </button>
          )}

          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Entorno protegido por encriptación</span>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        © 2026 Mercado Libre - Todos los derechos reservados
      </p>
    </div>
  );
};

export default Index;