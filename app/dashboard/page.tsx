import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { OnboardingForm } from "./onboarding-form";
import { UserNav } from "@/components/user-nav";
import { ClientSidebar } from "./client-sidebar";

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

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white p-6 relative flex">
         <ClientSidebar />
         <div className="flex-1 flex flex-col">
             <div className="absolute top-6 right-6">
                 <UserNav email={session.user.email!} name={session.user.name || ""} />
             </div>
             <OnboardingForm userEmail={session.user.email!} userName={session.user.name || ""} />
         </div>
      </div>
    );
  }

  const steps = [
    { name: "Acompte", value: "30%", status: order.deposit30 },
    { name: "Paiement Intermédiaire", value: "15%", status: order.payment15_1 },
    { name: "Solde", value: "15%", status: order.payment15_2 },
  ];

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
                <p className="text-zinc-500 mt-2">Bienvenue, {order.firstName || session.user.name}</p>
            </div>
            <div className="flex flex-col items-end gap-4">
                <UserNav email={session.user.email!} name={session.user.name || ""} />
                <div className="text-right mt-4">
                    <div className="text-sm text-zinc-500 uppercase tracking-widest">Montant Total</div>
                    <div className="text-2xl font-light text-white">{order.totalPrice?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
                </div>
            </div>
            </header>

            {/* Progress Section */}
            <section>
            <h2 className="text-xl font-medium mb-8 text-zinc-300">Progression des paiements</h2>
            <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-800 md:hidden"></div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => {
                    const isPaid = step.status?.isPaid;
                    return (
                        <div key={index} className={`relative p-6 rounded-xl border transition-all duration-300 ${isPaid ? 'bg-zinc-900/50 border-emerald-900/30' : 'bg-black border-zinc-900'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <span className="text-4xl font-light text-zinc-700">{step.value}</span>
                                <div className={`mt-2 px-3 py-1 text-xs rounded-full border ${isPaid ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10' : 'border-zinc-800 text-zinc-500'}`}>
                                    {isPaid ? 'RÉGLÉ' : 'EN ATTENTE'}
                                </div>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">{step.name}</h3>
                            {isPaid && step.status.paidAt && (
                                <p className="text-sm text-zinc-500">Payé le {new Date(step.status.paidAt).toLocaleDateString('fr-FR')}</p>
                            )}
                            {!isPaid && step.status.dueDate && (
                                <p className="text-sm text-zinc-500">Échéance : {new Date(step.status.dueDate).toLocaleDateString('fr-FR')}</p>
                            )}
                        </div>
                    )
                    })}
                </div>
            </div>
            </section>


          </div>
      </div>
    </div>
  );
}
