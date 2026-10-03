/**
 * QuizSpark Realistic 3D Full-Body Avatar System - Three.js WebGL Engine
 * 
 * Features:
 * - Single unified hierarchical skeleton rig (Pelvis -> Torso -> Neck -> Head, Shoulders -> Arms -> Hands, Legs -> Feet)
 * - Contoured, fitted 3D shirt & pants with zero gaps and zero body/skin clipping
 * - Anatomical hand grip socket with 3D hexagonal pencil physically clutched inside fingers
 * - Strict single-slot equipment system with clean disposal and replacement
 * - Responsive 360° interactive rotation with mouse and touch/swipe drag and inertia damping
 * - Studio 3-point lighting and automated full-body camera framing
 */
(function (global) {
  'use strict';

  // 1. Curated Color Palettes & Shading Definitions
  const PALETTES = {
    skin: {
      skin_01: { main: '#ffeaa7', shadow: '#e5b869', highlight: '#fff9e6', tone: 'Fair Warm', hex: 0xffeaa7 },
      skin_02: { main: '#fed39f', shadow: '#e89e47', highlight: '#fff1de', tone: 'Light Peach', hex: 0xfed39f },
      skin_03: { main: '#f0b27a', shadow: '#c97836', highlight: '#fae5d3', tone: 'Medium Warm', hex: 0xf0b27a },
      skin_04: { main: '#e0a96d', shadow: '#af7336', highlight: '#f5d9bd', tone: 'Golden Tan', hex: 0xe0a96d },
      skin_05: { main: '#c68642', shadow: '#8c4e16', highlight: '#e8af78', tone: 'Warm Olive', hex: 0xc68642 },
      skin_06: { main: '#8d5524', shadow: '#592e0b', highlight: '#ba7f4c', tone: 'Rich Bronze', hex: 0x8d5524 },
      skin_07: { main: '#603813', shadow: '#381e05', highlight: '#8a5624', tone: 'Deep Brown', hex: 0x603813 },
      skin_08: { main: '#3d2314', shadow: '#211107', highlight: '#633c24', tone: 'Espresso', hex: 0x3d2314 },
      skin_09: { main: '#fbe7d0', shadow: '#e0be9b', highlight: '#ffffff', tone: 'Porcelain', hex: 0xfbe7d0 },
      skin_10: { main: '#a86538', shadow: '#733c16', highlight: '#cf8e5f', tone: 'Caramel Honey', hex: 0xa86538 }
    },
    hairColor: {
      black: { main: '#1e272e', shadow: '#0b0c10', highlight: '#485460', label: 'Jet Black', hex: 0x1e272e },
      dark_brown: { main: '#3d1c02', shadow: '#220f01', highlight: '#5c2d0c', label: 'Dark Brown', hex: 0x3d1c02 },
      brown: { main: '#6d4c41', shadow: '#4e342e', highlight: '#8d6e63', label: 'Chestnut Brown', hex: 0x6d4c41 },
      light_brown: { main: '#a1887f', shadow: '#6d4c41', highlight: '#bcaaa4', label: 'Light Brown', hex: 0xa1887f },
      blonde: { main: '#fbc531', shadow: '#c49516', highlight: '#ffea79', label: 'Golden Blonde', hex: 0xfbc531 },
      platinum: { main: '#ecf0f1', shadow: '#bdc3c7', highlight: '#ffffff', label: 'Platinum Blonde', hex: 0xecf0f1 },
      dark_blonde: { main: '#d4ac0d', shadow: '#967806', highlight: '#f7dc6f', label: 'Honey Blonde', hex: 0xd4ac0d },
      red: { main: '#c0392b', shadow: '#871f14', highlight: '#e74c3c', label: 'Auburn Red', hex: 0xc0392b },
      auburn: { main: '#8e44ad', shadow: '#5b2673', highlight: '#a569bd', label: 'Dark Auburn', hex: 0x8e44ad },
      grey: { main: '#7f8c8d', shadow: '#4f5b66', highlight: '#bdc3c7', label: 'Silver Grey', hex: 0x7f8c8d },
      white: { main: '#f5f6fa', shadow: '#dcdde1', highlight: '#ffffff', label: 'Snow White', hex: 0xf5f6fa },
      blue: { main: '#0984e3', shadow: '#0652dd', highlight: '#74b9ff', label: 'Electric Blue', hex: 0x0984e3 },
      purple: { main: '#8854d0', shadow: '#5f27cd', highlight: '#a55eea', label: 'Royal Purple', hex: 0x8854d0 },
      pink: { main: '#e84393', shadow: '#ad1457', highlight: '#fd79a8', label: 'Bubblegum Pink', hex: 0xe84393 },
      green: { main: '#00b894', shadow: '#006266', highlight: '#55efc4', label: 'Emerald Green', hex: 0x00b894 },
      teal: { main: '#00cec9', shadow: '#00838f', highlight: '#81ecec', label: 'Ocean Teal', hex: 0x00cec9 },
      coral: { main: '#ff7675', shadow: '#d63031', highlight: '#fab1a0', label: 'Sunset Coral', hex: 0xff7675 }
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
      blue: { main: '#2e86de', shadow: '#134a8e', highlight: '#54a0ff', label: 'Royal Blue', hex: 0x2e86de },
      purple: { main: '#8854d0', shadow: '#4d1e9e', highlight: '#a55eea', label: 'Deep Purple', hex: 0x8854d0 },
      red: { main: '#ee5253', shadow: '#991515', highlight: '#ff6b6b', label: 'Vibrant Red', hex: 0xee5253 },
      yellow: { main: '#feca57', shadow: '#c47805', highlight: '#ffdd59', label: 'Warm Yellow', hex: 0xfeca57 },
      green: { main: '#10ac84', shadow: '#08634c', highlight: '#1dd1a1', label: 'Mint Green', hex: 0x10ac84 },
      coral: { main: '#ff7675', shadow: '#b33939', highlight: '#fd9644', label: 'Coral Orange', hex: 0xff7675 },
      black: { main: '#2f3542', shadow: '#151922', highlight: '#57606f', label: 'Onyx Black', hex: 0x2f3542 },
      white: { main: '#f1f2f6', shadow: '#a4b0be', highlight: '#ffffff', label: 'Clean White', hex: 0xf1f2f6 },
      teal: { main: '#00cec9', shadow: '#006b68', highlight: '#81ecec', label: 'Aqua Teal', hex: 0x00cec9 },
      navy: { main: '#1e3799', shadow: '#0a1a54', highlight: '#4a69bd', label: 'Classic Navy', hex: 0x1e3799 },
      crimson: { main: '#b71540', shadow: '#59051b', highlight: '#eb2f06', label: 'Ruby Crimson', hex: 0xb71540 },
      emerald: { main: '#009432', shadow: '#004a19', highlight: '#2ed573', label: 'Emerald', hex: 0x009432 },
      denim: { main: '#3867d6', shadow: '#1b3882', highlight: '#4b7bec', label: 'Denim Indigo', hex: 0x3867d6 },
      khaki: { main: '#d1ccc0', shadow: '#6b675e', highlight: '#f7f1e3', label: 'Khaki Beige', hex: 0xd1ccc0 },
      grey: { main: '#747d8c', shadow: '#434954', highlight: '#a4b0be', label: 'Slate Grey', hex: 0x747d8c },
      pink: { main: '#f368e0', shadow: '#9c1c8c', highlight: '#ff9ff3', label: 'Pastel Pink', hex: 0xf368e0 },
      gold: { main: '#ffc048', shadow: '#b37700', highlight: '#fff200', label: 'Goldenrod', hex: 0xffc048 },
      ruby: { main: '#c0392b', shadow: '#5e130b', highlight: '#e74c3c', label: 'Dark Ruby', hex: 0xc0392b },
      leather: { main: '#3e2723', shadow: '#1b0000', highlight: '#6a4f4b', label: 'Dark Leather', hex: 0x3e2723 },
      olive: { main: '#556b2f', shadow: '#2e3d14', highlight: '#7a9a43', label: 'Military Olive', hex: 0x556b2f }
    }
  };

  // Helper to parse hex string or color name to THREE.Color
  function parseColor(colorVal, defaultHex = 0x2e86de) {
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

    const shadow = `rgb(${Math.max(0, Math.round(r * 0.55))},${Math.max(0, Math.round(g * 0.55))},${Math.max(0, Math.round(b * 0.55))})`;
    const highlight = `rgb(${Math.min(255, Math.round(r * 1.35 + 30))},${Math.min(255, Math.round(g * 1.35 + 30))},${Math.min(255, Math.round(b * 1.35 + 30))})`;

    return { main: hexColor, shadow, highlight, label: 'Custom', hex: num };
  }

  // 2. Default Configurations
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

  /**
   * 3. Body Scale & Metric Proportions Generator
   */
  function getBodyMetrics(prop = 'regular') {
    let scaleX = 1.0;
    let scaleY = 1.0;
    let scaleZ = 1.0;
    let shoulderW = 0.54;
    let chestW = 0.44;
    let waistW = 0.36;
    let hipW = 0.40;
    let legLen = 0.88;
    let armLen = 0.74;

    if (prop === 'slim') {
      scaleX = 0.92; scaleZ = 0.90; shoulderW = 0.48; chestW = 0.38; waistW = 0.32; hipW = 0.36;
    } else if (prop === 'athletic') {
      scaleX = 1.08; scaleZ = 1.05; shoulderW = 0.62; chestW = 0.50; waistW = 0.38; hipW = 0.42;
    } else if (prop === 'soft') {
      scaleX = 1.06; scaleZ = 1.10; shoulderW = 0.52; chestW = 0.46; waistW = 0.44; hipW = 0.46;
    } else if (prop === 'tall') {
      scaleY = 1.08; legLen = 0.96; armLen = 0.80;
    } else if (prop === 'short') {
      scaleY = 0.92; legLen = 0.78; armLen = 0.66;
    }

    return {
      prop, scaleX, scaleY, scaleZ, shoulderW, chestW, waistW, hipW, legLen, armLen,
      headY: 1.62 * scaleY,
      neckY: 1.44 * scaleY,
      chestY: 1.25 * scaleY,
      waistY: 1.04 * scaleY,
      hipY: 0.88 * scaleY,
      kneeY: 0.46 * scaleY,
      ankleY: 0.10 * scaleY,
      floorY: 0.0
    };
  }

  // 4. Geometry & Material Factory Helpers
  function createStandardMaterial(color, options = {}) {
    return new THREE.MeshStandardMaterial(Object.assign({
      color: parseColor(color),
      roughness: 0.58,
      metalness: 0.05,
      flatShading: false
    }, options));
  }

  function createSmoothMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // Clean recursive disposal helper for groups
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
   * 5. 3D Character Model Builder
   */
  class AvatarCharacter3D {
    constructor(config = {}, options = {}) {
      this.config = Object.assign({}, DEFAULT_CONFIGS.boy, config);
      this.options = options;
      this.mode = options.mode || 'full';
      this.group = new THREE.Group();
      this.bones = {};
      this.sockets = {};
      this.materials = {};
      this.animTime = 0;

      this.buildSkeleton();
      this.buildBody();
      this.update(this.config);
    }

    buildSkeleton() {
      const m = getBodyMetrics(this.config.body || 'regular');
      this.metrics = m;

      // Ground Contact Shadow
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 128;
      shadowCanvas.height = 128;
      const ctx = shadowCanvas.getContext('2d');
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.48)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.22)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);

      const shadowTex = new THREE.CanvasTexture(shadowCanvas);
      const shadowGeo = new THREE.PlaneGeometry(0.88, 0.88);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false
      });
      this.groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
      this.groundShadow.rotation.x = -Math.PI / 2;
      this.groundShadow.position.y = 0.002;
      this.group.add(this.groundShadow);

      // Hierarchical Character Rig Root (Rotates all parts together as ONE character)
      this.characterRoot = new THREE.Group();
      this.group.add(this.characterRoot);

      // Pelvis / Hips (Root bone of the body)
      this.bones.pelvis = new THREE.Group();
      this.bones.pelvis.position.set(0, m.hipY, 0);
      this.characterRoot.add(this.bones.pelvis);

      // Chest / Spine (Child of pelvis)
      this.bones.chest = new THREE.Group();
      this.bones.chest.position.set(0, m.chestY - m.hipY, 0);
      this.bones.pelvis.add(this.bones.chest);

      // Neck (Child of chest)
      this.bones.neck = new THREE.Group();
      this.bones.neck.position.set(0, m.neckY - m.chestY, 0);
      this.bones.chest.add(this.bones.neck);

      // Head (Child of neck)
      this.bones.head = new THREE.Group();
      this.bones.head.position.set(0, m.headY - m.neckY, 0);
      this.bones.neck.add(this.bones.head);

      // Sockets on Head
      this.sockets.head = new THREE.Group();
      this.sockets.head.position.set(0, 0.18, 0);
      this.bones.head.add(this.sockets.head);

      this.sockets.face = new THREE.Group();
      this.sockets.face.position.set(0, 0.02, 0.14);
      this.bones.head.add(this.sockets.face);

      this.sockets.leftEar = new THREE.Group();
      this.sockets.leftEar.position.set(-0.165, 0.01, 0);
      this.bones.head.add(this.sockets.leftEar);

      this.sockets.rightEar = new THREE.Group();
      this.sockets.rightEar.position.set(0.165, 0.01, 0);
      this.bones.head.add(this.sockets.rightEar);

      // Left Arm Chain
      this.bones.leftShoulder = new THREE.Group();
      this.bones.leftShoulder.position.set(-m.shoulderW / 2, 0.02, 0);
      this.bones.chest.add(this.bones.leftShoulder);

      this.bones.leftArm = new THREE.Group();
      this.bones.leftArm.position.set(0, 0, 0);
      this.bones.leftShoulder.add(this.bones.leftArm);

      this.bones.leftForearm = new THREE.Group();
      this.bones.leftForearm.position.set(0, -m.armLen * 0.44, 0);
      this.bones.leftArm.add(this.bones.leftForearm);

      this.bones.leftHand = new THREE.Group();
      this.bones.leftHand.position.set(0, -m.armLen * 0.44, 0);
      this.bones.leftForearm.add(this.bones.leftHand);

      // Explicit leftHandSocket inside the fingers grip channel
      this.sockets.leftHand = new THREE.Group();
      this.sockets.leftHand.position.set(0, -0.052, 0.020);
      this.bones.leftHand.add(this.sockets.leftHand);

      // Right Arm Chain
      this.bones.rightShoulder = new THREE.Group();
      this.bones.rightShoulder.position.set(m.shoulderW / 2, 0.02, 0);
      this.bones.chest.add(this.bones.rightShoulder);

      this.bones.rightArm = new THREE.Group();
      this.bones.rightArm.position.set(0, 0, 0);
      this.bones.rightShoulder.add(this.bones.rightArm);

      this.bones.rightForearm = new THREE.Group();
      this.bones.rightForearm.position.set(0, -m.armLen * 0.44, 0);
      this.bones.rightArm.add(this.bones.rightForearm);

      this.bones.rightHand = new THREE.Group();
      this.bones.rightHand.position.set(0, -m.armLen * 0.44, 0);
      this.bones.rightForearm.add(this.bones.rightHand);

      // Explicit rightHandSocket inside the fingers grip channel
      this.sockets.rightHand = new THREE.Group();
      this.sockets.rightHand.position.set(0, -0.052, 0.020);
      this.bones.rightHand.add(this.sockets.rightHand);

      // Left Leg Chain
      this.bones.leftThigh = new THREE.Group();
      this.bones.leftThigh.position.set(-m.hipW * 0.28, 0, 0);
      this.bones.pelvis.add(this.bones.leftThigh);

      this.bones.leftShin = new THREE.Group();
      this.bones.leftShin.position.set(0, -(m.hipY - m.kneeY), 0);
      this.bones.leftThigh.add(this.bones.leftShin);

      this.bones.leftFoot = new THREE.Group();
      this.bones.leftFoot.position.set(0, -(m.kneeY - m.ankleY), 0);
      this.bones.leftShin.add(this.bones.leftFoot);

      // Right Leg Chain
      this.bones.rightThigh = new THREE.Group();
      this.bones.rightThigh.position.set(m.hipW * 0.28, 0, 0);
      this.bones.pelvis.add(this.bones.rightThigh);

      this.bones.rightShin = new THREE.Group();
      this.bones.rightShin.position.set(0, -(m.hipY - m.kneeY), 0);
      this.bones.rightThigh.add(this.bones.rightShin);

      this.bones.rightFoot = new THREE.Group();
      this.bones.rightFoot.position.set(0, -(m.kneeY - m.ankleY), 0);
      this.bones.rightShin.add(this.bones.rightFoot);

      // Other sockets
      this.sockets.back = new THREE.Group();
      this.sockets.back.position.set(0, 0, -0.15);
      this.bones.chest.add(this.sockets.back);

      this.sockets.waist = new THREE.Group();
      this.sockets.waist.position.set(0, 0, 0);
      this.bones.pelvis.add(this.sockets.waist);

      // Natural standing posture
      this.bones.leftArm.rotation.z = 0.08;
      this.bones.leftArm.rotation.x = 0.05;
      this.bones.leftForearm.rotation.x = -0.14;
      this.bones.rightArm.rotation.z = -0.08;
      this.bones.rightArm.rotation.x = 0.05;
      this.bones.rightForearm.rotation.x = -0.14;
    }

    buildBody() {
      const m = this.metrics;
      this.skinMat = createStandardMaterial(0xe0a96d, { roughness: 0.65 });

      // 1. Head Mesh
      const headGeo = new THREE.SphereGeometry(0.175, 24, 20);
      headGeo.scale(1.0, 1.15, 1.05);
      this.headMesh = createSmoothMesh(headGeo, this.skinMat);
      this.bones.head.add(this.headMesh);

      // Ears
      const earGeo = new THREE.SphereGeometry(0.040, 14, 10);
      earGeo.scale(0.38, 1.25, 0.85);
      const earL = createSmoothMesh(earGeo, this.skinMat);
      earL.position.set(-0.17, 0, 0);
      earL.rotation.y = 0.22;
      this.bones.head.add(earL);

      const earR = createSmoothMesh(earGeo, this.skinMat);
      earR.position.set(0.17, 0, 0);
      earR.rotation.y = -0.22;
      this.bones.head.add(earR);

      // Neck Mesh (Child of neck bone)
      const neckGeo = new THREE.CylinderGeometry(0.064, 0.076, m.headY - m.neckY, 16);
      neckGeo.translate(0, (m.headY - m.neckY) / 2, 0);
      this.neckMesh = createSmoothMesh(neckGeo, this.skinMat);
      this.bones.neck.add(this.neckMesh);

      // 2. Torso Base Mesh (Chest + Abdomen)
      const torsoH = m.neckY - m.hipY;
      const torsoGeo = new THREE.CylinderGeometry(m.chestW * 0.44, m.waistW * 0.42, torsoH, 18);
      torsoGeo.scale(1.0, 1.0, 0.78);
      torsoGeo.translate(0, torsoH / 2, 0);
      this.torsoMesh = createSmoothMesh(torsoGeo, this.skinMat);
      this.bones.pelvis.add(this.torsoMesh);

      // Pelvis Mesh
      const pelvisGeo = new THREE.SphereGeometry(m.hipW * 0.42, 16, 12);
      pelvisGeo.scale(1.1, 0.82, 0.80);
      this.pelvisMesh = createSmoothMesh(pelvisGeo, this.skinMat);
      this.bones.pelvis.add(this.pelvisMesh);

      // 3. Arms & Physical Gripping Hands
      const armLenSegment = m.armLen * 0.44;
      const armGeo = new THREE.CylinderGeometry(0.048, 0.042, armLenSegment, 14);
      armGeo.translate(0, -armLenSegment / 2, 0);

      this.armLMesh = createSmoothMesh(armGeo, this.skinMat);
      this.bones.leftArm.add(this.armLMesh);

      this.armRMesh = createSmoothMesh(armGeo, this.skinMat);
      this.bones.rightArm.add(this.armRMesh);

      const forearmGeo = new THREE.CylinderGeometry(0.042, 0.036, armLenSegment, 14);
      forearmGeo.translate(0, -armLenSegment / 2, 0);

      this.forearmLMesh = createSmoothMesh(forearmGeo, this.skinMat);
      this.bones.leftForearm.add(this.forearmLMesh);

      this.forearmRMesh = createSmoothMesh(forearmGeo, this.skinMat);
      this.bones.rightForearm.add(this.forearmRMesh);

      // Sculpted Gripping Hands (Palm + Curled fingers grip + Thumb)
      this.handLGroup = this.buildGrippingHand(this.skinMat, 'left');
      this.bones.leftHand.add(this.handLGroup);

      this.handRGroup = this.buildGrippingHand(this.skinMat, 'right');
      this.bones.rightHand.add(this.handRGroup);

      // 4. Legs (Thighs & Shins Base)
      const thighLen = m.hipY - m.kneeY;
      const thighGeo = new THREE.CylinderGeometry(0.072, 0.056, thighLen, 16);
      thighGeo.translate(0, -thighLen / 2, 0);

      this.thighLMesh = createSmoothMesh(thighGeo, this.skinMat);
      this.bones.leftThigh.add(this.thighLMesh);

      this.thighRMesh = createSmoothMesh(thighGeo, this.skinMat);
      this.bones.rightThigh.add(this.thighRMesh);

      const shinLen = m.kneeY - m.ankleY;
      const shinGeo = new THREE.CylinderGeometry(0.056, 0.044, shinLen, 16);
      shinGeo.translate(0, -shinLen / 2, 0);

      this.shinLMesh = createSmoothMesh(shinGeo, this.skinMat);
      this.bones.leftShin.add(this.shinLMesh);

      this.shinRMesh = createSmoothMesh(shinGeo, this.skinMat);
      this.bones.rightShin.add(this.shinRMesh);

      // Feet Base
      const footGeo = new THREE.BoxGeometry(0.078, 0.054, 0.15);
      footGeo.translate(0, -0.027, 0.045);
      this.footLMesh = createSmoothMesh(footGeo, this.skinMat);
      this.bones.leftFoot.add(this.footLMesh);

      this.footRMesh = createSmoothMesh(footGeo, this.skinMat);
      this.bones.rightFoot.add(this.footRMesh);

      // Face Features Group
      this.faceFeaturesGroup = new THREE.Group();
      this.bones.head.add(this.faceFeaturesGroup);
    }

    buildGrippingHand(material, side = 'left') {
      const g = new THREE.Group();

      // Palm
      const palmGeo = new THREE.BoxGeometry(0.054, 0.068, 0.036);
      palmGeo.translate(0, -0.034, 0);
      const palm = createSmoothMesh(palmGeo, material);
      g.add(palm);

      // 4 Curled Fingers Forming Natural Grip Socket
      const fingerGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.050, 12);
      fingerGeo.rotateZ(Math.PI / 2);
      fingerGeo.translate(0, -0.055, 0.022);
      const fingers = createSmoothMesh(fingerGeo, material);
      g.add(fingers);

      // Opposed Thumb Pressing Over the Grip
      const thumbGeo = new THREE.CylinderGeometry(0.014, 0.012, 0.036, 10);
      const sign = side === 'left' ? -1 : 1;
      thumbGeo.rotateZ(sign * 0.65);
      thumbGeo.translate(sign * 0.024, -0.028, 0.018);
      const thumb = createSmoothMesh(thumbGeo, material);
      g.add(thumb);

      return g;
    }

    /**
     * Updates full avatar customization based on configuration state
     */
    update(config) {
      this.config = Object.assign({}, this.config, config);
      const cfg = this.config;

      // 1. Skin Tone & Face Shape Morph
      const skinObj = PALETTES.skin[cfg.skin] || deriveShades(cfg.skin, PALETTES.skin.skin_04);
      const skinColor = parseColor(skinObj.main || cfg.skin);
      this.skinMat.color.copy(skinColor);

      // Body Shape & Face Shape Proportions
      this.applyBodyShape(cfg.body);
      this.applyFaceShape(cfg.face);

      // 2. Face Features (3D Eyes, Eyebrows, Nose, Mouth, Freckles, Facial Hair)
      this.buildFaceFeatures(cfg);

      // 3. Hairstyle
      this.buildHairstyle(cfg);

      // 4. Glasses
      this.buildGlasses(cfg);

      // 5. Hats & Headwear
      this.buildHeadwear(cfg);

      // 6. Tops & Shirts (Torso-fitted, zero gaps, anti-leakage occlusion)
      this.buildTops(cfg);

      // 7. Pants & Lowers (Leg occlusion & perfect waist meeting)
      this.buildBottoms(cfg);

      // 8. Dresses
      this.buildDress(cfg);

      // 9. Shoes
      this.buildShoes(cfg);

      // 10. Accessories (Bags, Headphones, Necklaces, Watches)
      this.buildAccessories(cfg);

      // 11. Held Special Items (Pencil with physical hand anchor, Book, Laptop, Trophy)
      this.buildSpecialItems(cfg);

      // 12. Leaderboard Award (Gold Trophy, Silver/Bronze Medals)
      this.buildHeldAwards(cfg);
    }

    applyBodyShape(shape = 'regular') {
      if (!this.characterRoot) return;
      let sx = 1.0, sy = 1.0, sz = 1.0;
      if (shape === 'slim') {
        sx = 0.92; sy = 1.02; sz = 0.92;
      } else if (shape === 'athletic') {
        sx = 1.08; sy = 1.02; sz = 1.04;
      } else if (shape === 'soft') {
        sx = 1.10; sy = 0.98; sz = 1.10;
      } else if (shape === 'tall') {
        sx = 0.96; sy = 1.08; sz = 0.96;
      } else if (shape === 'short') {
        sx = 1.04; sy = 0.90; sz = 1.04;
      }
      this.characterRoot.scale.set(sx, sy, sz);
    }

    applyFaceShape(shape = 'face_round') {
      if (!this.headMesh) return;
      let sx = 1.0, sy = 1.15, sz = 1.05;

      if (shape === 'face_oval') {
        sx = 0.94; sy = 1.20; sz = 1.02;
      } else if (shape === 'face_square') {
        sx = 1.06; sy = 1.08; sz = 1.06;
      } else if (shape === 'face_soft') {
        sx = 0.98; sy = 1.12; sz = 1.02;
      } else if (shape === 'face_long') {
        sx = 0.92; sy = 1.25; sz = 1.0;
      } else if (shape === 'face_wide') {
        sx = 1.12; sy = 1.06; sz = 1.08;
      } else if (shape === 'face_heart') {
        sx = 1.02; sy = 1.14; sz = 1.02;
      } else if (shape === 'face_chiseled' || shape === 'face_diamond') {
        sx = 1.04; sy = 1.18; sz = 1.06;
      }

      this.headMesh.scale.set(sx, sy, sz);
    }

    buildFaceFeatures(cfg) {
      if (!this.faceFeaturesGroup) {
        this.faceFeaturesGroup = new THREE.Group();
        this.bones.head.add(this.faceFeaturesGroup);
      } else {
        disposeGroup(this.faceFeaturesGroup);
        this.faceFeaturesGroup.clear();
      }

      const eyeColor = parseColor(cfg.eyeColor || 'dark_brown');
      const hairColor = parseColor(cfg.hairColor || 'black');
      const skinShadow = parseColor((PALETTES.skin[cfg.skin] || PALETTES.skin.skin_04).shadow);

      // --- 3D Layered Eyes ---
      const eyeStyle = cfg.eyes || 'eyes_friendly';
      const eyeR = (eyeStyle === 'eyes_large' || eyeStyle === 'eyes_cartoon') ? 0.038 : (eyeStyle === 'eyes_small' ? 0.028 : 0.033);
      const eyeSpacing = 0.064;

      [-1, 1].forEach(sign => {
        const eyeG = new THREE.Group();
        eyeG.position.set(sign * eyeSpacing, 0.025, 0.155);

        // Sclera (White base with subtle specular gloss)
        const scleraGeo = new THREE.SphereGeometry(eyeR, 16, 14);
        scleraGeo.scale(1.15, 0.92, 0.46);
        const scleraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 });
        const sclera = new THREE.Mesh(scleraGeo, scleraMat);
        eyeG.add(sclera);

        // Iris
        const irisGeo = new THREE.CircleGeometry(eyeR * 0.65, 16);
        const irisMat = new THREE.MeshBasicMaterial({ color: eyeColor });
        const iris = new THREE.Mesh(irisGeo, irisMat);
        iris.position.set(sign * 0.003, 0, eyeR * 0.44);
        eyeG.add(iris);

        // Pupil
        const pupilGeo = new THREE.CircleGeometry(eyeR * 0.32, 14);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0d });
        const pupil = new THREE.Mesh(pupilGeo, pupilMat);
        pupil.position.set(sign * 0.003, 0, eyeR * 0.46);
        eyeG.add(pupil);

        // Primary Specular Reflection
        const reflexGeo = new THREE.CircleGeometry(eyeR * 0.15, 10);
        const reflexMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const reflex = new THREE.Mesh(reflexGeo, reflexMat);
        reflex.position.set(sign * 0.003 - 0.007, 0.008, eyeR * 0.48);
        eyeG.add(reflex);

        // Secondary Soft Highlight
        const softReflexGeo = new THREE.CircleGeometry(eyeR * 0.08, 8);
        const softReflex = new THREE.Mesh(softReflexGeo, reflexMat);
        softReflex.position.set(sign * 0.003 + 0.006, -0.006, eyeR * 0.48);
        eyeG.add(softReflex);

        this.faceFeaturesGroup.add(eyeG);
      });

      // --- Eyebrows ---
      const browStyle = cfg.eyebrows || 'brows_thick';
      const browThick = (browStyle === 'brows_thick' || browStyle === 'brows_bushy') ? 0.013 : (browStyle === 'brows_thin' ? 0.006 : 0.009);
      const browAngle = (browStyle === 'brows_curved' || browStyle === 'brows_arched') ? 0.14 : (browStyle === 'brows_raised' ? 0.22 : 0.06);

      [-1, 1].forEach(sign => {
        const browGeo = new THREE.BoxGeometry(0.050, browThick, 0.012);
        const browMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 });
        const brow = new THREE.Mesh(browGeo, browMat);
        brow.position.set(sign * eyeSpacing, 0.068, 0.165);
        brow.rotation.z = -sign * browAngle;
        this.faceFeaturesGroup.add(brow);
      });

      // --- 3D Sculpted Nose ---
      const noseStyle = cfg.nose || 'nose_medium';
      const noseLen = (noseStyle === 'nose_small' || noseStyle === 'nose_button') ? 0.026 : 0.038;
      const noseW = (noseStyle === 'nose_wide') ? 0.034 : 0.024;

      const noseGeo = new THREE.ConeGeometry(noseW, noseLen, 12);
      noseGeo.rotateX(-Math.PI / 2);
      const noseMesh = createSmoothMesh(noseGeo, this.skinMat);
      noseMesh.position.set(0, -0.012, 0.178);
      this.faceFeaturesGroup.add(noseMesh);

      // --- Mouth & Lips ---
      const mouthStyle = cfg.mouth || 'mouth_smile';
      const lipColor = 0xc0392b;

      if (mouthStyle === 'mouth_big_smile' || mouthStyle === 'mouth_laugh' || mouthStyle === 'mouth_grin') {
        const mouthGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.012, 16, 1, false, 0, Math.PI);
        mouthGeo.rotateX(-Math.PI / 2);
        const mouthMat = new THREE.MeshStandardMaterial({ color: lipColor });
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, -0.065, 0.164);
        this.faceFeaturesGroup.add(mouth);

        // Teeth
        const teethGeo = new THREE.BoxGeometry(0.038, 0.009, 0.006);
        const teethMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const teeth = new THREE.Mesh(teethGeo, teethMat);
        teeth.position.set(0, -0.062, 0.170);
        this.faceFeaturesGroup.add(teeth);
      } else {
        const mouthGeo = new THREE.TorusGeometry(0.028, 0.006, 10, 16, Math.PI * 0.8);
        mouthGeo.rotateZ(-Math.PI * 0.9);
        const mouthMat = new THREE.MeshStandardMaterial({ color: lipColor });
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, -0.062, 0.168);
        this.faceFeaturesGroup.add(mouth);
      }

      // --- Freckles / Beauty Spots ---
      const marks = cfg.freckles || 'none';
      if (marks === 'freckles_light' || marks === 'freckles_cheeks') {
        const dotMat = new THREE.MeshBasicMaterial({ color: skinShadow });
        [
          [-0.07, -0.02, 0.155], [-0.09, -0.025, 0.145], [-0.05, -0.03, 0.16],
          [0.07, -0.02, 0.155], [0.09, -0.025, 0.145], [0.05, -0.03, 0.16]
        ].forEach(pos => {
          const dot = new THREE.Mesh(new THREE.SphereGeometry(0.004, 6, 6), dotMat);
          dot.position.set(...pos);
          this.faceFeaturesGroup.add(dot);
        });
      } else if (marks === 'beauty_spot_left') {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 8, 8), new THREE.MeshBasicMaterial({ color: skinShadow }));
        dot.position.set(-0.065, -0.045, 0.158);
        this.faceFeaturesGroup.add(dot);
      } else if (marks === 'beauty_spot_right') {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 8, 8), new THREE.MeshBasicMaterial({ color: skinShadow }));
        dot.position.set(0.065, -0.045, 0.158);
        this.faceFeaturesGroup.add(dot);
      }

      // --- Facial Hair ---
      const fHair = cfg.facialHair || 'none';
      if (fHair !== 'none') {
        const facialHairColor = parseColor(cfg.facialHairColor || cfg.hairColor || 'black');
        const fMat = new THREE.MeshStandardMaterial({ color: facialHairColor, roughness: 0.8 });
        if (fHair === 'mustache' || fHair === 'mustache_handlebar') {
          const stacheGeo = new THREE.TorusGeometry(0.034, 0.009, 8, 14, Math.PI * 0.75);
          stacheGeo.rotateZ(Math.PI * 0.12);
          const stache = createSmoothMesh(stacheGeo, fMat);
          stache.position.set(0, -0.042, 0.174);
          this.faceFeaturesGroup.add(stache);
        } else if (fHair === 'light_beard' || fHair === 'short_beard' || fHair === 'stubble') {
          const beardGeo = new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55);
          beardGeo.scale(1.02, 1.15, 1.06);
          const beard = createSmoothMesh(beardGeo, fMat);
          this.faceFeaturesGroup.add(beard);
        } else if (fHair === 'full_beard' || fHair === 'lumberjack') {
          const beardGeo = new THREE.BoxGeometry(0.18, 0.14, 0.14);
          beardGeo.translate(0, -0.12, 0.08);
          const beard = createSmoothMesh(beardGeo, fMat);
          this.faceFeaturesGroup.add(beard);
        } else if (fHair === 'goatee' || fHair === 'vandyke') {
          const goateeGeo = new THREE.SphereGeometry(0.04, 10, 10);
          goateeGeo.scale(0.8, 1.4, 0.8);
          goateeGeo.translate(0, -0.10, 0.14);
          const goatee = createSmoothMesh(goateeGeo, fMat);
          this.faceFeaturesGroup.add(goatee);
        }
      }
    }

    buildHairstyle(cfg) {
      if (this.hairMeshGroup) {
        disposeGroup(this.hairMeshGroup);
        this.bones.head.remove(this.hairMeshGroup);
      }
      this.hairMeshGroup = new THREE.Group();
      this.bones.head.add(this.hairMeshGroup);

      const style = cfg.hair || 'hair_boy_fade';
      if (style === 'none') return;

      const hairColor = parseColor(cfg.hairColor || 'black');
      const mat = createStandardMaterial(hairColor, { roughness: 0.45, metalness: 0.05 });

      // Volumetric Stylized 3D Hair Models
      if (style === 'hair_boy_fade' || style === 'hair_boy_crew' || style === 'hair_boy_buzz') {
        const topGeo = new THREE.SphereGeometry(0.185, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
        topGeo.scale(1.02, 1.16, 1.05);
        topGeo.translate(0, 0.02, -0.01);
        const hairTop = createSmoothMesh(topGeo, mat);
        this.hairMeshGroup.add(hairTop);

        const sideGeo = new THREE.CylinderGeometry(0.182, 0.178, 0.12, 20);
        sideGeo.scale(1.0, 1.0, 1.05);
        sideGeo.translate(0, 0.02, -0.01);
        const hairSides = createSmoothMesh(sideGeo, mat);
        this.hairMeshGroup.add(hairSides);
      } else if (style === 'hair_boy_short') {
        const topGeo = new THREE.SphereGeometry(0.188, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.56);
        topGeo.scale(1.03, 1.18, 1.06);
        topGeo.translate(0, 0.02, -0.01);
        this.hairMeshGroup.add(createSmoothMesh(topGeo, mat));

        const fringeGeo = new THREE.BoxGeometry(0.16, 0.045, 0.06);
        fringeGeo.rotateX(0.15);
        fringeGeo.translate(0, 0.14, 0.13);
        this.hairMeshGroup.add(createSmoothMesh(fringeGeo, mat));

        const sideGeo = new THREE.CylinderGeometry(0.182, 0.174, 0.14, 20);
        sideGeo.scale(1.02, 1.0, 1.05);
        sideGeo.translate(0, 0.01, -0.01);
        this.hairMeshGroup.add(createSmoothMesh(sideGeo, mat));
      } else if (style === 'hair_boy_sidepart' || style === 'hair_boy_quiff') {
        const topGeo = new THREE.SphereGeometry(0.19, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
        topGeo.scale(1.04, 1.20, 1.08);
        topGeo.translate(0, 0.04, 0.02);
        const hairTop = createSmoothMesh(topGeo, mat);
        this.hairMeshGroup.add(hairTop);

        const quiffGeo = new THREE.BoxGeometry(0.14, 0.08, 0.08);
        quiffGeo.rotateX(0.3);
        quiffGeo.translate(0.02, 0.18, 0.11);
        const quiff = createSmoothMesh(quiffGeo, mat);
        this.hairMeshGroup.add(quiff);
      } else if (style === 'hair_boy_spiky') {
        const baseGeo = new THREE.SphereGeometry(0.185, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
        baseGeo.scale(1.02, 1.15, 1.05);
        baseGeo.translate(0, 0.02, -0.01);
        this.hairMeshGroup.add(createSmoothMesh(baseGeo, mat));

        const spikes = [
          [0, 0.22, 0.04, 0.35, 0, 0.05, 0.11],
          [-0.06, 0.20, 0.06, 0.25, 0.3, 0.04, 0.09],
          [0.06, 0.20, 0.06, 0.25, -0.3, 0.04, 0.09],
          [0, 0.21, -0.04, -0.2, 0, 0.045, 0.10],
          [-0.08, 0.17, -0.02, -0.15, 0.35, 0.04, 0.08],
          [0.08, 0.17, -0.02, -0.15, -0.35, 0.04, 0.08]
        ];
        spikes.forEach(([x, y, z, rx, rz, r, h]) => {
          const spikeGeo = new THREE.ConeGeometry(r, h, 8);
          spikeGeo.rotateX(rx);
          spikeGeo.rotateZ(rz);
          const spike = createSmoothMesh(spikeGeo, mat);
          spike.position.set(x, y, z);
          this.hairMeshGroup.add(spike);
        });
      } else if (style === 'hair_boy_curly' || style === 'hair_girl_curly') {
        const clusterCoords = [
          [0, 0.18, 0.02, 0.08], [-0.08, 0.16, 0.06, 0.07], [0.08, 0.16, 0.06, 0.07],
          [-0.12, 0.12, 0, 0.075], [0.12, 0.12, 0, 0.075], [-0.07, 0.15, -0.08, 0.08],
          [0.07, 0.15, -0.08, 0.08], [0, 0.17, -0.07, 0.08], [-0.14, 0.02, -0.03, 0.07],
          [0.14, 0.02, -0.03, 0.07], [0, 0.04, -0.14, 0.08]
        ];
        clusterCoords.forEach(([x, y, z, r]) => {
          const sphere = createSmoothMesh(new THREE.SphereGeometry(r, 12, 10), mat);
          sphere.position.set(x, y, z);
          this.hairMeshGroup.add(sphere);
        });
      } else if (style === 'hair_boy_messy' || style === 'hair_boy_wavy') {
        const topGeo = new THREE.SphereGeometry(0.19, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
        topGeo.scale(1.05, 1.20, 1.08);
        topGeo.translate(0, 0.03, 0);
        this.hairMeshGroup.add(createSmoothMesh(topGeo, mat));

        const locks = [
          [-0.05, 0.17, 0.10, 0.10, 0.06, 0.07, 0.2, 0.15],
          [0.05, 0.18, 0.09, 0.10, 0.06, 0.07, 0.25, -0.15],
          [-0.10, 0.14, 0.07, 0.08, 0.06, 0.06, 0.1, 0.3],
          [0.10, 0.14, 0.07, 0.08, 0.06, 0.06, 0.1, -0.3],
          [0, 0.21, 0.01, 0.12, 0.06, 0.08, 0.3, 0]
        ];
        locks.forEach(([x, y, z, w, h, d, rx, rz]) => {
          const lGeo = new THREE.BoxGeometry(w, h, d);
          lGeo.rotateX(rx);
          lGeo.rotateZ(rz);
          const lock = createSmoothMesh(lGeo, mat);
          lock.position.set(x, y, z);
          this.hairMeshGroup.add(lock);
        });
      } else if (style === 'hair_boy_undercut') {
        const shavedGeo = new THREE.CylinderGeometry(0.180, 0.170, 0.16, 20);
        shavedGeo.scale(1.0, 1.0, 1.05);
        shavedGeo.translate(0, 0.0, -0.01);
        this.hairMeshGroup.add(createSmoothMesh(shavedGeo, mat));

        const slickGeo = new THREE.BoxGeometry(0.18, 0.09, 0.24);
        slickGeo.rotateX(-0.15);
        slickGeo.translate(0, 0.18, -0.02);
        this.hairMeshGroup.add(createSmoothMesh(slickGeo, mat));
      } else if (style === 'hair_afro') {
        const afroGeo = new THREE.SphereGeometry(0.28, 20, 18);
        afroGeo.scale(1.05, 1.1, 1.05);
        afroGeo.translate(0, 0.08, -0.02);
        const afro = createSmoothMesh(afroGeo, mat);
        this.hairMeshGroup.add(afro);
      } else if (style === 'hair_anime_spikes') {
        const baseGeo = new THREE.SphereGeometry(0.185, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
        baseGeo.scale(1.02, 1.16, 1.05);
        this.hairMeshGroup.add(createSmoothMesh(baseGeo, mat));

        const animeSpikes = [
          [0, 0.24, 0.06, 0.4, 0, 0.06, 0.16],
          [-0.10, 0.22, 0.07, 0.3, 0.5, 0.055, 0.15],
          [0.10, 0.22, 0.07, 0.3, -0.5, 0.055, 0.15],
          [-0.14, 0.16, 0.02, 0.1, 0.7, 0.05, 0.14],
          [0.14, 0.16, 0.02, 0.1, -0.7, 0.05, 0.14],
          [0, 0.23, -0.08, -0.5, 0, 0.06, 0.16],
          [-0.09, 0.19, -0.09, -0.4, 0.4, 0.05, 0.14],
          [0.09, 0.19, -0.09, -0.4, -0.4, 0.05, 0.14]
        ];
        animeSpikes.forEach(([x, y, z, rx, rz, r, h]) => {
          const cone = new THREE.ConeGeometry(r, h, 8);
          cone.rotateX(rx);
          cone.rotateZ(rz);
          const mesh = createSmoothMesh(cone, mat);
          mesh.position.set(x, y, z);
          this.hairMeshGroup.add(mesh);
        });
      } else if (style === 'hair_girl_straight' || style === 'hair_girl_wavy' || style === 'hair_girl_shoulder' || style === 'hair_girl_wavymedium') {
        const topGeo = new THREE.SphereGeometry(0.185, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
        topGeo.scale(1.03, 1.18, 1.06);
        topGeo.translate(0, 0.03, 0);
        this.hairMeshGroup.add(createSmoothMesh(topGeo, mat));

        const len = (style === 'hair_girl_wavymedium' || style === 'hair_girl_shoulder') ? 0.32 : 0.46;
        const strandGeo = new THREE.CylinderGeometry(0.05, 0.07, len, 14);
        strandGeo.translate(0, -len / 2 + 0.04, 0);

        const strandL = createSmoothMesh(strandGeo, mat);
        strandL.position.set(-0.15, 0.02, -0.02);
        strandL.rotation.z = -0.08;
        this.hairMeshGroup.add(strandL);

        const strandR = createSmoothMesh(strandGeo, mat);
        strandR.position.set(0.15, 0.02, -0.02);
        strandR.rotation.z = 0.08;
        this.hairMeshGroup.add(strandR);

        const backGeo = new THREE.BoxGeometry(0.28, len - 0.02, 0.09);
        backGeo.translate(0, -len / 2 + 0.06, -0.12);
        this.hairMeshGroup.add(createSmoothMesh(backGeo, mat));
      } else if (style === 'hair_girl_ponytail' || style === 'hair_girl_highpony') {
        const topGeo = new THREE.SphereGeometry(0.185, 20, 16);
        topGeo.scale(1.02, 1.16, 1.05);
        this.hairMeshGroup.add(createSmoothMesh(topGeo, mat));

        const ponyGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.38, 12);
        ponyGeo.rotateX(-0.5);
        ponyGeo.translate(0, 0.04, -0.22);
        this.hairMeshGroup.add(createSmoothMesh(ponyGeo, mat));

        const bandGeo = new THREE.TorusGeometry(0.045, 0.012, 8, 16);
        bandGeo.rotateX(-0.5);
        bandGeo.translate(0, 0.14, -0.14);
        const bandMat = createStandardMaterial(0xe84393);
        this.hairMeshGroup.add(createSmoothMesh(bandGeo, bandMat));
      } else if (style === 'hair_girl_bun' || style === 'hair_girl_topbun') {
        const topGeo = new THREE.SphereGeometry(0.185, 20, 16);
        topGeo.scale(1.02, 1.16, 1.05);
        this.hairMeshGroup.add(createSmoothMesh(topGeo, mat));

        const bunGeo = new THREE.SphereGeometry(0.09, 14, 12);
        const bun = createSmoothMesh(bunGeo, mat);
        bun.position.set(0, 0.25, -0.04);
        this.hairMeshGroup.add(bun);
      } else if (style === 'hair_girl_doublebun') {
        const topGeo = new THREE.SphereGeometry(0.185, 20, 16);
        topGeo.scale(1.02, 1.16, 1.05);
        this.hairMeshGroup.add(createSmoothMesh(topGeo, mat));

        [-0.14, 0.14].forEach(x => {
          const bun = createSmoothMesh(new THREE.SphereGeometry(0.075, 12, 10), mat);
          bun.position.set(x, 0.22, -0.02);
          this.hairMeshGroup.add(bun);
        });
      } else if (style === 'hair_girl_bob' || style === 'hair_girl_pixie') {
        const bobGeo = new THREE.SphereGeometry(0.19, 20, 16);
        bobGeo.scale(1.04, 1.18, 1.08);
        bobGeo.translate(0, 0.02, -0.01);
        this.hairMeshGroup.add(createSmoothMesh(bobGeo, mat));

        const fringeGeo = new THREE.BoxGeometry(0.20, 0.08, 0.06);
        fringeGeo.translate(0, 0.12, 0.14);
        this.hairMeshGroup.add(createSmoothMesh(fringeGeo, mat));
      } else if (style === 'hair_girl_braids') {
        const topGeo = new THREE.SphereGeometry(0.185, 20, 16);
        topGeo.scale(1.02, 1.16, 1.05);
        this.hairMeshGroup.add(createSmoothMesh(topGeo, mat));

        [-0.14, 0.14].forEach(x => {
          const braidGeo = new THREE.CylinderGeometry(0.035, 0.022, 0.38, 10);
          braidGeo.translate(0, -0.19, 0.06);
          const braid = createSmoothMesh(braidGeo, mat);
          braid.position.set(x, 0.04, 0.04);
          this.hairMeshGroup.add(braid);

          const band = createSmoothMesh(new THREE.TorusGeometry(0.025, 0.008, 8, 12), createStandardMaterial(0xff7675));
          band.position.set(x, -0.26, 0.10);
          this.hairMeshGroup.add(band);
        });
      } else if (style === 'hair_girl_sidebraid') {
        const topGeo = new THREE.SphereGeometry(0.185, 20, 16);
        topGeo.scale(1.03, 1.18, 1.06);
        this.hairMeshGroup.add(createSmoothMesh(topGeo, mat));

        const braidGeo = new THREE.CylinderGeometry(0.042, 0.025, 0.42, 12);
        braidGeo.rotateZ(-0.25);
        braidGeo.translate(0.14, -0.20, 0.08);
        const braid = createSmoothMesh(braidGeo, mat);
        this.hairMeshGroup.add(braid);
      } else {
        const topGeo = new THREE.SphereGeometry(0.185, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
        topGeo.scale(1.02, 1.16, 1.05);
        topGeo.translate(0, 0.02, 0);
        this.hairMeshGroup.add(createSmoothMesh(topGeo, mat));
      }
    }

    buildGlasses(cfg) {
      disposeGroup(this.sockets.face);
      this.sockets.face.clear();
      const style = cfg.glasses || 'none';
      if (style === 'none') return;

      const isGold = (style === 'glasses_gold_round');
      const isSunglasses = (style === 'glasses_sunglasses' || style === 'glasses_aviator');
      const frameColor = isGold ? 0xf1c40f : parseColor(cfg.glassesColor || 'black');
      const frameMat = createStandardMaterial(frameColor, {
        metalness: isGold ? 0.85 : 0.3,
        roughness: isGold ? 0.18 : 0.4
      });

      const glassMat = new THREE.MeshStandardMaterial({
        color: isSunglasses ? 0x111111 : 0xffffff,
        roughness: 0.08,
        metalness: 0.1,
        transparent: true,
        opacity: isSunglasses ? 0.88 : 0.22
      });

      const g = new THREE.Group();
      const glassR = (isSunglasses || style === 'glasses_thick') ? 0.038 : 0.032;
      const spacing = 0.064;

      [-1, 1].forEach(sign => {
        if (style !== 'glasses_rimless') {
          let rimGeo;
          if (style === 'glasses_square' || style === 'glasses_wayfarer') {
            rimGeo = new THREE.BoxGeometry(glassR * 2.1, glassR * 1.7, 0.012);
          } else if (style === 'glasses_thick') {
            rimGeo = new THREE.BoxGeometry(glassR * 2.3, glassR * 1.9, 0.020);
          } else if (style === 'glasses_thin') {
            rimGeo = new THREE.TorusGeometry(glassR, 0.0028, 8, 16);
          } else {
            rimGeo = new THREE.TorusGeometry(glassR, 0.005, 8, 16);
          }
          const rim = createSmoothMesh(rimGeo, frameMat);
          rim.position.set(sign * spacing, 0, 0.02);
          g.add(rim);
        }

        const lensGeo = new THREE.CircleGeometry(glassR * 0.92, 14);
        const lens = new THREE.Mesh(lensGeo, glassMat);
        lens.position.set(sign * spacing, 0, 0.02);
        g.add(lens);

        const templeGeo = new THREE.BoxGeometry(0.006, 0.006, 0.15);
        templeGeo.translate(0, 0, -0.075);
        const temple = createSmoothMesh(templeGeo, frameMat);
        temple.position.set(sign * (spacing + glassR), 0, 0.02);
        g.add(temple);
      });

      const bridgeGeo = new THREE.BoxGeometry(spacing * 0.7, 0.008, 0.008);
      const bridge = createSmoothMesh(bridgeGeo, frameMat);
      bridge.position.set(0, 0.01, 0.02);
      g.add(bridge);

      // Top bar for aviator shades
      if (style === 'glasses_aviator') {
        const topBarGeo = new THREE.BoxGeometry(spacing * 1.8, 0.006, 0.008);
        const topBar = createSmoothMesh(topBarGeo, frameMat);
        topBar.position.set(0, glassR + 0.006, 0.02);
        g.add(topBar);
      }

      this.sockets.face.add(g);
    }

    buildHeadwear(cfg) {
      disposeGroup(this.sockets.head);
      this.sockets.head.clear();
      const style = cfg.headwear || 'none';
      if (style === 'none') return;

      const color = parseColor(cfg.headwearColor || 'red');
      const mat = createStandardMaterial(color, { roughness: 0.5 });
      const g = new THREE.Group();

      if (style === 'headwear_cap' || style === 'headwear_snapback') {
        const domeGeo = new THREE.SphereGeometry(0.19, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.5);
        domeGeo.scale(1.02, 0.8, 1.05);
        const dome = createSmoothMesh(domeGeo, mat);
        g.add(dome);

        const visorGeo = new THREE.BoxGeometry(0.20, 0.014, 0.16);
        visorGeo.translate(0, -0.02, 0.16);
        visorGeo.rotateX(0.12);
        const visor = createSmoothMesh(visorGeo, mat);
        g.add(visor);
      } else if (style === 'headwear_backward_cap') {
        const domeGeo = new THREE.SphereGeometry(0.19, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.5);
        domeGeo.scale(1.02, 0.8, 1.05);
        g.add(createSmoothMesh(domeGeo, mat));

        const visorGeo = new THREE.BoxGeometry(0.20, 0.014, 0.16);
        visorGeo.translate(0, -0.02, -0.16);
        visorGeo.rotateX(-0.12);
        g.add(createSmoothMesh(visorGeo, mat));
      } else if (style === 'headwear_beanie' || style === 'headwear_winter_hat') {
        const beanieGeo = new THREE.CylinderGeometry(0.18, 0.195, 0.18, 18);
        beanieGeo.translate(0, 0.06, 0);
        g.add(createSmoothMesh(beanieGeo, mat));

        const pomGeo = new THREE.SphereGeometry(0.055, 12, 10);
        pomGeo.translate(0, 0.18, 0);
        const pomMat = createStandardMaterial(0xf1c40f);
        g.add(createSmoothMesh(pomGeo, pomMat));
      } else if (style === 'headwear_bucket') {
        const topGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.14, 18);
        topGeo.translate(0, 0.05, 0);
        g.add(createSmoothMesh(topGeo, mat));

        const brimGeo = new THREE.CylinderGeometry(0.26, 0.20, 0.03, 18);
        brimGeo.translate(0, -0.02, 0);
        g.add(createSmoothMesh(brimGeo, mat));
      } else if (style === 'headwear_fedora' || style === 'headwear_cowboy') {
        const topGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.15, 18);
        topGeo.translate(0, 0.06, 0);
        g.add(createSmoothMesh(topGeo, mat));

        const brimGeo = new THREE.CylinderGeometry(0.30, 0.30, 0.016, 20);
        brimGeo.translate(0, -0.01, 0);
        g.add(createSmoothMesh(brimGeo, mat));
      } else if (style === 'headwear_crown') {
        const goldMat = createStandardMaterial(0xf1c40f, { metalness: 0.85, roughness: 0.25 });
        const crownGeo = new THREE.CylinderGeometry(0.19, 0.17, 0.12, 8, 1, true);
        crownGeo.translate(0, 0.04, 0);
        g.add(createSmoothMesh(crownGeo, goldMat));
      } else if (style === 'headwear_gradcap') {
        const gradMat = createStandardMaterial(0x1a252f, { roughness: 0.5 });
        const mortarGeo = new THREE.BoxGeometry(0.36, 0.018, 0.36);
        mortarGeo.rotateY(Math.PI / 4);
        mortarGeo.translate(0, 0.08, 0);
        g.add(createSmoothMesh(mortarGeo, gradMat));

        const skullGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.08, 16);
        skullGeo.translate(0, 0.02, 0);
        g.add(createSmoothMesh(skullGeo, gradMat));
      } else if (style === 'headwear_headband') {
        const bandGeo = new THREE.TorusGeometry(0.182, 0.022, 8, 20);
        bandGeo.rotateX(Math.PI / 2);
        bandGeo.translate(0, -0.04, 0);
        g.add(createSmoothMesh(bandGeo, mat));
      } else if (style === 'headwear_party') {
        const coneGeo = new THREE.ConeGeometry(0.14, 0.28, 16);
        coneGeo.translate(0, 0.12, 0);
        g.add(createSmoothMesh(coneGeo, mat));
      }

      this.sockets.head.add(g);
    }

    buildTops(cfg) {
      if (this.topGroup) {
        disposeGroup(this.topGroup);
        this.bones.chest.remove(this.topGroup);
      }
      this.topGroup = new THREE.Group();
      this.bones.chest.add(this.topGroup);

      if (this.leftShoulderMesh) { disposeGroup(this.leftShoulderMesh); this.bones.leftShoulder.remove(this.leftShoulderMesh); this.leftShoulderMesh = null; }
      if (this.rightShoulderMesh) { disposeGroup(this.rightShoulderMesh); this.bones.rightShoulder.remove(this.rightShoulderMesh); this.rightShoulderMesh = null; }
      if (this.leftSleeveMesh) { disposeGroup(this.leftSleeveMesh); this.bones.leftArm.remove(this.leftSleeveMesh); this.leftSleeveMesh = null; }
      if (this.rightSleeveMesh) { disposeGroup(this.rightSleeveMesh); this.bones.rightArm.remove(this.rightSleeveMesh); this.rightSleeveMesh = null; }
      if (this.leftElbowMesh) { disposeGroup(this.leftElbowMesh); this.bones.leftForearm.remove(this.leftElbowMesh); this.leftElbowMesh = null; }
      if (this.rightElbowMesh) { disposeGroup(this.rightElbowMesh); this.bones.rightForearm.remove(this.rightElbowMesh); this.rightElbowMesh = null; }
      if (this.leftForeSleeveMesh) { disposeGroup(this.leftForeSleeveMesh); this.bones.leftForearm.remove(this.leftForeSleeveMesh); this.leftForeSleeveMesh = null; }
      if (this.rightForeSleeveMesh) { disposeGroup(this.rightForeSleeveMesh); this.bones.rightForearm.remove(this.rightForeSleeveMesh); this.rightForeSleeveMesh = null; }

      if (cfg.dress && cfg.dress !== 'none') {
        this.torsoMesh.visible = false;
        return;
      }

      const style = cfg.top || 'top_tshirt';
      if (style === 'none') {
        this.torsoMesh.visible = true;
        this.armLMesh.visible = true;
        this.armRMesh.visible = true;
        this.forearmLMesh.visible = true;
        this.forearmRMesh.visible = true;
        return;
      }

      // Hide underlying base torso mesh to ELIMINATE any possibility of skin clipping through shirt!
      this.torsoMesh.visible = false;

      const m = this.metrics;
      const topColor = parseColor(cfg.topColor || 'blue');
      const mat = createStandardMaterial(topColor, { roughness: 0.65 });
      const shadowColor = parseColor((PALETTES.clothing[cfg.topColor] || PALETTES.clothing.blue).shadow);
      const accentMat = createStandardMaterial(shadowColor, { roughness: 0.65 });

      // Seamless Shoulder Caps to bridge chest and arm sleeves
      const shoulderCapGeo = new THREE.SphereGeometry(0.060, 14, 12);
      this.leftShoulderMesh = createSmoothMesh(shoulderCapGeo, mat);
      this.bones.leftShoulder.add(this.leftShoulderMesh);

      this.rightShoulderMesh = createSmoothMesh(shoulderCapGeo, mat);
      this.bones.rightShoulder.add(this.rightShoulderMesh);

      // Torso Clothing Body (Attached directly to Chest bone for rigid kinematic lockstep)
      const torsoH = (m.neckY - m.hipY) + 0.08;
      const topGeo = new THREE.CylinderGeometry(m.chestW * 0.46, m.waistW * 0.45, torsoH, 18);
      topGeo.scale(1.05, 1.0, 0.84);
      // Position shirt centered on chest bone, overlapping waist cleanly
      const offsetY = -(m.chestY - m.hipY) + torsoH / 2 - 0.03;
      topGeo.translate(0, offsetY, 0);
      const topMesh = createSmoothMesh(topGeo, mat);
      this.topGroup.add(topMesh);

      // Ribbed Collar at Neck
      const collarGeo = new THREE.TorusGeometry(0.082, 0.012, 8, 18);
      collarGeo.rotateX(Math.PI / 2);
      collarGeo.translate(0, m.neckY - m.chestY - 0.01, 0);
      this.topGroup.add(createSmoothMesh(collarGeo, accentMat));

      // Sleeves
      const isLongSleeve = (style === 'top_hoodie' || style === 'top_jacket' || style === 'top_leather_jacket' || style === 'top_blazer' || style === 'top_sweater' || style === 'top_shirt');
      
      if (isLongSleeve) {
        // Hide skin arm cylinders for long sleeves
        this.armLMesh.visible = false;
        this.armRMesh.visible = false;
        this.forearmLMesh.visible = false;
        this.forearmRMesh.visible = false;

        const upperSleeveLen = m.armLen * 0.44;
        const sGeo = new THREE.CylinderGeometry(0.058, 0.052, upperSleeveLen, 14);
        sGeo.translate(0, -upperSleeveLen / 2, 0);

        this.leftSleeveMesh = createSmoothMesh(sGeo, mat);
        this.bones.leftArm.add(this.leftSleeveMesh);

        this.rightSleeveMesh = createSmoothMesh(sGeo, mat);
        this.bones.rightArm.add(this.rightSleeveMesh);

        // Elbow Joint Caps for seamless sleeve bending
        const elbowCapGeo = new THREE.SphereGeometry(0.050, 12, 10);
        this.leftElbowMesh = createSmoothMesh(elbowCapGeo, mat);
        this.bones.leftForearm.add(this.leftElbowMesh);

        this.rightElbowMesh = createSmoothMesh(elbowCapGeo, mat);
        this.bones.rightForearm.add(this.rightElbowMesh);

        const foreSleeveLen = m.armLen * 0.42;
        const foreGeo = new THREE.CylinderGeometry(0.052, 0.046, foreSleeveLen, 14);
        foreGeo.translate(0, -foreSleeveLen / 2, 0);

        this.leftForeSleeveMesh = createSmoothMesh(foreGeo, mat);
        this.bones.leftForearm.add(this.leftForeSleeveMesh);

        this.rightForeSleeveMesh = createSmoothMesh(foreGeo, mat);
        this.bones.rightForearm.add(this.rightForeSleeveMesh);
      } else {
        // Short sleeves: hide upper arm skin, show forearms cleanly
        this.armLMesh.visible = false;
        this.armRMesh.visible = false;
        this.forearmLMesh.visible = true;
        this.forearmRMesh.visible = true;

        const shortSleeveLen = m.armLen * 0.26;
        const sGeo = new THREE.CylinderGeometry(0.058, 0.052, shortSleeveLen, 14);
        sGeo.translate(0, -shortSleeveLen / 2, 0);

        this.leftSleeveMesh = createSmoothMesh(sGeo, mat);
        this.bones.leftArm.add(this.leftSleeveMesh);

        this.rightSleeveMesh = createSmoothMesh(sGeo, mat);
        this.bones.rightArm.add(this.rightSleeveMesh);
      }

      // Special Style Details (Hoodie Hood, Blazer Lapels, Polo Collar)
      if (style === 'top_hoodie') {
        const hoodGeo = new THREE.SphereGeometry(0.17, 14, 12);
        hoodGeo.scale(1.0, 0.65, 0.85);
        hoodGeo.translate(0, m.neckY - m.chestY - 0.02, -0.10);
        this.topGroup.add(createSmoothMesh(hoodGeo, accentMat));
      } else if (style === 'top_blazer') {
        const lapelGeo = new THREE.BoxGeometry(0.08, 0.24, 0.02);
        lapelGeo.translate(-0.06, 0.04, 0.12);
        this.topGroup.add(createSmoothMesh(lapelGeo, accentMat));

        const lapelR = createSmoothMesh(lapelGeo, accentMat);
        lapelR.position.x = 0.12;
        this.topGroup.add(lapelR);

        const tieGeo = new THREE.BoxGeometry(0.038, 0.25, 0.01);
        tieGeo.translate(0, 0.02, 0.13);
        const tieMat = createStandardMaterial(0xc0392b);
        this.topGroup.add(createSmoothMesh(tieGeo, tieMat));
      } else if (style === 'top_polo') {
        const placketGeo = new THREE.BoxGeometry(0.042, 0.14, 0.012);
        placketGeo.translate(0, 0.04, 0.125);
        this.topGroup.add(createSmoothMesh(placketGeo, accentMat));
      }
    }

    buildBottoms(cfg) {
      if (this.bottomGroup) {
        disposeGroup(this.bottomGroup);
        this.bones.pelvis.remove(this.bottomGroup);
      }
      this.bottomGroup = new THREE.Group();
      this.bones.pelvis.add(this.bottomGroup);

      if (this.leftHipMesh) { disposeGroup(this.leftHipMesh); this.bones.leftThigh.remove(this.leftHipMesh); this.leftHipMesh = null; }
      if (this.rightHipMesh) { disposeGroup(this.rightHipMesh); this.bones.rightThigh.remove(this.rightHipMesh); this.rightHipMesh = null; }
      if (this.leftPantsThigh) { disposeGroup(this.leftPantsThigh); this.bones.leftThigh.remove(this.leftPantsThigh); this.leftPantsThigh = null; }
      if (this.rightPantsThigh) { disposeGroup(this.rightPantsThigh); this.bones.rightThigh.remove(this.rightPantsThigh); this.rightPantsThigh = null; }
      if (this.leftKneeMesh) { disposeGroup(this.leftKneeMesh); this.bones.leftShin.remove(this.leftKneeMesh); this.leftKneeMesh = null; }
      if (this.rightKneeMesh) { disposeGroup(this.rightKneeMesh); this.bones.rightShin.remove(this.rightKneeMesh); this.rightKneeMesh = null; }
      if (this.leftPantsShin) { disposeGroup(this.leftPantsShin); this.bones.leftShin.remove(this.leftPantsShin); this.leftPantsShin = null; }
      if (this.rightPantsShin) { disposeGroup(this.rightPantsShin); this.bones.rightShin.remove(this.rightPantsShin); this.rightPantsShin = null; }

      if (cfg.dress && cfg.dress !== 'none') {
        this.pelvisMesh.visible = false;
        this.thighLMesh.visible = false;
        this.thighRMesh.visible = false;
        this.shinLMesh.visible = true;
        this.shinRMesh.visible = true;
        return;
      }

      const style = cfg.bottom || 'bottom_jeans';
      if (style === 'none') {
        this.pelvisMesh.visible = true;
        this.thighLMesh.visible = true;
        this.thighRMesh.visible = true;
        this.shinLMesh.visible = true;
        this.shinRMesh.visible = true;
        return;
      }

      // Hide underlying base pelvis skin mesh when wearing pants
      this.pelvisMesh.visible = false;

      const m = this.metrics;
      const bottomColor = parseColor(cfg.bottomColor || 'denim');
      const mat = createStandardMaterial(bottomColor, { roughness: 0.7 });

      // Waistband & Pelvis (Fitted cleanly over hips and overlapping shirt hem)
      const pelvisPantsGeo = new THREE.SphereGeometry(m.hipW * 0.45, 18, 14);
      pelvisPantsGeo.scale(1.15, 0.92, 0.88);
      pelvisPantsGeo.translate(0, 0.01, 0);
      const pelvisPants = createSmoothMesh(pelvisPantsGeo, mat);
      this.bottomGroup.add(pelvisPants);

      const waistbandGeo = new THREE.CylinderGeometry(m.waistW * 0.46, m.hipW * 0.48, 0.20, 18);
      waistbandGeo.scale(1.10, 1.0, 0.86);
      waistbandGeo.translate(0, 0.04, 0);
      this.bottomGroup.add(createSmoothMesh(waistbandGeo, mat));

      const isShorts = (style === 'bottom_shorts');
      const isSkirt = (style === 'bottom_skirt');
      const thighLen = m.hipY - m.kneeY;
      const shinLen = m.kneeY - m.ankleY;

      if (isSkirt) {
        const skirtGeo = new THREE.CylinderGeometry(m.waistW * 0.44, m.hipW * 0.72, thighLen * 0.95, 18);
        skirtGeo.scale(1.05, 1.0, 0.85);
        skirtGeo.translate(0, -thighLen * 0.40, 0);
        this.bottomGroup.add(createSmoothMesh(skirtGeo, mat));

        this.thighLMesh.visible = true;
        this.thighRMesh.visible = true;
        this.shinLMesh.visible = true;
        this.shinRMesh.visible = true;
      } else if (isShorts) {
        this.thighLMesh.visible = false;
        this.thighRMesh.visible = false;
        this.shinLMesh.visible = true;
        this.shinRMesh.visible = true;

        const shortsThighLen = thighLen * 0.60;
        const shortsGeo = new THREE.CylinderGeometry(0.082, 0.074, shortsThighLen, 16);
        shortsGeo.translate(0, -shortsThighLen / 2, 0);

        this.leftPantsThigh = createSmoothMesh(shortsGeo, mat);
        this.bones.leftThigh.add(this.leftPantsThigh);

        this.rightPantsThigh = createSmoothMesh(shortsGeo, mat);
        this.bones.rightThigh.add(this.rightPantsThigh);
      } else {
        // Full Pants: HIDE all leg skin meshes to PREVENT any clipping/leakage
        this.thighLMesh.visible = false;
        this.thighRMesh.visible = false;
        this.shinLMesh.visible = false;
        this.shinRMesh.visible = false;

        // Hip Joint Caps
        const hipCapGeo = new THREE.SphereGeometry(0.080, 14, 12);
        this.leftHipMesh = createSmoothMesh(hipCapGeo, mat);
        this.bones.leftThigh.add(this.leftHipMesh);
        this.rightHipMesh = createSmoothMesh(hipCapGeo, mat);
        this.bones.rightThigh.add(this.rightHipMesh);

        const pThighGeo = new THREE.CylinderGeometry(0.080, 0.066, thighLen, 16);
        pThighGeo.translate(0, -thighLen / 2, 0);

        this.leftPantsThigh = createSmoothMesh(pThighGeo, mat);
        this.bones.leftThigh.add(this.leftPantsThigh);

        this.rightPantsThigh = createSmoothMesh(pThighGeo, mat);
        this.bones.rightThigh.add(this.rightPantsThigh);

        // Knee Joint Caps for smooth continuous connection between thigh and shin
        const kneeCapGeo = new THREE.SphereGeometry(0.066, 14, 12);
        this.leftKneeMesh = createSmoothMesh(kneeCapGeo, mat);
        this.bones.leftShin.add(this.leftKneeMesh);
        this.rightKneeMesh = createSmoothMesh(kneeCapGeo, mat);
        this.bones.rightShin.add(this.rightKneeMesh);

        const pShinGeo = new THREE.CylinderGeometry(0.066, 0.054, shinLen, 16);
        pShinGeo.translate(0, -shinLen / 2, 0);

        this.leftPantsShin = createSmoothMesh(pShinGeo, mat);
        this.bones.leftShin.add(this.leftPantsShin);

        this.rightPantsShin = createSmoothMesh(pShinGeo, mat);
        this.bones.rightShin.add(this.rightPantsShin);

        if (style === 'bottom_cargo') {
          const pocketGeo = new THREE.BoxGeometry(0.04, 0.07, 0.05);
          const pL = createSmoothMesh(pocketGeo, mat);
          pL.position.set(-0.07, -thighLen * 0.5, 0);
          this.leftPantsThigh.add(pL);

          const pR = createSmoothMesh(pocketGeo, mat);
          pR.position.set(0.07, -thighLen * 0.5, 0);
          this.rightPantsThigh.add(pR);
        }
      }
    }

    buildDress(cfg) {
      if (this.dressGroup) {
        disposeGroup(this.dressGroup);
        this.bones.pelvis.remove(this.dressGroup);
      }
      this.dressGroup = new THREE.Group();
      this.bones.pelvis.add(this.dressGroup);

      if (!cfg.dress || cfg.dress === 'none') return;
      const m = this.metrics;
      const dressColor = parseColor(cfg.dressColor || 'pink');
      const mat = createStandardMaterial(dressColor, { roughness: 0.6 });

      const isLong = (cfg.dress === 'dress_long' || cfg.dress === 'dress_formal' || cfg.dress === 'dress_traditional');
      const skirtLen = isLong ? (m.hipY - m.ankleY) : (m.hipY - m.kneeY + 0.12);

      // Torso Dress
      const torsoH = m.neckY - m.hipY;
      const topGeo = new THREE.CylinderGeometry(m.chestW * 0.45, m.waistW * 0.42, torsoH, 18);
      topGeo.scale(1.02, 1.0, 0.80);
      topGeo.translate(0, torsoH / 2, 0);
      this.dressGroup.add(createSmoothMesh(topGeo, mat));

      // Flared Skirt
      const skirtGeo = new THREE.CylinderGeometry(m.waistW * 0.42, isLong ? 0.32 : 0.28, skirtLen, 20);
      skirtGeo.translate(0, -skirtLen / 2 + 0.02, 0);
      this.dressGroup.add(createSmoothMesh(skirtGeo, mat));
    }

    buildShoes(cfg) {
      if (this.leftShoeMesh) { disposeGroup(this.leftShoeMesh); this.bones.leftFoot.remove(this.leftShoeMesh); this.leftShoeMesh = null; }
      if (this.rightShoeMesh) { disposeGroup(this.rightShoeMesh); this.bones.rightFoot.remove(this.rightShoeMesh); this.rightShoeMesh = null; }

      // Hide skin foot boxes when wearing shoes
      this.footLMesh.visible = false;
      this.footRMesh.visible = false;

      const style = cfg.shoes || 'shoes_sneakers';
      const shoeColor = parseColor(cfg.shoeColor || 'white');
      const mat = createStandardMaterial(shoeColor, { roughness: 0.5 });
      const soleMat = createStandardMaterial(0xffffff, { roughness: 0.8 });

      [-1, 1].forEach(sign => {
        const shoeG = new THREE.Group();
        const parentFoot = sign === -1 ? this.bones.leftFoot : this.bones.rightFoot;

        const isBoot = (style === 'shoes_boots' || style === 'shoes_hightops');
        const shoeH = isBoot ? 0.12 : 0.06;
        const upperGeo = new THREE.BoxGeometry(0.084, shoeH, 0.16);
        upperGeo.translate(0, shoeH / 2 - 0.025, 0.035);
        const upper = createSmoothMesh(upperGeo, mat);
        shoeG.add(upper);

        const soleGeo = new THREE.BoxGeometry(0.090, 0.024, 0.17);
        soleGeo.translate(0, -0.015, 0.035);
        const sole = createSmoothMesh(soleGeo, soleMat);
        shoeG.add(sole);

        parentFoot.add(shoeG);
        if (sign === -1) this.leftShoeMesh = shoeG;
        else this.rightShoeMesh = shoeG;
      });
    }

    buildAccessories(cfg) {
      disposeGroup(this.sockets.back);
      this.sockets.back.clear();
      const style = cfg.accessory || 'none';
      if (style === 'none') return;

      const accColor = parseColor(cfg.accessoryColor || 'gold');
      const mat = createStandardMaterial(accColor, { roughness: 0.4, metalness: 0.2 });

      if (style === 'acc_backpack' || style === 'acc_slingbag') {
        const bagGeo = new THREE.BoxGeometry(0.32, 0.38, 0.14);
        bagGeo.translate(0, 0, -0.06);
        const bag = createSmoothMesh(bagGeo, mat);
        this.sockets.back.add(bag);

        const strapMat = createStandardMaterial(0x2d3436);
        [-0.11, 0.11].forEach(x => {
          const strapGeo = new THREE.TorusGeometry(0.18, 0.016, 8, 16, Math.PI);
          strapGeo.rotateY(Math.PI / 2);
          strapGeo.position.set(x, 0, 0.05);
          this.sockets.back.add(createSmoothMesh(strapGeo, strapMat));
        });
      } else if (style === 'acc_headphones') {
        const hpG = new THREE.Group();
        const bandGeo = new THREE.TorusGeometry(0.19, 0.014, 8, 20, Math.PI);
        bandGeo.translate(0, 0, 0);
        hpG.add(createSmoothMesh(bandGeo, createStandardMaterial(0x2f3542)));

        [-0.185, 0.185].forEach(x => {
          const cupGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.035, 14);
          cupGeo.rotateZ(Math.PI / 2);
          cupGeo.translate(x, 0, 0);
          hpG.add(createSmoothMesh(cupGeo, mat));
        });
        this.sockets.head.add(hpG);
      } else if (style === 'acc_necklace' || style === 'acc_chain') {
        const chainGeo = new THREE.TorusGeometry(0.09, 0.008, 8, 16);
        chainGeo.rotateX(Math.PI / 2.5);
        chainGeo.translate(0, 0.10, 0.06);
        this.bones.chest.add(createSmoothMesh(chainGeo, mat));
      } else if (style === 'acc_watch' || style === 'acc_smartwatch') {
        const watchGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.024, 14);
        const watch = createSmoothMesh(watchGeo, mat);
        watch.position.set(0, -0.14, 0);
        this.bones.rightForearm.add(watch);
      }
    }

    /**
     * Handheld items: Explicit socket attachment system
     * Pencil, Book, Laptop, Trophy securely gripped in hand
     */
    buildSpecialItems(cfg) {
      disposeGroup(this.sockets.leftHand);
      this.sockets.leftHand.clear();
      const item = cfg.specialItem || 'none';
      if (item === 'none') return;

      const itemG = new THREE.Group();

      if (item === 'item_pencil') {
        // Physical 3D Hexagonal Pencil held firmly inside the fingers grip socket
        const pencilMat = createStandardMaterial(0xf1c40f, { roughness: 0.4 });
        const woodMat = createStandardMaterial(0xf5cba7, { roughness: 0.6 });
        const leadMat = createStandardMaterial(0x2c3e50, { roughness: 0.2 });
        const metalMat = createStandardMaterial(0xdcdde1, { metalness: 0.85, roughness: 0.2 });
        const eraserMat = createStandardMaterial(0xff7675, { roughness: 0.7 });

        // Pencil Hex Body Shaft (Centered exactly along grip cylinder)
        const shaftGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.24, 6);
        shaftGeo.rotateX(Math.PI / 2);
        itemG.add(createSmoothMesh(shaftGeo, pencilMat));

        // Sharpened Wooden Cone (Front)
        const coneGeo = new THREE.ConeGeometry(0.010, 0.036, 12);
        coneGeo.rotateX(Math.PI / 2);
        coneGeo.translate(0, 0, 0.138);
        itemG.add(createSmoothMesh(coneGeo, woodMat));

        // Graphite Lead Tip (Front sharp point)
        const tipGeo = new THREE.ConeGeometry(0.004, 0.014, 10);
        tipGeo.rotateX(Math.PI / 2);
        tipGeo.translate(0, 0, 0.160);
        itemG.add(createSmoothMesh(tipGeo, leadMat));

        // Metal Ferrule Band (Rear)
        const bandGeo = new THREE.CylinderGeometry(0.0105, 0.0105, 0.022, 12);
        bandGeo.rotateX(Math.PI / 2);
        bandGeo.translate(0, 0, -0.131);
        itemG.add(createSmoothMesh(bandGeo, metalMat));

        // Rubber Eraser (Rear end)
        const eraserGeo = new THREE.CylinderGeometry(0.0095, 0.0095, 0.024, 12);
        eraserGeo.rotateX(Math.PI / 2);
        eraserGeo.translate(0, 0, -0.152);
        itemG.add(createSmoothMesh(eraserGeo, eraserMat));

        // Natural writing grip angle relative to hand
        itemG.position.set(0, 0, 0);
        itemG.rotation.set(-0.35, 0.25, 0.15);
        this.sockets.leftHand.add(itemG);
      } else if (item === 'item_book') {
        const coverMat = createStandardMaterial(0x2980b9);
        const pageMat = createStandardMaterial(0xecf0f1);

        const bookGeo = new THREE.BoxGeometry(0.18, 0.24, 0.04);
        itemG.add(createSmoothMesh(bookGeo, coverMat));

        const pagesGeo = new THREE.BoxGeometry(0.165, 0.225, 0.034);
        pagesGeo.translate(0.005, 0, 0);
        itemG.add(createSmoothMesh(pagesGeo, pageMat));

        itemG.position.set(-0.06, 0.02, 0.08);
        itemG.rotation.set(0.3, -0.2, 0.4);
        this.sockets.leftHand.add(itemG);
      } else if (item === 'item_laptop') {
        const laptopMat = createStandardMaterial(0x7f8c8d, { metalness: 0.7, roughness: 0.3 });
        const baseGeo = new THREE.BoxGeometry(0.24, 0.014, 0.18);
        itemG.add(createSmoothMesh(baseGeo, laptopMat));

        const screenGeo = new THREE.BoxGeometry(0.24, 0.16, 0.012);
        screenGeo.rotateX(-0.4);
        screenGeo.translate(0, 0.07, -0.07);
        itemG.add(createSmoothMesh(screenGeo, laptopMat));

        itemG.position.set(-0.06, 0, 0.08);
        this.sockets.leftHand.add(itemG);
      } else if (item === 'item_trophy') {
        const goldMat = createStandardMaterial(0xf1c40f, { metalness: 0.85, roughness: 0.2 });
        const cupGeo = new THREE.CylinderGeometry(0.06, 0.02, 0.12, 14);
        cupGeo.translate(0, 0.08, 0);
        itemG.add(createSmoothMesh(cupGeo, goldMat));

        const baseGeo = new THREE.BoxGeometry(0.07, 0.04, 0.07);
        itemG.add(createSmoothMesh(baseGeo, createStandardMaterial(0x2c3e50)));

        this.sockets.leftHand.add(itemG);
      }
    }

    buildHeldAwards(cfg) {
      disposeGroup(this.sockets.rightHand);
      this.sockets.rightHand.clear();
      const award = cfg.heldAward || this.options.heldAward || this.options.award || null;
      if (!award || award === 'none') return;

      const awardG = new THREE.Group();

      if (award === 'trophy_gold' || award === 'trophy') {
        const goldMat = createStandardMaterial(0xf1c40f, { metalness: 0.9, roughness: 0.2 });
        const baseMat = createStandardMaterial(0x1e272e, { roughness: 0.5 });

        const cupGeo = new THREE.CylinderGeometry(0.07, 0.025, 0.14, 16);
        cupGeo.translate(0, 0.10, 0);
        awardG.add(createSmoothMesh(cupGeo, goldMat));

        const pedestalGeo = new THREE.BoxGeometry(0.08, 0.05, 0.08);
        pedestalGeo.translate(0, 0.01, 0);
        awardG.add(createSmoothMesh(pedestalGeo, baseMat));

        [-0.07, 0.07].forEach(x => {
          const handleGeo = new THREE.TorusGeometry(0.035, 0.008, 8, 14);
          handleGeo.position.set(x, 0.10, 0);
          awardG.add(createSmoothMesh(handleGeo, goldMat));
        });

        this.sockets.rightHand.add(awardG);
      } else if (award === 'medal_silver' || award === 'silver') {
        const silverMat = createStandardMaterial(0xdfe4ea, { metalness: 0.85, roughness: 0.25 });
        const ribbonMat = createStandardMaterial(0x2980b9);

        const ribbonGeo = new THREE.BoxGeometry(0.035, 0.14, 0.01);
        awardG.add(createSmoothMesh(ribbonGeo, ribbonMat));

        const medalGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.012, 18);
        medalGeo.rotateX(Math.PI / 2);
        medalGeo.translate(0, -0.07, 0);
        awardG.add(createSmoothMesh(medalGeo, silverMat));

        this.sockets.rightHand.add(awardG);
      } else if (award === 'medal_bronze' || award === 'bronze') {
        const bronzeMat = createStandardMaterial(0xcd6133, { metalness: 0.85, roughness: 0.3 });
        const ribbonMat = createStandardMaterial(0xc0392b);

        const ribbonGeo = new THREE.BoxGeometry(0.035, 0.14, 0.01);
        awardG.add(createSmoothMesh(ribbonGeo, ribbonMat));

        const medalGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.012, 18);
        medalGeo.rotateX(Math.PI / 2);
        medalGeo.translate(0, -0.07, 0);
        awardG.add(createSmoothMesh(medalGeo, bronzeMat));

        this.sockets.rightHand.add(awardG);
      }
    }

    animate(delta = 0.016) {
      this.animTime += delta;

      // Subtle natural breathing & idle head sway
      const breath = Math.sin(this.animTime * 2.2) * 0.005;
      if (this.bones.chest) {
        this.bones.chest.position.y = (this.metrics.chestY - this.metrics.hipY) + breath;
      }
      if (this.bones.head) {
        this.bones.head.rotation.x = Math.sin(this.animTime * 1.5) * 0.018;
        this.bones.head.rotation.y = Math.cos(this.animTime * 0.8) * 0.025;
      }
    }

    dispose() {
      disposeGroup(this.group);
    }
  }

  /**
   * 6. Interactive 3D Avatar Viewport & Scene Controller
   */
  class AvatarViewport3D {
    constructor(container, config = {}, options = {}) {
      this.container = container;
      this.config = Object.assign({}, DEFAULT_CONFIGS.boy, config);
      this.options = options;
      this.mode = options.mode || 'full';
      this.animated = options.animated !== false;

      // Interaction & Rotation State
      this.rotationY = 0;
      this.targetRotationY = 0;
      this.isDragging = false;
      this.previousMouseX = 0;
      this.dragSpeed = 0.0085;
      this.dampingFactor = 0.09;

      // Zoom Scale
      this.zoom = options.zoom || this.config.zoom || 1.0;

      this.initScene();
      this.bindEvents();
      this.applyInitialRotation(options.rotation || this.config.rotation || 'front');
      this.startLoop();
    }

    initScene() {
      // Container cleanup
      while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
      }

      this.width = this.container.clientWidth || (this.mode === 'badge' ? 140 : 320);
      this.height = this.container.clientHeight || (this.mode === 'badge' ? 140 : 420);

      // Scene
      this.scene = new THREE.Scene();

      // Camera
      const fov = this.mode === 'badge' ? 32 : 36;
      this.camera = new THREE.PerspectiveCamera(fov, this.width / this.height, 0.1, 100);
      this.updateCameraPosition();

      // WebGL Renderer
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.canvas = this.renderer.domElement;
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.display = 'block';
      this.canvas.style.cursor = 'grab';
      this.canvas.style.touchAction = 'none'; // Prevent browser gesture conflicts while rotating
      this.container.appendChild(this.canvas);

      // Lighting Setup (Studio 3-Point Lighting)
      this.setupLighting();

      // 3D Avatar Model
      this.character = new AvatarCharacter3D(this.config, this.options);
      this.scene.add(this.character.group);
    }

    setupLighting() {
      // Ambient Light
      const ambient = new THREE.AmbientLight(0xffffff, 0.65);
      this.scene.add(ambient);

      // Warm Key Light
      const keyLight = new THREE.DirectionalLight(0xfffaed, 0.78);
      keyLight.position.set(2.5, 4.0, 3.5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 512;
      keyLight.shadow.mapSize.height = 512;
      keyLight.shadow.bias = -0.001;
      this.scene.add(keyLight);

      // Cool Fill Light
      const fillLight = new THREE.DirectionalLight(0xdde8ff, 0.45);
      fillLight.position.set(-2.5, 2.5, 2.0);
      this.scene.add(fillLight);

      // Rim Light for 3D silhouette definition
      const rimLight = new THREE.DirectionalLight(0x88ccff, 0.42);
      rimLight.position.set(0, 3.0, -3.5);
      this.scene.add(rimLight);
    }

    updateCameraPosition() {
      const aspect = (this.width && this.height) ? (this.width / this.height) : 1.0;
      if (this.mode === 'badge') {
        this.camera.position.set(0, 1.48, 1.05 / this.zoom);
        this.camera.lookAt(0, 1.44, 0);
      } else {
        // Target vertical framing height ~2.05 units (covers from y = -0.05 to y = 1.95)
        const targetH = 2.05;
        const fovRad = (this.camera.fov * Math.PI) / 180;
        let dist = (targetH / (2 * Math.tan(fovRad / 2))) / this.zoom;
        if (aspect < 0.75) {
          dist = dist * (0.75 / aspect);
        }
        this.camera.position.set(0, 0.90, dist);
        this.camera.lookAt(0, 0.90, 0);
      }
    }

    applyInitialRotation(rot) {
      if (rot === 'three_quarter_left') this.targetRotationY = -Math.PI * 0.25;
      else if (rot === 'three_quarter_right') this.targetRotationY = Math.PI * 0.25;
      else if (rot === 'side') this.targetRotationY = Math.PI * 0.5;
      else if (rot === 'back') this.targetRotationY = Math.PI;
      else this.targetRotationY = 0;
      this.rotationY = this.targetRotationY;
    }

    setRotationAngle(rot) {
      if (rot === 'three_quarter_left') this.targetRotationY = -Math.PI * 0.25;
      else if (rot === 'three_quarter_right') this.targetRotationY = Math.PI * 0.25;
      else if (rot === 'side') this.targetRotationY = Math.PI * 0.5;
      else if (rot === 'back') this.targetRotationY = Math.PI;
      else if (rot === 'front') this.targetRotationY = 0;
      else if (typeof rot === 'number') this.targetRotationY = rot;
    }

    rotateBy(delta) {
      this.targetRotationY += delta;
    }

    resetRotation() {
      this.targetRotationY = 0;
    }

    setZoom(val) {
      this.zoom = Math.min(1.5, Math.max(0.7, val));
      this.updateCameraPosition();
    }

    bindEvents() {
      // Mouse drag rotation
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

      // Touch drag rotation for mobile screens
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
        this.targetRotationY += deltaX * this.dragSpeed * 1.25;
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.isDragging = false;
      });

      // Responsive Resize Observer
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

        // Smooth rotation damping
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

    updateConfig(newConfig, options = {}) {
      this.config = Object.assign({}, this.config, newConfig);
      if (options.rotation) this.setRotationAngle(options.rotation);
      if (options.zoom) this.setZoom(options.zoom);
      if (this.character) {
        this.character.update(this.config);
      }
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

  // Active Viewports map
  const activeViewports = new WeakMap();

  // 7. Main AvatarEngine Global API
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
     * Primary Mount Method: Mounts interactive 3D WebGL Avatar in DOM Container
     */
    mount(container, config, options = {}) {
      if (!container) return null;

      // Check if container already has active 3D viewport
      let viewport = activeViewports.get(container);
      if (viewport && !viewport.isDestroyed) {
        viewport.updateConfig(config, options);
        return viewport;
      }

      // Check WebGL / Three.js availability
      if (typeof THREE === 'undefined') {
        console.warn('Three.js not found in global scope.');
        return null;
      }

      try {
        viewport = new AvatarViewport3D(container, config, options);
        container._avatarViewport = viewport;
        activeViewports.set(container, viewport);
        AvatarEngine.lastError = null;
        return viewport;
      } catch (e) {
        AvatarEngine.lastError = (e && e.stack) ? e.stack : String(e);
        console.error('AvatarEngine.mount WebGL error:', e);
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
          { id: 'boy_1', name: 'Sporty Cap', config: { style: 'boy', body: 'athletic', skin: 'skin_04', face: 'face_round', hair: 'hair_boy_fade', hairColor: 'black', eyes: 'eyes_bright', eyeColor: 'dark_brown', eyebrows: 'brows_thick', nose: 'nose_medium', mouth: 'mouth_smile', freckles: 'none', facialHair: 'none', top: 'top_jersey', topColor: 'blue', bottom: 'bottom_shorts', bottomColor: 'navy', dress: 'none', dressColor: 'blue', shoes: 'shoes_sports', shoeColor: 'red', headwear: 'headwear_cap', headwearColor: 'red', glasses: 'none', accessory: 'acc_watch', specialItem: 'none' } },
          { id: 'boy_2', name: 'Geek Hoodie', config: { style: 'boy', body: 'regular', skin: 'skin_02', face: 'face_oval', hair: 'hair_boy_curly', hairColor: 'dark_brown', eyes: 'eyes_friendly', eyeColor: 'brown', eyebrows: 'brows_natural', nose: 'nose_small', mouth: 'mouth_confident', freckles: 'freckles_light', facialHair: 'none', top: 'top_hoodie', topColor: 'purple', bottom: 'bottom_jeans', bottomColor: 'denim', dress: 'none', dressColor: 'purple', shoes: 'shoes_sneakers', shoeColor: 'white', headwear: 'none', glasses: 'glasses_round', glassesColor: 'black', accessory: 'acc_backpack', specialItem: 'item_pencil' } },
          { id: 'boy_3', name: 'Smart Polo', config: { style: 'boy', body: 'slim', skin: 'skin_06', face: 'face_square', hair: 'hair_boy_sidepart', hairColor: 'black', eyes: 'eyes_almond', eyeColor: 'dark_brown', eyebrows: 'brows_straight', nose: 'nose_straight', mouth: 'mouth_smile', freckles: 'none', facialHair: 'mustache', top: 'top_polo', topColor: 'coral', bottom: 'bottom_casual', bottomColor: 'khaki', dress: 'none', dressColor: 'coral', shoes: 'shoes_casual', shoeColor: 'brown', headwear: 'none', glasses: 'glasses_thin', glassesColor: 'gold', accessory: 'acc_watch', specialItem: 'none' } },
          { id: 'boy_4', name: 'Urban Biker', config: { style: 'boy', body: 'regular', skin: 'skin_03', face: 'face_soft', hair: 'hair_boy_spiky', hairColor: 'blonde', eyes: 'eyes_round', eyeColor: 'blue', eyebrows: 'brows_thick', nose: 'nose_rounded', mouth: 'mouth_big_smile', freckles: 'none', facialHair: 'light_beard', top: 'top_leather_jacket', topColor: 'black', bottom: 'bottom_cargo', bottomColor: 'grey', dress: 'none', dressColor: 'black', shoes: 'shoes_boots', shoeColor: 'black', headwear: 'headwear_beanie', headwearColor: 'grey', glasses: 'glasses_sunglasses', accessory: 'acc_headphones', specialItem: 'none' } },
          { id: 'boy_5', name: 'Scholar', config: { style: 'boy', body: 'tall', skin: 'skin_07', face: 'face_long', hair: 'hair_boy_crew', hairColor: 'black', eyes: 'eyes_cartoon', eyeColor: 'dark_brown', eyebrows: 'brows_raised', nose: 'nose_medium', mouth: 'mouth_friendly', freckles: 'none', facialHair: 'none', top: 'top_blazer', topColor: 'navy', bottom: 'bottom_formal', bottomColor: 'navy', dress: 'none', dressColor: 'white', shoes: 'shoes_formal', shoeColor: 'black', headwear: 'none', glasses: 'glasses_square', glassesColor: 'black', accessory: 'acc_tie', specialItem: 'item_book' } }
        ],
        girl: [
          { id: 'girl_1', name: 'Casual Waves', config: { style: 'girl', body: 'regular', skin: 'skin_03', face: 'face_oval', hair: 'hair_girl_wavy', hairColor: 'dark_brown', eyes: 'eyes_bright', eyeColor: 'brown', eyebrows: 'brows_curved', nose: 'nose_small', mouth: 'mouth_smile', freckles: 'freckles_cheeks', facialHair: 'none', top: 'top_casual', topColor: 'purple', bottom: 'bottom_jeans', bottomColor: 'denim', dress: 'none', dressColor: 'purple', shoes: 'shoes_sneakers', shoeColor: 'white', headwear: 'none', glasses: 'none', accessory: 'acc_earrings', accessoryColor: 'gold', specialItem: 'none' } },
          { id: 'girl_2', name: 'Sport Pony', config: { style: 'girl', body: 'athletic', skin: 'skin_05', face: 'face_round', hair: 'hair_girl_highpony', hairColor: 'black', eyes: 'eyes_almond', eyeColor: 'dark_brown', eyebrows: 'brows_natural', nose: 'nose_small', mouth: 'mouth_confident', freckles: 'none', facialHair: 'none', top: 'top_printed', topColor: 'teal', bottom: 'bottom_joggers', bottomColor: 'black', dress: 'none', dressColor: 'teal', shoes: 'shoes_sports', shoeColor: 'pink', headwear: 'headwear_headband', headwearColor: 'pink', glasses: 'none', accessory: 'acc_headphones', specialItem: 'none' } },
          { id: 'girl_3', name: 'Party Crown', config: { style: 'girl', body: 'slim', skin: 'skin_02', face: 'face_soft', hair: 'hair_girl_curly', hairColor: 'auburn', eyes: 'eyes_large', eyeColor: 'green', eyebrows: 'brows_curved', nose: 'nose_small', mouth: 'mouth_big_smile', freckles: 'none', facialHair: 'none', top: 'none', topColor: 'pink', bottom: 'none', bottomColor: 'pink', dress: 'dress_party', dressColor: 'ruby', shoes: 'shoes_casual', shoeColor: 'red', headwear: 'headwear_crown', glasses: 'none', accessory: 'acc_necklace', accessoryColor: 'gold', specialItem: 'item_trophy' } },
          { id: 'girl_4', name: 'Twin Braids', config: { style: 'girl', body: 'regular', skin: 'skin_07', face: 'face_oval', hair: 'hair_girl_braids', hairColor: 'black', eyes: 'eyes_friendly', eyeColor: 'dark_brown', eyebrows: 'brows_thick', nose: 'nose_medium', mouth: 'mouth_smile', freckles: 'none', facialHair: 'none', top: 'top_sweater', topColor: 'yellow', bottom: 'bottom_skirt', bottomColor: 'denim', dress: 'none', dressColor: 'yellow', shoes: 'shoes_boots', shoeColor: 'brown', headwear: 'none', glasses: 'glasses_round', glassesColor: 'gold', accessory: 'acc_backpack', specialItem: 'item_pencil' } },
          { id: 'girl_5', name: 'Chic Bob', config: { style: 'girl', body: 'regular', skin: 'skin_01', face: 'face_square', hair: 'hair_girl_bob', hairColor: 'blonde', eyes: 'eyes_bright', eyeColor: 'blue', eyebrows: 'brows_thin', nose: 'nose_straight', mouth: 'mouth_laugh', freckles: 'beauty_spot_left', facialHair: 'none', top: 'top_jacket', topColor: 'crimson', bottom: 'bottom_jeans', bottomColor: 'black', dress: 'none', dressColor: 'crimson', shoes: 'shoes_sneakers', shoeColor: 'white', headwear: 'none', glasses: 'glasses_aviator', accessory: 'acc_earrings', specialItem: 'none' } }
        ]
      };
      return all[style] || all.boy;
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

      const tops = ['top_tshirt', 'top_printed', 'top_polo', 'top_hoodie', 'top_jacket', 'top_leather_jacket', 'top_blazer', 'top_shirt', 'top_casual', 'top_jersey', 'top_sweater'];
      const clothingColors = Object.keys(PALETTES.clothing);
      const bottoms = ['bottom_jeans', 'bottom_shorts', 'bottom_joggers', 'bottom_cargo', 'bottom_casual', 'bottom_formal', 'bottom_skirt', 'bottom_trackpants'];

      const dresses = ['dress_casual', 'dress_party', 'dress_summer', 'dress_long', 'dress_formal', 'dress_traditional'];
      const shoes = ['shoes_sneakers', 'shoes_sports', 'shoes_hightops', 'shoes_boots', 'shoes_casual', 'shoes_formal', 'shoes_sandals'];
      const headwears = ['none', 'none', 'headwear_cap', 'headwear_backward_cap', 'headwear_snapback', 'headwear_beanie', 'headwear_bucket', 'headwear_fedora', 'headwear_headband', 'headwear_crown', 'headwear_winter_hat', 'headwear_party'];
      const glassesList = ['none', 'none', 'none', 'glasses_round', 'glasses_square', 'glasses_thin', 'glasses_thick', 'glasses_sunglasses', 'glasses_aviator', 'glasses_gold_round', 'glasses_rimless'];
      const accessories = ['none', 'none', 'acc_backpack', 'acc_watch', 'acc_necklace', 'acc_earrings', 'acc_hoops', 'acc_headphones', 'acc_tie', 'acc_bowtie', 'acc_scarf'];
      const specialItems = ['none', 'none', 'none', 'item_pencil', 'item_book', 'item_laptop', 'item_trophy'];

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
        facialHair: style === 'boy' && Math.random() < 0.25 ? pick(['mustache', 'light_beard', 'short_beard', 'full_beard', 'goatee']) : 'none',
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
