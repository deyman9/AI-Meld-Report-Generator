"use client";

import Header from "./Header";

interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={user.email || ""} userName={user.name} userImage={user.image} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

