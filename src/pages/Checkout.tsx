import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/mercado-livre-logo.png";
import { ChevronLeft, Minus, Plus, Trash2, ShoppingCart, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import usePageTrack from "@/hooks/usePageTrack";

const Checkout = () => {
  usePageTrack("checkout");
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalSavings, totalItems } = useCart();
  

  const handleCheckout = () => {
    if (items.length === 0) return;

    // TikTok InitiateCheckout
    if (typeof window !== "undefined" && (window as any).ttq) {
      const checkoutEventId = `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      (window as any).ttq.track("InitiateCheckout", {
        content_type: "product",
        value: totalPrice,
        currency: "USD",
        event_id: checkoutEventId,
      });
    }

    // Redirect to the first item's Hotmart checkout URL
    const hotmartUrl = items[0]?.product.hotmartUrl;
    if (hotmartUrl) {
      window.location.href = hotmartUrl;
    } else {
      alert("Este producto no tiene link de pago disponible.");
    }
  };

  return (
    <div className="min-h-svh bg-[#EBEBEB] flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-[#FFE600]">
        <button onClick={() => navigate("/ofertas")} className="flex items-center gap-1 text-[#333] text-sm font-medium">
          <ChevronLeft className="w-5 h-5" />
          Volver
        </button>
        <img src={logo} alt="Mercado Libre" className="h-8 object-contain" />
        <div className="w-10" />
      </header>

      <div className="px-4 py-3">
        <h1 className="text-xl font-bold text-[#333]">Tu carrito ({totalItems})</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          <ShoppingCart className="w-16 h-16 text-[#999]" />
          <p className="text-lg text-[#666]">Tu carrito está vacío</p>
          <button
            onClick={() => navigate("/ofertas")}
            className="bg-[#3483FA] text-white font-bold px-6 py-3 rounded-lg"
          >
            Ver ofertas
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3 px-4 pb-40">
          {items.map((item) => {
            const savings = (item.product.originalPrice - item.product.price) * item.quantity;
            return (
              <div key={item.productIndex} className="bg-white rounded-lg p-3 flex gap-3 shadow-sm">
                <div
                  className="w-20 h-20 flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/producto/${item.productIndex}`)}
                >
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#333] line-clamp-2">{item.product.name}</p>
                  <p className="text-xs text-[#999] line-through mt-1">
                    $ {(item.product.originalPrice * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-lg font-bold text-[#333]">
                    $ {(item.product.price * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  {savings > 0 && (
                    <p className="text-xs text-[#00a650] font-medium">
                      Ahorrás $ {savings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productIndex, item.quantity - 1)}
                        className="px-2 py-1 text-[#3483FA]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productIndex, item.quantity + 1)}
                        className="px-2 py-1 text-[#3483FA]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productIndex)}
                      className="text-[#3483FA] text-xs font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => navigate("/ofertas")}
            className="text-[#3483FA] text-sm font-medium text-center py-2"
          >
            + Agregar más productos
          </button>

          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { icon: <ShieldCheck className="w-6 h-6 text-[#3483FA] fill-[#3483FA] stroke-white" />, label: "Compra Garantizada" },
              { icon: <Truck className="w-6 h-6 text-[#3483FA] fill-[#3483FA] stroke-white" />, label: "Envío FULL" },
              { icon: <RefreshCw className="w-6 h-6 text-[#3483FA]" />, label: "Devolución Gratis" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center py-2 bg-white rounded-lg text-center">
                {b.icon}
                <span className="text-[10px] text-[#333] mt-1">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-[#666]">Subtotal ({totalItems} {totalItems === 1 ? "producto" : "productos"})</span>
            <span className="text-sm text-[#999] line-through">
              $ {items.reduce((s, i) => s + i.product.originalPrice * i.quantity, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-lg font-bold text-[#333]">Total</span>
            <span className="text-lg font-bold text-[#333]">
              $ {totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          {totalSavings > 0 && (
            <p className="text-xs text-[#00a650] font-medium text-right mb-3">
              ¡Ahorrás $ {totalSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })} en total!
            </p>
          )}
          <button
            onClick={handleCheckout}
            className="w-full bg-[#3483FA] hover:bg-[#2968c8] text-white text-lg font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            PAGAR AHORA
          </button>
        </div>
      )}
    </div>
  );
};

export default Checkout;
