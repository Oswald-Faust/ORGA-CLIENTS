import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { AdminDashboardClient } from "../client-view";

export const dynamic = 'force-dynamic';

async function getOrders() {
  await dbConnect();
  const orders = await Order.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(orders));
}

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect("/login");
  }

  const orders = await getOrders();

  return <AdminDashboardClient initialOrders={orders} />;
}
