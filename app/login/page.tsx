"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/dashboard"); // Redirect logic will handle role-based routing later or here
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden relative">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black z-0 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md px-4"
      >
        <Card className="glass-panel border-white/5 shadow-2xl shadow-black/50">
          <CardHeader className="space-y-1 text-center pb-8">
            <CardTitle className="text-2xl font-bold tracking-tight text-white/90">Bienvenue</CardTitle>
            <CardDescription className="text-zinc-500">Connectez-vous à votre espace personnel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0"
                />
              </div>
              {error && <p className="text-red-500 text-sm pl-1">{error}</p>}
            <Button type="submit" variant="default" className="w-full mt-4 font-semibold">
                Se connecter
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 justify-center text-xs text-zinc-600 pb-6">
             <div className="flex gap-2 text-sm">
                <span className="text-zinc-500">Pas encore de compte ?</span>
                <a href="/register" className="text-white hover:underline underline-offset-4">
                  Créer un compte
                </a>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
