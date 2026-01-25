"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function InvoicesPage() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold tracking-tight text-white mb-6">Factures</h2>
      <Card className="bg-zinc-900 border-white/10">
        <CardContent className="p-6">
            <div className="text-center text-zinc-500 py-12">
                Aucune facture générée pour le moment.
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
