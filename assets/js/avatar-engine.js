/**
 * QuizSpark Realistic 3D Full-Body Avatar System - Vector Rendering Engine
 * Pure modular layered vector generator with anatomical body skeleton, fixed clothing anchor points,
 * 3D-styled lighting, gradients, natural human proportions, and complete full-body visibility from head to shoes.
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
      skin_08: { main: '#3d2314', shadow: '#211107', highlight: '#633c24', tone: 'Espresso' }
    },
    hairColor: {
      black: { main: '#1e272e', shadow: '#0b0c10', highlight: '#485460', label: 'Jet Black' },
      dark_brown: { main: '#3d1c02', shadow: '#220f01', highlight: '#5c2d0c', label: 'Dark Brown' },
      brown: { main: '#6d4c41', shadow: '#4e342e', highlight: '#8d6e63', label: 'Chestnut Brown' },
      light_brown: { main: '#a1887f', shadow: '#6d4c41', highlight: '#bcaaa4', label: 'Light Brown' },
      blonde: { main: '#fbc531', shadow: '#c49516', highlight: '#ffea79', label: 'Golden Blonde' },
      dark_blonde: { main: '#d4ac0d', shadow: '#967806', highlight: '#f7dc6f', label: 'Honey Blonde' },
      red: { main: '#c0392b', shadow: '#871f14', highlight: '#e74c3c', label: 'Auburn Red' },
      auburn: { main: '#8e44ad', shadow: '#5b2673', highlight: '#a569bd', label: 'Dark Auburn' },
      grey: { main: '#7f8c8d', shadow: '#4f5b66', highlight: '#bdc3c7', label: 'Silver Grey' },
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
      green: '#27ae60',
      hazel: '#a07855',
      grey: '#7f8c8d',
      amber: '#d35400'
    },
    clothing: {
      blue: { main: '#2e86de', shadow: '#134a8e', highlight: '#54a0ff' },
      purple: { main: '#8854d0', shadow: '#4d1e9e', highlight: '#a55eea' },
      red: { main: '#ee5253', shadow: '#991515', highlight: '#ff6b6b' },
      yellow: { main: '#feca57', shadow: '#c47805', highlight: '#ffdd59' },
      green: { main: '#10ac84', shadow: '#08634c', highlight: '#1dd1a1' },
      coral: { main: '#ff7675', shadow: '#b33939', highlight: '#fd9644' },
      black: { main: '#2f3542', shadow: '#151922', highlight: '#57606f' },
      white: { main: '#f1f2f6', shadow: '#a4b0be', highlight: '#ffffff' },
      teal: { main: '#00cec9', shadow: '#006b68', highlight: '#81ecec' },
      navy: { main: '#1e3799', shadow: '#0a1a54', highlight: '#4a69bd' },
      crimson: { main: '#b71540', shadow: '#59051b', highlight: '#eb2f06' },
      emerald: { main: '#009432', shadow: '#004a19', highlight: '#2ed573' },
      denim: { main: '#3867d6', shadow: '#1b3882', highlight: '#4b7bec' },
      khaki: { main: '#d1ccc0', shadow: '#6b675e', highlight: '#f7f1e3' },
      grey: { main: '#747d8c', shadow: '#434954', highlight: '#a4b0be' },
      pink: { main: '#f368e0', shadow: '#9c1c8c', highlight: '#ff9ff3' },
      gold: { main: '#ffc048', shadow: '#b37700', highlight: '#fff200' },
      ruby: { main: '#c0392b', shadow: '#5e130b', highlight: '#e74c3c' }
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

  // Unique ID generator for SVG gradient/filter scoping
  let idCounter = 1;
  function getUid(prefix = 'av') {
    return `${prefix}_${Date.now()}_${idCounter++}`;
  }

  /**
   * 3. Consistent Anatomical Skeleton Anchor System
   * All clothing, limbs, heads, and accessories bind to these shared anchor coordinates.
   * Total ViewBox: 0 0 320 420 (Center X = 160)
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
      shoulderW = 60;
      chestW = 50;
      waistW = 42;
      hipW = 48;
      legW = 17;
      armW = 13;
    } else if (prop === 'athletic') {
      shoulderW = 76;
      chestW = 66;
      waistW = 52;
      hipW = 56;
      legW = 22;
      armW = 17;
    } else if (prop === 'soft') {
      shoulderW = 66;
      chestW = 62;
      waistW = 58;
      hipW = 60;
      legW = 22;
      armW = 16;
    } else if (prop === 'tall') {
      shoulderW = 68;
      chestW = 58;
      waistW = 48;
      hipW = 54;
      legH = 130;
      armL = 108;
      shoulderY = 162;
      hipY = 242;
    } else if (prop === 'short') {
      shoulderW = 64;
      chestW = 56;
      waistW = 48;
      hipW = 52;
      legH = 106;
      armL = 90;
      shoulderY = 170;
      hipY = 248;
    }

    // Anchor Points
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
      prop,
      shoulderW,
      chestW,
      waistW,
      hipW,
      legW,
      legH,
      armW,
      armL,
      shoulderY,
      hipY,
      neckBaseY,
      neckL,
      neckR,
      clavicleY,
      shoulderL_X,
      shoulderR_X,
      shoulderL_Y,
      shoulderR_Y,
      chestL_X,
      chestR_X,
      chestY,
      waistL_X,
      waistR_X,
      waistY,
      hipL_X,
      hipR_X,
      ankleY,
      shoeY,
      soleY,
      leftLegX,
      rightLegX,
      leftArmX,
      rightArmX,
      handY
    };
  }

  // 4. SVG Layer Builders (Strict Anatomical Hierarchy)
  const Layers = {
    // 3D Soft Ground Radial Shadow (Character firmly stands on ground)
    groundShadow(uid, m) {
      return `
        <ellipse cx="160" cy="${m.soleY + 4}" rx="${Math.round(m.shoulderW * 0.95)}" ry="12" fill="url(#${uid}_groundShadow)" opacity="0.5" />
      `;
    },

    // Realistic Anatomical Base Body (Legs, Torso, Arms, Hands, Neck)
    body(cfg, uid, colors, m) {
      const skin = colors.skin;

      return `
        <!-- Legs & Knees -->
        <g id="${uid}_legs" class="avatar-part-legs">
          <!-- Left Leg -->
          <rect x="${m.leftLegX}" y="${m.hipY}" width="${m.legW}" height="${m.legH}" rx="${Math.round(m.legW * 0.45)}" fill="url(#${uid}_skinGrad)" filter="url(#${uid}_dropShadow)" />
          <!-- Left Knee Highlight -->
          <ellipse cx="${m.leftLegX + m.legW/2}" cy="${m.hipY + Math.round(m.legH * 0.48)}" rx="${m.legW/2 - 3}" ry="5" fill="${skin.highlight}" opacity="0.3" />

          <!-- Right Leg -->
          <rect x="${m.rightLegX}" y="${m.hipY}" width="${m.legW}" height="${m.legH}" rx="${Math.round(m.legW * 0.45)}" fill="url(#${uid}_skinGrad)" filter="url(#${uid}_dropShadow)" />
          <!-- Right Knee Highlight -->
          <ellipse cx="${m.rightLegX + m.legW/2}" cy="${m.hipY + Math.round(m.legH * 0.48)}" rx="${m.legW/2 - 3}" ry="5" fill="${skin.highlight}" opacity="0.3" />
        </g>

        <!-- Torso Base (Natural shoulder curve & ribcage contour) -->
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

        <!-- Bare Arms & Hands -->
        <g id="${uid}_arms" class="avatar-part-arms">
          <!-- Left Arm -->
          <path d="M ${m.shoulderL_X} ${m.shoulderL_Y} 
                   Q ${m.shoulderL_X - 10} ${m.shoulderY + Math.round(m.armL * 0.45)} ${m.leftArmX - 4} ${m.handY - 14}
                   Q ${m.leftArmX - 2} ${m.handY} ${m.leftArmX + m.armW/2} ${m.handY - 4}
                   Q ${m.leftArmX + m.armW} ${m.shoulderY + Math.round(m.armL * 0.45)} ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 4} Z" 
                fill="url(#${uid}_skinGrad)" />
          <!-- Left Hand -->
          <circle cx="${m.leftArmX - 1}" cy="${m.handY}" r="${Math.round(m.armW * 0.62)}" fill="url(#${uid}_skinGrad)" />

          <!-- Right Arm -->
          <path d="M ${m.shoulderR_X} ${m.shoulderR_Y} 
                   Q ${m.shoulderR_X + 10} ${m.shoulderY + Math.round(m.armL * 0.45)} ${m.rightArmX + m.armW + 4} ${m.handY - 14}
                   Q ${m.rightArmX + m.armW + 2} ${m.handY} ${m.rightArmX + m.armW/2} ${m.handY - 4}
                   Q ${m.rightArmX} ${m.shoulderY + Math.round(m.armL * 0.45)} ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 4} Z" 
                fill="url(#${uid}_skinGrad)" />
          <!-- Right Hand -->
          <circle cx="${m.rightArmX + m.armW + 1}" cy="${m.handY}" r="${Math.round(m.armW * 0.62)}" fill="url(#${uid}_skinGrad)" />
        </g>

        <!-- Neck (Smooth clavicle connection) -->
        <g id="${uid}_neck">
          <path d="M 149 130 L 171 130 L 173 ${m.neckBaseY + 4} L 147 ${m.neckBaseY + 4} Z" fill="url(#${uid}_skinShadowGrad)" />
          <ellipse cx="160" cy="${m.neckBaseY}" rx="12" ry="4.5" fill="${skin.shadow}" opacity="0.35" />
        </g>
      `;
    },

    // Realistic Head & Face Shapes
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
      `;
    },

    // Eyes with Specular Highlights & Depth
    eyes(cfg, uid, colors) {
      const eyeStyle = cfg.eyes || 'eyes_friendly';
      const irisColor = colors.eyeColor || '#2d1810';

      let lEye = { cx: 142, cy: 102, r: 7.5 };
      let rEye = { cx: 178, cy: 102, r: 7.5 };

      if (eyeStyle === 'eyes_large' || eyeStyle === 'eyes_cartoon') {
        lEye.r = 9;
        rEye.r = 9;
      } else if (eyeStyle === 'eyes_small') {
        lEye.r = 6;
        rEye.r = 6;
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
          <circle cx="${lEye.cx + 0.5}" cy="${lEye.cy}" r="${lEye.r - 3.8}" fill="#0b0c10" />
          <circle cx="${rEye.cx - 0.5}" cy="${rEye.cy}" r="${rEye.r - 3.8}" fill="#0b0c10" />

          <!-- Specular 3D Highlights -->
          <circle cx="${lEye.cx - 1.5}" cy="${lEye.cy - 2}" r="1.8" fill="#ffffff" />
          <circle cx="${lEye.cx + 1.8}" cy="${lEye.cy + 1.2}" r="0.9" fill="#ffffff" opacity="0.8" />
          
          <circle cx="${rEye.cx - 2}" cy="${rEye.cy - 2}" r="1.8" fill="#ffffff" />
          <circle cx="${rEye.cx + 1.2}" cy="${rEye.cy + 1.2}" r="0.9" fill="#ffffff" opacity="0.8" />

          <!-- Upper Eyelid / Lash Line -->
          <path d="M ${lEye.cx - lEye.r - 2} ${lEye.cy - 1} Q ${lEye.cx} ${lEye.cy - lEye.r - 1.5} ${lEye.cx + lEye.r + 2} ${lEye.cy - 1}" stroke="#1e272e" stroke-width="2" stroke-linecap="round" fill="none" />
          <path d="M ${rEye.cx - rEye.r - 2} ${rEye.cy - 1} Q ${rEye.cx} ${rEye.cy - rEye.r - 1.5} ${rEye.cx + rEye.r + 2} ${rEye.cy - 1}" stroke="#1e272e" stroke-width="2" stroke-linecap="round" fill="none" />
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
        lD = 'M 132 88 L 151 88';
        rD = 'M 169 88 L 188 88';
      } else if (style === 'brows_curved') {
        lD = 'M 132 91 Q 141 82 151 89';
        rD = 'M 169 89 Q 179 82 188 91';
      } else if (style === 'brows_thick') {
        sw = 4.4;
        lD = 'M 132 88 Q 142 83 152 87';
        rD = 'M 168 87 Q 178 83 188 88';
      } else if (style === 'brows_thin') {
        sw = 1.8;
        lD = 'M 133 88 Q 142 85 150 88';
        rD = 'M 170 88 Q 178 85 187 88';
      } else if (style === 'brows_raised') {
        lD = 'M 132 85 Q 142 80 151 86';
        rD = 'M 169 86 Q 178 80 188 85';
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
          <path d="M 158 112 Q 160 117 163 117 Q 165 117 165 115" stroke="${skinShadow}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75" />
        `;
      } else if (style === 'nose_wide') {
        return `
          <path d="M 155 116 Q 160 119 165 116" stroke="${skinShadow}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.8" />
        `;
      } else if (style === 'nose_straight') {
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

      if (style === 'mouth_big_smile' || style === 'mouth_laugh') {
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
      } else if (style === 'mouth_confident') {
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
      const color = colors.hair.shadow;

      if (style === 'mustache') {
        return `
          <path d="M 150 127 Q 160 130 170 127 Q 165 124 160 125 Q 155 124 150 127 Z" fill="${color}" filter="url(#${uid}_dropShadow)" />
        `;
      } else if (style === 'goatee') {
        return `
          <path d="M 150 127 Q 160 130 170 127 Q 165 124 160 125 Q 155 124 150 127 Z" fill="${color}" />
          <ellipse cx="160" cy="148" rx="6" ry="8" fill="${color}" />
        `;
      } else if (style === 'light_beard' || style === 'short_beard') {
        return `
          <path d="M 134 118 C 134 156, 186 156, 186 118 C 180 152, 140 152, 134 118 Z" fill="${color}" opacity="0.55" />
          <path d="M 151 127 Q 160 130 169 127" stroke="${color}" stroke-width="2.2" fill="none" />
        `;
      } else if (style === 'full_beard') {
        return `
          <path d="M 126 114 C 124 168, 196 168, 194 114 C 185 158, 135 158, 126 114 Z" fill="${color}" filter="url(#${uid}_dropShadow)" />
          <path d="M 149 127 Q 160 131 171 127" stroke="${color}" stroke-width="3" stroke-linecap="round" fill="none" />
        `;
      }
      return '';
    },

    // Hairstyles (Boys, Girls, Long, Short)
    hair(cfg, uid, colors) {
      const hairStyle = cfg.hair || 'hair_boy_fade';
      if (hairStyle === 'none') return '';

      // Girl / Long styles
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
      } else if (hairStyle === 'hair_girl_bun') {
        return `
          <g id="${uid}_hair">
            <circle cx="160" cy="38" r="20" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
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
      }

      // Boy & Short styles
      if (hairStyle === 'hair_boy_fade') {
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
      } else if (hairStyle === 'hair_boy_crew') {
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
      } else if (hairStyle === 'hair_boy_spiky') {
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
      }

      // Default classic short
      return `
        <g id="${uid}_hair">
          <path d="M 117 92 C 117 45, 203 45, 203 92 C 196 66, 178 58, 160 60 C 142 58, 124 66, 117 92 Z" fill="url(#${uid}_hairGrad)" filter="url(#${uid}_dropShadow)" />
        </g>
      `;
    },

    // 5. Perfectly Attached Tops (Matching Neck, Shoulder Slopes & Body Coordinates)
    top(cfg, uid, colors, m) {
      if (cfg.dress && cfg.dress !== 'none') return '';

      const style = cfg.top || 'top_tshirt';
      if (style === 'none') return '';

      const c = colors.top;
      const shadow = c.shadow;

      if (style === 'top_hoodie') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <!-- Main Torso Body following shoulder slopes -->
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
            
            <!-- Thick Hood Collar -->
            <path d="M ${m.neckL - 4} ${m.neckBaseY - 4} C ${m.neckL - 4} ${m.neckBaseY - 18}, ${m.neckR + 4} ${m.neckBaseY - 18}, ${m.neckR + 4} ${m.neckBaseY - 4} Q 160 ${m.neckBaseY + 18} ${m.neckL - 4} ${m.neckBaseY - 4} Z" fill="${shadow}" />
            <!-- Drawstrings -->
            <line x1="154" y1="${m.neckBaseY + 8}" x2="154" y2="${m.neckBaseY + 30}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
            <line x1="166" y1="${m.neckBaseY + 8}" x2="166" y2="${m.neckBaseY + 30}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />

            <!-- Front Kangaroo Pocket -->
            <path d="M ${m.waistL_X + 6} ${m.waistY - 4} L ${m.waistR_X - 6} ${m.waistY - 4} L ${m.hipR_X - 2} ${m.hipY + 2} L ${m.hipL_X + 2} ${m.hipY + 2} Z" fill="${shadow}" opacity="0.35" />

            <!-- Long Sleeves attached at shoulder joints -->
            <path d="M ${m.shoulderL_X - 2} ${m.shoulderL_Y + 2} L ${m.leftArmX - 5} ${m.handY - 14} L ${m.leftArmX + m.armW + 1} ${m.handY - 12} L ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 12} Z" fill="url(#${uid}_topGrad)" />
            <path d="M ${m.shoulderR_X + 2} ${m.shoulderR_Y + 2} L ${m.rightArmX + m.armW + 5} ${m.handY - 14} L ${m.rightArmX - 1} ${m.handY - 12} L ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 12} Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      } else if (style === 'top_polo') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <path d="M ${m.neckL} ${m.neckBaseY}
                     Q 160 ${m.clavicleY + 4} ${m.neckR} ${m.neckBaseY}
                     Q ${m.shoulderR_X} ${m.shoulderR_Y - 2} ${m.shoulderR_X} ${m.shoulderR_Y}
                     L ${m.chestR_X} ${m.chestY}
                     L ${m.waistR_X} ${m.waistY}
                     L ${m.hipR_X} ${m.hipY + 3}
                     L ${m.hipL_X} ${m.hipY + 3}
                     L ${m.waistL_X} ${m.waistY}
                     L ${m.chestL_X} ${m.chestY}
                     L ${m.shoulderL_X} ${m.shoulderL_Y}
                     Q ${m.shoulderL_X} ${m.shoulderL_Y - 2} ${m.neckL} ${m.neckBaseY} Z"
                  fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            
            <!-- Polo Collar & Placket -->
            <path d="M ${m.neckL} ${m.neckBaseY} L 160 ${m.clavicleY + 14} L 152 ${m.clavicleY + 14} Z" fill="${shadow}" />
            <path d="M ${m.neckR} ${m.neckBaseY} L 160 ${m.clavicleY + 14} L 168 ${m.clavicleY + 14} Z" fill="${shadow}" />
            <rect x="156" y="${m.clavicleY + 12}" width="8" height="20" fill="${shadow}" />
            <circle cx="160" cy="${m.clavicleY + 18}" r="1.5" fill="#ffffff" />
            <circle cx="160" cy="${m.clavicleY + 26}" r="1.5" fill="#ffffff" />

            <!-- Fitted Short Sleeves -->
            <path d="M ${m.shoulderL_X} ${m.shoulderL_Y} L ${m.leftArmX - 5} ${m.shoulderY + 34} L ${m.leftArmX + m.armW + 1} ${m.shoulderY + 36} L ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 10} Z" fill="url(#${uid}_topGrad)" />
            <path d="M ${m.shoulderR_X} ${m.shoulderR_Y} L ${m.rightArmX + m.armW + 5} ${m.shoulderY + 34} L ${m.rightArmX - 1} ${m.shoulderY + 36} L ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 10} Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      } else if (style === 'top_jacket') {
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
            
            <!-- Inner T-Shirt V-Line -->
            <path d="M ${m.neckL + 2} ${m.neckBaseY} L 160 ${m.clavicleY + 30} L ${m.neckR - 2} ${m.neckBaseY} Z" fill="#ffffff" />
            <!-- Zipper -->
            <line x1="160" y1="${m.clavicleY + 30}" x2="160" y2="${m.hipY + 5}" stroke="#ced6e0" stroke-width="2" />
            <!-- Jacket Lapels -->
            <path d="M ${m.neckL - 2} ${m.neckBaseY} L 150 ${m.clavicleY + 26} L 140 ${m.clavicleY + 12} Z" fill="${shadow}" />
            <path d="M ${m.neckR + 2} ${m.neckBaseY} L 170 ${m.clavicleY + 26} L 180 ${m.clavicleY + 12} Z" fill="${shadow}" />

            <!-- Jacket Long Sleeves -->
            <path d="M ${m.shoulderL_X - 3} ${m.shoulderL_Y + 2} L ${m.leftArmX - 6} ${m.handY - 14} L ${m.leftArmX + m.armW + 1} ${m.handY - 12} L ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 12} Z" fill="url(#${uid}_topGrad)" />
            <path d="M ${m.shoulderR_X + 3} ${m.shoulderR_Y + 2} L ${m.rightArmX + m.armW + 6} ${m.handY - 14} L ${m.rightArmX - 1} ${m.handY - 12} L ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 12} Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      } else if (style === 'top_sweater' || style === 'top_sweatshirt') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <path d="M ${m.neckL - 2} ${m.neckBaseY}
                     Q 160 ${m.clavicleY + 5} ${m.neckR + 2} ${m.neckBaseY}
                     Q ${m.shoulderR_X + 2} ${m.shoulderR_Y - 2} ${m.shoulderR_X + 2} ${m.shoulderR_Y + 2}
                     L ${m.chestR_X + 2} ${m.chestY}
                     L ${m.waistR_X + 2} ${m.waistY}
                     L ${m.hipR_X + 2} ${m.hipY + 5}
                     L ${m.hipL_X - 2} ${m.hipY + 5}
                     L ${m.waistL_X - 2} ${m.waistY}
                     L ${m.chestL_X - 2} ${m.chestY}
                     L ${m.shoulderL_X - 2} ${m.shoulderL_Y + 2}
                     Q ${m.shoulderL_X - 2} ${m.shoulderL_Y - 2} ${m.neckL - 2} ${m.neckBaseY} Z"
                  fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            
            <!-- Crew Neck Rib Collar -->
            <path d="M ${m.neckL} ${m.neckBaseY} Q 160 ${m.clavicleY + 6} ${m.neckR} ${m.neckBaseY} Q 160 ${m.clavicleY - 1} ${m.neckL} ${m.neckBaseY} Z" fill="${shadow}" />

            <!-- Sleeves with Cuffs -->
            <path d="M ${m.shoulderL_X - 2} ${m.shoulderL_Y + 2} L ${m.leftArmX - 5} ${m.handY - 14} L ${m.leftArmX + m.armW + 1} ${m.handY - 12} L ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 12} Z" fill="url(#${uid}_topGrad)" />
            <path d="M ${m.shoulderR_X + 2} ${m.shoulderR_Y + 2} L ${m.rightArmX + m.armW + 5} ${m.handY - 14} L ${m.rightArmX - 1} ${m.handY - 12} L ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 12} Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      } else if (style === 'top_shirt') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <path d="M ${m.neckL} ${m.neckBaseY}
                     Q 160 ${m.clavicleY + 4} ${m.neckR} ${m.neckBaseY}
                     Q ${m.shoulderR_X} ${m.shoulderR_Y - 2} ${m.shoulderR_X} ${m.shoulderR_Y}
                     L ${m.chestR_X} ${m.chestY}
                     L ${m.waistR_X} ${m.waistY}
                     L ${m.hipR_X} ${m.hipY + 4}
                     L ${m.hipL_X} ${m.hipY + 4}
                     L ${m.waistL_X} ${m.waistY}
                     L ${m.chestL_X} ${m.chestY}
                     L ${m.shoulderL_X} ${m.shoulderL_Y}
                     Q ${m.shoulderL_X} ${m.shoulderL_Y - 2} ${m.neckL} ${m.neckBaseY} Z"
                  fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            
            <!-- Center Buttoned Placket -->
            <line x1="160" y1="${m.clavicleY + 4}" x2="160" y2="${m.hipY + 4}" stroke="${shadow}" stroke-width="2" />
            <circle cx="160" cy="${m.clavicleY + 16}" r="1.5" fill="#ffffff" />
            <circle cx="160" cy="${m.clavicleY + 30}" r="1.5" fill="#ffffff" />
            <circle cx="160" cy="${m.clavicleY + 44}" r="1.5" fill="#ffffff" />
            <circle cx="160" cy="${m.clavicleY + 58}" r="1.5" fill="#ffffff" />

            <!-- Crisp Shirt Collars -->
            <path d="M ${m.neckL} ${m.neckBaseY} L 160 ${m.clavicleY + 12} L 152 ${m.clavicleY + 12} Z" fill="${shadow}" />
            <path d="M ${m.neckR} ${m.neckBaseY} L 160 ${m.clavicleY + 12} L 168 ${m.clavicleY + 12} Z" fill="${shadow}" />

            <!-- Long Buttoned Sleeves -->
            <path d="M ${m.shoulderL_X} ${m.shoulderL_Y} L ${m.leftArmX - 5} ${m.handY - 14} L ${m.leftArmX + m.armW + 1} ${m.handY - 12} L ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 12} Z" fill="url(#${uid}_topGrad)" />
            <path d="M ${m.shoulderR_X} ${m.shoulderR_Y} L ${m.rightArmX + m.armW + 5} ${m.handY - 14} L ${m.rightArmX - 1} ${m.handY - 12} L ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 12} Z" fill="url(#${uid}_topGrad)" />
          </g>
        `;
      } else if (style === 'top_jersey') {
        return `
          <g id="${uid}_top" class="avatar-part-top">
            <path d="M ${m.neckL + 3} ${m.neckBaseY}
                     Q 160 ${m.clavicleY + 8} ${m.neckR - 3} ${m.neckBaseY}
                     Q ${m.shoulderR_X - 4} ${m.shoulderR_Y} ${m.shoulderR_X - 4} ${m.shoulderR_Y + 4}
                     L ${m.chestR_X} ${m.chestY}
                     L ${m.waistR_X} ${m.waistY}
                     L ${m.hipR_X} ${m.hipY + 4}
                     L ${m.hipL_X} ${m.hipY + 4}
                     L ${m.waistL_X} ${m.waistY}
                     L ${m.chestL_X} ${m.chestY}
                     L ${m.shoulderL_X + 4} ${m.shoulderL_Y + 4}
                     Q ${m.shoulderL_X + 4} ${m.shoulderL_Y} ${m.neckL + 3} ${m.neckBaseY} Z"
                  fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
            
            <!-- V-Neck Trim -->
            <path d="M ${m.neckL + 2} ${m.neckBaseY} L 160 ${m.clavicleY + 16} L ${m.neckR - 2} ${m.neckBaseY} Z" fill="${shadow}" opacity="0.35" />
            <!-- Athletic Number -->
            <text x="160" y="${m.shoulderY + 40}" text-anchor="middle" font-size="20" font-weight="900" fill="#ffffff" font-family="'Outfit', sans-serif" opacity="0.95">7</text>
          </g>
        `;
      }

      // Default T-Shirt / Casual Top
      return `
        <g id="${uid}_top" class="avatar-part-top">
          <!-- Torso Body cleanly following shoulder slope & ribcage -->
          <path d="M ${m.neckL} ${m.neckBaseY}
                   Q 160 ${m.clavicleY + 5} ${m.neckR} ${m.neckBaseY}
                   Q ${m.shoulderR_X} ${m.shoulderR_Y - 2} ${m.shoulderR_X} ${m.shoulderR_Y}
                   L ${m.chestR_X} ${m.chestY}
                   L ${m.waistR_X} ${m.waistY}
                   L ${m.hipR_X} ${m.hipY + 3}
                   L ${m.hipL_X} ${m.hipY + 3}
                   L ${m.waistL_X} ${m.waistY}
                   L ${m.chestL_X} ${m.chestY}
                   L ${m.shoulderL_X} ${m.shoulderL_Y}
                   Q ${m.shoulderL_X} ${m.shoulderL_Y - 2} ${m.neckL} ${m.neckBaseY} Z"
                fill="url(#${uid}_topGrad)" filter="url(#${uid}_dropShadow)" />
          
          <!-- Natural Curved Crew Neckline -->
          <path d="M ${m.neckL} ${m.neckBaseY} Q 160 ${m.clavicleY + 6} ${m.neckR} ${m.neckBaseY} Q 160 ${m.clavicleY - 1} ${m.neckL} ${m.neckBaseY} Z" fill="${shadow}" />

          <!-- Short Sleeves cleanly attached to shoulders -->
          <path d="M ${m.shoulderL_X} ${m.shoulderL_Y} L ${m.leftArmX - 5} ${m.shoulderY + 34} L ${m.leftArmX + m.armW + 1} ${m.shoulderY + 36} L ${m.shoulderL_X + m.armW} ${m.shoulderL_Y + 10} Z" fill="url(#${uid}_topGrad)" />
          <path d="M ${m.shoulderR_X} ${m.shoulderR_Y} L ${m.rightArmX + m.armW + 5} ${m.shoulderY + 34} L ${m.rightArmX - 1} ${m.shoulderY + 36} L ${m.shoulderR_X - m.armW} ${m.shoulderR_Y + 10} Z" fill="url(#${uid}_topGrad)" />
        </g>
      `;
    },

    // 6. Perfectly Fitted Bottoms (Jeans, Joggers, Shorts, Formal Pants, Skirts)
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
            <path d="M ${m.hipL_X - 1} ${m.hipY}
                     L ${m.hipR_X + 1} ${m.hipY}
                     L ${m.rightLegX + m.legW + 2} ${shortsBottomY}
                     L ${m.rightLegX - 2} ${shortsBottomY}
                     L 160 ${crotchY}
                     L ${m.leftLegX + m.legW + 2} ${shortsBottomY}
                     L ${m.leftLegX - 2} ${shortsBottomY} Z"
                  fill="url(#${uid}_bottomGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Waistband -->
            <rect x="${m.hipL_X - 1}" y="${m.hipY - 1}" width="${m.hipW + 2}" height="7" fill="${shadow}" opacity="0.4" />
          </g>
        `;
      } else if (style === 'bottom_skirt') {
        const skirtBottomY = m.hipY + Math.round(m.legH * 0.54);
        return `
          <g id="${uid}_bottom" class="avatar-part-bottom">
            <path d="M ${m.hipL_X} ${m.hipY}
                     L ${m.hipR_X} ${m.hipY}
                     L ${m.hipR_X + 16} ${skirtBottomY}
                     L ${m.hipL_X - 16} ${skirtBottomY} Z"
                  fill="url(#${uid}_bottomGrad)" filter="url(#${uid}_dropShadow)" />
            <line x1="${160 - m.hipW/4}" y1="${m.hipY + 3}" x2="${160 - m.hipW/3 - 6}" y2="${skirtBottomY}" stroke="${shadow}" stroke-width="2" opacity="0.4" />
            <line x1="160" y1="${m.hipY + 3}" x2="160" y2="${skirtBottomY}" stroke="${shadow}" stroke-width="2" opacity="0.4" />
            <line x1="${160 + m.hipW/4}" y1="${m.hipY + 3}" x2="${160 + m.hipW/3 + 6}" y2="${skirtBottomY}" stroke="${shadow}" stroke-width="2" opacity="0.4" />
          </g>
        `;
      } else if (style === 'bottom_joggers') {
        return `
          <g id="${uid}_bottom" class="avatar-part-bottom">
            <path d="M ${m.hipL_X - 1} ${m.hipY}
                     L ${m.hipR_X + 1} ${m.hipY}
                     L ${m.rightLegX + m.legW + 2} ${m.ankleY - 2}
                     L ${m.rightLegX - 2} ${m.ankleY - 2}
                     L 160 ${crotchY}
                     L ${m.leftLegX + m.legW + 2} ${m.ankleY - 2}
                     L ${m.leftLegX - 2} ${m.ankleY - 2} Z"
                  fill="url(#${uid}_bottomGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Drawstrings -->
            <circle cx="160" cy="${m.hipY + 5}" r="3" fill="#ffffff" />
            <line x1="158" y1="${m.hipY + 7}" x2="155" y2="${m.hipY + 16}" stroke="#ffffff" stroke-width="2" />
            <line x1="162" y1="${m.hipY + 7}" x2="165" y2="${m.hipY + 16}" stroke="#ffffff" stroke-width="2" />
            <!-- Cuffs -->
            <rect x="${m.leftLegX - 2}" y="${m.ankleY - 6}" width="${m.legW + 4}" height="6" rx="2" fill="${shadow}" />
            <rect x="${m.rightLegX - 2}" y="${m.ankleY - 6}" width="${m.legW + 4}" height="6" rx="2" fill="${shadow}" />
          </g>
        `;
      } else if (style === 'bottom_formal') {
        return `
          <g id="${uid}_bottom" class="avatar-part-bottom">
            <path d="M ${m.hipL_X - 1} ${m.hipY}
                     L ${m.hipR_X + 1} ${m.hipY}
                     L ${m.rightLegX + m.legW + 2} ${m.ankleY + 2}
                     L ${m.rightLegX - 2} ${m.ankleY + 2}
                     L 160 ${crotchY}
                     L ${m.leftLegX + m.legW + 2} ${m.ankleY + 2}
                     L ${m.leftLegX - 2} ${m.ankleY + 2} Z"
                  fill="url(#${uid}_bottomGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Pressed Crease Lines -->
            <line x1="${m.leftLegX + m.legW/2}" y1="${m.hipY + 10}" x2="${m.leftLegX + m.legW/2}" y2="${m.ankleY}" stroke="${shadow}" stroke-width="1.8" opacity="0.45" />
            <line x1="${m.rightLegX + m.legW/2}" y1="${m.hipY + 10}" x2="${m.rightLegX + m.legW/2}" y2="${m.ankleY}" stroke="${shadow}" stroke-width="1.8" opacity="0.45" />
          </g>
        `;
      }

      // Default Jeans
      return `
        <g id="${uid}_bottom" class="avatar-part-bottom">
          <path d="M ${m.hipL_X - 1} ${m.hipY}
                   L ${m.hipR_X + 1} ${m.hipY}
                   L ${m.rightLegX + m.legW + 2} ${m.ankleY + 2}
                   L ${m.rightLegX - 2} ${m.ankleY + 2}
                   L 160 ${crotchY}
                   L ${m.leftLegX + m.legW + 2} ${m.ankleY + 2}
                   L ${m.leftLegX - 2} ${m.ankleY + 2} Z"
                fill="url(#${uid}_bottomGrad)" filter="url(#${uid}_dropShadow)" />
          <!-- Rivets & Pockets -->
          <path d="M ${m.hipL_X + 4} ${m.hipY + 7} Q ${m.hipL_X + 14} ${m.hipY + 16} ${m.hipL_X + 22} ${m.hipY + 7}" stroke="${shadow}" stroke-width="1.8" fill="none" opacity="0.6" />
          <path d="M ${m.hipR_X - 4} ${m.hipY + 7} Q ${m.hipR_X - 14} ${m.hipY + 16} ${m.hipR_X - 22} ${m.hipY + 7}" stroke="${shadow}" stroke-width="1.8" fill="none" opacity="0.6" />
        </g>
      `;
    },

    // 7. Dresses (Full body coverage seamlessly from neckline to hem)
    dress(cfg, uid, colors, m) {
      if (!cfg.dress || cfg.dress === 'none') return '';

      const style = cfg.dress;
      const c = colors.dress;
      const shadow = c.shadow;

      if (style === 'dress_party' || style === 'dress_summer') {
        const skirtY = m.hipY + Math.round(m.legH * 0.58);
        return `
          <g id="${uid}_dress" class="avatar-part-dress">
            <!-- Bodice -->
            <path d="M ${m.neckL + 4} ${m.neckBaseY} 
                     L ${m.neckR - 4} ${m.neckBaseY} 
                     L ${m.waistR_X} ${m.waistY} 
                     L ${m.waistL_X} ${m.waistY} Z" 
                  fill="url(#${uid}_dressGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Flared Skirt -->
            <path d="M ${m.waistL_X} ${m.waistY} 
                     L ${m.waistR_X} ${m.waistY} 
                     L ${m.hipR_X + 22} ${skirtY} 
                     L ${m.hipL_X - 22} ${skirtY} Z" 
                  fill="url(#${uid}_dressGrad)" filter="url(#${uid}_dropShadow)" />
            <!-- Sparkle Belt -->
            <ellipse cx="160" cy="${m.waistY}" rx="${m.waistW/2 + 1}" ry="3.5" fill="#ffffff" opacity="0.6" />
          </g>
        `;
      } else if (style === 'dress_long' || style === 'dress_traditional' || style === 'dress_formal') {
        return `
          <g id="${uid}_dress" class="avatar-part-dress">
            <path d="M ${m.neckL} ${m.neckBaseY} 
                     L ${m.neckR} ${m.neckBaseY} 
                     L ${m.hipR_X + 16} ${m.ankleY} 
                     L ${m.hipL_X - 16} ${m.ankleY} Z" 
                  fill="url(#${uid}_dressGrad)" filter="url(#${uid}_dropShadow)" />
            <line x1="160" y1="${m.neckBaseY + 4}" x2="160" y2="${m.ankleY}" stroke="${shadow}" stroke-width="2" opacity="0.35" />
          </g>
        `;
      }

      // Default Casual Dress
      const skirtY = m.hipY + Math.round(m.legH * 0.52);
      return `
        <g id="${uid}_dress" class="avatar-part-dress">
          <path d="M ${m.neckL} ${m.neckBaseY} 
                   L ${m.neckR} ${m.neckBaseY} 
                   L ${m.hipR_X + 16} ${skirtY} 
                   L ${m.hipL_X - 16} ${skirtY} Z" 
                fill="url(#${uid}_dressGrad)" filter="url(#${uid}_dropShadow)" />
          <path d="M ${m.neckL} ${m.neckBaseY} Q 160 ${m.clavicleY + 5} ${m.neckR} ${m.neckBaseY} Z" fill="${shadow}" />
        </g>
      `;
    },

    // 8. Shoes & Footwear (Fully visible, seated on ground plane at soleY)
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
            <!-- Left Boot -->
            <path d="M ${lX} ${y - 14} L ${lX + m.legW + 6} ${y - 14} L ${lX + m.legW + 8} ${y + 20} L ${lX - 6} ${y + 20} L ${lX - 4} ${y + 8} Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
            <rect x="${lX - 8}" y="${y + 18}" width="${m.legW + 18}" height="6" rx="2" fill="${shadow}" />
            
            <!-- Right Boot -->
            <path d="M ${rX} ${y - 14} L ${rX + m.legW + 6} ${y - 14} L ${rX + m.legW + 10} ${y + 8} L ${rX + m.legW + 12} ${y + 20} L ${rX - 2} ${y + 20} Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
            <rect x="${rX - 4}" y="${y + 18}" width="${m.legW + 18}" height="6" rx="2" fill="${shadow}" />
          </g>
        `;
      } else if (style === 'shoes_sandals') {
        return `
          <g id="${uid}_shoes">
            <rect x="${lX - 4}" y="${y + 14}" width="${m.legW + 12}" height="6" rx="3" fill="${shadow}" />
            <line x1="${lX}" y1="${y + 14}" x2="${lX + m.legW + 4}" y2="${y + 14}" stroke="${main}" stroke-width="4" stroke-linecap="round" />
            <rect x="${rX}" y="${y + 14}" width="${m.legW + 12}" height="6" rx="3" fill="${shadow}" />
            <line x1="${rX + 4}" y1="${y + 14}" x2="${rX + m.legW + 8}" y2="${y + 14}" stroke="${main}" stroke-width="4" stroke-linecap="round" />
          </g>
        `;
      }

      // Default Sneakers / Sports / Casual
      return `
        <g id="${uid}_shoes">
          <!-- Left Sneaker -->
          <path d="M ${lX} ${y} L ${lX + m.legW + 4} ${y} L ${lX + m.legW + 5} ${y + 16} L ${lX - 8} ${y + 16} Q ${lX - 6} ${y + 7} ${lX} ${y} Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
          <!-- White Sole & Laces -->
          <rect x="${lX - 10}" y="${y + 15}" width="${m.legW + 17}" height="6" rx="3" fill="#ffffff" />
          <line x1="${lX + 2}" y1="${y + 5}" x2="${lX + m.legW - 2}" y2="${y + 5}" stroke="#ffffff" stroke-width="2" />

          <!-- Right Sneaker -->
          <path d="M ${rX} ${y} L ${rX + m.legW + 4} ${y} Q ${rX + m.legW + 10} ${y + 7} ${rX + m.legW + 12} ${y + 16} L ${rX - 1} ${y + 16} L ${rX} ${y} Z" fill="${main}" filter="url(#${uid}_dropShadow)" />
          <rect x="${rX - 3}" y="${y + 15}" width="${m.legW + 17}" height="6" rx="3" fill="#ffffff" />
          <line x1="${rX + 6}" y1="${y + 5}" x2="${rX + m.legW + 2}" y2="${y + 5}" stroke="#ffffff" stroke-width="2" />
        </g>
      `;
    },

    // 9. Glasses
    glasses(cfg, uid) {
      const style = cfg.glasses || 'none';
      if (style === 'none') return '';

      if (style === 'glasses_sunglasses') {
        return `
          <g id="${uid}_glasses">
            <rect x="128" y="94" width="28" height="18" rx="5" fill="#1e272e" opacity="0.95" />
            <rect x="164" y="94" width="28" height="18" rx="5" fill="#1e272e" opacity="0.95" />
            <line x1="156" y1="100" x2="164" y2="100" stroke="#1e272e" stroke-width="3" />
            <line x1="131" y1="97" x2="149" y2="109" stroke="#ffffff" stroke-width="2" opacity="0.4" />
            <line x1="167" y1="97" x2="185" y2="109" stroke="#ffffff" stroke-width="2" opacity="0.4" />
          </g>
        `;
      } else if (style === 'glasses_round') {
        return `
          <g id="${uid}_glasses">
            <circle cx="142" cy="103" r="13" fill="none" stroke="#2c3e50" stroke-width="2.5" />
            <circle cx="178" cy="103" r="13" fill="none" stroke="#2c3e50" stroke-width="2.5" />
            <path d="M 155 103 Q 160 100 165 103" stroke="#2c3e50" stroke-width="2.5" fill="none" />
          </g>
        `;
      } else if (style === 'glasses_square') {
        return `
          <g id="${uid}_glasses">
            <rect x="128" y="93" width="27" height="20" rx="4" fill="none" stroke="#2c3e50" stroke-width="2.5" />
            <rect x="165" y="93" width="27" height="20" rx="4" fill="none" stroke="#2c3e50" stroke-width="2.5" />
            <line x1="155" y1="101" x2="165" y2="101" stroke="#2c3e50" stroke-width="2.5" />
          </g>
        `;
      }

      // Default thin frame
      return `
        <g id="${uid}_glasses">
          <rect x="130" y="95" width="25" height="17" rx="4" fill="none" stroke="#e67e22" stroke-width="1.8" />
          <rect x="165" y="95" width="25" height="17" rx="4" fill="none" stroke="#e67e22" stroke-width="1.8" />
          <line x1="155" y1="101" x2="165" y2="101" stroke="#e67e22" stroke-width="1.8" />
        </g>
      `;
    },

    // 10. Headwear
    headwear(cfg, uid) {
      const style = cfg.headwear || 'none';
      if (style === 'none') return '';

      if (style === 'headwear_cap') {
        return `
          <g id="${uid}_headwear">
            <path d="M 115 78 C 115 36, 205 36, 205 78 Z" fill="#e74c3c" filter="url(#${uid}_dropShadow)" />
            <path d="M 113 78 Q 160 70 216 76 Q 228 82 210 86 Q 160 82 113 78 Z" fill="#c0392b" />
            <circle cx="160" cy="42" r="4" fill="#c0392b" />
          </g>
        `;
      } else if (style === 'headwear_beanie' || style === 'headwear_winter_hat') {
        return `
          <g id="${uid}_headwear">
            <circle cx="160" cy="28" r="11" fill="#f1c40f" />
            <path d="M 115 82 C 113 38, 207 38, 205 82 Z" fill="#2c3e50" filter="url(#${uid}_dropShadow)" />
            <rect x="111" y="76" width="98" height="13" rx="6" fill="#34495e" />
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
      } else if (style === 'headwear_headband') {
        return `
          <path d="M 115 84 C 115 54, 205 54, 205 84" stroke="#9b59b6" stroke-width="7" fill="none" stroke-linecap="round" />
        `;
      }
      return '';
    },

    // 11. Accessories
    accessories(cfg, uid, colors, m) {
      const style = cfg.accessory || 'none';
      if (style === 'none') return '';

      if (style === 'acc_headphones') {
        return `
          <g id="${uid}_accessories">
            <path d="M 110 106 C 110 35, 210 35, 210 106" stroke="#34495e" stroke-width="6" fill="none" />
            <rect x="104" y="93" width="12" height="25" rx="6" fill="#e74c3c" />
            <rect x="204" y="93" width="12" height="25" rx="6" fill="#e74c3c" />
          </g>
        `;
      } else if (style === 'acc_backpack') {
        return `
          <g id="${uid}_accessories">
            <path d="M ${m.shoulderL_X + 8} ${m.shoulderL_Y + 2} L ${m.waistL_X + 4} ${m.hipY - 8} M ${m.shoulderR_X - 8} ${m.shoulderR_Y + 2} L ${m.waistR_X - 4} ${m.hipY - 8}" stroke="#d35400" stroke-width="6" stroke-linecap="round" />
          </g>
        `;
      } else if (style === 'acc_necklace') {
        return `
          <path d="M 148 ${m.neckBaseY + 2} Q 160 ${m.clavicleY + 20} 172 ${m.neckBaseY + 2}" stroke="#f1c40f" stroke-width="2.5" fill="none" />
          <circle cx="160" cy="${m.clavicleY + 16}" r="4" fill="#e74c3c" />
        `;
      } else if (style === 'acc_earrings') {
        return `
          <circle cx="119" cy="118" r="3.5" fill="#f1c40f" />
          <circle cx="201" cy="118" r="3.5" fill="#f1c40f" />
        `;
      } else if (style === 'acc_watch') {
        const watchX = Math.round(m.rightArmX + m.armW + 1);
        const watchY = Math.round(m.handY - 12);
        return `
          <rect x="${watchX - 5}" y="${watchY}" width="10" height="4" rx="2" fill="#34495e" />
        `;
      }
      return '';
    },

    // 12. Special Held Items
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
      } else if (item === 'item_pencil') {
        return `
          <g id="${uid}_item" transform="translate(${m.leftArmX - 20}, ${handY - 32}) rotate(-45)">
            <rect x="0" y="0" width="7" height="34" rx="1" fill="#f39c12" />
            <polygon points="0,34 7,34 3.5,44" fill="#f5cba7" />
            <polygon points="2.5,41 4.5,41 3.5,44" fill="#2c3e50" />
          </g>
        `;
      }
      return '';
    },

    // 13. Physical Winner Awards Held in Hand (Leaderboard Game-Show Mode)
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
            <!-- Hand Grip -->
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
     * Generates a complete 3D Layered SVG string with 100% full-body visibility from head to shoes
     */
    renderSvg(rawConfig, options = {}) {
      const mode = options.mode || 'full';
      const animated = options.animated !== false;
      const award = options.heldAward || options.award || (rawConfig && rawConfig.heldAward) || null;
      const config = Object.assign({}, DEFAULT_CONFIGS.boy, rawConfig || {});
      const colors = this.resolveColors(config);
      const m = getBodyMetrics(config.body || 'regular');
      const uid = getUid('av_' + mode);

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
        // Optimized Portrait Crop for Table Badges & Mini Avatars
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
              ${Layers.glasses(config, uid)}
              ${Layers.headwear(config, uid)}
              ${Layers.accessories(config, uid, colors, m)}
            </g>
          </svg>
        `;
      }

      // Complete Realistic Full-Body Avatar View (0 0 320 420)
      return `
        <svg viewBox="0 0 320 420" preserveAspectRatio="xMidYMid meet" class="quizspark-avatar-svg avatar-full-svg ${animated ? 'avatar-animated' : ''}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Student 3D Character Avatar">
          ${defs}
          <g id="${uid}_avatar_root">
            ${Layers.groundShadow(uid, m)}
            
            <g class="avatar-breath-group">
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
                ${Layers.glasses(config, uid)}
                ${Layers.headwear(config, uid)}
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

    getDefault(style = 'boy') {
      return Object.assign({}, DEFAULT_CONFIGS[style] || DEFAULT_CONFIGS.boy);
    },

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

  global.AvatarEngine = AvatarEngine;
})(typeof window !== 'undefined' ? window : this);
