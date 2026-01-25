import { Card, CardContent } from "@/components/ui/card";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

async function getNotifications() {
  await dbConnect();
  const orders = await Order.find({}).lean();

  const notifications: any[] = [];

  orders.forEach((order: any) => {
    // 1. Order Creation Event
    notifications.push({
      type: 'order_created',
      date: new Date(order.createdAt),
      text: `Nouveau client inscrit : ${order.firstName} ${order.lastName}`,
      color: 'bg-blue-500'
    });

    // 2. Payment Events
    if (order.deposit30?.paidAt) {
      notifications.push({
        type: 'payment',
        date: new Date(order.deposit30.paidAt),
        text: `Paiement reçu : ${order.firstName} ${order.lastName} (Acompte 30%)`,
        color: 'bg-emerald-500'
      });
    }
    if (order.payment15_1?.paidAt) {
      notifications.push({
        type: 'payment',
        date: new Date(order.payment15_1.paidAt),
        text: `Paiement reçu : ${order.firstName} ${order.lastName} (Tranche 1)`,
        color: 'bg-emerald-500'
      });
    }
    if (order.payment15_2?.paidAt) {
      notifications.push({
        type: 'payment',
        date: new Date(order.payment15_2.paidAt),
        text: `Paiement reçu : ${order.firstName} ${order.lastName} (Tranche 2)`,
        color: 'bg-emerald-500'
      });
    }
  });

  // Sort by date desc
  notifications.sort((a, b) => b.date.getTime() - a.date.getTime());

  return notifications.slice(0, 20); // Last 20 events
}

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold tracking-tight text-white mb-6">Notifications</h2>
      <Card className="bg-zinc-900 border-white/10">
        <CardContent className="p-6">
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center text-zinc-500 py-8">Aucune notification récente</div>
                ) : (
                    notifications.map((notif, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className={`w-2 h-2 rounded-full ${notif.color}`}></div>
                            <div>
                                <p className="text-white text-sm">{notif.text}</p>
                                <p className="text-xs text-zinc-500 first-letter:uppercase">
                                    {formatDistanceToNow(notif.date, { addSuffix: true, locale: fr })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
