/**
 * QuizSpark Realistic 3D Full-Body Avatar System - Vector Rendering Engine
 * Pure modular layered vector generator with anatomical body skeleton, fixed clothing anchor points,
 * 3D-styled lighting, gradients, natural human proportions, and complete full-body visibility from head to shoes.
 * 
 * Includes 11 full categories: Body & Face, Hairstyles, Hair Colors, Spectacles, Hats & Headwear,
 * Tops, Pants, Dresses, Shoes, Facial Hair, Accessories & Special Items.
 */
(function (global) {
  'use strict';

  // 1. Curated Color Palettes & 3D Shading Definitions
  const PALETTES = {
    skin: {
      skin_01: { main: '#ffeaa7', shadow: '#e5b869', highlight: '#fff9e6', tone: 'Fair Warm' },
      skin_02: { main: '#fed39f', shadow: '#e89e47', highlight: '#fff1de', tone: 'Light Peach' },
      skin_03: { main: '#f0b27a', shadow: '#c97836', highlight: '#fae5d3', tone: 'Medium Warm' },
      skin_04: { main: '#e0a96d', shadow: '#af7336', highlight: '#f5d9bd', tone: 'Golden Tan' },
      skin_05: { main: '#c68642', shadow: '#8c4e16', highlight: '#e8af78', tone: 'Warm Olive' },
      skin_06: { main: '#8d5524', shadow: '#592e0b', highlight: '#ba7f4c', tone: 'Rich Bronze' },
      skin_07: { main: '#603813', shadow: '#381e05', highlight: '#8a5624', tone: 'Deep Brown' },
      skin_08: { main: '#3d2314', shadow: '#211107', highlight: '#633c24', tone: 'Espresso' },
      skin_09: { main: '#fbe7d0', shadow: '#e0be9b', highlight: '#ffffff', tone: 'Porcelain' },
      skin_10: { main: '#a86538', shadow: '#733c16', highlight: '#cf8e5f', tone: 'Caramel Honey' }
    },
    hairColor: {
      black: { main: '#1e272e', shadow: '#0b0c10', highlight: '#485460', label: 'Jet Black' },
      dark_brown: { main: '#3d1c02', shadow: '#220f01', highlight: '#5c2d0c', label: 'Dark Brown' },
      brown: { main: '#6d4c41', shadow: '#4e342e', highlight: '#8d6e63', label: 'Chestnut Brown' },
      light_brown: { main: '#a1887f', shadow: '#6d4c41', highlight: '#bcaaa4', label: 'Light Brown' },
      blonde: { main: '#fbc531', shadow: '#c49516', highlight: '#ffea79', label: 'Golden Blonde' },
      platinum: { main: '#ecf0f1', shadow: '#bdc3c7', highlight: '#ffffff', label: 'Platinum Blonde' },
      dark_blonde: { main: '#d4ac0d', shadow: '#967806', highlight: '#f7dc6f', label: 'Honey Blonde' },
      red: { main: '#c0392b', shadow: '#871f14', highlight: '#e74c3c', label: 'Auburn Red' },
      auburn: { main: '#8e44ad', shadow: '#5b2673', highlight: '#a569bd', label: 'Dark Auburn' },
      grey: { main: '#7f8c8d', shadow: '#4f5b66', highlight: '#bdc3c7', label: 'Silver Grey' },
      white: { main: '#f5f6fa', shadow: '#dcdde1', highlight: '#ffffff', label: 'Snow White' },
      blue: { main: '#0984e3', shadow: '#0652dd', highlight: '#74b9ff', label: 'Electric Blue' },
      purple: { main: '#8854d0', shadow: '#5f27cd', highlight: '#a55eea', label: 'Royal Purple' },
      pink: { main: '#e84393', shadow: '#ad1457', highlight: '#fd79a8', label: 'Bubblegum Pink' },
      green: { main: '#00b894', shadow: '#006266', highlight: '#55efc4', label: 'Emerald Green' },
      teal: { main: '#00cec9', shadow: '#00838f', highlight: '#81ecec', label: 'Ocean Teal' },
      coral: { main: '#ff7675', shadow: '#d63031', highlight: '#fab1a0', label: 'Sunset Coral' }
    },
    eyeColor: {
      brown: '#5c3d2e',
      dark_brown: '#2d1810',
      blue: '#2980b9',
      sky_blue: '#3498db',
      green: '#27ae60',
      emerald: '#2ecc71',
      hazel: '#a07855',
      grey: '#7f8c8d',
      amber: '#d35400',
      violet: '#8e44ad'
    },
    clothing: {
      blue: { main: '#2e86de', shadow: '#134a8e', highlight: '#54a0ff', label: 'Royal Blue' },
      purple: { main: '#8854d0', shadow: '#4d1e9e', highlight: '#a55eea', label: 'Deep Purple' },
      red: { main: '#ee5253', shadow: '#991515', highlight: '#ff6b6b', label: 'Vibrant Red' },
      yellow: { main: '#feca57', shadow: '#c47805', highlight: '#ffdd59', label: 'Warm Yellow' },
      green: { main: '#10ac84', shadow: '#08634c', highlight: '#1dd1a1', label: 'Mint Green' },
      coral: { main: '#ff7675', shadow: '#b33939', highlight: '#fd9644', label: 'Coral Orange' },
      black: { main: '#2f3542', shadow: '#151922', highlight: '#57606f', label: 'Onyx Black' },
      white: { main: '#f1f2f6', shadow: '#a4b0be', highlight: '#ffffff', label: 'Clean White' },
      teal: { main: '#00cec9', shadow: '#006b68', highlight: '#81ecec', label: 'Aqua Teal' },
      navy: { main: '#1e3799', shadow: '#0a1a54', highlight: '#4a69bd', label: 'Classic Navy' },
      crimson: { main: '#b71540', shadow: '#59051b', highlight: '#eb2f06', label: 'Ruby Crimson' },
      emerald: { main: '#009432', shadow: '#004a19', highlight: '#2ed573', label: 'Emerald' },
      denim: { main: '#3867d6', shadow: '#1b3882', highlight: '#4b7bec', label: 'Denim Indigo' },
      khaki: { main: '#d1ccc0', shadow: '#6b675e', highlight: '#f7f1e3', label: 'Khaki Beige' },
      grey: { main: '#747d8c', shadow: '#434954', highlight: '#a4b0be', label: 'Slate Grey' },
      pink: { main: '#f368e0', shadow: '#9c1c8c', highlight: '#ff9ff3', label: 'Pastel Pink' },
      gold: { main: '#ffc048', shadow: '#b37700', highlight: '#fff200', label: 'Goldenrod' },
      ruby: { main: '#c0392b', shadow: '#5e130b', highlight: '#e74c3c', label: 'Dark Ruby' },
      leather: { main: '#3e2723', shadow: '#1b0000', highlight: '#6a4f4b', label: 'Dark Leather' },
      olive: { main: '#556b2f', shadow: '#2e3d14', highlight: '#7a9a43', label: 'Military Olive' }
    }
  };

  // Helper: derive shade/highlight from any arbitrary hex color (supporting custom color picker)
  function deriveShades(hexColor, defaultObj) {
    if (!hexColor || typeof hexColor !== 'string') return defaultObj;
    if (PALETTES.clothing[hexColor]) return PALETTES.clothing[hexColor];
    if (PALETTES.hairColor[hexColor]) return PALETTES.hairColor[hexColor];
    if (!hexColor.startsWith('#')) return defaultObj;

    // Convert hex to rgb
    let c = hexColor.substring(1);
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return defaultObj;

    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    const shadowR = Math.max(0, Math.round(r * 0.55));
    const shadowG = Math.max(0, Math.round(g * 0.55));
    const shadowB = Math.max(0, Math.round(b * 0.55));

    const highR = Math.min(255, Math.round(r * 1.35 + 30));
    const highG = Math.min(255, Math.round(g * 1.35 + 30));
    const highB = Math.min(255, Math.round(b * 1.35 + 30));

    const shadow = `rgb(${shadowR},${shadowG},${shadowB})`;
    const highlight = `rgb(${highR},${highG},${highB})`;

    return { main: hexColor, shadow, highlight, label: 'Custom' };
  }

  // 2. Default Configuration Template
  const DEFAULT_CONFIGS = {
    boy: {
      style: 'boy', body: 'regular', skin: 'skin_04', face: 'face_round',
      hair: 'hair_boy_fade', hairColor: 'black', eyes: 'eyes_friendly', eyeColor: 'dark_brown',
      eyebrows: 'brows_thick', nose: 'nose_medium', mouth: 'mouth_smile', freckles: 'none',
      facialHair: 'none', facialHairColor: 'black',
      top: 'top_tshirt', topColor: 'blue', bottom: 'bottom_jeans', bottomColor: 'denim',
      dress: 'none', dressColor: 'purple', shoes: 'shoes_sneakers', shoeColor: 'white',
      headwear: 'none', headwearColor: 'red', glasses: 'none', glassesColor: 'black',
      accessory: 'none', accessoryColor: 'gold', specialItem: 'none', rotation: 'front', zoom: 1
    },
    girl: {
      style: 'girl', body: 'regular', skin: 'skin_03', face: 'face_oval',
      hair: 'hair_girl_wavy', hairColor: 'dark_brown', eyes: 'eyes_bright', eyeColor: 'brown',
      eyebrows: 'brows_curved', nose: 'nose_small', mouth: 'mouth_smile', freckles: 'none',
      facialHair: 'none', facialHairColor: 'dark_brown',
      top: 'top_casual', topColor: 'purple', bottom: 'bottom_jeans', bottomColor: 'denim',
      dress: 'none', dressColor: 'pink', shoes: 'shoes_sneakers', shoeColor: 'white',
      headwear: 'none', headwearColor: 'purple', glasses: 'none', glassesColor: 'black',
      accessory: 'acc_earrings', accessoryColor: 'gold', specialItem: 'none', rotation: 'front', zoom: 1
    }
  };

  let idCounter = 1;
  function getUid(prefix = 'av') {
    return `${prefix}_${Date.now()}_${idCounter++}`;
  }

  /**
   * 3. Anatomical Skeleton Anchor System
   * ViewBox: 0 0 320 420 (Center X = 160)
   */
  function getBodyMetrics(prop = 'regular') {
    let shoulderW = 68;
    let chestW = 58;
    let waistW = 48;
    let hipW = 54;
    let legW = 20;
    let legH = 120;
    let armW = 15;
    let armL = 100;
    let shoulderY = 166;
    let hipY = 246;

    if (prop === 'slim') {
      shoulderW = 60; chestW = 50; waistW = 42; hipW = 48; legW = 17; armW = 13;
    } else if (prop === 'athletic') {
      shoulderW = 76; chestW = 66; waistW = 52; hipW = 56; legW = 22; armW = 17;
    } else if (prop === 'soft') {
      shoulderW = 66; chestW = 62; waistW = 58; hipW = 60; legW = 22; armW = 16;
    } else if (prop === 'tall') {
      shoulderW = 68; chestW = 58; waistW = 48; hipW = 54; legH = 130; armL = 108; shoulderY = 162; hipY = 242;
    } else if (prop === 'short') {
      shoulderW = 64; chestW = 56; waistW = 48; hipW = 52; legH = 106; armL = 90; shoulderY = 170; hipY = 248;
    }

    const neckBaseY = 154;
    const neckL = 149;
    const neckR = 171;
    const clavicleY = 160;

    const shoulderL_X = 160 - shoulderW / 2;
    const shoulderR_X = 160 + shoulderW / 2;
    const shoulderL_Y = shoulderY + 4;
    const shoulderR_Y = shoulderY + 4;

    const chestL_X = 160 - chestW / 2;
    const chestR_X = 160 + chestW / 2;
    const chestY = shoulderY + 28;

    const waistL_X = 160 - waistW / 2;
    const waistR_X = 160 + waistW / 2;
    const waistY = shoulderY + 54;

    const hipL_X = 160 - hipW / 2;
    const hipR_X = 160 + hipW / 2;

    const ankleY = hipY + legH;
    const shoeY = ankleY - 2;
    const soleY = ankleY + 20;

    const leftLegX = Math.round(160 - hipW / 2 + 3);
    const rightLegX = Math.round(160 + hipW / 2 - legW - 3);

    const leftArmX = Math.round(shoulderL_X - armW / 2 + 1);
    const rightArmX = Math.round(shoulderR_X - armW / 2 - 1);
    const handY = shoulderY + armL;

    return {
      prop, shoulderW, chestW, waistW, hipW, legW, legH, armW, armL,
      shoulderY, hipY, neckBaseY, neckL, neckR, clavicleY,
      shoulderL_X, shoulderR_X, shoulderL_Y, shoulderR_Y,
      chestL_X, chestR_X, chestY, waistL_X, waistR_X, waistY,
      hipL_X, hipR_X, ankleY, shoeY, soleY, leftLegX, rightLegX,
      leftArmX, rightArmX, handY
    };
  }

  // 4. SVG Layer Builders (Strict Layer Hierarchy)
  const Layers = {
    // 3D Soft Ground Radial Shadow
    groundShadow(uid, m) {
      return `
        <ellipse cx="160" cy="${m.soleY + 4}" rx="${Math.round(m.shoulderW * 0.95)}" ry="12" fill="url(#${uid}_groundShadow)" opacity="0.5" />
      `;
    },

    // Back layer: Backpacks, capes, wings behind torso
    backAccessories(cfg, uid, colors, m) {
      const acc = cfg.accessory || 'none';
      const c = colors.accessory || colors.top;
      if (acc === 'acc_backpack' || acc === 'acc_slingbag') {
        return `
          <g id="${uid}_back_acc">
            <rect x="${m.shoulderL_X - 6}" y="${m.shoulderY - 2}" width="${m.shoulderW + 12}" height="${m.waistY - m.shoulderY + 20}" rx="12" fill="${c.shadow}" filter="url(#${uid}_dropShadow)" />
            <rect x="${m.shoulderL_X - 2}" y="${m.shoulderY + 4}" width="${m.shoulderW + 4}" height="${m.waistY - m.shoulderY + 10}" rx="8" fill="${c.main}" />
            <path d="M 148 ${m.shoulderY - 10} Q 160 ${m.shoulderY - 18} 172 ${m.shoulderY - 10}" stroke="${c.shadow}" stroke-width="4.5" fill="none" />
          </g>
        `;
      }
      return '';
    },

    // Anatomical Base Body (Legs, Torso, Arms, Hands, Neck)
    body(cfg, uid, colors, m) {
      const skin = colors.skin;

      return `
        <!-- Legs & Knees -->
        <g id="${uid}_legs" class="avatar-part-legs">
          <rect x="${m.leftLegX}" y="${m.hipY}" width="${m.legW}" height="${m.legH}" rx="${Math.round(m.legW * 0.45)}" fill="url(#${uid}_skinGrad)" filter="url(#${uid}_dropShadow)" />
          <ellipse cx="${m.leftLegX + m.legW/2}" cy="${m.hipY + Math.round(m.legH * 0.48)}" rx="${m.legW/2 - 3}" ry="5" fill="${skin.highlight}" opacity="0.3" />

          <rect x="${m.rightLegX}" y="${m.hipY}" width="${m.legW}" height="${m.legH}" rx="${Math.round(m.legW * 0.45)}" fill="url(#${uid}_skinGrad)" filter="url(#${uid}_dropShadow)" />
          <ellipse cx="${m.rightLegX + m.legW/2}" cy="${m.hipY + Math.round(m.legH * 0.48)}" rx="${m.legW/2 - 3}" ry="5" fill="${skin.highlight}" opacity="0.3" />
        </g>

        <!-- Torso Base -->
        <g id="${uid}_torso_base">
          <path d="M ${m.neckL} ${m.neckBaseY} 
                   Q 160 ${m.clavicleY} ${m.neckR} ${m.neckBaseY} 
                   Q ${m.shoulderR_X} ${m.shoulderR_Y - 3} ${m.shoulderR_X} ${m.shoulderR_Y}
                   L ${m.chestR_X} ${m.chestY}
                   L ${m.waistR_X} ${m.waistY}
                   L ${m.hipR_X} ${m.hipY + 6}
                   L ${m.hipL_X} ${m.hipY + 6}
                   L ${m.waistL_X} ${m.waistY}
                   L ${m.chestL_X} ${m.chestY}
                   L ${m.shoulderL_X} ${m.shoulderL_Y}
                   Q ${m.shoulderL_X} ${m.shoulderL_Y - 3} ${m.neckL} ${m.neckBaseY} Z" 
                fill="url(#${uid}_skinGrad)" filter="url(#${uid}_dropShadow)" />
        </g>

        <!-- Arms & Hands -->
        <g id="${uid}_arms" class="avatar-part-arms">
          <!-- Left Arm -->
          <path d="M ${m.shoulderL_X} ${m.shoulderL_Y} 
                   Q ${m.shoulderL_X - 10} ${m.shoulderY + Math.round(m.armL * 0.45)} ${m.leftArmX - 4} ${m.handY - 14}
                   Q ${m.leftArmX - 2} ${m.handY} ${m.leftArmX + m.armW/2} ${m.handY - 4}
                   Q ${m.leftArmX + m.armW} ${m.shoulderY + Math.round(m.armL * 0.45)} ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 4} Z" 
                fill="url(#${uid}_skinGrad)" />
          <circle cx="${m.leftArmX - 1}" cy="${m.handY}" r="${Math.round(m.armW * 0.62)}" fill="url(#${uid}_skinGrad)" />

          <!-- Right Arm -->
          <path d="M ${m.shoulderR_X} ${m.shoulderR_Y} 
                   Q ${m.shoulderR_X + 10} ${m.shoulderY + Math.round(m.armL * 0.45)} ${m.rightArmX + m.armW + 4} ${m.handY - 14}
                   Q ${m.rightArmX + m.armW + 2} ${m.handY} ${m.rightArmX + m.armW/2} ${m.handY - 4}
                   Q ${m.rightArmX} ${m.shoulderY + Math.round(m.armL * 0.45)} ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 4} Z" 
                fill="url(#${uid}_skinGrad)" />
          <circle cx="${m.rightArmX + m.armW + 1}" cy="${m.handY}" r="${Math.round(m.armW * 0.62)}" fill="url(#${uid}_skinGrad)" />
        </g>

        <!-- Neck -->
        <g id="${uid}_neck">
          <path d="M 149 130 L 171 130 L 173 ${m.neckBaseY + 4} L 147 ${m.neckBaseY + 4} Z" fill="url(#${uid}_skinShadowGrad)" />
          <ellipse cx="160" cy="${m.neckBaseY}" rx="12" ry="4.5" fill="${skin.shadow}" opacity="0.35" />
        </g>
      `;
    },

    // Realistic Head & Face Shapes + Freckles & Marks
    face(cfg, uid, colors) {
      const shape = cfg.face || 'face_round';
      const skin = colors.skin;

      let facePath = 'M 120 94 C 120 48, 200 48, 200 94 C 200 138, 182 164, 160 164 C 138 164, 120 138, 120 94 Z';

      if (shape === 'face_oval') {
        facePath = 'M 122 94 C 122 45, 198 45, 198 94 C 198 140, 178 168, 160 168 C 142 168, 122 140, 122 94 Z';
      } else if (shape === 'face_square') {
        facePath = 'M 119 90 C 119 50, 201 50, 201 90 C 201 135, 192 162, 160 162 C 128 162, 119 135, 119 90 Z';
      } else if (shape === 'face_soft') {
        facePath = 'M 121 94 C 121 46, 199 46, 199 94 C 199 138, 180 163, 160 163 C 140 163, 121 138, 121 94 Z';
      } else if (shape === 'face_long') {
        facePath = 'M 123 92 C 123 42, 197 42, 197 92 C 197 144, 176 172, 160 172 C 144 172, 123 144, 123 92 Z';
      } else if (shape === 'face_wide') {
        facePath = 'M 116 94 C 116 50, 204 50, 204 94 C 204 136, 186 162, 160 162 C 134 162, 116 136, 116 94 Z';
      } else if (shape === 'face_heart') {
        facePath = 'M 118 90 C 118 45, 202 45, 202 90 C 202 134, 175 167, 160 167 C 145 167, 118 134, 118 90 Z';
      } else if (shape === 'face_diamond' || shape === 'face_chiseled') {
        facePath = 'M 117 96 C 117 50, 203 50, 203 96 C 203 130, 180 166, 160 166 C 140 166, 117 130, 117 96 Z';
      }

      // Freckles / Beauty Marks
      let frecklesSvg = '';
      const marks = cfg.freckles || 'none';
      if (marks === 'freckles_light' || marks === 'freckles_cheeks') {
        frecklesSvg = `
          <g id="${uid}_freckles" opacity="0.65">
            <circle cx="136" cy="116" r="1" fill="${skin.shadow}" />
            <circle cx="139" cy="118" r="1.2" fill="${skin.shadow}" />
            <circle cx="143" cy="117" r="0.9" fill="${skin.shadow}" />
            <circle cx="135" cy="120" r="1" fill="${skin.shadow}" />
            <circle cx="177" cy="117" r="0.9" fill="${skin.shadow}" />
            <circle cx="181" cy="118" r="1.2" fill="${skin.shadow}" />
            <circle cx="184" cy="116" r="1" fill="${skin.shadow}" />
            <circle cx="185" cy="120" r="1" fill="${skin.shadow}" />
            <circle cx="158" cy="117" r="0.9" fill="${skin.shadow}" />
            <circle cx="162" cy="117" r="0.9" fill="${skin.shadow}" />
          </g>
        `;
      } else if (marks === 'beauty_spot_left') {
        frecklesSvg = `<circle cx="140" cy="124" r="1.8" fill="${skin.shadow}" opacity="0.85" />`;
      } else if (marks === 'beauty_spot_right') {
        frecklesSvg = `<circle cx="180" cy="124" r="1.8" fill="${skin.shadow}" opacity="0.85" />`;
      } else if (marks === 'dimples') {
        frecklesSvg = `
          <path d="M 134 128 Q 133 133 136 137" stroke="${skin.shadow}" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.6" />
          <path d="M 186 128 Q 187 133 184 137" stroke="${skin.shadow}" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.6" />
        `;
      }

      return `
        <!-- Ears -->
        <g id="${uid}_ears">
          <ellipse cx="119" cy="106" rx="7" ry="12" fill="url(#${uid}_skinShadowGrad)" />
          <ellipse cx="119" cy="106" rx="3.5" ry="6" fill="${skin.shadow}" opacity="0.4" />
          <ellipse cx="201" cy="106" rx="7" ry="12" fill="url(#${uid}_skinShadowGrad)" />
          <ellipse cx="201" cy="106" rx="3.5" ry="6" fill="${skin.shadow}" opacity="0.4" />
        </g>

        <!-- Main Head Shape -->
        <path d="${facePath}" fill="url(#${uid}_skinGrad)" filter="url(#${uid}_faceGlow)" />

        <!-- Soft 3D Cheek Accents -->
        <ellipse cx="134" cy="118" rx="10" ry="5" fill="#ff7675" opacity="0.16" filter="blur(2px)" />
        <ellipse cx="186" cy="118" rx="10" ry="5" fill="#ff7675" opacity="0.16" filter="blur(2px)" />

        ${frecklesSvg}
      `;
    },

    // Eyes with Specular Highlights & Depth
    eyes(cfg, uid, colors) {
      const eyeStyle = cfg.eyes || 'eyes_friendly';
      const irisColor = colors.eyeColor || '#2d1810';

      let lEye = { cx: 142, cy: 102, r: 7.5 };
      let rEye = { cx: 178, cy: 102, r: 7.5 };

      if (eyeStyle === 'eyes_large' || eyeStyle === 'eyes_cartoon') {
        lEye.r = 9; rEye.r = 9;
      } else if (eyeStyle === 'eyes_small' || eyeStyle === 'eyes_focused') {
        lEye.r = 6; rEye.r = 6;
      } else if (eyeStyle === 'eyes_cateye') {
        lEye.r = 7.2; rEye.r = 7.2;
      }

      return `
        <g id="${uid}_eyes" class="avatar-part-eyes">
          <!-- Eye Sclera -->
          <ellipse cx="${lEye.cx}" cy="${lEye.cy}" rx="${lEye.r + 2}" ry="${lEye.r}" fill="#ffffff" />
          <ellipse cx="${rEye.cx}" cy="${rEye.cy}" rx="${rEye.r + 2}" ry="${rEye.r}" fill="#ffffff" />

          <!-- Irises -->
          <circle cx="${lEye.cx + 0.5}" cy="${lEye.cy}" r="${lEye.r - 2}" fill="${irisColor}" />
          <circle cx="${rEye.cx - 0.5}" cy="${rEye.cy}" r="${rEye.r - 2}" fill="${irisColor}" />

          <!-- Pupils -->
          <circle cx="${lEye.cx + 0.5}" cy="${lEye.cy}" r="${Math.max(2, lEye.r - 3.8)}" fill="#0b0c10" />
          <circle cx="${rEye.cx - 0.5}" cy="${rEye.cy}" r="${Math.max(2, rEye.r - 3.8)}" fill="#0b0c10" />

          <!-- Specular 3D Highlights -->
          <circle cx="${lEye.cx - 1.5}" cy="${lEye.cy - 2}" r="1.8" fill="#ffffff" />
          <circle cx="${lEye.cx + 1.8}" cy="${lEye.cy + 1.2}" r="0.9" fill="#ffffff" opacity="0.8" />
          
          <circle cx="${rEye.cx - 2}" cy="${rEye.cy - 2}" r="1.8" fill="#ffffff" />
          <circle cx="${rEye.cx + 1.2}" cy="${rEye.cy + 1.2}" r="0.9" fill="#ffffff" opacity="0.8" />

          <!-- Upper Eyelid / Lash Line -->
          <path d="M ${lEye.cx - lEye.r - 2} ${lEye.cy - 1} Q ${lEye.cx} ${lEye.cy - lEye.r - 1.5} ${lEye.cx + lEye.r + 2} ${lEye.cy - 1}" stroke="#1e272e" stroke-width="2.2" stroke-linecap="round" fill="none" />
          <path d="M ${rEye.cx - rEye.r - 2} ${rEye.cy - 1} Q ${rEye.cx} ${rEye.cy - rEye.r - 1.5} ${rEye.cx + rEye.r + 2} ${rEye.cy - 1}" stroke="#1e272e" stroke-width="2.2" stroke-linecap="round" fill="none" />
        </g>
      `;
    },

    // Eyebrows
    eyebrows(cfg, uid, colors) {
      const style = cfg.eyebrows || 'brows_natural';
      const hairColor = colors.hair.shadow;
      let sw = 3.0;

      let lD = 'M 132 89 Q 142 84 151 88';
      let rD = 'M 169 88 Q 178 84 188 89';

      if (style === 'brows_straight') {
        lD = 'M 132 88 L 151 88'; rD = 'M 169 88 L 188 88';
      } else if (style === 'brows_curved') {
        lD = 'M 132 91 Q 141 82 151 89'; rD = 'M 169 89 Q 179 82 188 91';
      } else if (style === 'brows_thick' || style === 'brows_bushy') {
        sw = 4.4; lD = 'M 132 88 Q 142 83 152 87'; rD = 'M 168 87 Q 178 83 188 88';
      } else if (style === 'brows_thin') {
        sw = 1.8; lD = 'M 133 88 Q 142 85 150 88'; rD = 'M 170 88 Q 178 85 187 88';
      } else if (style === 'brows_raised') {
        lD = 'M 132 85 Q 142 80 151 86'; rD = 'M 169 86 Q 178 80 188 85';
      } else if (style === 'brows_arched') {
        sw = 2.4; lD = 'M 132 90 Q 140 81 151 87'; rD = 'M 169 87 Q 180 81 188 90';
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

      if (style === 'nose_small' || style === 'nose_button') {
        return `
          <path d="M 158 112 Q 160 117 163 117 Q 165 117 165 115" stroke="${skinShadow}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75" />
        `;
      } else if (style === 'nose_wide') {
        return `
          <path d="M 155 116 Q 160 119 165 116" stroke="${skinShadow}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.8" />
        `;
      } else if (style === 'nose_straight' || style === 'nose_aquiline') {
        return `
          <path d="M 160 104 L 159 116 L 163 117" stroke="${skinShadow}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.75" />
        `;
      } else if (style === 'nose_rounded') {
        return `
          <ellipse cx="160" cy="116" rx="4" ry="3" fill="${skinShadow}" opacity="0.3" />
          <path d="M 156 116 Q 160 119 164 116" stroke="${skinShadow}" stroke-width="2" stroke-linecap="round" fill="none" />
        `;
      }

      // Default medium
      return `
        <path d="M 159 107 L 158 116 Q 160 118 163 117" stroke="${skinShadow}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.8" />
      `;
    },

    // Mouth
    mouth(cfg, uid) {
      const style = cfg.mouth || 'mouth_smile';

      if (style === 'mouth_big_smile' || style === 'mouth_laugh' || style === 'mouth_grin') {
        return `
          <g id="${uid}_mouth">
            <path d="M 148 131 Q 160 148 172 131 Z" fill="#c0392b" />
            <path d="M 150 131 Q 160 138 170 131 Z" fill="#ffffff" />
            <path d="M 146 131 Q 160 149 174 131" stroke="#801010" stroke-width="2.2" stroke-linecap="round" fill="none" />
          </g>
        `;
      } else if (style === 'mouth_small_smile') {
        return `
          <path d="M 153 133 Q 160 138 167 133" stroke="#801010" stroke-width="2.2" stroke-linecap="round" fill="none" />
        `;
      } else if (style === 'mouth_neutral') {
        return `
          <path d="M 152 133 L 168 133" stroke="#801010" stroke-width="2.2" stroke-linecap="round" fill="none" />
        `;
      } else if (style === 'mouth_confident' || style === 'mouth_smirk') {
        return `
          <path d="M 149 134 Q 158 137 171 130" stroke="#801010" stroke-width="2.4" stroke-linecap="round" fill="none" />
        `;
      }

      // Default smile
      return `
        <g id="${uid}_mouth">
          <path d="M 148 131 Q 160 142 172 131" stroke="#801010" stroke-width="2.4" stroke-linecap="round" fill="none" />
        </g>
      `;
    },

    // Facial Hair
    facialHair(cfg, uid, colors) {
      const style = cfg.facialHair || 'none';
      if (style === 'none') return '';
      const color = (colors.facialHair || colors.hair).shadow;

      if (style === 'mustache') {
        return `
          <path d="M 150 127 Q 160 130 170 127 Q 165 124 160 125 Q 155 124 150 127 Z" fill="${color}" filter="url(#${uid}_dropShadow)" />
        `;
      } else if (style === 'mustache_handlebar') {
        return `
          <path d="M 144 125 Q 152 127 160 125 Q 168 127 176 125 Q 180 122 178 127 Q 168 132 160 127 Q 152 132 142 127 Z" fill="${color}" filter="url(#${uid}_dropShadow)" />
        `;
      } else if (style === 'goatee' || style === 'vandyke') {
        return `
          <path d="M 150 127 Q 160 130 170 127 Q 165 124 160 125 Q 155 124 150 127 Z" fill="${color}" />
          <ellipse cx="160" cy="148" rx="6" ry="8" fill="${color}" />
        `;
      } else if (style === 'light_beard' || style === 'short_beard' || style === 'stubble') {
        return `
          <path d="M 134 118 C 134 156, 186 156, 186 118 C 180 152, 140 152, 134 118 Z" fill="${color}" opacity="0.55" />
          <path d="M 151 127 Q 160 130 169 127" stroke="${color}" stroke-width="2.2" fill="none" />
        `;
      } else if (style === 'full_beard' || style === 'lumberjack') {
        return `
          <path d="M 126 114 C 124 168, 196 168, 194 114 C 185 158, 135 158, 126 114 Z" fill="${color}" filter="url(#${uid}_dropShadow)" />
          <path d="M 149 127 Q 160 131 171 127" stroke="${color}" stroke-width="3" stroke-linecap="round" fill="none" />
        `;
      } else if (style === 'soul_patch') {
        return `
          <polygon points="158,138 162,138 160,146" fill="${color}" />
        `;
      }
      return '';
    },

    // Complete Hairstyle Suite
    hair(cfg, uid, colors) {
      const hairStyle = cfg.hair || 'hair_boy_fade';
      if (hairStyle === 'none') return '';

      // Long / Girls / Flowing styles
      if (hairStyle === 'hair_girl_straight') {
        return `
          <g id="${uid}_hair">
            <path d="M 116 88 C 110 145, 112 230, 120 260 L 136 260 C 126 205, 128 135, 128 88 Z" fill="url(#${uid}_hairShadowGrad)" />
            <path d="M 204 88 C 210 145, 208 230, 200 260 L 184 260 C 194 205, 192 135, 192 88 Z" fill="url(#${uid}_hairShadowGrad)" />
            <path d="M 116 92 C 116 42, 204 42, 204 92 C 196 64, 175 58, 160 66 C 145 58, 124 64, 116 92 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      } else if (hairStyle === 'hair_girl_wavy' || hairStyle === 'hair_girl_wavymedium') {
        return `
          <g id="${uid}_hair">
            <path d="M 115 88 Q 102 150 122 210 Q 102 250 124 270 L 136 265 Q 118 210 128 88 Z" fill="url(#${uid}_hairShadowGrad)" />
            <path d="M 205 88 Q 218 150 198 210 Q 218 250 196 270 L 184 265 Q 202 210 192 88 Z" fill="url(#${uid}_hairShadowGrad)" />
            <path d="M 115 92 C 115 40, 205 40, 205 92 C 198 62, 176 56, 160 64 C 144 56, 122 62, 115 92 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      } else if (hairStyle === 'hair_girl_curly') {
        return `
          <g id="${uid}_hair">
            <circle cx="118" cy="74" r="14" fill="url(#${uid}_hairGrad)" />
            <circle cx="134" cy="56" r="16" fill="url(#${uid}_hairGrad)" />
            <circle cx="160" cy="50" r="17" fill="url(#${uid}_hairGrad)" />
            <circle cx="186" cy="56" r="16" fill="url(#${uid}_hairGrad)" />
            <circle cx="202" cy="74" r="14" fill="url(#${uid}_hairGrad)" />
            <circle cx="114" cy="98" r="13" fill="url(#${uid}_hairGrad)" />
            <circle cx="206" cy="98" r="13" fill="url(#${uid}_hairGrad)" />
            <circle cx="116" cy="120" r="12" fill="url(#${uid}_hairGrad)" />
            <circle cx="204" cy="120" r="12" fill="url(#${uid}_hairGrad)" />
            <path d="M 122 84 C 125 54, 195 54, 198 84 C 188 70, 132 70, 122 84 Z" fill="url(#${uid}_hairGrad)" />
          </g>
        `;
      } else if (hairStyle === 'hair_girl_ponytail' || hairStyle === 'hair_girl_highpony') {
        return `
          <g id="${uid}_hair">
            <path d="M 192 64 Q 228 60 230 105 Q 232 150 210 185 Q 220 140 210 105 Q 200 82 192 64 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
            <ellipse cx="195" cy="66" rx="7" ry="5" fill="#e84393" />
            <path d="M 118 92 C 118 42, 202 42, 202 92 C 195 64, 175 60, 160 66 C 145 60, 125 64, 118 92 Z" fill="url(#${uid}_hairGrad)" />
          </g>
        `;
      } else if (hairStyle === 'hair_girl_bun' || hairStyle === 'hair_girl_topbun') {
        return `
          <g id="${uid}_hair">
            <circle cx="160" cy="38" r="20" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
            <path d="M 118 92 C 118 44, 202 44, 202 92 C 195 66, 175 62, 160 68 C 145 62, 125 66, 118 92 Z" fill="url(#${uid}_hairGrad)" />
          </g>
        `;
      } else if (hairStyle === 'hair_girl_doublebun') {
        return `
          <g id="${uid}_hair">
            <circle cx="132" cy="40" r="16" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
            <circle cx="188" cy="40" r="16" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
            <path d="M 118 92 C 118 44, 202 44, 202 92 C 195 66, 175 62, 160 68 C 145 62, 125 66, 118 92 Z" fill="url(#${uid}_hairGrad)" />
          </g>
        `;
      } else if (hairStyle === 'hair_girl_bob') {
        return `
          <g id="${uid}_hair">
            <path d="M 114 88 C 111 130, 116 168, 128 168 C 120 135, 124 78, 124 78 Z" fill="url(#${uid}_hairShadowGrad)" />
            <path d="M 206 88 C 209 130, 204 168, 192 168 C 200 135, 196 78, 196 78 Z" fill="url(#${uid}_hairShadowGrad)" />
            <path d="M 114 92 C 114 42, 206 42, 206 92 C 198 66, 178 60, 160 66 C 142 60, 122 66, 114 92 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      } else if (hairStyle === 'hair_girl_braids' || hairStyle === 'hair_girl_sidebraid') {
        return `
          <g id="${uid}_hair">
            <path d="M 118 95 Q 106 160 118 225 Q 116 240 120 250 L 128 247 Q 118 160 126 95 Z" fill="url(#${uid}_hairShadowGrad)" />
            <path d="M 202 95 Q 214 160 202 225 Q 204 240 200 250 L 192 247 Q 202 160 194 95 Z" fill="url(#${uid}_hairShadowGrad)" />
            <path d="M 116 92 C 116 42, 204 42, 204 92 C 196 65, 175 60, 160 66 C 145 60, 124 65, 116 92 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      } else if (hairStyle === 'hair_girl_pixie') {
        return `
          <g id="${uid}_hair">
            <path d="M 117 92 C 117 48, 203 48, 203 92 C 194 66, 170 56, 146 64 C 132 70, 120 80, 117 92 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      }

      // Boy / Short / Modern Styles
      if (hairStyle === 'hair_boy_fade' || hairStyle === 'hair_boy_undercut') {
        return `
          <g id="${uid}_hair">
            <path d="M 118 98 C 118 76, 124 64, 134 60 L 134 100 Z" fill="url(#${uid}_hairShadowGrad)" opacity="0.65" />
            <path d="M 202 98 C 202 76, 196 64, 186 60 L 186 100 Z" fill="url(#${uid}_hairShadowGrad)" opacity="0.65" />
            <path d="M 126 70 C 126 38, 194 38, 194 70 C 184 54, 172 50, 160 54 C 148 50, 136 54, 126 70 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      } else if (hairStyle === 'hair_boy_sidepart') {
        return `
          <g id="${uid}_hair">
            <path d="M 116 92 C 116 42, 204 42, 204 92 C 192 60, 164 50, 136 65 C 126 71, 118 80, 116 92 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
            <line x1="136" y1="65" x2="134" y2="88" stroke="${colors.hair.shadow}" stroke-width="1.8" />
          </g>
        `;
      } else if (hairStyle === 'hair_boy_crew' || hairStyle === 'hair_boy_buzz') {
        return `
          <g id="${uid}_hair">
            <path d="M 118 90 C 118 46, 202 46, 202 90 C 196 68, 178 60, 160 62 C 142 60, 124 68, 118 90 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      } else if (hairStyle === 'hair_boy_curly') {
        return `
          <g id="${uid}_hair">
            <circle cx="124" cy="62" r="13" fill="url(#${uid}_hairGrad)" />
            <circle cx="144" cy="50" r="15" fill="url(#${uid}_hairGrad)" />
            <circle cx="168" cy="48" r="15" fill="url(#${uid}_hairGrad)" />
            <circle cx="190" cy="58" r="13" fill="url(#${uid}_hairGrad)" />
            <circle cx="118" cy="78" r="11" fill="url(#${uid}_hairGrad)" />
            <circle cx="200" cy="78" r="11" fill="url(#${uid}_hairGrad)" />
            <path d="M 122 84 C 125 56, 195 56, 198 84 C 188 68, 132 68, 122 84 Z" fill="url(#${uid}_hairGrad)" />
          </g>
        `;
      } else if (hairStyle === 'hair_boy_spiky' || hairStyle === 'hair_anime_spikes') {
        return `
          <g id="${uid}_hair">
            <path d="M 118 88 L 126 54 L 136 66 L 148 44 L 160 63 L 172 44 L 184 66 L 194 54 L 202 88 C 192 66, 128 66, 118 88 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      } else if (hairStyle === 'hair_boy_messy' || hairStyle === 'hair_boy_wavy') {
        return `
          <g id="${uid}_hair">
            <path d="M 116 90 Q 124 44 142 54 Q 160 38 178 54 Q 196 44 204 90 C 195 66, 178 63, 160 66 C 142 63, 125 66, 116 90 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      } else if (hairStyle === 'hair_boy_quiff') {
        return `
          <g id="${uid}_hair">
            <path d="M 118 90 C 118 55, 140 38, 170 38 C 195 38, 202 60, 202 90 C 195 68, 175 62, 160 64 C 142 62, 124 68, 118 90 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
          </g>
        `;
      } else if (hairStyle === 'hair_afro') {
        return `
          <g id="${uid}_hair">
            <circle cx="160" cy="74" r="48" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
            <path d="M 120 90 C 120 54, 200 54, 200 90 Z" fill="url(#${uid}_hairGrad)" />
          </g>
        `;
      }

      // Default classic short
      return `
        <g id="${uid}_hair">
          <path d="M 117 92 C 117 45, 203 45, 203 92 C 196 66, 178 58, 160 60 C 142 58, 124 66, 117 92 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
        </g>
      `;
    },

    // 5. Tops & Shirts (Torso fitting)
    top(cfg, uid, colors, m) {
      if (cfg.dress && cfg.dress !== 'none') return '';

      const style = cfg.top || 'top_tshirt';
      if (style === 'none') return '';

      const c = colors.top;
      const shadow = c.shadow;

      if (style === 'top_hoodie') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <path d="M ${m.neckL - 2} ${m.neckBaseY - 2}
                     Q 160 ${m.clavicleY + 6} ${m.neckR + 2} ${m.neckBaseY - 2}
                     Q ${m.shoulderR_X + 2} ${m.shoulderR_Y - 2} ${m.shoulderR_X + 2} ${m.shoulderR_Y + 2}
                     L ${m.chestR_X + 2} ${m.chestY}
                     L ${m.waistR_X + 2} ${m.waistY}
                     L ${m.hipR_X + 2} ${m.hipY + 5}
                     L ${m.hipL_X - 2} ${m.hipY + 5}
                     L ${m.waistL_X - 2} ${m.waistY}
                     L ${m.chestL_X - 2} ${m.chestY}
                     L ${m.shoulderL_X - 2} ${m.shoulderL_Y + 2}
                     Q ${m.shoulderL_X - 2} ${m.shoulderL_Y - 2} ${m.neckL - 2} ${m.neckBaseY - 2} Z"
                  fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            
            <path d="M ${m.neckL - 4} ${m.neckBaseY - 4} C ${m.neckL - 4} ${m.neckBaseY - 18}, ${m.neckR + 4} ${m.neckBaseY - 18}, ${m.neckR + 4} ${m.neckBaseY - 4} Q 160 ${m.neckBaseY + 18} ${m.neckL - 4} ${m.neckBaseY - 4} Z" fill="${shadow}" />
            <line x1="154" y1="${m.neckBaseY + 8}" x2="154" y2="${m.neckBaseY + 30}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
            <line x1="166" y1="${m.neckBaseY + 8}" x2="166" y2="${m.neckBaseY + 30}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
            <path d="M ${m.waistL_X + 6} ${m.waistY - 4} L ${m.waistR_X - 6} ${m.waistY - 4} L ${m.hipR_X - 2} ${m.hipY + 2} L ${m.hipL_X + 2} ${m.hipY + 2} Z" fill="${shadow}" opacity="0.35" />

            <path d="M ${m.shoulderL_X - 2} ${m.shoulderL_Y + 2} L ${m.leftArmX - 5} ${m.handY - 14} L ${m.leftArmX + m.armW + 1} ${m.handY - 12} L ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 12} Z" fill="url(#${uid}_topGrad)" />
            <path d="M ${m.shoulderR_X + 2} ${m.shoulderR_Y + 2} L ${m.rightArmX + m.armW + 5} ${m.handY - 14} L ${m.rightArmX - 1} ${m.handY - 12} L ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 12} Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      } else if (style === 'top_jacket' || style === 'top_leather_jacket' || style === 'top_denim_jacket') {
        const lapelColor = style === 'top_leather_jacket' ? '#1b0000' : shadow;
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <path d="M ${m.neckL - 3} ${m.neckBaseY - 2}
                     Q 160 ${m.clavicleY + 8} ${m.neckR + 3} ${m.neckBaseY - 2}
                     Q ${m.shoulderR_X + 3} ${m.shoulderR_Y - 2} ${m.shoulderR_X + 3} ${m.shoulderR_Y + 2}
                     L ${m.chestR_X + 2} ${m.chestY}
                     L ${m.waistR_X + 2} ${m.waistY}
                     L ${m.hipR_X + 2} ${m.hipY + 5}
                     L ${m.hipL_X - 2} ${m.hipY + 5}
                     L ${m.waistL_X - 2} ${m.waistY}
                     L ${m.chestL_X - 2} ${m.chestY}
                     L ${m.shoulderL_X - 3} ${m.shoulderL_Y + 2}
                     Q ${m.shoulderL_X - 3} ${m.shoulderL_Y - 2} ${m.neckL - 3} ${m.neckBaseY - 2} Z"
                  fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            
            <path d="M ${m.neckL + 2} ${m.neckBaseY} L 160 ${m.clavicleY + 30} L ${m.neckR - 2} ${m.neckBaseY} Z" fill="#ffffff" />
            <line x1="160" y1="${m.clavicleY + 30}" x2="160" y2="${m.hipY + 5}" stroke="#ced6e0" stroke-width="2.5" />
            <path d="M ${m.neckL - 2} ${m.neckBaseY} L 150 ${m.clavicleY + 26} L 140 ${m.clavicleY + 12} Z" fill="${lapelColor}" />
            <path d="M ${m.neckR + 2} ${m.neckBaseY} L 170 ${m.clavicleY + 26} L 180 ${m.clavicleY + 12} Z" fill="${lapelColor}" />

            <path d="M ${m.shoulderL_X - 3} ${m.shoulderL_Y + 2} L ${m.leftArmX - 6} ${m.handY - 14} L ${m.leftArmX + m.armW + 1} ${m.handY - 12} L ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 12} Z" fill="url(#${uid}_topGrad)" />
            <path d="M ${m.shoulderR_X + 3} ${m.shoulderR_Y + 2} L ${m.rightArmX + m.armW + 6} ${m.handY - 14} L ${m.rightArmX - 1} ${m.handY - 12} L ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 12} Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      } else if (style === 'top_blazer') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <path d="M ${m.neckL - 2} ${m.neckBaseY} Q 160 ${m.clavicleY + 8} ${m.neckR + 2} ${m.neckBaseY} L ${m.shoulderR_X + 2} ${m.shoulderR_Y} L ${m.hipR_X + 2} ${m.hipY + 6} L ${m.hipL_X - 2} ${m.hipY + 6} L ${m.shoulderL_X - 2} ${m.shoulderL_Y} Z" fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Formal Shirt V & Tie -->
            <polygon points="152,${m.neckBaseY} 168,${m.neckBaseY} 160,${m.clavicleY + 28}" fill="#ffffff" />
            <polygon points="158,${m.clavicleY + 6} 162,${m.clavicleY + 6} 164,${m.clavicleY + 34} 160,${m.clavicleY + 40} 156,${m.clavicleY + 34}" fill="#c0392b" />
            <!-- Blazer Lapels -->
            <path d="M ${m.neckL} ${m.neckBaseY} L 152 ${m.clavicleY + 28} L 140 ${m.clavicleY + 16} Z" fill="${shadow}" />
            <path d="M ${m.neckR} ${m.neckBaseY} L 168 ${m.clavicleY + 28} L 180 ${m.clavicleY + 16} Z" fill="${shadow}" />
            <!-- Sleeves -->
            <path d="M ${m.shoulderL_X - 2} ${m.shoulderL_Y} L ${m.leftArmX - 5} ${m.handY - 14} L ${m.leftArmX + m.armW} ${m.handY - 12} L ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 10} Z" fill="url(#${uid}_topGrad)" />
            <path d="M ${m.shoulderR_X + 2} ${m.shoulderR_Y} L ${m.rightArmX + m.armW + 5} ${m.handY - 14} L ${m.rightArmX} ${m.handY - 12} L ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 10} Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      } else if (style === 'top_polo') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <path d="M ${m.neckL} ${m.neckBaseY} Q 160 ${m.clavicleY + 4} ${m.neckR} ${m.neckBaseY} L ${m.shoulderR_X} ${m.shoulderR_Y} L ${m.hipR_X} ${m.hipY + 3} L ${m.hipL_X} ${m.hipY + 3} L ${m.shoulderL_X} ${m.shoulderL_Y} Z" fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            <path d="M ${m.neckL} ${m.neckBaseY} L 160 ${m.clavicleY + 14} L 152 ${m.clavicleY + 14} Z" fill="${shadow}" />
            <path d="M ${m.neckR} ${m.neckBaseY} L 160 ${m.clavicleY + 14} L 168 ${m.clavicleY + 14} Z" fill="${shadow}" />
            <rect x="156" y="${m.clavicleY + 12}" width="8" height="20" fill="${shadow}" />
            <circle cx="160" cy="${m.clavicleY + 18}" r="1.5" fill="#ffffff" />
            <circle cx="160" cy="${m.clavicleY + 26}" r="1.5" fill="#ffffff" />
            <path d="M ${m.shoulderL_X} ${m.shoulderL_Y} L ${m.leftArmX - 5} ${m.shoulderY + 34} L ${m.leftArmX + m.armW + 1} ${m.shoulderY + 36} L ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 10} Z" fill="url(#${uid}_topGrad)" />
            <path d="M ${m.shoulderR_X} ${m.shoulderR_Y} L ${m.rightArmX + m.armW + 5} ${m.shoulderY + 34} L ${m.rightArmX - 1} ${m.shoulderY + 36} L ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 10} Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      } else if (style === 'top_shirt') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <path d="M ${m.neckL} ${m.neckBaseY} Q 160 ${m.clavicleY + 4} ${m.neckR} ${m.neckBaseY} L ${m.shoulderR_X} ${m.shoulderR_Y} L ${m.hipR_X} ${m.hipY + 4} L ${m.hipL_X} ${m.hipY + 4} L ${m.shoulderL_X} ${m.shoulderL_Y} Z" fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            <line x1="160" y1="${m.clavicleY + 4}" x2="160" y2="${m.hipY + 4}" stroke="${shadow}" stroke-width="2" />
            <circle cx="160" cy="${m.clavicleY + 16}" r="1.5" fill="#ffffff" />
            <circle cx="160" cy="${m.clavicleY + 30}" r="1.5" fill="#ffffff" />
            <circle cx="160" cy="${m.clavicleY + 44}" r="1.5" fill="#ffffff" />
            <path d="M ${m.neckL} ${m.neckBaseY} L 160 ${m.clavicleY + 12} L 152 ${m.clavicleY + 12} Z" fill="${shadow}" />
            <path d="M ${m.neckR} ${m.neckBaseY} L 160 ${m.clavicleY + 12} L 168 ${m.clavicleY + 12} Z" fill="${shadow}" />
            <path d="M ${m.shoulderL_X} ${m.shoulderL_Y} L ${m.leftArmX - 5} ${m.handY - 14} L ${m.leftArmX + m.armW + 1} ${m.handY - 12} L ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 12} Z" fill="url(#${uid}_topGrad)" />
            <path d="M ${m.shoulderR_X} ${m.shoulderR_Y} L ${m.rightArmX + m.armW + 5} ${m.handY - 14} L ${m.rightArmX - 1} ${m.handY - 12} L ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 12} Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      } else if (style === 'top_jersey') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <path d="M ${m.neckL + 3} ${m.neckBaseY} Q 160 ${m.clavicleY + 8} ${m.neckR - 3} ${m.neckBaseY} L ${m.shoulderR_X - 4} ${m.shoulderR_Y + 4} L ${m.hipR_X} ${m.hipY + 4} L ${m.hipL_X} ${m.hipY + 4} L ${m.shoulderL_X + 4} ${m.shoulderL_Y + 4} Z" fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            <path d="M ${m.neckL + 2} ${m.neckBaseY} L 160 ${m.clavicleY + 16} L ${m.neckR - 2} ${m.neckBaseY} Z" fill="${shadow}" opacity="0.35" />
            <text x="160" y="${m.shoulderY + 40}" text-anchor="middle" font-size="20" font-weight="900" fill="#ffffff" font-family="'Outfit', sans-serif" opacity="0.95">7</text>
          </g>
        `;
      } else if (style === 'top_printed') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <path d="M ${m.neckL} ${m.neckBaseY} Q 160 ${m.clavicleY + 5} ${m.neckR} ${m.neckBaseY} L ${m.shoulderR_X} ${m.shoulderR_Y} L ${m.hipR_X} ${m.hipY + 3} L ${m.hipL_X} ${m.hipY + 3} L ${m.shoulderL_X} ${m.shoulderL_Y} Z" fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Graphic Emblem -->
            <circle cx="160" cy="${m.shoulderY + 36}" r="12" fill="#ffffff" opacity="0.9" />
            <polygon points="160,${m.shoulderY + 28} 163,${m.shoulderY + 34} 170,${m.shoulderY + 35} 165,${m.shoulderY + 40} 166,${m.shoulderY + 47} 160,${m.shoulderY + 43} 154,${m.shoulderY + 47} 155,${m.shoulderY + 40} 150,${m.shoulderY + 35} 157,${m.shoulderY + 34}" fill="#f39c12" />
            <path d="M ${m.shoulderL_X} ${m.shoulderL_Y} L ${m.leftArmX - 5} ${m.shoulderY + 34} L ${m.leftArmX + m.armW + 1} ${m.shoulderY + 36} L ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 10} Z" fill="url(#${uid}_topGrad)" />
            <path d="M ${m.shoulderR_X} ${m.shoulderR_Y} L ${m.rightArmX + m.armW + 5} ${m.shoulderY + 34} L ${m.rightArmX - 1} ${m.shoulderY + 36} L ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 10} Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      }

      // Default T-Shirt / Casual Top
      return `
        <g id="${uid}_top" class="avatar-part-top">
          <path d="M ${m.neckL} ${m.neckBaseY} Q 160 ${m.clavicleY + 5} ${m.neckR} ${m.neckBaseY} L ${m.shoulderR_X} ${m.shoulderR_Y} L ${m.hipR_X} ${m.hipY + 3} L ${m.hipL_X} ${m.hipY + 3} L ${m.shoulderL_X} ${m.shoulderL_Y} Z" fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
          <path d="M ${m.neckL} ${m.neckBaseY} Q 160 ${m.clavicleY + 6} ${m.neckR} ${m.neckBaseY} Q 160 ${m.clavicleY - 1} ${m.neckL} ${m.neckBaseY} Z" fill="${shadow}" />
          <path d="M ${m.shoulderL_X} ${m.shoulderL_Y} L ${m.leftArmX - 5} ${m.shoulderY + 34} L ${m.leftArmX + m.armW + 1} ${m.shoulderY + 36} L ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 10} Z" fill="url(#${uid}_topGrad)" />
          <path d="M ${m.shoulderR_X} ${m.shoulderR_Y} L ${m.rightArmX + m.armW + 5} ${m.shoulderY + 34} L ${m.rightArmX - 1} ${m.shoulderY + 36} L ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 10} Z" fill="url(#${uid}_topGrad)" />
        </g>
      `;
    },

    // 6. Pants & Lower-body
    bottom(cfg, uid, colors, m) {
      if (cfg.dress && cfg.dress !== 'none') return '';

      const style = cfg.bottom || 'bottom_jeans';
      if (style === 'none') return '';

      const c = colors.bottom;
      const shadow = c.shadow;
      const crotchY = m.hipY + 22;

      if (style === 'bottom_shorts') {
        const shortsBottomY = m.hipY + Math.round(m.legH * 0.45);
        return `
          <g id="${uid}_bottom" class="avatar-part-bottom">
            <path d="M ${m.hipL_X - 1} ${m.hipY} L ${m.hipR_X + 1} ${m.hipY} L ${m.rightLegX + m.legW + 2} ${shortsBottomY} L ${m.rightLegX - 2} ${shortsBottomY} L 160 ${crotchY} L ${m.leftLegX + m.legW + 2} ${shortsBottomY} L ${m.leftLegX - 2} ${shortsBottomY} Z" fill="url(#${uid}_bottomGrad)" filter="url(#${uid}_dropShadow)" />
            <rect x="${m.hipL_X - 1}" y="${m.hipY - 1}" width="${m.hipW + 2}" height="7" fill="${shadow}" opacity="0.4" />
          </g>
        `;
      } else if (style === 'bottom_skirt') {
        const skirtBottomY = m.hipY + Math.round(m.legH * 0.54);
        return `
          <g id="${uid}_bottom" class="avatar-part-bottom">
            <path d="M ${m.hipL_X} ${m.hipY} L ${m.hipR_X} ${m.hipY} L ${m.hipR_X + 16} ${skirtBottomY} L ${m.hipL_X - 16} ${skirtBottomY} Z" fill="url(#${uid}_bottomGrad)" filter="url(#${uid}_dropShadow)" />
            <line x1="${160 - m.hipW/4}" y1="${m.hipY + 3}" x2="${160 - m.hipW/3 - 6}" y2="${skirtBottomY}" stroke="${shadow}" stroke-width="2" opacity="0.4" />
            <line x1="160" y1="${m.hipY + 3}" x2="160" y2="${skirtBottomY}" stroke="${shadow}" stroke-width="2" opacity="0.4" />
            <line x1="${160 + m.hipW/4}" y1="${m.hipY + 3}" x2="${160 + m.hipW/3 + 6}" y2="${skirtBottomY}" stroke="${shadow}" stroke-width="2" opacity="0.4" />
          </g>
        `;
      } else if (style === 'bottom_cargo') {
        return `
          <g id="${uid}_bottom" class="avatar-part-bottom">
            <path d="M ${m.hipL_X - 1} ${m.hipY} L ${m.hipR_X + 1} ${m.hipY} L ${m.rightLegX + m.legW + 2} ${m.ankleY + 2} L ${m.rightLegX - 2} ${m.ankleY + 2} L 160 ${crotchY} L ${m.leftLegX + m.legW + 2} ${m.ankleY + 2} L ${m.leftLegX - 2} ${m.ankleY + 2} Z" fill="url(#${uid}_bottomGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Cargo Side Pockets -->
            <rect x="${m.leftLegX - 5}" y="${m.hipY + 35}" width="8" height="14" rx="2" fill="${shadow}" />
            <rect x="${m.rightLegX + m.legW - 3}" y="${m.hipY + 35}" width="8" height="14" rx="2" fill="${shadow}" />
          </g>
        `;
      } else if (style === 'bottom_joggers' || style === 'bottom_trackpants') {
        return `
          <g id="${uid}_bottom" class="avatar-part-bottom">
            <path d="M ${m.hipL_X - 1} ${m.hipY} L ${m.hipR_X + 1} ${m.hipY} L ${m.rightLegX + m.legW + 2} ${m.ankleY - 2} L ${m.rightLegX - 2} ${m.ankleY - 2} L 160 ${crotchY} L ${m.leftLegX + m.legW + 2} ${m.ankleY - 2} L ${m.leftLegX - 2} ${m.ankleY - 2} Z" fill="url(#${uid}_bottomGrad)" filter="url(#${uid}_dropShadow)" />
            <circle cx="160" cy="${m.hipY + 5}" r="3" fill="#ffffff" />
            <line x1="158" y1="${m.hipY + 7}" x2="155" y2="${m.hipY + 16}" stroke="#ffffff" stroke-width="2" />
            <line x1="162" y1="${m.hipY + 7}" x2="165" y2="${m.hipY + 16}" stroke="#ffffff" stroke-width="2" />
            <!-- Athletic Side Stripes -->
            <line x1="${m.leftLegX - 1}" y1="${m.hipY + 5}" x2="${m.leftLegX - 1}" y2="${m.ankleY - 6}" stroke="#ffffff" stroke-width="2.5" opacity="0.8" />
            <line x1="${m.rightLegX + m.legW + 1}" y1="${m.hipY + 5}" x2="${m.rightLegX + m.legW + 1}" y2="${m.ankleY - 6}" stroke="#ffffff" stroke-width="2.5" opacity="0.8" />
            <rect x="${m.leftLegX - 2}" y="${m.ankleY - 6}" width="${m.legW + 4}" height="6" rx="2" fill="${shadow}" />
            <rect x="${m.rightLegX - 2}" y="${m.ankleY - 6}" width="${m.legW + 4}" height="6" rx="2" fill="${shadow}" />
          </g>
        `;
      }

      // Default Jeans / Chinos
      return `
        <g id="${uid}_bottom" class="avatar-part-bottom">
          <path d="M ${m.hipL_X - 1} ${m.hipY} L ${m.hipR_X + 1} ${m.hipY} L ${m.rightLegX + m.legW + 2} ${m.ankleY + 2} L ${m.rightLegX - 2} ${m.ankleY + 2} L 160 ${crotchY} L ${m.leftLegX + m.legW + 2} ${m.ankleY + 2} L ${m.leftLegX - 2} ${m.ankleY + 2} Z" fill="url(#${uid}_bottomGrad)" filter="url(#${uid}_dropShadow)" />
          <path d="M ${m.hipL_X + 4} ${m.hipY + 7} Q ${m.hipL_X + 14} ${m.hipY + 16} ${m.hipL_X + 22} ${m.hipY + 7}" stroke="${shadow}" stroke-width="1.8" fill="none" opacity="0.6" />
          <path d="M ${m.hipR_X - 4} ${m.hipY + 7} Q ${m.hipR_X - 14} ${m.hipY + 16} ${m.hipR_X - 22} ${m.hipY + 7}" stroke="${shadow}" stroke-width="1.8" fill="none" opacity="0.6" />
        </g>
      `;
    },

    // 7. Dresses
    dress(cfg, uid, colors, m) {
      if (!cfg.dress || cfg.dress === 'none') return '';

      const style = cfg.dress;
      const c = colors.dress;
      const shadow = c.shadow;

      if (style === 'dress_party' || style === 'dress_summer') {
        const skirtY = m.hipY + Math.round(m.legH * 0.58);
        return `
          <g id="${uid}_dress" class="avatar-part-dress">
            <path d="M ${m.neckL + 4} ${m.neckBaseY} L ${m.neckR - 4} ${m.neckBaseY} L ${m.waistR_X} ${m.waistY} L ${m.waistL_X} ${m.waistY} Z" fill="url(#${uid}_dressGrad)" filter="url(#${uid}_dropShadow)" />
            <path d="M ${m.waistL_X} ${m.waistY} L ${m.waistR_X} ${m.waistY} L ${m.hipR_X + 22} ${skirtY} L ${m.hipL_X - 22} ${skirtY} Z" fill="url(#${uid}_dressGrad)" filter="url(#${uid}_dropShadow)" />
            <ellipse cx="160" cy="${m.waistY}" rx="${m.waistW/2 + 1}" ry="3.5" fill="#ffffff" opacity="0.6" />
          </g>
        `;
      } else if (style === 'dress_long' || style === 'dress_traditional' || style === 'dress_formal') {
        return `
          <g id="${uid}_dress" class="avatar-part-dress">
            <path d="M ${m.neckL} ${m.neckBaseY} L ${m.neckR} ${m.neckBaseY} L ${m.hipR_X + 16} ${m.ankleY} L ${m.hipL_X - 16} ${m.ankleY} Z" fill="url(#${uid}_dressGrad)" filter="url(#${uid}_dropShadow)" />
            <line x1="160" y1="${m.neckBaseY + 4}" x2="160" y2="${m.ankleY}" stroke="${shadow}" stroke-width="2" opacity="0.35" />
          </g>
        `;
      }

      // Default Casual Dress
      const skirtY = m.hipY + Math.round(m.legH * 0.52);
      return `
        <g id="${uid}_dress" class="avatar-part-dress">
          <path d="M ${m.neckL} ${m.neckBaseY} L ${m.neckR} ${m.neckBaseY} L ${m.hipR_X + 16} ${skirtY} L ${m.hipL_X - 16} ${skirtY} Z" fill="url(#${uid}_dressGrad)" filter="url(#${uid}_dropShadow)" />
          <path d="M ${m.neckL} ${m.neckBaseY} Q 160 ${m.clavicleY + 5} ${m.neckR} ${m.neckBaseY} Z" fill="${shadow}" />
        </g>
      `;
    },

    // 8. Shoes & Footwear
    shoes(cfg, uid, colors, m) {
      const style = cfg.shoes || 'shoes_sneakers';
      const c = colors.shoe;
      const main = c.main;
      const shadow = c.shadow;

      const lX = m.leftLegX - 3;
      const rX = m.rightLegX - 1;
      const y = m.shoeY;

      if (style === 'shoes_boots') {
        return `
          <g id="${uid}_shoes">
            <path d="M ${lX} ${y - 14} L ${lX + m.legW + 6} ${y - 14} L ${lX + m.legW + 8} ${y + 20} L ${lX - 6} ${y + 20} L ${lX - 4} ${y + 8} Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
            <rect x="${lX - 8}" y="${y + 18}" width="${m.legW + 18}" height="6" rx="2" fill="${shadow}" />
            
            <path d="M ${rX} ${y - 14} L ${rX + m.legW + 6} ${y - 14} L ${rX + m.legW + 10} ${y + 8} L ${rX + m.legW + 12} ${y + 20} L ${rX - 2} ${y + 20} Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
            <rect x="${rX - 4}" y="${y + 18}" width="${m.legW + 18}" height="6" rx="2" fill="${shadow}" />
          </g>
        `;
      } else if (style === 'shoes_sandals' || style === 'shoes_slides') {
        return `
          <g id="${uid}_shoes">
            <rect x="${lX - 4}" y="${y + 14}" width="${m.legW + 12}" height="6" rx="3" fill="${shadow}" />
            <line x1="${lX}" y1="${y + 14}" x2="${lX + m.legW + 4}" y2="${y + 14}" stroke="${main}" stroke-width="4.5" stroke-linecap="round" />
            <rect x="${rX}" y="${y + 14}" width="${m.legW + 12}" height="6" rx="3" fill="${shadow}" />
            <line x1="${rX + 4}" y1="${y + 14}" x2="${rX + m.legW + 8}" y2="${y + 14}" stroke="${main}" stroke-width="4.5" stroke-linecap="round" />
          </g>
        `;
      } else if (style === 'shoes_hightops') {
        return `
          <g id="${uid}_shoes">
            <path d="M ${lX} ${y - 8} L ${lX + m.legW + 4} ${y - 8} L ${lX + m.legW + 5} ${y + 16} L ${lX - 8} ${y + 16} Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
            <rect x="${lX - 10}" y="${y + 15}" width="${m.legW + 17}" height="6" rx="3" fill="#ffffff" />
            <line x1="${lX}" y1="${y - 2}" x2="${lX + m.legW + 2}" y2="${y - 2}" stroke="#ffffff" stroke-width="2" />
            
            <path d="M ${rX} ${y - 8} L ${rX + m.legW + 4} ${y - 8} L ${rX + m.legW + 12} ${y + 16} L ${rX - 1} ${y + 16} Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
            <rect x="${rX - 3}" y="${y + 15}" width="${m.legW + 17}" height="6" rx="3" fill="#ffffff" />
            <line x1="${rX + 2}" y1="${y - 2}" x2="${rX + m.legW + 4}" y2="${y - 2}" stroke="#ffffff" stroke-width="2" />
          </g>
        `;
      }

      // Default Sneakers / Sports / Casual
      return `
        <g id="${uid}_shoes">
          <path d="M ${lX} ${y} L ${lX + m.legW + 4} ${y} L ${lX + m.legW + 5} ${y + 16} L ${lX - 8} ${y + 16} Q ${lX - 6} ${y + 7} ${lX} ${y} Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
          <rect x="${lX - 10}" y="${y + 15}" width="${m.legW + 17}" height="6" rx="3" fill="#ffffff" />
          <line x1="${lX + 2}" y1="${y + 5}" x2="${lX + m.legW - 2}" y2="${y + 5}" stroke="#ffffff" stroke-width="2" />

          <path d="M ${rX} ${y} L ${rX + m.legW + 4} ${y} Q ${rX + m.legW + 10} ${y + 7} ${rX + m.legW + 12} ${y + 16} L ${rX - 1} ${y + 16} L ${rX} ${y} Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
          <rect x="${rX - 3}" y="${y + 15}" width="${m.legW + 17}" height="6" rx="3" fill="#ffffff" />
          <line x1="${rX + 6}" y1="${y + 5}" x2="${rX + m.legW + 2}" y2="${y + 5}" stroke="#ffffff" stroke-width="2" />
        </g>
      `;
    },

    // 9. Dedicated Spectacles & Eyewear System
    glasses(cfg, uid, colors) {
      const style = cfg.glasses || 'none';
      if (style === 'none') return '';
      const frameColor = (colors.glasses || { main: '#2c3e50', shadow: '#1a252f' }).main;

      if (style === 'glasses_sunglasses' || style === 'glasses_wayfarer') {
        return `
          <g id="${uid}_glasses">
            <rect x="127" y="93" width="29" height="19" rx="5" fill="#1e272e" stroke="${frameColor}" stroke-width="2" opacity="0.96" filter="url(#${uid}_dropShadow)" />
            <rect x="164" y="93" width="29" height="19" rx="5" fill="#1e272e" stroke="${frameColor}" stroke-width="2" opacity="0.96" filter="url(#${uid}_dropShadow)" />
            <line x1="156" y1="99" x2="164" y2="99" stroke="${frameColor}" stroke-width="3" />
            <line x1="130" y1="96" x2="149" y2="109" stroke="#ffffff" stroke-width="1.8" opacity="0.4" />
            <line x1="167" y1="96" x2="186" y2="109" stroke="#ffffff" stroke-width="1.8" opacity="0.4" />
          </g>
        `;
      } else if (style === 'glasses_aviator') {
        return `
          <g id="${uid}_glasses">
            <path d="M 127 94 C 127 92, 156 92, 156 94 C 156 112, 142 118, 127 114 Z" fill="#2d3436" opacity="0.75" stroke="${frameColor}" stroke-width="2" filter="url(#${uid}_dropShadow)" />
            <path d="M 164 94 C 164 92, 193 92, 193 94 C 193 114, 178 118, 164 112 Z" fill="#2d3436" opacity="0.75" stroke="${frameColor}" stroke-width="2" filter="url(#${uid}_dropShadow)" />
            <line x1="156" y1="94" x2="164" y2="94" stroke="${frameColor}" stroke-width="2" />
            <line x1="154" y1="98" x2="166" y2="98" stroke="${frameColor}" stroke-width="1.5" />
          </g>
        `;
      } else if (style === 'glasses_round' || style === 'glasses_gold_round') {
        const col = style === 'glasses_gold_round' ? '#f1c40f' : frameColor;
        return `
          <g id="${uid}_glasses">
            <circle cx="142" cy="103" r="13" fill="none" stroke="${col}" stroke-width="2.5" />
            <circle cx="178" cy="103" r="13" fill="none" stroke="${col}" stroke-width="2.5" />
            <path d="M 155 103 Q 160 100 165 103" stroke="${col}" stroke-width="2.5" fill="none" />
            <circle cx="142" cy="103" r="12" fill="rgba(255,255,255,0.08)" />
            <circle cx="178" cy="103" r="12" fill="rgba(255,255,255,0.08)" />
          </g>
        `;
      } else if (style === 'glasses_square' || style === 'glasses_thick') {
        return `
          <g id="${uid}_glasses">
            <rect x="128" y="93" width="27" height="20" rx="4" fill="none" stroke="${frameColor}" stroke-width="3" />
            <rect x="165" y="93" width="27" height="20" rx="4" fill="none" stroke="${frameColor}" stroke-width="3" />
            <line x1="155" y1="101" x2="165" y2="101" stroke="${frameColor}" stroke-width="3" />
          </g>
        `;
      } else if (style === 'glasses_rimless') {
        return `
          <g id="${uid}_glasses">
            <rect x="130" y="96" width="24" height="15" rx="3" fill="rgba(255,255,255,0.12)" stroke="#bdc3c7" stroke-width="1" />
            <rect x="166" y="96" width="24" height="15" rx="3" fill="rgba(255,255,255,0.12)" stroke="#bdc3c7" stroke-width="1" />
            <line x1="154" y1="101" x2="166" y2="101" stroke="#bdc3c7" stroke-width="1.8" />
          </g>
        `;
      }

      // Default thin wireframe
      return `
        <g id="${uid}_glasses">
          <rect x="130" y="95" width="25" height="17" rx="4" fill="none" stroke="${frameColor}" stroke-width="1.8" />
          <rect x="165" y="95" width="25" height="17" rx="4" fill="none" stroke="${frameColor}" stroke-width="1.8" />
          <line x1="155" y1="101" x2="165" y2="101" stroke="${frameColor}" stroke-width="1.8" />
        </g>
      `;
    },

    // 10. Dedicated Hats & Headwear System
    headwear(cfg, uid, colors) {
      const style = cfg.headwear || 'none';
      if (style === 'none') return '';
      const c = colors.headwear || colors.top;
      const main = c.main;
      const shadow = c.shadow;

      if (style === 'headwear_cap' || style === 'headwear_snapback') {
        return `
          <g id="${uid}_headwear">
            <path d="M 115 78 C 115 36, 205 36, 205 78 Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
            <path d="M 113 78 Q 160 70 216 76 Q 228 82 210 86 Q 160 82 113 78 Z" fill="${shadow}" />
            <circle cx="160" cy="42" r="4" fill="${shadow}" />
          </g>
        `;
      } else if (style === 'headwear_backward_cap') {
        return `
          <g id="${uid}_headwear">
            <path d="M 115 78 C 115 36, 205 36, 205 78 Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
            <path d="M 130 84 Q 160 88 190 84" stroke="${shadow}" stroke-width="5" stroke-linecap="round" fill="none" />
            <circle cx="160" cy="42" r="4" fill="${shadow}" />
          </g>
        `;
      } else if (style === 'headwear_beanie' || style === 'headwear_winter_hat') {
        return `
          <g id="${uid}_headwear">
            <circle cx="160" cy="28" r="11" fill="#f1c40f" />
            <path d="M 115 82 C 113 38, 207 38, 205 82 Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
            <rect x="111" y="76" width="98" height="13" rx="6" fill="${shadow}" />
          </g>
        `;
      } else if (style === 'headwear_bucket') {
        return `
          <g id="${uid}_headwear">
            <path d="M 126 78 L 132 44 L 188 44 L 194 78 Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
            <ellipse cx="160" cy="78" rx="52" ry="12" fill="${shadow}" />
          </g>
        `;
      } else if (style === 'headwear_fedora' || style === 'headwear_cowboy') {
        return `
          <g id="${uid}_headwear">
            <path d="M 128 72 C 128 42, 142 38, 160 44 C 178 38, 192 42, 192 72 Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
            <ellipse cx="160" cy="74" rx="56" ry="11" fill="${shadow}" filter="url(#${uid}_dropShadow)" />
            <rect x="128" y="66" width="64" height="6" fill="#f1c40f" opacity="0.8" />
          </g>
        `;
      } else if (style === 'headwear_gradcap') {
        return `
          <g id="${uid}_headwear">
            <polygon points="160,32 216,48 160,64 104,48" fill="#2c3e50" filter="url(#${uid}_dropShadow)" />
            <rect x="134" y="58" width="52" height="16" rx="3" fill="#1a252f" />
            <circle cx="160" cy="48" r="4" fill="#f1c40f" />
            <path d="M 160 48 Q 192 56 198 76" stroke="#f1c40f" stroke-width="2.5" fill="none" />
            <circle cx="198" cy="77" r="3" fill="#f1c40f" />
          </g>
        `;
      } else if (style === 'headwear_crown') {
        return `
          <g id="${uid}_headwear">
            <path d="M 124 72 L 131 46 L 146 62 L 160 40 L 174 62 L 189 46 L 196 72 Z" fill="#f1c40f" stroke="#d4ac0d" stroke-width="2" filter="url(#${uid}_dropShadow)" />
            <circle cx="160" cy="44" r="3" fill="#e74c3c" />
            <circle cx="131" cy="50" r="2.5" fill="#3498db" />
            <circle cx="189" cy="50" r="2.5" fill="#2ecc71" />
          </g>
        `;
      } else if (style === 'headwear_headband' || style === 'headwear_bandana') {
        return `
          <path d="M 115 84 C 115 54, 205 54, 205 84" stroke="${main}" stroke-width="7.5" fill="none" stroke-linecap="round" />
        `;
      } else if (style === 'headwear_party') {
        return `
          <g id="${uid}_headwear">
            <polygon points="160,20 134,74 186,74" fill="${main}" filter="url(#${uid}_dropShadow)" />
            <circle cx="160" cy="18" r="5" fill="#f1c40f" />
            <circle cx="152" cy="50" r="3" fill="#ffffff" opacity="0.8" />
            <circle cx="168" cy="62" r="3" fill="#ffffff" opacity="0.8" />
          </g>
        `;
      }
      return '';
    },

    // 11. Accessories (Wearables, Necklaces, Watches, Earrings)
    accessories(cfg, uid, colors, m) {
      const style = cfg.accessory || 'none';
      if (style === 'none') return '';
      const c = colors.accessory || colors.clothing.gold;

      if (style === 'acc_headphones') {
        return `
          <g id="${uid}_accessories">
            <path d="M 110 106 C 110 35, 210 35, 210 106" stroke="#34495e" stroke-width="6" fill="none" />
            <rect x="104" y="93" width="12" height="25" rx="6" fill="${c.main}" />
            <rect x="204" y="93" width="12" height="25" rx="6" fill="${c.main}" />
          </g>
        `;
      } else if (style === 'acc_earbuds') {
        return `
          <g id="${uid}_accessories">
            <circle cx="118" cy="108" r="3" fill="#ffffff" />
            <circle cx="202" cy="108" r="3" fill="#ffffff" />
          </g>
        `;
      } else if (style === 'acc_necklace' || style === 'acc_chain') {
        return `
          <path d="M 148 ${m.neckBaseY + 2} Q 160 ${m.clavicleY + 20} 172 ${m.neckBaseY + 2}" stroke="${c.main}" stroke-width="2.5" fill="none" />
          <circle cx="160" cy="${m.clavicleY + 16}" r="4" fill="#e74c3c" />
        `;
      } else if (style === 'acc_earrings' || style === 'acc_hoops') {
        const isHoop = style === 'acc_hoops';
        return `
          <circle cx="119" cy="118" r="${isHoop ? 5 : 3.5}" fill="${isHoop ? 'none' : c.main}" stroke="${c.main}" stroke-width="${isHoop ? 2 : 0}" />
          <circle cx="201" cy="118" r="${isHoop ? 5 : 3.5}" fill="${isHoop ? 'none' : c.main}" stroke="${c.main}" stroke-width="${isHoop ? 2 : 0}" />
        `;
      } else if (style === 'acc_watch' || style === 'acc_smartwatch') {
        const watchX = Math.round(m.rightArmX + m.armW + 1);
        const watchY = Math.round(m.handY - 12);
        return `
          <rect x="${watchX - 5}" y="${watchY}" width="10" height="4.5" rx="2" fill="${c.main}" />
        `;
      } else if (style === 'acc_tie') {
        return `
          <polygon points="158,${m.clavicleY + 6} 162,${m.clavicleY + 6} 164,${m.clavicleY + 34} 160,${m.clavicleY + 42} 156,${m.clavicleY + 34}" fill="${c.main}" />
        `;
      } else if (style === 'acc_bowtie') {
        return `
          <polygon points="152,${m.clavicleY + 6} 168,${m.clavicleY + 14} 168,${m.clavicleY + 6} 152,${m.clavicleY + 14}" fill="${c.main}" />
          <circle cx="160" cy="${m.clavicleY + 10}" r="2.5" fill="#ffffff" />
        `;
      } else if (style === 'acc_scarf') {
        return `
          <g id="${uid}_scarf">
            <path d="M ${m.neckL - 2} ${m.neckBaseY} Q 160 ${m.clavicleY + 12} ${m.neckR + 2} ${m.neckBaseY} Q 160 ${m.clavicleY - 4} ${m.neckL - 2} ${m.neckBaseY} Z" fill="${c.main}" />
            <rect x="162" y="${m.clavicleY + 6}" width="12" height="34" rx="2" fill="${c.shadow}" />
          </g>
        `;
      }
      return '';
    },

    // 12. Special Items Held or Attached
    specialItems(cfg, uid, m) {
      const item = cfg.specialItem || 'none';
      if (item === 'none') return '';

      const handY = m.handY;

      if (item === 'item_book') {
        return `
          <g id="${uid}_item" transform="translate(${m.leftArmX - 24}, ${handY - 38}) rotate(-15)">
            <rect x="0" y="0" width="30" height="40" rx="3" fill="#2980b9" filter="url(#${uid}_dropShadow)" />
            <rect x="3" y="3" width="24" height="34" rx="2" fill="#ecf0f1" />
            <line x1="6" y1="12" x2="22" y2="12" stroke="#7f8c8d" stroke-width="2" />
            <line x1="6" y1="20" x2="22" y2="20" stroke="#7f8c8d" stroke-width="2" />
          </g>
        `;
      } else if (item === 'item_laptop') {
        return `
          <g id="${uid}_item" transform="translate(${m.leftArmX - 28}, ${handY - 28}) rotate(-10)">
            <rect x="0" y="0" width="38" height="26" rx="3" fill="#7f8c8d" filter="url(#${uid}_dropShadow)" />
            <rect x="2" y="2" width="34" height="22" rx="2" fill="#2c3e50" />
            <circle cx="19" cy="13" r="3" fill="#3498db" />
          </g>
        `;
      } else if (item === 'item_trophy') {
        return `
          <g id="${uid}_item" transform="translate(${m.leftArmX - 26}, ${handY - 42})">
            <path d="M 6 0 L 26 0 L 22 22 Q 16 28 10 22 Z" fill="#f1c40f" filter="url(#${uid}_dropShadow)" />
            <rect x="13" y="24" width="6" height="10" fill="#d4ac0d" />
            <rect x="8" y="34" width="16" height="6" rx="1" fill="#34495e" />
            <path d="M 6 4 Q 0 10 6 16 M 26 4 Q 32 10 26 16" stroke="#f1c40f" stroke-width="2.5" fill="none" />
          </g>
        `;
      } else if (item === 'item_pencil' || item === 'item_wand') {
        return `
          <g id="${uid}_item" transform="translate(${m.leftArmX - 20}, ${handY - 32}) rotate(-45)">
            <rect x="0" y="0" width="7" height="34" rx="1" fill="#f39c12" />
            <polygon points="0,34 7,34 3.5,44" fill="#f5cba7" />
            <polygon points="2.5,41 4.5,41 3.5,44" fill="#2c3e50" />
          </g>
        `;
      } else if (item === 'item_gaming_headset') {
        return `
          <g id="${uid}_item">
            <path d="M 110 106 C 110 35, 210 35, 210 106" stroke="#2c3e50" stroke-width="7" fill="none" />
            <rect x="103" y="92" width="14" height="26" rx="7" fill="#00cec9" />
            <rect x="203" y="92" width="14" height="26" rx="7" fill="#00cec9" />
            <!-- Boom Microphone -->
            <path d="M 110 114 Q 115 136 142 135" stroke="#2c3e50" stroke-width="3" fill="none" />
            <circle cx="144" cy="135" r="3.5" fill="#ff7675" />
          </g>
        `;
      } else if (item === 'item_face_mask') {
        return `
          <g id="${uid}_mask">
            <path d="M 136 116 L 184 116 L 176 146 L 144 146 Z" fill="#2c3e50" filter="url(#${uid}_dropShadow)" />
            <line x1="136" y1="118" x2="119" y2="108" stroke="#7f8c8d" stroke-width="1.8" />
            <line x1="184" y1="118" x2="201" y2="108" stroke="#7f8c8d" stroke-width="1.8" />
          </g>
        `;
      }
      return '';
    },

    // 13. Winner Awards in Hand (Leaderboard)
    heldAward(award, uid, colors, m) {
      if (!award || award === 'none') return '';

      const skinGrad = `url(#${uid}_skinGrad)`;
      const handY = m.handY;
      const rHandX = m.rightArmX + m.armW + 2;

      if (award === 'trophy_gold' || award === 'trophy') {
        return `
          <g id="${uid}_held_trophy" class="avatar-held-award-trophy">
            <ellipse cx="${rHandX + 24}" cy="${handY + 13}" rx="20" ry="6" fill="#000000" opacity="0.35" filter="url(#${uid}_dropShadow)" />
            <path d="M ${rHandX + 6} ${handY + 1} L ${rHandX + 42} ${handY + 1} L ${rHandX + 44} ${handY + 13} L ${rHandX + 4} ${handY + 13} Z" fill="#2c3e50" filter="url(#${uid}_dropShadow)" />
            <rect x="${rHandX + 8}" y="${handY - 1}" width="32" height="3" fill="#f1c40f" rx="1" />
            <rect x="${rHandX + 4}" y="${handY + 10}" width="40" height="3" fill="#f39c12" rx="1" />
            <path d="M ${rHandX + 21} ${handY - 21} L ${rHandX + 27} ${handY - 21} L ${rHandX + 26} ${handY} L ${rHandX + 22} ${handY} Z" fill="url(#${uid}_goldTrophy)" />
            <ellipse cx="${rHandX + 24}" cy="${handY - 10}" rx="5" ry="3" fill="#fff275" />
            <path d="M ${rHandX + 10} ${handY - 57} C ${rHandX - 12} ${handY - 53}, ${rHandX - 16} ${handY - 27}, ${rHandX + 12} ${handY - 21}" stroke="url(#${uid}_goldTrophy)" stroke-width="4.5" fill="none" stroke-linecap="round" />
            <path d="M ${rHandX + 10} ${handY - 55} C ${rHandX - 8} ${handY - 51}, ${rHandX - 12} ${handY - 29}, ${rHandX + 12} ${handY - 23}" stroke="#fff9a6" stroke-width="1.5" fill="none" stroke-linecap="round" />
            <path d="M ${rHandX + 38} ${handY - 57} C ${rHandX + 60} ${handY - 53}, ${rHandX + 64} ${handY - 27}, ${rHandX + 36} ${handY - 21}" stroke="url(#${uid}_goldTrophy)" stroke-width="4.5" fill="none" stroke-linecap="round" />
            <path d="M ${rHandX + 38} ${handY - 55} C ${rHandX + 56} ${handY - 51}, ${rHandX + 60} ${handY - 29}, ${rHandX + 36} ${handY - 23}" stroke="#fff9a6" stroke-width="1.5" fill="none" stroke-linecap="round" />
            <path d="M ${rHandX + 8} ${handY - 63} L ${rHandX + 40} ${handY - 63} C ${rHandX + 40} ${handY - 33}, ${rHandX + 30} ${handY - 19}, ${rHandX + 24} ${handY - 19} C ${rHandX + 18} ${handY - 19}, ${rHandX + 8} ${handY - 33}, ${rHandX + 8} ${handY - 63} Z" fill="url(#${uid}_goldTrophy)" filter="url(#${uid}_dropShadow)" />
            <ellipse cx="${rHandX + 24}" cy="${handY - 63}" rx="16" ry="4.5" fill="#fff9a6" stroke="#d35400" stroke-width="1" />
            <ellipse cx="${rHandX + 24}" cy="${handY - 63}" rx="13" ry="3" fill="#d35400" opacity="0.6" />
            <polygon points="${rHandX + 24},${handY - 51} ${rHandX + 26},${handY - 45} ${rHandX + 32},${handY - 45} ${rHandX + 27},${handY - 41} ${rHandX + 29},${handY - 35} ${rHandX + 24},${handY - 39} ${rHandX + 19},${handY - 35} ${rHandX + 21},${handY - 41} ${rHandX + 16},${handY - 45} ${rHandX + 22},${handY - 45}" fill="#ffffff" opacity="0.9" />
            <circle cx="${rHandX - 2}" cy="${handY - 20}" r="9" fill="${skinGrad}" />
          </g>
        `;
      } else if (award === 'medal_silver' || award === 'silver') {
        return `
          <g id="${uid}_held_silver_medal" class="avatar-held-award-medal">
            <path d="M ${rHandX} ${handY - 15} Q ${rHandX - 8} ${handY + 3} ${rHandX} ${handY + 21} L ${rHandX + 6} ${handY + 21} Q ${rHandX + 12} ${handY + 3} ${rHandX + 4} ${handY - 15} Z" fill="#2980b9" filter="url(#${uid}_dropShadow)" />
            <circle cx="${rHandX + 3}" cy="${handY + 31}" r="16" fill="url(#${uid}_silverMedal)" stroke="#ffffff" stroke-width="2" filter="url(#${uid}_dropShadow)" />
            <circle cx="${rHandX + 3}" cy="${handY + 31}" r="12" fill="none" stroke="#7f8c8d" stroke-width="1.5" stroke-dasharray="2 1" />
            <text x="${rHandX + 3}" y="${handY + 37}" text-anchor="middle" font-size="14" font-weight="900" fill="#2c3e50" font-family="'Outfit', sans-serif">2</text>
            <circle cx="${rHandX - 1}" cy="${handY - 13}" r="8" fill="${skinGrad}" />
          </g>
        `;
      } else if (award === 'medal_bronze' || award === 'bronze') {
        return `
          <g id="${uid}_held_bronze_medal" class="avatar-held-award-medal">
            <path d="M ${rHandX} ${handY - 15} Q ${rHandX - 8} ${handY + 3} ${rHandX} ${handY + 21} L ${rHandX + 6} ${handY + 21} Q ${rHandX + 12} ${handY + 3} ${rHandX + 4} ${handY - 15} Z" fill="#c0392b" filter="url(#${uid}_dropShadow)" />
            <circle cx="${rHandX + 3}" cy="${handY + 31}" r="16" fill="url(#${uid}_bronzeMedal)" stroke="#ffaa5b" stroke-width="2" filter="url(#${uid}_dropShadow)" />
            <circle cx="${rHandX + 3}" cy="${handY + 31}" r="12" fill="none" stroke="#d35400" stroke-width="1.5" stroke-dasharray="2 1" />
            <text x="${rHandX + 3}" y="${handY + 37}" text-anchor="middle" font-size="14" font-weight="900" fill="#4a1c0d" font-family="'Outfit', sans-serif">3</text>
            <circle cx="${rHandX - 1}" cy="${handY - 13}" r="8" fill="${skinGrad}" />
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
    getBodyMetrics,
    deriveShades,

    resolveColors(config) {
      const skinKey = config.skin || 'skin_04';
      const hairKey = config.hairColor || 'black';
      const topKey = config.topColor || 'blue';
      const bottomKey = config.bottomColor || 'denim';
      const dressKey = config.dressColor || 'pink';
      const shoeKey = config.shoeColor || 'white';
      const eyeKey = config.eyeColor || 'dark_brown';
      const headwearKey = config.headwearColor || 'red';
      const glassesKey = config.glassesColor || 'black';
      const accessoryKey = config.accessoryColor || 'gold';
      const facialHairKey = config.facialHairColor || hairKey;

      return {
        skin: PALETTES.skin[skinKey] || PALETTES.skin.skin_04,
        hair: deriveShades(hairKey, PALETTES.hairColor[hairKey] || PALETTES.hairColor.black),
        top: deriveShades(topKey, PALETTES.clothing[topKey] || PALETTES.clothing.blue),
        bottom: deriveShades(bottomKey, PALETTES.clothing[bottomKey] || PALETTES.clothing.denim),
        dress: deriveShades(dressKey, PALETTES.clothing[dressKey] || PALETTES.clothing.pink),
        shoe: deriveShades(shoeKey, PALETTES.clothing[shoeKey] || PALETTES.clothing.white),
        headwear: deriveShades(headwearKey, PALETTES.clothing[headwearKey] || PALETTES.clothing.red),
        glasses: deriveShades(glassesKey, PALETTES.clothing[glassesKey] || PALETTES.clothing.black),
        accessory: deriveShades(accessoryKey, PALETTES.clothing[accessoryKey] || PALETTES.clothing.gold),
        facialHair: deriveShades(facialHairKey, PALETTES.hairColor[facialHairKey] || PALETTES.hairColor.black),
        eyeColor: PALETTES.eyeColor[eyeKey] || eyeKey || PALETTES.eyeColor.dark_brown
      };
    },

    /**
     * Generates a 3D Layered SVG string with full-body character
     */
    renderSvg(rawConfig, options = {}) {
      const mode = options.mode || 'full';
      const animated = options.animated !== false;
      const award = options.heldAward || options.award || (rawConfig && rawConfig.heldAward) || null;
      const config = Object.assign({}, DEFAULT_CONFIGS.boy, rawConfig || {});
      const colors = this.resolveColors(config);
      const m = getBodyMetrics(config.body || 'regular');
      const uid = getUid('av_' + mode);

      // Rotation & Zoom Transforms
      const rot = options.rotation || config.rotation || 'front';
      const zoom = options.zoom || config.zoom || 1;
      let rotTransform = '';
      if (rot === 'three_quarter_left') {
        rotTransform = 'transform="translate(160,210) scale(0.92,1) skewY(-2.5) translate(-160,-210)"';
      } else if (rot === 'three_quarter_right') {
        rotTransform = 'transform="translate(160,210) scale(0.92,1) skewY(2.5) translate(-160,-210)"';
      } else if (rot === 'side') {
        rotTransform = 'transform="translate(160,210) scale(0.85,1) skewY(-4) translate(-160,-210)"';
      } else if (rot === 'back') {
        rotTransform = 'transform="translate(160,210) scale(-1,1) translate(-160,-210)"';
      }

      // SVG Definitions for 3D Volume & Specular Highlights
      const defs = `
        <defs>
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

          <!-- Clothing Gradients -->
          <linearGradient id="${uid}_topGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${colors.top.highlight}" />
            <stop offset="60%" stop-color="${colors.top.main}" />
            <stop offset="100%" stop-color="${colors.top.shadow}" />
          </linearGradient>

          <linearGradient id="${uid}_bottomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${colors.bottom.highlight}" />
            <stop offset="60%" stop-color="${colors.bottom.main}" />
            <stop offset="100%" stop-color="${colors.bottom.shadow}" />
          </linearGradient>

          <linearGradient id="${uid}_dressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${colors.dress.highlight}" />
            <stop offset="55%" stop-color="${colors.dress.main}" />
            <stop offset="100%" stop-color="${colors.dress.shadow}" />
          </linearGradient>

          <!-- Radial Ground Shadow -->
          <radialGradient id="${uid}_groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.65" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>

          <filter id="${uid}_dropShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.22" />
          </filter>

          <filter id="${uid}_faceGlow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.8" flood-color="${colors.skin.shadow}" flood-opacity="0.3" />
          </filter>
        </defs>
      `;

      if (mode === 'badge' || mode === 'compact') {
        return `
          <svg viewBox="105 40 110 120" class="quizspark-avatar-svg avatar-badge-svg ${animated ? 'avatar-animated' : ''}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Student Avatar">
            ${defs}
            <g id="${uid}_avatar_group">
              ${Layers.face(config, uid, colors)}
              ${Layers.hair(config, uid, colors)}
              ${Layers.eyes(config, uid, colors)}
              ${Layers.eyebrows(config, uid, colors)}
              ${Layers.nose(config, uid, colors)}
              ${Layers.mouth(config, uid)}
              ${Layers.facialHair(config, uid, colors)}
              ${Layers.glasses(config, uid, colors)}
              ${Layers.headwear(config, uid, colors)}
              ${Layers.accessories(config, uid, colors, m)}
            </g>
          </svg>
        `;
      }

      // Full-Body Avatar View (0 0 320 420) with Rotation & Zoom
      const vbW = Math.round(320 / zoom);
      const vbH = Math.round(420 / zoom);
      const vbX = Math.round((320 - vbW) / 2);
      const vbY = Math.round((420 - vbH) / 2);

      return `
        <svg viewBox="${vbX} ${vbY} ${vbW} ${vbH}" preserveAspectRatio="xMidYMid meet" class="quizspark-avatar-svg avatar-full-svg ${animated ? 'avatar-animated' : ''}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Student 3D Character Avatar">
          ${defs}
          <g id="${uid}_avatar_root" ${rotTransform}>
            ${Layers.groundShadow(uid, m)}
            
            <g class="avatar-breath-group">
              ${Layers.backAccessories(config, uid, colors, m)}
              ${Layers.body(config, uid, colors, m)}
              ${Layers.bottom(config, uid, colors, m)}
              ${Layers.shoes(config, uid, colors, m)}
              ${Layers.top(config, uid, colors, m)}
              ${Layers.dress(config, uid, colors, m)}
              
              <!-- Head & Face Assembly -->
              <g class="avatar-head-group">
                ${Layers.face(config, uid, colors)}
                ${Layers.eyes(config, uid, colors)}
                ${Layers.eyebrows(config, uid, colors)}
                ${Layers.nose(config, uid, colors)}
                ${Layers.mouth(config, uid)}
                ${Layers.facialHair(config, uid, colors)}
                ${Layers.hair(config, uid, colors)}
                ${Layers.glasses(config, uid, colors)}
                ${Layers.headwear(config, uid, colors)}
              </g>

              ${Layers.accessories(config, uid, colors, m)}
              ${Layers.specialItems(config, uid, m)}
              ${Layers.heldAward(award, uid, colors, m)}
            </g>
          </g>
        </svg>
      `;
    },

    mount(container, config, options = {}) {
      if (!container) return;
      container.innerHTML = this.renderSvg(config, options);
    },

    getPresets(style = 'boy') {
      const all = {
        boy: [
          { id: 'boy_1', name: 'Boy 1 (Sporty Cap)', config: { style: 'boy', body: 'athletic', skin: 'skin_04', face: 'face_round', hair: 'hair_boy_fade', hairColor: 'black', eyes: 'eyes_bright', eyeColor: 'dark_brown', eyebrows: 'brows_thick', nose: 'nose_medium', mouth: 'mouth_smile', freckles: 'none', facialHair: 'none', top: 'top_jersey', topColor: 'blue', bottom: 'bottom_shorts', bottomColor: 'navy', dress: 'none', dressColor: 'blue', shoes: 'shoes_sports', shoeColor: 'red', headwear: 'headwear_cap', headwearColor: 'red', glasses: 'none', accessory: 'acc_watch', specialItem: 'none' } },
          { id: 'boy_2', name: 'Boy 2 (Hoodie Geek)', config: { style: 'boy', body: 'regular', skin: 'skin_02', face: 'face_oval', hair: 'hair_boy_curly', hairColor: 'dark_brown', eyes: 'eyes_friendly', eyeColor: 'brown', eyebrows: 'brows_natural', nose: 'nose_small', mouth: 'mouth_confident', freckles: 'freckles_light', facialHair: 'none', top: 'top_hoodie', topColor: 'purple', bottom: 'bottom_jeans', bottomColor: 'denim', dress: 'none', dressColor: 'purple', shoes: 'shoes_sneakers', shoeColor: 'white', headwear: 'none', glasses: 'glasses_round', glassesColor: 'black', accessory: 'acc_backpack', specialItem: 'item_laptop' } },
          { id: 'boy_3', name: 'Boy 3 (Smart Polo)', config: { style: 'boy', body: 'slim', skin: 'skin_06', face: 'face_square', hair: 'hair_boy_sidepart', hairColor: 'black', eyes: 'eyes_almond', eyeColor: 'dark_brown', eyebrows: 'brows_straight', nose: 'nose_straight', mouth: 'mouth_smile', freckles: 'none', facialHair: 'mustache', top: 'top_polo', topColor: 'coral', bottom: 'bottom_casual', bottomColor: 'khaki', dress: 'none', dressColor: 'coral', shoes: 'shoes_casual', shoeColor: 'brown', headwear: 'none', glasses: 'glasses_thin', glassesColor: 'gold', accessory: 'acc_watch', specialItem: 'none' } },
          { id: 'boy_4', name: 'Boy 4 (Urban Biker)', config: { style: 'boy', body: 'regular', skin: 'skin_03', face: 'face_soft', hair: 'hair_boy_spiky', hairColor: 'blonde', eyes: 'eyes_round', eyeColor: 'blue', eyebrows: 'brows_thick', nose: 'nose_rounded', mouth: 'mouth_big_smile', freckles: 'none', facialHair: 'light_beard', top: 'top_leather_jacket', topColor: 'black', bottom: 'bottom_cargo', bottomColor: 'grey', dress: 'none', dressColor: 'black', shoes: 'shoes_boots', shoeColor: 'black', headwear: 'headwear_beanie', headwearColor: 'grey', glasses: 'glasses_sunglasses', accessory: 'acc_headphones', specialItem: 'none' } },
          { id: 'boy_5', name: 'Boy 5 (Scholar)', config: { style: 'boy', body: 'tall', skin: 'skin_07', face: 'face_long', hair: 'hair_boy_crew', hairColor: 'black', eyes: 'eyes_cartoon', eyeColor: 'dark_brown', eyebrows: 'brows_raised', nose: 'nose_medium', mouth: 'mouth_friendly', freckles: 'none', facialHair: 'none', top: 'top_blazer', topColor: 'navy', bottom: 'bottom_formal', bottomColor: 'navy', dress: 'none', dressColor: 'white', shoes: 'shoes_formal', shoeColor: 'black', headwear: 'none', glasses: 'glasses_square', glassesColor: 'black', accessory: 'acc_tie', specialItem: 'item_book' } }
        ],
        girl: [
          { id: 'girl_1', name: 'Girl 1 (Casual Waves)', config: { style: 'girl', body: 'regular', skin: 'skin_03', face: 'face_oval', hair: 'hair_girl_wavy', hairColor: 'dark_brown', eyes: 'eyes_bright', eyeColor: 'brown', eyebrows: 'brows_curved', nose: 'nose_small', mouth: 'mouth_smile', freckles: 'freckles_cheeks', facialHair: 'none', top: 'top_casual', topColor: 'purple', bottom: 'bottom_jeans', bottomColor: 'denim', dress: 'none', dressColor: 'purple', shoes: 'shoes_sneakers', shoeColor: 'white', headwear: 'none', glasses: 'none', accessory: 'acc_earrings', accessoryColor: 'gold', specialItem: 'none' } },
          { id: 'girl_2', name: 'Girl 2 (Sport Pony)', config: { style: 'girl', body: 'athletic', skin: 'skin_05', face: 'face_round', hair: 'hair_girl_highpony', hairColor: 'black', eyes: 'eyes_almond', eyeColor: 'dark_brown', eyebrows: 'brows_natural', nose: 'nose_small', mouth: 'mouth_confident', freckles: 'none', facialHair: 'none', top: 'top_printed', topColor: 'teal', bottom: 'bottom_joggers', bottomColor: 'black', dress: 'none', dressColor: 'teal', shoes: 'shoes_sports', shoeColor: 'pink', headwear: 'headwear_headband', headwearColor: 'pink', glasses: 'none', accessory: 'acc_headphones', specialItem: 'none' } },
          { id: 'girl_3', name: 'Girl 3 (Party Crown)', config: { style: 'girl', body: 'slim', skin: 'skin_02', face: 'face_soft', hair: 'hair_girl_curly', hairColor: 'auburn', eyes: 'eyes_large', eyeColor: 'green', eyebrows: 'brows_curved', nose: 'nose_small', mouth: 'mouth_big_smile', freckles: 'none', facialHair: 'none', top: 'none', topColor: 'pink', bottom: 'none', bottomColor: 'pink', dress: 'dress_party', dressColor: 'ruby', shoes: 'shoes_casual', shoeColor: 'red', headwear: 'headwear_crown', glasses: 'none', accessory: 'acc_necklace', accessoryColor: 'gold', specialItem: 'item_trophy' } },
          { id: 'girl_4', name: 'Girl 4 (Braids & Chic)', config: { style: 'girl', body: 'regular', skin: 'skin_07', face: 'face_oval', hair: 'hair_girl_braids', hairColor: 'black', eyes: 'eyes_friendly', eyeColor: 'dark_brown', eyebrows: 'brows_thick', nose: 'nose_medium', mouth: 'mouth_smile', freckles: 'none', facialHair: 'none', top: 'top_sweater', topColor: 'yellow', bottom: 'bottom_skirt', bottomColor: 'denim', dress: 'none', dressColor: 'yellow', shoes: 'shoes_boots', shoeColor: 'brown', headwear: 'headwear_beret', headwearColor: 'ruby', glasses: 'glasses_round', glassesColor: 'gold', accessory: 'acc_backpack', specialItem: 'item_book' } },
          { id: 'girl_5', name: 'Girl 5 (Chic Bob Cut)', config: { style: 'girl', body: 'regular', skin: 'skin_01', face: 'face_square', hair: 'hair_girl_bob', hairColor: 'blonde', eyes: 'eyes_bright', eyeColor: 'blue', eyebrows: 'brows_thin', nose: 'nose_straight', mouth: 'mouth_laugh', freckles: 'beauty_spot_left', facialHair: 'none', top: 'top_jacket', topColor: 'crimson', bottom: 'bottom_jeans', bottomColor: 'black', dress: 'none', dressColor: 'crimson', shoes: 'shoes_sneakers', shoeColor: 'white', headwear: 'none', glasses: 'glasses_aviator', accessory: 'acc_earrings', specialItem: 'none' } }
        ]
      };
      return all[style] || all.boy;
    },

    getDefault(style = 'boy') {
      return Object.assign({}, DEFAULT_CONFIGS[style] || DEFAULT_CONFIGS.boy);
    },

    randomize(preferredStyle = 'boy') {
      const styles = ['boy', 'girl'];
      const style = preferredStyle && styles.includes(preferredStyle) ? preferredStyle : styles[Math.floor(Math.random() * styles.length)];

      const skins = Object.keys(PALETTES.skin);
      const faces = ['face_round', 'face_oval', 'face_square', 'face_soft', 'face_long', 'face_wide', 'face_heart', 'face_chiseled'];
      const bodies = ['regular', 'slim', 'athletic', 'soft', 'tall', 'short'];
      
      const hairMap = {
        boy: ['hair_boy_fade', 'hair_boy_short', 'hair_boy_crew', 'hair_boy_sidepart', 'hair_boy_spiky', 'hair_boy_curly', 'hair_boy_messy', 'hair_boy_wavy', 'hair_boy_quiff', 'hair_afro', 'hair_boy_undercut'],
        girl: ['hair_girl_wavy', 'hair_girl_straight', 'hair_girl_curly', 'hair_girl_ponytail', 'hair_girl_highpony', 'hair_girl_bun', 'hair_girl_doublebun', 'hair_girl_bob', 'hair_girl_braids', 'hair_girl_pixie']
      };

      const hairColors = Object.keys(PALETTES.hairColor);
      const eyes = ['eyes_friendly', 'eyes_bright', 'eyes_round', 'eyes_almond', 'eyes_large', 'eyes_small', 'eyes_soft', 'eyes_cartoon', 'eyes_cateye'];
      const eyeColors = Object.keys(PALETTES.eyeColor);
      const eyebrows = ['brows_natural', 'brows_thick', 'brows_thin', 'brows_curved', 'brows_straight', 'brows_raised', 'brows_arched'];
      const noses = ['nose_small', 'nose_medium', 'nose_wide', 'nose_rounded', 'nose_straight', 'nose_button'];
      const mouths = ['mouth_smile', 'mouth_big_smile', 'mouth_laugh', 'mouth_small_smile', 'mouth_confident', 'mouth_friendly', 'mouth_neutral', 'mouth_grin'];
      const frecklesList = ['none', 'none', 'freckles_light', 'freckles_cheeks', 'beauty_spot_left', 'beauty_spot_right', 'dimples'];

      const tops = ['top_tshirt', 'top_printed', 'top_polo', 'top_hoodie', 'top_sweatshirt', 'top_jacket', 'top_leather_jacket', 'top_blazer', 'top_shirt', 'top_casual', 'top_jersey', 'top_sweater'];
      const clothingColors = Object.keys(PALETTES.clothing);
      const bottoms = ['bottom_jeans', 'bottom_shorts', 'bottom_joggers', 'bottom_cargo', 'bottom_casual', 'bottom_formal', 'bottom_skirt', 'bottom_trackpants'];

      const dresses = ['dress_casual', 'dress_party', 'dress_summer', 'dress_long', 'dress_formal', 'dress_traditional'];
      const shoes = ['shoes_sneakers', 'shoes_sports', 'shoes_hightops', 'shoes_boots', 'shoes_casual', 'shoes_formal', 'shoes_sandals'];
      const headwears = ['none', 'none', 'headwear_cap', 'headwear_backward_cap', 'headwear_snapback', 'headwear_beanie', 'headwear_bucket', 'headwear_fedora', 'headwear_headband', 'headwear_crown', 'headwear_winter_hat', 'headwear_party'];
      const glassesList = ['none', 'none', 'none', 'glasses_round', 'glasses_square', 'glasses_thin', 'glasses_thick', 'glasses_sunglasses', 'glasses_aviator', 'glasses_gold_round', 'glasses_rimless'];
      const accessories = ['none', 'none', 'acc_backpack', 'acc_watch', 'acc_necklace', 'acc_earrings', 'acc_hoops', 'acc_headphones', 'acc_tie', 'acc_bowtie', 'acc_scarf'];
      const specialItems = ['none', 'none', 'none', 'item_book', 'item_laptop', 'item_pencil', 'item_trophy', 'item_gaming_headset', 'item_face_mask'];

      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const isDress = (style === 'girl' && Math.random() < 0.22);

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
        freckles: pick(frecklesList),
        facialHair: style === 'boy' && Math.random() < 0.25 ? pick(['mustache', 'light_beard', 'short_beard', 'full_beard', 'goatee', 'mustache_handlebar']) : 'none',
        facialHairColor: pick(hairColors),
        top: isDress ? 'none' : pick(tops),
        topColor: pick(clothingColors),
        bottom: isDress ? 'none' : pick(bottoms),
        bottomColor: pick(clothingColors),
        dress: isDress ? pick(dresses) : 'none',
        dressColor: pick(clothingColors),
        shoes: pick(shoes),
        shoeColor: pick(clothingColors),
        headwear: pick(headwears),
        headwearColor: pick(clothingColors),
        glasses: pick(glassesList),
        glassesColor: pick(clothingColors),
        accessory: pick(accessories),
        accessoryColor: pick(clothingColors),
        specialItem: pick(specialItems),
        rotation: 'front',
        zoom: 1
      };
    }
  };

  global.AvatarEngine = AvatarEngine;
})(typeof window !== 'undefined' ? window : this);
