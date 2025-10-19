import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kzrijawotuascqrcsjwg.supabase.co";
const supabasePublishableKey = "sb_publishable_hkSjc9W6sXOlAW3wrmweOQ_k5XjOnRv";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
