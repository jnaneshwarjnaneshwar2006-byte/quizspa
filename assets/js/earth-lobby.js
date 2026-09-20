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
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      
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
        // Spherical distribution around outer shell
        const r = 450 + Math.random() * 450;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Star colors: vibrant cyan, purple, and bright white
        const colorType = Math.random();
        if (colorType > 0.8) {
          colors[i * 3] = 0.6; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1.0; // blue-white
        } else if (colorType > 0.6) {
          colors[i * 3] = 0.9; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = 1.0; // soft violet
        } else {
          colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0; // crisp white
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
        ctx.filter = 'blur(16px)';
        ctx.fill();
        ctx.restore();
      }

      // Land Masses (Realistic Continents Geometry)
      function drawLandMass(cx, cy, rx, ry, rotation = 0, colorStops = []) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, Math.max(rx, ry));
        if (colorStops.length > 0) {
          colorStops.forEach(s => grad.addColorStop(s.pos, s.col));
        } else {
          grad.addColorStop(0.0, '#20bf6b'); // lush green core
          grad.addColorStop(0.5, '#05c46b'); // vibrant green
          grad.addColorStop(0.8, '#e58e26'); // savanna amber
          grad.addColorStop(1.0, '#d28c2c'); // shoreline
        }

        ctx.fillStyle = grad;
        ctx.beginPath();

        // Organic coastline generation
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

      // 2. North America
      drawContinentalShelf(w * 0.23, h * 0.32, w * 0.14, h * 0.18);
      drawLandMass(w * 0.23, h * 0.32, w * 0.13, h * 0.16, -0.15, [
        { pos: 0.0, col: '#2ed573' },
        { pos: 0.4, col: '#10ac84' },
        { pos: 0.8, col: '#f39c12' },
        { pos: 1.0, col: '#e67e22' }
      ]);

      // Greenland / Arctic Ice
      drawLandMass(w * 0.37, h * 0.16, w * 0.06, h * 0.08, 0.2, [
        { pos: 0.0, col: '#ffffff' },
        { pos: 0.7, col: '#dff9fb' },
        { pos: 1.0, col: '#c7ecee' }
      ]);

      // 3. South America
      drawContinentalShelf(w * 0.32, h * 0.65, w * 0.09, h * 0.2);
      drawLandMass(w * 0.32, h * 0.65, w * 0.08, h * 0.19, 0.25, [
        { pos: 0.0, col: '#05c46b' }, // Amazon jungle deep green
        { pos: 0.6, col: '#20bf6b' },
        { pos: 0.9, col: '#d28c2c' },
        { pos: 1.0, col: '#8b5a2b' }
      ]);

      // 4. Europe
      drawContinentalShelf(w * 0.52, h * 0.28, w * 0.08, h * 0.1);
      drawLandMass(w * 0.52, h * 0.28, w * 0.07, h * 0.09, 0.1, [
        { pos: 0.0, col: '#2ed573' },
        { pos: 0.6, col: '#10ac84' },
        { pos: 1.0, col: '#e58e26' }
      ]);

      // 5. Africa
      drawContinentalShelf(w * 0.53, h * 0.54, w * 0.11, h * 0.2);
      drawLandMass(w * 0.53, h * 0.54, w * 0.10, h * 0.19, 0.05, [
        { pos: 0.0, col: '#e67e22' }, // Sahara desert
        { pos: 0.4, col: '#f39c12' },
        { pos: 0.7, col: '#05c46b' }, // Central African rainforest
        { pos: 1.0, col: '#20bf6b' }
      ]);

      // 6. Asia / Eurasia
      drawContinentalShelf(w * 0.72, h * 0.32, w * 0.22, h * 0.2);
      drawLandMass(w * 0.72, h * 0.32, w * 0.21, h * 0.18, -0.05, [
        { pos: 0.0, col: '#26de81' },
        { pos: 0.3, col: '#20bf6b' },
        { pos: 0.6, col: '#d28c2c' }, // Gobi desert / Himalayas
        { pos: 0.9, col: '#8b5a2b' },
        { pos: 1.0, col: '#05c46b' }
      ]);

      // India Subcontinent
      drawLandMass(w * 0.68, h * 0.48, w * 0.05, h * 0.08, 0.3, [
        { pos: 0.0, col: '#20bf6b' },
        { pos: 0.7, col: '#26de81' },
        { pos: 1.0, col: '#d28c2c' }
      ]);

      // 7. Australia & Pacific Islands
      drawContinentalShelf(w * 0.84, h * 0.7, w * 0.09, h * 0.12);
      drawLandMass(w * 0.84, h * 0.7, w * 0.08, h * 0.11, -0.1, [
        { pos: 0.0, col: '#e67e22' }, // Outback
        { pos: 0.5, col: '#d28c2c' },
        { pos: 0.8, col: '#20bf6b' },
        { pos: 1.0, col: '#05c46b' }
      ]);

      // 8. Antarctica Ice Shield
      drawLandMass(w * 0.5, h * 0.95, w * 0.48, h * 0.09, 0, [
        { pos: 0.0, col: '#ffffff' },
        { pos: 0.6, col: '#dff9fb' },
        { pos: 1.0, col: '#a29bfe' }
      ]);

      // Subtle Grid Coordinate Lines (Lat/Lon Aesthetic Lines)
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

      // Night City Lights (Luminous warm specks on land)
      ctx.fillStyle = '#ffeaa7';
      const cityCount = 380;
      for (let i = 0; i < cityCount; i++) {
        // Distribute within land zones
        const cx = (0.15 + Math.random() * 0.75) * w;
        const cy = (0.2 + Math.random() * 0.6) * h;
        const p = ctx.getImageData(Math.floor(cx), Math.floor(cy), 1, 1).data;
        // If pixel is green or brown (land)
        if (p[1] > 100 || p[0] > 120) {
          ctx.beginPath();
          ctx.arc(cx, cy, 1.2 + Math.random() * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
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

    /**
     * Generates a procedural translucent cloud texture
     */
    generateCloudTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Organic swirling cloud shapes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
      ctx.filter = 'blur(12px)';

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

      // Custom smooth atmosphere rim glow
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
     * Spreads players elegantly across the globe using Fibonacci sphere
     */
    getParticipantCoordinates(id, index, total) {
      const totalCount = Math.max(total, 12);
      const offset = 2 / totalCount;
      const increment = Math.PI * (3 - Math.sqrt(5)); // Golden angle

      const y = ((index * offset) - 1) + (offset / 2);
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = ((index + (id % 13) * 0.23) % totalCount) * increment;

      const lat = Math.asin(y) * (180 / Math.PI);
      let lon = (phi * (180 / Math.PI)) % 360;
      if (lon > 180) lon -= 360;

      return { lat, lon };
    }

    /**
     * Converts spherical latitude/longitude to 3D Cartesian coordinates
     */
    latLonToVector3(lat, lon, radius = this.options.globeRadius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      const y = (radius * Math.cos(phi));

      return new THREE.Vector3(x, y, z);
    }

    /**
     * Generates a 2D canvas sprite for player display name tag
     */
    createNameplateSprite(name) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Pill Background
      ctx.fillStyle = 'rgba(15, 12, 27, 0.88)';
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

      // Green Online Beacon Dot
      ctx.fillStyle = '#20bf6b';
      ctx.beginPath();
      ctx.arc(28, 32, 6, 0, Math.PI * 2);
      ctx.fill();

      // Text
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

    /**
     * Generates a 2D canvas sprite for the player avatar badge
     */
    createAvatarSprite(avatarData, emoji = '😀') {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      // Outer glow disc
      const grad = ctx.createRadialGradient(64, 64, 20, 64, 64, 62);
      grad.addColorStop(0.0, 'rgba(108, 92, 231, 0.95)');
      grad.addColorStop(0.7, 'rgba(0, 206, 201, 0.85)');
      grad.addColorStop(1.0, 'rgba(0, 206, 201, 0.0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(64, 64, 60, 0, Math.PI * 2);
      ctx.fill();

      // Inner circular card
      ctx.fillStyle = '#1e1b38';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(64, 64, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw Style Icon / Emoji
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

    /**
     * Creates a 3D player character entity standing radially outward on the Earth
     */
    createPlayer3D(participant, index, total) {
      const group = new THREE.Group();
      const coords = this.getParticipantCoordinates(participant.id, index, total);
      
      // Position on Earth surface
      const surfacePos = this.latLonToVector3(coords.lat, coords.lon, this.options.globeRadius);
      group.position.copy(surfacePos);

      // Orient outward radially normal to Earth sphere
      const normal = surfacePos.clone().normalize();
      group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      // 1. Pedestal Ground Ring Base
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

      // 2. Beacon Light Stem Pin
      const stemGeo = new THREE.CylinderGeometry(0.35, 0.35, 6, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0x00d2d3, transparent: true, opacity: 0.9 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = 3.2;
      group.add(stemMesh);

      // 3. Avatar Sprite
      const avatarSprite = this.createAvatarSprite(participant.avatar_data, participant.emoji);
      avatarSprite.position.y = 9.5;
      group.add(avatarSprite);

      // 4. Floating Nameplate Sprite
      const nameSprite = this.createNameplateSprite(participant.name);
      nameSprite.position.y = 17.5;
      group.add(nameSprite);

      // Store references for raycasting & animation
      baseMesh.userData = { participantId: participant.id, participant };
      avatarSprite.userData = { participantId: participant.id, participant };
      nameSprite.userData = { participantId: participant.id, participant };
      group.userData = { participantId: participant.id, participant };

      // Add to EarthGroup so player rotates WITH the Earth
      this.earthGroup.add(group);

      // Start at scale 0 for pop-in entrance animation
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

    /**
     * Updates the live lobby participants from polling
     */
    updateParticipants(newParticipants = []) {
      this.participants = newParticipants;
      const activeIds = new Set(newParticipants.map(p => p.id));
      const total = newParticipants.length;

      // 1. Remove Disconnected Players
      for (const [id, item] of this.playerMeshes.entries()) {
        if (!activeIds.has(id)) {
          // Animate scale down then remove
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

      // 2. Add or Update Existing Players
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

    /**
     * Highlights a specific player (e.g. from sidebar click)
     */
    highlightPlayer(participantId) {
      const item = this.playerMeshes.get(participantId);
      if (!item) return;

      // Temporarily scale up and bounce
      item.targetScale = 1.35;
      setTimeout(() => {
        item.targetScale = 1.0;
      }, 1200);

      // Rotate Earth smoothly to face this player
      if (item.coords) {
        const targetLon = -item.coords.lon * (Math.PI / 180);
        const targetLat = item.coords.lat * (Math.PI / 180);
        this.targetRotationY = targetLon;
        this.targetRotationX = targetLat * 0.4;
      }
    }

    bindEvents() {
      const dom = this.renderer.domElement;

      // Mouse / Touch Drag Events for manual 3D rotation
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

        // Raycasting coordinate calculation
        const rect = dom.getBoundingClientRect();
        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        if (this.isDragging) {
          const deltaX = clientX - this.previousMousePosition.x;
          const deltaY = clientY - this.previousMousePosition.y;

          this.targetRotationY += deltaX * 0.006;
          this.targetRotationX += deltaY * 0.006;

          // Clamp vertical tilt
          this.targetRotationX = Math.max(-0.9, Math.min(0.9, this.targetRotationX));

          this.previousMousePosition = { x: clientX, y: clientY };
        } else {
          // Hover Raycast
          this.checkHover();
        }
      };

      const onPointerUp = () => {
        this.isDragging = false;
        dom.style.cursor = 'grab';

        // Auto-resume continuous rotation after 3.5s of inactivity
        if (this.resumeTimeout) clearTimeout(this.resumeTimeout);
        this.resumeTimeout = setTimeout(() => {
          this.userInteracting = false;
        }, 3500);
      };

      // Click / Tap on Player
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

      // Zoom Wheel
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

      // Window Resize Listener
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

      // Smooth Camera Zoom Interpolation
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
        // Smooth return of tilt
        this.currentRotationX += (0.15 - this.currentRotationX) * 0.05;
        this.earthGroup.rotation.x = this.currentRotationX;
      }

      // Volumetric cloud layer rotation (slightly faster around Y axis)
      if (this.cloudMesh) {
        this.cloudMesh.rotation.y += (this.options.cloudRotationSpeed - this.options.rotationSpeed);
      }

      // Starfield subtle slow drift
      if (this.starPoints) {
        this.starPoints.rotation.y -= 0.0003;
      }

      // Smooth Elastic Pop-in and subtle idle breathing for player meshes
      const time = Date.now() * 0.003;
      for (const item of this.playerMeshes.values()) {
        item.currentScale += (item.targetScale - item.currentScale) * 0.14;
        
        // Idle breathing effect
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
