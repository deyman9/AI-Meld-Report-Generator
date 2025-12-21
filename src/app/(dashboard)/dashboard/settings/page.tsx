import Card from "@/components/ui/Card";
import TemplateManager from "@/components/settings/TemplateManager";
import EconomicOutlookManager from "@/components/settings/EconomicOutlookManager";
import StyleExampleManager from "@/components/settings/StyleExampleManager";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">
          Manage templates, economic outlooks, and style examples.
        </p>
      </div>

      {/* Templates Section */}
      <Card padding="lg">
        <TemplateManager />
      </Card>

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

