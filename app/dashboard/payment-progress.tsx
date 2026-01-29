"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Check } from "lucide-react";

interface PaymentStep {
  name: string;
  value: string;
  status: {
    isPaid?: boolean;
    paidAt?: string;
    dueDate?: string;
    proofUrl?: string;
  };
}

export function PaymentProgressClient({ steps }: { steps: PaymentStep[] }) {
  const [showProof, setShowProof] = useState<{ open: boolean; step: PaymentStep | null }>({
    open: false,
    step: null
  });

  return (
    <>
      <section>
        <h2 className="text-xl font-medium mb-8 text-zinc-300">Progression des paiements</h2>
        <div className="relative">
          {/* Progress Bar Background */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-800 md:hidden"></div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const isPaid = step.status?.isPaid;
              return (
                <div 
                  key={index} 
                  className={`relative p-6 rounded-xl border transition-all duration-300 ${isPaid ? 'bg-zinc-900/50 border-emerald-900/30' : 'bg-black border-zinc-900'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl font-light text-zinc-700">{step.value}</span>
                    <div className={`mt-2 px-3 py-1 text-xs rounded-full border ${isPaid ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10' : 'border-zinc-800 text-zinc-500'}`}>
                      {isPaid ? 'RÉGLÉ' : 'EN ATTENTE'}
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">{step.name}</h3>
                  {isPaid && step.status.paidAt && (
                    <p className="text-sm text-zinc-500">
                      Payé le {new Date(step.status.paidAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  {!isPaid && step.status.dueDate && (
                    <p className="text-sm text-zinc-500">
                      Échéance : {new Date(step.status.dueDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  
                  {/* Proof button */}
                  {isPaid && step.status.proofUrl && (
                    <button
                      onClick={() => setShowProof({ open: true, step })}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm w-full justify-center"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Voir la preuve de paiement
                    </button>
                  )}
                  
                  {/* Paid indicator with check */}
                  {isPaid && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Proof Modal */}
      <AnimatePresence>
        {showProof.open && showProof.step?.status.proofUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProof({ open: false, step: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowProof({ open: false, step: null })}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-white font-medium">{showProof.step.name} - Preuve de paiement</h3>
                <p className="text-sm text-zinc-400">
                  Payé le {showProof.step.status.paidAt && new Date(showProof.step.status.paidAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={showProof.step.status.proofUrl} 
                alt="Preuve de paiement"
                className="max-w-full max-h-[70vh] object-contain"
              />
              <div className="p-4 border-t border-zinc-800 bg-emerald-500/5">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-5 h-5" />
                  <span className="text-sm">Ce paiement a été validé par l&apos;administrateur</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
