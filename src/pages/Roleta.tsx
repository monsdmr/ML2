import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/mercado-livre-logo.png";
import usePageTrack from "@/hooks/usePageTrack";


const segments = [
  { label: "95%", sub: "DE DESCUENTO", color: "#E8B731", textColor: "#fff", icon: false },
  { label: "75%", sub: "DE DESCUENTO", color: "#D4436B", textColor: "#fff", icon: false },
  { label: "50%", sub: "DE DESCUENTO", color: "#2DBDA8", textColor: "#fff", icon: false },
  { label: "", sub: "", color: "#E8943A", textColor: "#333", icon: true },
  { label: "25%", sub: "DE DESCUENTO", color: "#3B7DD8", textColor: "#fff", icon: false },
  { label: "", sub: "", color: "#2A2A2A", textColor: "#fff", icon: true },
  { label: "5%", sub: "DE DESCUENTO", color: "#D63B3B", textColor: "#fff", icon: false },
  { label: "", sub: "", color: "#8E44AD", textColor: "#fff", icon: true },
];

const FIRST_SPIN_TARGET = 3;
const SECOND_SPIN_TARGET = 0;

const fakeNames = [
  "Valentina López", "Santiago García", "Camila Rodríguez", "Mateo Fernández",
  "Martina González", "Joaquín Pérez", "Sofía Martínez", "Tomás Gómez",
  "Isabella Díaz", "Benjamín Torres", "Catalina Romero", "Lautaro Sosa",
];

const fakeDiscounts = ["25% de descuento", "50% de descuento", "75% de descuento", "95% de descuento", "5% de descuento"];

const Roleta = () => {
  usePageTrack("roleta");
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const spinningRef = useRef(false);
  const spinCountRef = useRef(0);
  const [showLoseModal, setShowLoseModal] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [notifIndex, setNotifIndex] = useState(0);
  const [notifications] = useState(() =>
    fakeNames.map((name, i) => ({
      name,
      prize: fakeDiscounts[i % fakeDiscounts.length],
      avatar: `https://i.pravatar.cc/40?u=${encodeURIComponent(name)}`,
    }))
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const segAngle = (2 * Math.PI) / segments.length;

    ctx.clearRect(0, 0, size, size);

    segments.forEach((seg, i) => {
      const startAngle = i * segAngle - Math.PI / 2;
      const endAngle = startAngle + segAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segAngle / 2);
      ctx.fillStyle = seg.textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (seg.icon) {
        ctx.font = `bold ${size * 0.091}px "Arial Black", "Impact", sans-serif`;
        ctx.fillText("↻", radius * 0.78, 0);
        ctx.font = `bold ${size * 0.04}px "Arial Black", "Impact", sans-serif`;
        ctx.fillText("Intentá", radius * 0.55, -size * 0.033);
        ctx.fillText("de", radius * 0.55, size * 0.009);
        ctx.fillText("nuevo", radius * 0.55, size * 0.051);
      } else {
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = `bold ${size * 0.112}px "Arial Black", "Impact", sans-serif`;
        ctx.fillText(seg.label, radius * 0.68, -size * 0.014);
        ctx.shadowColor = "transparent";
        ctx.font = `bold ${size * 0.029}px "Arial", "Helvetica", sans-serif`;
        ctx.fillText(seg.sub, radius * 0.68, size * 0.051);
      }
      ctx.restore();
    });

  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifIndex((prev) => (prev + 1) % notifications.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [notifications.length]);

  const handleSpin = () => {
    if (spinningRef.current || spinCountRef.current >= 2) return;
    spinningRef.current = true;
    setSpinning(true);
    setShowLoseModal(false);
    setShowWinModal(false);

    const currentSpinCount = spinCountRef.current;
    const segAngle = 360 / segments.length;
    const targetIndex = currentSpinCount === 0 ? FIRST_SPIN_TARGET : SECOND_SPIN_TARGET;

    const targetAngle = 90 - targetIndex * segAngle - segAngle / 2 + 360;
    const spins = 3 + Math.floor(Math.random() * 2);
    const finalRotation = rotation + spins * 360 + targetAngle - (rotation % 360);

    setRotation(finalRotation);

    setTimeout(() => {
      spinningRef.current = false;
      setSpinning(false);
      spinCountRef.current = currentSpinCount + 1;
      setSpinCount(currentSpinCount + 1);

      if (currentSpinCount === 0) {
        setShowLoseModal(true);
      } else {
        
        setShowWinModal(true);
      }
    }, 6000);
  };

  const handleTryAgain = () => {
    setShowLoseModal(false);
  };

  return (
    <div className="flex min-h-svh flex-col bg-accent relative overflow-hidden">
      <div className="absolute right-[-20%] top-[-10%] h-[80vh] w-[80vh] rounded-full bg-accent-foreground/5 pointer-events-none" />

      <div className="flex flex-1 flex-col items-center px-4 py-6 sm:py-10 relative z-10">
        <div className="mb-6 flex flex-col items-center">
          <img src={logo} alt="Mercado Libre" className="h-20 w-20 sm:h-24 sm:w-24 mb-2 object-contain" />
          <p className="text-sm font-semibold text-accent-foreground/70">Promoción Aniversario</p>
          <p className="text-sm text-accent-foreground/60">¡26 años Mercado Libre!</p>
        </div>

        <h1 className="mb-8 text-center text-lg sm:text-2xl font-bold text-accent-foreground">
          ¡Girá la <span className="font-black">Ruleta</span> para ganar tu <span className="font-black">Mega Descuento</span>!
        </h1>

        <div className="relative mb-8">
          <div
            className="rounded-full shadow-[0_0_40px_rgba(0,0,0,0.4)] overflow-hidden"
            style={{ width: 320, height: 320, border: "12px solid #1a1a1a" }}
          >
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="h-full w-full"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning
                  ? "transform 6s cubic-bezier(0.15, 0.60, 0.15, 1)"
                  : "none",
              }}
            />
          </div>

          <div
            className="absolute z-20"
            style={{
              top: "50%",
              right: "6px",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "12px solid transparent",
              borderBottom: "12px solid transparent",
              borderRight: "22px solid #fff",
              filter: "drop-shadow(-2px 0 3px rgba(0,0,0,0.3))",
            }}
          />

          <div
            className="absolute z-20 rounded-full flex items-center justify-center"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 56,
              height: 56,
              background: "radial-gradient(circle at 40% 40%, #DAB95C, #C49A3A, #7A5F28)",
              border: "4px solid #fff",
            }}
          >
            <span className="text-white font-black text-xs" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>GIRÁ</span>
          </div>
        </div>

        {spinCount < 2 && !showLoseModal && !showWinModal && (
          <button
            onClick={handleSpin}
            disabled={spinning}
            className={`rounded-xl px-10 py-4 text-base font-bold uppercase tracking-widest shadow-lg transition-all ${
              spinning
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-[#2d2d7c] text-white hover:bg-[#1e1e5c] hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            GIRÁ PARA GANAR
          </button>
        )}
      </div>

      {showLoseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-card p-8 text-center shadow-2xl animate-scale-in">
            <h2 className="mb-3 text-2xl font-black text-card-foreground">¡Qué lástima!</h2>
            <div className="mb-4 text-7xl">😓</div>
            <p className="mb-6 text-sm text-muted-foreground">
              No tuviste suerte esta vez, ¡pero podés girar de nuevo!
            </p>
            <button
              onClick={handleTryAgain}
              className="w-full rounded-xl bg-[#2d2d7c] py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-[#1e1e5c] hover:scale-[1.02] active:scale-[0.98]"
            >
              Intentar de Nuevo
            </button>
          </div>
        </div>
      )}

      {showWinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-card p-8 text-center shadow-2xl animate-scale-in">
            <h2 className="mb-3 text-2xl font-black text-card-foreground">¡Felicitaciones! 🎉</h2>
            <div className="mb-4 text-7xl">🏆</div>
            <p className="mb-2 text-lg font-bold text-primary">¡Ganaste 95% DE DESCUENTO!</p>
            <p className="mb-6 text-sm text-muted-foreground">
              ¡Aprovechá esta oferta exclusiva de aniversario de Mercado Libre!
            </p>
            <button
              onClick={() => navigate("/ofertas")}
              className="w-full rounded-xl bg-accent py-4 text-base font-bold uppercase tracking-widest text-accent-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              🎁 RECLAMAR MI PREMIO
            </button>
          </div>
        </div>
      )}

      <div
        key={notifIndex}
        className="sticky bottom-0 flex items-center justify-center gap-3 bg-[#1a1a1a] px-4 py-3 text-sm text-white animate-in fade-in duration-500"
      >
        <img
          src={notifications[notifIndex].avatar}
          alt={notifications[notifIndex].name}
          className="h-8 w-8 rounded-full object-cover"
        />
        <p>
          <span className="font-medium">{notifications[notifIndex].name}</span> acaba de ganar{" "}
          <span className="font-bold">{notifications[notifIndex].prize}</span>!
        </p>
      </div>
    </div>
  );
};

export default Roleta;