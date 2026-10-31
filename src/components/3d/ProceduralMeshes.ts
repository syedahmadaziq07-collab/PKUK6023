/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CurrencyDenomination } from '../../types/game';
import { MALAYSIAN_BANKNOTES } from '../../game/currency';

/**
 * Creates procedural high-resolution canvas texture for Malaysian banknotes (RM1, RM5, RM10)
 */
export function createBanknoteTexture(value: CurrencyDenomination): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const info = MALAYSIAN_BANKNOTES[value];

  // Primary background gradient
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  if (value === 1) {
    grad.addColorStop(0, '#1d4ed8'); // Blue
    grad.addColorStop(0.5, '#2563eb');
    grad.addColorStop(1, '#1e40af');
  } else if (value === 5) {
    grad.addColorStop(0, '#15803d'); // Green
    grad.addColorStop(0.5, '#16a34a');
    grad.addColorStop(1, '#166534');
  } else {
    grad.addColorStop(0, '#b91c1c'); // Red
    grad.addColorStop(0.5, '#dc2626');
    grad.addColorStop(1, '#991b1b');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Security border & watermark pattern
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#fef08a'; // subtle gold
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  // Subtle geometric Guilloche/Songket pattern lines
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  for (let i = 0; i < canvas.width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 40);
    ctx.lineTo(i + 80, canvas.height - 40);
    ctx.stroke();
  }
  ctx.restore();

  // Watermark circle area on the left
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(170, 256, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Motif / Icon representation in watermark
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(info.motif, 170, 256);

  // Bank Negara Malaysia title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px Fredoka, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('BANK NEGARA MALAYSIA', 320, 85);

  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('WANG KERTAS RASMI', 320, 125);

  // Big Giant Currency Denomination in center
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 160px Fredoka, Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`RM ${value}`, 580, 290);

  // Currency words
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 42px Fredoka, sans-serif';
  ctx.fillText(info.name.toUpperCase(), 580, 365);

  // Corner denomination markers
  ctx.font = '900 70px Fredoka, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText(`${value}`, canvas.width - 60, 110);
  ctx.fillText(`${value}`, canvas.width - 60, canvas.height - 70);

  ctx.textAlign = 'left';
  ctx.fillText(`${value}`, 60, canvas.height - 70);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates procedural texture for price tags
 */
export function createPriceTagTexture(priceText: string, itemName: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#fef08a'; // bright yellow price badge
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 8;
  ctx.strokeStyle = '#dc2626'; // bold red border
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 30px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(itemName.toUpperCase(), canvas.width / 2, 46);

  ctx.fillStyle = '#dc2626';
  ctx.font = '900 68px Fredoka, sans-serif';
  ctx.fillText(priceText, canvas.width / 2, 118);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates 3D Banknote Display Model for Station Kenali Wang
 */
export function create3DBanknoteStand(value: CurrencyDenomination): THREE.Group {
  const group = new THREE.Group();
  group.name = `banknote_stand_${value}`;

  // Acrylic base
  const baseGeo = new THREE.CylinderGeometry(0.55, 0.6, 0.08, 32);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.3,
    metalness: 0.2,
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 0.04;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // Glowing indicator ring
  const ringGeo = new THREE.TorusGeometry(0.5, 0.02, 16, 32);
  const ringColor = value === 1 ? 0x3b82f6 : value === 5 ? 0x22c55e : 0xef4444;
  const ringMat = new THREE.MeshBasicMaterial({ color: ringColor });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.y = 0.09;
  group.add(ringMesh);

  // Clear acrylic support stem
  const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 16);
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.5,
  });
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.position.y = 0.38;
  group.add(stemMesh);

  // Banknote Plane mesh (composite with front and back)
  const texture = createBanknoteTexture(value);
  const noteGeo = new THREE.BoxGeometry(0.9, 0.45, 0.015);
  const noteMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.4,
    metalness: 0.05,
  });
  const noteMesh = new THREE.Mesh(noteGeo, noteMat);
  noteMesh.position.y = 0.75;
  noteMesh.castShadow = true;
  noteMesh.userData = { isNoteDisplay: true, value };
  group.add(noteMesh);

  // Price tag badge beneath
  const badgeTexture = createPriceTagTexture(`RM${value}`, MALAYSIAN_BANKNOTES[value].name);
  const badgeGeo = new THREE.PlaneGeometry(0.4, 0.16);
  const badgeMat = new THREE.MeshBasicMaterial({ map: badgeTexture });
  const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
  badgeMesh.position.set(0, 0.18, 0.35);
  badgeMesh.rotation.x = -Math.PI / 6;
  group.add(badgeMesh);

  return group;
}

/**
 * Creates 3D Bread Loaf Mesh
 */
export function createBreadMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'product_bread';

  // Golden crust loaf body
  const bodyGeo = new THREE.BoxGeometry(0.38, 0.24, 0.22);
  const crustMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8, metalness: 0.0 });
  const bodyMesh = new THREE.Mesh(bodyGeo, crustMat);
  bodyMesh.position.y = 0.12;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Loaf top dome
  const topGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.38, 16);
  const topMesh = new THREE.Mesh(topGeo, crustMat);
  topMesh.rotation.z = Math.PI / 2;
  topMesh.position.y = 0.24;
  topMesh.castShadow = true;
  group.add(topMesh);

  // Packaging plastic bag wrap sheen
  const wrapGeo = new THREE.BoxGeometry(0.42, 0.3, 0.25);
  const wrapMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    metalness: 0.1,
  });
  const wrapMesh = new THREE.Mesh(wrapGeo, wrapMat);
  wrapMesh.position.y = 0.15;
  group.add(wrapMesh);

  // Cute bread clip / label
  const clipGeo = new THREE.BoxGeometry(0.08, 0.08, 0.02);
  const clipMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
  const clipMesh = new THREE.Mesh(clipGeo, clipMat);
  clipMesh.position.set(0.2, 0.15, 0);
  group.add(clipMesh);

  return group;
}

/**
 * Creates 3D Milk Carton Mesh
 */
export function createMilkMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'product_milk';

  // Carton main rectangular body
  const bodyGeo = new THREE.BoxGeometry(0.24, 0.36, 0.24);
  const cartonMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.05 });
  const bodyMesh = new THREE.Mesh(bodyGeo, cartonMat);
  bodyMesh.position.y = 0.18;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Carton gable top roof
  const roofGeo = new THREE.ConeGeometry(0.17, 0.14, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.3 });
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.position.y = 0.42;
  roofMesh.rotation.y = Math.PI / 4;
  roofMesh.castShadow = true;
  group.add(roofMesh);

  // Cap / screw lid
  const capGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16);
  const capMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.position.set(0.05, 0.47, 0.05);
  capMesh.rotation.z = -0.2;
  group.add(capMesh);

  // White decorative cow spot patches
  const spotGeo = new THREE.BoxGeometry(0.12, 0.12, 0.25);
  const spotMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const spotMesh = new THREE.Mesh(spotGeo, spotMat);
  spotMesh.position.y = 0.18;
  group.add(spotMesh);

  return group;
}

/**
 * Creates 3D Pencil Mesh
 */
export function createPencilMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'product_pencil';

  // Pencil hexagonal shaft
  const bodyGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.42, 6);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.24;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Sharpened wood cone
  const coneGeo = new THREE.ConeGeometry(0.03, 0.08, 16);
  const coneMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.7 });
  const coneMesh = new THREE.Mesh(coneGeo, coneMat);
  coneMesh.position.y = 0.49;
  group.add(coneMesh);

  // Graphite tip
  const tipGeo = new THREE.ConeGeometry(0.012, 0.03, 16);
  const tipMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 });
  const tipMesh = new THREE.Mesh(tipGeo, tipMat);
  tipMesh.position.y = 0.52;
  group.add(tipMesh);

  // Metal ferrule ring
  const ferruleGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.04, 16);
  const ferruleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.9 });
  const ferruleMesh = new THREE.Mesh(ferruleGeo, ferruleMat);
  ferruleMesh.position.y = 0.04;
  group.add(ferruleMesh);

  // Pink eraser rubber
  const eraserGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.04, 16);
  const eraserMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.8 });
  const eraserMesh = new THREE.Mesh(eraserGeo, eraserMat);
  eraserMesh.position.y = 0.01;
  group.add(eraserMesh);

  return group;
}

/**
 * Creates 3D Spiral Notebook Mesh
 */
export function createNotebookMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'product_notebook';

  // Cover book
  const bookGeo = new THREE.BoxGeometry(0.3, 0.05, 0.42);
  const coverMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.4 });
  const bookMesh = new THREE.Mesh(bookGeo, coverMat);
  bookMesh.position.y = 0.025;
  bookMesh.castShadow = true;
  group.add(bookMesh);

  // Paper edge block
  const paperGeo = new THREE.BoxGeometry(0.28, 0.04, 0.4);
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
  const paperMesh = new THREE.Mesh(paperGeo, paperMat);
  paperMesh.position.set(0.015, 0.025, 0);
  group.add(paperMesh);

  // Spiral binding rings on spine
  const spiralMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
  for (let z = -0.18; z <= 0.18; z += 0.06) {
    const ringGeo = new THREE.TorusGeometry(0.025, 0.006, 8, 16);
    const ringMesh = new THREE.Mesh(ringGeo, spiralMat);
    ringMesh.position.set(-0.15, 0.025, z);
    ringMesh.rotation.y = Math.PI / 2;
    group.add(ringMesh);
  }

  return group;
}

/**
 * Creates 3D Glossy Apple Mesh
 */
export function createAppleMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'product_apple';

  // Apple round body
  const bodyGeo = new THREE.SphereGeometry(0.14, 20, 20);
  const appleMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2, metalness: 0.1 });
  const bodyMesh = new THREE.Mesh(bodyGeo, appleMat);
  bodyMesh.position.y = 0.14;
  bodyMesh.scale.set(1.05, 0.95, 1.05);
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Little brown stem
  const stemGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.06, 8);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.position.set(0.01, 0.28, 0);
  stemMesh.rotation.z = 0.2;
  group.add(stemMesh);

  // Green leaf
  const leafGeo = new THREE.ConeGeometry(0.025, 0.07, 8);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
  const leafMesh = new THREE.Mesh(leafGeo, leafMat);
  leafMesh.position.set(0.04, 0.28, 0);
  leafMesh.rotation.z = -Math.PI / 3;
  group.add(leafMesh);

  return group;
}

/**
 * Creates 3D Water Bottle Mesh
 */
export function createWaterBottleMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'product_water';

  // Clear translucent body
  const bodyGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.32, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.7,
    roughness: 0.15,
    metalness: 0.1,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.16;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Tapered neck
  const neckGeo = new THREE.ConeGeometry(0.09, 0.08, 16);
  const neckMesh = new THREE.Mesh(neckGeo, bodyMat);
  neckMesh.position.y = 0.36;
  group.add(neckMesh);

  // Blue cap
  const capGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16);
  const capMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 });
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.position.y = 0.41;
  group.add(capMesh);

  // White label wrap
  const labelGeo = new THREE.CylinderGeometry(0.092, 0.092, 0.12, 16);
  const labelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = 0.16;
  group.add(labelMesh);

  return group;
}

/**
 * Creates Supermarket Shelf Unit with header board, shelves, and price tag labels
 */
export function createSupermarketShelf(
  width: number,
  height: number,
  depth: number,
  shelvesCount: number,
  colorHex: number,
  title: string
): THREE.Group {
  const group = new THREE.Group();
  group.name = `shelf_${title}`;

  // Side panels
  const sideGeo = new THREE.BoxGeometry(0.1, height, depth);
  const frameMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 });

  const leftSide = new THREE.Mesh(sideGeo, frameMat);
  leftSide.position.set(-width / 2, height / 2, 0);
  leftSide.castShadow = true;
  leftSide.receiveShadow = true;
  group.add(leftSide);

  const rightSide = new THREE.Mesh(sideGeo, frameMat);
  rightSide.position.set(width / 2, height / 2, 0);
  rightSide.castShadow = true;
  rightSide.receiveShadow = true;
  group.add(rightSide);

  // Back panel
  const backGeo = new THREE.BoxGeometry(width, height, 0.05);
  const backMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 });
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.position.set(0, height / 2, -depth / 2 + 0.025);
  backMesh.receiveShadow = true;
  group.add(backMesh);

  // Multi-tier shelves
  const shelfGeo = new THREE.BoxGeometry(width - 0.05, 0.06, depth);
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

  for (let i = 0; i < shelvesCount; i++) {
    const y = 0.3 + (i * (height - 0.7)) / (shelvesCount - 1);
    const shelfMesh = new THREE.Mesh(shelfGeo, shelfMat);
    shelfMesh.position.set(0, y, 0);
    shelfMesh.castShadow = true;
    shelfMesh.receiveShadow = true;
    group.add(shelfMesh);

    // Front color price rail
    const railGeo = new THREE.BoxGeometry(width - 0.05, 0.04, 0.02);
    const railMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3 });
    const railMesh = new THREE.Mesh(railGeo, railMat);
    railMesh.position.set(0, y, depth / 2 + 0.01);
    group.add(railMesh);
  }

  // Header banner board with section title
  const bannerCanvas = document.createElement('canvas');
  bannerCanvas.width = 512;
  bannerCanvas.height = 128;
  const bCtx = bannerCanvas.getContext('2d')!;
  bCtx.fillStyle = `#${colorHex.toString(16).padStart(6, '0')}`;
  bCtx.fillRect(0, 0, bannerCanvas.width, bannerCanvas.height);
  bCtx.fillStyle = '#ffffff';
  bCtx.font = 'bold 44px Fredoka, sans-serif';
  bCtx.textAlign = 'center';
  bCtx.textBaseline = 'middle';
  bCtx.fillText(title.toUpperCase(), bannerCanvas.width / 2, bannerCanvas.height / 2);

  const bannerTexture = new THREE.CanvasTexture(bannerCanvas);
  bannerTexture.colorSpace = THREE.SRGBColorSpace;

  const headerGeo = new THREE.BoxGeometry(width, 0.36, 0.1);
  const headerMat = new THREE.MeshStandardMaterial({ map: bannerTexture, roughness: 0.4 });
  const headerMesh = new THREE.Mesh(headerGeo, headerMat);
  headerMesh.position.set(0, height - 0.18, depth / 2);
  group.add(headerMesh);

  return group;
}

/**
 * Creates friendly 3D cartoon cashier NPC (Kak Siti / Pak Cik Rosli)
 */
export function createCartoonCashierNPC(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'cartoon_cashier_npc';

  // Body / Apron (supermarket uniform)
  const bodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.7, 16);
  const apronMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.6 }); // Emerald Green
  const bodyMesh = new THREE.Mesh(bodyGeo, apronMat);
  bodyMesh.position.y = 0.75;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Store name badge on apron
  const badgeGeo = new THREE.BoxGeometry(0.12, 0.06, 0.02);
  const badgeMat = new THREE.MeshStandardMaterial({ color: 0xfef08a });
  const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
  badgeMesh.position.set(0.08, 0.92, 0.24);
  group.add(badgeMesh);

  // Head
  const headGeo = new THREE.SphereGeometry(0.22, 20, 20);
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.6 }); // warm cartoon skin
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.y = 1.25;
  headMesh.castShadow = true;
  group.add(headMesh);

  // Big friendly cartoon eyes
  const eyeWhiteGeo = new THREE.SphereGeometry(0.045, 12, 12);
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
  leftEyeWhite.position.set(-0.07, 1.28, 0.18);
  group.add(leftEyeWhite);

  const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
  rightEyeWhite.position.set(0.07, 1.28, 0.18);
  group.add(rightEyeWhite);

  // Dark pupils with twinkle reflection
  const pupilGeo = new THREE.SphereGeometry(0.025, 10, 10);
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });

  const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
  leftPupil.position.set(-0.065, 1.28, 0.215);
  group.add(leftPupil);

  const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
  rightPupil.position.set(0.065, 1.28, 0.215);
  group.add(rightPupil);

  // Warm smile curve
  const smileGeo = new THREE.TorusGeometry(0.05, 0.012, 8, 16, Math.PI);
  const smileMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
  const smileMesh = new THREE.Mesh(smileGeo, smileMat);
  smileMesh.position.set(0, 1.18, 0.2);
  smileMesh.rotation.z = Math.PI;
  group.add(smileMesh);

  // Cheerful store visor / cap
  const capGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.1, 16);
  const capMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 });
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.position.y = 1.4;
  group.add(capMesh);

  const brimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.02, 16, 1, false, 0, Math.PI);
  const brimMat = new THREE.MeshStandardMaterial({ color: 0x047857 });
  const brimMesh = new THREE.Mesh(brimGeo, brimMat);
  brimMesh.position.set(0, 1.37, 0.08);
  brimMesh.rotation.y = Math.PI / 2;
  group.add(brimMesh);

  // Right arm waving cheerfully
  const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.35, 12);
  const armMat = new THREE.MeshStandardMaterial({ color: 0x059669 });
  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(0.3, 0.95, 0.1);
  rightArm.rotation.z = -Math.PI / 4;
  rightArm.rotation.x = -Math.PI / 6;
  rightArm.name = 'wavingArm';
  group.add(rightArm);

  // Cartoon glove / hand
  const handGeo = new THREE.SphereGeometry(0.06, 12, 12);
  const handMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const handMesh = new THREE.Mesh(handGeo, handMat);
  handMesh.position.set(0.42, 1.08, 0.18);
  handMesh.name = 'wavingHand';
  group.add(handMesh);

  // Left arm resting comfortably forward
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(-0.28, 0.75, 0.12);
  leftArm.rotation.x = -Math.PI / 4;
  group.add(leftArm);

  return group;
}

/**
 * Creates 3D Cashier Checkout Counter with POS machine, conveyor belt, and scanner
 */
export function createCashierCounter(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'cashier_counter_fixture';

  // Main counter cabinet
  const counterGeo = new THREE.BoxGeometry(2.4, 0.95, 0.9);
  const counterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 }); // Blue counter
  const counterMesh = new THREE.Mesh(counterGeo, counterMat);
  counterMesh.position.y = 0.475;
  counterMesh.castShadow = true;
  counterMesh.receiveShadow = true;
  group.add(counterMesh);

  // White top surface
  const topGeo = new THREE.BoxGeometry(2.46, 0.06, 0.96);
  const topMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
  const topMesh = new THREE.Mesh(topGeo, topMat);
  topMesh.position.y = 0.97;
  topMesh.castShadow = true;
  group.add(topMesh);

  // Conveyor belt rubber section
  const beltGeo = new THREE.BoxGeometry(1.2, 0.02, 0.5);
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const beltMesh = new THREE.Mesh(beltGeo, beltMat);
  beltMesh.position.set(-0.45, 1.01, 0);
  group.add(beltMesh);

  // POS Touch Screen Cash Register
  const posBaseGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.12, 16);
  const posBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 });
  const posBase = new THREE.Mesh(posBaseGeo, posBaseMat);
  posBase.position.set(0.5, 1.05, -0.15);
  group.add(posBase);

  // Register screen
  const screenGeo = new THREE.BoxGeometry(0.32, 0.22, 0.03);
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0.5, 1.2, -0.12);
  screenMesh.rotation.x = -Math.PI / 8;
  group.add(screenMesh);

  // Glowing register display canvas
  const regCanvas = document.createElement('canvas');
  regCanvas.width = 256;
  regCanvas.height = 160;
  const rCtx = regCanvas.getContext('2d')!;
  rCtx.fillStyle = '#0284c7';
  rCtx.fillRect(0, 0, 256, 160);
  rCtx.fillStyle = '#ffffff';
  rCtx.font = 'bold 24px Fredoka, sans-serif';
  rCtx.textAlign = 'center';
  rCtx.fillText('KEDAI MINI BIJAK', 128, 40);
  rCtx.fillStyle = '#fef08a';
  rCtx.font = 'bold 36px monospace';
  rCtx.fillText('JUMLAH: RM0', 128, 100);

  const regTexture = new THREE.CanvasTexture(regCanvas);
  regTexture.colorSpace = THREE.SRGBColorSpace;
  const screenFaceGeo = new THREE.PlaneGeometry(0.28, 0.18);
  const screenFaceMat = new THREE.MeshBasicMaterial({ map: regTexture });
  const screenFace = new THREE.Mesh(screenFaceGeo, screenFaceMat);
  screenFace.position.set(0.5, 1.2, -0.103);
  screenFace.rotation.x = -Math.PI / 8;
  group.add(screenFace);

  // Barcode scanner gun & stand
  const scannerGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.14, 12);
  const scannerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
  const scanner = new THREE.Mesh(scannerGeo, scannerMat);
  scanner.position.set(0.2, 1.08, 0.15);
  scanner.rotation.x = Math.PI / 4;
  group.add(scanner);

  // Customer payment tray
  const trayGeo = new THREE.BoxGeometry(0.35, 0.03, 0.25);
  const trayMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.4 });
  const trayMesh = new THREE.Mesh(trayGeo, trayMat);
  trayMesh.position.set(0.3, 1.01, 0.22);
  group.add(trayMesh);

  return group;
}

/**
 * Creates 3D Shopping Basket
 */
export function createShoppingBasketMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'shopping_basket';

  // Basket plastic body (tapered box)
  const bodyGeo = new THREE.BoxGeometry(0.48, 0.26, 0.34);
  const basketMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Bright Red
    roughness: 0.4,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, basketMat);
  bodyMesh.position.y = 0.13;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Basket rim
  const rimGeo = new THREE.BoxGeometry(0.52, 0.04, 0.38);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.position.y = 0.26;
  group.add(rimMesh);

  // Handles
  const handleGeo = new THREE.TorusGeometry(0.18, 0.015, 8, 24, Math.PI);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });
  const handleMesh = new THREE.Mesh(handleGeo, handleMat);
  handleMesh.position.set(0, 0.28, 0);
  handleMesh.rotation.y = Math.PI / 2;
  group.add(handleMesh);

  return group;
}

/**
 * Creates decorative supermarket plant in pot
 */
export function createIndoorPlant(): THREE.Group {
  const group = new THREE.Group();
  // Ceramic pot
  const potGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.4, 16);
  const potMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const pot = new THREE.Mesh(potGeo, potMat);
  pot.position.y = 0.2;
  pot.castShadow = true;
  group.add(pot);

  // Soil
  const soilGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16);
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
  const soil = new THREE.Mesh(soilGeo, soilMat);
  soil.position.y = 0.39;
  group.add(soil);

  // Lush green leaves (composite)
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const leafGeo = new THREE.ConeGeometry(0.08, 0.35, 6);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(Math.cos(angle) * 0.12, 0.52, Math.sin(angle) * 0.12);
    leaf.rotation.x = Math.sin(angle) * 0.4;
    leaf.rotation.z = -Math.cos(angle) * 0.4;
    group.add(leaf);
  }

  return group;
}

/**
 * Creates polished supermarket floor texture with cheerful pastel checkerboard
 */
export function createSupermarketFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const tileSize = 64;
  for (let x = 0; x < canvas.width; x += tileSize) {
    for (let y = 0; y < canvas.height; y += tileSize) {
      const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      ctx.fillStyle = isEven ? '#f8fafc' : '#e2e8f0'; // Clean white & soft light gray tile
      ctx.fillRect(x, y, tileSize, tileSize);

      // Tile grout lines
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
