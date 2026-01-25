import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

async function getStatsData() {
  await dbConnect();
  const orders = await Order.find({}).sort({ createdAt: 1 }); // Oldest first for timeline

  // 1. Monthly Revenue
  const monthlyRevenue = orders.reduce((acc: any, order) => {
    const month = format(order.createdAt, 'MMM yyyy', { locale: fr });
    if (!acc[month]) acc[month] = { total: 0, count: 0 };
    acc[month].total += order.totalPrice || 0;
    acc[month].count += 1;
    return acc;
  }, {});

  // Convert to array
  const monthlyData = Object.keys(monthlyRevenue).map(month => ({
    month,
    revenue: monthlyRevenue[month].total,
    count: monthlyRevenue[month].count
  }));

  // 2. Payment Status Distribution (Global)
  let totalParts = 0;
  let paidParts = 0;

  orders.forEach(order => {
    // 3 parts per order: deposit, payment1, payment2
    totalParts += 3;
    if (order.deposit30?.isPaid) paidParts++;
    if (order.payment15_1?.isPaid) paidParts++;
    if (order.payment15_2?.isPaid) paidParts++;
  });

  const paymentProgress = totalParts > 0 ? (paidParts / totalParts) * 100 : 0;

  return {
    monthlyData,
    paymentProgress,
    totalOrders: orders.length,
    averageOrderValue: orders.length > 0 
        ? orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0) / orders.length 
        : 0
  };
}

export default async function StatsPage() {
  const data = await getStatsData();
  const maxRevenue = Math.max(...data.monthlyData.map(d => d.revenue), 1000); // Avoid div by zero

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight text-white mb-6">Statistiques Détaillées</h2>
      
      <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader>
                <CardTitle className="text-white text-sm font-medium">Commandes Totales</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{data.totalOrders}</div>
            </CardContent>
          </Card>
           <Card className="bg-zinc-900 border-white/10">
            <CardHeader>
                <CardTitle className="text-white text-sm font-medium">Panier Moyen</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{data.averageOrderValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
            </CardContent>
          </Card>
           <Card className="bg-zinc-900 border-white/10">
            <CardHeader>
                <CardTitle className="text-white text-sm font-medium">Progression Paiements</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-emerald-500">{Math.round(data.paymentProgress)}%</div>
                <div className="text-xs text-zinc-500">Taux global de recouvrement</div>
            </CardContent>
          </Card>
      </div>

      <Card className="bg-zinc-900 border-white/10">
        <CardHeader>
            <CardTitle className="text-white">Évolution du Chiffre d&apos;Affaires</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
            <div className="h-[300px] w-full flex items-end justify-between gap-2">
                {data.monthlyData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full bg-zinc-800 rounded-t-md relative hover:bg-zinc-700 transition-all cursor-help" style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}>
                             {/* Tooltip */}
                             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                {item.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                             </div>
                        </div>
                        <span className="text-xs text-zinc-500 rotate-0 truncate w-full text-center">{item.month}</span>
                    </div>
                ))}
                {data.monthlyData.length === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                        Aucune donnée disponible
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
