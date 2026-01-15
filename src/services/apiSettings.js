import supabase from "./supabase";

export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*").single();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }
  return data;
}

// We expect a newSetting object that looks like {setting: newValue}
export async function updateSetting(newSetting) {
  // Fetch the ID of the settings row
  const { data: settings, error: fetchError } = await supabase
    .from("settings")
    .select("id")
    .single();

  if (fetchError || !settings) {
    console.error(fetchError || "No settings row found");
    throw new Error("Settings could not be updated: No settings row found");
  }

  const { data, error } = await supabase
    .from("settings")
    .update(newSetting)
    .eq("id", settings.id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be updated");
  }
  return data;
}
