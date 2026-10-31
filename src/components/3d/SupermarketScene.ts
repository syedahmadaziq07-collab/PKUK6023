/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  create3DBanknoteStand,
  createSupermarketShelf,
  createCashierCounter,
  createCartoonCashierNPC,
  createBreadMesh,
  createMilkMesh,
  createPencilMesh,
  createNotebookMesh,
  createAppleMesh,
  createWaterBottleMesh,
  createIndoorPlant,
  createSupermarketFloorTexture,
  createPriceTagTexture,
} from './ProceduralMeshes';
import { SUPERMARKET_PRODUCTS } from '../../game/products';
import { Product, CurrencyDenomination } from '../../types/game';

export interface InteractableTarget {
  id: string;
  type: 'product' | 'banknote' | 'cashier';
  title: string;
  subtitle: string;
  position: THREE.Vector3;
  product?: Product;
  banknoteValue?: CurrencyDenomination;
  interactionDistance: number;
}

export interface CollisionBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  name: string;
}

export class SupermarketScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private animationFrameId: number = 0;
  private isDisposed: boolean = false;
  private isSoftwareGl: boolean = false;

  // Player kinematic state
  public playerPosition: THREE.Vector3 = new THREE.Vector3(0, 1.5, 4.0);
  public playerYaw: number = 0; // horizontal angle in radians
  public playerPitch: number = 0; // vertical angle in radians
  public lookSensitivity: number = 1.0;

  // Collision boundaries
  private collisionBoxes: CollisionBox[] = [];

  // Interactable objects
  private interactables: InteractableTarget[] = [];
  public currentNearbyTarget: InteractableTarget | null = null;
  public onNearbyTargetChange?: (target: InteractableTarget | null) => void;

  // Rotating animation refs
  private rotatingNotes: THREE.Object3D[] = [];
  private cashierWavingArm: THREE.Object3D | null = null;
  private cashierWavingHand: THREE.Object3D | null = null;

  // Waypoint destination marker
  private destinationMarker: THREE.Group | null = null;
  public targetStationPosition: THREE.Vector3 | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Three.js Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0fdf4); // cheerful light mint
    this.scene.fog = new THREE.Fog(0xf0fdf4, 15, 26);

    this.camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    this.updateCameraTransform();

    // 4. Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Rig
    this.setupLighting();

    // 6. Build Supermarket Structure & Fixtures
    this.buildSupermarketEnvironment();

    // 7. Setup Collisions
    this.setupCollisionBoundaries();

    // 8. Setup Resize Listener
    window.addEventListener('resize', this.onWindowResize);

    // 9. Start Render Loop
    this.startLoop();
  }

  private setupLighting() {
    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    keyLight.position.set(4, 7, 3);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Cool hemisphere fill light (sky vs ground)
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0xfef3c7, 0.85);
    hemiLight.position.set(0, 8, 0);
    this.scene.add(hemiLight);

    // Soft aisle ceiling lights
    const aisleLight1 = new THREE.PointLight(0xffffff, 0.8, 8);
    aisleLight1.position.set(0, 3.2, 0);
    this.scene.add(aisleLight1);

    const aisleLight2 = new THREE.PointLight(0xffffff, 0.8, 8);
    aisleLight2.position.set(0, 3.2, -3);
    this.scene.add(aisleLight2);

    const cashierSpot = new THREE.PointLight(0xfef08a, 0.9, 6);
    cashierSpot.position.set(0, 2.8, 2.5);
    this.scene.add(cashierSpot);
  }

  private buildSupermarketEnvironment() {
    const roomWidth = 9.0;
    const roomLength = 12.0;
    const roomHeight = 3.6;

    // --- Floor ---
    const floorGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
    const floorTexture = createSupermarketFloorTexture();
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.3,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // --- Ceiling ---
    const ceilGeo = new THREE.PlaneGeometry(roomWidth, roomLength);
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight;
    this.scene.add(ceiling);

    // Ceiling LED panel lights (visual fixtures)
    for (const z of [-3.5, 0, 3.5]) {
      const ledGeo = new THREE.BoxGeometry(2.0, 0.04, 0.6);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(0, roomHeight - 0.02, z);
      this.scene.add(ledMesh);
    }

    // --- Walls with cheerful mint stripe ---
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.5 }); // Mint green accent

    // North Wall (Back)
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, roomHeight, 0.2), wallMat);
    northWall.position.set(0, roomHeight / 2, -roomLength / 2);
    northWall.receiveShadow = true;
    this.scene.add(northWall);

    const northStripe = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, 0.3, 0.22), accentMat);
    northStripe.position.set(0, 1.8, -roomLength / 2);
    this.scene.add(northStripe);

    // South Wall (Entrance with automatic sliding door glass arch)
    const southWallLeft = new THREE.Mesh(new THREE.BoxGeometry(3.0, roomHeight, 0.2), wallMat);
    southWallLeft.position.set(-3.0, roomHeight / 2, roomLength / 2);
    this.scene.add(southWallLeft);

    const southWallRight = new THREE.Mesh(new THREE.BoxGeometry(3.0, roomHeight, 0.2), wallMat);
    southWallRight.position.set(3.0, roomHeight / 2, roomLength / 2);
    this.scene.add(southWallRight);

    // Glass entrance doors in center
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
    });
    const glassDoor = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.6, 0.08), glassMat);
    glassDoor.position.set(0, 1.3, roomLength / 2);
    this.scene.add(glassDoor);

    // Welcome Store Banner over entrance
    const welcomeCanvas = document.createElement('canvas');
    welcomeCanvas.width = 1024;
    welcomeCanvas.height = 256;
    const wCtx = welcomeCanvas.getContext('2d')!;
    wCtx.fillStyle = '#059669'; // Emerald banner
    wCtx.fillRect(0, 0, 1024, 256);
    wCtx.lineWidth = 10;
    wCtx.strokeStyle = '#fef08a';
    wCtx.strokeRect(10, 10, 1004, 236);
    wCtx.fillStyle = '#ffffff';
    wCtx.font = 'bold 72px Fredoka, sans-serif';
    wCtx.textAlign = 'center';
    wCtx.fillText('KEDAI MINI BIJAK', 512, 110);
    wCtx.font = '40px Fredoka, sans-serif';
    wCtx.fillStyle = '#fef08a';
    wCtx.fillText('Jom Membeli-Belah dengan Bijak!', 512, 185);

    const welcomeTexture = new THREE.CanvasTexture(welcomeCanvas);
    welcomeTexture.colorSpace = THREE.SRGBColorSpace;
    const welcomeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.8, 0.1),
      new THREE.MeshStandardMaterial({ map: welcomeTexture })
    );
    welcomeMesh.position.set(0, 3.1, roomLength / 2 - 0.1);
    this.scene.add(welcomeMesh);

    // West Wall (Left)
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, roomHeight, roomLength), wallMat);
    westWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    westWall.receiveShadow = true;
    this.scene.add(westWall);

    const westStripe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, roomLength), accentMat);
    westStripe.position.set(-roomWidth / 2, 1.8, 0);
    this.scene.add(westStripe);

    // East Wall (Right)
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, roomHeight, roomLength), wallMat);
    eastWall.position.set(roomWidth / 2, roomHeight / 2, 0);
    eastWall.receiveShadow = true;
    this.scene.add(eastWall);

    const eastStripe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, roomLength), accentMat);
    eastStripe.position.set(roomWidth / 2, 1.8, 0);
    this.scene.add(eastStripe);

    // --- Supermarket Fixtures ---

    // 1. Bread Shelf (West, z = -1.2)
    const breadShelf = createSupermarketShelf(2.4, 2.2, 0.7, 3, 0xd97706, 'Bahagian Roti');
    breadShelf.position.set(-3.6, 0, -1.2);
    breadShelf.rotation.y = Math.PI / 2;
    this.scene.add(breadShelf);

    // 2. Drinks Cooler Shelf (West, z = 2.4)
    const drinksShelf = createSupermarketShelf(2.6, 2.2, 0.7, 3, 0x0284c7, 'Minuman Sejuk');
    drinksShelf.position.set(-3.6, 0, 2.4);
    drinksShelf.rotation.y = Math.PI / 2;
    this.scene.add(drinksShelf);

    // 3. Stationery Shelf (East, z = -0.6)
    const statShelf = createSupermarketShelf(2.6, 2.2, 0.7, 3, 0x8b5cf6, 'Alat Tulis');
    statShelf.position.set(3.6, 0, -0.6);
    statShelf.rotation.y = -Math.PI / 2;
    this.scene.add(statShelf);

    // 4. Fresh Fruits Shelf (East, z = 2.4)
    const fruitShelf = createSupermarketShelf(2.2, 2.2, 0.7, 3, 0xef4444, 'Buah Segar');
    fruitShelf.position.set(3.6, 0, 2.4);
    fruitShelf.rotation.y = -Math.PI / 2;
    this.scene.add(fruitShelf);

    // 5. Money Learning Station Table (Center North, z = -4.2)
    this.buildMoneyLearningStation();

    // 6. Cashier Checkout Area (Center South, z = 2.4)
    this.buildCashierArea();

    // 7. Place Products on Shelves
    this.placeSupermarketProducts();

    // 8. Decorative Plants in Corners
    const plant1 = createIndoorPlant();
    plant1.position.set(-3.8, 0, -5.2);
    this.scene.add(plant1);

    const plant2 = createIndoorPlant();
    plant2.position.set(3.8, 0, -5.2);
    this.scene.add(plant2);

    const plant3 = createIndoorPlant();
    plant3.position.set(-3.8, 0, 5.2);
    this.scene.add(plant3);

    const plant4 = createIndoorPlant();
    plant4.position.set(3.8, 0, 5.2);
    this.scene.add(plant4);

    // 9. Destination Waypoint Marker (glowing arrow / ring on floor)
    this.buildDestinationMarker();
  }

  private buildMoneyLearningStation() {
    const tableGroup = new THREE.Group();
    tableGroup.position.set(0, 0, -4.2);

    // Large educational curved counter
    const tableTopGeo = new THREE.BoxGeometry(4.2, 0.12, 1.2);
    const tableTopMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 });
    const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
    tableTop.position.y = 0.85;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    // Table legs/base
    const baseGeo = new THREE.BoxGeometry(4.0, 0.8, 1.0);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.4;
    baseMesh.castShadow = true;
    tableGroup.add(baseMesh);

    // Station Banner Signboard on Wall behind
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 1024;
    bannerCanvas.height = 256;
    const bCtx = bannerCanvas.getContext('2d')!;
    bCtx.fillStyle = '#1e3a8a';
    bCtx.fillRect(0, 0, 1024, 256);
    bCtx.lineWidth = 12;
    bCtx.strokeStyle = '#fef08a';
    bCtx.strokeRect(10, 10, 1004, 236);
    bCtx.fillStyle = '#ffffff';
    bCtx.font = 'bold 64px Fredoka, sans-serif';
    bCtx.textAlign = 'center';
    bCtx.fillText('STESEN KENALI WANG', 512, 100);
    bCtx.font = '38px Fredoka, sans-serif';
    bCtx.fillStyle = '#93c5fd';
    bCtx.fillText('Sentuh wang kertas untuk belajar nilainya!', 512, 175);

    const bannerTexture = new THREE.CanvasTexture(bannerCanvas);
    bannerTexture.colorSpace = THREE.SRGBColorSpace;
    const bannerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.9, 0.08),
      new THREE.MeshStandardMaterial({ map: bannerTexture })
    );
    bannerMesh.position.set(0, 2.4, -0.55);
    tableGroup.add(bannerMesh);

    // 3 Rotating Banknote Stands: RM1, RM5, RM10
    const values: CurrencyDenomination[] = [1, 5, 10];
    const xOffsets = [-1.3, 0, 1.3];

    values.forEach((val, idx) => {
      const stand = create3DBanknoteStand(val);
      stand.position.set(xOffsets[idx], 0.91, 0);
      tableGroup.add(stand);

      // Save banknote mesh for continuous gentle rotation
      const noteMesh = stand.children.find((c) => c.userData.isNoteDisplay);
      if (noteMesh) {
        this.rotatingNotes.push(noteMesh);
      }

      // Register interactable
      const worldPos = new THREE.Vector3(xOffsets[idx], 1.4, -4.2);
      this.interactables.push({
        id: `banknote_${val}`,
        type: 'banknote',
        title: `Wang RM${val}`,
        subtitle: `Tekan E untuk belajar nilai Wang RM${val}`,
        position: worldPos,
        banknoteValue: val,
        interactionDistance: 2.2,
      });
    });

    this.scene.add(tableGroup);
  }

  private buildCashierArea() {
    const cashierGroup = new THREE.Group();
    cashierGroup.position.set(0, 0, 2.4);

    // Cashier counter fixture
    const counter = createCashierCounter();
    cashierGroup.add(counter);

    // Cartoon Cashier NPC standing behind counter (facing South toward entering player)
    const cashierNpc = createCartoonCashierNPC();
    cashierNpc.position.set(0.2, 0, -0.6);
    cashierNpc.rotation.y = 0; // facing forward (+Z direction)
    cashierGroup.add(cashierNpc);

    this.cashierWavingArm = cashierNpc.getObjectByName('wavingArm') || null;
    this.cashierWavingHand = cashierNpc.getObjectByName('wavingHand') || null;

    // Overhead Cashier Sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 160;
    const sCtx = signCanvas.getContext('2d')!;
    sCtx.fillStyle = '#059669';
    sCtx.fillRect(0, 0, 512, 160);
    sCtx.lineWidth = 8;
    sCtx.strokeStyle = '#fef08a';
    sCtx.strokeRect(8, 8, 496, 144);
    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 50px Fredoka, sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('KAUNTER BAYARAN', 256, 75);
    sCtx.fillStyle = '#fef08a';
    sCtx.font = 'bold 36px Fredoka, sans-serif';
    sCtx.fillText('KAUNTER 1', 256, 125);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    signTexture.colorSpace = THREE.SRGBColorSpace;
    const signMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.55, 0.08),
      new THREE.MeshStandardMaterial({ map: signTexture })
    );
    signMesh.position.set(0, 2.6, 0);
    cashierGroup.add(signMesh);

    // Register Cashier interactable
    this.interactables.push({
      id: 'cashier_counter',
      type: 'cashier',
      title: 'Kaunter Pembayaran',
      subtitle: 'Tekan E untuk bayar barang di kaunter',
      position: new THREE.Vector3(0, 1.2, 2.4),
      interactionDistance: 2.2,
    });

    this.scene.add(cashierGroup);
  }

  private placeSupermarketProducts() {
    SUPERMARKET_PRODUCTS.forEach((product) => {
      let productMesh: THREE.Group;
      switch (product.modelType) {
        case 'bread':
          productMesh = createBreadMesh();
          break;
        case 'milk':
          productMesh = createMilkMesh();
          break;
        case 'pencil':
          productMesh = createPencilMesh();
          break;
        case 'notebook':
          productMesh = createNotebookMesh();
          break;
        case 'apple':
          productMesh = createAppleMesh();
          break;
        case 'water':
          productMesh = createWaterBottleMesh();
          break;
        default:
          productMesh = createBreadMesh();
      }

      productMesh.position.set(
        product.shelfLocation.x,
        product.shelfLocation.y,
        product.shelfLocation.z
      );

      // Price Tag Label next to product
      const tagTexture = createPriceTagTexture(product.priceDisplay, product.name);
      const tagGeo = new THREE.PlaneGeometry(0.35, 0.14);
      const tagMat = new THREE.MeshBasicMaterial({ map: tagTexture });
      const tagMesh = new THREE.Mesh(tagGeo, tagMat);
      tagMesh.position.set(
        product.shelfLocation.x > 0 ? product.shelfLocation.x - 0.25 : product.shelfLocation.x + 0.25,
        product.shelfLocation.y - 0.1,
        product.shelfLocation.z
      );
      tagMesh.rotation.y = product.shelfLocation.x > 0 ? -Math.PI / 2 : Math.PI / 2;
      this.scene.add(tagMesh);

      this.scene.add(productMesh);

      // Register product as interactable target
      this.interactables.push({
        id: `prod_${product.id}`,
        type: 'product',
        title: product.name,
        subtitle: `Harga: ${product.priceDisplay}. Tekan E untuk ambil`,
        position: new THREE.Vector3(
          product.shelfLocation.x,
          product.shelfLocation.y,
          product.shelfLocation.z
        ),
        product,
        interactionDistance: 2.0,
      });
    });
  }

  private buildDestinationMarker() {
    const marker = new THREE.Group();
    marker.name = 'destination_marker';

    // Glowing base ring
    const ringGeo = new THREE.RingGeometry(0.5, 0.65, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    marker.add(ring);

    // Floating destination pin / diamond
    const pinGeo = new THREE.OctahedronGeometry(0.2, 0);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.6,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    });
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.y = 0.6;
    pin.name = 'floatingPin';
    marker.add(pin);

    marker.visible = false;
    this.destinationMarker = marker;
    this.scene.add(marker);
  }

  public setDestinationWaypoint(pos: THREE.Vector3 | null) {
    this.targetStationPosition = pos;
    if (this.destinationMarker) {
      if (pos) {
        this.destinationMarker.position.set(pos.x, 0, pos.z);
        this.destinationMarker.visible = true;
      } else {
        this.destinationMarker.visible = false;
      }
    }
  }

  private setupCollisionBoundaries() {
    // Room perimeter limits with player radius margin
    const minX = -4.1;
    const maxX = 4.1;
    const minZ = -5.4;
    const maxZ = 5.4;

    this.collisionBoxes = [
      // Left shelves (West)
      { minX: -4.5, maxX: -2.8, minZ: -3.0, maxZ: 4.2, name: 'west_shelves' },
      // Right shelves (East)
      { minX: 2.8, maxX: 4.5, minZ: -3.0, maxZ: 4.2, name: 'east_shelves' },
      // Money learning table (North)
      { minX: -2.3, maxX: 2.3, minZ: -5.4, maxZ: -3.5, name: 'money_table' },
      // Cashier counter (South center)
      { minX: -1.4, maxX: 1.4, minZ: 1.8, maxZ: 3.0, name: 'cashier_counter' },
      // Cashier back barrier (prevent walking behind counter)
      { minX: -1.4, maxX: 1.4, minZ: 1.0, maxZ: 1.8, name: 'cashier_back' },
    ];
  }

  public canMoveTo(targetX: number, targetZ: number, radius: number = 0.45): boolean {
    // Room boundary check
    if (targetX - radius < -4.1 || targetX + radius > 4.1) return false;
    if (targetZ - radius < -5.4 || targetZ + radius > 5.4) return false;

    // Check collision bounding boxes
    for (const box of this.collisionBoxes) {
      if (
        targetX + radius > box.minX &&
        targetX - radius < box.maxX &&
        targetZ + radius > box.minZ &&
        targetZ - radius < box.maxZ
      ) {
        return false;
      }
    }

    return true;
  }

  public movePlayer(deltaForward: number, deltaRight: number) {
    // Calculate movement vector according to player's yaw
    const sin = Math.sin(this.playerYaw);
    const cos = Math.cos(this.playerYaw);

    // Forward is -Z in Three.js camera coordinate
    const dx = deltaForward * -sin + deltaRight * cos;
    const dz = deltaForward * -cos + deltaRight * sin;

    // Slide on axes independently for smooth corner sliding
    const newX = this.playerPosition.x + dx;
    const newZ = this.playerPosition.z + dz;

    if (this.canMoveTo(newX, this.playerPosition.z)) {
      this.playerPosition.x = newX;
    }
    if (this.canMoveTo(this.playerPosition.x, newZ)) {
      this.playerPosition.z = newZ;
    }

    this.updateCameraTransform();
    this.checkNearbyInteractables();
  }

  public rotatePlayer(deltaYaw: number, deltaPitch: number) {
    this.playerYaw -= deltaYaw * this.lookSensitivity;
    this.playerPitch -= deltaPitch * this.lookSensitivity;

    // Clamp pitch so camera doesn't flip
    const maxPitch = Math.PI / 3; // ~60 deg
    this.playerPitch = Math.max(-maxPitch, Math.min(maxPitch, this.playerPitch));

    this.updateCameraTransform();
    this.checkNearbyInteractables();
  }

  public teleportTo(x: number, z: number, yaw: number) {
    this.playerPosition.set(x, 1.5, z);
    this.playerYaw = yaw;
    this.playerPitch = 0;
    this.updateCameraTransform();
    this.checkNearbyInteractables();
  }

  private updateCameraTransform() {
    this.camera.position.copy(this.playerPosition);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.playerYaw;
    this.camera.rotation.x = this.playerPitch;
    this.camera.rotation.z = 0;
  }

  private checkNearbyInteractables() {
    let closest: InteractableTarget | null = null;
    let closestDist = Infinity;

    for (const item of this.interactables) {
      const dist = this.playerPosition.distanceTo(item.position);
      if (dist <= item.interactionDistance && dist < closestDist) {
        closest = item;
        closestDist = dist;
      }
    }

    if (closest !== this.currentNearbyTarget) {
      this.currentNearbyTarget = closest;
      if (this.onNearbyTargetChange) {
        this.onNearbyTargetChange(closest);
      }
    }
  }

  private startLoop() {
    let lastTime = performance.now();

    const tick = () => {
      if (this.isDisposed) return;

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // 1. Rotate banknote displays
      this.rotatingNotes.forEach((mesh) => {
        mesh.rotation.y += delta * 0.9;
      });

      // 2. Animate cashier NPC waving arm gently
      if (this.cashierWavingArm) {
        const waveAngle = Math.sin(now * 0.004) * 0.25;
        this.cashierWavingArm.rotation.z = -Math.PI / 4 + waveAngle;
      }

      // 3. Animate waypoint marker
      if (this.destinationMarker && this.destinationMarker.visible) {
        const pin = this.destinationMarker.getObjectByName('floatingPin');
        if (pin) {
          pin.rotation.y += delta * 1.5;
          pin.position.y = 0.5 + Math.sin(now * 0.005) * 0.08;
        }
      }

      // 4. Render frame
      this.renderer.render(this.scene, this.camera);

      // Pacing for software WebGL if needed
      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.animationFrameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.animationFrameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.isDisposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.animationFrameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.animationFrameId = window.setTimeout(cb, 60);
      }
    };
    this.animationFrameId = window.setTimeout(poll, 5);
  }

  private onWindowResize = () => {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public dispose() {
    this.isDisposed = true;
    window.removeEventListener('resize', this.onWindowResize);
    cancelAnimationFrame(this.animationFrameId);
    clearTimeout(this.animationFrameId);
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
