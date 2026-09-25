/**
 * QuizSpark 3D Full-Body Avatar System - Vector Rendering Engine
 * Pure modular layered vector generator with 3D-styled lighting, gradients, and idle micro-animations.
 */
(function (global) {
  'use strict';

  // 1. Color Palettes & Gradient Definitions
  const PALETTES = {
    skin: {
      skin_01: { main: '#ffeaa7', shadow: '#fdcb6e', highlight: '#fff9e6', tone: 'Fair Warm' },
      skin_02: { main: '#fed39f', shadow: '#f39c12', highlight: '#ffebcd', tone: 'Light Peach' },
      skin_03: { main: '#f0b27a', shadow: '#d35400', highlight: '#f8c471', tone: 'Medium Warm' },
      skin_04: { main: '#e0a96d', shadow: '#b9770e', highlight: '#f5cba7', tone: 'Golden Tan' },
      skin_05: { main: '#c68642', shadow: '#873600', highlight: '#dc7633', tone: 'Warm Olive' },
      skin_06: { main: '#8d5524', shadow: '#5d3817', highlight: '#a0522d', tone: 'Rich Bronze' },
      skin_07: { main: '#603813', shadow: '#3b220c', highlight: '#784212', tone: 'Deep Brown' },
      skin_08: { main: '#3d2314', shadow: '#24140a', highlight: '#512e1b', tone: 'Espresso' }
    },
    hairColor: {
      black: { main: '#1e272e', shadow: '#0b0c10', highlight: '#485460', label: 'Jet Black' },
      dark_brown: { main: '#3d1c02', shadow: '#220f01', highlight: '#5c2d0c', label: 'Dark Brown' },
      brown: { main: '#6d4c41', shadow: '#4e342e', highlight: '#8d6e63', label: 'Chestnut Brown' },
      light_brown: { main: '#a1887f', shadow: '#6d4c41', highlight: '#bcaaa4', label: 'Light Brown' },
      blonde: { main: '#fbc531', shadow: '#e1b12c', highlight: '#ffea79', label: 'Golden Blonde' },
      dark_blonde: { main: '#d4ac0d', shadow: '#b7950b', highlight: '#f7dc6f', label: 'Honey Blonde' },
      red: { main: '#c0392b', shadow: '#962d22', highlight: '#e74c3c', label: 'Auburn Red' },
      auburn: { main: '#8e44ad', shadow: '#6c3483', highlight: '#a569bd', label: 'Dark Auburn' },
      grey: { main: '#7f8c8d', shadow: '#566573', highlight: '#bdc3c7', label: 'Silver Grey' },
      blue: { main: '#0984e3', shadow: '#0652dd', highlight: '#74b9ff', label: 'Electric Blue' },
      purple: { main: '#8854d0', shadow: '#5f27cd', highlight: '#a55eea', label: 'Royal Purple' },
      pink: { main: '#e84393', shadow: '#d63031', highlight: '#fd79a8', label: 'Bubblegum Pink' },
      green: { main: '#00b894', shadow: '#009432', highlight: '#55efc4', label: 'Emerald Green' },
      teal: { main: '#00cec9', shadow: '#0097e6', highlight: '#81ecec', label: 'Ocean Teal' },
      coral: { main: '#ff7675', shadow: '#d63031', highlight: '#fab1a0', label: 'Sunset Coral' }
    },
    eyeColor: {
      brown: '#5c3d2e',
      dark_brown: '#2d1810',
      blue: '#2980b9',
      green: '#27ae60',
      hazel: '#a07855',
      grey: '#7f8c8d',
      amber: '#d35400'
    },
    clothing: {
      blue: { main: '#2e86de', shadow: '#1e3799', highlight: '#54a0ff' },
      purple: { main: '#8854d0', shadow: '#5f27cd', highlight: '#a55eea' },
      red: { main: '#ee5253', shadow: '#b71540', highlight: '#ff6b6b' },
      yellow: { main: '#feca57', shadow: '#ff9f43', highlight: '#ffdd59' },
      green: { main: '#10ac84', shadow: '#01a3a4', highlight: '#1dd1a1' },
      coral: { main: '#ff7675', shadow: '#eb3b5a', highlight: '#fd9644' },
      black: { main: '#2f3542', shadow: '#1e272e', highlight: '#57606f' },
      white: { main: '#f1f2f6', shadow: '#ced6e0', highlight: '#ffffff' },
      teal: { main: '#00cec9', shadow: '#0984e3', highlight: '#81ecec' },
      navy: { main: '#1e3799', shadow: '#0c2461', highlight: '#4a69bd' },
      crimson: { main: '#b71540', shadow: '#6c0b25', highlight: '#eb2f06' },
      emerald: { main: '#009432', shadow: '#006266', highlight: '#2ed573' },
      denim: { main: '#3867d6', shadow: '#273c75', highlight: '#4b7bec' },
      khaki: { main: '#d1ccc0', shadow: '#84817a', highlight: '#f7f1e3' },
      grey: { main: '#747d8c', shadow: '#57606f', highlight: '#a4b0be' },
      pink: { main: '#f368e0', shadow: '#c44569', highlight: '#ff9ff3' },
      gold: { main: '#ffc048', shadow: '#ff9f1a', highlight: '#fff200' },
      ruby: { main: '#c0392b', shadow: '#78281f', highlight: '#e74c3c' }
    }
  };

  // 2. Default Configuration Template
  const DEFAULT_CONFIGS = {
    boy: {
      style: 'boy', body: 'regular', skin: 'skin_04', face: 'face_round',
      hair: 'hair_boy_fade', hairColor: 'black', eyes: 'eyes_friendly', eyeColor: 'dark_brown',
      eyebrows: 'brows_thick', nose: 'nose_medium', mouth: 'mouth_smile', facialHair: 'none',
      top: 'top_tshirt', topColor: 'blue', bottom: 'bottom_jeans', bottomColor: 'denim',
      dress: 'none', dressColor: 'purple', shoes: 'shoes_sneakers', shoeColor: 'white',
      headwear: 'none', glasses: 'none', accessory: 'none', specialItem: 'none'
    },
    girl: {
      style: 'girl', body: 'regular', skin: 'skin_03', face: 'face_oval',
      hair: 'hair_girl_wavy', hairColor: 'dark_brown', eyes: 'eyes_bright', eyeColor: 'brown',
      eyebrows: 'brows_curved', nose: 'nose_small', mouth: 'mouth_smile', facialHair: 'none',
      top: 'top_casual', topColor: 'purple', bottom: 'bottom_jeans', bottomColor: 'denim',
      dress: 'none', dressColor: 'pink', shoes: 'shoes_sneakers', shoeColor: 'white',
      headwear: 'none', glasses: 'none', accessory: 'acc_earrings', specialItem: 'none'
    }
  };

  // 3. Helper: SVG Unique ID Generator for Gradients & Filters
  let idCounter = 1;
  function getUid(prefix = 'av') {
    return `${prefix}_${Date.now()}_${idCounter++}`;
  }

  // 4. SVG Layer Builders
  const Layers = {
    // Ground Soft 3D Shadow
    groundShadow(uid) {
      return `
        <ellipse cx="160" cy="405" rx="75" ry="14" fill="url(#${uid}_groundShadow)" opacity="0.45" />
      `;
    },

    // Body Proportions & Limbs
    body(cfg, uid, colors) {
      const skin = colors.skin;
      const prop = cfg.body || 'regular';
      
      let torsoWidth = 56;
      let torsoY = 175;
      let torsoH = 92;
      let legX1 = 138;
      let legX2 = 182;
      let legW = 22;
      let legH = 115;
      let armW = 16;
      let scaleY = 1.0;

      if (prop === 'slim') {
        torsoWidth = 48;
        legW = 18;
        armW = 14;
      } else if (prop === 'athletic') {
        torsoWidth = 64;
        legW = 24;
        armW = 19;
      } else if (prop === 'soft') {
        torsoWidth = 62;
        legW = 23;
        armW = 17;
      } else if (prop === 'short') {
        legH = 98;
        scaleY = 0.95;
      } else if (prop === 'tall') {
        legH = 128;
      }

      return `
        <!-- Legs & Knees -->
        <g id="${uid}_legs" class="avatar-part-legs">
          <!-- Left Leg -->
          <rect x="${160 - torsoWidth/2 + 2}" y="255" width="${legW}" height="${legH}" rx="10" fill="url(#${uid}_skinGrad)" filter="url(#${uid}_dropShadow)" />
          <!-- Right Leg -->
          <rect x="${160 + torsoWidth/2 - legW - 2}" y="255" width="${legW}" height="${legH}" rx="10" fill="url(#${uid}_skinGrad)" filter="url(#${uid}_dropShadow)" />
        </g>

        <!-- Arms & Hands -->
        <g id="${uid}_arms" class="avatar-part-arms">
          <!-- Left Arm -->
          <path d="M ${160 - torsoWidth/2 - 4} 185 Q ${160 - torsoWidth/2 - 18} 230 ${160 - torsoWidth/2 - 12} 275 Q ${160 - torsoWidth/2 - 8} 285 ${160 - torsoWidth/2 + 2} 280 Q ${160 - torsoWidth/2} 230 ${160 - torsoWidth/2 + 4} 185 Z" fill="url(#${uid}_skinGrad)" />
          <!-- Left Hand -->
          <circle cx="${160 - torsoWidth/2 - 6}" cy="285" r="11" fill="url(#${uid}_skinGrad)" />
          
          <!-- Right Arm -->
          <path d="M ${160 + torsoWidth/2 + 4} 185 Q ${160 + torsoWidth/2 + 18} 230 ${160 + torsoWidth/2 + 12} 275 Q ${160 + torsoWidth/2 + 8} 285 ${160 + torsoWidth/2 - 2} 280 Q ${160 + torsoWidth/2} 230 ${160 + torsoWidth/2 - 4} 185 Z" fill="url(#${uid}_skinGrad)" />
          <!-- Right Hand -->
          <circle cx="${160 + torsoWidth/2 + 6}" cy="285" r="11" fill="url(#${uid}_skinGrad)" />
        </g>

        <!-- Neck -->
        <g id="${uid}_neck">
          <path d="M 148 142 L 172 142 L 174 185 L 146 185 Z" fill="url(#${uid}_skinShadowGrad)" />
          <ellipse cx="160" cy="180" rx="14" ry="6" fill="${skin.shadow}" opacity="0.35" />
        </g>
      `;
    },

    // Face Contours
    face(cfg, uid, colors) {
      const shape = cfg.face || 'face_round';
      const skin = colors.skin;

      let facePath = 'M 115 95 C 115 50, 205 50, 205 95 C 205 140, 185 168, 160 168 C 135 168, 115 140, 115 95 Z'; // Round

      if (shape === 'face_oval') {
        facePath = 'M 118 95 C 118 45, 202 45, 202 95 C 202 145, 178 174, 160 174 C 142 174, 118 145, 118 95 Z';
      } else if (shape === 'face_square') {
        facePath = 'M 114 90 C 114 52, 206 52, 206 90 C 206 135, 195 164, 160 164 C 125 164, 114 135, 114 90 Z';
      } else if (shape === 'face_soft') {
        facePath = 'M 116 95 C 116 48, 204 48, 204 95 C 204 142, 182 166, 160 166 C 138 166, 116 142, 116 95 Z';
      } else if (shape === 'face_long') {
        facePath = 'M 120 92 C 120 42, 200 42, 200 92 C 200 148, 176 178, 160 178 C 144 178, 120 148, 120 92 Z';
      } else if (shape === 'face_wide') {
        facePath = 'M 110 95 C 110 52, 210 52, 210 95 C 210 138, 188 165, 160 165 C 132 165, 110 138, 110 95 Z';
      }

      return `
        <!-- Ears -->
        <g id="${uid}_ears">
          <ellipse cx="114" cy="108" rx="8" ry="13" fill="url(#${uid}_skinShadowGrad)" />
          <ellipse cx="114" cy="108" rx="4" ry="7" fill="${skin.shadow}" opacity="0.4" />
          <ellipse cx="206" cy="108" rx="8" ry="13" fill="url(#${uid}_skinShadowGrad)" />
          <ellipse cx="206" cy="108" rx="4" ry="7" fill="${skin.shadow}" opacity="0.4" />
        </g>

        <!-- Main Head Shape -->
        <path d="${facePath}" fill="url(#${uid}_skinGrad)" filter="url(#${uid}_faceGlow)" />

        <!-- Soft 3D Cheek Blushes -->
        <ellipse cx="132" cy="122" rx="11" ry="6" fill="#ff7675" opacity="0.18" filter="blur(2px)" />
        <ellipse cx="188" cy="122" rx="11" ry="6" fill="#ff7675" opacity="0.18" filter="blur(2px)" />
      `;
    },

    // Eyes with Specular Highlights & Pupil
    eyes(cfg, uid, colors) {
      const eyeStyle = cfg.eyes || 'eyes_friendly';
      const irisColor = colors.eyeColor || '#2d1810';

      let lEye = { cx: 141, cy: 104, r: 8 };
      let rEye = { cx: 179, cy: 104, r: 8 };

      if (eyeStyle === 'eyes_large' || eyeStyle === 'eyes_cartoon') {
        lEye.r = 10;
        rEye.r = 10;
      } else if (eyeStyle === 'eyes_small') {
        lEye.r = 6.5;
        rEye.r = 6.5;
      }

      return `
        <g id="${uid}_eyes" class="avatar-part-eyes">
          <!-- Eye Sclera (Whites) -->
          <ellipse cx="${lEye.cx}" cy="${lEye.cy}" rx="${lEye.r + 2}" ry="${lEye.r}" fill="#ffffff" />
          <ellipse cx="${rEye.cx}" cy="${rEye.cy}" rx="${rEye.r + 2}" ry="${rEye.r}" fill="#ffffff" />

          <!-- Irises -->
          <circle cx="${lEye.cx + 0.5}" cy="${lEye.cy}" r="${lEye.r - 2}" fill="${irisColor}" />
          <circle cx="${rEye.cx - 0.5}" cy="${rEye.cy}" r="${rEye.r - 2}" fill="${irisColor}" />

          <!-- Pupils -->
          <circle cx="${lEye.cx + 0.5}" cy="${lEye.cy}" r="${lEye.r - 4}" fill="#0b0c10" />
          <circle cx="${rEye.cx - 0.5}" cy="${rEye.cy}" r="${rEye.r - 4}" fill="#0b0c10" />

          <!-- Specular 3D Highlights -->
          <circle cx="${lEye.cx - 1.5}" cy="${lEye.cy - 2.5}" r="2" fill="#ffffff" />
          <circle cx="${lEye.cx + 2}" cy="${lEye.cy + 1.5}" r="1" fill="#ffffff" opacity="0.8" />
          
          <circle cx="${rEye.cx - 2.5}" cy="${rEye.cy - 2.5}" r="2" fill="#ffffff" />
          <circle cx="${rEye.cx + 1}" cy="${rEye.cy + 1.5}" r="1" fill="#ffffff" opacity="0.8" />

          <!-- Eyelash / Upper Lid -->
          <path d="M ${lEye.cx - lEye.r - 2} ${lEye.cy - 1} Q ${lEye.cx} ${lEye.cy - lEye.r - 2} ${lEye.cx + lEye.r + 2} ${lEye.cy - 1}" stroke="#1e272e" stroke-width="2" stroke-linecap="round" fill="none" />
          <path d="M ${rEye.cx - rEye.r - 2} ${rEye.cy - 1} Q ${rEye.cx} ${rEye.cy - rEye.r - 2} ${rEye.cx + rEye.r + 2} ${rEye.cy - 1}" stroke="#1e272e" stroke-width="2" stroke-linecap="round" fill="none" />
        </g>
      `;
    },

    // Eyebrows
    eyebrows(cfg, uid, colors) {
      const style = cfg.eyebrows || 'brows_natural';
      const hairColor = colors.hair.shadow;
      let sw = 3.2;

      let lD = 'M 130 91 Q 141 85 151 90';
      let rD = 'M 169 90 Q 179 85 190 91';

      if (style === 'brows_straight') {
        lD = 'M 130 90 L 151 90';
        rD = 'M 169 90 L 190 90';
      } else if (style === 'brows_curved') {
        lD = 'M 130 93 Q 140 83 151 91';
        rD = 'M 169 91 Q 180 83 190 93';
      } else if (style === 'brows_thick') {
        sw = 4.8;
        lD = 'M 130 90 Q 141 84 152 89';
        rD = 'M 168 89 Q 179 84 190 90';
      } else if (style === 'brows_thin') {
        sw = 2.0;
        lD = 'M 131 90 Q 141 86 150 90';
        rD = 'M 170 90 Q 179 86 189 90';
      } else if (style === 'brows_raised') {
        lD = 'M 130 87 Q 141 81 151 88';
        rD = 'M 169 88 Q 179 81 190 87';
      }

      return `
        <g id="${uid}_eyebrows">
          <path d="${lD}" stroke="${hairColor}" stroke-width="${sw}" stroke-linecap="round" fill="none" />
          <path d="${rD}" stroke="${hairColor}" stroke-width="${sw}" stroke-linecap="round" fill="none" />
        </g>
      `;
    },

    // Nose
    nose(cfg, uid, colors) {
      const style = cfg.nose || 'nose_medium';
      const skinShadow = colors.skin.shadow;

      if (style === 'nose_small') {
        return `
          <path d="M 158 116 Q 160 121 163 121 Q 165 121 165 119" stroke="${skinShadow}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.75" />
        `;
      } else if (style === 'nose_wide') {
        return `
          <path d="M 154 120 Q 160 124 166 120 M 153 119 Q 155 122 158 122 M 167 119 Q 165 122 162 122" stroke="${skinShadow}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.8" />
        `;
      } else if (style === 'nose_straight') {
        return `
          <path d="M 160 106 L 159 120 L 164 121" stroke="${skinShadow}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.75" />
        `;
      } else if (style === 'nose_rounded') {
        return `
          <ellipse cx="160" cy="120" rx="4.5" ry="3.5" fill="${skinShadow}" opacity="0.3" />
          <path d="M 156 120 Q 160 124 164 120" stroke="${skinShadow}" stroke-width="2.2" stroke-linecap="round" fill="none" />
        `;
      }

      // Default medium
      return `
        <path d="M 159 110 L 158 120 Q 160 123 164 121" stroke="${skinShadow}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.8" />
      `;
    },

    // Mouth & Expressions
    mouth(cfg, uid) {
      const style = cfg.mouth || 'mouth_smile';

      if (style === 'mouth_big_smile' || style === 'mouth_laugh') {
        return `
          <g id="${uid}_mouth">
            <path d="M 146 136 Q 160 154 174 136 Z" fill="#c0392b" />
            <path d="M 148 136 Q 160 144 172 136 Z" fill="#ffffff" />
            <path d="M 144 136 Q 160 156 176 136" stroke="#801010" stroke-width="2.5" stroke-linecap="round" fill="none" />
          </g>
        `;
      } else if (style === 'mouth_small_smile') {
        return `
          <path d="M 152 138 Q 160 144 168 138" stroke="#801010" stroke-width="2.4" stroke-linecap="round" fill="none" />
        `;
      } else if (style === 'mouth_neutral') {
        return `
          <path d="M 151 138 L 169 138" stroke="#801010" stroke-width="2.4" stroke-linecap="round" fill="none" />
        `;
      } else if (style === 'mouth_confident') {
        return `
          <path d="M 148 139 Q 158 143 172 135" stroke="#801010" stroke-width="2.6" stroke-linecap="round" fill="none" />
        `;
      }

      // Default smile / friendly
      return `
        <g id="${uid}_mouth">
          <path d="M 147 136 Q 160 148 173 136" stroke="#801010" stroke-width="2.8" stroke-linecap="round" fill="none" />
          <path d="M 146 136 Q 144 133 145 131 M 174 136 Q 176 133 175 131" stroke="#801010" stroke-width="1.8" stroke-linecap="round" fill="none" />
        </g>
      `;
    },

    // Facial Hair
    facialHair(cfg, uid, colors) {
      const style = cfg.facialHair || 'none';
      const color = colors.hair.shadow;

      if (style === 'mustache') {
        return `
          <path d="M 149 132 Q 160 135 171 132 Q 166 128 160 129 Q 154 128 149 132 Z" fill="${color}" filter="url(#${uid}_dropShadow)" />
        `;
      } else if (style === 'goatee') {
        return `
          <path d="M 149 132 Q 160 135 171 132 Q 166 128 160 129 Q 154 128 149 132 Z" fill="${color}" />
          <ellipse cx="160" cy="154" rx="7" ry="9" fill="${color}" />
        `;
      } else if (style === 'light_beard' || style === 'short_beard') {
        return `
          <path d="M 132 122 C 132 165, 188 165, 188 122 C 182 160, 138 160, 132 122 Z" fill="${color}" opacity="0.55" />
          <path d="M 150 132 Q 160 135 170 132" stroke="${color}" stroke-width="2.5" fill="none" />
        `;
      } else if (style === 'full_beard') {
        return `
          <path d="M 124 116 C 122 178, 198 178, 196 116 C 186 168, 134 168, 124 116 Z" fill="${color}" filter="url(#${uid}_dropShadow)" />
          <path d="M 148 132 Q 160 136 172 132" stroke="${color}" stroke-width="3.5" stroke-linecap="round" fill="none" />
        `;
      }
      return '';
    },

    // Hair Styles (Boy, Girl, Neutral)
    hair(cfg, uid, colors) {
      const hairStyle = cfg.hair || 'hair_boy_fade';
      const hairColor = colors.hair;

      if (hairStyle === 'none') return '';

      // Girl / Long styles
      if (hairStyle === 'hair_girl_straight') {
        return `
          <g id="${uid}_hair">
            <!-- Back Hair -->
            <path d="M 112 90 C 105 150, 108 240, 118 270 L 138 270 C 125 210, 128 140, 128 90 Z" fill="url(#${uid}_hairShadowGrad)" />
            <path d="M 208 90 C 215 150, 212 240, 202 270 L 182 270 C 195 210, 192 140, 192 90 Z" fill="url(#${uid}_hairShadowGrad)" />
            <!-- Front Crown & Bangs -->
            <path d="M 112 95 C 112 40, 208 40, 208 95 C 200 65, 175 60, 160 70 C 145 60, 120 65, 112 95 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      } else if (hairStyle === 'hair_girl_wavy' || hairStyle === 'hair_girl_wavymedium') {
        return `
          <g id="${uid}_hair">
            <!-- Back Flowing Waves -->
            <path d="M 110 90 Q 95 160 120 220 Q 95 260 122 280 L 136 275 Q 115 220 128 90 Z" fill="url(#${uid}_hairShadowGrad)" />
            <path d="M 210 90 Q 225 160 200 220 Q 225 260 198 280 L 184 275 Q 205 220 192 90 Z" fill="url(#${uid}_hairShadowGrad)" />
            <!-- Front Volume Crown -->
            <path d="M 110 95 C 110 38, 210 38, 210 95 C 202 62, 178 58, 160 68 C 142 58, 118 62, 110 95 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      } else if (hairStyle === 'hair_girl_curly' || hairStyle === 'hair_neutral_curly') {
        return `
          <g id="${uid}_hair">
            <circle cx="114" cy="75" r="16" fill="url(#${uid}_hairGrad)" />
            <circle cx="132" cy="56" r="18" fill="url(#${uid}_hairGrad)" />
            <circle cx="160" cy="50" r="19" fill="url(#${uid}_hairGrad)" />
            <circle cx="188" cy="56" r="18" fill="url(#${uid}_hairGrad)" />
            <circle cx="206" cy="75" r="16" fill="url(#${uid}_hairGrad)" />
            <circle cx="108" cy="100" r="15" fill="url(#${uid}_hairGrad)" />
            <circle cx="212" cy="100" r="15" fill="url(#${uid}_hairGrad)" />
            <circle cx="112" cy="125" r="14" fill="url(#${uid}_hairGrad)" />
            <circle cx="208" cy="125" r="14" fill="url(#${uid}_hairGrad)" />
            <!-- Front Crown -->
            <path d="M 118 85 C 122 55, 198 55, 202 85 C 190 70, 130 70, 118 85 Z" fill="url(#${uid}_hairGrad)" />
          </g>
        `;
      } else if (hairStyle === 'hair_girl_ponytail' || hairStyle === 'hair_girl_highpony') {
        return `
          <g id="${uid}_hair">
            <!-- High Ponytail Tail -->
            <path d="M 195 65 Q 235 60 238 110 Q 240 160 215 195 Q 225 150 215 110 Q 205 85 195 65 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Scrunchie -->
            <ellipse cx="198" cy="68" rx="8" ry="6" fill="#e84393" />
            <!-- Sleek Crown -->
            <path d="M 114 95 C 114 42, 206 42, 206 95 C 198 65, 175 62, 160 68 C 145 62, 122 65, 114 95 Z" fill="url(#${uid}_hairGrad)" />
          </g>
        `;
      } else if (hairStyle === 'hair_girl_bun') {
        return `
          <g id="${uid}_hair">
            <!-- Top Bun -->
            <circle cx="160" cy="38" r="22" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Sleek Crown -->
            <path d="M 114 95 C 114 45, 206 45, 206 95 C 198 68, 175 64, 160 70 C 145 64, 122 68, 114 95 Z" fill="url(#${uid}_hairGrad)" />
          </g>
        `;
      } else if (hairStyle === 'hair_girl_bob') {
        return `
          <g id="${uid}_hair">
            <path d="M 108 90 C 105 135, 112 175, 128 175 C 118 140, 122 80, 122 80 Z" fill="url(#${uid}_hairShadowGrad)" />
            <path d="M 212 90 C 215 135, 208 175, 192 175 C 202 140, 198 80, 198 80 Z" fill="url(#${uid}_hairShadowGrad)" />
            <path d="M 108 95 C 108 42, 212 42, 212 95 C 204 68, 180 62, 160 70 C 140 62, 116 68, 108 95 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      } else if (hairStyle === 'hair_girl_braids') {
        return `
          <g id="${uid}_hair">
            <!-- Left Braid -->
            <g transform="translate(108, 90)">
              <circle cx="6" cy="20" r="10" fill="url(#${uid}_hairGrad)" />
              <circle cx="6" cy="36" r="9" fill="url(#${uid}_hairGrad)" />
              <circle cx="6" cy="50" r="8" fill="url(#${uid}_hairGrad)" />
              <circle cx="6" cy="62" r="7" fill="url(#${uid}_hairGrad)" />
              <circle cx="6" cy="72" r="5" fill="url(#${uid}_hairGrad)" />
            </g>
            <!-- Right Braid -->
            <g transform="translate(198, 90)">
              <circle cx="6" cy="20" r="10" fill="url(#${uid}_hairGrad)" />
              <circle cx="6" cy="36" r="9" fill="url(#${uid}_hairGrad)" />
              <circle cx="6" cy="50" r="8" fill="url(#${uid}_hairGrad)" />
              <circle cx="6" cy="62" r="7" fill="url(#${uid}_hairGrad)" />
              <circle cx="6" cy="72" r="5" fill="url(#${uid}_hairGrad)" />
            </g>
            <path d="M 112 95 C 112 42, 208 42, 208 95 C 198 65, 175 60, 160 70 C 145 60, 122 65, 112 95 Z" fill="url(#${uid}_hairGrad)" />
          </g>
        `;
      }

      // Boy & Neutral short/spiky/fade/curly styles
      if (hairStyle === 'hair_boy_fade' || hairStyle === 'hair_boy_crew') {
        return `
          <g id="${uid}_hair">
            <!-- Tapered Fade Sides -->
            <path d="M 113 105 C 113 52, 207 52, 207 105 C 205 78, 195 58, 160 56 C 125 58, 115 78, 113 105 Z" fill="url(#${uid}_hairShadowGrad)" />
            <!-- Top Crop -->
            <path d="M 118 85 C 120 44, 200 44, 202 85 C 190 62, 170 58, 160 58 C 150 58, 130 62, 118 85 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      } else if (hairStyle === 'hair_boy_sidepart') {
        return `
          <g id="${uid}_hair">
            <path d="M 112 98 C 112 45, 208 45, 208 98 C 204 68, 190 62, 150 60 C 130 60, 118 70, 112 98 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Part line -->
            <path d="M 142 58 L 146 76" stroke="${hairColor.shadow}" stroke-width="2" opacity="0.6" />
          </g>
        `;
      } else if (hairStyle === 'hair_boy_spiky') {
        return `
          <g id="${uid}_hair">
            <path d="M 114 90 L 122 55 L 134 68 L 148 45 L 160 65 L 172 45 L 186 68 L 198 55 L 206 90 C 195 68, 125 68, 114 90 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      } else if (hairStyle === 'hair_boy_messy' || hairStyle === 'hair_boy_wavy' || hairStyle === 'hair_neutral_wavy') {
        return `
          <g id="${uid}_hair">
            <path d="M 112 92 Q 120 45 140 55 Q 160 38 180 55 Q 200 45 208 92 C 198 68, 180 65, 160 68 C 140 65, 122 68, 112 92 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      }

      // Default classic short (Boy / Neutral)
      return `
        <g id="${uid}_hair">
          <path d="M 113 95 C 113 46, 207 46, 207 95 C 200 68, 180 60, 160 62 C 140 60, 120 68, 113 95 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
        </g>
      `;
    },

    // Clothing: Tops & Shirts
    top(cfg, uid, colors) {
      if (cfg.dress && cfg.dress !== 'none') return ''; // Dresses override tops

      const style = cfg.top || 'top_tshirt';
      const c = colors.top;
      const shadow = c.shadow;
      const main = c.main;

      if (style === 'top_hoodie') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <!-- Hoodie Body -->
            <path d="M 124 178 L 196 178 L 194 262 L 126 262 Z" fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Hood Collar & Drawstrings -->
            <path d="M 136 175 C 136 160, 184 160, 184 175 Q 160 192 136 175 Z" fill="${shadow}" />
            <path d="M 152 186 L 152 210 M 168 186 L 168 210" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
            <!-- Front Kangaroo Pocket -->
            <path d="M 138 225 L 182 225 L 188 255 L 132 255 Z" fill="${shadow}" opacity="0.35" />
            <!-- Sleeves -->
            <path d="M 124 178 L 108 235 L 122 238 L 132 195 Z" fill="url(#${uid}_topGrad)" />
            <path d="M 196 178 L 212 235 L 198 238 L 188 195 Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      } else if (style === 'top_polo') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <path d="M 126 180 L 194 180 L 192 260 L 128 260 Z" fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Polo Collar & Placket -->
            <path d="M 144 178 L 160 196 L 150 196 Z" fill="${shadow}" />
            <path d="M 176 178 L 160 196 L 170 196 Z" fill="${shadow}" />
            <rect x="156" y="194" width="8" height="24" fill="${shadow}" />
            <circle cx="160" cy="202" r="1.5" fill="#ffffff" />
            <circle cx="160" cy="212" r="1.5" fill="#ffffff" />
            <!-- Short Sleeves -->
            <path d="M 126 180 L 115 215 L 128 218 L 134 190 Z" fill="url(#${uid}_topGrad)" />
            <path d="M 194 180 L 205 215 L 192 218 L 186 190 Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      } else if (style === 'top_jacket') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <path d="M 124 176 L 196 176 L 194 262 L 126 262 Z" fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Inner Shirt View -->
            <path d="M 148 178 L 160 215 L 172 178 Z" fill="#ffffff" />
            <!-- Zipper / Lapel -->
            <line x1="160" y1="215" x2="160" y2="262" stroke="#ced6e0" stroke-width="2" />
            <!-- Collar Flaps -->
            <path d="M 138 176 L 148 210 L 132 195 Z" fill="${shadow}" />
            <path d="M 182 176 L 172 210 L 188 195 Z" fill="${shadow}" />
            <!-- Long Sleeves -->
            <path d="M 124 176 L 110 245 L 124 248 L 132 195 Z" fill="url(#${uid}_topGrad)" />
            <path d="M 196 176 L 210 245 L 196 248 L 188 195 Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      } else if (style === 'top_sweater' || style === 'top_sweatshirt') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <path d="M 124 178 L 196 178 L 194 262 L 126 262 Z" fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Crew Neck Rib -->
            <ellipse cx="160" cy="182" rx="16" ry="6" fill="${shadow}" />
            <!-- Sleeves with Cuffs -->
            <path d="M 124 178 L 110 245 L 124 248 L 132 195 Z" fill="url(#${uid}_topGrad)" />
            <path d="M 196 178 L 210 245 L 196 248 L 188 195 Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      }

      // Default: T-Shirt / Casual Top
      return `
        <g id="${uid}_top" class="avatar-part-top">
          <!-- T-Shirt Body -->
          <path d="M 126 180 L 194 180 L 192 260 L 128 260 Z" fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
          <!-- Round Crew Neckline -->
          <ellipse cx="160" cy="182" rx="14" ry="5" fill="${shadow}" />
          <!-- Short Sleeves -->
          <path d="M 126 180 L 114 220 L 128 222 L 134 190 Z" fill="url(#${uid}_topGrad)" />
          <path d="M 194 180 L 206 220 L 192 222 L 186 190 Z" fill="url(#${uid}_topGrad)" />
        </g>
      `;
    },

    // Clothing: Bottoms (Pants, Shorts, Skirts)
    bottom(cfg, uid, colors) {
      if (cfg.dress && cfg.dress !== 'none') return ''; // Dresses override bottoms

      const style = cfg.bottom || 'bottom_jeans';
      const c = colors.bottom;
      const shadow = c.shadow;

      if (style === 'bottom_shorts') {
        return `
          <g id="${uid}_bottom" class="avatar-part-bottom">
            <!-- Shorts Waist & Legs -->
            <path d="M 127 255 L 193 255 L 194 305 L 166 305 L 160 270 L 154 305 L 126 305 Z" fill="url(#${uid}_bottomGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Belt/Waistband -->
            <rect x="127" y="254" width="66" height="7" fill="${shadow}" opacity="0.4" />
          </g>
        `;
      } else if (style === 'bottom_skirt') {
        return `
          <g id="${uid}_bottom" class="avatar-part-bottom">
            <!-- Flared Skirt -->
            <path d="M 132 255 L 188 255 L 205 315 L 115 315 Z" fill="url(#${uid}_bottomGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Pleat Accents -->
            <line x1="145" y1="258" x2="135" y2="315" stroke="${shadow}" stroke-width="2" opacity="0.4" />
            <line x1="160" y1="258" x2="160" y2="315" stroke="${shadow}" stroke-width="2" opacity="0.4" />
            <line x1="175" y1="258" x2="185" y2="315" stroke="${shadow}" stroke-width="2" opacity="0.4" />
          </g>
        `;
      } else if (style === 'bottom_joggers') {
        return `
          <g id="${uid}_bottom" class="avatar-part-bottom">
            <!-- Joggers with Cuffs -->
            <path d="M 127 255 L 193 255 L 190 368 L 168 368 L 160 275 L 152 368 L 130 368 Z" fill="url(#${uid}_bottomGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Drawstring -->
            <circle cx="160" cy="260" r="3" fill="#ffffff" />
            <line x1="158" y1="262" x2="155" y2="272" stroke="#ffffff" stroke-width="2" />
            <line x1="162" y1="262" x2="165" y2="272" stroke="#ffffff" stroke-width="2" />
            <!-- Ankle Cuffs -->
            <rect x="130" y="364" width="22" height="6" rx="2" fill="${shadow}" />
            <rect x="168" y="364" width="22" height="6" rx="2" fill="${shadow}" />
          </g>
        `;
      }

      // Default Jeans / Pants
      return `
        <g id="${uid}_bottom" class="avatar-part-bottom">
          <!-- Pants Shape -->
          <path d="M 127 255 L 193 255 L 192 372 L 168 372 L 160 275 L 152 372 L 128 372 Z" fill="url(#${uid}_bottomGrad)" filter="url(#${uid}_dropShadow)" />
          <!-- Pocket Rivets & Stitching -->
          <path d="M 132 262 Q 142 272 150 262" stroke="${shadow}" stroke-width="1.8" fill="none" opacity="0.6" />
          <path d="M 188 262 Q 178 272 170 262" stroke="${shadow}" stroke-width="1.8" fill="none" opacity="0.6" />
        </g>
      `;
    },

    // Clothing: Dresses
    dress(cfg, uid, colors) {
      if (!cfg.dress || cfg.dress === 'none') return '';

      const style = cfg.dress;
      const c = colors.dress;
      const shadow = c.shadow;

      if (style === 'dress_party' || style === 'dress_summer') {
        return `
          <g id="${uid}_dress" class="avatar-part-dress">
            <!-- Straps/Bodice -->
            <path d="M 134 178 L 186 178 L 188 245 L 132 245 Z" fill="url(#${uid}_dressGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Flared Skirt Base -->
            <path d="M 132 245 L 188 245 L 210 325 L 110 325 Z" fill="url(#${uid}_dressGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Sparkle/Belt Accent -->
            <ellipse cx="160" cy="245" rx="28" ry="4" fill="#ffffff" opacity="0.5" />
          </g>
        `;
      } else if (style === 'dress_long' || style === 'dress_traditional' || style === 'dress_formal') {
        return `
          <g id="${uid}_dress" class="avatar-part-dress">
            <!-- Long Elegant Dress -->
            <path d="M 130 176 L 190 176 L 208 368 L 112 368 Z" fill="url(#${uid}_dressGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Sleeves -->
            <path d="M 130 176 L 114 235 L 126 238 L 136 195 Z" fill="url(#${uid}_dressGrad)" />
            <path d="M 190 176 L 206 235 L 194 238 L 184 195 Z" fill="url(#${uid}_dressGrad)" />
            <line x1="160" y1="180" x2="160" y2="368" stroke="${shadow}" stroke-width="2" opacity="0.35" />
          </g>
        `;
      }

      // Default Casual Dress
      return `
        <g id="${uid}_dress" class="avatar-part-dress">
          <path d="M 128 178 L 192 178 L 202 315 L 118 315 Z" fill="url(#${uid}_dressGrad)" filter="url(#${uid}_dropShadow)" />
          <ellipse cx="160" cy="182" rx="14" ry="5" fill="${shadow}" />
        </g>
      `;
    },

    // Shoes
    shoes(cfg, uid, colors) {
      const style = cfg.shoes || 'shoes_sneakers';
      const c = colors.shoe;
      const main = c.main;
      const shadow = c.shadow;

      let lX = 126;
      let rX = 168;
      let y = 370;

      if (style === 'shoes_boots') {
        return `
          <g id="${uid}_shoes">
            <!-- Left Boot -->
            <path d="M ${lX} 355 L ${lX + 24} 355 L ${lX + 26} 392 L ${lX - 6} 392 L ${lX - 4} 380 Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
            <rect x="${lX - 8}" y="390" width="36" height="6" rx="2" fill="${shadow}" />
            
            <!-- Right Boot -->
            <path d="M ${rX} 355 L ${rX + 24} 355 L ${rX + 28} 380 L ${rX + 30} 392 L ${rX - 2} 392 Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
            <rect x="${rX - 4}" y="390" width="36" height="6" rx="2" fill="${shadow}" />
          </g>
        `;
      } else if (style === 'shoes_sandals') {
        return `
          <g id="${uid}_shoes">
            <rect x="${lX - 6}" y="386" width="32" height="6" rx="3" fill="${shadow}" />
            <line x1="${lX - 2}" y1="386" x2="${lX + 20}" y2="386" stroke="${main}" stroke-width="4" stroke-linecap="round" />
            <rect x="${rX - 2}" y="386" width="32" height="6" rx="3" fill="${shadow}" />
            <line x1="${rX + 2}" y1="386" x2="${rX + 24}" y2="386" stroke="${main}" stroke-width="4" stroke-linecap="round" />
          </g>
        `;
      }

      // Default / Sports / Casual Sneakers
      return `
        <g id="${uid}_shoes">
          <!-- Left Sneaker -->
          <path d="M ${lX} 368 L ${lX + 24} 368 L ${lX + 25} 388 L ${lX - 8} 388 Q ${lX - 6} 378 ${lX} 368 Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
          <!-- White Sole & Laces -->
          <rect x="${lX - 10}" y="387" width="37" height="6" rx="3" fill="#ffffff" />
          <line x1="${lX + 2}" y1="375" x2="${lX + 16}" y2="375" stroke="#ffffff" stroke-width="2" />

          <!-- Right Sneaker -->
          <path d="M ${rX} 368 L ${rX + 24} 368 Q ${rX + 30} 378 ${rX + 32} 388 L ${rX - 1} 388 L ${rX} 368 Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
          <rect x="${rX - 3}" y="387" width="37" height="6" rx="3" fill="#ffffff" />
          <line x1="${rX + 8}" y1="375" x2="${rX + 22}" y2="375" stroke="#ffffff" stroke-width="2" />
        </g>
      `;
    },

    // Glasses
    glasses(cfg, uid) {
      const style = cfg.glasses || 'none';
      if (style === 'none') return '';

      if (style === 'glasses_sunglasses') {
        return `
          <g id="${uid}_glasses">
            <rect x="127" y="96" width="28" height="18" rx="5" fill="#1e272e" opacity="0.95" />
            <rect x="165" y="96" width="28" height="18" rx="5" fill="#1e272e" opacity="0.95" />
            <!-- Bridge & Lens Sheen -->
            <line x1="155" y1="102" x2="165" y2="102" stroke="#1e272e" stroke-width="3" />
            <line x1="130" y1="99" x2="148" y2="111" stroke="#ffffff" stroke-width="2" opacity="0.4" />
            <line x1="168" y1="99" x2="186" y2="111" stroke="#ffffff" stroke-width="2" opacity="0.4" />
          </g>
        `;
      } else if (style === 'glasses_round') {
        return `
          <g id="${uid}_glasses">
            <circle cx="141" cy="105" r="14" fill="none" stroke="#2c3e50" stroke-width="2.6" />
            <circle cx="179" cy="105" r="14" fill="none" stroke="#2c3e50" stroke-width="2.6" />
            <path d="M 155 105 Q 160 102 165 105" stroke="#2c3e50" stroke-width="2.6" fill="none" />
          </g>
        `;
      } else if (style === 'glasses_square') {
        return `
          <g id="${uid}_glasses">
            <rect x="126" y="94" width="28" height="22" rx="4" fill="none" stroke="#2c3e50" stroke-width="2.6" />
            <rect x="166" y="94" width="28" height="22" rx="4" fill="none" stroke="#2c3e50" stroke-width="2.6" />
            <line x1="154" y1="103" x2="166" y2="103" stroke="#2c3e50" stroke-width="2.6" />
          </g>
        `;
      }

      // Default thin frame
      return `
        <g id="${uid}_glasses">
          <rect x="128" y="96" width="26" height="18" rx="4" fill="none" stroke="#e67e22" stroke-width="1.8" />
          <rect x="166" y="96" width="26" height="18" rx="4" fill="none" stroke="#e67e22" stroke-width="1.8" />
          <line x1="154" y1="103" x2="166" y2="103" stroke="#e67e22" stroke-width="1.8" />
        </g>
      `;
    },

    // Headwear
    headwear(cfg, uid) {
      const style = cfg.headwear || 'none';
      if (style === 'none') return '';

      if (style === 'headwear_cap') {
        return `
          <g id="${uid}_headwear">
            <!-- Cap Dome -->
            <path d="M 112 80 C 112 38, 208 38, 208 80 Z" fill="#e74c3c" filter="url(#${uid}_dropShadow)" />
            <!-- Cap Visor / Peak -->
            <path d="M 110 80 Q 160 72 218 78 Q 230 84 212 88 Q 160 84 110 80 Z" fill="#c0392b" />
            <circle cx="160" cy="44" r="4" fill="#c0392b" />
          </g>
        `;
      } else if (style === 'headwear_beanie' || style === 'headwear_winter_hat') {
        return `
          <g id="${uid}_headwear">
            <!-- Pom Pom -->
            <circle cx="160" cy="30" r="12" fill="#f1c40f" />
            <!-- Beanie Dome -->
            <path d="M 112 85 C 110 40, 210 40, 208 85 Z" fill="#2c3e50" filter="url(#${uid}_dropShadow)" />
            <!-- Folded Rim -->
            <rect x="108" y="78" width="104" height="14" rx="6" fill="#34495e" />
          </g>
        `;
      } else if (style === 'headwear_crown') {
        return `
          <g id="${uid}_headwear">
            <path d="M 120 75 L 128 48 L 144 65 L 160 42 L 176 65 L 192 48 L 200 75 Z" fill="#f1c40f" stroke="#d4ac0d" stroke-width="2" filter="url(#${uid}_dropShadow)" />
            <circle cx="160" cy="46" r="3" fill="#e74c3c" />
            <circle cx="128" cy="52" r="2.5" fill="#3498db" />
            <circle cx="192" cy="52" r="2.5" fill="#2ecc71" />
          </g>
        `;
      } else if (style === 'headwear_headband') {
        return `
          <path d="M 112 86 C 112 55, 208 55, 208 86" stroke="#9b59b6" stroke-width="8" fill="none" stroke-linecap="round" />
        `;
      }
      return '';
    },

    // Accessories
    accessories(cfg, uid) {
      const style = cfg.accessory || 'none';
      if (style === 'none') return '';

      if (style === 'acc_headphones') {
        return `
          <g id="${uid}_accessories">
            <!-- Over-ear Band -->
            <path d="M 106 108 C 106 35, 214 35, 214 108" stroke="#34495e" stroke-width="6" fill="none" />
            <!-- Left & Right Ear Cushions -->
            <rect x="100" y="95" width="12" height="26" rx="6" fill="#e74c3c" />
            <rect x="208" y="95" width="12" height="26" rx="6" fill="#e74c3c" />
          </g>
        `;
      } else if (style === 'acc_backpack') {
        return `
          <g id="${uid}_accessories">
            <!-- Straps on Shoulders -->
            <path d="M 134 180 L 130 240 M 186 180 L 190 240" stroke="#d35400" stroke-width="6" stroke-linecap="round" />
          </g>
        `;
      } else if (style === 'acc_necklace') {
        return `
          <path d="M 148 180 Q 160 200 172 180" stroke="#f1c40f" stroke-width="2.5" fill="none" />
          <circle cx="160" cy="195" r="4" fill="#e74c3c" />
        `;
      } else if (style === 'acc_earrings') {
        return `
          <circle cx="114" cy="120" r="3.5" fill="#f1c40f" />
          <circle cx="206" cy="120" r="3.5" fill="#f1c40f" />
        `;
      } else if (style === 'acc_watch') {
        return `
          <rect x="160 + 6" y="278" width="10" height="4" rx="2" fill="#34495e" />
        `;
      }
      return '';
    },

    // Special Items
    specialItems(cfg, uid) {
      const item = cfg.specialItem || 'none';
      if (item === 'none') return '';

      if (item === 'item_book') {
        return `
          <g id="${uid}_item" transform="translate(90, 245) rotate(-15)">
            <rect x="0" y="0" width="32" height="42" rx="3" fill="#2980b9" filter="url(#${uid}_dropShadow)" />
            <rect x="3" y="3" width="26" height="36" rx="2" fill="#ecf0f1" />
            <line x1="6" y1="12" x2="24" y2="12" stroke="#7f8c8d" stroke-width="2" />
            <line x1="6" y1="20" x2="24" y2="20" stroke="#7f8c8d" stroke-width="2" />
          </g>
        `;
      } else if (item === 'item_laptop') {
        return `
          <g id="${uid}_item" transform="translate(86, 255) rotate(-10)">
            <rect x="0" y="0" width="40" height="28" rx="3" fill="#7f8c8d" filter="url(#${uid}_dropShadow)" />
            <rect x="2" y="2" width="36" height="24" rx="2" fill="#2c3e50" />
            <circle cx="20" cy="14" r="3" fill="#3498db" />
          </g>
        `;
      } else if (item === 'item_trophy') {
        return `
          <g id="${uid}_item" transform="translate(88, 240)">
            <path d="M 6 0 L 26 0 L 22 22 Q 16 28 10 22 Z" fill="#f1c40f" filter="url(#${uid}_dropShadow)" />
            <rect x="13" y="24" width="6" height="10" fill="#d4ac0d" />
            <rect x="8" y="34" width="16" height="6" rx="1" fill="#34495e" />
            <path d="M 6 4 Q 0 10 6 16 M 26 4 Q 32 10 26 16" stroke="#f1c40f" stroke-width="2.5" fill="none" />
          </g>
        `;
      } else if (item === 'item_pencil') {
        return `
          <g id="${uid}_item" transform="translate(94, 250) rotate(-45)">
            <rect x="0" y="0" width="8" height="35" rx="1" fill="#f39c12" />
            <polygon points="0,35 8,35 4,45" fill="#f5cba7" />
            <polygon points="3,42 5,42 4,45" fill="#2c3e50" />
          </g>
        `;
      }
      return '';
    },

    // Winner Awards: Physically held in hand
    heldAward(award, uid, colors) {
      if (!award || award === 'none') return '';

      const skinGrad = `url(#${uid}_skinGrad)`;

      if (award === 'trophy_gold' || award === 'trophy') {
        // Grand 3D Golden Trophy Cup held in avatar's hand
        return `
          <g id="${uid}_held_trophy" class="avatar-held-award-trophy">
            <!-- Shadow cast by trophy -->
            <ellipse cx="218" cy="298" rx="20" ry="6" fill="#000000" opacity="0.35" filter="url(#${uid}_dropShadow)" />
            
            <!-- Trophy Base (Solid dark marble pedestal with gold trim) -->
            <path d="M 200 286 L 236 286 L 238 298 L 198 298 Z" fill="#2c3e50" filter="url(#${uid}_dropShadow)" />
            <rect x="202" y="284" width="32" height="3" fill="#f1c40f" rx="1" />
            <rect x="198" y="295" width="40" height="3" fill="#f39c12" rx="1" />
            
            <!-- Trophy Stem & Nodes -->
            <path d="M 215 264 L 221 264 L 220 285 L 216 285 Z" fill="url(#${uid}_goldTrophy)" />
            <ellipse cx="218" cy="275" rx="5" ry="3" fill="#fff275" />

            <!-- Trophy Cup Handles -->
            <!-- Left Handle (connects toward hand) -->
            <path d="M 204 228 C 182 232, 178 258, 206 264" stroke="url(#${uid}_goldTrophy)" stroke-width="4.5" fill="none" stroke-linecap="round" />
            <path d="M 204 230 C 186 234, 182 256, 206 262" stroke="#fff9a6" stroke-width="1.5" fill="none" stroke-linecap="round" />

            <!-- Right Handle -->
            <path d="M 232 228 C 254 232, 258 258, 230 264" stroke="url(#${uid}_goldTrophy)" stroke-width="4.5" fill="none" stroke-linecap="round" />
            <path d="M 232 230 C 250 234, 254 256, 230 262" stroke="#fff9a6" stroke-width="1.5" fill="none" stroke-linecap="round" />

            <!-- Trophy Cup Body (Polished Gold with Specular Highlight) -->
            <path d="M 202 222 L 234 222 C 234 252, 224 266, 218 266 C 212 266, 202 252, 202 222 Z" fill="url(#${uid}_goldTrophy)" filter="url(#${uid}_dropShadow)" />
            <!-- Cup Rim -->
            <ellipse cx="218" cy="222" rx="16" ry="4.5" fill="#fff9a6" stroke="#d35400" stroke-width="1" />
            <ellipse cx="218" cy="222" rx="13" ry="3" fill="#d35400" opacity="0.6" />

            <!-- Embossed Star on Cup -->
            <polygon points="218,234 220,240 226,240 221,244 223,250 218,246 213,250 215,244 210,240 216,240" fill="#ffffff" opacity="0.9" />

            <!-- Hand Grip / Fingers Wrapped Around Handle & Stem -->
            <!-- Hand palm base behind handle -->
            <circle cx="192" cy="265" r="9" fill="${skinGrad}" />
            <!-- Fingers clamped over handle -->
            <ellipse cx="194" cy="254" rx="5.5" ry="3" fill="${skinGrad}" transform="rotate(-15 194 254)" />
            <ellipse cx="195" cy="261" rx="5.5" ry="3" fill="${skinGrad}" transform="rotate(-10 195 261)" />
            <ellipse cx="195" cy="268" rx="5.5" ry="3" fill="${skinGrad}" transform="rotate(-5 195 268)" />
            <ellipse cx="194" cy="275" rx="5" ry="3" fill="${skinGrad}" />
            <!-- Thumb pointing upward on front -->
            <path d="M 190 266 C 188 258, 194 252, 197 256 C 199 260, 195 268, 190 266 Z" fill="${skinGrad}" />

            <!-- Sparkle Accents on Trophy -->
            <polygon points="230,220 231,223 234,224 231,225 230,228 229,225 226,224 229,223" fill="#ffffff" />
            <polygon points="204,242 205,244 207,245 205,246 204,248 203,246 201,245 203,244" fill="#ffffff" opacity="0.8" />
          </g>
        `;
      } else if (award === 'medal_silver' || award === 'silver') {
        // Silver Medal on royal blue ribbon held in avatar's hand
        return `
          <g id="${uid}_held_silver_medal" class="avatar-held-award-medal">
            <!-- Ribbon draped from hand -->
            <path d="M 194 270 Q 186 288 194 306 L 200 306 Q 206 288 198 270 Z" fill="#2980b9" filter="url(#${uid}_dropShadow)" />
            <path d="M 196 270 Q 190 288 196 306 L 198 306 Q 202 288 198 270 Z" fill="#ffffff" />

            <!-- Medal Medallion -->
            <circle cx="197" cy="316" r="17" fill="url(#${uid}_silverMedal)" stroke="#ffffff" stroke-width="2" filter="url(#${uid}_dropShadow)" />
            <circle cx="197" cy="316" r="13" fill="none" stroke="#7f8c8d" stroke-width="1.5" stroke-dasharray="2 1" />
            <text x="197" y="322" text-anchor="middle" font-size="14" font-weight="900" fill="#2c3e50" font-family="'Outfit', sans-serif">2</text>
            <polygon points="208,306 209,308 211,309 209,310 208,312 207,310 205,309 207,308" fill="#ffffff" />

            <!-- Hand Fingers Gripping Ribbon Loop -->
            <circle cx="193" cy="272" r="8" fill="${skinGrad}" />
            <ellipse cx="195" cy="268" rx="5" ry="3" fill="${skinGrad}" transform="rotate(-15 195 268)" />
            <ellipse cx="196" cy="274" rx="5" ry="3" fill="${skinGrad}" transform="rotate(-10 196 274)" />
            <ellipse cx="195" cy="280" rx="5" ry="3" fill="${skinGrad}" />
            <path d="M 190 274 C 188 268, 194 262, 197 266 Z" fill="${skinGrad}" />
          </g>
        `;
      } else if (award === 'medal_bronze' || award === 'bronze') {
        // Bronze Medal on crimson ribbon held in avatar's hand
        return `
          <g id="${uid}_held_bronze_medal" class="avatar-held-award-medal">
            <!-- Ribbon draped from hand -->
            <path d="M 194 270 Q 186 288 194 306 L 200 306 Q 206 288 198 270 Z" fill="#c0392b" filter="url(#${uid}_dropShadow)" />
            <path d="M 196 270 Q 190 288 196 306 L 198 306 Q 202 288 198 270 Z" fill="#f1c40f" />

            <!-- Medal Medallion -->
            <circle cx="197" cy="316" r="17" fill="url(#${uid}_bronzeMedal)" stroke="#ffaa5b" stroke-width="2" filter="url(#${uid}_dropShadow)" />
            <circle cx="197" cy="316" r="13" fill="none" stroke="#d35400" stroke-width="1.5" stroke-dasharray="2 1" />
            <text x="197" y="322" text-anchor="middle" font-size="14" font-weight="900" fill="#4a1c0d" font-family="'Outfit', sans-serif">3</text>
            <polygon points="208,306 209,308 211,309 209,310 208,312 207,310 205,309 207,308" fill="#ffffff" />

            <!-- Hand Fingers Gripping Ribbon Loop -->
            <circle cx="193" cy="272" r="8" fill="${skinGrad}" />
            <ellipse cx="195" cy="268" rx="5" ry="3" fill="${skinGrad}" transform="rotate(-15 195 268)" />
            <ellipse cx="196" cy="274" rx="5" ry="3" fill="${skinGrad}" transform="rotate(-10 196 274)" />
            <ellipse cx="195" cy="280" rx="5" ry="3" fill="${skinGrad}" />
            <path d="M 190 274 C 188 268, 194 262, 197 266 Z" fill="${skinGrad}" />
          </g>
        `;
      }
      return '';
    }
  };

  // 5. Main AvatarEngine Object
  const AvatarEngine = {
    PALETTES,
    DEFAULT_CONFIGS,

    /**
     * Resolves complete color definitions for a given configuration
     */
    resolveColors(config) {
      const skinKey = config.skin || 'skin_04';
      const hairKey = config.hairColor || 'black';
      const topKey = config.topColor || 'blue';
      const bottomKey = config.bottomColor || 'denim';
      const dressKey = config.dressColor || 'pink';
      const shoeKey = config.shoeColor || 'white';
      const eyeKey = config.eyeColor || 'dark_brown';

      return {
        skin: PALETTES.skin[skinKey] || PALETTES.skin.skin_04,
        hair: PALETTES.hairColor[hairKey] || PALETTES.hairColor.black,
        top: PALETTES.clothing[topKey] || PALETTES.clothing.blue,
        bottom: PALETTES.clothing[bottomKey] || PALETTES.clothing.denim,
        dress: PALETTES.clothing[dressKey] || PALETTES.clothing.pink,
        shoe: PALETTES.clothing[shoeKey] || PALETTES.clothing.white,
        eyeColor: PALETTES.eyeColor[eyeKey] || PALETTES.eyeColor.dark_brown
      };
    },

    /**
     * Generates a complete 3D Layered SVG string
     * @param {Object} rawConfig - avatar property keys
     * @param {Object} options - { mode: 'full' | 'badge', size: 300, animated: true }
     */
    renderSvg(rawConfig, options = {}) {
      const mode = options.mode || 'full';
      const animated = options.animated !== false;
      const award = options.heldAward || options.award || rawConfig.heldAward || null;
      const config = Object.assign({}, DEFAULT_CONFIGS.boy, rawConfig);
      const colors = this.resolveColors(config);
      const uid = getUid('av_' + mode);

      // SVG Definitions (Gradients & Filters for 3D Volume & Specularity)
      const defs = `
        <defs>
          <!-- Award 3D Gradients -->
          <linearGradient id="${uid}_goldTrophy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff275" />
            <stop offset="35%" stop-color="#f1c40f" />
            <stop offset="75%" stop-color="#f39c12" />
            <stop offset="100%" stop-color="#b33939" />
          </linearGradient>

          <linearGradient id="${uid}_silverMedal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="40%" stop-color="#dfe4ea" />
            <stop offset="80%" stop-color="#a4b0be" />
            <stop offset="100%" stop-color="#57606f" />
          </linearGradient>

          <linearGradient id="${uid}_bronzeMedal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffd8bf" />
            <stop offset="40%" stop-color="#e17055" />
            <stop offset="80%" stop-color="#d63031" />
            <stop offset="100%" stop-color="#63171b" />
          </linearGradient>
          <!-- 3D Skin Gradient -->
          <linearGradient id="${uid}_skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${colors.skin.highlight}" />
            <stop offset="60%" stop-color="${colors.skin.main}" />
            <stop offset="100%" stop-color="${colors.skin.shadow}" />
          </linearGradient>

          <!-- 3D Skin Shadow Gradient -->
          <linearGradient id="${uid}_skinShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${colors.skin.main}" />
            <stop offset="100%" stop-color="${colors.skin.shadow}" />
          </linearGradient>

          <!-- 3D Hair Gradients -->
          <linearGradient id="${uid}_hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${colors.hair.highlight}" />
            <stop offset="45%" stop-color="${colors.hair.main}" />
            <stop offset="100%" stop-color="${colors.hair.shadow}" />
          </linearGradient>

          <linearGradient id="${uid}_hairShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${colors.hair.main}" />
            <stop offset="100%" stop-color="${colors.hair.shadow}" />
          </linearGradient>

          <!-- Clothing Top Gradient -->
          <linearGradient id="${uid}_topGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${colors.top.highlight}" />
            <stop offset="60%" stop-color="${colors.top.main}" />
            <stop offset="100%" stop-color="${colors.top.shadow}" />
          </linearGradient>

          <!-- Clothing Bottom Gradient -->
          <linearGradient id="${uid}_bottomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${colors.bottom.highlight}" />
            <stop offset="60%" stop-color="${colors.bottom.main}" />
            <stop offset="100%" stop-color="${colors.bottom.shadow}" />
          </linearGradient>

          <!-- Dress Gradient -->
          <linearGradient id="${uid}_dressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${colors.dress.highlight}" />
            <stop offset="55%" stop-color="${colors.dress.main}" />
            <stop offset="100%" stop-color="${colors.dress.shadow}" />
          </linearGradient>

          <!-- Ground Shadow Gradient -->
          <radialGradient id="${uid}_groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.65" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>

          <!-- 3D Soft Drop Shadow Filter -->
          <filter id="${uid}_dropShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.22" />
          </filter>

          <!-- Face Glow & Smooth Ambient Light -->
          <filter id="${uid}_faceGlow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.8" flood-color="${colors.skin.shadow}" flood-opacity="0.3" />
          </filter>
        </defs>
      `;

      if (mode === 'badge' || mode === 'compact') {
        // Optimized 100x100 Portrait Crop for Leaderboard / Badges / Tables
        return `
          <svg viewBox="105 45 110 110" class="quizspark-avatar-svg avatar-badge-svg ${animated ? 'avatar-animated' : ''}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Student 3D Avatar">
            ${defs}
            <g id="${uid}_avatar_group">
              ${Layers.face(config, uid, colors)}
              ${Layers.hair(config, uid, colors)}
              ${Layers.eyes(config, uid, colors)}
              ${Layers.eyebrows(config, uid, colors)}
              ${Layers.nose(config, uid, colors)}
              ${Layers.mouth(config, uid)}
              ${Layers.facialHair(config, uid, colors)}
              ${Layers.glasses(config, uid)}
              ${Layers.headwear(config, uid)}
              ${Layers.accessories(config, uid)}
            </g>
          </svg>
        `;
      }

      // Full-Body View (320x420)
      return `
        <svg viewBox="0 0 320 420" class="quizspark-avatar-svg avatar-full-svg ${animated ? 'avatar-animated' : ''}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Student 3D Character Avatar">
          ${defs}
          <g id="${uid}_avatar_root">
            ${Layers.groundShadow(uid)}
            
            <!-- Character Animated Body Wrapper -->
            <g class="avatar-breath-group">
              ${Layers.body(config, uid, colors)}
              ${Layers.bottom(config, uid, colors)}
              ${Layers.shoes(config, uid, colors)}
              ${Layers.top(config, uid, colors)}
              ${Layers.dress(config, uid, colors)}
              
              <!-- Head & Face Assembly -->
              <g class="avatar-head-group">
                ${Layers.face(config, uid, colors)}
                ${Layers.eyes(config, uid, colors)}
                ${Layers.eyebrows(config, uid, colors)}
                ${Layers.nose(config, uid, colors)}
                ${Layers.mouth(config, uid)}
                ${Layers.facialHair(config, uid, colors)}
                ${Layers.hair(config, uid, colors)}
                ${Layers.glasses(config, uid)}
                ${Layers.headwear(config, uid)}
              </g>

              ${Layers.accessories(config, uid)}
              ${Layers.specialItems(config, uid)}
              ${Layers.heldAward(award, uid, colors)}
            </g>
          </g>
        </svg>
      `;
    },

    /**
     * Mounts SVG into a DOM container
     */
    mount(container, config, options = {}) {
      if (!container) return;
      container.innerHTML = this.renderSvg(config, options);
    },

    /**
     * Returns curated starting presets for a given style
     */
    getPresets(style = 'boy') {
      const all = {
        boy: [
          { id: 'boy_1', name: 'Boy 1 (Sporty)', config: { style: 'boy', body: 'athletic', skin: 'skin_04', face: 'face_round', hair: 'hair_boy_fade', hairColor: 'black', eyes: 'eyes_bright', eyeColor: 'dark_brown', eyebrows: 'brows_thick', nose: 'nose_medium', mouth: 'mouth_smile', facialHair: 'none', top: 'top_jersey', topColor: 'blue', bottom: 'bottom_shorts', bottomColor: 'navy', dress: 'none', dressColor: 'blue', shoes: 'shoes_sports', shoeColor: 'red', headwear: 'headwear_cap', glasses: 'none', accessory: 'acc_watch', specialItem: 'none' } },
          { id: 'boy_2', name: 'Boy 2 (Hoodie Geek)', config: { style: 'boy', body: 'regular', skin: 'skin_02', face: 'face_oval', hair: 'hair_boy_curly', hairColor: 'dark_brown', eyes: 'eyes_friendly', eyeColor: 'brown', eyebrows: 'brows_natural', nose: 'nose_small', mouth: 'mouth_confident', facialHair: 'none', top: 'top_hoodie', topColor: 'purple', bottom: 'bottom_jeans', bottomColor: 'denim', dress: 'none', dressColor: 'purple', shoes: 'shoes_sneakers', shoeColor: 'white', headwear: 'none', glasses: 'glasses_round', accessory: 'acc_backpack', specialItem: 'item_laptop' } },
          { id: 'boy_3', name: 'Boy 3 (Smart Polo)', config: { style: 'boy', body: 'slim', skin: 'skin_06', face: 'face_square', hair: 'hair_boy_sidepart', hairColor: 'black', eyes: 'eyes_almond', eyeColor: 'dark_brown', eyebrows: 'brows_straight', nose: 'nose_straight', mouth: 'mouth_smile', facialHair: 'mustache', top: 'top_polo', topColor: 'coral', bottom: 'bottom_casual', bottomColor: 'khaki', dress: 'none', dressColor: 'coral', shoes: 'shoes_casual', shoeColor: 'brown', headwear: 'none', glasses: 'glasses_thin', accessory: 'acc_watch', specialItem: 'none' } },
          { id: 'boy_4', name: 'Boy 4 (Urban Beanie)', config: { style: 'boy', body: 'regular', skin: 'skin_03', face: 'face_soft', hair: 'hair_boy_spiky', hairColor: 'blonde', eyes: 'eyes_round', eyeColor: 'blue', eyebrows: 'brows_thick', nose: 'nose_rounded', mouth: 'mouth_big_smile', facialHair: 'none', top: 'top_jacket', topColor: 'black', bottom: 'bottom_joggers', bottomColor: 'grey', dress: 'none', dressColor: 'black', shoes: 'shoes_boots', shoeColor: 'black', headwear: 'headwear_beanie', glasses: 'glasses_sunglasses', accessory: 'acc_headphones', specialItem: 'none' } },
          { id: 'boy_5', name: 'Boy 5 (Scholar)', config: { style: 'boy', body: 'tall', skin: 'skin_07', face: 'face_long', hair: 'hair_boy_short', hairColor: 'black', eyes: 'eyes_cartoon', eyeColor: 'dark_brown', eyebrows: 'brows_raised', nose: 'nose_medium', mouth: 'mouth_friendly', facialHair: 'none', top: 'top_shirt', topColor: 'white', bottom: 'bottom_formal', bottomColor: 'navy', dress: 'none', dressColor: 'white', shoes: 'shoes_formal', shoeColor: 'black', headwear: 'none', glasses: 'glasses_square', accessory: 'none', specialItem: 'item_book' } }
        ],
        girl: [
          { id: 'girl_1', name: 'Girl 1 (Casual Vibe)', config: { style: 'girl', body: 'regular', skin: 'skin_03', face: 'face_oval', hair: 'hair_girl_wavy', hairColor: 'dark_brown', eyes: 'eyes_bright', eyeColor: 'brown', eyebrows: 'brows_curved', nose: 'nose_small', mouth: 'mouth_smile', facialHair: 'none', top: 'top_casual', topColor: 'purple', bottom: 'bottom_jeans', bottomColor: 'denim', dress: 'none', dressColor: 'purple', shoes: 'shoes_sneakers', shoeColor: 'white', headwear: 'none', glasses: 'none', accessory: 'acc_earrings', specialItem: 'none' } },
          { id: 'girl_2', name: 'Girl 2 (Sport Pony)', config: { style: 'girl', body: 'athletic', skin: 'skin_05', face: 'face_round', hair: 'hair_girl_highpony', hairColor: 'black', eyes: 'eyes_almond', eyeColor: 'dark_brown', eyebrows: 'brows_natural', nose: 'nose_small', mouth: 'mouth_confident', facialHair: 'none', top: 'top_tshirt', topColor: 'teal', bottom: 'bottom_joggers', bottomColor: 'black', dress: 'none', dressColor: 'teal', shoes: 'shoes_sports', shoeColor: 'pink', headwear: 'headwear_headband', glasses: 'none', accessory: 'acc_headphones', specialItem: 'none' } },
          { id: 'girl_3', name: 'Girl 3 (Party Dress)', config: { style: 'girl', body: 'slim', skin: 'skin_02', face: 'face_soft', hair: 'hair_girl_curly', hairColor: 'auburn', eyes: 'eyes_large', eyeColor: 'green', eyebrows: 'brows_curved', nose: 'nose_small', mouth: 'mouth_big_smile', facialHair: 'none', top: 'none', topColor: 'pink', bottom: 'none', bottomColor: 'pink', dress: 'dress_party', dressColor: 'ruby', shoes: 'shoes_casual', shoeColor: 'red', headwear: 'headwear_crown', glasses: 'none', accessory: 'acc_necklace', specialItem: 'item_trophy' } },
          { id: 'girl_4', name: 'Girl 4 (Braids & Book)', config: { style: 'girl', body: 'regular', skin: 'skin_07', face: 'face_oval', hair: 'hair_girl_braids', hairColor: 'black', eyes: 'eyes_friendly', eyeColor: 'dark_brown', eyebrows: 'brows_thick', nose: 'nose_medium', mouth: 'mouth_smile', facialHair: 'none', top: 'top_sweater', topColor: 'yellow', bottom: 'bottom_skirt', bottomColor: 'denim', dress: 'none', dressColor: 'yellow', shoes: 'shoes_boots', shoeColor: 'brown', headwear: 'none', glasses: 'glasses_round', accessory: 'acc_backpack', specialItem: 'item_book' } },
          { id: 'girl_5', name: 'Girl 5 (Chic Bob Cut)', config: { style: 'girl', body: 'regular', skin: 'skin_01', face: 'face_square', hair: 'hair_girl_bob', hairColor: 'blonde', eyes: 'eyes_bright', eyeColor: 'blue', eyebrows: 'brows_thin', nose: 'nose_straight', mouth: 'mouth_laugh', facialHair: 'none', top: 'top_jacket', topColor: 'crimson', bottom: 'bottom_jeans', bottomColor: 'black', dress: 'none', dressColor: 'crimson', shoes: 'shoes_sneakers', shoeColor: 'white', headwear: 'none', glasses: 'glasses_sunglasses', accessory: 'acc_earrings', specialItem: 'none' } }
        ]
      };
      return all[style] || all.boy;
    },

    /**
     * Returns default configuration for style
     */
    getDefault(style = 'boy') {
      return Object.assign({}, DEFAULT_CONFIGS[style] || DEFAULT_CONFIGS.boy);
    },

    /**
     * Randomizes all features while ensuring aesthetic harmony
     */
    randomize(preferredStyle = 'boy') {
      const styles = ['boy', 'girl'];
      const style = preferredStyle && styles.includes(preferredStyle) ? preferredStyle : styles[Math.floor(Math.random() * styles.length)];

      const skins = ['skin_01', 'skin_02', 'skin_03', 'skin_04', 'skin_05', 'skin_06', 'skin_07', 'skin_08'];
      const faces = ['face_round', 'face_oval', 'face_square', 'face_soft', 'face_long', 'face_wide'];
      const bodies = ['regular', 'slim', 'athletic', 'soft', 'tall', 'short'];
      
      const hairMap = {
        boy: ['hair_boy_short', 'hair_boy_crew', 'hair_boy_sidepart', 'hair_boy_fade', 'hair_boy_curly', 'hair_boy_wavy', 'hair_boy_messy', 'hair_boy_spiky', 'hair_boy_medium', 'hair_boy_long'],
        girl: ['hair_girl_straight', 'hair_girl_wavy', 'hair_girl_curly', 'hair_girl_ponytail', 'hair_girl_highpony', 'hair_girl_lowpony', 'hair_girl_bob', 'hair_girl_braids', 'hair_girl_bun', 'hair_girl_sidebraid', 'hair_girl_shoulder', 'hair_girl_wavymedium']
      };

      const hairColors = ['black', 'dark_brown', 'brown', 'light_brown', 'blonde', 'dark_blonde', 'red', 'auburn', 'grey', 'blue', 'purple', 'pink', 'green', 'teal', 'coral'];
      const eyes = ['eyes_round', 'eyes_almond', 'eyes_large', 'eyes_small', 'eyes_soft', 'eyes_bright', 'eyes_cartoon', 'eyes_friendly'];
      const eyeColors = ['brown', 'dark_brown', 'blue', 'green', 'hazel', 'grey', 'amber'];
      const eyebrows = ['brows_straight', 'brows_curved', 'brows_thick', 'brows_thin', 'brows_soft', 'brows_raised', 'brows_natural'];
      const noses = ['nose_small', 'nose_medium', 'nose_wide', 'nose_rounded', 'nose_straight'];
      const mouths = ['mouth_smile', 'mouth_small_smile', 'mouth_neutral', 'mouth_big_smile', 'mouth_laugh', 'mouth_friendly', 'mouth_confident'];
      
      const tops = ['top_tshirt', 'top_polo', 'top_hoodie', 'top_sweatshirt', 'top_jacket', 'top_shirt', 'top_casual', 'top_jersey', 'top_sweater'];
      const topColors = ['blue', 'purple', 'red', 'yellow', 'green', 'coral', 'black', 'white', 'teal', 'navy', 'crimson', 'emerald'];
      const bottoms = ['bottom_jeans', 'bottom_shorts', 'bottom_joggers', 'bottom_casual', 'bottom_formal', 'bottom_skirt'];
      const bottomColors = ['denim', 'black', 'khaki', 'navy', 'grey', 'crimson', 'white', 'teal'];

      const dresses = ['dress_casual', 'dress_party', 'dress_summer', 'dress_long', 'dress_formal', 'dress_traditional', 'dress_modern'];
      const dressColors = ['purple', 'pink', 'blue', 'emerald', 'ruby', 'gold', 'teal', 'black'];

      const shoes = ['shoes_sneakers', 'shoes_sports', 'shoes_boots', 'shoes_casual', 'shoes_formal', 'shoes_sandals'];
      const shoeColors = ['white', 'black', 'red', 'blue', 'brown', 'pink', 'grey'];

      const headwear = ['none', 'none', 'headwear_cap', 'headwear_beanie', 'headwear_hat', 'headwear_headband', 'headwear_crown', 'headwear_winter_hat'];
      const glasses = ['none', 'none', 'glasses_round', 'glasses_square', 'glasses_thin', 'glasses_large', 'glasses_sunglasses'];
      const accessories = ['none', 'none', 'acc_backpack', 'acc_watch', 'acc_necklace', 'acc_earrings', 'acc_headphones', 'acc_clips'];
      const specialItems = ['none', 'none', 'none', 'item_book', 'item_laptop', 'item_pencil', 'item_trophy', 'item_gradcap'];

      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

      const isDress = (style === 'girl' && Math.random() < 0.25);

      return {
        style: style,
        body: pick(bodies),
        skin: pick(skins),
        face: pick(faces),
        hair: pick(hairMap[style] || hairMap.boy),
        hairColor: pick(hairColors),
        eyes: pick(eyes),
        eyeColor: pick(eyeColors),
        eyebrows: pick(eyebrows),
        nose: pick(noses),
        mouth: pick(mouths),
        facialHair: style === 'boy' && Math.random() < 0.2 ? pick(['mustache', 'light_beard', 'goatee']) : 'none',
        top: isDress ? 'none' : pick(tops),
        topColor: pick(topColors),
        bottom: isDress ? 'none' : pick(bottoms),
        bottomColor: pick(bottomColors),
        dress: isDress ? pick(dresses) : 'none',
        dressColor: pick(dressColors),
        shoes: pick(shoes),
        shoeColor: pick(shoeColors),
        headwear: pick(headwear),
        glasses: pick(glasses),
        accessory: pick(accessories),
        specialItem: pick(specialItems)
      };
    }
  };

  // Export to global scope
  global.AvatarEngine = AvatarEngine;
})(typeof window !== 'undefined' ? window : this);
