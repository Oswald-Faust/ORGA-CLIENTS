"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Save } from "lucide-react";

interface BankDetails {
  iban?: string;
  bic?: string;
  bankName?: string;
  accountHolder?: string;
}

export function BankDetailsForm({ initialDetails }: { initialDetails: BankDetails }) {
  const [details, setDetails] = useState<BankDetails>(initialDetails || {});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/orders/bank-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankDetails: details }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
            <h2 className="text-xl font-medium text-white">Vos Coordonnées Bancaires</h2>
            <p className="text-sm text-zinc-500">Nécessaire pour le suivi administratif</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
            <label className="text-xs text-zinc-500 uppercase font-medium">Titulaire du compte</label>
            <Input
                name="accountHolder"
                value={details.accountHolder || ""}
                onChange={handleChange}
                placeholder="Nom du titulaire"
                className="bg-black/40 border-zinc-700 focus:border-indigo-500/50"
            />
        </div>
        
        <div className="space-y-2">
            <label className="text-xs text-zinc-500 uppercase font-medium">Nom de la banque</label>
            <Input
                name="bankName"
                value={details.bankName || ""}
                onChange={handleChange}
                placeholder="Ex: BNP Paribas"
                className="bg-black/40 border-zinc-700 focus:border-indigo-500/50"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase font-medium">IBAN</label>
                <Input
                name="iban"
                value={details.iban || ""}
                onChange={handleChange}
                placeholder="FR76 ..."
                className="bg-black/40 border-zinc-700 font-mono focus:border-indigo-500/50"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase font-medium">BIC/SWIFT</label>
                <Input
                name="bic"
                value={details.bic || ""}
                onChange={handleChange}
                placeholder="BNPARPP..."
                className="bg-black/40 border-zinc-700 font-mono focus:border-indigo-500/50"
                />
            </div>
        </div>

        <div className="pt-4 flex justify-end">
            <Button 
                type="submit" 
                disabled={loading}
                className={`min-w-[120px] transition-all duration-300 ${success ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white text-black hover:bg-zinc-200'}`}
            >
                {loading ? "Enregistrement..." : success ? "Enregistré !" : "Enregistrer"}
            </Button>
        </div>
      </form>
    </div>
  );
}
