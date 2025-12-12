import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Settings {
  id?: string;
  business_name: string;
  rfc: string;
  address: string;
  phone: string;
  email: string;
  printer_enabled: boolean;
  scanner_enabled: boolean;
  payment_cash: boolean;
  payment_card: boolean;
  payment_transfer: boolean;
  low_stock_alerts: boolean;
  daily_reports: boolean;
}

const defaultSettings: Settings = {
  business_name: "Mi Negocio",
  rfc: "",
  address: "",
  phone: "",
  email: "",
  printer_enabled: false,
  scanner_enabled: false,
  payment_cash: true,
  payment_card: true,
  payment_transfer: false,
  low_stock_alerts: true,
  daily_reports: true,
};

export const useSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<Settings>) => {
    if (!user) return false;

    try {
      const settingsData = {
        ...settings,
        ...newSettings,
        user_id: user.id,
      };

      const { data: existing } = await supabase
        .from("settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("settings")
          .update(settingsData)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("settings")
          .insert(settingsData);

        if (error) throw error;
      }

      setSettings(prev => ({ ...prev, ...newSettings }));
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      return false;
    }
  };

  return { settings, loading, saveSettings, refetch: fetchSettings };
};
