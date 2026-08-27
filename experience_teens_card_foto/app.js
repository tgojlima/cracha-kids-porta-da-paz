document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Inputs & Controls
  const inputName = document.getElementById('input-name');
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const selectVerse = document.getElementById('select-verse');
  const customVerseGroup = document.getElementById('custom-verse-group');
  const textareaVerse = document.getElementById('textarea-verse');
  const inputVerseRef = document.getElementById('input-verse-ref');
  const inputPhrase = document.getElementById('input-phrase');

  // DOM Elements - Avatar controls
  const avatarControls = document.getElementById('avatar-controls');
  const zoomSlider = document.getElementById('zoom-slider');
  const btnMoveUp = document.getElementById('btn-move-up');
  const btnMoveDown = document.getElementById('btn-move-down');
  const btnMoveLeft = document.getElementById('btn-move-left');
  const btnMoveRight = document.getElementById('btn-move-right');

  // DOM Elements - Card Displays
  const card3D = document.getElementById('card-3d');
  const displayName = document.getElementById('display-name');
  const displayVerse = document.getElementById('display-verse');
  const displayVerseRef = document.getElementById('display-verse-ref');
  const displayPhrase = document.getElementById('display-phrase');
  const avatarDisplay = document.getElementById('avatar-display');
  const dotFront = document.getElementById('dot-front');
  const dotBack = document.getElementById('dot-back');

  // DOM Elements - Actions
  const btnFlip = document.getElementById('btn-flip');
  const btnPrint = document.getElementById('btn-print');
  const btnDownload = document.getElementById('btn-download');
  const printFrontSlot = document.getElementById('print-front-slot');
  const printBackSlot = document.getElementById('print-back-slot');

  // State Variables for Avatar Editing
  let avatarImg = null;
  let avatarScale = 1.0;
  let avatarPosX = 0;
  let avatarPosY = 0;

  // Preset Verses Map
  const presetVerses = {
    '1': {
      text: '"Ninguém o despreze pelo fato de você ser jovem, mas seja um exemplo para os fiéis na palavra, no procedimento, no amor, na fé e na pureza."',
      ref: '1 Timóteo 4:12'
    },
    '2': {
      text: '"Lembre-se do seu Criador nos dias da sua juventude, antes que venham os dias difíceis e se aproximem os anos em que você dirá: \'Não tenho neles prazer\'."',
      ref: 'Eclesiastes 12:1'
    },
    '3': {
      text: '"Como pode o jovem manter pura a sua conduta? Vivendo de acordo com a tua palavra. Eu te busco de todo o coração; não permitas que eu me desvie dos teus mandamentos."',
      ref: 'Salmo 119:9-10'
    }
  };

  // --- Real-time updates ---

  // Initialize display elements from input defaults
  displayPhrase.textContent = inputPhrase.value;

  // Update Name
  inputName.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    displayName.textContent = value || 'Seu Nome Aqui';
  });

  // Update Phrase ("Quem você é para Deus")
  inputPhrase.addEventListener('input', (e) => {
    const value = e.target.value;
    displayPhrase.textContent = value;
    
    // Automatically switch to back card preview when typing back card fields
    if (!card3D.classList.contains('flipped')) {
      flipCard();
    }
  });

  // --- Verse Handling ---

  selectVerse.addEventListener('change', (e) => {
    const value = e.target.value;
    
    if (value === 'custom') {
      customVerseGroup.classList.remove('hidden');
      updateCustomVerse();
    } else {
      customVerseGroup.classList.add('hidden');
      displayVerse.textContent = presetVerses[value].text;
      displayVerseRef.textContent = presetVerses[value].ref;
    }

    // Flip to back card to preview verse changes
    if (!card3D.classList.contains('flipped')) {
      flipCard();
    }
  });

  // Custom verse listeners
  textareaVerse.addEventListener('input', updateCustomVerse);
  inputVerseRef.addEventListener('input', updateCustomVerse);

  function updateCustomVerse() {
    const textVal = textareaVerse.value.trim() || 'Digite seu versículo personalizado aqui...';
    const refVal = inputVerseRef.value.trim() || 'Referência';
    displayVerse.textContent = textVal.startsWith('"') ? textVal : `"${textVal}"`;
    displayVerseRef.textContent = refVal;
  }

  // --- Photo Upload & Position Control ---

  // Drag and drop events
  uploadZone.addEventListener('click', () => fileInput.click());

  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--neon-pink)';
    uploadZone.style.background = 'rgba(255, 0, 127, 0.05)';
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = 'rgba(0, 245, 255, 0.3)';
    uploadZone.style.background = 'rgba(0, 245, 255, 0.02)';
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'rgba(0, 245, 255, 0.3)';
    uploadZone.style.background = 'rgba(0, 245, 255, 0.02)';

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  });

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, envie apenas arquivos de imagem.');
      return;
    }

    compressImage(file, 600, 600, (compressedDataUrl) => {
      // Clear placeholder and load image
      avatarDisplay.innerHTML = '';
      avatarImg = document.createElement('img');
      avatarImg.alt = 'Avatar do Participante';
      
      // Default position state
      avatarScale = 1.0;
      avatarPosX = 0;
      avatarPosY = 0;
      
      avatarImg.onload = () => {
        avatarDisplay.appendChild(avatarImg);
        updateAvatarTransform();
        enableAvatarControls();
      };
      avatarImg.src = compressedDataUrl;
    });

    // Make sure front of card is visible
    if (card3D.classList.contains('flipped')) {
      flipCard();
    }
  }

  function enableAvatarControls() {
    avatarControls.classList.remove('disabled');
    zoomSlider.disabled = false;
    btnMoveUp.disabled = false;
    btnMoveDown.disabled = false;
    btnMoveLeft.disabled = false;
    btnMoveRight.disabled = false;
    zoomSlider.value = 100;
  }

  // Handle Zoom
  zoomSlider.addEventListener('input', (e) => {
    avatarScale = parseFloat(e.target.value) / 100;
    updateAvatarTransform();
  });

  // Handle Numpad Arrows Position
  const STEP = 5; // pixels
  btnMoveUp.addEventListener('click', () => { avatarPosY -= STEP; updateAvatarTransform(); });
  btnMoveDown.addEventListener('click', () => { avatarPosY += STEP; updateAvatarTransform(); });
  btnMoveLeft.addEventListener('click', () => { avatarPosX -= STEP; updateAvatarTransform(); });
  btnMoveRight.addEventListener('click', () => { avatarPosX += STEP; updateAvatarTransform(); });

  function updateAvatarTransform() {
    if (avatarImg) {
      avatarImg.style.transform = `scale(${avatarScale}) translate(${avatarPosX}px, ${avatarPosY}px)`;
    }
  }

  // --- Flip Logic ---

  btnFlip.addEventListener('click', flipCard);
  card3D.addEventListener('click', flipCard);
  dotFront.addEventListener('click', () => { if (card3D.classList.contains('flipped')) flipCard(); });
  dotBack.addEventListener('click', () => { if (!card3D.classList.contains('flipped')) flipCard(); });

  function flipCard() {
    card3D.classList.toggle('flipped');
    const isFlipped = card3D.classList.contains('flipped');
    
    if (isFlipped) {
      dotFront.classList.remove('active');
      dotBack.classList.add('active');
    } else {
      dotFront.classList.add('active');
      dotBack.classList.remove('active');
    }
  }

  // --- Print Feature ---

  btnPrint.addEventListener('click', () => {
    printLayoutContainer.innerHTML = '';
    const printPage = document.createElement('div');
    printPage.className = 'print-page';
    
    const printRow = document.createElement('div');
    printRow.className = 'print-row';
    
    const frontClone = document.getElementById('card-front-capture').cloneNode(true);
    const backClone = document.getElementById('card-back-capture').cloneNode(true);
    
    const frontWrapper = document.createElement('div');
    frontWrapper.className = 'print-card-wrapper';
    frontWrapper.appendChild(frontClone);
    
    const backWrapper = document.createElement('div');
    backWrapper.className = 'print-card-wrapper';
    backWrapper.appendChild(backClone);
    
    printRow.appendChild(frontWrapper);
    printRow.appendChild(backWrapper);
    printPage.appendChild(printRow);
    printLayoutContainer.appendChild(printPage);
    
    setTimeout(() => {
      window.print();
    }, 150);
  });

  // --- Download PNG Feature (html2canvas with Flat Clone Isolation) ---

  btnDownload.addEventListener('click', async () => {
    // Show a loading feedback on the button
    const oldText = btnDownload.innerHTML;
    btnDownload.innerHTML = `
      <svg class="spinner" viewBox="0 0 50 50" style="width: 18px; height: 18px; animation: rotate 1s infinite linear; vertical-align: middle; margin-right: 8px; display: inline-block; color: currentColor;">
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" style="stroke-dasharray: 80, 200; stroke-dashoffset: 0;"></circle>
      </svg>
      Gerando Imagens...
    `;
    btnDownload.disabled = true;

    try {
      // Capture Front
      await captureFlatCard('card-front-capture', `cracha-experience-teens-${sanitizeName(inputName.value)}-frente.png`);

      // Capture Back
      await captureFlatCard('card-back-capture', `cracha-experience-teens-${sanitizeName(inputName.value)}-verso.png`);

    } catch (error) {
      console.error('Error generating card image:', error);
      alert('Houve um erro ao gerar o download do crachá. Detalhes: ' + error.message);
    } finally {
      btnDownload.innerHTML = oldText;
      btnDownload.disabled = false;
    }
  });

  async function captureFlatCard(elementId, filename) {
    const originalEl = document.getElementById(elementId);
    if (!originalEl) throw new Error(`Elemento #${elementId} não encontrado`);

    // Clone element
    const clone = originalEl.cloneNode(true);

    // Apply styles to isolate and flatten the clone completely
    clone.style.position = 'fixed';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.transform = 'none';
    clone.style.backfaceVisibility = 'visible';
    clone.style.webkitBackfaceVisibility = 'visible';
    clone.style.transition = 'none';
    clone.style.borderRadius = '0'; // Flat cuts for high-resolution print files
    clone.style.width = '325px'; // Exact screen size
    clone.style.height = '445px';
    
    // Ensure any nested 3D elements inside are visible
    clone.querySelectorAll('*').forEach(el => {
      el.style.transform = window.getComputedStyle(el).transform;
      el.style.transition = 'none';
    });

    document.body.appendChild(clone);

    // Config properties for high-res output
    const renderOptions = {
      scale: 4, // 4x scale (approx 1300 x 1780 px) - prints at 300 DPI beautifully!
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false
    };

    try {
      // Let any images render inside the DOM
      await new Promise(r => setTimeout(r, 150));
      const canvas = await html2canvas(clone, renderOptions);
      downloadCanvasAsPNG(canvas, filename);
    } finally {
      document.body.removeChild(clone);
    }
  }

  function downloadCanvasAsPNG(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function sanitizeName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').substring(0, 15);
  }
  // Helper: compress/downscale uploaded image to fit LocalStorage quotas
  function compressImage(file, maxWidth, maxHeight, callback) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        let width = img.width;
        let height = img.height;

        // Keep aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high quality JPEG to save storage space
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        callback(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // --- Saved Badges State & Logic ---
  let currentBadgeId = null;
  let savedBadges = JSON.parse(localStorage.getItem('kids_saved_badges')) || [];
  let selectedBadgeIds = new Set();

  const btnSave = document.getElementById('btn-save');
  const btnNew = document.getElementById('btn-new');
  const selectAllSaved = document.getElementById('select-all-saved');
  const btnPrintSelected = document.getElementById('btn-print-selected');
  const btnClearSaved = document.getElementById('btn-clear-saved');
  const savedBadgesGrid = document.getElementById('saved-badges-grid');
  const selectedCountSpan = document.getElementById('selected-count');
  const printLayoutContainer = document.getElementById('print-layout-container');

  function clearEditor() {
    currentBadgeId = null;
    inputName.value = '';
    displayName.textContent = 'Seu Nome Aqui';
    
    // Reset Verse back to default (1)
    selectVerse.value = '1';
    customVerseGroup.classList.add('hidden');
    displayVerse.textContent = presetVerses['1'].text;
    displayVerseRef.textContent = presetVerses['1'].ref;
    
    // Reset Phrase
    inputPhrase.value = '';
    displayPhrase.textContent = '';
    
    // Reset Photo Placeholder
    avatarDisplay.innerHTML = `
      <div class="avatar-placeholder">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <span>FOTO</span>
      </div>
    `;
    avatarImg = null;
    avatarScale = 1.0;
    avatarPosX = 0;
    avatarPosY = 0;
    avatarControls.classList.add('disabled');
    zoomSlider.disabled = true;
    btnMoveUp.disabled = true;
    btnMoveDown.disabled = true;
    btnMoveLeft.disabled = true;
    btnMoveRight.disabled = true;
    
    // Restore button text
    btnSave.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
      </svg>
      Salvar Crachá
    `;
    
    // Flip back to front
    if (card3D.classList.contains('flipped')) {
      flipCard();
    }
  }

  if (btnNew) {
    btnNew.addEventListener('click', clearEditor);
  }

  function renderSavedBadges() {
    if (savedBadges.length === 0) {
      savedBadgesGrid.innerHTML = '<div class="no-saved-msg">Nenhum crachá salvo ainda. Monte um crachá e clique em "Salvar Crachá".</div>';
      selectAllSaved.checked = false;
      updateBatchControls();
      return;
    }

    savedBadgesGrid.innerHTML = '';
    savedBadges.forEach(badge => {
      const card = document.createElement('div');
      card.className = `saved-item-card ${selectedBadgeIds.has(badge.id) ? 'selected' : ''}`;
      card.dataset.id = badge.id;

      // Checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'saved-item-checkbox';
      checkbox.checked = selectedBadgeIds.has(badge.id);
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        toggleSelectBadge(badge.id, checkbox.checked);
      });
      card.appendChild(checkbox);

      // Info block click opens for edit
      const infoBlock = document.createElement('div');
      infoBlock.className = 'saved-item-info';
      infoBlock.addEventListener('click', () => loadBadgeForEdit(badge.id));

      // Thumbnail photo
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'saved-item-avatar';
      if (badge.photo) {
        const img = document.createElement('img');
        img.src = badge.photo;
        avatarDiv.appendChild(img);
      } else {
        avatarDiv.innerHTML = `
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        `;
      }
      infoBlock.appendChild(avatarDiv);

      // Name & verse reference
      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'saved-item-details';
      const nameSpan = document.createElement('span');
      nameSpan.className = 'saved-item-name';
      nameSpan.textContent = badge.name || 'Sem Nome';
      detailsDiv.appendChild(nameSpan);

      const verseSpan = document.createElement('span');
      verseSpan.className = 'saved-item-verse';
      verseSpan.textContent = badge.verseRef || 'Sem Versículo';
      detailsDiv.appendChild(verseSpan);

      infoBlock.appendChild(detailsDiv);
      card.appendChild(infoBlock);

      // Actions (delete)
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'saved-item-actions';
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'action-btn delete-btn';
      deleteBtn.title = 'Excluir crachá';
      deleteBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
      `;
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteBadge(badge.id);
      });
      actionsDiv.appendChild(deleteBtn);
      card.appendChild(actionsDiv);

      savedBadgesGrid.appendChild(card);
    });

    updateBatchControls();
  }

  function toggleSelectBadge(id, isSelected) {
    if (isSelected) {
      selectedBadgeIds.add(id);
    } else {
      selectedBadgeIds.delete(id);
    }
    renderSavedBadges();
  }

  function updateBatchControls() {
    selectedCountSpan.textContent = selectedBadgeIds.size;
    if (selectedBadgeIds.size > 0) {
      btnPrintSelected.classList.remove('disabled');
    } else {
      btnPrintSelected.classList.add('disabled');
    }
    
    // Check state of select all
    if (savedBadges.length > 0 && selectedBadgeIds.size === savedBadges.length) {
      selectAllSaved.checked = true;
    } else {
      selectAllSaved.checked = false;
    }
  }

  selectAllSaved.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      savedBadges.forEach(b => selectedBadgeIds.add(b.id));
    } else {
      selectedBadgeIds.clear();
    }
    renderSavedBadges();
  });

  btnClearSaved.addEventListener('click', () => {
    if (confirm('Tem certeza de que deseja excluir todos os crachás salvos?')) {
      savedBadges = [];
      selectedBadgeIds.clear();
      localStorage.removeItem('kids_saved_badges');
      currentBadgeId = null;
      btnSave.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
        </svg>
        Salvar Crachá
      `;
      renderSavedBadges();
    }
  });

  function deleteBadge(id) {
    if (confirm('Deseja realmente excluir este crachá?')) {
      savedBadges = savedBadges.filter(b => b.id !== id);
      selectedBadgeIds.delete(id);
      localStorage.setItem('kids_saved_badges', JSON.stringify(savedBadges));
      if (currentBadgeId === id) {
        currentBadgeId = null;
        btnSave.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
          </svg>
          Salvar Crachá
        `;
      }
      renderSavedBadges();
    }
  }

  function loadBadgeForEdit(id) {
    const badge = savedBadges.find(b => b.id === id);
    if (!badge) return;

    currentBadgeId = id;
    
    // Change save button text to show we are editing
    btnSave.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
      </svg>
      Atualizar Crachá
    `;

    // Load form values
    inputName.value = badge.name;
    displayName.textContent = badge.name || 'Seu Nome Aqui';

    selectVerse.value = badge.verseType;
    if (badge.verseType === 'custom') {
      customVerseGroup.classList.remove('hidden');
      textareaVerse.value = badge.verseText.replace(/^"|"$/g, '');
      inputVerseRef.value = badge.verseRef;
      displayVerse.textContent = badge.verseText;
      displayVerseRef.textContent = badge.verseRef;
    } else {
      customVerseGroup.classList.add('hidden');
      displayVerse.textContent = presetVerses[badge.verseType].text;
      displayVerseRef.textContent = presetVerses[badge.verseType].ref;
    }

    inputPhrase.value = badge.phrase;
    displayPhrase.textContent = badge.phrase;

    // Load Photo
    if (badge.photo) {
      avatarDisplay.innerHTML = '';
      avatarImg = document.createElement('img');
      avatarImg.alt = 'Avatar do Participante';
      
      avatarScale = badge.transform.scale;
      avatarPosX = badge.transform.posX;
      avatarPosY = badge.transform.posY;
      
      avatarImg.onload = () => {
        avatarDisplay.appendChild(avatarImg);
        updateAvatarTransform();
        enableAvatarControls();
      };
      avatarImg.src = badge.photo;
      
      // Update slider input value
      zoomSlider.value = Math.round(avatarScale * 100);
    } else {
      // Restore default placeholder
      avatarDisplay.innerHTML = `
        <div class="avatar-placeholder">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <span>FOTO</span>
        </div>
      `;
      avatarImg = null;
      avatarScale = 1.0;
      avatarPosX = 0;
      avatarPosY = 0;
      avatarControls.classList.add('disabled');
      zoomSlider.disabled = true;
      btnMoveUp.disabled = true;
      btnMoveDown.disabled = true;
      btnMoveLeft.disabled = true;
      btnMoveRight.disabled = true;
    }

    // Force flip to front
    if (card3D.classList.contains('flipped')) {
      flipCard();
    }
  }

  // Handle click on Salvar Crachá
  btnSave.addEventListener('click', () => {
    const nameVal = inputName.value.trim();
    if (!nameVal || nameVal === 'Seu Nome Aqui') {
      alert('Por favor, digite o nome do participante antes de salvar.');
      return;
    }

    const currentPhoto = avatarImg ? avatarImg.src : null;

    const badgeData = {
      name: nameVal,
      verseType: selectVerse.value,
      verseText: displayVerse.textContent,
      verseRef: displayVerseRef.textContent,
      phrase: inputPhrase.value.trim(),
      photo: currentPhoto,
      transform: {
        scale: avatarScale,
        posX: avatarPosX,
        posY: avatarPosY
      }
    };

    if (currentBadgeId) {
      // Update existing badge
      const index = savedBadges.findIndex(b => b.id === currentBadgeId);
      if (index !== -1) {
        badgeData.id = currentBadgeId;
        savedBadges[index] = badgeData;
      }
    } else {
      // Create new badge
      badgeData.id = 'badge_' + Date.now();
      savedBadges.push(badgeData);
    }

    try {
      localStorage.setItem('kids_saved_badges', JSON.stringify(savedBadges));
      
      // Flash save feedback
      btnSave.innerHTML = 'Salvo com sucesso!';
      btnSave.disabled = true;
      
      setTimeout(() => {
        btnSave.disabled = false;
        clearEditor(); // Reset to default / clear form for next card
      }, 1000);

      renderSavedBadges();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar no armazenamento local. Limite de tamanho excedido. Remova crachás antigos ou use fotos menores.');
    }
  });

  // Batch Printing Feature (Landscape A4: 2x2 Grid per page)
  btnPrintSelected.addEventListener('click', () => {
    if (selectedBadgeIds.size === 0) return;

    // Filter selected badges
    const selectedBadgesList = savedBadges.filter(b => selectedBadgeIds.has(b.id));

    // Clear previous print slots
    printLayoutContainer.innerHTML = '';

    // Chunk size is 4 (landscape fits 2 columns x 2 rows)
    const chunkSize = 4;
    for (let i = 0; i < selectedBadgesList.length; i += chunkSize) {
      const pageChunk = selectedBadgesList.slice(i, i + chunkSize);
      
      // Create print page container
      const printPage = document.createElement('div');
      printPage.className = 'print-page';

      pageChunk.forEach(badge => {
        // Create row container containing [Front] and [Back]
        const printRow = document.createElement('div');
        printRow.className = 'print-row';

        // 1. CLONE FRONT
        const frontWrapper = document.createElement('div');
        frontWrapper.className = 'print-card-wrapper';
        const frontClone = document.getElementById('card-front-capture').cloneNode(true);
        
        // Populate front properties
        frontClone.querySelector('#display-name').textContent = badge.name || 'Sem Nome';
        
        const avatarDisplay = frontClone.querySelector('#avatar-display');
        avatarDisplay.innerHTML = '';
        if (badge.photo) {
          const img = document.createElement('img');
          img.src = badge.photo;
          img.style.transform = `scale(${badge.transform.scale}) translate(${badge.transform.posX}px, ${badge.transform.posY}px)`;
          avatarDisplay.appendChild(img);
        } else {
          avatarDisplay.innerHTML = `
            <div class="avatar-placeholder">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>FOTO</span>
            </div>
          `;
        }

        frontWrapper.appendChild(frontClone);
        printRow.appendChild(frontWrapper);

        // 2. CLONE BACK
        const backWrapper = document.createElement('div');
        backWrapper.className = 'print-card-wrapper';
        const backClone = document.getElementById('card-back-capture').cloneNode(true);

        // Populate back properties
        backClone.querySelector('#display-verse').textContent = badge.verseText;
        backClone.querySelector('#display-verse-ref').textContent = badge.verseRef;
        backClone.querySelector('#display-phrase').textContent = badge.phrase;

        backWrapper.appendChild(backClone);
        printRow.appendChild(backWrapper);

        printPage.appendChild(printRow);
      });

      printLayoutContainer.appendChild(printPage);
    }

    // Call native print window
    window.print();
  });

  // Render list on startup
  renderSavedBadges();
});