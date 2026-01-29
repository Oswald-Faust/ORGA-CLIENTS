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
}

interface PaymentStatus {
  isPaid?: boolean;
  paidAt?: Date;
  dueDate?: Date;
  proofUrl?: string;
}

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
  const references: Reference[] = order?.references?.map((ref: { _id: { toString: () => string }; firstName: string; lastName: string; price: number; info?: string; createdAt?: Date }) => ({
    _id: ref._id.toString(),
    firstName: ref.firstName,
    lastName: ref.lastName,
    price: ref.price,
    info: ref.info,
    createdAt: ref.createdAt?.toISOString() || new Date().toISOString()
  })) || [];

  const totalPrice = order?.totalPrice || 0;
  const userName = order?.firstName || session.user.name?.split(' ')[0] || 'Client';

  // Préparer les steps pour le composant PaymentProgress
  const formatPaymentStatus = (status: PaymentStatus | undefined) => ({
    isPaid: status?.isPaid || false,
    paidAt: status?.paidAt?.toISOString(),
    dueDate: status?.dueDate?.toISOString(),
    proofUrl: status?.proofUrl
  });

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

            {/* Progress Section - visible seulement si une commande existe avec des paiements */}
            {order && steps.length > 0 && (
              <PaymentProgressClient steps={steps} />
            )}


          </div>
      </div>
    </div>
  );
}
