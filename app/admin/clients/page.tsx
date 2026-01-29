import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { AdminDashboardClient } from "../client-view";

export const dynamic = 'force-dynamic';

async function getClientsWithOrders() {
  await dbConnect();
  
  // Récupérer tous les utilisateurs (sauf les admins)
  const users = await User.find({ role: 'client' }).sort({ createdAt: -1 });
  
  // Récupérer toutes les commandes
  const orders = await Order.find({});
  
  // Créer un map des commandes par email
  const ordersByEmail = new Map();
  orders.forEach(order => {
    ordersByEmail.set(order.clientEmail, order);
  });
  
  // Fusionner les utilisateurs avec leurs commandes
  const clientsWithOrders = users.map(user => {
    const order = ordersByEmail.get(user.email);
    return {
      _id: order?._id?.toString() || user._id.toString(),
      oderId: order?._id?.toString() || null,
      userId: user._id.toString(),
      clientEmail: user.email,
      firstName: order?.firstName || user.name?.split(' ')[0] || '',
      lastName: order?.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      totalPrice: order?.totalPrice || 0,
      seller: order?.seller || '',
      references: order?.references || [],
      deposit30: order?.deposit30 || { isPaid: false },
      payment15_1: order?.payment15_1 || { isPaid: false },
      payment15_2: order?.payment15_2 || { isPaid: false },
      hasOrder: !!order,
      createdAt: user.createdAt,
      phone: user.phone || ''
    };
  });
  
  return JSON.parse(JSON.stringify(clientsWithOrders));
}

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect("/login");
  }

  const clients = await getClientsWithOrders();

  return <AdminDashboardClient initialOrders={clients} />;
}

