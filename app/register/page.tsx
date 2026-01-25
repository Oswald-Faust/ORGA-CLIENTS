"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        const data = await res.json();
        setError(data.message || "Une erreur est survenue.");
      }
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden relative p-4">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black z-0 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md"
      >
        <Card className="glass-panel border-white/5 shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-8">
            <CardTitle className="text-2xl font-bold tracking-tight text-white/90">Créer un compte</CardTitle>
            <CardDescription className="text-zinc-500">Rejoignez l&apos;espace client OrgaClients</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  name="name"
                  type="text"
                  placeholder="Nom complet"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email professionnel"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Téléphone (Optionnel)"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Input
                  name="password"
                  type="password"
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0"
                />
              </div>

              {error && <p className="text-red-500 text-sm pl-1">{error}</p>}
              
              <Button type="submit" variant="default" className="w-full mt-2 font-semibold" disabled={loading}>
                {loading ? "Création..." : "S'inscrire"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center gap-2 text-sm text-zinc-500 pb-6">
            <p>Déjà un compte ?</p>
            <Link href="/login" className="text-white hover:underline underline-offset-4">
              Se connecter
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
