import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import UserSettings from "@/components/settings/user-settings";
import { CronjobSettings } from "@/components/settings/cronjob-settings";

export default function SettingsPage() {
  return (
    <div className="container my-8">
      <DashboardShell>
        <DashboardHeader
          heading="Settings"
          text="Manage your application settings."
        />
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="cronjobs">Cronjobs</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="space-y-4">
            <UserSettings />
          </TabsContent>
          <TabsContent value="cronjobs" className="space-y-4">
            <CronjobSettings />
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </div>
  );
}
