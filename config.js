// ============================================
// SUPABASE CONFIGURATION
// Replace with your actual Supabase credentials
// ============================================

const CONFIG = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',
  
  // Admin credentials (hardcoded for simple admin auth)
  ADMIN_EMAIL: 'admin@giftcard.com',
  ADMIN_PASSWORD: 'admin123'
};

// Make CONFIG available globally
window.CONFIG = CONFIG;
