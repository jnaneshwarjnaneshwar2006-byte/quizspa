/**
 * QuizSpark 3D Full-Body Avatar System - Interactive Editor Component
 */
(function (global) {
  'use strict';

  class AvatarEditor {
    constructor(options = {}) {
      this.currentConfig = Object.assign({}, AvatarEngine.DEFAULT_CONFIGS.boy, options.initialConfig || {});
      this.activeCategory = 'body';
      this.onSave = options.onSave || null;
      this.onChange = options.onChange || null;

      this.categories = [
        { id: 'body', label: 'Proportions', icon: '🧍' },
        { id: 'skin', label: 'Skin Tone', icon: '🎨' },
        { id: 'face', label: 'Face Shape', icon: '🙂' },
        { id: 'hair', label: 'Hairstyle', icon: '💇' },
        { id: 'hairColor', label: 'Hair Color', icon: '💈' },
        { id: 'eyes', label: 'Eyes', icon: '👀' },
        { id: 'eyeColor', label: 'Eye Color', icon: '👁️' },
        { id: 'eyebrows', label: 'Eyebrows', icon: '〰️' },
        { id: 'nose', label: 'Nose', icon: '👃' },
        { id: 'mouth', label: 'Mouth / Mood', icon: '👄' },
        { id: 'facialHair', label: 'Facial Hair', icon: '🧔' },
        { id: 'top', label: 'Tops / Shirts', icon: '👕' },
        { id: 'topColor', label: 'Top Color', icon: '🎨' },
        { id: 'bottom', label: 'Bottoms', icon: '👖' },
        { id: 'bottomColor', label: 'Bottom Color', icon: '🎨' },
        { id: 'dress', label: 'Dresses', icon: '👗' },
        { id: 'dressColor', label: 'Dress Color', icon: '🎨' },
        { id: 'shoes', label: 'Shoes', icon: '👟' },
        { id: 'shoeColor', label: 'Shoe Color', icon: '🎨' },
        { id: 'headwear', label: 'Headwear', icon: '🧢' },
        { id: 'glasses', label: 'Glasses', icon: '👓' },
        { id: 'accessory', label: 'Accessories', icon: '🎒' },
        { id: 'specialItem', label: 'Special Items', icon: '🏆' }
      ];

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
            <div class="avatar-modal-header">
              <h2 id="avatarModalTitle">✨ Customize 3D Avatar</h2>
              <button type="button" class="avatar-modal-close" id="closeAvatarModalBtn" aria-label="Close Editor">&times;</button>
            </div>

            <div class="avatar-modal-body">
              <!-- Left: Live Preview Panel -->
              <div class="avatar-modal-preview-panel">
                <div class="avatar-modal-preview-stage" id="modalAvatarPreviewStage">
                  <!-- Live SVG mounted here -->
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; margin-top: 10px;">
                  3D Character Preview
                </div>
              </div>

              <!-- Right: 18 Categories & Controls -->
              <div class="avatar-modal-edit-panel">
                <!-- Horizontally Scrollable Category Nav -->
                <div class="avatar-category-nav" id="avatarCategoryNav" role="tablist"></div>

                <!-- Option Selection Grid Area -->
                <div class="avatar-options-area">
                  <div class="avatar-options-grid" id="avatarOptionsGrid"></div>
                </div>

                <!-- Action Footer -->
                <div class="avatar-modal-footer">
                  <div class="avatar-footer-left">
                    <button type="button" id="randomizeAvatarBtn" class="btn btn-secondary btn-sm">
                      🎲 Randomize
                    </button>
                    <button type="button" id="resetAvatarBtn" class="btn btn-secondary btn-sm">
                      ↻ Reset
                    </button>
                  </div>
                  <div>
                    <button type="button" id="saveAvatarBtn" class="btn btn-primary">
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
      this.categoryNav = document.getElementById('avatarCategoryNav');
      this.optionsGrid = document.getElementById('avatarOptionsGrid');

      this.renderCategoryTabs();
      this.renderOptionsGrid();
      this.updatePreview();
    }

    bindEvents() {
      document.getElementById('closeAvatarModalBtn').addEventListener('click', () => this.close());
      document.getElementById('randomizeAvatarBtn').addEventListener('click', () => this.randomize());
      document.getElementById('resetAvatarBtn').addEventListener('click', () => this.reset());
      document.getElementById('saveAvatarBtn').addEventListener('click', () => this.save());

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
        this.currentConfig = Object.assign({}, this.currentConfig, config);
      }
      this.backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      this.updatePreview();
      this.renderCategoryTabs();
      this.renderOptionsGrid();
    }

    close() {
      this.backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    isOpen() {
      return this.backdrop.classList.contains('open');
    }

    updatePreview() {
      AvatarEngine.mount(this.previewStage, this.currentConfig, { mode: 'full', animated: true });
      if (this.onChange) {
        this.onChange(this.currentConfig);
      }
    }

    renderCategoryTabs() {
      this.categoryNav.innerHTML = this.categories.map(cat => `
        <button type="button" class="avatar-cat-tab ${cat.id === this.activeCategory ? 'active' : ''}" data-cat="${cat.id}" role="tab" aria-selected="${cat.id === this.activeCategory}">
          <span>${cat.icon}</span>
          <span>${cat.label}</span>
        </button>
      `).join('');

      this.categoryNav.querySelectorAll('.avatar-cat-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeCategory = btn.dataset.cat;
          this.renderCategoryTabs();
          this.renderOptionsGrid();
        });
      });
    }

    renderOptionsGrid() {
      const cat = this.activeCategory;
      const opts = this.getOptionsForCategory(cat);

      this.optionsGrid.innerHTML = opts.map(item => {
        const isSelected = (this.currentConfig[cat] === item.id);
        return `
          <button type="button" class="avatar-opt-card ${isSelected ? 'selected' : ''}" data-cat="${cat}" data-val="${item.id}" aria-label="${item.label}">
            <div class="avatar-opt-preview">
              ${item.previewHtml}
            </div>
            <span class="avatar-opt-label">${item.label}</span>
          </button>
        `;
      }).join('');

      this.optionsGrid.querySelectorAll('.avatar-opt-card').forEach(card => {
        card.addEventListener('click', () => {
          const val = card.dataset.val;
          this.currentConfig[cat] = val;

          // Mutual exclusivity: if dress is selected and not none, reset top and bottom
          if (cat === 'dress' && val !== 'none') {
            this.currentConfig.top = 'none';
            this.currentConfig.bottom = 'none';
          } else if ((cat === 'top' || cat === 'bottom') && val !== 'none') {
            this.currentConfig.dress = 'none';
          }

          this.renderOptionsGrid();
          this.updatePreview();
        });
      });
    }

    getOptionsForCategory(cat) {
      const palettes = AvatarEngine.PALETTES;

      switch (cat) {
        case 'body':
          return [
            { id: 'regular', label: 'Regular', previewHtml: '🧍' },
            { id: 'slim', label: 'Slim', previewHtml: '🚶' },
            { id: 'athletic', label: 'Athletic', previewHtml: '🏃' },
            { id: 'soft', label: 'Soft', previewHtml: '🧍' },
            { id: 'tall', label: 'Tall', previewHtml: '🦒' },
            { id: 'short', label: 'Short', previewHtml: '🐣' }
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

        case 'hair': {
          const style = this.currentConfig.style || 'boy';
          const boyHairs = [
            { id: 'hair_boy_fade', label: 'Fade Cut', previewHtml: '✂️' },
            { id: 'hair_boy_short', label: 'Classic Short', previewHtml: '👦' },
            { id: 'hair_boy_crew', label: 'Crew Cut', previewHtml: '💈' },
            { id: 'hair_boy_sidepart', label: 'Side Part', previewHtml: '🤵' },
            { id: 'hair_boy_spiky', label: 'Spiky', previewHtml: '⚡' },
            { id: 'hair_boy_curly', label: 'Curly', previewHtml: '🌀' },
            { id: 'hair_boy_wavy', label: 'Wavy', previewHtml: '🌊' },
            { id: 'hair_boy_messy', label: 'Messy', previewHtml: '💨' },
            { id: 'none', label: 'Bald / None', previewHtml: '🚫' }
          ];
          const girlHairs = [
            { id: 'hair_girl_wavy', label: 'Long Wavy', previewHtml: '🌊' },
            { id: 'hair_girl_straight', label: 'Straight', previewHtml: '👩' },
            { id: 'hair_girl_curly', label: 'Curly Volume', previewHtml: '🌀' },
            { id: 'hair_girl_highpony', label: 'High Ponytail', previewHtml: '👱‍♀️' },
            { id: 'hair_girl_bob', label: 'Chic Bob', previewHtml: '💇‍♀️' },
            { id: 'hair_girl_braids', label: 'Braids', previewHtml: '👧' },
            { id: 'hair_girl_bun', label: 'Top Bun', previewHtml: '🌸' },
            { id: 'hair_girl_shoulder', label: 'Shoulder-Length', previewHtml: '✨' },
            { id: 'none', label: 'None', previewHtml: '🚫' }
          ];
          return style === 'girl' ? girlHairs : boyHairs;
        }

        case 'hairColor':
          return Object.keys(palettes.hairColor).map(k => ({
            id: k,
            label: palettes.hairColor[k].label,
            previewHtml: `<div class="avatar-color-circle" style="background: ${palettes.hairColor[k].main};"></div>`
          }));

        case 'eyes':
          return [
            { id: 'eyes_friendly', label: 'Friendly', previewHtml: '😊' },
            { id: 'eyes_bright', label: 'Bright', previewHtml: '✨' },
            { id: 'eyes_round', label: 'Round', previewHtml: '👀' },
            { id: 'eyes_almond', label: 'Almond', previewHtml: '👁️' },
            { id: 'eyes_large', label: 'Large', previewHtml: '🤩' },
            { id: 'eyes_small', label: 'Small', previewHtml: '😌' },
            { id: 'eyes_cartoon', label: 'Cartoon', previewHtml: '🎨' }
          ];

        case 'eyeColor':
          return Object.keys(palettes.eyeColor).map(k => ({
            id: k,
            label: k.replace('_', ' ').toUpperCase(),
            previewHtml: `<div class="avatar-color-circle" style="background: ${palettes.eyeColor[k]};"></div>`
          }));

        case 'eyebrows':
          return [
            { id: 'brows_natural', label: 'Natural', previewHtml: '〰️' },
            { id: 'brows_thick', label: 'Thick', previewHtml: '━' },
            { id: 'brows_curved', label: 'Curved', previewHtml: '⌒' },
            { id: 'brows_thin', label: 'Thin', previewHtml: '─' },
            { id: 'brows_straight', label: 'Straight', previewHtml: '➖' },
            { id: 'brows_raised', label: 'Raised', previewHtml: '⤴️' }
          ];

        case 'nose':
          return [
            { id: 'nose_medium', label: 'Medium', previewHtml: '👃' },
            { id: 'nose_small', label: 'Small Button', previewHtml: '▫️' },
            { id: 'nose_rounded', label: 'Rounded', previewHtml: '⚪' },
            { id: 'nose_wide', label: 'Wide', previewHtml: '↔️' },
            { id: 'nose_straight', label: 'Straight', previewHtml: '📐' }
          ];

        case 'mouth':
          return [
            { id: 'mouth_smile', label: 'Smile', previewHtml: '😊' },
            { id: 'mouth_big_smile', label: 'Big Smile', previewHtml: '😃' },
            { id: 'mouth_small_smile', label: 'Small Smile', previewHtml: '🙂' },
            { id: 'mouth_confident', label: 'Confident', previewHtml: '😏' },
            { id: 'mouth_laugh', label: 'Laugh', previewHtml: '😄' },
            { id: 'mouth_neutral', label: 'Neutral', previewHtml: '😐' }
          ];

        case 'facialHair':
          return [
            { id: 'none', label: 'Clean Shaven', previewHtml: '🚫' },
            { id: 'mustache', label: 'Mustache', previewHtml: '👨' },
            { id: 'light_beard', label: 'Light Stubble', previewHtml: '🧔' },
            { id: 'goatee', label: 'Goatee', previewHtml: '🧔‍♂️' },
            { id: 'full_beard', label: 'Full Beard', previewHtml: '🎅' }
          ];

        case 'top':
          return [
            { id: 'top_tshirt', label: 'T-Shirt', previewHtml: '👕' },
            { id: 'top_hoodie', label: 'Hoodie', previewHtml: '🧥' },
            { id: 'top_polo', label: 'Polo Shirt', previewHtml: '👔' },
            { id: 'top_jacket', label: 'Jacket', previewHtml: '🧥' },
            { id: 'top_sweater', label: 'Sweater', previewHtml: '🧶' },
            { id: 'top_jersey', label: 'Sports Jersey', previewHtml: '🎽' },
            { id: 'top_shirt', label: 'Formal Shirt', previewHtml: '👔' },
            { id: 'top_casual', label: 'Casual Top', previewHtml: '👚' },
            { id: 'none', label: 'None (Dress)', previewHtml: '🚫' }
          ];

        case 'topColor':
        case 'bottomColor':
        case 'dressColor':
        case 'shoeColor':
          return Object.keys(palettes.clothing).map(k => ({
            id: k,
            label: k.toUpperCase(),
            previewHtml: `<div class="avatar-color-circle" style="background: ${palettes.clothing[k].main};"></div>`
          }));

        case 'bottom':
          return [
            { id: 'bottom_jeans', label: 'Jeans', previewHtml: '👖' },
            { id: 'bottom_joggers', label: 'Joggers', previewHtml: '🏃' },
            { id: 'bottom_shorts', label: 'Shorts', previewHtml: '🩳' },
            { id: 'bottom_casual', label: 'Casual Pants', previewHtml: '🩳' },
            { id: 'bottom_formal', label: 'Formal Pants', previewHtml: '👔' },
            { id: 'bottom_skirt', label: 'Skirt', previewHtml: '👗' },
            { id: 'none', label: 'None (Dress)', previewHtml: '🚫' }
          ];

        case 'dress':
          return [
            { id: 'none', label: 'None (Top/Pants)', previewHtml: '🚫' },
            { id: 'dress_casual', label: 'Casual Dress', previewHtml: '👗' },
            { id: 'dress_party', label: 'Party Dress', previewHtml: '✨' },
            { id: 'dress_summer', label: 'Summer Dress', previewHtml: '☀️' },
            { id: 'dress_long', label: 'Long Gown', previewHtml: '💃' },
            { id: 'dress_traditional', label: 'Traditional', previewHtml: '👘' }
          ];

        case 'shoes':
          return [
            { id: 'shoes_sneakers', label: 'Sneakers', previewHtml: '👟' },
            { id: 'shoes_sports', label: 'Sports Shoes', previewHtml: '🏃' },
            { id: 'shoes_boots', label: 'Boots', previewHtml: '🥾' },
            { id: 'shoes_casual', label: 'Casual Shoes', previewHtml: '👞' },
            { id: 'shoes_sandals', label: 'Sandals', previewHtml: '👡' }
          ];

        case 'headwear':
          return [
            { id: 'none', label: 'None', previewHtml: '🚫' },
            { id: 'headwear_cap', label: 'Baseball Cap', previewHtml: '🧢' },
            { id: 'headwear_beanie', label: 'Beanie', previewHtml: '🧶' },
            { id: 'headwear_headband', label: 'Headband', previewHtml: '🎀' },
            { id: 'headwear_crown', label: 'Gold Crown', previewHtml: '👑' },
            { id: 'headwear_winter_hat', label: 'Winter Pom Pom', previewHtml: '❄️' }
          ];

        case 'glasses':
          return [
            { id: 'none', label: 'None', previewHtml: '🚫' },
            { id: 'glasses_round', label: 'Round Frames', previewHtml: '👓' },
            { id: 'glasses_square', label: 'Square Frames', previewHtml: '🕶️' },
            { id: 'glasses_thin', label: 'Thin Metal', previewHtml: '🔍' },
            { id: 'glasses_sunglasses', label: 'Cool Sunglasses', previewHtml: '🕶️' }
          ];

        case 'accessory':
          return [
            { id: 'none', label: 'None', previewHtml: '🚫' },
            { id: 'acc_headphones', label: 'Headphones', previewHtml: '🎧' },
            { id: 'acc_backpack', label: 'Backpack', previewHtml: '🎒' },
            { id: 'acc_watch', label: 'Smartwatch', previewHtml: '⌚' },
            { id: 'acc_necklace', label: 'Pendant', previewHtml: '📿' },
            { id: 'acc_earrings', label: 'Earrings', previewHtml: '✨' }
          ];

        case 'specialItem':
          return [
            { id: 'none', label: 'None', previewHtml: '🚫' },
            { id: 'item_laptop', label: 'Laptop', previewHtml: '💻' },
            { id: 'item_book', label: 'Textbook', previewHtml: '📚' },
            { id: 'item_pencil', label: 'Pencil', previewHtml: '✏️' },
            { id: 'item_trophy', label: 'Winner Trophy', previewHtml: '🏆' }
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
    }

    reset() {
      const currentStyle = this.currentConfig.style || 'boy';
      this.currentConfig = AvatarEngine.getDefault(currentStyle);
      this.renderOptionsGrid();
      this.updatePreview();
    }

    save() {
      if (this.onSave) {
        this.onSave(Object.assign({}, this.currentConfig));
      }
      this.close();
    }
  }

  // Export to global scope
  global.AvatarEditor = AvatarEditor;
})(typeof window !== 'undefined' ? window : this);
