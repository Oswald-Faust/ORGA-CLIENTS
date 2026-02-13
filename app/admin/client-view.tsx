"use client";

import { useState, useRef } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Check, X, Users, Trash2, User, Euro, FileText, Upload, Image as ImageIcon } from "lucide-react";

interface PaymentStatus {
  isPaid: boolean;
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
  bankDetails?: {
    iban?: string;
    bic?: string;
    bankName?: string;
    accountHolder?: string;
  };
  deposit70: PaymentStatus;
  payment15_1: PaymentStatus;
  payment15_2: PaymentStatus;
}

interface Order {
  _id: string;
  orderId?: string | null;
  userId?: string;
  clientEmail: string;
  firstName: string;
  lastName: string;
  totalPrice: number;
  seller: string;
  references?: Reference[];
  hasOrder?: boolean;
  phone?: string;
  createdAt?: string;
}

export function AdminDashboardClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Order>>({});

  const filteredOrders = orders.filter(order => 
    order.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (order: Order) => {
    setEditForm(order);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder || !editForm) return;

    // Optimistic Update
    const updatedOrder = { ...selectedOrder, ...editForm };
    
    // Update local state lists
    const updatedOrders = orders.map(o => o._id === selectedOrder._id ? updatedOrder as Order : o);
    setOrders(updatedOrders);
    setSelectedOrder(updatedOrder as Order);

    setIsEditing(false);

    try {
      const response = await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }
    } catch (error) {
      console.error("Error updating order:", error);
      // Revert optimistic update? For now, we'll just log the error.
      // In a real app we might want to show a toast notification.
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.");
    if (!confirmed) return;

    try {
        const res = await fetch(`/api/orders/${selectedOrder._id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Failed to delete");
        
        const newOrders = orders.filter(o => o._id !== selectedOrder._id);
        setOrders(newOrders);
        setSelectedOrder(null);
        setIsEditing(false);
    } catch (error) {
        console.error("Delete failed", error);
        alert("Erreur lors de la suppression");
    }
  };

  // Callback pour mettre à jour l'ordre après l'upload d'une preuve ou toggle de paiement
  const handleReferencePaymentUpdate = (orderId: string, referenceId: string, field: string, data: { isPaid?: boolean, proofUrl?: string }) => {
    // Helper to update the specific reference in an order
    const updateOrderReferences = (order: Order) => {
        if (!order.references) return order;
        const newReferences = order.references.map(ref => {
            if (ref._id === referenceId) {
                // @ts-expect-error - Dynamic field access
                const currentField = ref[field] || {};
                const updatedField = { 
                    ...currentField, 
                    ...data,
                    paidAt: data.isPaid ? new Date().toISOString() : currentField.paidAt,
                 };
                 // If toggling to unpaid, remove paidAt
                 if (data.isPaid === false) updatedField.paidAt = null;

                return { ...ref, [field]: updatedField };
            }
            return ref;
        });
        return { ...order, references: newReferences };
    };

    const updatedOrders = orders.map(o => {
      if (o._id === orderId) {
        return updateOrderReferences(o);
      }
      return o;
    });
    setOrders(updatedOrders);
    
    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder(updateOrderReferences(selectedOrder));
    }
  };

  return (
    <div className="flex h-full bg-black text-foreground overflow-hidden">
      
      {/* 2. Client List Sidebar */}
      <div className="w-80 border-r border-white/10 flex flex-col h-full bg-[#0a0a0a]">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-white mb-4">Clients</h1>
          <Input 
            placeholder="Rechercher..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-zinc-900 border-zinc-800 focus:bg-black transition-colors"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">
              <p>Aucun client trouvé</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div 
                  key={order._id}
                  onClick={() => { setSelectedOrder(order); setIsEditing(false); }}
                  className={`p-4 border-b border-white/5 cursor-pointer hover:bg-zinc-900/50 transition-colors group ${selectedOrder?._id === order._id ? 'bg-zinc-900 border-l-2 border-l-white' : ''}`}
              >
                  <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                          <span className={`font-medium transition-colors ${selectedOrder?._id === order._id ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                              {order.firstName || order.lastName ? `${order.firstName} ${order.lastName}`.trim() : 'Nouveau client'}
                          </span>
                          {!order.hasOrder && (
                              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded">NOUVEAU</span>
                          )}
                      </div>
                      {order.seller && <span className="text-xs text-zinc-500">{order.seller}</span>}
                  </div>
                  <div className="text-sm text-zinc-500 truncate mb-2">{order.clientEmail}</div>
                  
                  {/* Infos Prix et Références */}
                  <div className="flex justify-between items-center mb-3 text-xs">
                      <div className="flex items-center gap-2">
                          <span className="text-zinc-600">Total:</span>
                          <span className={`font-medium ${order.totalPrice > 0 ? 'text-emerald-500' : 'text-zinc-600'}`}>
                              {order.totalPrice > 0 ? `${order.totalPrice.toLocaleString('fr-FR')} €` : 'Non défini'}
                          </span>
                      </div>
                      {order.references && order.references.length > 0 && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800/50 rounded-full">
                              <User className="w-3 h-3 text-zinc-500" />
                              <span className="text-zinc-400">{order.references.length}</span>
                          </div>
                      )}
                  </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Main Detail View */}
      <div className="flex-1 h-screen overflow-y-auto bg-black relative">
        <AnimatePresence mode="wait">
            {selectedOrder ? (
                <motion.div 
                    key={selectedOrder._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-12 max-w-5xl mx-auto"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div className="space-y-1">
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <Input 
                                        value={editForm.firstName} 
                                        onChange={e => setEditForm({...editForm, firstName: e.target.value})} 
                                        className="text-3xl font-bold h-auto py-2 w-40 bg-zinc-900 border-zinc-700"
                                    />
                                    <Input 
                                        value={editForm.lastName} 
                                        onChange={e => setEditForm({...editForm, lastName: e.target.value})} 
                                        className="text-3xl font-bold h-auto py-2 w-40 bg-zinc-900 border-zinc-700"
                                    />
                                </div>
                            ) : (
                                <h2 className="text-4xl font-bold text-white max-w-2xl">{selectedOrder.firstName} {selectedOrder.lastName}</h2>
                            )}
                            <p className="text-zinc-500 font-mono text-sm">{selectedOrder._id}</p>
                        </div>

                        <div className="flex flex-col items-end gap-4">
                             <div className="text-right">
                                 {isEditing ? (
                                    <div className="flex items-center gap-2 justify-end mb-1">
                                        <Input 
                                            type="number"
                                            value={editForm.totalPrice} 
                                            onChange={e => setEditForm({...editForm, totalPrice: Number(e.target.value)})} 
                                            className="text-2xl font-light text-right w-32 bg-zinc-900 border-zinc-700"
                                        />
                                        <span className="text-2xl text-white">€</span>
                                    </div>
                                 ) : (
                                     <div className="text-3xl font-light text-white">{selectedOrder.totalPrice?.toLocaleString()} €</div>
                                 )}
                                 <div className="text-zinc-500 text-sm">Total Commande</div>
                             </div>
                             
                             {!isEditing && (
                                 <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(selectedOrder)} className="text-zinc-400 hover:text-white border border-white/10">
                                        <Pencil className="w-3 h-3 mr-2" />
                                        Modifier infos
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-400 hover:bg-red-900/10 border border-white/5">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                 </div>
                             )}
                             {isEditing && (
                                 <div className="flex gap-2">
                                     <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-red-400 hover:bg-red-900/20">
                                         <X className="w-4 h-4" />
                                     </Button>
                                     <Button size="sm" onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-700">
                                         <Check className="w-4 h-4 mr-2" />
                                         Enregistrer
                                     </Button>
                                 </div>
                             )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-12">
                        <Card className="p-6 bg-zinc-900/30 border-white/5">
                            <h3 className="text-lg font-medium text-white mb-4">Infos Client</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-zinc-600 uppercase">Email</label>
                                    <p className="text-zinc-300">{selectedOrder.clientEmail}</p>
                                </div>
                                {selectedOrder.phone && (
                                    <div>
                                        <label className="text-xs text-zinc-600 uppercase">Téléphone</label>
                                        <p className="text-zinc-300">{selectedOrder.phone}</p>
                                    </div>
                                )}
                                {selectedOrder.createdAt && (
                                    <div>
                                        <label className="text-xs text-zinc-600 uppercase">Inscrit le</label>
                                        <p className="text-zinc-300">{format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy à HH:mm')}</p>
                                    </div>
                                )}
                                {!selectedOrder.hasOrder && (
                                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                        <p className="text-amber-400 text-sm">Ce client n&apos;a pas encore configuré sa commande</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                        <Card className="p-6 bg-zinc-900/30 border-white/5">
                            <h3 className="text-lg font-medium text-white mb-4">Vendeur</h3>
                            <div>
                                <label className="text-xs text-zinc-600 uppercase">Responsable</label>
                                {isEditing ? (
                                    <Input 
                                        value={editForm.seller || ""} 
                                        onChange={e => setEditForm({...editForm, seller: e.target.value})} 
                                        className="mt-1 bg-zinc-900 border-zinc-700"
                                    />
                                ) : (
                                    <p className="text-white mt-1">{selectedOrder.seller || "Non assigné"}</p>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Section Références */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-zinc-500" />
                                <h3 className="text-xl font-medium text-white">Personnes de référence & Paiements</h3>
                                <span className="px-2 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400">
                                    {selectedOrder.references?.length || 0}
                                </span>
                            </div>
                            {selectedOrder.references && selectedOrder.references.length > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-zinc-500">Total références:</span>
                                    <span className="text-emerald-400 font-medium">
                                        {selectedOrder.references.reduce((sum, ref) => sum + ref.price, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                    </span>
                                </div>
                            )}
                        </div>

                        {!selectedOrder.references || selectedOrder.references.length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl">
                                <User className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                                <p className="text-zinc-600 text-sm">Aucune référence ajoutée par le client</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {selectedOrder.references.map((ref, index) => {
                                    const payments = [ref.deposit70, ref.payment15_1, ref.payment15_2];
                                    const completedPayments = payments.filter(p => p?.isPaid).length;
                                    const isFullyPaid = completedPayments === 3;

                                    return (
                                    <motion.div
                                        key={ref._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`bg-zinc-900/40 border rounded-xl p-6 transition-colors ${
                                            isFullyPaid ? 'border-zinc-800/20 bg-zinc-900/20' : 'border-zinc-800/50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-6 border-b border-white/5 pb-4">
                                            <div className={`flex items-start gap-4 ${isFullyPaid ? 'opacity-50' : ''}`}>
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white font-medium text-lg relative">
                                                    {ref.firstName[0]}{ref.lastName[0]}
                                                    {isFullyPaid && (
                                                        <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 border border-black">
                                                            <Check className="w-3 h-3 text-black" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className={`text-xl font-medium ${isFullyPaid ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-white'}`}>
                                                        {ref.firstName} {ref.lastName}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Euro className={`w-4 h-4 ${isFullyPaid ? 'text-zinc-600' : 'text-emerald-500'}`} />
                                                        <span className={`font-medium ${isFullyPaid ? 'text-zinc-600 line-through decoration-zinc-700' : 'text-emerald-400'}`}>
                                                            {ref.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                        </span>
                                                    </div>
                                                    {ref.info && (
                                                        <p className="text-zinc-500 text-sm mt-1">{ref.info}</p>
                                                    )}
                                                </div>
                                            </div>
                                            

                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-xs text-zinc-600">
                                                    Ajouté le {ref.createdAt && format(new Date(ref.createdAt), 'dd/MM/yyyy')}
                                                </div>
                                                {/* Progress Bar */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-500 ${isFullyPaid ? 'bg-zinc-600' : 'bg-emerald-500'}`}
                                                            style={{ width: `${(completedPayments / 3) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs font-medium ${isFullyPaid ? 'text-zinc-600' : 'text-emerald-500'}`}>
                                                        {completedPayments}/3
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bank Details Display */}
                                        {ref.bankDetails && (ref.bankDetails.iban || ref.bankDetails.bic) && (
                                            <div className="mb-6 p-4 bg-zinc-950/50 rounded-lg border border-white/5 text-sm">
                                                <p className="text-zinc-500 font-medium mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
                                                    <span className="w-1 h-1 bg-zinc-500 rounded-full"></span>
                                                    Coordonnées Bancaires
                                                </p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                                    {ref.bankDetails.accountHolder && (
                                                        <div className="space-y-0.5">
                                                            <span className="text-xs text-zinc-600 block">Titulaire</span>
                                                            <span className="text-zinc-300 font-mono select-all bg-zinc-900/50 px-2 py-0.5 rounded">{ref.bankDetails.accountHolder}</span>
                                                        </div>
                                                    )}
                                                    {ref.bankDetails.bankName && (
                                                        <div className="space-y-0.5">
                                                            <span className="text-xs text-zinc-600 block">Banque</span>
                                                            <span className="text-zinc-300 font-mono select-all bg-zinc-900/50 px-2 py-0.5 rounded">{ref.bankDetails.bankName}</span>
                                                        </div>
                                                    )}
                                                    {ref.bankDetails.iban && (
                                                        <div className="space-y-0.5 md:col-span-2">
                                                            <span className="text-xs text-zinc-600 block">IBAN</span>
                                                            <span className="text-zinc-300 font-mono select-all bg-zinc-900/50 px-2 py-0.5 rounded w-full block">{ref.bankDetails.iban}</span>
                                                        </div>
                                                    )}
                                                    {ref.bankDetails.bic && (
                                                        <div className="space-y-0.5">
                                                            <span className="text-xs text-zinc-600 block">BIC</span>
                                                            <span className="text-zinc-300 font-mono select-all bg-zinc-900/50 px-2 py-0.5 rounded">{ref.bankDetails.bic}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Payment Controls for this reference - Only show if not fully paid (or maybe always allow editing but initially collapsed?) - User said "crossed out" imply finished. Let's keep them accessible but maybe less prominent if done. I'll keep them visible for now so Admin can uncheck if needed. */}
                                        <div className={`grid grid-cols-1 gap-4 ${isFullyPaid ? 'opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0' : ''}`}>
                                            <PaymentControlRow 
                                                label="Acompte 70%" 
                                                amount={ref.price * 0.7} 
                                                status={ref.deposit70}
                                                orderId={selectedOrder._id}
                                                referenceId={ref._id}
                                                paymentField="deposit70"
                                                onPaymentUpdate={(field, proofUrl) => handleReferencePaymentUpdate(selectedOrder._id, ref._id, field, { isPaid: true, proofUrl })}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <PaymentControlRow 
                                                    label="Tranche 1 (15%)" 
                                                    amount={ref.price * 0.15} 
                                                    status={ref.payment15_1}
                                                    orderId={selectedOrder._id}
                                                    referenceId={ref._id}
                                                    paymentField="payment15_1"
                                                    onPaymentUpdate={(field, proofUrl) => handleReferencePaymentUpdate(selectedOrder._id, ref._id, field, { isPaid: true, proofUrl })}
                                                />
                                                <PaymentControlRow 
                                                    label="Tranche 2 (15%)" 
                                                    amount={ref.price * 0.15} 
                                                    status={ref.payment15_2}
                                                    orderId={selectedOrder._id}
                                                    referenceId={ref._id}
                                                    paymentField="payment15_2"
                                                    onPaymentUpdate={(field, proofUrl) => handleReferencePaymentUpdate(selectedOrder._id, ref._id, field, { isPaid: true, proofUrl })}
                                                />
                                            </div>
                                        </div>

                                    </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </motion.div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                        <Users className="w-8 h-8 text-zinc-700" />
                    </div>
                    <p>Sélectionnez un client pour voir les détails</p>
                </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PaymentControlRow({ 
    label, 
    amount, 
    status, 
    orderId,
    referenceId,
    paymentField,
    onPaymentUpdate
}: { 
    label: string, 
    amount: number, 
    status: PaymentStatus, 
    orderId: string,
    referenceId: string,
    paymentField: string,
    onPaymentUpdate: (field: string, proofUrl: string) => void
}) {
    // Default to unpaid if status is undefined (e.g. migration)
    const currentStatus = status || { isPaid: false };
    const isPaid = currentStatus.isPaid;
    
    const [uploading, setUploading] = useState(false);
    const [showProof, setShowProof] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('L\'image doit faire moins de 5MB');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('orderId', orderId);
            formData.append('referenceId', referenceId);
            formData.append('paymentField', paymentField);

            const res = await fetch('/api/orders/upload-proof', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                onPaymentUpdate(paymentField, data.proofUrl);
            } else {
                const error = await res.json();
                alert(error.message || 'Erreur lors de l\'upload');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erreur lors de l\'upload');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <>
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors">
                <div>
                    <div className="text-sm font-medium text-white">{label}</div>
                    <div className="text-xs text-zinc-500">{amount.toFixed(2)} €</div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Proof indicator */}
                    {currentStatus?.proofUrl && (
                        <button
                            onClick={() => setShowProof(true)}
                            className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs"
                        >
                            <ImageIcon className="w-3 h-3" />
                            Voir preuve
                        </button>
                    )}
                    
                    <div className="text-right">
                        {isPaid ? (
                            <div className="text-emerald-500 font-medium text-sm">Réglé</div>
                        ) : (
                            <div className="text-amber-500 font-medium text-sm">En attente</div>
                        )}
                        {currentStatus?.paidAt && <div className="text-[10px] text-zinc-600">Payé le {format(new Date(currentStatus.paidAt), 'dd/MM/yyyy')}</div>}
                    </div>
                    
                    {/* Upload button */}
                    {!isPaid && (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs bg-transparent border-zinc-700 text-zinc-300 hover:text-white"
                            >
                                <Upload className="w-3 h-3 mr-2" />
                                {uploading ? "..." : "Valider"}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Proof Modal */}
            <AnimatePresence>
                {showProof && currentStatus?.proofUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowProof(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowProof(false)}
                                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="bg-zinc-900 p-3 border-b border-zinc-800">
                                <h3 className="text-white text-sm font-medium">{label} - Preuve de paiement</h3>
                            </div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={currentStatus.proofUrl} 
                                alt="Preuve de paiement"
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
