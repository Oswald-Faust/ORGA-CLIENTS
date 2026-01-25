import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, ShoppingBag, Activity } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export const dynamic = 'force-dynamic';

async function getOverviewData() {
  await dbConnect();
  // Fetch all orders sorted by newest first
  const orders = await Order.find({}).sort({ createdAt: -1 });
  
  const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const totalClients = orders.length; // Assuming 1 order = 1 client active context for now
  const activeOrders = orders.filter(o => !o.isCompleted).length; // Or logic based on payments
  
  // Calculate collected revenue (what is actually paid)
  let collectedRevenue = 0;
  orders.forEach(order => {
      if (order.deposit30?.isPaid) collectedRevenue += (order.totalPrice * 0.30);
      if (order.payment15_1?.isPaid) collectedRevenue += (order.totalPrice * 0.15);
      if (order.payment15_2?.isPaid) collectedRevenue += (order.totalPrice * 0.15);
  });

  const recentOrders = orders.slice(0, 5);

  return {
    totalRevenue,
    collectedRevenue,
    totalClients,
    activeOrders,
    recentOrders
  };
}

export default async function OverviewPage() {
  const data = await getOverviewData();

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight text-white mb-6">Vue d&apos;ensemble</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Chiffre d&apos;Affaires Signé</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
            <p className="text-xs text-zinc-500">Valeur totale des contrats</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Encaissé Réel</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.collectedRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
            <p className="text-xs text-zinc-500">Montant réellement perçu</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Commandes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.totalClients}</div>
            <p className="text-xs text-zinc-500">Dossiers en cours</p>
          </CardContent>
        </Card>
         <Card className="bg-zinc-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Clients</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.totalClients}</div>
            <p className="text-xs text-zinc-500">Clients actifs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-zinc-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Dernières Commandes</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-8">
                {data.recentOrders.map((order: any) => (
                    <div key={order._id} className="flex items-center">
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none text-white">{order.firstName} {order.lastName}</p>
                            <p className="text-sm text-muted-foreground text-zinc-500">{order.clientEmail}</p>
                        </div>
                        <div className="ml-auto font-medium text-white">
                            {order.totalPrice?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </div>
                    </div>
                ))}
                 {data.recentOrders.length === 0 && (
                    <p className="text-zinc-500 text-sm">Aucune commande récente.</p>
                )}
             </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-zinc-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Statut des Encaisses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
                {/* Simple textual progress for now */}
                <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-zinc-400">Total Encaissé</span>
                        <span className="text-white font-medium">{Math.round((data.collectedRevenue / data.totalRevenue) * 100) || 0}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${(data.collectedRevenue / data.totalRevenue) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
