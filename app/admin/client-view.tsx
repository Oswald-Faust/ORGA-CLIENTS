"use client";

import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Check, X, Users, Trash2 } from "lucide-react";

interface Order {
  _id: string;
  clientEmail: string;
  firstName: string;
  lastName: string;
  totalPrice: number;
  seller: string;
  deposit30: { isPaid: boolean; paidAt?: string; dueDate?: string };
  payment15_1: { isPaid: boolean; paidAt?: string; dueDate?: string };
  payment15_2: { isPaid: boolean; paidAt?: string; dueDate?: string };
}
interface PaymentStatus {
  isPaid: boolean;
  paidAt?: string;
  dueDate?: string;
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

  const togglePaymentStatus = async (orderId: string, field: string, currentStatus: boolean) => {
    // Optimistic update
    const updatedOrders = orders.map(o => {
        if (o._id === orderId) {
            // @ts-expect-error - Dynamic field access
            const updatedField = { ...o[field], isPaid: !currentStatus, paidAt: !currentStatus ? new Date().toISOString() : null };
            return { ...o, [field]: updatedField };
        }
        return o;
    });
    setOrders(updatedOrders);
    
    // Update selected order if it's the one being modified
    if (selectedOrder && selectedOrder._id === orderId) {
         // @ts-expect-error - Dynamic field access
         const updatedField = { ...selectedOrder[field], isPaid: !currentStatus, paidAt: !currentStatus ? new Date().toISOString() : null };
         setSelectedOrder({ ...selectedOrder, [field]: updatedField });
    }

    // Call API
    try {
        await fetch(`/api/orders/${orderId}`, { 
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field, isPaid: !currentStatus }) 
        });
    } catch (error) {
        console.error("Failed to update order", error);
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
          {filteredOrders.map(order => (
            <div 
                key={order._id}
                onClick={() => { setSelectedOrder(order); setIsEditing(false); }}
                className={`p-4 border-b border-white/5 cursor-pointer hover:bg-zinc-900/50 transition-colors group ${selectedOrder?._id === order._id ? 'bg-zinc-900 border-l-2 border-l-white' : ''}`}
            >
                <div className="flex justify-between items-start mb-1">
                    <span className={`font-medium transition-colors ${selectedOrder?._id === order._id ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                        {order.firstName} {order.lastName}
                    </span>
                    <span className="text-xs text-zinc-500">{order.seller}</span>
                </div>
                <div className="text-sm text-zinc-500 truncate mb-3">{order.clientEmail}</div>
                
                {/* Visual Status Indicator */}
                <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded-full ${order.deposit30?.isPaid ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                    <div className={`h-1 flex-1 rounded-full ${order.payment15_1?.isPaid ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                    <div className={`h-1 flex-1 rounded-full ${order.payment15_2?.isPaid ? 'bg-emerald-500' : 'bg-zinc-800'}`} /> 
                </div>
            </div>
          ))}
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
                            onToggle={() => togglePaymentStatus(selectedOrder._id, 'deposit30', selectedOrder.deposit30.isPaid)}
                        />
                        <PaymentControlRow 
                            label="Tranche 1 (15%)" 
                            amount={(isEditing ? Number(editForm.totalPrice) : selectedOrder.totalPrice) * 0.15} 
                            status={selectedOrder.payment15_1} 
                            onToggle={() => togglePaymentStatus(selectedOrder._id, 'payment15_1', selectedOrder.payment15_1.isPaid)}
                        />
                         <PaymentControlRow 
                            label="Tranche 2 (15%)" 
                            amount={(isEditing ? Number(editForm.totalPrice) : selectedOrder.totalPrice) * 0.15} 
                            status={selectedOrder.payment15_2} 
                            onToggle={() => togglePaymentStatus(selectedOrder._id, 'payment15_2', selectedOrder.payment15_2.isPaid)}
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
                                {/* Add more client info here if needed */}
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

function PaymentControlRow({ label, amount, status, onToggle }: { label: string, amount: number, status: PaymentStatus, onToggle: () => void }) {
    const isPaid = status?.isPaid;
    return (
        <div className="flex items-center justify-between p-6 rounded-xl bg-zinc-900/20 border border-white/5 hover:border-white/10 transition-colors">
            <div>
                <div className="text-lg font-medium text-white">{label}</div>
                <div className="text-zinc-500">{amount.toFixed(2)} €</div>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right">
                    {isPaid ? (
                        <div className="text-emerald-500 font-medium">Réglé</div>
                    ) : (
                        <div className="text-amber-500 font-medium">En attente</div>
                    )}
                    {status?.dueDate && <div className="text-xs text-zinc-600">Échéance : {format(new Date(status.dueDate), 'dd/MM/yyyy')}</div>}
                </div>
                <Button 
                    variant={isPaid ? "outline" : "default"} 
                    className={isPaid ? "border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10" : "bg-white text-black hover:bg-zinc-200"}
                    onClick={onToggle}
                >
                    {isPaid ? "Marquer non payé" : "Valider paiement"}
                </Button>
            </div>
        </div>
    )
}
