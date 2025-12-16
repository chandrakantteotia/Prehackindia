// Profile page functionality
let userProfileData = null;

// Trigger file input for photo upload
function triggerPhotoUpload() {
  document.getElementById('photoUpload').click();
}

// Handle photo upload
document.addEventListener('DOMContentLoaded', () => {
  const photoInput = document.getElementById('photoUpload');
  if (photoInput) {
    photoInput.addEventListener('change', handlePhotoUpload);
  }
});

async function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file || !currentUser) return;
  
  // Validate file
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB');
    return;
  }
  
  try {
    // Show loading indicator
    const photoIcon = document.getElementById('profileIcon');
    if (photoIcon) {
      photoIcon.textContent = '⏳';
    }
    
    // Upload to ImgBB
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('https://api.imgbb.com/1/upload?key=1b89022d172c644078ba8ecd91ad335b', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Image upload failed');
    }
    
    const photoURL = data.data.url;
    console.log('Photo uploaded to ImgBB:', photoURL);
    
    // Update Firebase
    try {
      await db.collection('users').doc(currentUser.uid).set({
        photoURL: photoURL,
        photoUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid: currentUser.uid,
        email: currentUser.email
      }, { merge: true });
      
      console.log('Photo URL saved to Firebase');
    } catch (fbError) {
      console.warn('Firebase update failed, continuing with local update:', fbError);
    }
    
    // Update UI immediately
    displayProfilePhoto(photoURL);
    
    // Update navbar photo if function exists
    if (typeof updateNavProfilePhoto === 'function') {
      updateNavProfilePhoto(photoURL);
    }
    
    // Update userProfileData
    if (userProfileData) {
      userProfileData.photoURL = photoURL;
    }
    
    // Store in localStorage as backup
    localStorage.setItem('userPhotoURL', photoURL);
    
    alert('✅ Profile photo updated successfully!');
    
  } catch (error) {
    console.error('Error uploading photo:', error);
    alert('Failed to update profile photo: ' + error.message);
    
    // Reset icon
    const photoIcon = document.getElementById('profileIcon');
    if (photoIcon) {
      photoIcon.textContent = '👤';
    }
  }
}

function displayProfilePhoto(photoURL) {
  const photoImg = document.getElementById('profilePhoto');
  const iconSpan = document.getElementById('profileIcon');
  
  console.log('Displaying profile photo:', photoURL ? 'Photo exists' : 'No photo');
  
  if (photoURL && photoURL !== '') {
    photoImg.src = photoURL;
    photoImg.style.display = 'block';
    photoImg.style.position = 'absolute';
    photoImg.style.top = '0';
    photoImg.style.left = '0';
    photoImg.style.width = '100%';
    photoImg.style.height = '100%';
    photoImg.style.objectFit = 'cover';
    photoImg.style.zIndex = '2';
    iconSpan.style.display = 'none';
  } else {
    photoImg.style.display = 'none';
    iconSpan.style.display = 'block';
  }
}

async function loadProfile() {
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }
  
  try {
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    
    if (userDoc.exists) {
      userProfileData = userDoc.data();
    } else {
      // Create default profile data if doesn't exist
      userProfileData = {
        uid: currentUser.uid,
        email: currentUser.email,
        username: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        photoURL: currentUser.photoURL || localStorage.getItem('userPhotoURL') || '',
        bestScore: 0,
        dailyStreak: 0,
        totalEarned: 0,
        tokensBalance: 0,
        walletAddress: '',
        referralCode: generateReferralCode()
      };
    }
    
    updateProfileUI();
    loadTransactions();
  } catch (error) {
    console.error('Error loading profile:', error);
    // Use default data even if Firebase fails
    userProfileData = {
      uid: currentUser.uid,
      email: currentUser.email,
      username: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
      photoURL: currentUser.photoURL || localStorage.getItem('userPhotoURL') || '',
      bestScore: 0,
      dailyStreak: 0,
      totalEarned: 0,
      tokensBalance: 0,
      walletAddress: '',
      referralCode: 'SHARP' + Math.random().toString(36).substr(2, 6).toUpperCase()
    };
    updateProfileUI();
  }
}

function generateReferralCode() {
  return 'SHARP' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function updateProfileUI() {
  if (!userProfileData) return;
  
  const username = userProfileData.username || currentUser.displayName || 'User';
  document.getElementById('profileUsername').textContent = username;
  document.getElementById('profileEmail').textContent = userProfileData.email || currentUser.email || '';
  
  // Display profile photo if exists
  const photoURL = userProfileData.photoURL || currentUser.photoURL || '';
  console.log('UpdateProfileUI - photoURL:', photoURL);
  displayProfilePhoto(photoURL);
  
  // Also update navbar photo
  if (typeof updateNavProfilePhoto === 'function') {
    updateNavProfilePhoto(photoURL);
  }
  
  document.getElementById('profileBestScore').textContent = userProfileData.bestScore || 0;
  document.getElementById('profileStreak').textContent = (userProfileData.dailyStreak || 0) + ' 🔥';
  document.getElementById('profileTotalEarned').textContent = (userProfileData.totalEarned || 0).toFixed(2) + ' SHARP';
  document.getElementById('profileBalance').textContent = (userProfileData.tokensBalance || 0).toFixed(2) + ' SHARP';
  
  document.getElementById('walletAddress').value = userProfileData.walletAddress || '';
  document.getElementById('referralCode').textContent = userProfileData.referralCode || 'LOADING...';
}

async function updateWalletAddress() {
  if (!currentUser) return;
  
  const walletAddress = document.getElementById('walletAddress').value.trim();
  const statusDiv = document.getElementById('walletStatus');
  
  // Validate Ethereum address
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(walletAddress)) {
    statusDiv.className = 'status-message error';
    statusDiv.textContent = 'Invalid Ethereum address format';
    statusDiv.style.display = 'block';
    return;
  }
  
  try {
    await db.collection('users').doc(currentUser.uid).set({
      walletAddress: walletAddress,
      manualWallet: true,
      uid: currentUser.uid,
      email: currentUser.email
    }, { merge: true });
    
    statusDiv.className = 'status-message success';
    statusDiv.textContent = '✓ Wallet address saved successfully!';
    statusDiv.style.display = 'block';
    
    // Update local data
    if (userProfileData) {
      userProfileData.walletAddress = walletAddress;
    }
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
    
  } catch (error) {
    console.error('Error updating wallet:', error);
    // Store locally as backup
    localStorage.setItem('userWalletAddress', walletAddress);
    statusDiv.className = 'status-message success';
    statusDiv.textContent = '✓ Wallet address saved locally!';
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
}

async function loadTransactions() {
  if (!currentUser) return;
  
  const listDiv = document.getElementById('transactionsList');
  
  try {
    const snapshot = await db.collection('transactions')
      .where('uid', '==', currentUser.uid)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    if (snapshot.empty) {
      listDiv.innerHTML = '<p class="loading">No transactions yet. Play games to earn SHARP tokens!</p>';
      return;
    }
    
    let html = '';
    snapshot.forEach(doc => {
      const tx = doc.data();
      const date = tx.createdAt ? new Date(tx.createdAt.toDate()).toLocaleDateString() : 'N/A';
      const status = tx.status || 'pending';
      
      html += `
        <div class="transaction-item ${status}">
          <div class="transaction-info">
            <div class="transaction-amount">+${tx.amount.toFixed(2)} SHARP</div>
            <div class="transaction-status">
              <span class="status-badge ${status}">${status.toUpperCase()}</span>
              ${tx.note ? ' - ' + tx.note : ''}
            </div>
          </div>
          <div>
            <div class="transaction-date">${date}</div>
            ${tx.txHash ? `<a href="https://etherscan.io/tx/${tx.txHash}" target="_blank" class="transaction-hash">${tx.txHash.substring(0, 10)}...</a>` : ''}
          </div>
        </div>
      `;
    });
    
    listDiv.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading transactions:', error);
    listDiv.innerHTML = '<p class="loading">📊 No transactions yet. Play games to earn SHARP tokens!</p>';
  }
}

function copyReferralCode() {
  const code = document.getElementById('referralCode').textContent;
  navigator.clipboard.writeText(code);
  alert('Referral code copied!');
}

function shareReferral() {
  const code = userProfileData?.referralCode;
  if (!code) return;
  
  const url = `${window.location.origin}?ref=${code}`;
  const text = `Join me on SharpPlay and earn SHARP tokens by playing games! Use my referral code: ${code}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'SharpPlay Referral',
      text: text,
      url: url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert('Referral link copied to clipboard!');
  }
}

// Load profile when page loads
window.addEventListener('load', () => {
  // Wait for auth to initialize
  setTimeout(loadProfile, 1000);
});

// Refresh on auth state change
auth.onAuthStateChanged((user) => {
  if (user) {
    setTimeout(loadProfile, 500);
  }
});
