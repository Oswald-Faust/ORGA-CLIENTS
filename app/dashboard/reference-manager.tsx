"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, User, Euro, FileText, X, Check, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface PaymentStatus {
  isPaid?: boolean;
  paidAt?: string;
  dueDate?: string;
  proofUrl?: string;
}

interface Reference {
  _id: string;
  firstName: string;
  lastName: string;
  price: number;
  info?: string;
  createdAt: string;
  deposit30?: PaymentStatus;
  payment15_1?: PaymentStatus;
  payment15_2?: PaymentStatus;
}

interface ReferenceManagerProps {
  initialReferences: Reference[];
  initialTotalPrice: number;
}

export function ReferenceManager({ initialReferences, initialTotalPrice }: ReferenceManagerProps) {
  const [references, setReferences] = useState<Reference[]>(initialReferences);
  const [totalPrice, setTotalPrice] = useState<number>(initialTotalPrice);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [newTotalPrice, setNewTotalPrice] = useState(totalPrice.toString());
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    price: "",
    info: ""
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddReference = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/orders/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setReferences(data.references);
        setFormData({ firstName: "", lastName: "", price: "", info: "" });
        setShowAddForm(false);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReference = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette référence ?")) return;

    try {
      const res = await fetch(`/api/orders/references?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        setReferences(data.references);
        router.refresh();
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de connexion");
    }
  };

  const handleUpdateTotalPrice = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/total-price", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalPrice: Number(newTotalPrice) }),
      });

      if (res.ok) {
        const data = await res.json();
        setTotalPrice(data.totalPrice);
        setEditingPrice(false);
        router.refresh();
      } else {
        alert("Erreur lors de la mise à jour du prix");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  // Calculer la somme des prix des références
  const referencesTotal = references.reduce((sum, ref) => sum + ref.price, 0);

  return (
    <div className="space-y-8">
      {/* Section Prix Total TTC */}
      <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm text-zinc-500 uppercase tracking-widest mb-1">Prix Total TTC</h2>
            {editingPrice ? (
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={newTotalPrice}
                  onChange={(e) => setNewTotalPrice(e.target.value)}
                  className="w-40 bg-black/40 border-zinc-700"
                  placeholder="0"
                />
                <span className="text-zinc-400 text-lg">€</span>
                <Button 
                  onClick={handleUpdateTotalPrice} 
                  disabled={loading}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500"
                >
                  {loading ? "..." : "Valider"}
                </Button>
                <Button 
                  onClick={() => { setEditingPrice(false); setNewTotalPrice(totalPrice.toString()); }} 
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-light text-white">
                  {totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
                <Button 
                  onClick={() => setEditingPrice(true)} 
                  variant="ghost" 
                  size="sm"
                  className="text-zinc-400 hover:text-white"
                >
                  Modifier
                </Button>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Références</p>
            <p className="text-xl font-light text-zinc-300">
              {referencesTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
        </div>
      </div>

      {/* Section Références */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-zinc-300">Personnes de référence</h2>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10"
          >
            <Plus className="w-4 h-4" />
            Ajouter une référence
          </Button>
        </div>

        {/* Modal d'ajout */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-semibold text-white mb-6">Nouvelle référence</h3>
                <form onSubmit={handleAddReference} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-500 uppercase flex items-center gap-2">
                        <User className="w-3 h-3" /> Prénom
                      </label>
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Ex: Jean"
                        className="bg-black/40 border-zinc-700"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-500 uppercase flex items-center gap-2">
                        <User className="w-3 h-3" /> Nom
                      </label>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Ex: Dupont"
                        className="bg-black/40 border-zinc-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase flex items-center gap-2">
                      <Euro className="w-3 h-3" /> Prix (€)
                    </label>
                    <Input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Ex: 500"
                      className="bg-black/40 border-zinc-700"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Informations utiles
                    </label>
                    <Textarea
                      name="info"
                      value={formData.info}
                      onChange={handleChange}
                      placeholder="Notes ou informations supplémentaires..."
                      className="bg-black/40 border-zinc-700 min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-white text-black hover:bg-zinc-200"
                    >
                      {loading ? "Ajout..." : "Ajouter"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste des références */}
        {references.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
            <User className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 mb-2">Aucune référence ajoutée</p>
            <p className="text-zinc-600 text-sm">
              Cliquez sur &quot;Ajouter une référence&quot; pour commencer
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {references.map((ref, index) => (
                <motion.div
                  key={ref._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5 group hover:border-zinc-700/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-white font-medium">
                        {ref.firstName[0]}{ref.lastName[0]}
                        </div>
                        <div>
                        <h4 className="text-white font-medium">{ref.firstName} {ref.lastName}</h4>
                        <p className="text-emerald-400 text-lg mt-1">
                            {ref.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                        {ref.info && (
                            <p className="text-zinc-500 text-sm mt-2 max-w-md">{ref.info}</p>
                        )}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReference(ref._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Payment Progress Bar */}
                  <div className="mt-6 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
                          <span className="uppercase tracking-wider">État des paiements</span>
                          {(ref.deposit30?.isPaid && ref.payment15_1?.isPaid && ref.payment15_2?.isPaid) && (
                              <span className="text-emerald-500 flex items-center gap-1 font-medium">
                                  <Check className="w-3 h-3" /> Terminé
                              </span>
                          )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                          <PaymentStepBadge step="30%" label="Acompte" status={ref.deposit30} />
                          <PaymentStepBadge step="15%" label="Tranche 1" status={ref.payment15_1} />
                          <PaymentStepBadge step="15%" label="Solde" status={ref.payment15_2} />
                      </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentStepBadge({ step, label, status }: { step: string, label: string, status?: PaymentStatus }) {
    const isPaid = status?.isPaid;
    
    return (
        <div className={`
            relative p-3 rounded-lg border flex items-center gap-3 transition-colors
            ${isPaid 
                ? 'bg-emerald-500/10 border-emerald-500/20' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'}
        `}>
            <div className={`
                w-5 h-5 rounded-full flex items-center justify-center shrink-0 border
                ${isPaid ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-700 bg-zinc-800'}
            `}>
                {isPaid ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            </div>
            <div className="min-w-0">
                <div className={`text-xs font-medium ${isPaid ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {step} - {label}
                </div>
                {isPaid && status?.paidAt && (
                   <div className="text-[10px] text-emerald-500/60 truncate">
                        Le {format(new Date(status.paidAt), 'dd/MM')}
                   </div>
                )}
            </div>
        </div>
    )
}
