/**
 * QuizSpark 3D Interactive Rotating Earth Live Lobby
 * Uses Three.js for 3D globe rendering, atmospheric effects,
 * deterministic player positioning, smooth rotation, and interactive inspection.
 */
(function (global) {
  'use strict';

  class EarthLobby {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.getElementById(container) : container;
      if (!this.container) {
        throw new Error('EarthLobby: container element not found');
      }

      this.options = Object.assign({
        globeRadius: 82,
        autoRotate: true,
        rotationSpeed: 0.0022,
        cloudRotationSpeed: 0.003,
        onPlayerClick: null,
        onPlayerHover: null
      }, options);

      this.participants = [];
      this.playerMeshes = new Map(); // id -> { group, avatarSprite, nameSprite, baseMesh, participant, targetScale, currentScale }
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2(-999, -999);
      this.hoveredPlayer = null;

      // Drag / Interaction State
      this.isDragging = false;
      this.previousMousePosition = { x: 0, y: 0 };
      this.targetRotationX = 0.15;
      this.targetRotationY = 0;
      this.currentRotationX = 0.15;
      this.currentRotationY = 0;
      this.userInteracting = false;
      this.resumeTimeout = null;

      // Camera distance zoom
      this.targetCameraDistance = 310;
      this.currentCameraDistance = 310;
      this.minCameraDistance = 160;
      this.maxCameraDistance = 450;

      this.isDestroyed = false;
      this.animId = null;

      this.init();
    }

    init() {
      // 1. Setup Three.js Scene, Camera, Renderer
      this.scene = new THREE.Scene();
      
      const width = this.container.clientWidth || 800;
      const height = this.container.clientHeight || 560;

      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
      this.camera.position.set(0, 0, this.currentCameraDistance);

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      if (THREE.sRGBEncoding) {
        this.renderer.outputEncoding = THREE.sRGBEncoding;
      }
      
      // Ensure canvas styling
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = '100%';
      this.renderer.domElement.style.display = 'block';
      this.renderer.domElement.style.cursor = 'grab';
      this.container.appendChild(this.renderer.domElement);

      // 2. Add Ambient & Directional Lights for Day/Night hemisphere
      this.setupLighting();

      // 3. Create Starfield Background
      this.createStarfield();

      // 4. Create Main Earth Group
      this.earthGroup = new THREE.Group();
      this.earthGroup.rotation.x = this.currentRotationX;
      this.scene.add(this.earthGroup);

      // 5. Create Earth Core Sphere
      this.createEarthMesh();

      // 6. Create Atmosphere Cloud Layer
      this.createCloudMesh();

      // 7. Create Outer Atmospheric Glow
      this.createAtmosphereGlow();

      // 8. Bind Events
      this.bindEvents();

      // 9. Start Render Loop
      this.animate = this.animate.bind(this);
      this.animate();
    }

    setupLighting() {
      // Primary Sun Directional Light (illuminates one side of Earth)
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
      sunLight.position.set(280, 140, 240);
      this.scene.add(sunLight);

      // Subtle Secondary Fill Light (night side visibility)
      const fillLight = new THREE.DirectionalLight(0x4a69bd, 0.45);
      fillLight.position.set(-280, -100, -200);
      this.scene.add(fillLight);

      // Space Ambient Light
      const ambientLight = new THREE.AmbientLight(0x1a1e36, 0.85);
      this.scene.add(ambientLight);

      // Hemisphere contrast
      const hemiLight = new THREE.HemisphereLight(0x6c5ce7, 0x0f0c1b, 0.4);
      this.scene.add(hemiLight);
    }

    createStarfield() {
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 1200;
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount; i++) {
        const r = 450 + Math.random() * 450;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const colorType = Math.random();
        if (colorType > 0.8) {
          colors[i * 3] = 0.6; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1.0;
        } else if (colorType > 0.6) {
          colors[i * 3] = 0.9; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = 1.0;
        } else {
          colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0;
        }
      }

      starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const starMaterial = new THREE.PointsMaterial({
        size: 1.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.85
      });

      this.starPoints = new THREE.Points(starGeometry, starMaterial);
      this.scene.add(this.starPoints);
    }

    /**
     * Generates a high-definition realistic Earth equirectangular map on Canvas
     */
    generateEarthTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      const w = canvas.width;
      const h = canvas.height;

      // 1. Deep Ocean Base with Radial Depth Gradients
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
      oceanGrad.addColorStop(0.0, '#0a1d37');
      oceanGrad.addColorStop(0.2, '#0c2461');
      oceanGrad.addColorStop(0.5, '#1e3799');
      oceanGrad.addColorStop(0.8, '#0c2461');
      oceanGrad.addColorStop(1.0, '#0a1d37');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, w, h);

      // Continental Shelf Shallow Water Glow
      function drawContinentalShelf(cx, cy, rx, ry, col = 'rgba(0, 210, 211, 0.28)') {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx * 1.15, ry * 1.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.restore();
      }

      // Land Masses
      function drawLandMass(cx, cy, rx, ry, rotation = 0, colorStops = []) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, Math.max(rx, ry));
        if (colorStops.length > 0) {
          colorStops.forEach(s => grad.addColorStop(s.pos, s.col));
        } else {
          grad.addColorStop(0.0, '#20bf6b');
          grad.addColorStop(0.5, '#05c46b');
          grad.addColorStop(0.8, '#e58e26');
          grad.addColorStop(1.0, '#d28c2c');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();

        const points = 36;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const noise = 1 + Math.sin(angle * 4) * 0.12 + Math.cos(angle * 7) * 0.08 + Math.sin(angle * 11) * 0.04;
          const px = Math.cos(angle) * rx * noise;
          const py = Math.sin(angle) * ry * noise;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // North America
      drawContinentalShelf(w * 0.23, h * 0.32, w * 0.14, h * 0.18);
      drawLandMass(w * 0.23, h * 0.32, w * 0.13, h * 0.16, -0.15, [
        { pos: 0.0, col: '#2ed573' },
        { pos: 0.4, col: '#10ac84' },
        { pos: 0.8, col: '#f39c12' },
        { pos: 1.0, col: '#e67e22' }
      ]);

      // Greenland / Arctic
      drawLandMass(w * 0.37, h * 0.16, w * 0.06, h * 0.08, 0.2, [
        { pos: 0.0, col: '#ffffff' },
        { pos: 0.7, col: '#dff9fb' },
        { pos: 1.0, col: '#c7ecee' }
      ]);

      // South America
      drawContinentalShelf(w * 0.32, h * 0.65, w * 0.09, h * 0.2);
      drawLandMass(w * 0.32, h * 0.65, w * 0.08, h * 0.19, 0.25, [
        { pos: 0.0, col: '#05c46b' },
        { pos: 0.6, col: '#20bf6b' },
        { pos: 0.9, col: '#d28c2c' },
        { pos: 1.0, col: '#8b5a2b' }
      ]);

      // Europe
      drawContinentalShelf(w * 0.52, h * 0.28, w * 0.08, h * 0.1);
      drawLandMass(w * 0.52, h * 0.28, w * 0.07, h * 0.09, 0.1, [
        { pos: 0.0, col: '#2ed573' },
        { pos: 0.6, col: '#10ac84' },
        { pos: 1.0, col: '#e58e26' }
      ]);

      // Africa
      drawContinentalShelf(w * 0.53, h * 0.54, w * 0.11, h * 0.2);
      drawLandMass(w * 0.53, h * 0.54, w * 0.10, h * 0.19, 0.05, [
        { pos: 0.0, col: '#e67e22' },
        { pos: 0.4, col: '#f39c12' },
        { pos: 0.7, col: '#05c46b' },
        { pos: 1.0, col: '#20bf6b' }
      ]);

      // Asia / Eurasia
      drawContinentalShelf(w * 0.72, h * 0.32, w * 0.22, h * 0.2);
      drawLandMass(w * 0.72, h * 0.32, w * 0.21, h * 0.18, -0.05, [
        { pos: 0.0, col: '#26de81' },
        { pos: 0.3, col: '#20bf6b' },
        { pos: 0.6, col: '#d28c2c' },
        { pos: 0.9, col: '#8b5a2b' },
        { pos: 1.0, col: '#05c46b' }
      ]);

      // India Subcontinent
      drawLandMass(w * 0.68, h * 0.48, w * 0.05, h * 0.08, 0.3, [
        { pos: 0.0, col: '#20bf6b' },
        { pos: 0.7, col: '#26de81' },
        { pos: 1.0, col: '#d28c2c' }
      ]);

      // Australia
      drawContinentalShelf(w * 0.84, h * 0.7, w * 0.09, h * 0.12);
      drawLandMass(w * 0.84, h * 0.7, w * 0.08, h * 0.11, -0.1, [
        { pos: 0.0, col: '#e67e22' },
        { pos: 0.5, col: '#d28c2c' },
        { pos: 0.8, col: '#20bf6b' },
        { pos: 1.0, col: '#05c46b' }
      ]);

      // Antarctica
      drawLandMass(w * 0.5, h * 0.95, w * 0.48, h * 0.09, 0, [
        { pos: 0.0, col: '#ffffff' },
        { pos: 0.6, col: '#dff9fb' },
        { pos: 1.0, col: '#a29bfe' }
      ]);

      // Lat/Lon coordinate lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let lat = 0; lat <= h; lat += h / 12) {
        ctx.beginPath();
        ctx.moveTo(0, lat);
        ctx.lineTo(w, lat);
        ctx.stroke();
      }
      for (let lon = 0; lon <= w; lon += w / 24) {
        ctx.beginPath();
        ctx.moveTo(lon, 0);
        ctx.lineTo(lon, h);
        ctx.stroke();
      }

      // City lights
      ctx.fillStyle = '#ffeaa7';
      for (let i = 0; i < 350; i++) {
        const cx = (0.15 + Math.random() * 0.75) * w;
        const cy = (0.2 + Math.random() * 0.6) * h;
        ctx.beginPath();
        ctx.arc(cx, cy, 1.2 + Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    }

    createEarthMesh() {
      const radius = this.options.globeRadius;
      const geometry = new THREE.SphereGeometry(radius, 64, 64);
      const earthTexture = this.generateEarthTexture();

      const material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpScale: 1.2,
        shininess: 25,
        specular: new THREE.Color(0x223355)
      });

      this.earthMesh = new THREE.Mesh(geometry, material);
      this.earthGroup.add(this.earthMesh);
    }

    generateCloudTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';

      for (let i = 0; i < 45; i++) {
        const x = Math.random() * canvas.width;
        const y = (0.15 + Math.random() * 0.7) * canvas.height;
        const rx = 40 + Math.random() * 120;
        const ry = 15 + Math.random() * 45;
        const rot = (Math.random() - 0.5) * 0.4;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    }

    createCloudMesh() {
      const radius = this.options.globeRadius * 1.018;
      const geometry = new THREE.SphereGeometry(radius, 48, 48);
      const cloudTexture = this.generateCloudTexture();

      const material = new THREE.MeshPhongMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      this.cloudMesh = new THREE.Mesh(geometry, material);
      this.earthGroup.add(this.cloudMesh);
    }

    createAtmosphereGlow() {
      const radius = this.options.globeRadius * 1.09;
      const geometry = new THREE.SphereGeometry(radius, 36, 36);

      const customMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.8);
            gl_FragColor = vec4(0.0, 0.82, 1.0, 1.0) * intensity * 0.85;
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false
      });

      this.atmosphereMesh = new THREE.Mesh(geometry, customMaterial);
      this.scene.add(this.atmosphereMesh);
    }

    /**
     * Deterministic calculation of lat/lon from participant ID & index
     * Arranges players aesthetically on the front visible hemisphere
     */
    getParticipantCoordinates(id, index, total) {
      const totalCount = Math.max(total, 8);
      const offset = 2 / totalCount;
      const increment = Math.PI * (3 - Math.sqrt(5)); // Golden angle

      const y = ((index * offset) - 1) + (offset / 2);
      const lat = Math.asin(Math.max(-0.92, Math.min(0.92, y))) * (180 / Math.PI) * 0.75;
      
      // Face front by default
      let lon = ((index * increment * (180 / Math.PI)) % 360) - 90;
      if (lon > 180) lon -= 360;
      if (lon < -180) lon += 360;

      return { lat, lon };
    }

    latLonToVector3(lat, lon, radius = this.options.globeRadius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      const y = (radius * Math.cos(phi));

      return new THREE.Vector3(x, y, z);
    }

    createNameplateSprite(name) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(15, 12, 27, 0.9)';
      ctx.strokeStyle = '#00d2d3';
      ctx.lineWidth = 3;

      const x = 8, y = 8, w = 240, h = 48, r = 24;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#20bf6b';
      ctx.beginPath();
      ctx.arc(28, 32, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      let cleanName = name || 'Student';
      if (cleanName.length > 14) cleanName = cleanName.substring(0, 13) + '…';
      ctx.fillText(cleanName, 44, 33);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      });

      const sprite = new THREE.Sprite(material);
      sprite.scale.set(16, 4, 1);
      return sprite;
    }

    createAvatarSprite(avatarData, emoji = '😀') {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createRadialGradient(64, 64, 20, 64, 64, 62);
      grad.addColorStop(0.0, 'rgba(108, 92, 231, 0.95)');
      grad.addColorStop(0.7, 'rgba(0, 206, 201, 0.85)');
      grad.addColorStop(1.0, 'rgba(0, 206, 201, 0.0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(64, 64, 60, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e1b38';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(64, 64, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '48px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icon = (avatarData && avatarData.style === 'girl') ? '👧' : (avatarData && avatarData.style === 'boy' ? '👦' : (emoji || '⚡'));
      ctx.fillText(icon, 64, 67);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      });

      const sprite = new THREE.Sprite(material);
      sprite.scale.set(12, 12, 1);
      return sprite;
    }

    createPlayer3D(participant, index, total) {
      const group = new THREE.Group();
      const coords = this.getParticipantCoordinates(participant.id, index, total);
      
      const surfacePos = this.latLonToVector3(coords.lat, coords.lon, this.options.globeRadius);
      group.position.copy(surfacePos);

      const normal = surfacePos.clone().normalize();
      group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      // Base ring
      const baseGeo = new THREE.CylinderGeometry(4.5, 5.2, 0.8, 16);
      const baseMat = new THREE.MeshPhongMaterial({
        color: 0x6c5ce7,
        emissive: 0x00cec9,
        emissiveIntensity: 0.4,
        shininess: 80
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.4;
      group.add(baseMesh);

      // Light stem
      const stemGeo = new THREE.CylinderGeometry(0.35, 0.35, 6, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0x00d2d3, transparent: true, opacity: 0.9 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = 3.2;
      group.add(stemMesh);

      // Avatar Sprite
      const avatarSprite = this.createAvatarSprite(participant.avatar_data, participant.emoji);
      avatarSprite.position.y = 9.5;
      group.add(avatarSprite);

      // Name Sprite
      const nameSprite = this.createNameplateSprite(participant.name);
      nameSprite.position.y = 17.5;
      group.add(nameSprite);

      baseMesh.userData = { participantId: participant.id, participant };
      avatarSprite.userData = { participantId: participant.id, participant };
      nameSprite.userData = { participantId: participant.id, participant };
      group.userData = { participantId: participant.id, participant };

      this.earthGroup.add(group);
      group.scale.set(0.001, 0.001, 0.001);

      return {
        group,
        baseMesh,
        avatarSprite,
        nameSprite,
        participant,
        targetScale: 1.0,
        currentScale: 0.001,
        coords
      };
    }

    updateParticipants(newParticipants = []) {
      this.participants = newParticipants;
      const activeIds = new Set(newParticipants.map(p => p.id));
      const total = newParticipants.length;

      // 1. Remove Disconnected
      for (const [id, item] of this.playerMeshes.entries()) {
        if (!activeIds.has(id)) {
          item.targetScale = 0;
          setTimeout(() => {
            if (item.group && item.group.parent) {
              item.group.parent.remove(item.group);
              this.disposeObject(item.group);
            }
            this.playerMeshes.delete(id);
          }, 350);
        }
      }

      // 2. Add or Update
      newParticipants.forEach((p, idx) => {
        if (this.playerMeshes.has(p.id)) {
          const item = this.playerMeshes.get(p.id);
          item.participant = p;
          item.targetScale = 1.0;
        } else {
          const item = this.createPlayer3D(p, idx, total);
          this.playerMeshes.set(p.id, item);
        }
      });
    }

    highlightPlayer(participantId) {
      const item = this.playerMeshes.get(participantId);
      if (!item) return;

      item.targetScale = 1.35;
      setTimeout(() => {
        item.targetScale = 1.0;
      }, 1200);

      if (item.coords) {
        const targetLon = -item.coords.lon * (Math.PI / 180);
        const targetLat = item.coords.lat * (Math.PI / 180);
        this.targetRotationY = targetLon;
        this.targetRotationX = targetLat * 0.4;
      }
    }

    bindEvents() {
      const dom = this.renderer.domElement;

      const onPointerDown = (e) => {
        this.isDragging = true;
        this.userInteracting = true;
        this.previousMousePosition = {
          x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
          y: e.clientY || (e.touches && e.touches[0].clientY) || 0
        };
        dom.style.cursor = 'grabbing';

        if (this.resumeTimeout) clearTimeout(this.resumeTimeout);
      };

      const onPointerMove = (e) => {
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

        const rect = dom.getBoundingClientRect();
        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        if (this.isDragging) {
          const deltaX = clientX - this.previousMousePosition.x;
          const deltaY = clientY - this.previousMousePosition.y;

          this.targetRotationY += deltaX * 0.006;
          this.targetRotationX += deltaY * 0.006;
          this.targetRotationX = Math.max(-0.9, Math.min(0.9, this.targetRotationX));

          this.previousMousePosition = { x: clientX, y: clientY };
        } else {
          this.checkHover();
        }
      };

      const onPointerUp = () => {
        this.isDragging = false;
        dom.style.cursor = 'grab';

        if (this.resumeTimeout) clearTimeout(this.resumeTimeout);
        this.resumeTimeout = setTimeout(() => {
          this.userInteracting = false;
        }, 3500);
      };

      const onClick = (e) => {
        if (this.isDragging) return;
        
        const rect = dom.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.earthGroup.children, true);

        for (let hit of intersects) {
          if (hit.object && hit.object.userData && hit.object.userData.participant) {
            const p = hit.object.userData.participant;
            if (this.options.onPlayerClick) {
              this.options.onPlayerClick(p);
            }
            this.highlightPlayer(p.id);
            break;
          }
        }
      };

      const onWheel = (e) => {
        e.preventDefault();
        this.targetCameraDistance += e.deltaY * 0.25;
        this.targetCameraDistance = Math.max(this.minCameraDistance, Math.min(this.maxCameraDistance, this.targetCameraDistance));
      };

      dom.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);

      dom.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('touchend', onPointerUp);

      dom.addEventListener('click', onClick);
      dom.addEventListener('wheel', onWheel, { passive: false });

      this.onResize = () => {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      };
      window.addEventListener('resize', this.onResize);
    }

    checkHover() {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.earthGroup.children, true);

      let found = null;
      for (let hit of intersects) {
        if (hit.object && hit.object.userData && hit.object.userData.participant) {
          found = hit.object.userData.participant;
          break;
        }
      }

      if (found !== this.hoveredPlayer) {
        this.hoveredPlayer = found;
        this.renderer.domElement.style.cursor = found ? 'pointer' : 'grab';
        if (this.options.onPlayerHover) {
          this.options.onPlayerHover(found);
        }
      }
    }

    toggleAutoRotate() {
      this.options.autoRotate = !this.options.autoRotate;
      return this.options.autoRotate;
    }

    animate() {
      if (this.isDestroyed) return;
      this.animId = requestAnimationFrame(this.animate);

      // Smooth Camera Zoom
      this.currentCameraDistance += (this.targetCameraDistance - this.currentCameraDistance) * 0.1;
      this.camera.position.z = this.currentCameraDistance;

      // Smooth Rotation Interpolation
      if (this.userInteracting) {
        this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.12;
        this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.12;
        this.earthGroup.rotation.y = this.currentRotationY;
        this.earthGroup.rotation.x = this.currentRotationX;
      } else {
        if (this.options.autoRotate) {
          this.earthGroup.rotation.y += this.options.rotationSpeed;
          this.targetRotationY = this.earthGroup.rotation.y;
        }
        this.currentRotationX += (0.15 - this.currentRotationX) * 0.05;
        this.earthGroup.rotation.x = this.currentRotationX;
      }

      if (this.cloudMesh) {
        this.cloudMesh.rotation.y += (this.options.cloudRotationSpeed - this.options.rotationSpeed);
      }

      if (this.starPoints) {
        this.starPoints.rotation.y -= 0.0003;
      }

      // Smooth Elastic Pop-in & breathing
      const time = Date.now() * 0.003;
      for (const item of this.playerMeshes.values()) {
        item.currentScale += (item.targetScale - item.currentScale) * 0.14;
        const breath = 1 + Math.sin(time + (item.participant.id || 0)) * 0.04;
        const s = Math.max(0.001, item.currentScale * breath);
        item.group.scale.set(s, s, s);
      }

      this.renderer.render(this.scene, this.camera);
    }

    disposeObject(obj) {
      if (!obj) return;
      obj.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          } else {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
          }
        }
      });
    }

    destroy() {
      this.isDestroyed = true;
      if (this.animId) cancelAnimationFrame(this.animId);
      window.removeEventListener('resize', this.onResize);

      for (const item of this.playerMeshes.values()) {
        this.disposeObject(item.group);
      }
      this.playerMeshes.clear();

      this.disposeObject(this.scene);
      if (this.renderer) {
        this.renderer.dispose();
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
      }
    }
  }

  global.EarthLobby = EarthLobby;
})(typeof window !== 'undefined' ? window : this);
