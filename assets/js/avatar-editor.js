/**
 * QuizSpark 3D Full-Body Avatar System - Interactive Editor Component
 * Intuitive 6-category navigation, 18 customizable features, instant preview & responsive layout.
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
        { id: 'mouth', label: 'Mouth / Mood', icon: '👄' },
        { id: 'facialHair', label: 'Facial Hair', icon: '🧔' }
      ]
    },
    {
      id: 'hair',
      label: 'Hair',
      icon: '💇',
      subtabs: [
        { id: 'hair', label: 'Hairstyle', icon: '✂️' },
        { id: 'hairColor', label: 'Hair Color', icon: '💈' }
      ]
    },
    {
      id: 'clothes',
      label: 'Clothes',
      icon: '👕',
      subtabs: [
        { id: 'top', label: 'Top Style', icon: '👕' },
        { id: 'topColor', label: 'Top Color', icon: '🎨' },
        { id: 'dress', label: 'Dress Style', icon: '👗' },
        { id: 'dressColor', label: 'Dress Color', icon: '🎨' }
      ]
    },
    {
      id: 'pants',
      label: 'Pants',
      icon: '👖',
      subtabs: [
        { id: 'bottom', label: 'Bottom Style', icon: '👖' },
        { id: 'bottomColor', label: 'Bottom Color', icon: '🎨' }
      ]
    },
    {
      id: 'shoes',
      label: 'Shoes',
      icon: '👟',
      subtabs: [
        { id: 'shoes', label: 'Shoe Style', icon: '👟' },
        { id: 'shoeColor', label: 'Shoe Color', icon: '🎨' }
      ]
    },
    {
      id: 'accessories',
      label: 'Accessories',
      icon: '🕶️',
      subtabs: [
        { id: 'headwear', label: 'Hats & Caps', icon: '🧢' },
        { id: 'glasses', label: 'Glasses', icon: '👓' },
        { id: 'accessory', label: 'Wearables', icon: '🎒' },
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
      this.onSave = options.onSave || null;
      this.onChange = options.onChange || null;

      this.categories = MAIN_CATEGORIES;

      this.initDom();
      this.bindEvents();
    }

    initDom() {
      // Create Modal Backdrop if not exists
      let backdrop = document.getElementById('avatarEditorModal');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'avatarEditorModal';
        backdrop.className = 'avatar-modal-backdrop';
        backdrop.innerHTML = `
          <div class="avatar-modal-window" role="dialog" aria-modal="true" aria-labelledby="avatarModalTitle">
            <!-- Modal Header -->
            <div class="avatar-modal-header">
              <div style="display: flex; align-items: center; gap: 12px;">
                <h2 id="avatarModalTitle" style="margin: 0; font-size: 1.35rem; font-weight: 800; color: #ffffff;">✨ Customize 3D Avatar</h2>
                <div class="avatar-gender-pill-group" id="editorGenderToggle">
                  <button type="button" class="avatar-gender-pill" data-gender="boy">👦 Boy</button>
                  <button type="button" class="avatar-gender-pill" data-gender="girl">👧 Girl</button>
                </div>
              </div>
              <button type="button" class="avatar-modal-close" id="closeAvatarModalBtn" aria-label="Close Editor">&times;</button>
            </div>

            <!-- Modal Body (Preview + Customizer) -->
            <div class="avatar-modal-body">
              <!-- Left / Top: Live Preview Stage -->
              <div class="avatar-modal-preview-panel">
                <div class="avatar-modal-preview-stage" id="modalAvatarPreviewStage">
                  <!-- Live SVG Mounted Here -->
                </div>
                <div class="avatar-preview-tag">
                  <span class="pulse-dot">●</span> Live 3D Preview
                </div>
              </div>

              <!-- Right / Bottom: Category Tabs, Subtabs, Options Grid -->
              <div class="avatar-modal-edit-panel">
                <!-- Main Category Tab Bar (6 Categories) -->
                <div class="avatar-main-category-nav" id="avatarMainCategoryNav" role="tablist"></div>

                <!-- Sub-Category Feature Chips -->
                <div class="avatar-subtab-nav" id="avatarSubtabNav" role="tablist"></div>

                <!-- Options Selection Grid -->
                <div class="avatar-options-area">
                  <div class="avatar-options-grid" id="avatarOptionsGrid"></div>
                </div>

                <!-- Action Footer -->
                <div class="avatar-modal-footer">
                  <div class="avatar-footer-left">
                    <button type="button" id="randomizeAvatarBtn" class="btn btn-secondary btn-sm" title="Randomize look">
                      🎲 Randomize
                    </button>
                    <button type="button" id="resetAvatarBtn" class="btn btn-secondary btn-sm" title="Reset to original">
                      ↺ Reset
                    </button>
                  </div>
                  <div style="display: flex; gap: 10px;">
                    <button type="button" id="cancelAvatarBtn" class="btn btn-secondary btn-sm">
                      Cancel
                    </button>
                    <button type="button" id="saveAvatarBtn" class="btn btn-primary" style="padding: 9px 22px; font-weight: 800;">
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
      this.optionsGrid = document.getElementById('avatarOptionsGrid');
      this.genderToggle = document.getElementById('editorGenderToggle');

      this.renderMainCategories();
      this.renderSubtabs();
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

      // Gender toggle buttons
      if (this.genderToggle) {
        this.genderToggle.querySelectorAll('.avatar-gender-pill').forEach(btn => {
          btn.addEventListener('click', () => {
            const gender = btn.dataset.gender;
            if (this.currentConfig.style !== gender) {
              this.currentConfig = AvatarEngine.getDefault(gender);
              this.updateGenderPills();
              this.renderSubtabs();
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

    open(config = null) {
      if (config) {
        this.initialConfig = Object.assign({}, config);
        this.currentConfig = Object.assign({}, config);
      }
      this.backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      this.updateGenderPills();
      this.renderMainCategories();
      this.renderSubtabs();
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
      AvatarEngine.mount(this.previewStage, this.currentConfig, { mode: 'full', animated: true });
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
          if (currentCatObj && currentCatObj.subtabs.length > 0) {
            this.activeSubtab = currentCatObj.subtabs[0].id;
          }
          this.renderMainCategories();
          this.renderSubtabs();
          this.renderOptionsGrid();
        });
      });
    }

    renderSubtabs() {
      const currentCatObj = this.categories.find(c => c.id === this.activeCategory);
      if (!currentCatObj || !currentCatObj.subtabs) {
        this.subtabNav.innerHTML = '';
        return;
      }

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
          this.renderOptionsGrid();
        });
      });
    }

    renderOptionsGrid() {
      const subKey = this.activeSubtab;
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

          // Mutual exclusivity between dresses and top/bottom
          if (feature === 'dress' && val !== 'none') {
            this.currentConfig.top = 'none';
            this.currentConfig.bottom = 'none';
          } else if ((feature === 'top' || feature === 'bottom') && val !== 'none') {
            this.currentConfig.dress = 'none';
          }

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
            { id: 'regular', label: 'Regular', previewHtml: '<span style="font-size: 1.6rem;">🧍</span>' },
            { id: 'slim', label: 'Slim', previewHtml: '<span style="font-size: 1.6rem;">🚶</span>' },
            { id: 'athletic', label: 'Athletic', previewHtml: '<span style="font-size: 1.6rem;">🏃</span>' },
            { id: 'soft', label: 'Soft', previewHtml: '<span style="font-size: 1.6rem;">🧍</span>' },
            { id: 'tall', label: 'Tall', previewHtml: '<span style="font-size: 1.6rem;">🦒</span>' },
            { id: 'short', label: 'Short', previewHtml: '<span style="font-size: 1.6rem;">🐣</span>' }
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
            { id: 'face_soft', label: 'Soft', previewHtml: '🤍' },
            { id: 'face_long', label: 'Long', previewHtml: '📏' },
            { id: 'face_wide', label: 'Wide', previewHtml: '↔️' }
          ];

        case 'eyes':
          return [
            { id: 'eyes_friendly', label: 'Friendly', previewHtml: '😊' },
            { id: 'eyes_bright', label: 'Bright', previewHtml: '✨' },
            { id: 'eyes_round', label: 'Round', previewHtml: '👀' },
            { id: 'eyes_almond', label: 'Almond', previewHtml: '👁️' },
            { id: 'eyes_large', label: 'Large', previewHtml: '🌟' },
            { id: 'eyes_small', label: 'Small', previewHtml: '🔹' },
            { id: 'eyes_soft', label: 'Soft', previewHtml: '😌' },
            { id: 'eyes_cartoon', label: 'Anime', previewHtml: '🤩' }
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
            { id: 'brows_thick', label: 'Thick', previewHtml: '━' },
            { id: 'brows_thin', label: 'Thin', previewHtml: '─' },
            { id: 'brows_curved', label: 'Curved', previewHtml: '⌒' },
            { id: 'brows_straight', label: 'Straight', previewHtml: '一' },
            { id: 'brows_raised', label: 'Raised', previewHtml: '↗️' },
            { id: 'brows_soft', label: 'Soft', previewHtml: '☁️' }
          ];

        case 'nose':
          return [
            { id: 'nose_medium', label: 'Medium', previewHtml: '👃' },
            { id: 'nose_small', label: 'Small', previewHtml: '•' },
            { id: 'nose_wide', label: 'Wide', previewHtml: '↔️' },
            { id: 'nose_rounded', label: 'Rounded', previewHtml: '⚪' },
            { id: 'nose_straight', label: 'Straight', previewHtml: '│' }
          ];

        case 'mouth':
          return [
            { id: 'mouth_smile', label: 'Smile', previewHtml: '🙂' },
            { id: 'mouth_big_smile', label: 'Big Smile', previewHtml: '😃' },
            { id: 'mouth_laugh', label: 'Laugh', previewHtml: '😆' },
            { id: 'mouth_small_smile', label: 'Soft Smile', previewHtml: '😊' },
            { id: 'mouth_confident', label: 'Confident', previewHtml: '😏' },
            { id: 'mouth_friendly', label: 'Friendly', previewHtml: '😋' },
            { id: 'mouth_neutral', label: 'Neutral', previewHtml: '😐' }
          ];

        case 'facialHair':
          return [
            { id: 'none', label: 'Clean Shave', previewHtml: '🚫' },
            { id: 'mustache', label: 'Mustache', previewHtml: '👨' },
            { id: 'light_beard', label: 'Light Stubble', previewHtml: '🧔' },
            { id: 'short_beard', label: 'Short Beard', previewHtml: '🧔' },
            { id: 'full_beard', label: 'Full Beard', previewHtml: '🎅' },
            { id: 'goatee', label: 'Goatee', previewHtml: '🐐' }
          ];

        case 'hair': {
          const boyHairs = [
            { id: 'hair_boy_fade', label: 'Fade Cut', previewHtml: '✂️' },
            { id: 'hair_boy_short', label: 'Classic Short', previewHtml: '👦' },
            { id: 'hair_boy_crew', label: 'Crew Cut', previewHtml: '💈' },
            { id: 'hair_boy_sidepart', label: 'Side Part', previewHtml: '🤵' },
            { id: 'hair_boy_spiky', label: 'Spiky', previewHtml: '⚡' },
            { id: 'hair_boy_curly', label: 'Curly Top', previewHtml: '🌀' },
            { id: 'hair_boy_messy', label: 'Messy Waves', previewHtml: '🌊' },
            { id: 'hair_boy_wavy', label: 'Wavy', previewHtml: '〰️' },
            { id: 'hair_boy_medium', label: 'Medium', previewHtml: '🧑' },
            { id: 'hair_boy_long', label: 'Long', previewHtml: '🧝' },
            { id: 'none', label: 'Bald / None', previewHtml: '🚫' }
          ];

          const girlHairs = [
            { id: 'hair_girl_wavy', label: 'Flowing Waves', previewHtml: '🌊' },
            { id: 'hair_girl_straight', label: 'Sleek Straight', previewHtml: '👩' },
            { id: 'hair_girl_curly', label: 'Bouncy Curls', previewHtml: '🌀' },
            { id: 'hair_girl_ponytail', label: 'Ponytail', previewHtml: '👱‍♀️' },
            { id: 'hair_girl_highpony', label: 'High Pony', previewHtml: '⚡' },
            { id: 'hair_girl_lowpony', label: 'Low Pony', previewHtml: '🎀' },
            { id: 'hair_girl_bun', label: 'Top Bun', previewHtml: '🥟' },
            { id: 'hair_girl_bob', label: 'Chic Bob', previewHtml: '💇‍♀️' },
            { id: 'hair_girl_braids', label: 'Twin Braids', previewHtml: '👧' },
            { id: 'hair_girl_sidebraid', label: 'Side Braid', previewHtml: '🪄' },
            { id: 'hair_girl_shoulder', label: 'Shoulder Cut', previewHtml: '✨' },
            { id: 'hair_girl_wavymedium', label: 'Wavy Bob', previewHtml: '💫' },
            { id: 'none', label: 'Bald / None', previewHtml: '🚫' }
          ];

          return style === 'girl' ? girlHairs : boyHairs;
        }

        case 'hairColor':
          return Object.keys(palettes.hairColor).map(k => ({
            id: k,
            label: palettes.hairColor[k].label,
            previewHtml: `<div class="avatar-color-circle" style="background: ${palettes.hairColor[k].main};"></div>`
          }));

        case 'top':
          return [
            { id: 'top_tshirt', label: 'T-Shirt', previewHtml: '👕' },
            { id: 'top_polo', label: 'Polo Shirt', previewHtml: '👔' },
            { id: 'top_hoodie', label: 'Hoodie', previewHtml: '🧥' },
            { id: 'top_sweatshirt', label: 'Sweatshirt', previewHtml: '🧶' },
            { id: 'top_jacket', label: 'Jacket', previewHtml: '🧥' },
            { id: 'top_shirt', label: 'Button Shirt', previewHtml: '👔' },
            { id: 'top_casual', label: 'Casual Top', previewHtml: '👚' },
            { id: 'top_jersey', label: 'Sports Jersey', previewHtml: '🎽' },
            { id: 'top_sweater', label: 'Cozy Sweater', previewHtml: '🧶' },
            { id: 'none', label: 'None / Dress', previewHtml: '🚫' }
          ];

        case 'topColor':
        case 'bottomColor':
        case 'dressColor': {
          const colorKeys = [
            'blue', 'purple', 'red', 'yellow', 'green', 'coral',
            'black', 'white', 'teal', 'navy', 'crimson', 'emerald',
            'denim', 'khaki', 'grey', 'pink', 'gold', 'ruby'
          ];
          return colorKeys.filter(k => palettes.clothing[k]).map(k => ({
            id: k,
            label: k.charAt(0).toUpperCase() + k.slice(1),
            previewHtml: `<div class="avatar-color-circle" style="background: ${palettes.clothing[k].main};"></div>`
          }));
        }

        case 'bottom':
          return [
            { id: 'bottom_jeans', label: 'Jeans', previewHtml: '👖' },
            { id: 'bottom_joggers', label: 'Joggers', previewHtml: '🩳' },
            { id: 'bottom_shorts', label: 'Shorts', previewHtml: '🩳' },
            { id: 'bottom_casual', label: 'Casual Chinos', previewHtml: '👖' },
            { id: 'bottom_formal', label: 'Formal Slacks', previewHtml: '🤵' },
            { id: 'bottom_skirt', label: 'Skirt', previewHtml: '👗' },
            { id: 'none', label: 'None / Dress', previewHtml: '🚫' }
          ];

        case 'dress':
          return [
            { id: 'none', label: 'None (Top+Pants)', previewHtml: '🚫' },
            { id: 'dress_casual', label: 'Casual Dress', previewHtml: '👗' },
            { id: 'dress_party', label: 'Party Dress', previewHtml: '💃' },
            { id: 'dress_summer', label: 'Summer Sundress', previewHtml: '🌻' },
            { id: 'dress_long', label: 'Long Evening Gown', previewHtml: '✨' },
            { id: 'dress_formal', label: 'Formal Dress', previewHtml: '👠' },
            { id: 'dress_traditional', label: 'Traditional', previewHtml: '🥻' },
            { id: 'dress_modern', label: 'Modern Fit', previewHtml: '🌟' }
          ];

        case 'shoes':
          return [
            { id: 'shoes_sneakers', label: 'Sneakers', previewHtml: '👟' },
            { id: 'shoes_sports', label: 'Sports Trainers', previewHtml: '🏃' },
            { id: 'shoes_boots', label: 'Boots', previewHtml: '🥾' },
            { id: 'shoes_casual', label: 'Loafers / Casual', previewHtml: '👞' },
            { id: 'shoes_formal', label: 'Formal Shoes', previewHtml: '👠' },
            { id: 'shoes_sandals', label: 'Sandals', previewHtml: '🩴' }
          ];

        case 'shoeColor':
          return ['white', 'black', 'red', 'blue', 'brown', 'pink', 'grey'].map(k => ({
            id: k,
            label: k.charAt(0).toUpperCase() + k.slice(1),
            previewHtml: `<div class="avatar-color-circle" style="background: ${(palettes.clothing[k] || {}).main || k};"></div>`
          }));

        case 'headwear':
          return [
            { id: 'none', label: 'None', previewHtml: '🚫' },
            { id: 'headwear_cap', label: 'Baseball Cap', previewHtml: '🧢' },
            { id: 'headwear_beanie', label: 'Beanie', previewHtml: '🎿' },
            { id: 'headwear_crown', label: 'Gold Crown', previewHtml: '👑' },
            { id: 'headwear_headband', label: 'Sport Headband', previewHtml: '🎀' },
            { id: 'headwear_winter_hat', label: 'Winter Pom Hat', previewHtml: '❄️' }
          ];

        case 'glasses':
          return [
            { id: 'none', label: 'None', previewHtml: '🚫' },
            { id: 'glasses_round', label: 'Round Frames', previewHtml: '👓' },
            { id: 'glasses_square', label: 'Square Frames', previewHtml: '👓' },
            { id: 'glasses_thin', label: 'Thin Metal', previewHtml: '🥽' },
            { id: 'glasses_sunglasses', label: 'Dark Sunglasses', previewHtml: '🕶️' }
          ];

        case 'accessory':
          return [
            { id: 'none', label: 'None', previewHtml: '🚫' },
            { id: 'acc_headphones', label: 'Headphones', previewHtml: '🎧' },
            { id: 'acc_backpack', label: 'Backpack', previewHtml: '🎒' },
            { id: 'acc_necklace', label: 'Pendant Necklace', previewHtml: '📿' },
            { id: 'acc_earrings', label: 'Gold Earrings', previewHtml: '💎' },
            { id: 'acc_watch', label: 'Smartwatch', previewHtml: '⌚' }
          ];

        case 'specialItem':
          return [
            { id: 'none', label: 'None', previewHtml: '🚫' },
            { id: 'item_book', label: 'Study Book', previewHtml: '📚' },
            { id: 'item_laptop', label: 'Tech Laptop', previewHtml: '💻' },
            { id: 'item_pencil', label: 'Magic Pencil', previewHtml: '✏️' },
            { id: 'item_trophy', label: 'Champion Trophy', previewHtml: '🏆' }
          ];

        default:
          return [];
      }
    }

    randomize() {
      const currentStyle = this.currentConfig.style || 'boy';
      this.currentConfig = AvatarEngine.randomize(currentStyle);
      this.renderOptionsGrid();
      this.updatePreview();
      this.showToast('🎲 Generated fresh avatar look!');
    }

    reset() {
      this.currentConfig = Object.assign({}, this.initialConfig);
      this.updateGenderPills();
      this.renderMainCategories();
      this.renderSubtabs();
      this.renderOptionsGrid();
      this.updatePreview();
      this.showToast('↺ Restored initial avatar look');
    }

    save() {
      if (this.onSave) {
        this.onSave(this.currentConfig);
      }
      this.close();
      this.showToast('✓ Avatar updated successfully!');
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
      }, 2400);
    }
  }

  // Export to global scope
  global.AvatarEditor = AvatarEditor;
})(typeof window !== 'undefined' ? window : this);
