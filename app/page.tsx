"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative selection:bg-white/20">
      
      {/* Abstract Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tighter">ORGA<span className="text-zinc-500">CLIENTS</span></div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-sm">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button variant="glass" className="text-sm">Créer un compte</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-emerald-400 uppercase border border-emerald-500/20 rounded-full bg-emerald-500/10 backdrop-blur-sm">
            Service Premium
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Suivez vos données <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-600">en toute transparence.</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-lg text-zinc-500 leading-relaxed">
            Un espace dédié pour consulter vos documents, suivre l&apos;avancement financier de vos commandes et interagir avec votre expert.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-base bg-white text-black hover:bg-zinc-200">
                Commencer maintenant
              </Button>
            </Link>
             <Link href="/login">
              <Button variant="outline" size="lg" className="h-14 px-8 text-base border-zinc-800 text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/20">
                Accéder à mon espace
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid Mini */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full"
        >
          {[
            { title: "Suivi Financier", desc: "Visualisez vos acomptes et soldes en temps réel." },
            { title: "Documents Centralisés", desc: "Retrouvez tous vos PDF et factures au même endroit." },
            { title: "Interface Sécurisée", desc: "Accès personnel protégé par authentification forte." }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left">
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-zinc-600 text-sm border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} OrgaClients. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
