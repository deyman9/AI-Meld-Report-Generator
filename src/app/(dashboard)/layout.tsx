import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardLayout user={user}>
      {children}
    </DashboardLayout>
  );
}

