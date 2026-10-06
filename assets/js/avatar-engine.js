/**
 * QuizSpark 3D Cartoon Avatar System - WebGL Three.js Engine
 * 
 * Polished, cute 3D cartoon avatar matching clean chibi/game proportions.
 * Features:
 * - Large rounded head, open friendly face with glossy cartoon eyes, sparkles, nose, smile, ears & blush
 * - Seamless rounded cartoon body, shoulders, arms, mitten hands, legs, and chunky sneakers
 * - Real 3D geometry for all customization categories (hair, glasses, hats, tops, bottoms, dresses, shoes, facial hair, accessories)
 * - Direct 360° touch/mouse drag rotation with smooth damping inertia
 * - Full color customization with palettes & custom hex color support
 */
(function (global) {
  'use strict';

  // 1. Color Palettes
  const PALETTES = {
    skin: {
      skin_01: { main: '#fed8be', shadow: '#dfa680', highlight: '#fff0e4', tone: 'Fair Warm', hex: 0xfed8be },
      skin_02: { main: '#f6c59b', shadow: '#d49460', highlight: '#fde5cf', tone: 'Light Peach', hex: 0xf6c59b },
      skin_03: { main: '#e8a87c', shadow: '#bc7342', highlight: '#f5cbb0', tone: 'Warm Peach', hex: 0xe8a87c },
      skin_04: { main: '#d48f58', shadow: '#a65e2b', highlight: '#e8b58f', tone: 'Golden Tan', hex: 0xd48f58 },
      skin_05: { main: '#b8733a', shadow: '#884919', highlight: '#d39868', tone: 'Warm Honey', hex: 0xb8733a },
      skin_06: { main: '#925424', shadow: '#62310f', highlight: '#b17445', tone: 'Rich Bronze', hex: 0x925424 },
      skin_07: { main: '#6d3813', shadow: '#421d07', highlight: '#8d542c', tone: 'Deep Chestnut', hex: 0x6d3813 },
      skin_08: { main: '#48220a', shadow: '#281103', highlight: '#673919', tone: 'Espresso', hex: 0x48220a },
      skin_09: { main: '#ffe0cb', shadow: '#e1b194', highlight: '#fff5ee', tone: 'Ivory Fair', hex: 0xffe0cb },
      skin_10: { main: '#a95f2d', shadow: '#773a14', highlight: '#c7804f', tone: 'Caramel Bronze', hex: 0xa95f2d }
    },
    hairColor: {
      black: { main: '#22252a', shadow: '#111215', highlight: '#444b54', label: 'Midnight Black', hex: 0x22252a },
      dark_brown: { main: '#3e2417', shadow: '#241209', highlight: '#5e3825', label: 'Dark Brown', hex: 0x3e2417 },
      brown: { main: '#6e472f', shadow: '#4a2d1b', highlight: '#916345', label: 'Chestnut Brown', hex: 0x6e472f },
      light_brown: { main: '#9c6b45', shadow: '#6e4425', highlight: '#bc8a63', label: 'Light Brown', hex: 0x9c6b45 },
      blonde: { main: '#f6ca45', shadow: '#bf941f', highlight: '#fbe27f', label: 'Golden Blonde', hex: 0xf6ca45 },
      platinum: { main: '#f0f3f6', shadow: '#c5cbce', highlight: '#ffffff', label: 'Platinum', hex: 0xf0f3f6 },
      dark_blonde: { main: '#d4aa3b', shadow: '#9a751a', highlight: '#e8c76c', label: 'Honey Blonde', hex: 0xd4aa3b },
      red: { main: '#d63031', shadow: '#961d1d', highlight: '#e17055', label: 'Crimson Red', hex: 0xd63031 },
      auburn: { main: '#9b3d26', shadow: '#6b2413', highlight: '#c8563a', label: 'Warm Auburn', hex: 0x9b3d26 },
      grey: { main: '#8395a7', shadow: '#576574', highlight: '#c8d6e5', label: 'Silver Grey', hex: 0x8395a7 },
      white: { main: '#f5f6fa', shadow: '#dcdde1', highlight: '#ffffff', label: 'Snow White', hex: 0xf5f6fa },
      blue: { main: '#0984e3', shadow: '#0652dd', highlight: '#74b9ff', label: 'Electric Blue', hex: 0x0984e3 },
      purple: { main: '#8854d0', shadow: '#5f27cd', highlight: '#a55eea', label: 'Royal Purple', hex: 0x8854d0 },
      pink: { main: '#e84393', shadow: '#ad1457', highlight: '#fd79a8', label: 'Bubblegum Pink', hex: 0xe84393 },
      green: { main: '#00b894', shadow: '#006266', highlight: '#55efc4', label: 'Mint Green', hex: 0x00b894 },
      teal: { main: '#00cec9', shadow: '#00838f', highlight: '#81ecec', label: 'Ocean Teal', hex: 0x00cec9 },
      coral: { main: '#ff7675', shadow: '#d63031', highlight: '#fab1a0', label: 'Sunset Coral', hex: 0xff7675 }
    },
    eyeColor: {
      brown: '#5c3d2e',
      dark_brown: '#2b160d',
      blue: '#227093',
      sky_blue: '#34ace0',
      green: '#218c74',
      emerald: '#33d9b2',
      hazel: '#b33939',
      grey: '#706fd3',
      amber: '#cd6133',
      violet: '#706fd3'
    },
    clothing: {
      blue: { main: '#3867d6', shadow: '#1b3882', highlight: '#54a0ff', label: 'Royal Blue', hex: 0x3867d6 },
      purple: { main: '#8854d0', shadow: '#4d1e9e', highlight: '#a55eea', label: 'Deep Purple', hex: 0x8854d0 },
      red: { main: '#eb3b5a', shadow: '#961b30', highlight: '#fc5c65', label: 'Vibrant Red', hex: 0xeb3b5a },
      yellow: { main: '#fed330', shadow: '#c49e08', highlight: '#ffeaa7', label: 'Warm Yellow', hex: 0xfed330 },
      green: { main: '#20bf6b', shadow: '#0f7540', highlight: '#26de81', label: 'Fresh Green', hex: 0x20bf6b },
      coral: { main: '#fa8231', shadow: '#a64f14', highlight: '#fd9644', label: 'Coral Orange', hex: 0xfa8231 },
      black: { main: '#2d3436', shadow: '#1e272e', highlight: '#636e72', label: 'Onyx Black', hex: 0x2d3436 },
      white: { main: '#f1f2f6', shadow: '#ced6e0', highlight: '#ffffff', label: 'Clean White', hex: 0xf1f2f6 },
      teal: { main: '#0fb9b1', shadow: '#096e6a', highlight: '#2bcbba', label: 'Aqua Teal', hex: 0x0fb9b1 },
      navy: { main: '#1e3799', shadow: '#0a1a54', highlight: '#4a69bd', label: 'Classic Navy', hex: 0x1e3799 },
      crimson: { main: '#b71540', shadow: '#59051b', highlight: '#e55039', label: 'Ruby Crimson', hex: 0xb71540 },
      emerald: { main: '#009432', shadow: '#004a19', highlight: '#2ed573', label: 'Emerald', hex: 0x009432 },
      denim: { main: '#4b6584', shadow: '#2c3e50', highlight: '#778ca3', label: 'Denim Indigo', hex: 0x4b6584 },
      khaki: { main: '#d1ccc0', shadow: '#84817a', highlight: '#f7f1e3', label: 'Khaki Beige', hex: 0xd1ccc0 },
      grey: { main: '#778ca3', shadow: '#4b6584', highlight: '#a5b1c2', label: 'Slate Grey', hex: 0x778ca3 },
      pink: { main: '#fd79a8', shadow: '#b83b68', highlight: '#ffb8d2', label: 'Pastel Pink', hex: 0xfd79a8 },
      gold: { main: '#f39c12', shadow: '#b9770e', highlight: '#f1c40f', label: 'Goldenrod', hex: 0xf39c12 },
      ruby: { main: '#c0392b', shadow: '#5e130b', highlight: '#e74c3c', label: 'Dark Ruby', hex: 0xc0392b },
      leather: { main: '#4b382a', shadow: '#271c14', highlight: '#735741', label: 'Dark Leather', hex: 0x4b382a },
      olive: { main: '#6b8e23', shadow: '#3f5611', highlight: '#8ab438', label: 'Military Olive', hex: 0x6b8e23 }
    }
  };

  function parseColor(colorVal, defaultHex = 0x3867d6) {
    if (!colorVal) return new THREE.Color(defaultHex);
    if (colorVal instanceof THREE.Color) return colorVal;
    if (typeof colorVal === 'number') return new THREE.Color(colorVal);

    if (typeof colorVal === 'string') {
      if (PALETTES.clothing[colorVal]) return new THREE.Color(PALETTES.clothing[colorVal].hex);
      if (PALETTES.hairColor[colorVal]) return new THREE.Color(PALETTES.hairColor[colorVal].hex);
      if (PALETTES.skin[colorVal]) return new THREE.Color(PALETTES.skin[colorVal].hex);
      if (PALETTES.eyeColor[colorVal]) return new THREE.Color(PALETTES.eyeColor[colorVal]);
      if (colorVal.startsWith('#')) return new THREE.Color(colorVal);
    }
    return new THREE.Color(defaultHex);
  }

  function deriveShades(hexColor, defaultObj) {
    if (!hexColor || typeof hexColor !== 'string') return defaultObj;
    if (PALETTES.clothing[hexColor]) return PALETTES.clothing[hexColor];
    if (PALETTES.hairColor[hexColor]) return PALETTES.hairColor[hexColor];
    if (!hexColor.startsWith('#')) return defaultObj;

    let c = hexColor.substring(1);
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return defaultObj;

    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    const shadow = `rgb(${Math.max(0, Math.round(r * 0.58))},${Math.max(0, Math.round(g * 0.58))},${Math.max(0, Math.round(g * 0.58))})`;
    const highlight = `rgb(${Math.min(255, Math.round(r * 1.3 + 30))},${Math.min(255, Math.round(g * 1.3 + 30))},${Math.min(255, Math.round(b * 1.3 + 30))})`;

    return { main: hexColor, shadow, highlight, label: 'Custom', hex: num };
  }

  // 2. Default Configs (Exact 3 Boys and 3 Girls)
  const DEFAULT_CONFIGS = {
    boy: {
      avatar_id: 'boy1',
      style: 'boy', body: 'regular', skin: 'skin_03', face: 'face_round',
      hair: 'hair_boy_short', hairColor: 'dark_brown', eyes: 'eyes_friendly', eyeColor: 'brown',
      eyebrows: 'brows_natural', nose: 'nose_small', mouth: 'mouth_smile', freckles: 'none',
      facialHair: 'none', facialHairColor: 'black',
      top: 'top_casual', topColor: 'blue', bottom: 'bottom_jeans', bottomColor: 'denim',
      dress: 'none', dressColor: 'blue', shoes: 'shoes_sneakers', shoeColor: 'white',
      headwear: 'none', headwearColor: 'red', glasses: 'none', glassesColor: 'black',
      accessory: 'acc_headphones', accessoryColor: 'blue', specialItem: 'none', rotation: 'front', zoom: 1
    },
    girl: {
      avatar_id: 'girl1',
      style: 'girl', body: 'regular', skin: 'skin_02', face: 'face_oval',
      hair: 'hair_girl_wavy', hairColor: 'dark_brown', eyes: 'eyes_bright', eyeColor: 'brown',
      eyebrows: 'brows_curved', nose: 'nose_small', mouth: 'mouth_smile', freckles: 'freckles_cheeks',
      facialHair: 'none', facialHairColor: 'black',
      top: 'top_casual', topColor: 'purple', bottom: 'bottom_jeans', bottomColor: 'denim',
      dress: 'none', dressColor: 'purple', shoes: 'shoes_sneakers', shoeColor: 'white',
      headwear: 'none', headwearColor: 'gold', glasses: 'none', glassesColor: 'black',
      accessory: 'acc_earrings', accessoryColor: 'gold', specialItem: 'none', rotation: 'front', zoom: 1
    }
  };

  function createToonMaterial(color, options = {}) {
    return new THREE.MeshStandardMaterial(Object.assign({
      color: parseColor(color),
      roughness: 0.55,
      metalness: 0.05,
      flatShading: false
    }, options));
  }

  function createMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  function disposeGroup(group) {
    if (!group) return;
    group.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  }

  /**
   * 3D Cartoon Avatar Character Rig & Geometry Builder
   */
  class AvatarCharacter3D {
    constructor(config = {}, options = {}) {
      this.config = Object.assign({}, DEFAULT_CONFIGS.boy, config);
      this.options = options;
      this.mode = options.mode || 'full';
      this.group = new THREE.Group();
      this.sockets = {};
      this.materials = {};
      this.animTime = Math.random() * 10;

      this.buildBaseCharacter();
      this.update(this.config);
    }

    buildBaseCharacter() {
      this.characterRoot = new THREE.Group();
      this.group.add(this.characterRoot);

      // Ground Contact Shadow
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 128;
      shadowCanvas.height = 128;
      const ctx = shadowCanvas.getContext('2d');
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.16)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);

      const shadowTex = new THREE.CanvasTexture(shadowCanvas);
      const shadowGeo = new THREE.PlaneGeometry(0.72, 0.72);
      const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
      this.groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
      this.groundShadow.rotation.x = -Math.PI / 2;
      this.groundShadow.position.y = 0.002;
      this.group.add(this.groundShadow);

      // Skin Material
      this.skinMat = createToonMaterial(0xf4ba88, { roughness: 0.58 });

      // SKELETAL HIERARCHY (~1.65m Total Height)
      // Shoes: 0.00 -> 0.06
      // Legs: 0.06 -> 0.62 (Legs length 0.56)
      // Pelvis: 0.55 -> 0.75 (Pelvis group at Y = 0.65)
      // Torso: 0.73 -> 1.11 (Torso group at Y = 0.10 in pelvis -> Y_world = 0.75)
      // Neck: 1.09 -> 1.18 (Neck group at Y = 0.35 in torso -> Y_world = 1.10)
      // Head: 1.09 -> 1.51 (Head group at Y = 0.07 in neck -> Y_world = 1.17, center at 1.30)
      this.pelvisGroup = new THREE.Group();
      this.pelvisGroup.position.set(0, 0.65, 0);
      this.characterRoot.add(this.pelvisGroup);

      this.torsoGroup = new THREE.Group();
      this.torsoGroup.position.set(0, 0.10, 0); // World Y = 0.75
      this.pelvisGroup.add(this.torsoGroup);

      this.neckGroup = new THREE.Group();
      this.neckGroup.position.set(0, 0.35, 0); // World Y = 1.10
      this.torsoGroup.add(this.neckGroup);

      this.headGroup = new THREE.Group();
      this.headGroup.position.set(0, 0.05, 0); // World Y = 1.15 (Head center Y ~1.25)
      this.headGroup.scale.set(0.75, 0.75, 0.75);
      this.neckGroup.add(this.headGroup);

      // Sockets
      this.sockets.head = new THREE.Group();
      this.headGroup.add(this.sockets.head);

      this.sockets.face = new THREE.Group();
      this.headGroup.add(this.sockets.face);

      this.sockets.hair = new THREE.Group();
      this.headGroup.add(this.sockets.hair);

      this.sockets.glasses = new THREE.Group();
      this.headGroup.add(this.sockets.glasses);

      this.sockets.headAccessories = new THREE.Group();
      this.headGroup.add(this.sockets.headAccessories);

      // Arm Groups attached at natural shoulder level (Y_world = 1.05)
      this.armLGroup = new THREE.Group();
      this.armLGroup.position.set(-0.22, 0.30, 0);
      this.torsoGroup.add(this.armLGroup);

      this.armRGroup = new THREE.Group();
      this.armRGroup.position.set(0.22, 0.30, 0);
      this.torsoGroup.add(this.armRGroup);

      // Leg Groups attached firmly under pelvis (Y_world = 0.62)
      this.legLGroup = new THREE.Group();
      this.legLGroup.position.set(-0.095, -0.03, 0);
      this.pelvisGroup.add(this.legLGroup);

      this.legRGroup = new THREE.Group();
      this.legRGroup.position.set(0.095, -0.03, 0);
      this.pelvisGroup.add(this.legRGroup);

      // Outfit & Body Sockets
      this.sockets.top = new THREE.Group();
      this.torsoGroup.add(this.sockets.top);

      this.sockets.bottom = new THREE.Group();
      this.pelvisGroup.add(this.sockets.bottom);

      this.sockets.shoes = new THREE.Group();
      this.characterRoot.add(this.sockets.shoes);

      this.sockets.torsoAccessories = new THREE.Group();
      this.torsoGroup.add(this.sockets.torsoAccessories);

      this.sockets.armAccessories = new THREE.Group();
      this.armLGroup.add(this.sockets.armAccessories);

      this.sockets.handAccessories = new THREE.Group();
      this.armRGroup.add(this.sockets.handAccessories);

      // --- BASE GEOMETRY ---

      // 1. Proportional 3D Cartoon Head (Radius 0.21, ~25.4% total avatar height)
      const headGeo = new THREE.SphereGeometry(0.21, 32, 28);
      headGeo.scale(1.0, 1.04, 0.98);
      headGeo.translate(0, 0.13, 0);
      this.headMesh = createMesh(headGeo, this.skinMat);
      this.headGroup.add(this.headMesh);

      // Ears (Left & Right)
      const earGeo = new THREE.SphereGeometry(0.046, 16, 14);
      earGeo.scale(0.35, 1.15, 0.8);
      const earL = createMesh(earGeo, this.skinMat);
      earL.position.set(-0.205, 0.13, 0.012);
      earL.rotation.y = 0.2;
      this.headGroup.add(earL);

      const earR = createMesh(earGeo, this.skinMat);
      earR.position.set(0.205, 0.13, 0.012);
      earR.rotation.y = -0.2;
      this.headGroup.add(earR);

      // 2. Compact Cute Neck
      const neckGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.09, 20);
      neckGeo.translate(0, 0.035, 0);
      this.neckMesh = createMesh(neckGeo, this.skinMat);
      this.neckGroup.add(this.neckMesh);

      // 3. Torso Base Body (Smooth tapered shape)
      const torsoGeo = new THREE.CylinderGeometry(0.18, 0.195, 0.36, 24);
      torsoGeo.scale(1.08, 1.0, 0.86);
      torsoGeo.translate(0, 0.18, 0);
      this.torsoMesh = createMesh(torsoGeo, this.skinMat);
      this.torsoGroup.add(this.torsoMesh);

      // Pelvis Base
      const pelvisGeo = new THREE.CylinderGeometry(0.19, 0.175, 0.20, 24);
      pelvisGeo.scale(1.06, 1.0, 0.85);
      pelvisGeo.translate(0, 0.01, 0);
      this.pelvisMesh = createMesh(pelvisGeo, this.skinMat);
      this.pelvisGroup.add(this.pelvisMesh);

      // 4. Arms & Hands
      [-1, 1].forEach(sign => {
        const armParent = sign === -1 ? this.armLGroup : this.armRGroup;

        // Shoulder joint
        const shoulderGeo = new THREE.SphereGeometry(0.058, 16, 14);
        const shoulder = createMesh(shoulderGeo, this.skinMat);
        armParent.add(shoulder);

        // Arm segment
        const armGeo = new THREE.CylinderGeometry(0.048, 0.040, 0.34, 16);
        armGeo.translate(0, -0.17, 0);
        const arm = createMesh(armGeo, this.skinMat);
        armParent.add(arm);

        // Hand (Palm)
        const handGeo = new THREE.SphereGeometry(0.044, 16, 14);
        handGeo.scale(0.9, 1.1, 0.85);
        handGeo.translate(0, -0.37, 0.01);
        const hand = createMesh(handGeo, this.skinMat);
        armParent.add(hand);

        // Thumb
        const thumbGeo = new THREE.SphereGeometry(0.020, 12, 10);
        thumbGeo.scale(0.8, 1.3, 0.8);
        const thumb = createMesh(thumbGeo, this.skinMat);
        thumb.position.set(sign * 0.032, -0.35, 0.03);
        thumb.rotation.z = sign * -0.4;
        armParent.add(thumb);
      });

      // Natural Arm Posture
      this.armLGroup.position.set(-0.22, 0.30, 0);
      this.armRGroup.position.set(0.22, 0.30, 0);
      this.armLGroup.rotation.z = 0.12;
      this.armLGroup.rotation.x = 0.05;
      this.armRGroup.rotation.z = -0.12;
      this.armRGroup.rotation.x = 0.05;

      // 5. Legs
      [-1, 1].forEach(sign => {
        const legParent = sign === -1 ? this.legLGroup : this.legRGroup;
        const legGeo = new THREE.CylinderGeometry(0.068, 0.052, 0.56, 20);
        legGeo.translate(0, -0.28, 0);
        const leg = createMesh(legGeo, this.skinMat);
        legParent.add(leg);
      });
    }

    update(config) {
      this.config = Object.assign({}, this.config, config);
      const cfg = this.config;

      // 1. Skin tone
      const skinObj = PALETTES.skin[cfg.skin] || deriveShades(cfg.skin, PALETTES.skin.skin_03);
      const skinColor = parseColor(skinObj.main || cfg.skin);
      this.skinMat.color.copy(skinColor);

      // Body / Face Shape Proportions
      this.applyBodyShape(cfg.body);
      this.applyFaceShape(cfg.face);

      // Arm Posture update (Winner Award / Celebration / Normal)
      if (this.options.heldAward === 'trophy_gold') {
        this.armRGroup.rotation.set(-0.35, -0.2, -1.2);
        this.armLGroup.rotation.set(0.05, 0, 0.12);
      } else if (this.options.celebrate) {
        this.armLGroup.rotation.set(-0.35, 0.2, 1.15);
        this.armRGroup.rotation.set(-0.35, -0.2, -1.15);
      } else {
        this.armLGroup.rotation.set(0.05, 0, 0.12);
        this.armRGroup.rotation.set(0.05, 0, -0.12);
      }

      // 2. Face Features
      this.buildFaceFeatures(cfg);

      // 3. Hairstyles
      this.buildHairstyle(cfg);

      // 4. Spectacles / Glasses
      this.buildGlasses(cfg);

      // 5. Hats & Headwear
      this.buildHeadwear(cfg);

      // 6. Tops & Shirts
      this.buildTops(cfg);

      // 7. Bottoms & Lowers
      this.buildBottoms(cfg);

      // 8. Dresses
      this.buildDress(cfg);

      // 9. Shoes
      this.buildShoes(cfg);

      // 10. Facial Hair
      this.buildFacialHair(cfg);

      // 11. Accessories
      this.buildAccessories(cfg);
    }

    applyBodyShape(shape = 'regular') {
      let sx = 1.0, sy = 1.0, sz = 1.0;
      if (shape === 'slim') {
        sx = 0.94; sy = 1.01; sz = 0.94;
      } else if (shape === 'athletic') {
        sx = 1.06; sy = 1.01; sz = 1.03;
      } else if (shape === 'soft') {
        sx = 1.08; sy = 0.99; sz = 1.08;
      } else if (shape === 'tall') {
        sx = 0.97; sy = 1.06; sz = 0.97;
      } else if (shape === 'short') {
        sx = 1.03; sy = 0.94; sz = 1.03;
      }
      this.characterRoot.scale.set(sx, sy, sz);
    }

    applyFaceShape(shape = 'face_round') {
      if (!this.headMesh) return;
      let sx = 1.0, sy = 1.04, sz = 0.98;
      if (shape === 'face_oval') {
        sx = 0.96; sy = 1.09; sz = 0.96;
      } else if (shape === 'face_square') {
        sx = 1.05; sy = 1.00; sz = 1.01;
      } else if (shape === 'face_soft') {
        sx = 1.02; sy = 1.02; sz = 1.01;
      } else if (shape === 'face_long') {
        sx = 0.94; sy = 1.12; sz = 0.95;
      } else if (shape === 'face_wide') {
        sx = 1.06; sy = 0.98; sz = 1.01;
      } else if (shape === 'face_heart') {
        sx = 1.03; sy = 1.04; sz = 0.97;
      } else if (shape === 'face_diamond' || shape === 'face_chiseled') {
        sx = 1.01; sy = 1.06; sz = 0.99;
      }
      this.headMesh.scale.set(sx, sy, sz);
    }

    /**
     * Expressive 3D Face Features
     */
    buildFaceFeatures(cfg) {
      disposeGroup(this.sockets.face);
      this.sockets.face.clear();

      const eyeColorHex = parseColor(cfg.eyeColor || 'brown');
      const hairColorHex = parseColor(cfg.hairColor || 'dark_brown');
      const eyeStyle = cfg.eyes || 'eyes_friendly';
      const browStyle = cfg.eyebrows || 'brows_natural';
      const mouthStyle = cfg.mouth || 'mouth_smile';
      const noseStyle = cfg.nose || 'nose_medium';

      const g = this.sockets.face;

      // 1. Rosy Cheeks (Blush)
      const blushMat = new THREE.MeshBasicMaterial({
        color: 0xff6b81,
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      });
      [-1, 1].forEach(sign => {
        const blushGeo = new THREE.SphereGeometry(0.036, 14, 10);
        blushGeo.scale(1.2, 0.7, 0.2);
        const blush = new THREE.Mesh(blushGeo, blushMat);
        blush.position.set(sign * 0.110, 0.088, 0.188);
        blush.rotation.y = sign * 0.3;
        g.add(blush);
      });

      // 2. 3D Cartoon Eyes
      const eyeR = (eyeStyle === 'eyes_large' || eyeStyle === 'eyes_cartoon') ? 0.044 : (eyeStyle === 'eyes_small' ? 0.034 : 0.040);
      const eyeSpacing = 0.072;

      [-1, 1].forEach(sign => {
        const eyeGroup = new THREE.Group();
        eyeGroup.position.set(sign * eyeSpacing, 0.142, 0.194);
        eyeGroup.rotation.y = sign * 0.14;

        if (eyeStyle === 'eyes_wink' && sign === 1) {
          const winkGeo = new THREE.TorusGeometry(eyeR * 0.85, 0.006, 8, 16, Math.PI * 0.85);
          winkGeo.rotateZ(Math.PI * 0.08);
          const winkMesh = createMesh(winkGeo, new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.4 }));
          winkMesh.position.set(0, -0.006, 0.015);
          eyeGroup.add(winkMesh);
        } else {
          // White Sclera
          const scleraGeo = new THREE.SphereGeometry(eyeR, 20, 16);
          scleraGeo.scale(1.0, 1.15, 0.45);
          const sclera = createMesh(scleraGeo, new THREE.MeshStandardMaterial({ color: 0xfcfdfd, roughness: 0.2, metalness: 0.02 }));
          eyeGroup.add(sclera);

          // Dark Upper Eyelid Rim
          const lidGeo = new THREE.TorusGeometry(eyeR * 0.98, 0.005, 8, 16, Math.PI * 0.90);
          lidGeo.rotateZ(Math.PI * 0.05);
          const lidMesh = createMesh(lidGeo, new THREE.MeshStandardMaterial({ color: 0x202428, roughness: 0.5 }));
          lidMesh.position.set(0, eyeR * 0.15, 0.015);
          eyeGroup.add(lidMesh);

          // Colored Iris
          const irisR = eyeR * 0.70;
          const irisGeo = new THREE.SphereGeometry(irisR, 18, 14);
          irisGeo.scale(1.0, 1.08, 0.16);
          const iris = createMesh(irisGeo, new THREE.MeshStandardMaterial({ color: eyeColorHex, roughness: 0.25 }));
          iris.position.set(0, 0, 0.016);
          eyeGroup.add(iris);

          // Deep Black Pupil
          const pupilR = irisR * 0.50;
          const pupilGeo = new THREE.SphereGeometry(pupilR, 14, 12);
          pupilGeo.scale(1.0, 1.0, 0.12);
          const pupil = new THREE.Mesh(pupilGeo, new THREE.MeshBasicMaterial({ color: 0x111215 }));
          pupil.position.set(0, 0, 0.022);
          eyeGroup.add(pupil);

          // Sparkle Highlights
          const glint1 = new THREE.Mesh(new THREE.SphereGeometry(pupilR * 0.44, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
          glint1.position.set(pupilR * 0.35, pupilR * 0.40, 0.026);
          eyeGroup.add(glint1);

          const glint2 = new THREE.Mesh(new THREE.SphereGeometry(pupilR * 0.22, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
          glint2.position.set(-pupilR * 0.30, -pupilR * 0.35, 0.026);
          eyeGroup.add(glint2);

          // Girl Lashes
          if (cfg.style === 'girl' || eyeStyle === 'eyes_cateye' || eyeStyle === 'eyes_bright') {
            const lashGeo = new THREE.BoxGeometry(0.025, 0.005, 0.010);
            lashGeo.rotateZ(sign * 0.35);
            const lash = new THREE.Mesh(lashGeo, new THREE.MeshBasicMaterial({ color: 0x22252a }));
            lash.position.set(sign * 0.022, eyeR * 0.95, 0.016);
            eyeGroup.add(lash);
          }
        }

        g.add(eyeGroup);
      });

      // 3. Eyebrows
      const browThick = (browStyle === 'brows_thick' || browStyle === 'brows_bushy') ? 0.012 : (browStyle === 'brows_thin' ? 0.006 : 0.009);
      const browAngle = (browStyle === 'brows_curved' || browStyle === 'brows_arched') ? 0.15 : (browStyle === 'brows_raised' ? 0.24 : 0.06);

      [-1, 1].forEach(sign => {
        const browGeo = new THREE.BoxGeometry(0.052, browThick, 0.014);
        const brow = createMesh(browGeo, new THREE.MeshStandardMaterial({ color: hairColorHex, roughness: 0.8 }));
        brow.position.set(sign * eyeSpacing, 0.205, 0.196);
        brow.rotation.z = -sign * browAngle;
        brow.rotation.y = sign * 0.12;
        g.add(brow);
      });

      // 4. Cute Button Nose
      const noseLen = (noseStyle === 'nose_small' || noseStyle === 'nose_button') ? 0.015 : 0.020;
      const noseGeo = new THREE.SphereGeometry(noseLen, 14, 12);
      noseGeo.scale(1.1, 0.9, 1.2);
      const noseMat = createToonMaterial(this.skinMat.color.clone().offsetHSL(0, 0.08, -0.07));
      const nose = createMesh(noseGeo, noseMat);
      nose.position.set(0, 0.102, 0.220);
      g.add(nose);

      // 5. Smiling Mouth
      if (mouthStyle === 'mouth_big_smile' || mouthStyle === 'mouth_laugh' || mouthStyle === 'mouth_grin') {
        const mouthGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.012, 20, 1, false, 0, Math.PI);
        mouthGeo.rotateX(-Math.PI / 2);
        const mouth = createMesh(mouthGeo, new THREE.MeshStandardMaterial({ color: 0x8b1e15 }));
        mouth.position.set(0, 0.054, 0.206);
        g.add(mouth);

        const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.009, 0.008), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        teeth.position.set(0, 0.060, 0.212);
        g.add(teeth);
      } else {
        const smileGeo = new THREE.TorusGeometry(0.030, 0.006, 10, 24, Math.PI * 0.78);
        smileGeo.rotateZ(-Math.PI * 0.89);
        const smile = createMesh(smileGeo, new THREE.MeshStandardMaterial({ color: 0xd63031, roughness: 0.35 }));
        smile.position.set(0, 0.060, 0.210);
        g.add(smile);
      }

      // 6. Freckles / Marks
      const marks = cfg.freckles || 'none';
      if (marks === 'freckles_light' || marks === 'freckles_cheeks') {
        const dotMat = new THREE.MeshBasicMaterial({ color: 0xa86538 });
        [
          [-0.08, 0.095, 0.204], [-0.11, 0.085, 0.194], [-0.06, 0.075, 0.208],
          [0.08, 0.095, 0.204], [0.11, 0.085, 0.194], [0.06, 0.075, 0.208]
        ].forEach(pos => {
          const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0035, 6, 6), dotMat);
          dot.position.set(...pos);
          g.add(dot);
        });
      } else if (marks === 'beauty_spot_left') {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 8, 8), new THREE.MeshBasicMaterial({ color: 0x3d2314 }));
        dot.position.set(-0.08, 0.055, 0.208);
        g.add(dot);
      } else if (marks === 'beauty_spot_right') {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 8, 8), new THREE.MeshBasicMaterial({ color: 0x3d2314 }));
        dot.position.set(0.08, 0.055, 0.208);
        g.add(dot);
      }
    }

    /**
     * 3D Cartoon Hairstyles
     */
    buildHairstyle(cfg) {
      disposeGroup(this.sockets.hair);
      this.sockets.hair.clear();

      const style = cfg.hair || 'hair_boy_short';
      if (style === 'none') return;

      const hairColorHex = parseColor(cfg.hairColor || 'dark_brown');
      const mat = createToonMaterial(hairColorHex, { roughness: 0.45, metalness: 0.05 });
      const g = this.sockets.hair;

      // Crown Hair Cap
      const capGeo = new THREE.SphereGeometry(0.222, 28, 22, 0, Math.PI * 2, 0, Math.PI * 0.42);
      capGeo.scale(1.02, 1.05, 1.02);
      capGeo.translate(0, 0.17, -0.02);
      g.add(createMesh(capGeo, mat));

      // Back of head shell
      const backGeo = new THREE.SphereGeometry(0.222, 24, 18, 0, Math.PI * 2, Math.PI * 0.38, Math.PI * 0.32);
      backGeo.scale(1.02, 1.05, 1.02);
      backGeo.translate(0, 0.15, -0.03);
      g.add(createMesh(backGeo, mat));

      if (style === 'hair_boy_short' || style === 'hair_boy_crew') {
        // Front bangs
        const bangsGeo = new THREE.SphereGeometry(0.075, 12, 10);
        bangsGeo.scale(2.2, 0.5, 0.8);
        bangsGeo.translate(0, 0.27, 0.15);
        g.add(createMesh(bangsGeo, mat));

        // Sideburns
        [-1, 1].forEach(sign => {
          const sideGeo = new THREE.BoxGeometry(0.028, 0.08, 0.045);
          sideGeo.translate(sign * 0.205, 0.16, 0.035);
          g.add(createMesh(sideGeo, mat));
        });
      } else if (style === 'hair_boy_spiky' || style === 'hair_anime_spikes') {
        const spikes = [
          [0, 0.36, 0.04, 0.3, 0, 0.052, 0.10],
          [-0.08, 0.33, 0.06, 0.25, 0.4, 0.045, 0.09],
          [0.08, 0.33, 0.06, 0.25, -0.4, 0.045, 0.09],
          [0, 0.34, -0.06, -0.25, 0, 0.045, 0.09],
          [-0.10, 0.29, -0.03, -0.15, 0.5, 0.040, 0.08],
          [0.10, 0.29, -0.03, -0.15, -0.5, 0.040, 0.08],
          [-0.05, 0.36, 0.00, 0.1, 0.2, 0.048, 0.10],
          [0.05, 0.36, 0.00, 0.1, -0.2, 0.048, 0.10]
        ];
        spikes.forEach(([x, y, z, rx, rz, r, h]) => {
          const cone = new THREE.ConeGeometry(r, h, 10);
          cone.rotateX(rx);
          cone.rotateZ(rz);
          cone.translate(x, y, z);
          g.add(createMesh(cone, mat));
        });
      } else if (style === 'hair_boy_sidepart' || style === 'hair_boy_quiff') {
        const quiffGeo = new THREE.BoxGeometry(0.19, 0.075, 0.10);
        quiffGeo.rotateX(0.3);
        quiffGeo.rotateZ(-0.15);
        quiffGeo.translate(0.03, 0.28, 0.13);
        g.add(createMesh(quiffGeo, mat));
      } else if (style === 'hair_boy_curly' || style === 'hair_boy_fade') {
        [-0.09, -0.045, 0, 0.045, 0.09].forEach(x => {
          [-0.04, 0.03, 0.08].forEach(z => {
            const curl = createMesh(new THREE.SphereGeometry(0.048, 10, 8), mat);
            curl.position.set(x, 0.30 + Math.random() * 0.02, z);
            g.add(curl);
          });
        });
      } else if (style === 'hair_afro') {
        const afroGeo = new THREE.SphereGeometry(0.29, 24, 20);
        afroGeo.scale(1.05, 1.08, 1.02);
        afroGeo.translate(0, 0.22, -0.01);
        g.add(createMesh(afroGeo, mat));
      } else if (style === 'hair_girl_wavy' || style === 'hair_girl_wavymedium') {
        [-1, 1].forEach(sign => {
          const waveGeo = new THREE.CylinderGeometry(0.055, 0.038, 0.34, 16);
          waveGeo.scale(1.0, 1.0, 0.7);
          waveGeo.rotateZ(sign * -0.15);
          waveGeo.translate(sign * 0.17, 0.01, 0.05);
          g.add(createMesh(waveGeo, mat));
        });
        const backDrape = new THREE.CylinderGeometry(0.21, 0.24, 0.34, 20, 1, false, Math.PI * 0.5, Math.PI);
        backDrape.translate(0, 0.00, -0.04);
        g.add(createMesh(backDrape, mat));
      } else if (style === 'hair_girl_straight') {
        [-1, 1].forEach(sign => {
          const strandGeo = new THREE.BoxGeometry(0.070, 0.36, 0.075);
          strandGeo.translate(sign * 0.16, -0.01, 0.06);
          g.add(createMesh(strandGeo, mat));
        });
        const backDrape = new THREE.BoxGeometry(0.38, 0.38, 0.09);
        backDrape.translate(0, -0.02, -0.13);
        g.add(createMesh(backDrape, mat));
      } else if (style === 'hair_girl_ponytail' || style === 'hair_girl_highpony') {
        const tie = createMesh(new THREE.TorusGeometry(0.036, 0.013, 8, 16), createToonMaterial(0xff7675));
        tie.position.set(0, 0.28, -0.20);
        g.add(tie);

        const tailGeo = new THREE.ConeGeometry(0.070, 0.26, 14);
        tailGeo.rotateX(-0.5);
        tailGeo.translate(0, 0.18, -0.29);
        g.add(createMesh(tailGeo, mat));
      } else if (style === 'hair_girl_bun' || style === 'hair_girl_topbun') {
        const bun = createMesh(new THREE.SphereGeometry(0.100, 18, 14), mat);
        bun.position.set(0, 0.38, -0.01);
        g.add(bun);

        const tie = createMesh(new THREE.TorusGeometry(0.080, 0.013, 8, 20), createToonMaterial(0xff7675));
        tie.rotateX(Math.PI / 2);
        tie.position.set(0, 0.32, -0.01);
        g.add(tie);
      } else if (style === 'hair_girl_doublebun') {
        [-1, 1].forEach(sign => {
          const bun = createMesh(new THREE.SphereGeometry(0.080, 16, 12), mat);
          bun.position.set(sign * 0.16, 0.35, 0);
          g.add(bun);

          const bow = createMesh(new THREE.TorusGeometry(0.048, 0.011, 8, 16), createToonMaterial(0xff7675));
          bow.rotateX(Math.PI / 2);
          bow.position.set(sign * 0.16, 0.30, 0);
          g.add(bow);
        });
      } else if (style === 'hair_girl_bob') {
        const bobGeo = new THREE.SphereGeometry(0.24, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.65);
        bobGeo.scale(1.05, 1.05, 1.05);
        bobGeo.translate(0, 0.13, 0.0);
        g.add(createMesh(bobGeo, mat));
      } else if (style === 'hair_girl_braids') {
        [-1, 1].forEach(sign => {
          for (let i = 0; i < 4; i++) {
            const braid = createMesh(new THREE.SphereGeometry(0.038 - i * 0.005, 10, 8), mat);
            braid.position.set(sign * 0.15, 0.11 - i * 0.065, 0.085);
            g.add(braid);
          }
          const tie = createMesh(new THREE.TorusGeometry(0.020, 0.006, 6, 12), createToonMaterial(0xff7675));
          tie.position.set(sign * 0.15, -0.12, 0.085);
          g.add(tie);
        });
      }
    }

    /**
     * 3D Spectacles / Glasses
     */
    buildGlasses(cfg) {
      disposeGroup(this.sockets.glasses);
      this.sockets.glasses.clear();

      const style = cfg.glasses || 'none';
      if (style === 'none') return;

      const frameColorHex = parseColor(cfg.glassesColor || 'black');
      const isSunglasses = (style === 'glasses_sunglasses' || style === 'glasses_aviator');
      const isGold = (style === 'glasses_gold_round');

      const frameMat = createToonMaterial(isGold ? 0xf1c40f : frameColorHex, {
        metalness: isGold ? 0.85 : 0.2,
        roughness: isGold ? 0.2 : 0.4
      });

      const lensMat = new THREE.MeshStandardMaterial({
        color: isSunglasses ? 0x18181f : 0xf0f8ff,
        roughness: 0.05,
        metalness: 0.1,
        transparent: true,
        opacity: isSunglasses ? 0.88 : 0.30,
        depthWrite: false
      });

      const g = this.sockets.glasses;
      const glassR = (style === 'glasses_thick' || isSunglasses) ? 0.046 : 0.040;
      const spacing = 0.072;

      [-1, 1].forEach(sign => {
        const posX = sign * spacing;

        if (isSunglasses) {
          const rimGeo = new THREE.BoxGeometry(0.078, 0.052, 0.012);
          const rim = createMesh(rimGeo, frameMat);
          rim.position.set(posX, 0.142, 0.218);
          rim.rotation.y = sign * 0.06;
          g.add(rim);

          const lensGeo = new THREE.BoxGeometry(0.068, 0.043, 0.010);
          const lens = new THREE.Mesh(lensGeo, lensMat);
          lens.position.set(posX, 0.142, 0.221);
          lens.rotation.y = sign * 0.06;
          g.add(lens);
        } else if (style === 'glasses_square') {
          const rimW = glassR * 2.0;
          const rimH = glassR * 1.6;
          const rim = createMesh(new THREE.BoxGeometry(rimW, rimH, 0.012), frameMat);
          rim.position.set(posX, 0.142, 0.220);
          g.add(rim);

          const lens = new THREE.Mesh(new THREE.BoxGeometry(rimW * 0.88, rimH * 0.85, 0.009), lensMat);
          lens.position.set(posX, 0.142, 0.222);
          g.add(lens);
        } else {
          const rimThick = (style === 'glasses_thick') ? 0.008 : 0.005;
          const rim = createMesh(new THREE.TorusGeometry(glassR, rimThick, 10, 24), frameMat);
          rim.position.set(posX, 0.142, 0.220);
          g.add(rim);

          const lens = new THREE.Mesh(new THREE.CircleGeometry(glassR * 0.92, 20), lensMat);
          lens.position.set(posX, 0.142, 0.222);
          g.add(lens);
        }

        // Temples
        const templeArm = new THREE.BoxGeometry(0.006, 0.006, 0.21);
        templeArm.translate(0, 0, -0.105);
        const temple = createMesh(templeArm, frameMat);
        temple.position.set(sign * (spacing + (isSunglasses ? 0.040 : glassR * 0.85)), 0.146, 0.215);
        temple.rotation.y = -sign * 0.08;
        g.add(temple);
      });

      // Bridge
      const bridge = createMesh(new THREE.BoxGeometry(spacing * 0.85, 0.008, 0.008), frameMat);
      bridge.position.set(0, 0.146, 0.218);
      g.add(bridge);
    }

    /**
     * 3D Hats & Headwear
     */
    buildHeadwear(cfg) {
      disposeGroup(this.sockets.head);
      this.sockets.head.clear();

      const style = cfg.headwear || 'none';
      if (style === 'none') return;

      const colorHex = parseColor(cfg.headwearColor || 'red');
      const mat = createToonMaterial(colorHex, { roughness: 0.5 });
      const g = this.sockets.head;

      if (style === 'headwear_cap' || style === 'headwear_snapback') {
        const domeGeo = new THREE.SphereGeometry(0.235, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.5);
        domeGeo.scale(1.02, 0.82, 1.04);
        domeGeo.translate(0, 0.19, 0);
        g.add(createMesh(domeGeo, mat));

        const visorGeo = new THREE.BoxGeometry(0.21, 0.015, 0.16);
        visorGeo.translate(0, 0.17, 0.18);
        visorGeo.rotateX(0.15);
        g.add(createMesh(visorGeo, mat));

        const topBtn = createMesh(new THREE.SphereGeometry(0.017, 10, 8), mat);
        topBtn.position.set(0, 0.38, 0);
        g.add(topBtn);
      } else if (style === 'headwear_backward_cap') {
        const domeGeo = new THREE.SphereGeometry(0.235, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.5);
        domeGeo.scale(1.02, 0.82, 1.04);
        domeGeo.translate(0, 0.19, 0);
        g.add(createMesh(domeGeo, mat));

        const visorGeo = new THREE.BoxGeometry(0.21, 0.015, 0.16);
        visorGeo.translate(0, 0.17, -0.18);
        visorGeo.rotateX(-0.15);
        g.add(createMesh(visorGeo, mat));
      } else if (style === 'headwear_beanie' || style === 'headwear_winter_hat') {
        const beanieGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.16, 22);
        beanieGeo.translate(0, 0.27, 0);
        g.add(createMesh(beanieGeo, mat));

        const cuffGeo = new THREE.TorusGeometry(0.235, 0.026, 10, 24);
        cuffGeo.rotateX(Math.PI / 2);
        cuffGeo.translate(0, 0.19, 0);
        g.add(createMesh(cuffGeo, mat));

        const pom = createMesh(new THREE.SphereGeometry(0.052, 14, 12), createToonMaterial(0xfed330));
        pom.position.set(0, 0.40, 0);
        g.add(pom);
      } else if (style === 'headwear_crown') {
        const goldMat = createToonMaterial(0xffd700, { metalness: 0.88, roughness: 0.20 });
        const rubyMat = createToonMaterial(0xe74c3c, { metalness: 0.5, roughness: 0.15 });
        const sapphireMat = createToonMaterial(0x2980b9, { metalness: 0.5, roughness: 0.15 });
        const diamondMat = createToonMaterial(0xffffff, { metalness: 0.9, roughness: 0.1 });

        const baseRing = createMesh(new THREE.CylinderGeometry(0.17, 0.18, 0.036, 24), goldMat);
        baseRing.position.set(0, 0.31, 0);
        g.add(baseRing);

        const peakAngles = [
          Math.PI * 0.5,
          Math.PI * 0.5 - 0.72,
          Math.PI * 0.5 + 0.72,
          Math.PI * 0.5 - 1.48,
          Math.PI * 0.5 + 1.48
        ];

        peakAngles.forEach((angle, idx) => {
          const radius = 0.17;
          const px = Math.cos(angle) * radius;
          const pz = Math.sin(angle) * radius;

          const isCenter = (idx === 0);
          const isFrontSide = (idx === 1 || idx === 2);
          const peakH = isCenter ? 0.090 : (isFrontSide ? 0.075 : 0.060);
          const peakR = isCenter ? 0.030 : (isFrontSide ? 0.026 : 0.022);

          const peakGeo = new THREE.ConeGeometry(peakR, peakH, 8);
          peakGeo.translate(0, peakH / 2, 0);
          const peakMesh = createMesh(peakGeo, goldMat);
          peakMesh.position.set(px, 0.33, pz);
          peakMesh.rotation.y = angle;
          g.add(peakMesh);

          const gemMat = isCenter ? rubyMat : (idx % 2 === 0 ? sapphireMat : diamondMat);
          const gem = createMesh(new THREE.SphereGeometry(0.011, 8, 8), gemMat);
          gem.position.set(px, 0.33 + peakH + 0.004, pz);
          g.add(gem);
        });

        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const studMat = (i % 2 === 0) ? rubyMat : diamondMat;
          const stud = createMesh(new THREE.SphereGeometry(0.008, 6, 6), studMat);
          stud.position.set(Math.cos(angle) * 0.181, 0.31, Math.sin(angle) * 0.181);
          g.add(stud);
        }
      } else if (style === 'headwear_headband') {
        const bandGeo = new THREE.TorusGeometry(0.23, 0.020, 8, 24);
        bandGeo.rotateX(Math.PI / 2);
        bandGeo.translate(0, 0.17, 0);
        g.add(createMesh(bandGeo, mat));
      }
    }

    /**
     * 3D Tops & Shirts - Seamless Torso, Zero Stomach Gap!
     */
    buildTops(cfg) {
      disposeGroup(this.sockets.top);
      this.sockets.top.clear();

      if (cfg.dress && cfg.dress !== 'none') return;

      const style = cfg.top || 'top_tshirt';
      if (style === 'none') return;

      const colorHex = parseColor(cfg.topColor || 'blue');
      const mat = createToonMaterial(colorHex, { roughness: 0.58 });
      const g = this.sockets.top;

      // 1. Torso Clothing Shell - Extends into waistband
      const shirtGeo = new THREE.CylinderGeometry(0.19, 0.205, 0.38, 24);
      shirtGeo.scale(1.08, 1.0, 0.88);
      shirtGeo.translate(0, 0.17, 0); // Local -0.02 to +0.36 => Y_world 0.73 to 1.11!
      g.add(createMesh(shirtGeo, mat));

      // Collar
      const collarGeo = new THREE.TorusGeometry(0.095, 0.016, 8, 20);
      collarGeo.rotateX(Math.PI / 2);
      collarGeo.translate(0, 0.35, 0);
      g.add(createMesh(collarGeo, mat));

      // Sleeves
      [-1, 1].forEach(sign => {
        const armParent = sign === -1 ? this.armLGroup : this.armRGroup;
        const isLongSleeve = (style === 'top_hoodie' || style === 'top_jacket' || style === 'top_leather_jacket' || style === 'top_blazer' || style === 'top_sweater');
        const sleeveLen = isLongSleeve ? 0.34 : 0.16;

        const old = armParent.getObjectByName('sleeve');
        if (old) armParent.remove(old);

        const sleeveGeo = new THREE.CylinderGeometry(0.060, 0.052, sleeveLen, 16);
        sleeveGeo.translate(0, -sleeveLen / 2, 0);
        const sleeve = createMesh(sleeveGeo, mat);
        sleeve.name = 'sleeve';
        armParent.add(sleeve);
      });

      if (style === 'top_hoodie') {
        const pouchGeo = new THREE.BoxGeometry(0.20, 0.11, 0.05);
        pouchGeo.translate(0, 0.10, 0.18);
        g.add(createMesh(pouchGeo, mat));

        const hoodGeo = new THREE.SphereGeometry(0.13, 14, 12);
        hoodGeo.scale(1.2, 0.6, 0.8);
        hoodGeo.position.set(0, 0.32, -0.13);
        g.add(createMesh(hoodGeo, mat));
      } else if (style === 'top_jacket' || style === 'top_leather_jacket') {
        const zipGeo = new THREE.BoxGeometry(0.014, 0.36, 0.02);
        zipGeo.translate(0, 0.17, 0.185);
        g.add(createMesh(zipGeo, createToonMaterial(0xffffff)));
      } else if (style === 'top_blazer') {
        const tieGeo = new THREE.BoxGeometry(0.038, 0.24, 0.02);
        tieGeo.translate(0, 0.18, 0.185);
        g.add(createMesh(tieGeo, createToonMaterial(0xd63031)));
      } else if (style === 'top_printed') {
        const badgeGeo = new THREE.BoxGeometry(0.075, 0.075, 0.015);
        badgeGeo.rotateZ(Math.PI / 4);
        badgeGeo.translate(0, 0.21, 0.185);
        g.add(createMesh(badgeGeo, createToonMaterial(0xfed330)));
      }
    }

    /**
     * 3D Bottoms & Lowers - Continuous Pelvis & Legs
     */
    buildBottoms(cfg) {
      disposeGroup(this.sockets.bottom);
      this.sockets.bottom.clear();

      if (cfg.dress && cfg.dress !== 'none') return;

      const style = cfg.bottom || 'bottom_jeans';
      if (style === 'none') return;

      const colorHex = parseColor(cfg.bottomColor || 'denim');
      const mat = createToonMaterial(colorHex, { roughness: 0.65 });
      const g = this.sockets.bottom;

      if (style === 'bottom_skirt') {
        const skirtGeo = new THREE.CylinderGeometry(0.195, 0.32, 0.28, 24);
        skirtGeo.translate(0, -0.03, 0);
        g.add(createMesh(skirtGeo, mat));
      } else {
        const waistGeo = new THREE.CylinderGeometry(0.198, 0.180, 0.22, 24);
        waistGeo.scale(1.06, 1.0, 0.86);
        waistGeo.translate(0, 0.01, 0); // Local -0.10 to +0.12 => Y_world 0.55 to 0.77 (Overlaps shirt by 0.04!)
        g.add(createMesh(waistGeo, mat));

        const isShorts = (style === 'bottom_shorts');
        const pantLen = isShorts ? 0.24 : 0.56;

        [-1, 1].forEach(sign => {
          const legParent = sign === -1 ? this.legLGroup : this.legRGroup;
          const oldPant = legParent.getObjectByName('pant');
          if (oldPant) legParent.remove(oldPant);

          const pantGeo = new THREE.CylinderGeometry(0.074, 0.058, pantLen, 18);
          pantGeo.translate(0, -pantLen / 2, 0);
          const pant = createMesh(pantGeo, mat);
          pant.name = 'pant';
          legParent.add(pant);
        });
      }
    }

    /**
     * 3D Full-Body Dresses & Tunics
     */
    buildDress(cfg) {
      const style = cfg.dress || 'none';
      if (style === 'none') return;

      disposeGroup(this.sockets.top);
      this.sockets.top.clear();
      disposeGroup(this.sockets.bottom);
      this.sockets.bottom.clear();

      [-1, 1].forEach(sign => {
        const legParent = sign === -1 ? this.legLGroup : this.legRGroup;
        const oldPant = legParent.getObjectByName('pant');
        if (oldPant) legParent.remove(oldPant);
      });

      const colorHex = parseColor(cfg.dressColor || 'white');
      const mat = createToonMaterial(colorHex, { roughness: 0.48 });
      const goldAccentMat = createToonMaterial(0xf1c40f, { metalness: 0.85, roughness: 0.2 });
      const g = this.sockets.top;

      // 1. Bodice / Tunic Top
      const bodiceGeo = new THREE.CylinderGeometry(0.19, 0.205, 0.36, 24);
      bodiceGeo.scale(1.08, 1.0, 0.88);
      bodiceGeo.translate(0, 0.17, 0);
      g.add(createMesh(bodiceGeo, mat));

      // Collar trim
      const collarGeo = new THREE.TorusGeometry(0.095, 0.015, 8, 20);
      collarGeo.rotateX(Math.PI / 2);
      collarGeo.translate(0, 0.34, 0);
      g.add(createMesh(collarGeo, mat));

      // 2. Skirt / Tunic Hem
      const isLong = (style === 'dress_long' || style === 'dress_traditional' || style === 'dress_formal');
      const isSummer = (style === 'dress_summer');
      const isParty = (style === 'dress_party');
      const skirtLen = isLong ? 0.68 : (isSummer ? 0.34 : 0.40);
      const bottomRadius = isLong ? 0.34 : (isParty || isSummer ? 0.34 : 0.31);

      const skirtGeo = new THREE.CylinderGeometry(0.195, bottomRadius, skirtLen, 24);
      skirtGeo.scale(1.08, 1.0, 0.88);
      skirtGeo.translate(0, -skirtLen / 2 + 0.01, 0);
      g.add(createMesh(skirtGeo, mat));

      // 3. Special dress accents
      if (isParty) {
        const sashGeo = new THREE.TorusGeometry(0.195, 0.015, 8, 24);
        sashGeo.scale(1.08, 0.88, 1.0);
        sashGeo.rotateX(Math.PI / 2);
        sashGeo.translate(0, 0.01, 0);
        g.add(createMesh(sashGeo, goldAccentMat));

        const bow = createMesh(new THREE.SphereGeometry(0.025, 10, 8), goldAccentMat);
        bow.position.set(0, 0.01, 0.20);
        g.add(bow);
      } else if (style === 'dress_traditional') {
        const hemRing = createMesh(new THREE.TorusGeometry(0.335, 0.013, 8, 24), goldAccentMat);
        hemRing.scale(1.08, 0.88, 1.0);
        hemRing.rotateX(Math.PI / 2);
        hemRing.translate(0, -skirtLen + 0.02, 0);
        g.add(hemRing);

        const sashGeo = new THREE.BoxGeometry(0.055, 0.38, 0.012);
        sashGeo.rotateZ(-0.45);
        sashGeo.translate(0, 0.15, 0.18);
        g.add(createMesh(sashGeo, goldAccentMat));
      } else if (style === 'dress_formal') {
        for (let b = 0; b < 3; b++) {
          const btnMesh = createMesh(new THREE.SphereGeometry(0.011, 6, 6), goldAccentMat);
          btnMesh.position.set(0, 0.25 - b * 0.08, 0.19);
          g.add(btnMesh);
        }
      }

      // Sleeveless / Short Straps
      [-1, 1].forEach(sign => {
        const armParent = sign === -1 ? this.armLGroup : this.armRGroup;
        const oldSleeve = armParent.getObjectByName('sleeve');
        if (oldSleeve) armParent.remove(oldSleeve);

        const strapGeo = new THREE.CylinderGeometry(0.058, 0.052, 0.09, 16);
        strapGeo.translate(0, -0.045, 0);
        const strap = createMesh(strapGeo, mat);
        strap.name = 'sleeve';
        armParent.add(strap);
      });
    }

    /**
     * 3D Shoes & Footwear
     */
    buildShoes(cfg) {
      disposeGroup(this.sockets.shoes);
      this.sockets.shoes.clear();

      const style = cfg.shoes || 'shoes_sneakers';
      const colorHex = parseColor(cfg.shoeColor || 'black');
      const upperMat = createToonMaterial(colorHex, { roughness: 0.5 });
      const soleMat = createToonMaterial(0xffffff, { roughness: 0.35 });
      const darkTrimMat = createToonMaterial(0x1a1a1f, { roughness: 0.6 });
      const g = this.sockets.shoes;

      [-1, 1].forEach(sign => {
        const shoeG = new THREE.Group();
        shoeG.position.set(sign * 0.095, 0.035, 0.01);

        // Rubber Sole
        const soleGeo = new THREE.BoxGeometry(0.098, 0.028, 0.18);
        soleGeo.translate(0, -0.020, 0.02);
        shoeG.add(createMesh(soleGeo, soleMat));

        // Upper
        const upperGeo = new THREE.SphereGeometry(0.064, 16, 14);
        upperGeo.scale(0.92, 0.80, 1.30);
        upperGeo.translate(0, 0.018, 0.02);
        shoeG.add(createMesh(upperGeo, upperMat));

        // Front Toe Bumper
        const toeGeo = new THREE.SphereGeometry(0.046, 12, 10);
        toeGeo.scale(1.0, 0.65, 0.9);
        toeGeo.translate(0, 0.008, 0.075);
        shoeG.add(createMesh(toeGeo, soleMat));

        // Laces / Tongue Detail
        const tongueGeo = new THREE.BoxGeometry(0.044, 0.016, 0.065);
        tongueGeo.rotateX(-0.4);
        tongueGeo.translate(0, 0.045, 0.018);
        shoeG.add(createMesh(tongueGeo, darkTrimMat));

        g.add(shoeG);
      });
    }

    /**
     * 3D Facial Hair
     */
    buildFacialHair(cfg) {
      const style = cfg.facialHair || 'none';
      if (style === 'none') return;

      const hairColorHex = parseColor(cfg.facialHairColor || cfg.hairColor || 'black');
      const mat = createToonMaterial(hairColorHex, { roughness: 0.85 });
      const g = this.sockets.face;

      if (style === 'mustache' || style === 'mustache_handlebar') {
        [-1, 1].forEach(sign => {
          const stacheGeo = new THREE.CylinderGeometry(0.013, 0.005, 0.050, 12);
          stacheGeo.rotateZ(sign * (style === 'mustache_handlebar' ? -0.85 : -0.35));
          stacheGeo.translate(sign * 0.026, 0.080, 0.218);
          g.add(createMesh(stacheGeo, mat));
        });
      } else if (style === 'short_beard' || style === 'light_beard' || style === 'full_beard') {
        const beardGeo = new THREE.SphereGeometry(0.22, 20, 16, 0, Math.PI * 2, Math.PI * 0.44, Math.PI * 0.56);
        beardGeo.scale(1.02, 1.06, 1.02);
        beardGeo.translate(0, 0.13, 0);
        g.add(createMesh(beardGeo, mat));
      } else if (style === 'goatee') {
        const goateeGeo = new THREE.ConeGeometry(0.026, 0.048, 8);
        goateeGeo.rotateX(Math.PI);
        goateeGeo.translate(0, 0.01, 0.195);
        g.add(createMesh(goateeGeo, mat));

        const soulPatch = createMesh(new THREE.BoxGeometry(0.013, 0.014, 0.010), mat);
        soulPatch.position.set(0, 0.035, 0.208);
        g.add(soulPatch);
      }
    }

    /**
     * 3D Accessories & Special Items
     */
    buildAccessories(cfg) {
      disposeGroup(this.sockets.headAccessories);
      this.sockets.headAccessories.clear();
      disposeGroup(this.sockets.torsoAccessories);
      this.sockets.torsoAccessories.clear();
      disposeGroup(this.sockets.armAccessories);
      this.sockets.armAccessories.clear();
      disposeGroup(this.sockets.handAccessories);
      this.sockets.handAccessories.clear();

      const acc = cfg.accessory || 'none';
      const spec = cfg.specialItem || 'none';
      const colorHex = parseColor(cfg.accessoryColor || 'red');

      // 1. Head-mounted Accessories
      if (acc === 'acc_headphones') {
        const hpMat = createToonMaterial(colorHex, { roughness: 0.35 });
        const cushionMat = createToonMaterial(0x1a1a20, { roughness: 0.8 });
        const metallicMat = createToonMaterial(0xdcdde1, { metalness: 0.85, roughness: 0.2 });
        const hg = this.sockets.headAccessories;

        const bandGeo = new THREE.TorusGeometry(0.23, 0.015, 10, 32, Math.PI);
        bandGeo.rotateX(-0.14);
        bandGeo.translate(0, 0.13, -0.01);
        hg.add(createMesh(bandGeo, hpMat));

        const padArchGeo = new THREE.TorusGeometry(0.222, 0.010, 8, 24, Math.PI * 0.75);
        padArchGeo.rotateZ(Math.PI * 0.125);
        padArchGeo.rotateX(-0.14);
        padArchGeo.translate(0, 0.13, -0.01);
        hg.add(createMesh(padArchGeo, cushionMat));

        [-1, 1].forEach(sign => {
          const cupG = new THREE.Group();
          cupG.position.set(sign * 0.22, 0.13, 0.01);

          const outerShellGeo = new THREE.CylinderGeometry(0.056, 0.056, 0.026, 20);
          outerShellGeo.rotateZ(Math.PI / 2);
          cupG.add(createMesh(outerShellGeo, hpMat));

          const plateGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.028, 16);
          plateGeo.rotateZ(Math.PI / 2);
          cupG.add(createMesh(plateGeo, metallicMat));

          const innerCushionGeo = new THREE.TorusGeometry(0.048, 0.011, 10, 20);
          innerCushionGeo.rotateY(Math.PI / 2);
          innerCushionGeo.translate(-sign * 0.010, 0, 0);
          cupG.add(createMesh(innerCushionGeo, cushionMat));

          const hingeGeo = new THREE.BoxGeometry(0.013, 0.038, 0.018);
          hingeGeo.translate(0, 0.046, 0);
          cupG.add(createMesh(hingeGeo, metallicMat));

          hg.add(cupG);
        });
      } else if (acc === 'acc_earrings' || acc === 'acc_hoops') {
        const goldMat = createToonMaterial(0xf1c40f, { metalness: 0.9, roughness: 0.15 });
        [-1, 1].forEach(sign => {
          const hoop = createMesh(new THREE.TorusGeometry(0.020, 0.005, 8, 16), goldMat);
          hoop.position.set(sign * 0.21, 0.09, 0.012);
          this.sockets.headAccessories.add(hoop);
        });
      } else if (acc === 'acc_earbuds') {
        const whiteMat = createToonMaterial(0xffffff, { roughness: 0.2 });
        [-1, 1].forEach(sign => {
          const bud = createMesh(new THREE.SphereGeometry(0.014, 10, 8), whiteMat);
          bud.position.set(sign * 0.208, 0.13, 0.032);
          this.sockets.headAccessories.add(bud);
        });
      }

      // 2. Torso / Body Accessories
      if (acc === 'acc_backpack') {
        const bagGeo = new THREE.BoxGeometry(0.24, 0.28, 0.13);
        bagGeo.translate(0, 0.18, -0.19);
        this.sockets.torsoAccessories.add(createMesh(bagGeo, createToonMaterial(colorHex)));
      } else if (acc === 'acc_necklace' || acc === 'acc_chain') {
        const neckGeo = new THREE.TorusGeometry(0.095, 0.008, 8, 20);
        neckGeo.rotateX(Math.PI / 2.3);
        neckGeo.translate(0, 0.34, 0.05);
        const goldMat = createToonMaterial(0xf1c40f, { metalness: 0.9, roughness: 0.15 });
        this.sockets.torsoAccessories.add(createMesh(neckGeo, goldMat));

        const pend = createMesh(new THREE.SphereGeometry(0.018, 10, 8), goldMat);
        pend.position.set(0, 0.27, 0.16);
        this.sockets.torsoAccessories.add(pend);
      }

      // 3. Arm / Wrist Accessories
      if (acc === 'acc_watch' || acc === 'acc_smartwatch') {
        const watchBand = createMesh(new THREE.TorusGeometry(0.044, 0.009, 8, 16), createToonMaterial(0x2d3436));
        watchBand.position.set(0, -0.31, 0.02);
        this.sockets.armAccessories.add(watchBand);

        const screen = createMesh(new THREE.BoxGeometry(0.026, 0.008, 0.026), createToonMaterial(0x00cec9));
        screen.position.set(0, -0.31, 0.050);
        this.sockets.armAccessories.add(screen);
      }

      // 4. Handheld Special Items & Podium Awards
      const heldAward = this.options.heldAward;
      if (heldAward === 'trophy_gold' || spec === 'item_trophy') {
        const trophyG = new THREE.Group();
        const goldMat = createToonMaterial(0xf1c40f, { metalness: 0.9, roughness: 0.15 });
        const darkBaseMat = createToonMaterial(0x2d3436, { roughness: 0.4 });
        
        const cup = createMesh(new THREE.CylinderGeometry(0.095, 0.040, 0.15, 18), goldMat);
        cup.position.y = 0.04;
        trophyG.add(cup);

        const stem = createMesh(new THREE.CylinderGeometry(0.019, 0.028, 0.065, 12), goldMat);
        stem.position.y = -0.055;
        trophyG.add(stem);

        const base = createMesh(new THREE.CylinderGeometry(0.065, 0.078, 0.065, 16), darkBaseMat);
        base.position.y = -0.11;
        trophyG.add(base);

        [-1, 1].forEach(hSign => {
          const handle = createMesh(new THREE.TorusGeometry(0.050, 0.011, 8, 16, Math.PI), goldMat);
          handle.rotation.z = hSign * Math.PI / 2;
          handle.position.set(hSign * 0.080, 0.05, 0);
          trophyG.add(handle);
        });

        const star = createMesh(new THREE.SphereGeometry(0.014, 8, 8), goldMat);
        star.position.set(0, -0.10, 0.075);
        trophyG.add(star);

        if (heldAward === 'trophy_gold') {
          trophyG.position.set(0.04, -0.33, 0.10);
          trophyG.rotation.set(0.25, -0.2, 0.1);
        } else {
          trophyG.position.set(0.02, -0.35, 0.08);
        }
        this.sockets.handAccessories.add(trophyG);
      } else if (heldAward === 'medal_silver' || heldAward === 'medal_bronze') {
        const isSilver = heldAward === 'medal_silver';
        const metalColor = isSilver ? 0xdcdde1 : 0xcd6133;
        const metalMat = createToonMaterial(metalColor, { metalness: 0.88, roughness: 0.2 });
        const ribbonMat = createToonMaterial(isSilver ? 0x0984e3 : 0xe84118, { roughness: 0.6 });

        const ribbonGeo = new THREE.TorusGeometry(0.10, 0.011, 8, 20);
        ribbonGeo.rotateX(Math.PI / 2.3);
        ribbonGeo.translate(0, 0.32, 0.05);
        this.sockets.torsoAccessories.add(createMesh(ribbonGeo, ribbonMat));

        const medalGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.009, 20);
        medalGeo.rotateX(Math.PI / 2);
        const medal = createMesh(medalGeo, metalMat);
        medal.position.set(0, 0.23, 0.18);
        this.sockets.torsoAccessories.add(medal);

        const star = createMesh(new THREE.SphereGeometry(0.012, 8, 8), metalMat);
        star.position.set(0, 0.23, 0.188);
        this.sockets.torsoAccessories.add(star);
      } else if (spec === 'item_pencil') {
        const pencilG = new THREE.Group();
        const body = createMesh(new THREE.CylinderGeometry(0.013, 0.013, 0.24, 6), createToonMaterial(0xfed330));
        pencilG.add(body);
        const tip = createMesh(new THREE.ConeGeometry(0.013, 0.038, 6), createToonMaterial(0x2d3436));
        tip.position.y = 0.14;
        pencilG.add(tip);
        pencilG.position.set(0.02, -0.37, 0.06);
        pencilG.rotation.x = 0.4;
        this.sockets.handAccessories.add(pencilG);
      }
    }

    animate(delta) {
      this.animTime += delta;
      const t = this.animTime;

      // Gentle subtle breathing
      const breath = Math.sin(t * 2.2) * 0.006;
      if (this.torsoGroup) {
        this.torsoGroup.position.y = 0.10 + breath * 0.3;
      }
      if (this.headGroup) {
        this.headGroup.position.y = 0.05 + breath * 0.5;
        this.headGroup.rotation.z = Math.sin(t * 1.1) * 0.010;
      }
    }

    dispose() {
      disposeGroup(this.group);
    }
  }

  /**
   * 4. Interactive 3D Viewport Instance (Direct Touch/Drag Rotation ONLY)
   */
  class AvatarViewport3D {
    constructor(container, config = {}, options = {}) {
      this.container = container;
      if (config && config.config) {
        options = Object.assign({}, config, options);
        config = config.config;
      }
      this.config = Object.assign({}, DEFAULT_CONFIGS.boy, config);
      this.options = options;
      this.mode = options.mode || 'full';
      this.animated = options.animated !== false;

      // Rotation Physics
      this.targetRotationY = 0;
      this.rotationY = 0;
      this.isDragging = false;
      this.previousMouseX = 0;
      this.dragSpeed = 0.008;
      this.dampingFactor = 0.14;

      this.initScene();
      this.bindEvents();
      this.startLoop();
    }

    initScene() {
      this.width = this.container.clientWidth || (this.mode === 'badge' ? 76 : 320);
      this.height = this.container.clientHeight || (this.mode === 'badge' ? 76 : 420);

      this.scene = new THREE.Scene();

      // Camera
      const fov = this.mode === 'badge' ? 28 : 30;
      this.camera = new THREE.PerspectiveCamera(fov, this.width / this.height, 0.1, 50);
      this.updateCameraPosition();

      // WebGL Renderer with Tone Mapping (Prevents overexposed white blowout)
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if (typeof THREE.ACESFilmicToneMapping !== 'undefined') {
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05;
      }

      this.canvas = this.renderer.domElement;
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.display = 'block';
      this.canvas.style.cursor = 'grab';
      this.canvas.style.touchAction = 'none';
      this.container.innerHTML = '';
      this.container.appendChild(this.canvas);

      // Studio Lighting
      this.setupLighting();

      // Character Model
      this.character = new AvatarCharacter3D(this.config, this.options);
      this.scene.add(this.character.group);
    }

    setupLighting() {
      // Balanced studio lights
      const ambient = new THREE.AmbientLight(0xfff7ed, 0.55);
      this.scene.add(ambient);

      const key = new THREE.DirectionalLight(0xfff2e2, 0.65);
      key.position.set(2.2, 3.2, 2.8);
      key.castShadow = true;
      key.shadow.mapSize.width = 512;
      key.shadow.mapSize.height = 512;
      this.scene.add(key);

      const fill = new THREE.DirectionalLight(0xdbeafe, 0.32);
      fill.position.set(-2.4, 1.8, 1.8);
      this.scene.add(fill);

      const rim = new THREE.DirectionalLight(0xffffff, 0.38);
      rim.position.set(0, 2.6, -3.0);
      this.scene.add(rim);
    }

    updateCameraPosition() {
      const aspect = (this.width && this.height) ? (this.width / this.height) : 1.0;
      if (this.mode === 'badge') {
        let dist = typeof this.options.cameraDistance === 'number' ? this.options.cameraDistance : 2.80;
        if (aspect < 1.0) {
          dist = dist * (1.0 / aspect);
        }
        const targetY = typeof this.options.cameraTargetY === 'number' ? this.options.cameraTargetY : 0.68;
        this.camera.position.set(0, targetY, dist);
        this.camera.lookAt(0, targetY, 0);
      } else {
        let dist = typeof this.options.cameraDistance === 'number' ? this.options.cameraDistance : 3.90;
        if (aspect < 0.80) {
          dist = dist * (0.80 / aspect);
        }
        const targetY = typeof this.options.cameraTargetY === 'number' ? this.options.cameraTargetY : 0.78;
        this.camera.position.set(0, 0.82, dist);
        this.camera.lookAt(0, targetY, 0);
      }
    }

    bindEvents() {
      // Direct Mouse Drag on Avatar
      const onMouseDown = (e) => {
        this.isDragging = true;
        this.previousMouseX = e.clientX;
        this.canvas.style.cursor = 'grabbing';
      };

      const onMouseMove = (e) => {
        if (!this.isDragging) return;
        const deltaX = e.clientX - this.previousMouseX;
        this.previousMouseX = e.clientX;
        this.targetRotationY += deltaX * this.dragSpeed;
      };

      const onMouseUp = () => {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
      };

      this.canvas.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      // Direct Touch Drag on Mobile
      let touchStartX = 0;
      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.isDragging = true;
          touchStartX = e.touches[0].clientX;
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (!this.isDragging || e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - touchStartX;
        touchStartX = e.touches[0].clientX;
        this.targetRotationY += deltaX * this.dragSpeed * 1.3;
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.isDragging = false;
      });

      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });
      this.resizeObserver.observe(this.container);
    }

    handleResize() {
      if (!this.container || !this.renderer) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w === 0 || h === 0) return;

      this.width = w;
      this.height = h;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.updateCameraPosition();
      this.renderer.setSize(w, h);
    }

    startLoop() {
      let lastTime = performance.now();
      const loop = (now) => {
        if (this.isDestroyed) return;
        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        this.rotationY += (this.targetRotationY - this.rotationY) * this.dampingFactor;
        if (this.character) {
          this.character.characterRoot.rotation.y = this.rotationY;
          if (this.animated) {
            this.character.animate(delta);
          }
        }

        this.renderer.render(this.scene, this.camera);
        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }

    updateConfig(newConfig) {
      this.config = Object.assign({}, this.config, newConfig);
      if (this.character) {
        this.character.update(this.config);
      }
    }

    update(newConfig) {
      return this.updateConfig(newConfig);
    }

    destroy() {
      this.isDestroyed = true;
      if (this.animId) cancelAnimationFrame(this.animId);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.character) this.character.dispose();
      if (this.renderer) {
        this.renderer.dispose();
        if (this.canvas && this.canvas.parentNode) {
          this.canvas.parentNode.removeChild(this.canvas);
        }
      }
    }
  }

  const activeViewports = new WeakMap();

  // 5. Global AvatarEngine API
  const AvatarEngine = {
    PALETTES,
    DEFAULT_CONFIGS,

    mount(container, config, options = {}) {
      if (!container) return null;

      if (config && config.config) {
        options = Object.assign({}, config, options);
        config = config.config;
      }

      let viewport = activeViewports.get(container);
      if (viewport && !viewport.isDestroyed) {
        viewport.updateConfig(config);
        return viewport;
      }

      if (typeof THREE === 'undefined') {
        console.warn('Three.js is not loaded.');
        return null;
      }

      try {
        viewport = new AvatarViewport3D(container, config, options);
        container._avatarViewport = viewport;
        activeViewports.set(container, viewport);
        return viewport;
      } catch (e) {
        console.error('AvatarEngine.mount error:', e);
        return null;
      }
    },

    getViewport(container) {
      if (!container) return null;
      return container._avatarViewport || activeViewports.get(container) || null;
    },

    getDefault(style = 'boy') {
      return Object.assign({}, DEFAULT_CONFIGS[style] || DEFAULT_CONFIGS.boy);
    },

    getPresets(style = 'boy') {
      const all = {
        boy: [
          {
            id: 'boy1',
            name: 'Boy 1',
            subtitle: 'Casual Boy',
            config: {
              avatar_id: 'boy1',
              style: 'boy', body: 'regular', skin: 'skin_03', face: 'face_round',
              hair: 'hair_boy_short', hairColor: 'dark_brown', eyes: 'eyes_friendly', eyeColor: 'brown',
              eyebrows: 'brows_natural', nose: 'nose_small', mouth: 'mouth_smile', freckles: 'none',
              facialHair: 'none', facialHairColor: 'black',
              top: 'top_casual', topColor: 'blue', bottom: 'bottom_jeans', bottomColor: 'denim',
              dress: 'none', dressColor: 'blue', shoes: 'shoes_sneakers', shoeColor: 'white',
              headwear: 'none', headwearColor: 'red', glasses: 'none', glassesColor: 'black',
              accessory: 'acc_headphones', accessoryColor: 'blue', specialItem: 'none', rotation: 'front', zoom: 1
            }
          },
          {
            id: 'boy2',
            name: 'Boy 2',
            subtitle: 'Hoodie Geek',
            config: {
              avatar_id: 'boy2',
              style: 'boy', body: 'regular', skin: 'skin_02', face: 'face_oval',
              hair: 'hair_boy_curly', hairColor: 'dark_brown', eyes: 'eyes_friendly', eyeColor: 'brown',
              eyebrows: 'brows_natural', nose: 'nose_small', mouth: 'mouth_smile', freckles: 'freckles_light',
              facialHair: 'none', facialHairColor: 'black',
              top: 'top_hoodie', topColor: 'coral', bottom: 'bottom_jeans', bottomColor: 'black',
              dress: 'none', dressColor: 'coral', shoes: 'shoes_sneakers', shoeColor: 'white',
              headwear: 'none', headwearColor: 'red', glasses: 'glasses_round', glassesColor: 'black',
              accessory: 'acc_backpack', accessoryColor: 'teal', specialItem: 'item_pencil', rotation: 'front', zoom: 1
            }
          },
          {
            id: 'boy3',
            name: 'Boy 3',
            subtitle: 'Smart Polo',
            config: {
              avatar_id: 'boy3',
              style: 'boy', body: 'slim', skin: 'skin_04', face: 'face_square',
              hair: 'hair_boy_sidepart', hairColor: 'black', eyes: 'eyes_almond', eyeColor: 'dark_brown',
              eyebrows: 'brows_straight', nose: 'nose_straight', mouth: 'mouth_smile', freckles: 'none',
              facialHair: 'none', facialHairColor: 'black',
              top: 'top_polo', topColor: 'emerald', bottom: 'bottom_casual', bottomColor: 'khaki',
              dress: 'none', dressColor: 'emerald', shoes: 'shoes_casual', shoeColor: 'leather',
              headwear: 'none', headwearColor: 'gold', glasses: 'none', glassesColor: 'gold',
              accessory: 'acc_watch', accessoryColor: 'black', specialItem: 'none', rotation: 'front', zoom: 1
            }
          }
        ],
        girl: [
          {
            id: 'girl1',
            name: 'Girl 1',
            subtitle: 'Casual Girl',
            config: {
              avatar_id: 'girl1',
              style: 'girl', body: 'regular', skin: 'skin_02', face: 'face_oval',
              hair: 'hair_girl_wavy', hairColor: 'dark_brown', eyes: 'eyes_bright', eyeColor: 'brown',
              eyebrows: 'brows_curved', nose: 'nose_small', mouth: 'mouth_smile', freckles: 'freckles_cheeks',
              facialHair: 'none', facialHairColor: 'black',
              top: 'top_casual', topColor: 'purple', bottom: 'bottom_jeans', bottomColor: 'denim',
              dress: 'none', dressColor: 'purple', shoes: 'shoes_sneakers', shoeColor: 'white',
              headwear: 'none', headwearColor: 'gold', glasses: 'none', glassesColor: 'black',
              accessory: 'acc_earrings', accessoryColor: 'gold', specialItem: 'none', rotation: 'front', zoom: 1
            }
          },
          {
            id: 'girl2',
            name: 'Girl 2',
            subtitle: 'Sport Pony',
            config: {
              avatar_id: 'girl2',
              style: 'girl', body: 'athletic', skin: 'skin_05', face: 'face_round',
              hair: 'hair_girl_highpony', hairColor: 'black', eyes: 'eyes_almond', eyeColor: 'dark_brown',
              eyebrows: 'brows_natural', nose: 'nose_small', mouth: 'mouth_smile', freckles: 'none',
              facialHair: 'none', facialHairColor: 'black',
              top: 'top_printed', topColor: 'teal', bottom: 'bottom_joggers', bottomColor: 'black',
              dress: 'none', dressColor: 'teal', shoes: 'shoes_sports', shoeColor: 'pink',
              headwear: 'headwear_headband', headwearColor: 'pink', glasses: 'none', glassesColor: 'black',
              accessory: 'acc_headphones', accessoryColor: 'pink', specialItem: 'none', rotation: 'front', zoom: 1
            }
          },
          {
            id: 'girl3',
            name: 'Girl 3',
            subtitle: 'Party Dress',
            config: {
              avatar_id: 'girl3',
              style: 'girl', body: 'slim', skin: 'skin_02', face: 'face_soft',
              hair: 'hair_girl_curly', hairColor: 'auburn', eyes: 'eyes_large', eyeColor: 'emerald',
              eyebrows: 'brows_curved', nose: 'nose_small', mouth: 'mouth_big_smile', freckles: 'none',
              facialHair: 'none', facialHairColor: 'black',
              top: 'none', topColor: 'pink', bottom: 'none', bottomColor: 'pink',
              dress: 'dress_party', dressColor: 'ruby', shoes: 'shoes_casual', shoeColor: 'ruby',
              headwear: 'headwear_crown', headwearColor: 'gold', glasses: 'none', glassesColor: 'black',
              accessory: 'acc_necklace', accessoryColor: 'gold', specialItem: 'item_trophy', rotation: 'front', zoom: 1
            }
          }
        ]
      };
      return all[style] || all.boy;
    },

    getPresetById(id) {
      if (!id) return null;
      const cleanId = id.replace('_', '').toLowerCase();
      const boys = this.getPresets('boy');
      const girls = this.getPresets('girl');
      const all = [...boys, ...girls];
      const match = all.find(p => p.id.replace('_', '').toLowerCase() === cleanId);
      return match ? Object.assign({}, match.config) : null;
    },

    randomize(preferredStyle = 'boy') {
      const styles = ['boy', 'girl'];
      const style = preferredStyle && styles.includes(preferredStyle) ? preferredStyle : styles[Math.floor(Math.random() * styles.length)];

      const skins = Object.keys(PALETTES.skin);
      const faces = ['face_round', 'face_oval', 'face_square', 'face_soft', 'face_long', 'face_wide', 'face_heart'];
      const bodies = ['regular', 'slim', 'athletic', 'soft', 'tall', 'short'];
      
      const hairMap = {
        boy: ['hair_boy_short', 'hair_boy_spiky', 'hair_boy_fade', 'hair_boy_crew', 'hair_boy_sidepart', 'hair_boy_curly', 'hair_boy_wavy', 'hair_boy_quiff', 'hair_afro', 'hair_anime_spikes'],
        girl: ['hair_girl_wavy', 'hair_girl_straight', 'hair_girl_curly', 'hair_girl_ponytail', 'hair_girl_highpony', 'hair_girl_bun', 'hair_girl_doublebun', 'hair_girl_bob', 'hair_girl_braids', 'hair_girl_pixie']
      };

      const hairColors = Object.keys(PALETTES.hairColor);
      const eyes = ['eyes_friendly', 'eyes_bright', 'eyes_round', 'eyes_almond', 'eyes_large', 'eyes_small', 'eyes_cartoon'];
      const eyeColors = Object.keys(PALETTES.eyeColor);
      const eyebrows = ['brows_natural', 'brows_thick', 'brows_curved', 'brows_straight', 'brows_raised'];
      const noses = ['nose_small', 'nose_medium', 'nose_rounded'];
      const mouths = ['mouth_smile', 'mouth_big_smile', 'mouth_laugh', 'mouth_grin'];
      const frecklesList = ['none', 'none', 'freckles_light', 'freckles_cheeks', 'beauty_spot_left', 'beauty_spot_right'];

      const tops = ['top_tshirt', 'top_printed', 'top_polo', 'top_hoodie', 'top_jacket', 'top_leather_jacket', 'top_blazer', 'top_shirt', 'top_casual', 'top_jersey', 'top_sweater'];
      const clothingColors = Object.keys(PALETTES.clothing);
      const bottoms = ['bottom_jeans', 'bottom_shorts', 'bottom_joggers', 'bottom_cargo', 'bottom_casual', 'bottom_formal', 'bottom_skirt', 'bottom_trackpants'];

      const dresses = ['dress_casual', 'dress_party', 'dress_summer', 'dress_long', 'dress_formal'];
      const shoes = ['shoes_sneakers', 'shoes_sports', 'shoes_boots', 'shoes_casual', 'shoes_formal'];
      const headwears = ['none', 'none', 'headwear_cap', 'headwear_backward_cap', 'headwear_beanie', 'headwear_bucket', 'headwear_crown', 'headwear_headband'];
      const glassesList = ['none', 'none', 'none', 'glasses_round', 'glasses_square', 'glasses_thin', 'glasses_thick', 'glasses_sunglasses'];
      const accessories = ['none', 'none', 'acc_backpack', 'acc_watch', 'acc_necklace', 'acc_earrings', 'acc_headphones'];
      const specialItems = ['none', 'none', 'item_pencil', 'item_trophy'];

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
        freckles: pick(frecklesList),
        facialHair: style === 'boy' && Math.random() < 0.2 ? pick(['mustache', 'light_beard', 'short_beard', 'goatee']) : 'none',
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
