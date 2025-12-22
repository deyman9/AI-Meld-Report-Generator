import { getCurrentUser } from "@/lib/auth/session";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return <DashboardContent userName={user?.name} />;
}
