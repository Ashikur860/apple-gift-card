// ============================================
// APPLE REWARDS - INDEX PAGE
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  app.initSupabase();
  await loadRewards();
  setupFAQ();
  setupClaimForm();
  updateNavbar();
});

// Update Navbar and Footer based on login status
function updateNavbar() {
  const navLinks = document.getElementById('nav-links');
  const footerLinks = document.getElementById('footer-account-links');
  const user = localStorage.getItem('giftcard_user');
  
  if (user) {
    // User is logged in - show Dashboard and Sign Out
    navLinks.innerHTML = `
      <a href="#rewards" class="nav-link">Rewards</a>
      <a href="#features" class="nav-link">Features</a>
      <a href="#faq" class="nav-link">FAQ</a>
      <a href="dashboard.html" class="nav-link">Dashboard</a>
      <button class="btn btn-secondary" style="padding: 8px 20px;" onclick="logout()">Sign Out</button>
    `;
    // Update footer
    if (footerLinks) {
      footerLinks.innerHTML = `
        <li><a href="dashboard.html">Dashboard</a></li>
        <li><a href="#" onclick="logout(); return false;">Sign Out</a></li>
      `;
    }
  } else {
    // User is not logged in - show Sign In and Register
    navLinks.innerHTML = `
      <a href="#rewards" class="nav-link">Rewards</a>
      <a href="#features" class="nav-link">Features</a>
      <a href="#faq" class="nav-link">FAQ</a>
      <a href="login.html" class="btn btn-secondary" style="padding: 8px 20px;">Sign In</a>
      <a href="register.html" class="btn btn-primary" style="padding: 8px 20px;">Register</a>
    `;
    // Update footer
    if (footerLinks) {
      footerLinks.innerHTML = `
        <li><a href="login.html">Sign In</a></li>
        <li><a href="register.html">Register</a></li>
      `;
    }
  }
}

// Logout function
async function logout() {
  await app.signOut();
  localStorage.removeItem('giftcard_user');
  localStorage.removeItem('giftcard_claims');
  window.location.href = 'index.html';
}

// Load Rewards
async function loadRewards() {
  const container = document.getElementById('rewards-container');
  const result = await app.getRewards();
  
  if (!result.success || result.data.length === 0) {
    // Show default rewards if none in database
    const defaultRewards = [
      { id: '1', name: 'Apple Reward', icon: '🍎', amount: 100, color_start: '#0071e3', color_end: '#42a5f5', description: 'Premium Apple credit' },
      { id: '2', name: 'Store Credit', icon: '🛒', amount: 50, color_start: '#34c759', color_end: '#30d158', description: 'Universal store credit' },
      { id: '3', name: 'Digital Voucher', icon: '🎫', amount: 25, color_start: '#ff9500', color_end: '#ffcc00', description: 'Digital purchase voucher' },
      { id: '4', name: 'Entertainment Pass', icon: '🎬', amount: 75, color_start: '#af52de', color_end: '#5856d6', description: 'Movies & entertainment' },
      { id: '5', name: 'Shopping Reward', icon: '🛍️', amount: 150, color_start: '#ff2d55', color_end: '#ff6b6b', description: 'Premium shopping credit' }
    ];
    
    container.innerHTML = defaultRewards.map(r => createRewardCard(r)).join('');
    return;
  }
  
  container.innerHTML = result.data.filter(r => r.is_active).map(r => createRewardCard(r)).join('');
}

function createRewardCard(r) {
  return `
    <div class="reward-card" style="--card-gradient: linear-gradient(135deg, ${r.color_start}, ${r.color_end});">
      <div class="reward-badge">$${r.amount}</div>
      <div class="reward-card-content">
        <div class="reward-icon">${r.icon}</div>
        <h3 class="reward-name">${r.name}</h3>
        <p class="reward-amount">${r.description || 'Premium digital reward'}</p>
        <button class="giftcard-btn" onclick="openClaimModal('${r.id}', '${r.name}', ${r.amount})" style="margin-top: 16px;">
          Claim Reward
        </button>
      </div>
    </div>
  `;
}

// FAQ Accordion - Simple Toggle
function setupFAQ() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const faqItem = this.parentElement;
      const answer = faqItem.querySelector('.faq-answer');
      const isOpen = this.classList.contains('active');
      
      // Close all first
      document.querySelectorAll('.faq-question').forEach(q => q.classList.remove('active'));
      document.querySelectorAll('.faq-answer').forEach(a => {
        a.style.maxHeight = null;
        a.style.paddingTop = null;
      });
      
      // Open clicked if was closed
      if (!isOpen) {
        this.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.paddingTop = '10px';
      }
    });
  });
}

// Simple toggle function for inline onclick
function toggleFAQ(btn) {
  const item = btn.parentElement;
  const answer = item.querySelector('.faq-answer');
  const isOpen = btn.classList.contains('active');
  
  // Close all
  document.querySelectorAll('.faq-question').forEach(q => q.classList.remove('active'));
  document.querySelectorAll('.faq-answer').forEach(a => {
    a.style.maxHeight = null;
    a.style.paddingTop = null;
  });
  
  // Open this one if it was closed
  if (!isOpen) {
    btn.classList.add('active');
    answer.style.maxHeight = answer.scrollHeight + 'px';
    answer.style.paddingTop = '10px';
  }
}

// Claim Modal
function openClaimModal(rewardId, rewardName, rewardAmount) {
  const user = localStorage.getItem('giftcard_user');
  if (!user) {
    window.location.href = 'login.html?redirect=index.html';
    return;
  }
  
  document.getElementById('reward-id').value = rewardId;
  document.getElementById('claim-modal').classList.add('active');
}

function closeClaimModal() {
  document.getElementById('claim-modal').classList.remove('active');
  document.getElementById('claim-form').reset();
}

function closeSuccessModal() {
  document.getElementById('success-modal').classList.remove('active');
}

// Setup Claim Form
function setupClaimForm() {
  document.getElementById('claim-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('claim-submit');
    btn.dataset.originalText = btn.textContent;
    app.setLoading(btn, true);
    
    const user = JSON.parse(localStorage.getItem('giftcard_user'));
    
    const claimData = {
      user_id: user.id,
      reward_id: document.getElementById('reward-id').value,
      full_name: document.getElementById('claim-name').value,
      email: document.getElementById('claim-email').value,
      country: document.getElementById('claim-country').value,
      status: 'processing'
    };
    
    const result = await app.createClaim(claimData);
    
    if (!result.success) {
      app.showToast(result.error, 'error');
      app.setLoading(btn, false);
      return;
    }
    
    closeClaimModal();
    showProcessing();
    
    // Animate progress
    let progress = 0;
    const progressFill = document.getElementById('progress-fill');
    const stepElement = document.getElementById('processing-step');
    
    const steps = [
      'Validating your information...',
      'Verifying eligibility...',
      'Processing your request...',
      'Generating reward code...',
      'Finalizing...'
    ];
    
    const interval = setInterval(() => {
      progress += 6;
      progressFill.style.width = progress + '%';
      
      const stepIndex = Math.floor((progress / 100) * steps.length);
      if (stepIndex < steps.length) {
        stepElement.textContent = steps[stepIndex];
      }
      
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 600);
    
    // Generate reward after 10 seconds
    setTimeout(async () => {
      const reward = await app.getRewardById ? await app.getRewardById(claimData.reward_id) : { success: true, data: { name: 'Apple Reward', icon: '🍎' } };
      
      const code = 'APL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      await app.createCoupon({
        claim_id: result.data.id,
        user_id: user.id,
        code: code,
        amount: 0
      });
      
      await app.updateClaimStatus(result.data.id, 'completed');
      
      hideProcessing();
      document.getElementById('reward-code').textContent = code;
      document.getElementById('success-modal').classList.add('active');
    }, 10000);
  });
}

// Processing
function showProcessing() {
  document.getElementById('processing-overlay').classList.add('active');
  document.getElementById('progress-fill').style.width = '0%';
}

function hideProcessing() {
  document.getElementById('processing-overlay').classList.remove('active');
}

// Copy Code
function copyRewardCode() {
  const code = document.getElementById('reward-code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    app.showToast('Code copied to clipboard!', 'success');
  });
}

// Scroll to Rewards
function scrollToRewards() {
  document.getElementById('rewards').scrollIntoView({ behavior: 'smooth' });
}

// Global functions
window.openClaimModal = openClaimModal;
window.closeClaimModal = closeClaimModal;
window.closeSuccessModal = closeSuccessModal;
window.copyRewardCode = copyRewardCode;
window.showProcessing = showProcessing;
window.hideProcessing = hideProcessing;
window.scrollToRewards = scrollToRewards;
window.logout = logout;
window.toggleFAQ = toggleFAQ;

window.onclick = e => { if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('active'); };
