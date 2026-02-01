import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { UserNav } from "@/components/user-nav";
import { ClientSidebar } from "./client-sidebar";
import { ReferenceManager } from "./reference-manager";
import { PaymentProgressClient } from "./payment-progress";

interface Reference {
  _id: string;
  firstName: string;
  lastName: string;
  price: number;
  info?: string;
  createdAt: string;
  deposit30: PaymentStatus;
  payment15_1: PaymentStatus;
  payment15_2: PaymentStatus;
}

interface PaymentStatus {
  isPaid?: boolean;
  paidAt?: string;
  dueDate?: string;
  proofUrl?: string;
}

const formatPaymentStatus = (status: any): PaymentStatus => ({
  isPaid: status?.isPaid || false,
  paidAt: status?.paidAt ? new Date(status.paidAt).toISOString() : undefined,
  dueDate: status?.dueDate ? new Date(status.dueDate).toISOString() : undefined,
  proofUrl: status?.proofUrl
});

async function getClientData(email: string) {
  await dbConnect();
  const order = await Order.findOne({ clientEmail: email });
  return order; // Can be null
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Role-based redirection
  if (session.user.role === 'admin') {
    redirect("/admin");
  }

  const order = await getClientData(session.user.email!);

  // Préparer les données pour le ReferenceManager
  const references: Reference[] = order?.references?.map((ref: any) => ({
    _id: ref._id.toString(),
    firstName: ref.firstName,
    lastName: ref.lastName,
    price: ref.price,
    info: ref.info,
    createdAt: ref.createdAt?.toISOString() || new Date().toISOString(),
    deposit30: formatPaymentStatus(ref.deposit30),
    payment15_1: formatPaymentStatus(ref.payment15_1),
    payment15_2: formatPaymentStatus(ref.payment15_2),
  })) || [];

  const totalPrice = order?.totalPrice || 0;
  const userName = order?.firstName || session.user.name?.split(' ')[0] || 'Client';

  // Legacy steps for global compatible view (optional, can be removed if strictly per-reference)
  const steps = order ? [
    { name: "Acompte", value: "30%", status: formatPaymentStatus(order.deposit30) },
    { name: "Paiement Intermédiaire", value: "15%", status: formatPaymentStatus(order.payment15_1) },
    { name: "Solde", value: "15%", status: formatPaymentStatus(order.payment15_2) },
  ] : [];

  return (
    <div className="min-h-screen bg-black text-foreground flex">
      {/* Sidebar */}
      <ClientSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
          <div className="p-8 max-w-5xl mx-auto w-full space-y-12">
            {/* Header */}
            <header className="flex justify-between items-start border-b border-zinc-800 pb-6 w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter text-white">Votre Espace</h1>
                <p className="text-zinc-500 mt-2">Bienvenue, {userName}</p>
            </div>
            <div className="flex flex-col items-end gap-4">
                <UserNav email={session.user.email!} name={session.user.name || ""} />
            </div>
            </header>

            {/* Gestionnaire de références */}
            <ReferenceManager 
              initialReferences={references}
              initialTotalPrice={totalPrice}
            />

            {/* Note: The global PaymentProgressClient might be redundant now if we show payment per reference. 
                But keeping it for now if there are global fees not covered by references, or just legacy. 
                However, user asked to "voir l'évolution pour les paiements de SES clients de référence".
            */}
          </div>
      </div>
    </div>
  );
}
