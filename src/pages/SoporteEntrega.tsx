import { Package, MessageCircle, Clock, Truck, HelpCircle } from "lucide-react";
import logo from "@/assets/mercado-livre-logo.png";
import usePageTrack from "@/hooks/usePageTrack";

const SoporteEntrega = () => {
  usePageTrack("soporte-entrega");

  return (
    <div className="min-h-svh bg-[#f0f2f5] flex flex-col">
      <header className="flex items-center justify-center px-4 py-3 bg-white border-b border-gray-100">
        <img src={logo} alt="Mercado Libre" className="h-10 object-contain" />
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-4">
        {/* Confirmación */}
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-[#00a650] flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#333]">¡Tu pedido está en camino! 📦</h1>
          <p className="text-sm text-gray-500 mt-2">
            Tu dirección fue registrada con éxito. Ahora podés hacer seguimiento de tu envío a través de nuestro soporte exclusivo.
          </p>
        </div>

        {/* Info cards */}
        <div className="max-w-md w-full flex flex-col gap-3">
          {[
            {
              icon: <Clock className="w-5 h-5 text-[#3483FA]" />,
              title: "Consultá los días de entrega",
              desc: "Preguntá cuántos días faltan para recibir tu producto.",
            },
            {
              icon: <Truck className="w-5 h-5 text-[#3483FA]" />,
              title: "Seguimiento en tiempo real",
              desc: "Recibí actualizaciones del estado de tu envío.",
            },
            {
              icon: <HelpCircle className="w-5 h-5 text-[#3483FA]" />,
              title: "Resolvé todas tus dudas",
              desc: "Cambios de dirección, horarios de entrega y más.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e8f0fe] flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-[#333]">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA WhatsApp */}
        <div className="max-w-md w-full">
          <a
            href="https://wa.me/541161113432"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white text-base font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <MessageCircle className="w-5 h-5" />
            Contactar soporte por WhatsApp
          </a>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            Soporte exclusivo para compradores de Mercado Libre
          </p>
        </div>

        <a
          href="/ofertas"
          className="text-[#3483FA] text-sm font-medium mt-2"
        >
          Volver a ofertas
        </a>
      </div>
    </div>
  );
};

export default SoporteEntrega;
