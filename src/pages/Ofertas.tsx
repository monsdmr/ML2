import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";


import logo from "@/assets/mercado-livre-logo.png";
import heroBanner from "@/assets/promo-hero-banner.png";
import timerIcon from "@/assets/timer-icon.png";
import { ShieldCheck, Truck, RefreshCw } from "lucide-react";
import shoppingBagIcon from "@/assets/shopping-bag-icon.png";
import { products, soldOutProducts } from "@/data/products";
import usePageTrack from "@/hooks/usePageTrack";

const categories = ["Todos", "Celulares", "Electro", "Audio", "Hogar", "Gaming"];

const fakeNames = [
  "Santiago", "Valentina", "Mateo", "Camila", "Lautaro", "Sofía",
  "Joaquín", "Martina", "Tomás", "Isabella", "Benjamín", "Catalina",
];

const Ofertas = () => {
  usePageTrack("ofertas");
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [countdown, setCountdown] = useState({ hours: 1, minutes: 25, seconds: 27 });
  const [notifName, setNotifName] = useState(fakeNames[0]);
  const [notifTime, setNotifTime] = useState("hace 2 min");

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) return { hours: 0, minutes: 0, seconds: 0 };
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const times = ["ahora", "hace 1 min", "hace 2 min", "hace 3 min", "hace 5 min"];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % fakeNames.length;
      setNotifName(fakeNames[i]);
      setNotifTime(times[i % times.length]);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const filterCategory = selectedCategory === "Todos" ? "Todos" : selectedCategory;

  return (
    <div className="min-h-svh bg-white flex flex-col">
      <div className="bg-[#FFE600] text-center py-2 px-4 text-sm font-bold text-[#333]">
        ¡Aprovechá 95% de descuento aplicado automáticamente en tu compra!
      </div>

      <header className="flex items-center justify-center px-4 py-3 bg-white border-b border-gray-100">
        <img src={logo} alt="Mercado Libre" className="h-10 object-contain" />
      </header>

      <div className="w-full">
        <img src={heroBanner} alt="Promoción Aniversario 26 Años" className="w-full object-cover" />
      </div>

      <div className="bg-[#2d2d7c] text-white text-center py-3 px-4 flex items-center justify-center gap-3">
        <span className="text-lg sm:text-2xl font-black tracking-wide">HASTA 95% DE DESCUENTO</span>
        <span className="bg-[#00BCFF] text-white text-xs font-bold px-2 py-1 rounded">mercado pago</span>
      </div>

      <div className="bg-[#1a1a1a] text-white flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={timerIcon} alt="Timer" className="h-6 w-6 object-contain" />
          <span className="text-sm font-medium">La oferta expira en</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-bold">
          <span className="bg-[#3483FA] px-2 py-1 rounded text-white">{pad(countdown.hours)}</span>
          <span>:</span>
          <span className="bg-[#3483FA] px-2 py-1 rounded text-white">{pad(countdown.minutes)}</span>
          <span>:</span>
          <span className="bg-[#3483FA] px-2 py-1 rounded text-white">{pad(countdown.seconds)}</span>
          <div className="flex gap-1 text-[10px] text-gray-400 ml-1">
            <span>HRS</span><span>MIN</span><span>SEG</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 text-sm text-[#666] flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
        <span><strong>303</strong> personas viendo estas ofertas ahora</span>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-gray-100">
        {[
          { icon: <ShieldCheck className="w-7 h-7 text-[#3483FA] fill-[#3483FA] stroke-white" />, title: "Compra", sub: "Garantizada" },
          { icon: <Truck className="w-7 h-7 text-[#3483FA] fill-[#3483FA] stroke-white" />, title: "Envío", sub: "FULL" },
          { icon: <RefreshCw className="w-7 h-7 text-[#3483FA]" />, title: "Devolución", sub: "Gratis" },
        ].map((b) => (
          <div key={b.title} className="flex flex-col items-center justify-center py-3 border border-gray-200 rounded-lg">
            <div className="mb-1">{b.icon}</div>
            <span className="text-xs font-semibold text-[#333]">{b.title}</span>
            <span className="text-xs text-[#333]">{b.sub}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-[#3483FA] text-white"
                : "bg-gray-100 text-[#333] hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="px-4 pt-2 pb-3">
        <h2 className="text-lg font-bold text-[#333] flex items-center gap-2">
          <span className="text-[#3483FA]">⚡</span> Ofertas con hasta 95% OFF
        </h2>
        <p className="text-sm text-[#999]">Precios exclusivos del aniversario de 26 años</p>
      </div>

      <div className="grid grid-cols-2 gap-[2px] bg-gray-100 px-0">
        {products.map((product, i) => ({ product, i })).filter(({ product }) => filterCategory === "Todos" || product.category === filterCategory).map(({ product, i }) => {
          const installment = (product.price / 12).toLocaleString('en-US', { minimumFractionDigits: 2 });
          const stockPercent = Math.min((product.stock / 30) * 100, 100);
          const isWarning = product.warning;
          return (
            <Link to={`/producto/${i}`} key={i} className="bg-white flex flex-col relative">
              <span className="absolute top-2 left-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded border border-[#3483FA] text-[#3483FA] bg-white">
                {product.badge}
              </span>
              <span className="absolute top-2 right-2 z-10 bg-[#39B54A] text-white text-[11px] font-bold w-10 h-10 rounded-full flex items-center justify-center leading-tight text-center">
                95%<br />OFF
              </span>

              <div className="flex items-center justify-center h-64 p-4">
                <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" loading="eager" fetchPriority="high" />
              </div>

              <div className="px-3 pb-3 flex flex-col gap-1 flex-1">
                <span className="text-[11px] text-[#00a650] font-bold flex items-center gap-1">
                  ⚡ Envío <strong>FULL</strong>
                </span>
                <p className="text-sm text-[#333] line-clamp-2">{product.name}</p>
                <p className="text-xs text-[#999] line-through">
                  $ {product.originalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xl font-bold text-[#333]">
                  $ {product.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-[#00a650]">12x $ {installment} sin interés</p>

                <div className="mt-1">
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${stockPercent}%`,
                        background: stockPercent > 50 ? "#FFB600" : stockPercent > 25 ? "#FF6B00" : "#E63B3B",
                      }}
                    />
                  </div>
                  <p className="text-[11px] mt-0.5" style={{
                    color: isWarning ? "#E63B3B" : stockPercent > 50 ? "#666" : "#E63B3B",
                  }}>
                    {isWarning ? `⚠ Últimas ${product.stock} un.` : product.stock > 15 ? `En stock: ${product.stock} un.` : `Quedan ${product.stock} un.`}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
        {soldOutProducts.map((product, i) => (
          <div key={`sold-${i}`} className="bg-white flex flex-col relative opacity-60">
            <div className="flex items-center justify-center h-64 p-4">
              <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain grayscale" loading="lazy" />
            </div>
            <div className="px-3 pb-3">
              <span className="inline-block bg-[#E63B3B] text-white text-[10px] font-bold px-2 py-0.5 rounded mb-1">AGOTADO</span>
              <p className="text-sm text-[#333]">{product.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 left-4 z-50 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-xs animate-in slide-in-from-bottom duration-300 border border-gray-100">
        <div className="w-9 h-9 rounded-full bg-[#39B54A] flex items-center justify-center flex-shrink-0">
          <img src={shoppingBagIcon} alt="Bolsa" className="w-5 h-5 object-contain" />
        </div>
        <div className="text-sm">
          <span className="font-bold text-[#333]">{notifName}</span>{" "}
          <span className="text-[#666]">compró con 95% OFF</span>
        </div>
        <span className="text-[11px] text-[#999] whitespace-nowrap ml-auto">{notifTime}</span>
      </div>
    </div>
  );
};

export default Ofertas;