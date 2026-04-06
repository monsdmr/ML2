import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import logo from "@/assets/mercado-livre-logo.png";
import usePageTrack from "@/hooks/usePageTrack";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useRef } from "react";

const provincias = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
  "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
  "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán",
];

const DireccionEntrega = () => {
  usePageTrack("direccion");
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clearCart();
  }, []);

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    numero: "",
    pisoDepto: "",
    localidad: "",
    provincia: "",
    codigoPostal: "",
    telefono: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValid = form.nombre && form.direccion && form.numero && form.localidad && form.provincia && form.codigoPostal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    navigate("/upsell-erro");
  };

  return (
    <div className="min-h-svh bg-[#f0f2f5] flex flex-col">
      <header className="flex items-center justify-center px-4 py-3 bg-white border-b border-gray-100">
        <img src={logo} alt="Mercado Libre" className="h-10 object-contain" />
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-[#3483FA] flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#333]">Dirección de entrega</h1>
              <p className="text-xs text-gray-500">Completá los datos para recibir tu pedido</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-[#333] mb-1 block">Nombre completo *</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3483FA] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-[#333] mb-1 block">Calle / Dirección *</label>
                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Ej: Av. Corrientes"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3483FA] focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#333] mb-1 block">Número *</label>
                <input
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                  placeholder="1234"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3483FA] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#333] mb-1 block">Piso / Departamento</label>
              <input
                name="pisoDepto"
                value={form.pisoDepto}
                onChange={handleChange}
                placeholder="Ej: 3° B (opcional)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3483FA] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#333] mb-1 block">Localidad *</label>
                <input
                  name="localidad"
                  value={form.localidad}
                  onChange={handleChange}
                  placeholder="Ej: Palermo"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3483FA] focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#333] mb-1 block">Código Postal *</label>
                <input
                  name="codigoPostal"
                  value={form.codigoPostal}
                  onChange={handleChange}
                  placeholder="Ej: C1043"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3483FA] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#333] mb-1 block">Provincia *</label>
              <select
                name="provincia"
                value={form.provincia}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3483FA] focus:border-transparent bg-white"
              >
                <option value="">Seleccioná tu provincia</option>
                {provincias.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#333] mb-1 block">Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej: 11 2345-6789 (opcional)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3483FA] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={!isValid}
              className="mt-2 w-full bg-[#3483FA] hover:bg-[#2968c8] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-base font-bold py-3.5 rounded-lg transition-colors"
            >
              Confirmar dirección
            </button>

            <p className="text-[10px] text-gray-400 text-center mt-1">
              Tus datos están protegidos por Mercado Libre
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DireccionEntrega;
