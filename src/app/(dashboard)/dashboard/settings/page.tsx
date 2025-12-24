import Card from "@/components/ui/Card";
import EconomicOutlookManager from "@/components/settings/EconomicOutlookManager";
import StyleExampleManager from "@/components/settings/StyleExampleManager";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">
          Manage economic outlooks and style examples for AI-generated content.
        </p>
      </div>

      {/* Economic Outlooks Section */}
      <Card padding="lg">
        <EconomicOutlookManager />
      </Card>

      {/* Style Examples Section */}
      <Card padding="lg">
        <StyleExampleManager />
      </Card>
    </div>
  );
}
