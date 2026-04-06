import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lock, DollarSign, ShoppingCart, Clock, TrendingUp, Eye, CreditCard, CheckCircle, Users } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  customer_name: string | null;
  customer_email: string | null;
  created_at: string;
  paid_at: string | null;
  transaction_hash: string | null;
}

interface Summary {
  totalTransactions: number;
  paidTransactions: number;
  pendingTransactions: number;
  totalRevenue: number;
  todayRevenue: number;
  todayPaid: number;
}

interface FunnelStep {
  total: number;
  unique: number;
}

const FUNNEL_CONFIG = [
  { key: "pressel", label: "Pressel", emoji: "🔒" },
  { key: "quiz", label: "Quiz", emoji: "❓" },
  { key: "roleta", label: "Roleta", emoji: "🎰" },
  { key: "ofertas", label: "Ofertas", emoji: "🏷️" },
  { key: "produto", label: "Produto", emoji: "📦" },
  { key: "checkout", label: "Checkout", emoji: "🛒" },
  { key: "success", label: "Pagamento", emoji: "✅" },
];

const Admin = () => {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [funnel, setFunnel] = useState<Record<string, FunnelStep>>({});
  const [pixelEvents, setPixelEvents] = useState<Record<string, number>>({});
  const [realtime, setRealtime] = useState<{ activeUsers: number; byPage: Record<string, number> }>({ activeUsers: 0, byPage: {} });

  const fetchMetrics = async (pwd: string) => {
    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-metrics", {
        body: { password: pwd },
      });
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      setSummary(data.summary);
      setTransactions(data.transactions);
      setFunnel(data.funnel || {});
      setPixelEvents(data.pixelEvents || {});
      setRealtime(data.realtime || { activeUsers: 0, byPage: {} });
      setAuthenticated(true);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar métricas");
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-svh bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-gray-700">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Painel Admin</h1>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchMetrics(password)}
            placeholder="Senha"
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none mb-4"
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            onClick={() => fetchMetrics(password)}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Carregando..." : "Acessar"}
          </button>
        </div>
      </div>
    );
  }

  const conversionRate = summary
    ? summary.totalTransactions > 0
      ? ((summary.paidTransactions / summary.totalTransactions) * 100).toFixed(1)
      : "0"
    : "0";

  const maxFunnelUnique = Math.max(...FUNNEL_CONFIG.map((s) => funnel[s.key]?.unique || 0), 1);

  return (
    <div className="min-h-svh bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">📊 Painel de Administração</h1>
        <button
          onClick={() => fetchMetrics(password)}
          className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
        >
          Atualizar
        </button>
      </header>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Real-time Active Users */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <h2 className="text-lg font-bold">Em tempo real</h2>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <Users className="w-8 h-8 text-green-400" />
            <span className="text-4xl font-bold text-green-400">{realtime.activeUsers}</span>
            <span className="text-gray-400 text-sm">visitantes ativos (últimos 5 min)</span>
          </div>
          {Object.keys(realtime.byPage).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(realtime.byPage)
                .sort(([, a], [, b]) => b - a)
                .map(([page, count]) => (
                  <span key={page} className="bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-300">
                    {page}: <span className="font-bold text-white">{count}</span>
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={<DollarSign className="w-6 h-6" />} label="Receita total" value={`R$ ${summary?.totalRevenue?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}`} color="bg-green-600" />
          <MetricCard icon={<TrendingUp className="w-6 h-6" />} label="Receita hoje" value={`R$ ${summary?.todayRevenue?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}`} color="bg-blue-600" />
          <MetricCard icon={<CheckCircle className="w-6 h-6" />} label="Pedidos pagos" value={`${summary?.paidTransactions || 0}`} color="bg-emerald-600" />
          <MetricCard icon={<Clock className="w-6 h-6" />} label="Pedidos pendentes" value={`${summary?.pendingTransactions || 0}`} color="bg-yellow-600" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard icon={<ShoppingCart className="w-6 h-6" />} label="Total de transações" value={`${summary?.totalTransactions || 0}`} color="bg-purple-600" />
          <MetricCard icon={<CreditCard className="w-6 h-6" />} label="Pagos hoje" value={`${summary?.todayPaid || 0}`} color="bg-cyan-600" />
          <MetricCard icon={<Eye className="w-6 h-6" />} label="Taxa de conversão" value={`${conversionRate}%`} color="bg-pink-600" />
        </div>

        {/* Funnel */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold mb-6">🔥 Funil de Conversão</h2>
          <div className="space-y-3">
            {FUNNEL_CONFIG.map((step, i) => {
              const data = funnel[step.key] || { total: 0, unique: 0 };
              const barWidth = maxFunnelUnique > 0 ? (data.unique / maxFunnelUnique) * 100 : 0;
              const prevUnique = i > 0 ? (funnel[FUNNEL_CONFIG[i - 1].key]?.unique || 0) : 0;
              const dropoff = i > 0 && prevUnique > 0
                ? (((prevUnique - data.unique) / prevUnique) * 100).toFixed(0)
                : null;

              return (
                <div key={step.key}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl w-8 text-center">{step.emoji}</span>
                    <span className="text-sm font-medium w-24">{step.label}</span>
                    <div className="flex-1 h-8 bg-gray-700/50 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{
                          width: `${Math.max(barWidth, 2)}%`,
                          background: `linear-gradient(90deg, ${getBarColor(i)}, ${getBarColor(i)}dd)`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center px-3 justify-between">
                        <span className="text-xs font-bold text-white drop-shadow">
                          {data.unique} sessões
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {data.total} views
                        </span>
                      </div>
                    </div>
                    {dropoff !== null && (
                      <span className="text-xs text-red-400 font-medium w-14 text-right">
                        -{dropoff}%
                      </span>
                    )}
                  </div>
                  {i < FUNNEL_CONFIG.length - 1 && (
                    <div className="ml-[52px] w-px h-2 bg-gray-600" />
                  )}
                </div>
              );
            })}
          </div>
          {funnel.pressel?.unique > 0 && funnel.success?.unique > 0 && (
            <div className="mt-6 p-3 bg-gray-700/30 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-300">Conversão geral (Pressel → Pagamento)</span>
              <span className="text-lg font-bold text-green-400">
                {((funnel.success.unique / funnel.pressel.unique) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Pixel Status */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold mb-4">🔥 Status dos Pixels</h2>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-bold text-sm mb-2">TikTok Pixel</h3>
            <p className="text-xs text-gray-400 mb-2">ID: CUMCLS3C77UCJ3CPMCN0</p>
            <div className="space-y-1 text-xs">
              <PixelEvent name="PageView" page="Todas (auto)" count={pixelEvents.PageView || 0} />
              <PixelEvent name="ViewContent" page="Produto" count={pixelEvents.ViewContent || 0} />
              <PixelEvent name="AddToCart" page="Produto" count={pixelEvents.AddToCart || 0} />
              <PixelEvent name="InitiateCheckout" page="Checkout" count={pixelEvents.InitiateCheckout || 0} />
              <PixelEvent name="CompletePayment" page="Checkout Success" count={pixelEvents.CompletePayment || 0} />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-bold">Últimas Transações</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Valor</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Método</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhuma transação ainda
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-t border-gray-700/50 hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${tx.status === "paid" ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"}`}>
                          {tx.status === "paid" ? "✅ Pago" : "⏳ Pendente"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">
                        R$ {(tx.amount / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{tx.payment_method}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-gray-300">{tx.customer_name || "—"}</p>
                          <p className="text-xs text-gray-500">{tx.customer_email || ""}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(tx.created_at).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

function getBarColor(index: number): string {
  const colors = ["#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#F97316", "#10B981"];
  return colors[index % colors.length];
}

const MetricCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) => (
  <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>{icon}</div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const PixelEvent = ({ name, page, count }: { name: string; page: string; count: number }) => (
  <div className="flex items-center justify-between py-1">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-green-400" />
      <span className="text-gray-300">{name}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="font-mono font-bold text-white bg-gray-600 px-2 py-0.5 rounded">{count}</span>
      <span className="text-gray-500 w-28 text-right">{page}</span>
    </div>
  </div>
);

export default Admin;
