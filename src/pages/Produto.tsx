import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { ChevronLeft, ShoppingCart, ShieldCheck, Truck, RefreshCw, ThumbsUp, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/mercado-livre-logo.png";
import timerIcon from "@/assets/timer-icon.png";
import shoppingBagIcon from "@/assets/shopping-bag-icon.png";
import { products } from "@/data/products";
import usePageTrack from "@/hooks/usePageTrack";

const fakeNames = ["Santiago", "Valentina", "Mateo", "Camila", "Lautaro", "Sofía", "Joaquín", "Martina", "Tomás", "Isabella"];

const Produto = () => {
  usePageTrack("produto");
  const { id } = useParams();
  const navigate = useNavigate();
  const productIndex = parseInt(id || "0", 10);
  const product = products[productIndex];

  const [selectedImage, setSelectedImage] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 1, minutes: 25, seconds: 38 });
  const [notifName, setNotifName] = useState(fakeNames[0]);
  const [notifTime, setNotifTime] = useState("hace 2 min");
  const [buyLoading, setBuyLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      // TikTok ViewContent (client-side)
      if (typeof window !== 'undefined' && (window as any).ttq) {
        (window as any).ttq.track('ViewContent', {
          content_type: 'product',
          content_id: String(productIndex),
          content_name: product.name,
          value: product.price,
          currency: 'BRL',
        });
      }
      // TikTok ViewContent (S2S)
      const sid = sessionStorage.getItem("_sid") || "";
      supabase.functions.invoke("tiktok-viewcontent", {
        body: {
          content_id: String(productIndex),
          content_name: product.name,
          value: product.price,
          currency: "BRL",
          session_id: sid,
        },
      }).then(() => {}).catch(() => {});
    }
    const g = product?.gallery || (product ? [product.image] : []);
    g.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    products.forEach((p) => {
      const pi = new Image();
      pi.src = p.image;
    });
  }, [product]);

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

  if (!product) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <p>Producto no encontrado</p>
      </div>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, "0");
  const installment = (product.price / 12).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const gallery = product.gallery || [product.image];
  const reviews = product.reviews || [];
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="min-h-svh bg-white flex flex-col">
      <div className="bg-[#FFE600] text-center py-2 px-4 text-sm font-bold text-[#333]">
        Promoción exclusiva: 26 años Mercado Libre
      </div>

      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <button onClick={() => navigate("/ofertas")} className="flex items-center gap-1 text-[#3483FA] text-sm font-medium">
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>
        <img src={logo} alt="Mercado Libre" className="h-10 object-contain" />
        <div className="w-6" />
      </header>

      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <span className="text-[#00a650] text-sm font-medium">+5mil vendidos</span>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-[#333]">4.8</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-[#FFB600] text-[#FFB600]" />
            ))}
          </div>
          <span className="text-xs text-[#999]">(1718)</span>
        </div>
      </div>

      <h1 className="text-lg font-bold text-[#333] px-4 pt-3 pb-1">{product.name}</h1>

      <div className="flex items-center justify-center px-4 py-4 min-h-[300px]">
        <img
          src={gallery[selectedImage]}
          alt={product.name}
          className="max-h-[350px] max-w-full object-contain"
        />
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
          {gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 ${
                selectedImage === i ? "border-[#3483FA]" : "border-gray-200"
              }`}
            >
              <img src={img} alt={`Vista ${i + 1}`} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pb-4 border-b border-gray-100">
        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border border-[#3483FA] text-[#3483FA] bg-white mb-2">
          {product.badge}
        </span>

        <p className="text-sm text-[#999] line-through">
          $ {product.originalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>

        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-[#333]">
            $ {product.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-sm font-bold text-[#00a650]">{discount}% OFF</span>
        </div>

        <p className="text-sm text-[#00a650] mt-1">
          en 12x $ {installment} sin interés
        </p>

        <div className="flex items-center gap-1 mt-2 text-[#00a650] text-sm">
          <Truck className="w-4 h-4" />
          <span className="font-bold">Envío FULL</span>
          <span>- Envío gratis</span>
        </div>

        <div className="mt-3 bg-[#FFF3CD] rounded-lg px-3 py-2 text-sm text-[#856404]">
          <strong>¡Alta demanda!</strong> Últimas unidades a este precio. No pierdas esta oportunidad.
        </div>

        <button
                onClick={() => {
                  setBuyLoading(true);
                  // TikTok AddToCart + InitiateCheckout
                  if (typeof window !== 'undefined' && (window as any).ttq) {
                    (window as any).ttq.track('AddToCart', {
                      content_type: 'product',
                      content_id: String(productIndex),
                      value: product.price,
                      currency: 'BRL',
                    });
                    const checkoutEventId = `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
                    (window as any).ttq.track('InitiateCheckout', {
                      content_type: 'product',
                      value: product.price,
                      currency: 'USD',
                      event_id: checkoutEventId,
                    });
                  }
                  if (product.hotmartUrl) {
                    window.location.href = product.hotmartUrl;
                  } else {
                    setBuyLoading(false);
                    alert("Este producto no tiene link de pago disponible.");
                  }
                }}
                disabled={buyLoading}
                className="w-full mt-4 bg-[#3483FA] hover:bg-[#2968c8] text-white text-lg font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {buyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                {buyLoading ? "PROCESANDO..." : "COMPRAR AHORA"}
              </button>
      </div>

      <div className="bg-[#1a1a1a] text-white flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={timerIcon} alt="Timer" className="h-6 w-6 object-contain" />
          <span className="text-sm font-medium">La oferta expira en</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-bold">
          <span className="bg-[#3483FA] px-2 py-1 rounded">{pad(countdown.hours)}</span>
          <span>:</span>
          <span className="bg-[#3483FA] px-2 py-1 rounded">{pad(countdown.minutes)}</span>
          <span>:</span>
          <span className="bg-[#3483FA] px-2 py-1 rounded">{pad(countdown.seconds)}</span>
          <div className="flex gap-1 text-[10px] text-gray-400 ml-1">
            <span>HRS</span><span>MIN</span><span>SEG</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 text-sm text-[#666] flex items-center gap-1.5 border-b border-gray-100">
        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
        <span><strong>215</strong> personas viendo este producto ahora</span>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-4 border-b border-gray-100">
        {[
          { icon: <RefreshCw className="w-7 h-7 text-[#3483FA]" />, title: "Devolución", sub: "gratis 30 días" },
          { icon: <ShieldCheck className="w-7 h-7 text-[#3483FA] fill-[#3483FA] stroke-white" />, title: "Compra", sub: "Garantizada" },
          { icon: <ShieldCheck className="w-7 h-7 text-[#00a650] fill-[#00a650] stroke-white" />, title: "12 meses", sub: "de garantía" },
        ].map((b) => (
          <div key={b.title} className="flex flex-col items-center justify-center py-3 border border-gray-200 rounded-lg text-center">
            <div className="mb-1">{b.icon}</div>
            <span className="text-xs font-semibold text-[#333]">{b.title}</span>
            <span className="text-[11px] text-[#666]">{b.sub}</span>
          </div>
        ))}
      </div>

      <div className="px-4 py-4">
        <h2 className="text-lg font-bold text-[#333] mb-1">Opiniones del producto</h2>

        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-4xl font-bold text-[#333]">4.8</p>
            <div className="flex mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-[#FFB600] text-[#FFB600]" />
              ))}
            </div>
            <p className="text-xs text-[#999] mt-1">1718 opiniones</p>
          </div>
          <div className="flex-1 space-y-1">
            {[
              { stars: 5, pct: 82 },
              { stars: 4, pct: 12 },
              { stars: 3, pct: 4 },
              { stars: 2, pct: 1 },
              { stars: 1, pct: 1 },
            ].map((r) => (
              <div key={r.stars} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-[#666]">{r.stars}</span>
                <Star className="w-3 h-3 fill-[#FFB600] text-[#FFB600]" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFB600] rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="w-8 text-right text-[#999]">{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <h3 className="font-semibold text-[#333] mb-3">Opiniones destacadas</h3>

        <div className="space-y-4">
          {reviews.map((review, i) => (
            <div key={i} className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#3483FA] flex items-center justify-center text-white text-xs font-bold">
                    {review.author.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-[#333]">{review.author}</span>
                </div>
                <span className="text-xs text-[#999]">{review.date}</span>
              </div>

              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= review.rating ? "fill-[#FFB600] text-[#FFB600]" : "fill-gray-200 text-gray-200"}`}
                  />
                ))}
              </div>

              {review.images.length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto">
                  {review.images.map((img, j) => (
                    <img
                      key={j}
                      src={img}
                      alt={`Reseña ${i + 1}`}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              <p className="text-sm text-[#333] mb-2">{review.text}</p>

              <div className="flex items-center gap-1 text-xs text-[#999]">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{review.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 text-center text-[10px] text-[#999] border-t border-gray-100 space-y-1">
        <p>Términos y condiciones · Privacidad · Accesibilidad</p>
        <p>© 1999-2024 Mercado Libre S.R.L.</p>
      </div>

      <div className="fixed bottom-4 left-4 z-50 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-xs animate-in slide-in-from-bottom duration-300 border border-gray-100">
        <div className="w-9 h-9 rounded-full bg-[#39B54A] flex items-center justify-center flex-shrink-0">
          <img src={shoppingBagIcon} alt="Bolsa" className="w-6 h-6 object-contain" />
        </div>
        <div className="text-sm">
          <span className="font-bold text-[#333]">{notifName}</span>{" "}
          <span className="text-[#666]">acaba de comprar con descuento</span>
        </div>
        <span className="text-[11px] text-[#999] whitespace-nowrap ml-auto">{notifTime}</span>
      </div>
    </div>
  );
};

export default Produto;