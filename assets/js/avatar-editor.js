/**
 * QuizSpark 3D Full-Body Avatar System - Interactive Customization Studio
 * 11-category navigation, 30+ customizable features, 3D rotation, zoom, undo/redo,
 * live custom color picker, instant preview, and full mobile responsiveness.
 */
(function (global) {
  'use strict';

  const MAIN_CATEGORIES = [
    {
      id: 'face',
      label: 'Body & Face',
      icon: '👤',
      subtabs: [
        { id: 'body', label: 'Body Shape', icon: '🧍' },
        { id: 'skin', label: 'Skin Tone', icon: '🎨' },
        { id: 'face', label: 'Face Shape', icon: '🙂' },
        { id: 'eyes', label: 'Eyes', icon: '👀' },
        { id: 'eyeColor', label: 'Eye Color', icon: '👁️' },
        { id: 'eyebrows', label: 'Eyebrows', icon: '〰️' },
        { id: 'nose', label: 'Nose', icon: '👃' },
        { id: 'mouth', label: 'Mouth / Smile', icon: '👄' },
        { id: 'freckles', label: 'Marks & Spots', icon: '✨' }
      ]
    },
    {
      id: 'hair',
      label: 'Hairstyles',
      icon: '💇',
      colorKey: 'hairColor',
      subtabs: []
    },
    {
      id: 'hairColor',
      label: 'Hair Color',
      icon: '💈',
      isColorOnly: true,
      colorKey: 'hairColor',
      subtabs: []
    },
    {
      id: 'glasses',
      label: 'Spectacles',
      icon: '👓',
      colorKey: 'glassesColor',
      subtabs: []
    },
    {
      id: 'headwear',
      label: 'Hats & Headwear',
      icon: '🧢',
      colorKey: 'headwearColor',
      subtabs: []
    },
    {
      id: 'top',
      label: 'Tops & Shirts',
      icon: '👕',
      colorKey: 'topColor',
      subtabs: []
    },
    {
      id: 'bottom',
      label: 'Pants & Lowers',
      icon: '👖',
      colorKey: 'bottomColor',
      subtabs: []
    },
    {
      id: 'dress',
      label: 'Dresses',
      icon: '👗',
      colorKey: 'dressColor',
      subtabs: []
    },
    {
      id: 'shoes',
      label: 'Shoes',
      icon: '👟',
      colorKey: 'shoeColor',
      subtabs: []
    },
    {
      id: 'facialHair',
      label: 'Facial Hair',
      icon: '🧔',
      colorKey: 'facialHairColor',
      subtabs: []
    },
    {
      id: 'accessories',
      label: 'Accessories',
      icon: '🕶️',
      colorKey: 'accessoryColor',
      subtabs: [
        { id: 'accessory', label: 'Wearables & Bags', icon: '🎒' },
        { id: 'specialItem', label: 'Special Items', icon: '🏆' }
      ]
    }
  ];

  class AvatarEditor {
    constructor(options = {}) {
      this.initialConfig = Object.assign({}, AvatarEngine.DEFAULT_CONFIGS.boy, options.initialConfig || {});
      this.currentConfig = Object.assign({}, this.initialConfig);
      this.activeCategory = 'face';
      this.activeSubtab = 'body';
      this.rotation = 'front';
      this.zoom = 1;
      this.onSave = options.onSave || null;
      this.onChange = options.onChange || null;

      // History stack for Undo / Redo
      this.history = [];
      this.historyIndex = -1;
      this.categories = MAIN_CATEGORIES;

      this.initDom();
      this.bindEvents();
      this.pushHistory(this.currentConfig);
    }

    pushHistory(config) {
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }
      this.history.push(JSON.parse(JSON.stringify(config)));
      this.historyIndex = this.history.length - 1;
      this.updateUndoRedoBtns();
    }

    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.currentConfig = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
        this.updateGenderPills();
        this.renderSubtabs();
        this.renderOptionsGrid();
        this.updatePreview();
        this.updateUndoRedoBtns();
        this.showToast('⤺ Undone');
      }
    }

    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.currentConfig = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
        this.updateGenderPills();
        this.renderSubtabs();
        this.renderOptionsGrid();
        this.updatePreview();
        this.updateUndoRedoBtns();
        this.showToast('⤻ Redone');
      }
    }

    updateUndoRedoBtns() {
      const undoBtn = document.getElementById('undoAvatarBtn');
      const redoBtn = document.getElementById('redoAvatarBtn');
      if (undoBtn) undoBtn.disabled = this.historyIndex <= 0;
      if (redoBtn) redoBtn.disabled = this.historyIndex >= this.history.length - 1;
    }

    initDom() {
      let backdrop = document.getElementById('avatarEditorModal');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'avatarEditorModal';
        backdrop.className = 'avatar-modal-backdrop';
        backdrop.innerHTML = `
          <div class="avatar-modal-window" role="dialog" aria-modal="true" aria-labelledby="avatarModalTitle">
            <!-- Studio Header -->
            <div class="avatar-modal-header">
              <div class="avatar-header-left">
                <h2 id="avatarModalTitle" class="avatar-studio-title">✨ Avatar Customization Studio</h2>
                <div class="avatar-gender-pill-group" id="editorGenderToggle">
                  <button type="button" class="avatar-gender-pill" data-gender="boy">👦 Boy</button>
                  <button type="button" class="avatar-gender-pill" data-gender="girl">👧 Girl</button>
                </div>
              </div>
              <div class="avatar-header-actions">
                <button type="button" id="headerSaveBtn" class="btn btn-primary btn-sm" style="font-weight: 800; padding: 6px 16px;">
                  ✓ Save
                </button>
                <button type="button" class="avatar-modal-close" id="closeAvatarModalBtn" aria-label="Close Editor">&times;</button>
              </div>
            </div>

            <!-- Studio Body (Stage + Studio Navigation & Options) -->
            <div class="avatar-modal-body">
              <!-- Left / Top: Interactive 3D Preview Stage -->
              <div class="avatar-modal-preview-panel">
                <div class="avatar-360-header">
                  <span class="rotate-arrow">↶</span>
                  <span class="rotate-label">360° 3D AVATAR VIEW</span>
                  <span class="rotate-arrow">↷</span>
                </div>

                <div class="avatar-modal-preview-stage" id="modalAvatarPreviewStage">
                  <!-- Dynamic 3D Avatar Mounted Here -->
                </div>

                <!-- 3D Rotation Step Controls -->
                <div class="avatar-360-controls" role="group" aria-label="360 Rotation Controls">
                  <button type="button" class="btn-360-step" id="editorRotLeft" title="Rotate Left 45°">↶ Rotate Left</button>
                  <button type="button" class="btn-360-step btn-360-reset" id="editorRotReset" title="Reset View">↺ Reset View</button>
                  <button type="button" class="btn-360-step" id="editorRotRight" title="Rotate Right 45°">Rotate Right ↷</button>
                </div>

                <!-- 3D Rotation Angle Presets & Zoom Toolbar -->
                <div class="avatar-stage-controls">
                  <div class="avatar-rotation-bar" role="group" aria-label="3D View Angle">
                    <button type="button" class="avatar-rot-btn active" data-rot="front" title="Front View">Front</button>
                    <button type="button" class="avatar-rot-btn" data-rot="three_quarter_left" title="3/4 Left View">↖ 3/4</button>
                    <button type="button" class="avatar-rot-btn" data-rot="three_quarter_right" title="3/4 Right View">3/4 ↗</button>
                    <button type="button" class="avatar-rot-btn" data-rot="side" title="Profile View">Side</button>
                    <button type="button" class="avatar-rot-btn" data-rot="back" title="Back View">Back</button>
                  </div>
                  <div class="avatar-zoom-bar" role="group" aria-label="Zoom Controls">
                    <button type="button" id="zoomOutBtn" class="avatar-zoom-btn" title="Zoom Out">−</button>
                    <span id="zoomLabel" class="avatar-zoom-label">100%</span>
                    <button type="button" id="zoomInBtn" class="avatar-zoom-btn" title="Zoom In">+</button>
                  </div>
                </div>

                <div class="avatar-drag-hint">
                  <span class="hint-icon">👆</span>
                  <span class="hint-text">Drag or swipe to rotate 360°</span>
                </div>
              </div>

              <!-- Right / Bottom: Category Tabs, Subtabs, Color Picker, Options Grid -->
              <div class="avatar-modal-edit-panel">
                <!-- Top-Level Category Navigation Bar (11 Categories) -->
                <div class="avatar-main-category-nav" id="avatarMainCategoryNav" role="tablist"></div>

                <!-- Sub-Category Feature Chips -->
                <div class="avatar-subtab-nav" id="avatarSubtabNav" role="tablist"></div>

                <!-- Integrated Color Swatch & Custom Picker Strip -->
                <div class="avatar-color-strip" id="avatarColorStrip" style="display: none;"></div>

                <!-- Item Selection Grid Area -->
                <div class="avatar-options-area">
                  <div class="avatar-options-grid" id="avatarOptionsGrid"></div>
                </div>

                <!-- Action Footer Bar -->
                <div class="avatar-modal-footer">
                  <div class="avatar-footer-left">
                    <button type="button" id="undoAvatarBtn" class="btn btn-secondary btn-sm" title="Undo change" disabled>
                      ⤺ Undo
                    </button>
                    <button type="button" id="redoAvatarBtn" class="btn btn-secondary btn-sm" title="Redo change" disabled>
                      ⤻ Redo
                    </button>
                    <button type="button" id="randomizeAvatarBtn" class="btn btn-secondary btn-sm" title="Generate coordinated look">
                      🎲 Randomize
                    </button>
                    <button type="button" id="resetAvatarBtn" class="btn btn-secondary btn-sm" title="Reset to default">
                      ↺ Reset
                    </button>
                  </div>
                  <div class="avatar-footer-right" style="display: flex; gap: 8px;">
                    <button type="button" id="cancelAvatarBtn" class="btn btn-secondary btn-sm">
                      Cancel
                    </button>
                    <button type="button" id="saveAvatarBtn" class="btn btn-primary" style="padding: 8px 20px; font-weight: 800;">
                      ✓ Save Avatar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(backdrop);
      }

      this.backdrop = backdrop;
      this.previewStage = document.getElementById('modalAvatarPreviewStage');
      this.mainCatNav = document.getElementById('avatarMainCategoryNav');
      this.subtabNav = document.getElementById('avatarSubtabNav');
      this.colorStrip = document.getElementById('avatarColorStrip');
      this.optionsGrid = document.getElementById('avatarOptionsGrid');
      this.genderToggle = document.getElementById('editorGenderToggle');
      this.zoomLabel = document.getElementById('zoomLabel');

      this.renderMainCategories();
      this.renderSubtabs();
      this.renderColorStrip();
      this.renderOptionsGrid();
      this.updateGenderPills();
      this.updatePreview();
    }

    bindEvents() {
      document.getElementById('closeAvatarModalBtn').addEventListener('click', () => this.close());
      document.getElementById('cancelAvatarBtn').addEventListener('click', () => this.close());
      document.getElementById('randomizeAvatarBtn').addEventListener('click', () => this.randomize());
      document.getElementById('resetAvatarBtn').addEventListener('click', () => this.reset());
      document.getElementById('saveAvatarBtn').addEventListener('click', () => this.save());
      document.getElementById('headerSaveBtn').addEventListener('click', () => this.save());
      document.getElementById('undoAvatarBtn').addEventListener('click', () => this.undo());
      document.getElementById('redoAvatarBtn').addEventListener('click', () => this.redo());

      // 360 Step Rotation & Reset Buttons
      const btnRotLeft = document.getElementById('editorRotLeft');
      const btnRotRight = document.getElementById('editorRotRight');
      const btnRotReset = document.getElementById('editorRotReset');

      if (btnRotLeft) {
        btnRotLeft.addEventListener('click', () => {
          const vp = AvatarEngine.getViewport(this.previewStage);
          if (vp) vp.rotateBy(-Math.PI / 4);
        });
      }

      if (btnRotRight) {
        btnRotRight.addEventListener('click', () => {
          const vp = AvatarEngine.getViewport(this.previewStage);
          if (vp) vp.rotateBy(Math.PI / 4);
        });
      }

      if (btnRotReset) {
        btnRotReset.addEventListener('click', () => {
          const vp = AvatarEngine.getViewport(this.previewStage);
          if (vp) {
            vp.resetRotation();
            this.rotation = 'front';
            rotButtons.forEach(b => b.classList.remove('active'));
            const frontBtn = this.backdrop.querySelector('.avatar-rot-btn[data-rot="front"]');
            if (frontBtn) frontBtn.classList.add('active');
          }
        });
      }

      // 3D Rotation preset angle buttons
      const rotButtons = this.backdrop.querySelectorAll('.avatar-rot-btn');
      rotButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          rotButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.rotation = btn.dataset.rot;
          const vp = AvatarEngine.getViewport(this.previewStage);
          if (vp) {
            vp.setRotationAngle(this.rotation);
          } else {
            this.updatePreview();
          }
        });
      });

      // Zoom controls
      document.getElementById('zoomInBtn').addEventListener('click', () => {
        this.zoom = Math.min(1.4, Number((this.zoom + 0.1).toFixed(1)));
        this.updateZoomDisplay();
        const vp = AvatarEngine.getViewport(this.previewStage);
        if (vp) {
          vp.setZoom(this.zoom);
        } else {
          this.updatePreview();
        }
      });

      document.getElementById('zoomOutBtn').addEventListener('click', () => {
        this.zoom = Math.max(0.8, Number((this.zoom - 0.1).toFixed(1)));
        this.updateZoomDisplay();
        const vp = AvatarEngine.getViewport(this.previewStage);
        if (vp) {
          vp.setZoom(this.zoom);
        } else {
          this.updatePreview();
        }
      });

      // Gender toggle buttons
      if (this.genderToggle) {
        this.genderToggle.querySelectorAll('.avatar-gender-pill').forEach(btn => {
          btn.addEventListener('click', () => {
            const gender = btn.dataset.gender;
            if (this.currentConfig.style !== gender) {
              this.currentConfig = AvatarEngine.getDefault(gender);
              this.pushHistory(this.currentConfig);
              this.updateGenderPills();
              this.renderSubtabs();
              this.renderColorStrip();
              this.renderOptionsGrid();
              this.updatePreview();
            }
          });
        });
      }

      // Close on backdrop outside click
      this.backdrop.addEventListener('click', (e) => {
        if (e.target === this.backdrop) {
          this.close();
        }
      });

      // Escape key support
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.close();
        }
      });
    }

    updateZoomDisplay() {
      if (this.zoomLabel) {
        this.zoomLabel.textContent = `${Math.round(this.zoom * 100)}%`;
      }
    }

    open(config = null) {
      if (config) {
        this.initialConfig = Object.assign({}, config);
        this.currentConfig = Object.assign({}, config);
      }
      this.history = [];
      this.historyIndex = -1;
      this.pushHistory(this.currentConfig);

      this.backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      this.updateGenderPills();
      this.renderMainCategories();
      this.renderSubtabs();
      this.renderColorStrip();
      this.renderOptionsGrid();
      this.updatePreview();
    }

    close() {
      this.backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    isOpen() {
      return this.backdrop.classList.contains('open');
    }

    updateGenderPills() {
      if (!this.genderToggle) return;
      const current = this.currentConfig.style || 'boy';
      this.genderToggle.querySelectorAll('.avatar-gender-pill').forEach(btn => {
        if (btn.dataset.gender === current) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    updatePreview() {
      if (!this.previewStage) return;
      AvatarEngine.mount(this.previewStage, this.currentConfig, {
        mode: 'full',
        animated: true,
        rotation: this.rotation,
        zoom: this.zoom
      });
      if (this.onChange) {
        this.onChange(this.currentConfig);
      }
    }

    renderMainCategories() {
      this.mainCatNav.innerHTML = this.categories.map(cat => `
        <button type="button" class="avatar-main-cat-btn ${cat.id === this.activeCategory ? 'active' : ''}" data-cat="${cat.id}" role="tab" aria-selected="${cat.id === this.activeCategory}">
          <span class="cat-icon">${cat.icon}</span>
          <span class="cat-label">${cat.label}</span>
        </button>
      `).join('');

      this.mainCatNav.querySelectorAll('.avatar-main-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeCategory = btn.dataset.cat;
          const currentCatObj = this.categories.find(c => c.id === this.activeCategory);
          if (currentCatObj && currentCatObj.subtabs && currentCatObj.subtabs.length > 0) {
            this.activeSubtab = currentCatObj.subtabs[0].id;
          } else {
            this.activeSubtab = this.activeCategory;
          }
          this.renderMainCategories();
          this.renderSubtabs();
          this.renderColorStrip();
          this.renderOptionsGrid();
        });
      });
    }

    renderSubtabs() {
      const currentCatObj = this.categories.find(c => c.id === this.activeCategory);
      if (!currentCatObj || !currentCatObj.subtabs || currentCatObj.subtabs.length === 0) {
        this.subtabNav.innerHTML = '';
        this.subtabNav.style.display = 'none';
        return;
      }

      this.subtabNav.style.display = 'flex';
      this.subtabNav.innerHTML = currentCatObj.subtabs.map(sub => `
        <button type="button" class="avatar-subtab-chip ${sub.id === this.activeSubtab ? 'active' : ''}" data-sub="${sub.id}" role="tab" aria-selected="${sub.id === this.activeSubtab}">
          <span>${sub.icon}</span>
          <span>${sub.label}</span>
        </button>
      `).join('');

      this.subtabNav.querySelectorAll('.avatar-subtab-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeSubtab = btn.dataset.sub;
          this.renderSubtabs();
          this.renderColorStrip();
          this.renderOptionsGrid();
        });
      });
    }

    renderColorStrip() {
      const currentCatObj = this.categories.find(c => c.id === this.activeCategory);
      const colorKey = currentCatObj ? currentCatObj.colorKey : null;

      // Also support eyeColor, skin if selected as subtabs
      let targetColorField = colorKey;
      if (this.activeCategory === 'face') {
        if (this.activeSubtab === 'skin') targetColorField = 'skin';
        else if (this.activeSubtab === 'eyeColor') targetColorField = 'eyeColor';
      }

      if (!targetColorField || targetColorField === 'skin' || targetColorField === 'eyeColor') {
        this.colorStrip.innerHTML = '';
        this.colorStrip.style.display = 'none';
        return;
      }

      const palettes = AvatarEngine.PALETTES;
      const isHair = (targetColorField === 'hairColor' || targetColorField === 'facialHairColor');
      const paletteObj = isHair ? palettes.hairColor : palettes.clothing;
      const currentColorVal = this.currentConfig[targetColorField] || (isHair ? 'black' : 'blue');

      this.colorStrip.style.display = 'flex';
      this.colorStrip.innerHTML = `
        <div class="avatar-color-strip-header">
          <span class="avatar-color-strip-title">🎨 ${isHair ? 'Hair Color' : 'Color Palette'}</span>
          <label class="avatar-custom-color-picker-label" title="Pick custom color">
            <span>Custom:</span>
            <input type="color" class="avatar-custom-color-input" id="customColorInput_${targetColorField}" value="${currentColorVal.startsWith('#') ? currentColorVal : '#6c5ce7'}">
          </label>
        </div>
        <div class="avatar-color-swatches-scroll">
          ${Object.keys(paletteObj).map(k => {
            const isSelected = (currentColorVal === k);
            const hex = paletteObj[k].main;
            return `
              <button type="button" class="avatar-swatch-btn ${isSelected ? 'selected' : ''}" data-field="${targetColorField}" data-color="${k}" title="${paletteObj[k].label || k}">
                <span class="avatar-swatch-circle" style="background: ${hex};"></span>
              </button>
            `;
          }).join('')}
        </div>
      `;

      // Swatch Click Handlers
      this.colorStrip.querySelectorAll('.avatar-swatch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const field = btn.dataset.field;
          const col = btn.dataset.color;
          this.currentConfig[field] = col;
          this.pushHistory(this.currentConfig);
          this.renderColorStrip();
          this.updatePreview();
        });
      });

      // Custom Color Input Handler
      const customInput = document.getElementById(`customColorInput_${targetColorField}`);
      if (customInput) {
        customInput.addEventListener('input', (e) => {
          const hex = e.target.value;
          this.currentConfig[targetColorField] = hex;
          this.updatePreview();
        });
        customInput.addEventListener('change', (e) => {
          const hex = e.target.value;
          this.currentConfig[targetColorField] = hex;
          this.pushHistory(this.currentConfig);
          this.renderColorStrip();
          this.updatePreview();
        });
      }
    }

    renderOptionsGrid() {
      const currentCatObj = this.categories.find(c => c.id === this.activeCategory);
      let subKey = this.activeSubtab;
      if (!currentCatObj.subtabs || currentCatObj.subtabs.length === 0) {
        subKey = this.activeCategory;
      }

      if (currentCatObj.isColorOnly) {
        this.optionsGrid.innerHTML = `
          <div class="avatar-color-only-message">
            <p style="color: var(--text-muted); font-size: 0.95rem; margin: 12px 0;">Select from the color palette above or choose a custom hex color.</p>
          </div>
        `;
        return;
      }

      const opts = this.getOptionsForSubtab(subKey);

      this.optionsGrid.innerHTML = opts.map(item => {
        const isSelected = (this.currentConfig[subKey] === item.id);
        return `
          <button type="button" class="avatar-opt-card ${isSelected ? 'selected' : ''}" data-feature="${subKey}" data-val="${item.id}" aria-label="${item.label}">
            <div class="avatar-opt-preview">
              ${item.previewHtml}
            </div>
            <span class="avatar-opt-label">${item.label}</span>
          </button>
        `;
      }).join('');

      this.optionsGrid.querySelectorAll('.avatar-opt-card').forEach(card => {
        card.addEventListener('click', () => {
          const feature = card.dataset.feature;
          const val = card.dataset.val;
          this.currentConfig[feature] = val;

          // Mutual exclusivity between dresses and tops/pants
          if (feature === 'dress' && val !== 'none') {
            this.currentConfig.top = 'none';
            this.currentConfig.bottom = 'none';
          } else if ((feature === 'top' || feature === 'bottom') && val !== 'none') {
            this.currentConfig.dress = 'none';
          }

          this.pushHistory(this.currentConfig);
          this.renderOptionsGrid();
          this.updatePreview();
        });
      });
    }

    getOptionsForSubtab(featureId) {
      const palettes = AvatarEngine.PALETTES;
      const style = this.currentConfig.style || 'boy';

      switch (featureId) {
        case 'body':
          return [
            { id: 'regular', label: 'Regular', previewHtml: '🧍' },
            { id: 'slim', label: 'Slim Fit', previewHtml: '🚶' },
            { id: 'athletic', label: 'Athletic', previewHtml: '🏃' },
            { id: 'soft', label: 'Soft Form', previewHtml: '🧍' },
            { id: 'tall', label: 'Tall Frame', previewHtml: '🦒' },
            { id: 'short', label: 'Compact', previewHtml: '🐣' }
          ];

        case 'skin':
          return Object.keys(palettes.skin).map(k => ({
            id: k,
            label: palettes.skin[k].tone,
            previewHtml: `<div class="avatar-color-circle" style="background: ${palettes.skin[k].main};"></div>`
          }));

        case 'face':
          return [
            { id: 'face_round', label: 'Round', previewHtml: '🟢' },
            { id: 'face_oval', label: 'Oval', previewHtml: '🥚' },
            { id: 'face_square', label: 'Square', previewHtml: '🟲' },
            { id: 'face_soft', label: 'Soft Contour', previewHtml: '🤍' },
            { id: 'face_long', label: 'Long', previewHtml: '📏' },
            { id: 'face_wide', label: 'Wide', previewHtml: '↔️' },
            { id: 'face_heart', label: 'Heart', previewHtml: '💖' },
            { id: 'face_diamond', label: 'Diamond', previewHtml: '💎' },
            { id: 'face_chiseled', label: 'Chiseled', previewHtml: '🗿' }
          ];

        case 'eyes':
          return [
            { id: 'eyes_friendly', label: 'Friendly', previewHtml: '😊' },
            { id: 'eyes_bright', label: 'Bright', previewHtml: '✨' },
            { id: 'eyes_round', label: 'Round', previewHtml: '👀' },
            { id: 'eyes_almond', label: 'Almond', previewHtml: '👁️' },
            { id: 'eyes_large', label: 'Large / Expressive', previewHtml: '🌟' },
            { id: 'eyes_small', label: 'Small / Subtle', previewHtml: '🔹' },
            { id: 'eyes_soft', label: 'Soft / Calm', previewHtml: '😌' },
            { id: 'eyes_cartoon', label: 'Anime Star', previewHtml: '🤩' },
            { id: 'eyes_cateye', label: 'Cat-Eye', previewHtml: '🐱' },
            { id: 'eyes_focused', label: 'Focused', previewHtml: '🎯' }
          ];

        case 'eyeColor':
          return Object.keys(palettes.eyeColor).map(k => ({
            id: k,
            label: k.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            previewHtml: `<div class="avatar-color-circle" style="background: ${palettes.eyeColor[k]};"></div>`
          }));

        case 'eyebrows':
          return [
            { id: 'brows_natural', label: 'Natural', previewHtml: '〰️' },
            { id: 'brows_thick', label: 'Thick / Bold', previewHtml: '━' },
            { id: 'brows_thin', label: 'Thin Line', previewHtml: '─' },
            { id: 'brows_curved', label: 'Curved', previewHtml: '⌒' },
            { id: 'brows_straight', label: 'Straight', previewHtml: '一' },
            { id: 'brows_raised', label: 'Raised Arch', previewHtml: '↗️' },
            { id: 'brows_arched', label: 'High Arch', previewHtml: '∧' },
            { id: 'brows_bushy', label: 'Bushy', previewHtml: '🪶' }
          ];

        case 'nose':
          return [
            { id: 'nose_medium', label: 'Medium Classic', previewHtml: '👃' },
            { id: 'nose_small', label: 'Small', previewHtml: '•' },
            { id: 'nose_wide', label: 'Wide', previewHtml: '↔️' },
            { id: 'nose_rounded', label: 'Rounded Button', previewHtml: '⚪' },
            { id: 'nose_straight', label: 'Straight Bridge', previewHtml: '│' },
            { id: 'nose_aquiline', label: 'Aquiline / Defined', previewHtml: '📐' }
          ];

        case 'mouth':
          return [
            { id: 'mouth_smile', label: 'Warm Smile', previewHtml: '🙂' },
            { id: 'mouth_big_smile', label: 'Big Smile', previewHtml: '😃' },
            { id: 'mouth_laugh', label: 'Joyful Laugh', previewHtml: '😆' },
            { id: 'mouth_small_smile', label: 'Soft Smile', previewHtml: '😊' },
            { id: 'mouth_confident', label: 'Confident', previewHtml: '😏' },
            { id: 'mouth_friendly', label: 'Friendly', previewHtml: '😋' },
            { id: 'mouth_neutral', label: 'Neutral', previewHtml: '😐' },
            { id: 'mouth_grin', label: 'Cheeky Grin', previewHtml: '😁' }
          ];

        case 'freckles':
          return [
            { id: 'none', label: 'Clean Skin', previewHtml: '🚫' },
            { id: 'freckles_light', label: 'Light Freckles', previewHtml: '✨' },
            { id: 'freckles_cheeks', label: 'Cheek Freckles', previewHtml: '💫' },
            { id: 'beauty_spot_left', label: 'Beauty Spot (Left)', previewHtml: '📍' },
            { id: 'beauty_spot_right', label: 'Beauty Spot (Right)', previewHtml: '📍' },
            { id: 'dimples', label: 'Cute Dimples', previewHtml: '😊' }
          ];

        case 'facialHair':
          return [
            { id: 'none', label: 'Clean Shaved', previewHtml: '🚫' },
            { id: 'mustache', label: 'Classic Mustache', previewHtml: '👨' },
            { id: 'mustache_handlebar', label: 'Handlebar Mustache', previewHtml: '🥸' },
            { id: 'light_beard', label: '5 O’Clock Stubble', previewHtml: '🧔' },
            { id: 'short_beard', label: 'Short Boxed Beard', previewHtml: '🧔' },
            { id: 'full_beard', label: 'Full Lumberjack', previewHtml: '🎅' },
            { id: 'goatee', label: 'Goatee', previewHtml: '🐐' },
            { id: 'soul_patch', label: 'Soul Patch', previewHtml: '🔻' }
          ];

        case 'hair': {
          const boyHairs = [
            { id: 'hair_boy_fade', label: 'Skin Fade', previewHtml: '✂️' },
            { id: 'hair_boy_short', label: 'Classic Short', previewHtml: '👦' },
            { id: 'hair_boy_crew', label: 'Crew Cut', previewHtml: '💈' },
            { id: 'hair_boy_sidepart', label: 'Executive Side Part', previewHtml: '🤵' },
            { id: 'hair_boy_spiky', label: 'Spiky Punk', previewHtml: '⚡' },
            { id: 'hair_boy_curly', label: 'Curly Top', previewHtml: '🌀' },
            { id: 'hair_boy_messy', label: 'Messy Surfer Waves', previewHtml: '🌊' },
            { id: 'hair_boy_wavy', label: 'Flowing Wavy', previewHtml: '〰️' },
            { id: 'hair_boy_quiff', label: 'Modern Quiff', previewHtml: '✨' },
            { id: 'hair_boy_undercut', label: 'Sleek Undercut', previewHtml: '💇‍♂️' },
            { id: 'hair_afro', label: 'Afro Cloud', previewHtml: '☁️' },
            { id: 'hair_anime_spikes', label: 'Anime Spikes', previewHtml: '🔥' },
            { id: 'none', label: 'Bald / Clean', previewHtml: '🚫' }
          ];

          const girlHairs = [
            { id: 'hair_girl_wavy', label: 'Flowing Waves', previewHtml: '🌊' },
            { id: 'hair_girl_straight', label: 'Sleek Straight Long', previewHtml: '👩' },
            { id: 'hair_girl_curly', label: 'Bouncy Glam Curls', previewHtml: '🌀' },
            { id: 'hair_girl_ponytail', label: 'Casual Ponytail', previewHtml: '👱‍♀️' },
            { id: 'hair_girl_highpony', label: 'High Power Pony', previewHtml: '⚡' },
            { id: 'hair_girl_bun', label: 'Top Knot Bun', previewHtml: '🥟' },
            { id: 'hair_girl_doublebun', label: 'Space Buns', previewHtml: '🎀' },
            { id: 'hair_girl_bob', label: 'Chic French Bob', previewHtml: '💇‍♀️' },
            { id: 'hair_girl_braids', label: 'Twin Braids', previewHtml: '👧' },
            { id: 'hair_girl_sidebraid', label: 'Side Crown Braid', previewHtml: '🪄' },
            { id: 'hair_girl_pixie', label: 'Modern Pixie', previewHtml: '✨' },
            { id: 'hair_girl_wavymedium', label: 'Wavy Lob', previewHtml: '💫' },
            { id: 'none', label: 'Bald / Clean', previewHtml: '🚫' }
          ];

          return style === 'girl' ? girlHairs : boyHairs;
        }

        case 'glasses':
          return [
            { id: 'none', label: 'No Glasses', previewHtml: '🚫' },
            { id: 'glasses_round', label: 'Round Wireframe', previewHtml: '👓' },
            { id: 'glasses_square', label: 'Modern Square', previewHtml: '👓' },
            { id: 'glasses_thin', label: 'Thin Metal Executive', previewHtml: '🥽' },
            { id: 'glasses_thick', label: 'Thick Acetate Frames', previewHtml: '🕶️' },
            { id: 'glasses_gold_round', label: 'Gold Vintage Spectacles', previewHtml: '🟡' },
            { id: 'glasses_rimless', label: 'Rimless Minimal', previewHtml: '🪟' },
            { id: 'glasses_sunglasses', label: 'Dark Wayfarer Shades', previewHtml: '🕶️' },
            { id: 'glasses_aviator', label: 'Pilot Aviator Shades', previewHtml: '✈️' }
          ];

        case 'headwear':
          return [
            { id: 'none', label: 'No Headwear', previewHtml: '🚫' },
            { id: 'headwear_cap', label: 'Baseball Cap', previewHtml: '🧢' },
            { id: 'headwear_backward_cap', label: 'Backward Snapback', previewHtml: '🧢' },
            { id: 'headwear_snapback', label: 'Flat Brim Snapback', previewHtml: '🧢' },
            { id: 'headwear_beanie', label: 'Urban Knit Beanie', previewHtml: '🎿' },
            { id: 'headwear_bucket', label: 'Street Bucket Hat', previewHtml: '🪣' },
            { id: 'headwear_fedora', label: 'Classic Fedora / Panama', previewHtml: '👒' },
            { id: 'headwear_crown', label: 'Royal Gold Crown', previewHtml: '👑' },
            { id: 'headwear_headband', label: 'Athletic Headband', previewHtml: '🎀' },
            { id: 'headwear_winter_hat', label: 'Winter Pom Hat', previewHtml: '❄️' },
            { id: 'headwear_gradcap', label: 'Graduation Cap', previewHtml: '🎓' },
            { id: 'headwear_party', label: 'Party Cone Hat', previewHtml: '🎉' }
          ];

        case 'top':
          return [
            { id: 'top_tshirt', label: 'Classic Crew T-Shirt', previewHtml: '👕' },
            { id: 'top_printed', label: 'Graphic Print T-Shirt', previewHtml: '🎨' },
            { id: 'top_polo', label: 'Polo Shirt', previewHtml: '👔' },
            { id: 'top_hoodie', label: 'Streetwear Hoodie', previewHtml: '🧥' },
            { id: 'top_jacket', label: 'Track Zip Jacket', previewHtml: '🧥' },
            { id: 'top_leather_jacket', label: 'Biker Leather Jacket', previewHtml: '🏍️' },
            { id: 'top_blazer', label: 'Formal Blazer & Tie', previewHtml: '🤵' },
            { id: 'top_shirt', label: 'Crisp Button Shirt', previewHtml: '👔' },
            { id: 'top_casual', label: 'Casual Fitted Top', previewHtml: '👚' },
            { id: 'top_jersey', label: 'Sports Team Jersey', previewHtml: '🎽' },
            { id: 'top_sweater', label: 'Cozy Knit Sweater', previewHtml: '🧶' },
            { id: 'none', label: 'None / Dress Only', previewHtml: '🚫' }
          ];

        case 'bottom':
          return [
            { id: 'bottom_jeans', label: 'Classic Indigo Jeans', previewHtml: '👖' },
            { id: 'bottom_joggers', label: 'Athletic Joggers', previewHtml: '🩳' },
            { id: 'bottom_shorts', label: 'Summer Shorts', previewHtml: '🩳' },
            { id: 'bottom_cargo', label: 'Multi-Pocket Cargo', previewHtml: '📦' },
            { id: 'bottom_casual', label: 'Chino Slacks', previewHtml: '👖' },
            { id: 'bottom_formal', label: 'Tailored Trousers', previewHtml: '🤵' },
            { id: 'bottom_trackpants', label: 'Striped Track Pants', previewHtml: '🏃' },
            { id: 'bottom_skirt', label: 'Pleated Skirt', previewHtml: '👗' },
            { id: 'none', label: 'None / Dress Only', previewHtml: '🚫' }
          ];

        case 'dress':
          return [
            { id: 'none', label: 'None (Top + Pants Mode)', previewHtml: '🚫' },
            { id: 'dress_casual', label: 'Casual Day Dress', previewHtml: '👗' },
            { id: 'dress_party', label: 'Party Cocktail Dress', previewHtml: '💃' },
            { id: 'dress_summer', label: 'Summer Sundress', previewHtml: '🌻' },
            { id: 'dress_long', label: 'Elegant Evening Gown', previewHtml: '✨' },
            { id: 'dress_formal', label: 'Formal Dress', previewHtml: '👠' },
            { id: 'dress_traditional', label: 'Traditional Outfit', previewHtml: '🥻' }
          ];

        case 'shoes':
          return [
            { id: 'shoes_sneakers', label: 'Low-Top Sneakers', previewHtml: '👟' },
            { id: 'shoes_hightops', label: 'High-Top Streetwear', previewHtml: '👟' },
            { id: 'shoes_sports', label: 'Athletic Running Shoes', previewHtml: '🏃' },
            { id: 'shoes_boots', label: 'Leather Boots', previewHtml: '🥾' },
            { id: 'shoes_casual', label: 'Loafers / Slip-Ons', previewHtml: '👞' },
            { id: 'shoes_formal', label: 'Oxford Dress Shoes', previewHtml: '👠' },
            { id: 'shoes_sandals', label: 'Summer Sandals', previewHtml: '🩴' }
          ];

        case 'accessory':
          return [
            { id: 'none', label: 'None', previewHtml: '🚫' },
            { id: 'acc_headphones', label: 'Studio Headphones', previewHtml: '🎧' },
            { id: 'acc_earbuds', label: 'Wireless Earbuds', previewHtml: '⚪' },
            { id: 'acc_backpack', label: 'School / Tech Backpack', previewHtml: '🎒' },
            { id: 'acc_necklace', label: 'Gold Pendant Necklace', previewHtml: '📿' },
            { id: 'acc_earrings', label: 'Stud Earrings', previewHtml: '💎' },
            { id: 'acc_hoops', label: 'Gold Hoop Earrings', previewHtml: '⭕' },
            { id: 'acc_watch', label: 'Smart Watch', previewHtml: '⌚' },
            { id: 'acc_tie', label: 'Classic Tie', previewHtml: '👔' },
            { id: 'acc_bowtie', label: 'Dapper Bowtie', previewHtml: '🎀' },
            { id: 'acc_scarf', label: 'Winter Scarf', previewHtml: '🧣' }
          ];

        case 'specialItem':
          return [
            { id: 'none', label: 'None', previewHtml: '🚫' },
            { id: 'item_book', label: 'Study Textbook', previewHtml: '📚' },
            { id: 'item_laptop', label: 'Tech Laptop', previewHtml: '💻' },
            { id: 'item_pencil', label: 'Magic Pencil', previewHtml: '✏️' },
            { id: 'item_trophy', label: 'Champion Gold Trophy', previewHtml: '🏆' },
            { id: 'item_gaming_headset', label: 'Pro Gaming Headset', previewHtml: '🎮' },
            { id: 'item_face_mask', label: 'Street Face Mask', previewHtml: '😷' }
          ];

        default:
          return [];
      }
    }

    randomize() {
      const currentStyle = this.currentConfig.style || 'boy';
      this.currentConfig = AvatarEngine.randomize(currentStyle);
      this.pushHistory(this.currentConfig);
      this.renderSubtabs();
      this.renderColorStrip();
      this.renderOptionsGrid();
      this.updatePreview();
      this.showToast('🎲 Generated fresh coordinated avatar style!');
    }

    reset() {
      if (confirm('Reset avatar back to initial default configuration?')) {
        this.currentConfig = Object.assign({}, this.initialConfig);
        this.pushHistory(this.currentConfig);
        this.updateGenderPills();
        this.renderMainCategories();
        this.renderSubtabs();
        this.renderColorStrip();
        this.renderOptionsGrid();
        this.updatePreview();
        this.showToast('↺ Restored initial avatar configuration');
      }
    }

    save() {
      if (this.onSave) {
        this.onSave(this.currentConfig);
      }
      this.close();
      this.showToast('✓ Avatar updated & saved successfully!');
    }

    showToast(msg) {
      let toast = document.getElementById('avatarEditorToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'avatarEditorToast';
        toast.className = 'avatar-editor-toast';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2200);
    }
  }

  // Export to global scope
  global.AvatarEditor = AvatarEditor;
})(typeof window !== 'undefined' ? window : this);
