/* ============================================================
   FUTURE UNIVERSE — ADMIN PANEL LOGIC
   Firebase Auth + Firestore CRUD + Storage for client logos
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── DOM References ─────────────────────────────────────────
  const loginScreen   = document.getElementById('login-screen');
  const adminShell    = document.getElementById('admin-shell');
  const loginForm     = document.getElementById('login-form');
  const loginError    = document.getElementById('login-error');
  const loginErrorTxt = document.getElementById('login-error-text');
  const logoutBtn     = document.getElementById('logout-btn');
  const userAvatar    = document.getElementById('user-avatar');
  const userEmail     = document.getElementById('user-email');

  const addClientBtn      = document.getElementById('add-client-btn');
  const addFirstClientBtn = document.getElementById('add-first-client-btn');
  const clientModal       = document.getElementById('client-modal');
  const modalClose        = document.getElementById('modal-close');
  const modalCancel       = document.getElementById('modal-cancel');
  const modalTitle        = document.getElementById('modal-title');
  const clientForm        = document.getElementById('client-form');
  const saveClientBtn     = document.getElementById('save-client-btn');

  const clientsGrid    = document.getElementById('clients-grid');
  const clientsLoading = document.getElementById('clients-loading');
  const emptyState     = document.getElementById('empty-state');
  const searchInput    = document.getElementById('search-clients');

  const confirmOverlay = document.getElementById('confirm-overlay');
  const confirmCancel  = document.getElementById('confirm-cancel');
  const confirmDelete  = document.getElementById('confirm-delete');

  const uploadZone     = document.getElementById('upload-zone');
  const logoInput      = document.getElementById('logo-input');
  const logoPreview    = document.getElementById('logo-preview');
  const logoPreviewWrap= document.getElementById('logo-preview-wrap');
  const removeLogo     = document.getElementById('remove-logo');

  const photosUploadZone = document.getElementById('photos-upload-zone');
  const photosInput      = document.getElementById('photos-input');
  const photosPreviewWrap= document.getElementById('photos-preview-wrap');

  const toast          = document.getElementById('admin-toast');
  const toastMessage   = document.getElementById('toast-message');

  // ── State ──────────────────────────────────────────────────
  let clients = [];
  let editingId = null;
  let deletingId = null;
  let logoFile = null;
  let existingLogoUrl = null;
  let projectPhotos = [];
  let testimonialRating = 5; // default 5 stars

  // ── Star Rating Widget ─────────────────────────────────────
  const starBtns = document.querySelectorAll('.star-btn');
  const starRatingInput = document.getElementById('client-testimonial-rating');
  const starRatingLabel = document.getElementById('star-rating-label');

  function setStarRating(value) {
    testimonialRating = value;
    starRatingInput.value = value;
    starRatingLabel.textContent = value + ' / 5';
    starBtns.forEach(btn => {
      const v = parseInt(btn.dataset.value);
      btn.classList.toggle('filled', v <= value);
    });
  }

  starBtns.forEach(btn => {
    btn.addEventListener('click', () => setStarRating(parseInt(btn.dataset.value)));
    btn.addEventListener('mouseenter', () => {
      const hoverVal = parseInt(btn.dataset.value);
      starBtns.forEach(b => b.classList.toggle('filled', parseInt(b.dataset.value) <= hoverVal));
    });
    btn.addEventListener('mouseleave', () => setStarRating(testimonialRating));
  });

  setStarRating(5); // initialize to 5

  // ── Auth State Listener ────────────────────────────────────
  auth.onAuthStateChanged(user => {
    if (user) {
      showDashboard(user);
      loadClients();
    } else {
      showLogin();
    }
  });

  // ── Login ──────────────────────────────────────────────────
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-password').value;
    const btn   = loginForm.querySelector('button[type="submit"]');
    const orig  = btn.innerHTML;

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
    btn.disabled = true;
    hideLoginError();

    try {
      await auth.signInWithEmailAndPassword(email, pass);
    } catch (err) {
      showLoginError(getAuthErrorMessage(err.code));
      btn.innerHTML = orig;
      btn.disabled = false;
    }
  });

  // ── Logout ─────────────────────────────────────────────────
  logoutBtn.addEventListener('click', () => {
    auth.signOut();
  });

  // ── UI Helpers ─────────────────────────────────────────────
  function showLogin() {
    loginScreen.style.display = '';
    adminShell.classList.remove('active');
  }

  function showDashboard(user) {
    loginScreen.style.display = 'none';
    adminShell.classList.add('active');
    const initial = (user.email || 'A')[0].toUpperCase();
    userAvatar.textContent = initial;
    userEmail.textContent = user.email;
  }

  function showLoginError(msg) {
    loginErrorTxt.textContent = msg;
    loginError.classList.add('show');
  }

  function hideLoginError() {
    loginError.classList.remove('show');
  }

  function getAuthErrorMessage(code) {
    const msgs = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-email': 'Invalid email address format.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/invalid-credential': 'Invalid email or password.',
    };
    return msgs[code] || 'Authentication failed. Please try again.';
  }

  function showToast(message, type = 'success') {
    toast.className = 'admin-toast ' + type;
    toast.querySelector('i').className = type === 'success'
      ? 'fa-solid fa-check-circle'
      : 'fa-solid fa-circle-exclamation';
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  // ── Load Clients from Firestore ────────────────────────────
  async function loadClients() {
    clientsLoading.style.display = '';
    clientsGrid.innerHTML = '';
    emptyState.style.display = 'none';

    try {
      const snapshot = await db.collection('clients')
        .orderBy('createdAt', 'desc')
        .get();

      clients = [];
      snapshot.forEach(doc => {
        clients.push({ id: doc.id, ...doc.data() });
      });

      renderClients(clients);
      updateStats();
    } catch (err) {
      console.error('Error loading clients:', err);
      showToast('Failed to load clients', 'error');
    } finally {
      clientsLoading.style.display = 'none';
    }
  }

  // ── Render Client Cards ────────────────────────────────────
  function renderClients(list) {
    clientsGrid.innerHTML = '';

    if (list.length === 0) {
      emptyState.style.display = '';
      return;
    }
    emptyState.style.display = 'none';

    list.forEach(client => {
      const card = document.createElement('div');
      card.className = 'client-card';
      card.innerHTML = `
        ${client.featured ? '<div class="client-card-featured"><i class="fa-solid fa-star"></i></div>' : ''}
        <div class="client-card-header">
          <div class="client-logo-wrap">
            ${client.logoUrl
              ? `<img src="${client.logoUrl}" alt="${client.name}" loading="lazy"/>`
              : `<span class="client-logo-placeholder">${getInitials(client.name)}</span>`
            }
          </div>
          <div class="client-card-info">
            <h4>${escapeHtml(client.name)}</h4>
            <div class="client-card-industry">
              <i class="fa-solid fa-tag"></i> ${escapeHtml(client.industry || 'N/A')}
            </div>
          </div>
        </div>
        <div class="client-card-body">
          <p>${escapeHtml(client.description || 'No description provided.')}</p>
          <div class="client-card-meta">
            ${client.service ? `<span class="client-card-tag"><i class="fa-solid fa-briefcase"></i> ${escapeHtml(client.service)}</span>` : ''}
            ${client.testimonial ? `<span class="client-card-tag"><i class="fa-solid fa-star" style="color:#D4A017;"></i> ${client.testimonialRating || 5}/5 Testimonial</span>` : ''}
          </div>
        </div>
        <div class="client-card-actions">
          <button class="edit-btn" data-id="${client.id}">
            <i class="fa-solid fa-pen"></i> Edit
          </button>
          <button class="delete-btn" data-id="${client.id}">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      `;
      clientsGrid.appendChild(card);
    });

    // Attach event listeners
    clientsGrid.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    clientsGrid.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => openDeleteConfirm(btn.dataset.id));
    });
  }

  // ── Update Stats ───────────────────────────────────────────
  function updateStats() {
    document.getElementById('stat-total').textContent = clients.length;
    document.getElementById('stat-featured').textContent = clients.filter(c => c.featured).length;
    const industries = new Set(clients.map(c => c.industry).filter(Boolean));
    document.getElementById('stat-industries').textContent = industries.size;
    document.getElementById('stat-testimonials').textContent = clients.filter(c => c.testimonial).length;
  }

  // ── Search ─────────────────────────────────────────────────
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) {
      renderClients(clients);
      return;
    }
    const filtered = clients.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.industry || '').toLowerCase().includes(q) ||
      (c.service || '').toLowerCase().includes(q)
    );
    renderClients(filtered);
  });

  // ── Modal Controls ─────────────────────────────────────────
  function openAddModal() {
    editingId = null;
    logoFile = null;
    existingLogoUrl = null;
    projectPhotos = [];
    modalTitle.textContent = 'Add New Client';
    clientForm.reset();
    logoPreviewWrap.style.display = 'none';
    uploadZone.style.display = '';
    renderPhotosPreview();
    setStarRating(5);
    clientModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function openEditModal(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    editingId = id;
    logoFile = null;
    existingLogoUrl = client.logoUrl || null;
    projectPhotos = client.projectPhotos || [];
    modalTitle.textContent = 'Edit Client';

    document.getElementById('client-id').value = id;
    document.getElementById('client-name').value = client.name || '';
    document.getElementById('client-industry').value = client.industry || '';
    document.getElementById('client-service').value = client.service || '';
    document.getElementById('client-contact').value = client.contact || '';
    document.getElementById('client-description').value = client.description || '';
    document.getElementById('client-testimonial').value = client.testimonial || '';
    document.getElementById('client-featured').checked = client.featured || false;
    setStarRating(client.testimonialRating || 5);

    if (client.logoUrl) {
      logoPreview.src = client.logoUrl;
      logoPreviewWrap.style.display = '';
      uploadZone.style.display = 'none';
    } else {
      logoPreviewWrap.style.display = 'none';
      uploadZone.style.display = '';
    }

    renderPhotosPreview();

    clientModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    clientModal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      clientForm.reset();
      editingId = null;
      logoFile = null;
      existingLogoUrl = null;
      projectPhotos = [];
    }, 300);
  }

  addClientBtn.addEventListener('click', openAddModal);
  addFirstClientBtn?.addEventListener('click', openAddModal);
  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  clientModal.addEventListener('click', (e) => {
    if (e.target === clientModal) closeModal();
  });

  // ── Logo Upload ────────────────────────────────────────────
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleLogoFile(file);
    }
  });

  logoInput.addEventListener('change', () => {
    if (logoInput.files[0]) {
      handleLogoFile(logoInput.files[0]);
    }
  });

  function handleLogoFile(file) {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Logo must be under 5MB before compression', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      // Compress the image using canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert back to base64 (webp format for better compression)
        const compressedBase64 = canvas.toDataURL('image/webp', 0.8);
        logoFile = compressedBase64; // Store the base64 string instead of the file object
        
        logoPreview.src = compressedBase64;
        logoPreviewWrap.style.display = '';
        uploadZone.style.display = 'none';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeLogo.addEventListener('click', () => {
    logoFile = null;
    existingLogoUrl = null;
    logoPreview.src = '';
    logoPreviewWrap.style.display = 'none';
    uploadZone.style.display = '';
    logoInput.value = '';
  });

  // ── Project Photos Upload ──────────────────────────────────
  photosUploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    photosUploadZone.classList.add('dragover');
  });
  photosUploadZone.addEventListener('dragleave', () => {
    photosUploadZone.classList.remove('dragover');
  });
  photosUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    photosUploadZone.classList.remove('dragover');
    if (e.dataTransfer.files) {
      handleProjectPhotos(Array.from(e.dataTransfer.files));
    }
  });

  photosInput.addEventListener('change', () => {
    if (photosInput.files) {
      handleProjectPhotos(Array.from(photosInput.files));
    }
  });

  function handleProjectPhotos(files) {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    imageFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Each photo must be under 5MB', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // slightly larger for project photos
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/webp', 0.85);
          projectPhotos.push(compressedBase64);
          renderPhotosPreview();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
    
    photosInput.value = ''; // Reset input
  }

  function renderPhotosPreview() {
    photosPreviewWrap.innerHTML = '';
    if (projectPhotos.length > 0) {
      photosPreviewWrap.style.display = 'flex';
      projectPhotos.forEach((photo, index) => {
        const div = document.createElement('div');
        div.className = 'photo-preview-item';
        div.innerHTML = `
          <img src="${photo}" alt="Project Photo"/>
          <button type="button" class="photo-preview-remove" data-index="${index}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        `;
        photosPreviewWrap.appendChild(div);
      });

      // Bind remove buttons
      photosPreviewWrap.querySelectorAll('.photo-preview-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(btn.dataset.index);
          projectPhotos.splice(idx, 1);
          renderPhotosPreview();
        });
      });
    } else {
      photosPreviewWrap.style.display = 'none';
    }
  }

  // ── Save Client ────────────────────────────────────────────
  saveClientBtn.addEventListener('click', async () => {
    const name = document.getElementById('client-name').value.trim();
    const industry = document.getElementById('client-industry').value;

    if (!name || !industry) {
      showToast('Please fill in the required fields', 'error');
      return;
    }

    const origText = saveClientBtn.innerHTML;
    saveClientBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    saveClientBtn.disabled = true;

    try {
      let logoUrl = existingLogoUrl || '';

      // If a new logo was uploaded (logoFile is now a base64 string)
      if (logoFile) {
        logoUrl = logoFile;
      }

      const clientData = {
        name,
        industry,
        service: document.getElementById('client-service').value,
        contact: document.getElementById('client-contact').value.trim(),
        description: document.getElementById('client-description').value.trim(),
        testimonial: document.getElementById('client-testimonial').value.trim(),
        testimonialRating: testimonialRating,
        featured: document.getElementById('client-featured').checked,
        logoUrl,
        projectPhotos,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (editingId) {
        // Update
        await db.collection('clients').doc(editingId).update(clientData);
        showToast('Client updated successfully!');
      } else {
        // Create
        clientData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('clients').add(clientData);
        showToast('Client added successfully!');
      }

      closeModal();
      await loadClients();
    } catch (err) {
      console.error('Error saving client:', err);
      showToast('Failed to save client. Please try again.', 'error');
    } finally {
      saveClientBtn.innerHTML = origText;
      saveClientBtn.disabled = false;
    }
  });

  // ── Delete Client ──────────────────────────────────────────
  function openDeleteConfirm(id) {
    deletingId = id;
    confirmOverlay.classList.add('open');
  }

  confirmCancel.addEventListener('click', () => {
    confirmOverlay.classList.remove('open');
    deletingId = null;
  });
  confirmOverlay.addEventListener('click', (e) => {
    if (e.target === confirmOverlay) {
      confirmOverlay.classList.remove('open');
      deletingId = null;
    }
  });

  confirmDelete.addEventListener('click', async () => {
    if (!deletingId) return;

    const origText = confirmDelete.innerHTML;
    confirmDelete.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';
    confirmDelete.disabled = true;

    try {
      await db.collection('clients').doc(deletingId).delete();
      showToast('Client deleted successfully!');
      confirmOverlay.classList.remove('open');
      deletingId = null;
      await loadClients();
    } catch (err) {
      console.error('Error deleting client:', err);
      showToast('Failed to delete client', 'error');
    } finally {
      confirmDelete.innerHTML = origText;
      confirmDelete.disabled = false;
    }
  });

  // ── Utilities ──────────────────────────────────────────────
  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Keyboard shortcuts ─────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (confirmOverlay.classList.contains('open')) {
        confirmOverlay.classList.remove('open');
        deletingId = null;
      } else if (clientModal.classList.contains('open')) {
        closeModal();
      }
    }
  });

});
