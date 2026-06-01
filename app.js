// ============================================
// GIFT CARD REWARD PLATFORM - MAIN APP
// Supabase Integration & Utilities
// ============================================

// Supabase client instance
var supabaseClient = null;

function initSupabase() {
  if (typeof CONFIG === 'undefined') {
    console.error('CONFIG not loaded. Please check config.js');
    return null;
  }
  
  if (typeof window.supabase === 'undefined') {
    console.error('Supabase library not loaded');
    return null;
  }
  
  supabaseClient = window.supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY
  );
  
  return supabaseClient;
}

// ============================================
// AUTH FUNCTIONS
// ============================================

async function signUp(email, password, fullName) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function signIn(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getCurrentUser() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return null;
    
    // Get user profile from public.users
    const { data: profile, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      // Return basic user info if profile fetch fails
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
        role: 'user'
      };
    }
    
    return profile;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

async function checkAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

function isAdmin(email, password) {
  return email === CONFIG.ADMIN_EMAIL && password === CONFIG.ADMIN_PASSWORD;
}

// ============================================
// GIFT CARDS FUNCTIONS
// ============================================

async function getGiftCards() {
  try {
    const { data, error } = await supabaseClient
      .from('giftcards')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getGiftCardById(id) {
  try {
    const { data, error } = await supabaseClient
      .from('giftcards')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Admin functions
async function addGiftCard(giftCard) {
  try {
    const { data, error } = await supabaseClient
      .from('giftcards')
      .insert([giftCard])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateGiftCard(id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from('giftcards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deleteGiftCard(id) {
  try {
    const { error } = await supabaseClient
      .from('giftcards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// CLAIMS FUNCTIONS
// ============================================

async function createClaim(claimData) {
  try {
    const { data, error } = await supabaseClient
      .from('claims')
      .insert([claimData])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getUserClaims(userId) {
  try {
    const { data, error } = await supabaseClient
      .from('claims')
      .select(`
        *,
        rewards (name, icon, amount, color_start, color_end)
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getAllClaims() {
  try {
    const { data, error } = await supabaseClient
      .from('claims')
      .select(`
        *,
        rewards (name, icon, amount, color_start, color_end),
        users (full_name, email)
      `)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateClaimStatus(claimId, status, adminNotes = null) {
  try {
    const updates = { status };
    if (adminNotes) updates.admin_notes = adminNotes;
    if (status === 'completed' || status === 'rejected') {
      updates.processed_at = new Date().toISOString();
    }
    
    const { data, error } = await supabaseClient
      .from('claims')
      .update(updates)
      .eq('id', claimId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// COUPONS FUNCTIONS
// ============================================

async function getAllCoupons() {
  try {
    const { data, error } = await supabaseClient
      .from('coupons')
      .select(`
        *,
        rewards (name, icon, color_start, color_end),
        users (full_name, email)
      `)
      .order('generated_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function generateCouponCode(brand) {
  const prefix = brand.toUpperCase().slice(0, 6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}

async function createCoupon(couponData) {
  try {
    const { data, error } = await supabaseClient
      .from('coupons')
      .insert([couponData])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getUserCoupons(userId) {
  try {
    const { data, error } = await supabaseClient
      .from('coupons')
      .select(`
        *,
        rewards (name, icon, amount, color_start, color_end)
      `)
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

async function getAllUsers() {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateUserRole(userId, role) {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showAlert(elementId, message, type = 'error') {
  const alert = document.getElementById(elementId);
  if (alert) {
    alert.textContent = message;
    alert.className = `alert alert-${type} show`;
    setTimeout(() => {
      alert.classList.remove('show');
    }, 5000);
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function setLoading(element, isLoading) {
  if (isLoading) {
    element.disabled = true;
    element.innerHTML = '<span class="loader"></span>';
  } else {
    element.disabled = false;
    element.innerHTML = element.dataset.originalText || element.textContent;
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showAlert('copy-alert', 'Copied to clipboard!', 'success');
  }).catch(() => {
    showAlert('copy-alert', 'Failed to copy', 'error');
  });
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
});

async function getRewardById(id) {
  try {
    const { data, error } = await supabaseClient
      .from('rewards')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Make functions available globally
window.app = {
  supabase: supabaseClient,
  initSupabase,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  checkAuth,
  isAdmin,
  getGiftCards,
  getGiftCardById,
  addGiftCard,
  updateGiftCard,
  deleteGiftCard,
  createClaim,
  getUserClaims,
  getAllClaims,
  updateClaimStatus,
  generateCouponCode,
  createCoupon,
  getUserCoupons,
  getAllCoupons,
  getAllUsers,
  updateUserRole,
  showAlert,
  formatCurrency,
  formatDate,
  setLoading,
  copyToClipboard,
  showToast,
  getRewards,
  getRewardById,
  addReward,
  updateReward,
  deleteReward
};

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span style="font-size: 18px;">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ============================================
// REWARDS FUNCTIONS (for Apple-inspired version)
// ============================================
async function getRewards() {
  try {
    const { data, error } = await supabaseClient
      .from('rewards')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function addReward(reward) {
  try {
    const { data, error } = await supabaseClient
      .from('rewards')
      .insert([reward])
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateReward(id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from('rewards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deleteReward(id) {
  try {
    const { error } = await supabaseClient
      .from('rewards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
