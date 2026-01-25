"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold tracking-tight text-white mb-6">Paramètres</h2>
      <Card className="bg-zinc-900 border-white/10 max-w-2xl">
        <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
                <Label className="text-white">Nom de l'organisation</Label>
                <Input defaultValue="OrgaClients" className="bg-black/50 border-white/10 text-white" />
            </div>
             <div className="space-y-2">
                <Label className="text-white">Email Admin</Label>
                <Input defaultValue="admin@orgaclients.com" className="bg-black/50 border-white/10 text-white" />
            </div>
             <div className="space-y-2">
                <Label className="text-white">Devise</Label>
                <Input defaultValue="EUR (€)" className="bg-black/50 border-white/10 text-white" disabled />
            </div>
            <Button>Sauvegarder les modifications</Button>
        </CardContent>
      </Card>
    </div>
  );
}
