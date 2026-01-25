import { AdminSidebar } from "./sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-black">
      <AdminSidebar />
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
