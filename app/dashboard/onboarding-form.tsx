"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function OnboardingForm({ userEmail, userName }: { userEmail: string, userName: string }) {
  const [formData, setFormData] = useState({
    firstName: userName.split(' ')[0] || "",
    lastName: userName.split(' ').slice(1).join(' ') || "",
    totalPrice: "",
    itemCount: 1,
    seller: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           ...formData,
           clientEmail: userEmail
        }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Erreur lors de la création du dossier.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-lg glass-panel border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Finaliser les informations</CardTitle>
          <CardDescription className="text-zinc-400">
            Veuillez compléter les informations de votre commande pour activer votre suivi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase font-medium">Prénom</label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Ex: Alice"
                  className="bg-black/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase font-medium">Nom</label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Ex: Dupont"
                  className="bg-black/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-500 uppercase font-medium">Prix Total TTC (€)</label>
              <Input
                name="totalPrice"
                type="number"
                value={formData.totalPrice}
                onChange={handleChange}
                placeholder="Ex: 15000"
                className="bg-black/20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase font-medium">Nombre d&apos;items</label>
                <Input
                  name="itemCount"
                  type="number"
                  value={formData.itemCount}
                  onChange={handleChange}
                  className="bg-black/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase font-medium">Vendeur</label>
                <Input
                  name="seller"
                  value={formData.seller}
                  onChange={handleChange}
                  placeholder="Ex: Jean"
                  className="bg-black/20"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? "Création en cours..." : "Valider mon dossier"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
