"use client";

import { useState, useRef } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Check, X, Users, Trash2, User, Euro, FileText, Upload, Image as ImageIcon } from "lucide-react";

interface Reference {
  _id: string;
  firstName: string;
  lastName: string;
  price: number;
  info?: string;
  createdAt: string;
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
  deposit30: { isPaid: boolean; paidAt?: string; dueDate?: string; proofUrl?: string };
  payment15_1: { isPaid: boolean; paidAt?: string; dueDate?: string; proofUrl?: string };
  payment15_2: { isPaid: boolean; paidAt?: string; dueDate?: string; proofUrl?: string };
  hasOrder?: boolean;
  phone?: string;
  createdAt?: string;
}
interface PaymentStatus {
  isPaid: boolean;
  paidAt?: string;
  dueDate?: string;
  proofUrl?: string;
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

  // Callback pour mettre à jour l'ordre après l'upload d'une preuve
  const handlePaymentUpdate = (orderId: string, field: string, proofUrl: string) => {
    const updatedOrders = orders.map(o => {
      if (o._id === orderId) {
        // @ts-expect-error - Dynamic field access
        const updatedField = { ...o[field], isPaid: true, paidAt: new Date().toISOString(), proofUrl };
        return { ...o, [field]: updatedField };
      }
      return o;
    });
    setOrders(updatedOrders);
    
    // Update selected order if it's the one being modified
    if (selectedOrder && selectedOrder._id === orderId) {
      // @ts-expect-error - Dynamic field access
      const updatedField = { ...selectedOrder[field], isPaid: true, paidAt: new Date().toISOString(), proofUrl };
      setSelectedOrder({ ...selectedOrder, [field]: updatedField });
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
                          <span className="text-zinc-600">TTC:</span>
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
                  
                  {/* Visual Status Indicator - Only show if order exists */}
                  {order.hasOrder && (
                      <div className="flex gap-1">
                          <div className={`h-1 flex-1 rounded-full ${order.deposit30?.isPaid ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                          <div className={`h-1 flex-1 rounded-full ${order.payment15_1?.isPaid ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                          <div className={`h-1 flex-1 rounded-full ${order.payment15_2?.isPaid ? 'bg-emerald-500' : 'bg-zinc-800'}`} /> 
                      </div>
                  )}
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
                    <div className="flex justify-between items-start mb-12">
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

                    <div className="grid grid-cols-1 gap-6 mb-12">
                        <PaymentControlRow 
                            label="Acompte 30%" 
                            amount={(isEditing ? Number(editForm.totalPrice) : selectedOrder.totalPrice) * 0.3} 
                            status={selectedOrder.deposit30}
                            orderId={selectedOrder._id}
                            paymentField="deposit30"
                            onPaymentUpdate={(field, proofUrl) => handlePaymentUpdate(selectedOrder._id, field, proofUrl)}
                        />
                        <PaymentControlRow 
                            label="Tranche 1 (15%)" 
                            amount={(isEditing ? Number(editForm.totalPrice) : selectedOrder.totalPrice) * 0.15} 
                            status={selectedOrder.payment15_1}
                            orderId={selectedOrder._id}
                            paymentField="payment15_1"
                            onPaymentUpdate={(field, proofUrl) => handlePaymentUpdate(selectedOrder._id, field, proofUrl)}
                        />
                         <PaymentControlRow 
                            label="Tranche 2 (15%)" 
                            amount={(isEditing ? Number(editForm.totalPrice) : selectedOrder.totalPrice) * 0.15} 
                            status={selectedOrder.payment15_2}
                            orderId={selectedOrder._id}
                            paymentField="payment15_2"
                            onPaymentUpdate={(field, proofUrl) => handlePaymentUpdate(selectedOrder._id, field, proofUrl)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
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
                                <h3 className="text-xl font-medium text-white">Personnes de référence</h3>
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
                            <div className="space-y-3">
                                {selectedOrder.references.map((ref, index) => (
                                    <motion.div
                                        key={ref._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start justify-between p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:border-zinc-700/50 transition-all"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-white font-medium text-sm">
                                                {ref.firstName[0]}{ref.lastName[0]}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-medium">{ref.firstName} {ref.lastName}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Euro className="w-3 h-3 text-emerald-500" />
                                                    <span className="text-emerald-400">
                                                        {ref.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                    </span>
                                                </div>
                                                {ref.info && (
                                                    <div className="flex items-start gap-2 mt-2">
                                                        <FileText className="w-3 h-3 text-zinc-500 mt-0.5 shrink-0" />
                                                        <p className="text-zinc-500 text-sm max-w-md">{ref.info}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs text-zinc-600">
                                            {ref.createdAt && format(new Date(ref.createdAt), 'dd/MM/yyyy')}
                                        </div>
                                    </motion.div>
                                ))}
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
    paymentField,
    onPaymentUpdate
}: { 
    label: string, 
    amount: number, 
    status: PaymentStatus, 
    orderId: string,
    paymentField: string,
    onPaymentUpdate: (field: string, proofUrl: string) => void
}) {
    const isPaid = status?.isPaid;
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
            <div className="flex items-center justify-between p-6 rounded-xl bg-zinc-900/20 border border-white/5 hover:border-white/10 transition-colors">
                <div>
                    <div className="text-lg font-medium text-white">{label}</div>
                    <div className="text-zinc-500">{amount.toFixed(2)} €</div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Proof indicator */}
                    {status?.proofUrl && (
                        <button
                            onClick={() => setShowProof(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm"
                        >
                            <ImageIcon className="w-4 h-4" />
                            Voir preuve
                        </button>
                    )}
                    
                    <div className="text-right">
                        {isPaid ? (
                            <div className="text-emerald-500 font-medium">Réglé</div>
                        ) : (
                            <div className="text-amber-500 font-medium">En attente</div>
                        )}
                        {status?.paidAt && <div className="text-xs text-zinc-600">Payé le {format(new Date(status.paidAt), 'dd/MM/yyyy')}</div>}
                        {!isPaid && status?.dueDate && <div className="text-xs text-zinc-600">Échéance : {format(new Date(status.dueDate), 'dd/MM/yyyy')}</div>}
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
                                className="bg-white text-black hover:bg-zinc-200 gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                {uploading ? "Upload..." : "Valider avec preuve"}
                            </Button>
                        </>
                    )}
                    
                    {isPaid && !status?.proofUrl && (
                        <span className="text-xs text-zinc-500 italic">Sans preuve</span>
                    )}
                </div>
            </div>

            {/* Proof Modal */}
            <AnimatePresence>
                {showProof && status?.proofUrl && (
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
                                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="bg-zinc-900 p-4 border-b border-zinc-800">
                                <h3 className="text-white font-medium">{label} - Preuve de paiement</h3>
                                <p className="text-sm text-zinc-400">Payé le {status.paidAt && format(new Date(status.paidAt), 'dd/MM/yyyy à HH:mm')}</p>
                            </div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={status.proofUrl} 
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

