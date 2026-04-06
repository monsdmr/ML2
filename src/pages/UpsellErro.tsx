import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/mercado-livre-logo.png";
import { AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import usePageTrack from "@/hooks/usePageTrack";

const UpsellErro = () => {
  usePageTrack("upsell-erro");
  const navigate = useNavigate();
  const location = useLocation();
  const funnelId = (location.state as any)?.funnelId as string | null;

  useEffect(() => {
    

    const script = document.createElement("script");
    script.src = "https://checkout.hotmart.com/lib/hotmart-checkout-elements.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).checkoutElements) {
        const ce = (window as any).checkoutElements;
        const widget = funnelId
          ? ce.init("salesFunnel", { id: funnelId })
          : ce.init("salesFunnel");
        widget.mount("#hotmart-sales-funnel");
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [funnelId]);

  return (
    <div className="min-h-svh bg-[#EBEBEB] flex flex-col">
      <header className="flex items-center justify-center px-4 py-3 bg-[#FFE600]">
        <img src={logo} alt="Mercado Libre" className="h-8 object-contain" />
      </header>

      <div className="flex-1 px-4 py-6 flex flex-col items-center gap-6 max-w-md mx-auto w-full">
        {/* Error banner */}
        <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-lg p-4 flex items-start gap-3 w-full">
          <AlertTriangle className="w-6 h-6 text-[#F57C00] flex-shrink-0 mt-0.5" />
          <div>
            <h1 className="text-base font-bold text-[#E65100]">
              Tasa aduanera pendiente
            </h1>
            <p className="text-sm text-[#5D4037] mt-1">
              Tu compra fue procesada con éxito, pero se detectó una tasa aduanera obligatoria para la liberación del envío. Es necesario abonarla para que tu pedido sea despachado.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 w-full text-center">
          <RefreshCw className="w-10 h-10 text-[#3483FA] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#333] mb-2">
            Aboná la tasa aduanera
          </h2>
          <p className="text-sm text-[#666] mb-4">
            Para que tu pedido sea liberado y enviado, necesitás abonar la tasa aduanera utilizando el mismo método de pago.
          </p>

          <a
            href="https://happyml2026.shop/upsell-erro"
            className="block w-full bg-[#3483FA] hover:bg-[#2968c8] text-white text-base font-bold py-3.5 rounded-lg transition-colors text-center"
          >
            Pagar tasa aduanera
          </a>
        </div>

        <button
          onClick={() => navigate("/direccion")}
          className="text-[#3483FA] text-sm font-medium underline"
        >
          Continuar sin confirmar
        </button>

        {/* Trust badges */}
        <div className="flex items-center gap-2 text-xs text-[#666]">
          <ShieldCheck className="w-4 h-4 text-[#00a650]" />
          <span>Pago 100% seguro · Compra protegida</span>
        </div>
      </div>
    </div>
  );
};

export default UpsellErro;
