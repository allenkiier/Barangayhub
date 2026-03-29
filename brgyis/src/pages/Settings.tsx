import { Save, Building2, Bell, Shield, Database, Download } from "lucide-react";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";


interface SettingsData {
  // General
  barangayName: string;
  municipality: string;
  province: string;
  region: string;
  address: string;
  phone: string;
  email: string;
  punongBarangayName: string;
  officeTitle: string;
  indigencyPurok: string;
  printIcon: string;
  printLogoLeft: string;
  printLogoRight: string;
  // Notifications
  emailNotifications: boolean;
  newResidentAlerts: boolean;
  blotterReportAlerts: boolean;
  documentRequestAlerts: boolean;
  // Last backup timestamp
  lastBackup: string;
}

const DEFAULT_SETTINGS: SettingsData = {
  barangayName: "Barangay San Isidro",
  municipality: "City of Manila",
  province: "Metro Manila",
  region: "NCR",
  address: "123 Main Street, San Isidro, City of Manila, Metro Manila",
  phone: "(02) 1234-5678",
  email: "info@barangaysanisidro.gov.ph",
  punongBarangayName: "PERCY M. RASGO",
  officeTitle: "Office of the Punong Barangay",
  indigencyPurok: "Purok 2",
  printIcon: "🏛️",
  printLogoLeft: "/bagong_pilipinas.svg",
  printLogoRight: "/barangay_seal.svg",
  emailNotifications: true,
  newResidentAlerts: true,
  blotterReportAlerts: true,
  documentRequestAlerts: false,
  lastBackup: "2024-01-15 08:00 AM",
};

const PRINT_LOGO_LEFT_KEY = "barangay_print_logo_left";
const PRINT_LOGO_RIGHT_KEY = "barangay_print_logo_right";

const Settings = () => {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("barangaySettings");
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  }, []);

  // Handle general settings changes
  const handleSettingChange = (field: keyof SettingsData, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (field: "printLogoLeft" | "printLogoRight") => async (event: any) => {
    const file = event?.target?.files?.[0] as File | undefined;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await convertImageToDataUrl(file);
      setSettings((prev) => {
        const updatedSettings = {
          ...prev,
          [field]: result,
        };

        try {
          localStorage.setItem("barangaySettings", JSON.stringify(updatedSettings));
          localStorage.setItem(
            field === "printLogoLeft" ? PRINT_LOGO_LEFT_KEY : PRINT_LOGO_RIGHT_KEY,
            result
          );
          toast({
            title: "Logo Updated",
            description: `${field === "printLogoLeft" ? "Left" : "Right"} logo photo is ready for printing.`,
          });
        } catch (saveError) {
          console.error("Failed to auto-save logo settings:", saveError);
          toast({
            title: "Warning",
            description: "Photo is too large to save. Try a smaller image.",
            variant: "destructive",
          });
        }

        return updatedSettings;
      });
    } catch (error) {
      console.error("Failed to process logo image:", error);
      toast({
        title: "Error",
        description: "Failed to process selected image.",
        variant: "destructive",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("barangaySettings", JSON.stringify(settings));
      if (settings.printLogoLeft) {
        localStorage.setItem(PRINT_LOGO_LEFT_KEY, settings.printLogoLeft);
      }
      if (settings.printLogoRight) {
        localStorage.setItem(PRINT_LOGO_RIGHT_KEY, settings.printLogoRight);
      }
      toast({
        title: "Settings Saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      // Store hashed password in localStorage
      const passwordHash = btoa(newPassword); // Simple encoding (not for production)
      localStorage.setItem("barangayPassword", passwordHash);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {

      // TODO: Implement export via backend API if needed
      const exportData = {
        settings,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };
      // Example: Download settings only
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `barangay-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      console.error("Failed to export data:", error);
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateBackup = async () => {
    try {

      // TODO: Implement backup via backend API if needed
      const backupData = {
        settings,
        backupDate: new Date().toISOString(),
        version: "1.0.0",
      };
      // Example: Store settings backup only
      localStorage.setItem(
        "barangaySettingsBackup",
        JSON.stringify(backupData)
      );

      // Update last backup timestamp in settings
      const updatedSettings = {
        ...settings,
        lastBackup: new Date().toLocaleString(),
      };
      setSettings(updatedSettings);
      localStorage.setItem("barangaySettings", JSON.stringify(updatedSettings));

      toast({
        title: "Backup Created",
        description: "Your backup has been created successfully.",
      });
    } catch (error) {
      console.error("Failed to create backup:", error);
      toast({
        title: "Error",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Configure system preferences and barangay information
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Tabs defaultValue="general" className="animate-slide-up">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Database className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Barangay Information</CardTitle>
                <CardDescription>
                  Basic information about your barangay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="barangayName">Barangay Name</Label>
                    <Input
                      id="barangayName"
                      value={settings.barangayName}
                      onChange={(e) =>
                        handleSettingChange("barangayName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="municipality">Municipality/City</Label>
                    <Input
                      id="municipality"
                      value={settings.municipality}
                      onChange={(e) =>
                        handleSettingChange("municipality", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                      id="province"
                      value={settings.province}
                      onChange={(e) =>
                        handleSettingChange("province", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={settings.region}
                      onChange={(e) =>
                        handleSettingChange("region", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Complete Address</Label>
                  <Textarea
                    id="address"
                    value={settings.address}
                    onChange={(e) =>
                      handleSettingChange("address", e.target.value)
                    }
                    rows={2}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="punongBarangayName">Punong Barangay Name</Label>
                    <Input
                      id="punongBarangayName"
                      value={settings.punongBarangayName}
                      onChange={(e) =>
                        handleSettingChange("punongBarangayName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="officeTitle">Office Title</Label>
                    <Input
                      id="officeTitle"
                      value={settings.officeTitle}
                      onChange={(e) =>
                        handleSettingChange("officeTitle", e.target.value)
                      }
                      placeholder="Office of the Punong Barangay"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="indigencyPurok">Certificate Purok</Label>
                    <Input
                      id="indigencyPurok"
                      value={settings.indigencyPurok}
                      onChange={(e) =>
                        handleSettingChange("indigencyPurok", e.target.value)
                      }
                      placeholder="Purok 2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="printIcon">Print Icon</Label>
                    <Input
                      id="printIcon"
                      value={settings.printIcon}
                      onChange={(e) =>
                        handleSettingChange("printIcon", e.target.value)
                      }
                      placeholder="🏛️ or BJ"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="printLogoLeft">Left Logo URL</Label>
                    <Input
                      id="printLogoLeft"
                      value={settings.printLogoLeft}
                      onChange={(e) =>
                        handleSettingChange("printLogoLeft", e.target.value)
                      }
                      placeholder="/bagong_pilipinas.svg"
                    />
                    <Input
                      id="printLogoLeftUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload("printLogoLeft")}
                    />
                    {settings.printLogoLeft && (
                      <img
                        src={settings.printLogoLeft}
                        alt="Left logo preview"
                        className="h-16 w-16 object-contain rounded border"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="printLogoRight">Right Logo URL</Label>
                    <Input
                      id="printLogoRight"
                      value={settings.printLogoRight}
                      onChange={(e) =>
                        handleSettingChange("printLogoRight", e.target.value)
                      }
                      placeholder="/barangay_seal.svg"
                    />
                    <Input
                      id="printLogoRightUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload("printLogoRight")}
                    />
                    {settings.printLogoRight && (
                      <img
                        src={settings.printLogoRight}
                        alt="Right logo preview"
                        className="h-16 w-16 object-contain rounded border"
                      />
                    )}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Number</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) =>
                        handleSettingChange("phone", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) =>
                        handleSettingChange("email", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates for important events
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange("emailNotifications", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Resident Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new residents are registered
                    </p>
                  </div>
                  <Switch
                    checked={settings.newResidentAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("newResidentAlerts", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Blotter Report Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new blotter reports are filed
                    </p>
                  </div>
                  <Switch
                    checked={settings.blotterReportAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("blotterReportAlerts", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Document Request Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when documents are requested
                    </p>
                  </div>
                  <Switch
                    checked={settings.documentRequestAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("documentRequestAlerts", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                  View system details and perform maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="text-lg font-semibold">1.0.0</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Last Backup</p>
                    <p className="text-lg font-semibold">{settings.lastBackup}</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Data
                  </Button>
                  <Button variant="outline" onClick={handleCreateBackup}>
                    Create Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;

function convertImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const source = typeof reader.result === "string" ? reader.result : "";
      if (!source) {
        reject(new Error("Unable to read file"));
        return;
      }

      const image = new Image();
      image.onload = () => {
        const maxWidth = 320;
        const scale = image.width > maxWidth ? maxWidth / image.width : 1;
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Unable to process image"));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = () => reject(new Error("Invalid image file"));
      image.src = source;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
