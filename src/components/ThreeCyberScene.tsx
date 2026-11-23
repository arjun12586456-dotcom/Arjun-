import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, Layers, RotateCcw, Shield, ShieldAlert } from 'lucide-react';
import type { Lang } from '../data/cyberData';

interface ThreeCyberSceneProps {
  lang: Lang;
}

type NodeId = 'core' | 'firewall' | 'upi' | 'phishing' | 'vault';
type CameraPreset = 'overview' | 'core' | 'top';

interface DefenseNodeMeta {
  id: NodeId;
  title: { en: string; hi: string };
  role: { en: string; hi: string };
  status: { en: string; hi: string };
}

const DEFENSE_NODES: Record<NodeId, DefenseNodeMeta> = {
  core: {
    id: 'core',
    title: { en: '2FA & Encryption Core', hi: '2FA और एन्क्रिप्शन कोर' },
    role: {
      en: 'Central cryptographic key ring protecting Gmail, banking logins, and OTP privacy.',
      hi: 'मुख्य सुरक्षा केंद्र जो ईमेल, बैंकिंग लॉगिन और OTP को सुरक्षित रखता है।',
    },
    status: { en: 'AES-256 + 2FA Active', hi: 'AES-256 और 2FA सक्रिय' },
  },
  firewall: {
    id: 'firewall',
    title: { en: 'Unknown .APK Firewall Gate', hi: 'अनजान .APK फ़ायरवॉल गेट' },
    role: {
      en: 'Inspects file hashes locally and blocks malicious WhatsApp .apk installers.',
      hi: 'फाइल हैश की जांच करता है और WhatsApp पर आने वाले नकली .apk ऐप्स को रोकता है।',
    },
    status: { en: 'SHA-256 Filter Guarded', hi: 'SHA-256 फ़िल्टर चालू' },
  },
  upi: {
    id: 'upi',
    title: { en: 'UPI QR & PIN Guard Tower', hi: 'UPI QR और पिन सुरक्षा टावर' },
    role: {
      en: 'Decodes payment URIs before scanning to verify payee VPA and block fake collect traps.',
      hi: 'स्कैन करने से पहले UPI लिंक पढ़ता है ताकि नकली पेमेंट रिक्वेस्ट पकड़ी जा सके।',
    },
    status: { en: 'Payee Verification On', hi: 'पेमेंट जांच सक्रिय' },
  },
  phishing: {
    id: 'phishing',
    title: { en: 'HTTPS & Domain Inspector', hi: 'HTTPS और डोमेन निरीक्षक' },
    role: {
      en: 'Detects lookalike banking domains, HTTP links, and urgent KYC phishing messages.',
      hi: 'नकली बैंक डोमेन, असुरक्षित HTTP लिंक और फर्जी KYC संदेशों की पहचान करता है।',
    },
    status: { en: 'Link Heuristics Ready', hi: 'लिंक जांच सक्रिय' },
  },
  vault: {
    id: 'vault',
    title: { en: 'EXIF & Identity Privacy Vault', hi: 'EXIF और फोटो गोपनीयता वॉल्ट' },
    role: {
      en: 'Strips GPS coordinates and camera device tags from photos before social media upload.',
      hi: 'सोशल मीडिया पर फोटो डालने से पहले GPS लोकेशन और कैमरा डेटा हटाता है।',
    },
    status: { en: 'Metadata Stripping Ready', hi: 'मेटाडेटा सफाई तैयार' },
  },
};

// Pre-allocated math helpers outside render loop (zero per-frame GC)
const _camTarget = new THREE.Vector3();
const _nodeWorldPos = new THREE.Vector3();

function createRadarFloorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;

    // Concentric calibration rings
    for (let r = 48; r <= 236; r += 47) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = r === 189 ? 'rgba(56, 189, 248, 0.42)' : 'rgba(148, 163, 184, 0.18)';
      ctx.lineWidth = r === 189 ? 2 : 1;
      ctx.stroke();
    }

    // Radial spokes
    for (let a = 0; a < 12; a++) {
      const rad = (a * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad) * 34, cy + Math.sin(rad) * 34);
      ctx.lineTo(cx + Math.cos(rad) * 236, cy + Math.sin(rad) * 236);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Fine compass ticks
    ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
    for (let t = 0; t < 36; t++) {
      const ang = (t * Math.PI * 2) / 36;
      const r1 = 224;
      const r2 = t % 3 === 0 ? 236 : 230;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
      ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = t % 3 === 0 ? 2 : 1;
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 124);
    grad.addColorStop(0, 'rgba(2, 6, 23, 0.85)');
    grad.addColorStop(0.55, 'rgba(2, 6, 23, 0.35)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function ThreeCyberScene({ lang }: ThreeCyberSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeId>('core');
  const [explodeFactor, setExplodeFactor] = useState(0.2);
  const [threatActive, setThreatActive] = useState(false);
  const [preset, setPreset] = useState<CameraPreset>('overview');
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  // Refs synced to animation loop so UI updates never rebuild WebGL scene
  const explodeTargetRef = useRef(0.2);
  const threatActiveRef = useRef(false);
  const cameraPresetRequestRef = useRef<{ active: boolean; preset: CameraPreset }>({
    active: false,
    preset: 'overview',
  });
  const onSelectNodeRef = useRef(setSelectedNode);
  onSelectNodeRef.current = setSelectedNode;

  useEffect(() => {
    explodeTargetRef.current = explodeFactor;
  }, [explodeFactor]);

  useEffect(() => {
    threatActiveRef.current = threatActive;
  }, [threatActive]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Software WebGL guard from GPU renderer string
    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError('WebGL is unavailable in this browser context.');
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError('3D graphics context paused. Waiting to restore...');
    };
    const onContextRestored = () => {
      setWebglError(null);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    const scene = new THREE.Scene();
    const horizonHex = 0x0b1220;
    scene.background = new THREE.Color(horizonHex);
    scene.fog = new THREE.FogExp2(horizonHex, 0.045);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.4, 4.1, 6.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3.2;
    controls.maxDistance = 12.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.target.set(0, 1.1, 0);

    controls.addEventListener('start', () => {
      cameraPresetRequestRef.current.active = false;
    });

    // Balanced studio lighting rig: warm key + cool hemisphere + crisp rim
    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.85);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.35);
    rimLight.position.set(-5, 3, -5);
    scene.add(rimLight);

    const disposables: { dispose: () => void }[] = [envRT];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // Ground Stage + Procedural Radar Dial Texture
    const radarTex = track(createRadarFloorTexture());
    radarTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const groundMat = track(
      new THREE.MeshStandardMaterial({
        map: radarTex,
        roughness: 0.78,
        metalness: 0.18,
      }),
    );
    const groundGeo = track(new THREE.CylinderGeometry(8.5, 8.8, 0.18, 48));
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.09;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    const contactTex = track(createContactShadowTexture());
    const contactMat = track(
      new THREE.MeshBasicMaterial({
        map: contactTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.45,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    );
    const contactGeo = track(new THREE.PlaneGeometry(4.4, 4.4));
    const contactPlane = new THREE.Mesh(contactGeo, contactMat);
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = 0.02;
    scene.add(contactPlane);

    // -----------------------------------------------------------------------
    // Hero Composite 3D Cyber Vault & Shield Assembly (THREE.Group, bottom-center grounded)
    // -----------------------------------------------------------------------
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    const brushedTitaniumMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0xcbd5e1,
        metalness: 0.92,
        roughness: 0.18,
        anisotropy: 0.75,
        clearcoat: 0.4,
      }),
    );
    const matteArmorMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.35,
        roughness: 0.68,
      }),
    );
    const coreCrystalMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.55,
        metalness: 0.1,
        roughness: 0.12,
        transmission: isSoftwareGl ? 0 : 0.82,
        transparent: true,
        opacity: isSoftwareGl ? 0.52 : 1,
        ior: 1.55,
        thickness: 1.4,
        clearcoat: 1.0,
      }),
    );
    const shieldEmblemMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x0ea5e9,
        metalness: 0.72,
        roughness: 0.24,
        clearcoat: 0.65,
      }),
    );

    const clickableTargets: THREE.Object3D[] = [];

    // Part 1: Stepped hexagonal base plinth (grounded at y = 0)
    const plinthBaseGeo = track(new THREE.CylinderGeometry(1.35, 1.52, 0.24, 6));
    const plinthBase = new THREE.Mesh(plinthBaseGeo, matteArmorMat);
    plinthBase.position.y = 0.12;
    plinthBase.castShadow = true;
    plinthBase.receiveShadow = true;
    heroGroup.add(plinthBase);

    const plinthTrimGeo = track(new THREE.CylinderGeometry(1.1, 1.24, 0.16, 6));
    const plinthTrim = new THREE.Mesh(plinthTrimGeo, brushedTitaniumMat);
    plinthTrim.position.y = 0.32;
    plinthTrim.castShadow = true;
    heroGroup.add(plinthTrim);

    // Part 2: Beveled extruded Cyber Shield Crest (vertical layer)
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, -0.78);
    shieldShape.lineTo(0.62, -0.32);
    shieldShape.lineTo(0.68, 0.58);
    shieldShape.lineTo(0, 0.78);
    shieldShape.lineTo(-0.68, 0.58);
    shieldShape.lineTo(-0.62, -0.32);
    shieldShape.closePath();

    const shieldGeo = track(
      new THREE.ExtrudeGeometry(shieldShape, {
        depth: 0.16,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.04,
        bevelSegments: 3,
      }),
    );
    shieldGeo.center();
    const shieldGroup = new THREE.Group();
    shieldGroup.position.set(0, 1.45, 0);

    const shieldBody = new THREE.Mesh(shieldGeo, shieldEmblemMat);
    shieldBody.castShadow = true;
    shieldBody.layers.enable(1);
    shieldBody.userData.nodeId = 'core';
    clickableTargets.push(shieldBody);
    shieldGroup.add(shieldBody);

    // Inner encrypted icosahedron core inside ring
    const coreGeo = track(new THREE.IcosahedronGeometry(0.42, 0));
    const coreCrystal = new THREE.Mesh(coreGeo, coreCrystalMat);
    coreCrystal.renderOrder = 2;
    coreCrystal.layers.enable(1);
    coreCrystal.userData.nodeId = 'core';
    clickableTargets.push(coreCrystal);
    shieldGroup.add(coreCrystal);

    // Part 3-5: Three defense rings (Firewall, 2FA, Encryption)
    const ringGeo1 = track(new THREE.TorusGeometry(0.95, 0.045, 16, 64));
    const ringGeo2 = track(new THREE.TorusGeometry(1.16, 0.038, 16, 64));
    const ringGeo3 = track(new THREE.TorusGeometry(1.36, 0.03, 14, 64));

    const ring1 = new THREE.Mesh(ringGeo1, brushedTitaniumMat);
    const ring2 = new THREE.Mesh(ringGeo2, shieldEmblemMat);
    const ring3 = new THREE.Mesh(ringGeo3, brushedTitaniumMat);
    ring1.rotation.x = Math.PI / 4;
    ring2.rotation.y = Math.PI / 3;
    ring3.rotation.x = -Math.PI / 5;
    shieldGroup.add(ring1, ring2, ring3);
    heroGroup.add(shieldGroup);

    // Four Perimeter Defense Pylons (multi-part composite towers)
    const towerDefs: { id: NodeId; x: number; z: number; color: number }[] = [
      { id: 'firewall', x: -2.4, z: -2.0, color: 0x38bdf8 },
      { id: 'upi', x: 2.4, z: -2.0, color: 0x10b981 },
      { id: 'phishing', x: -2.4, z: 2.0, color: 0xf59e0b },
      { id: 'vault', x: 2.4, z: 2.0, color: 0x6366f1 },
    ];

    const towerGroups: { group: THREE.Group; basePos: THREE.Vector3; beaconMat: THREE.MeshStandardMaterial }[] = [];
    const towerFootGeo = track(new THREE.CylinderGeometry(0.32, 0.4, 0.22, 8));
    const towerShaftGeo = track(new THREE.CylinderGeometry(0.16, 0.22, 1.05, 8));
    const towerBeaconGeo = track(new THREE.OctahedronGeometry(0.22, 0));

    for (const def of towerDefs) {
      const tg = new THREE.Group();
      tg.position.set(def.x, 0, def.z);

      const foot = new THREE.Mesh(towerFootGeo, matteArmorMat);
      foot.position.y = 0.11;
      foot.castShadow = true;
      foot.receiveShadow = true;

      const shaft = new THREE.Mesh(towerShaftGeo, brushedTitaniumMat);
      shaft.position.y = 0.72;
      shaft.castShadow = true;

      const beaconMat = track(
        new THREE.MeshStandardMaterial({
          color: def.color,
          emissive: def.color,
          emissiveIntensity: 0.7,
          roughness: 0.25,
          metalness: 0.2,
        }),
      );
      const beacon = new THREE.Mesh(towerBeaconGeo, beaconMat);
      beacon.position.y = 1.48;
      beacon.castShadow = true;

      foot.layers.enable(1);
      shaft.layers.enable(1);
      beacon.layers.enable(1);
      foot.userData.nodeId = def.id;
      shaft.userData.nodeId = def.id;
      beacon.userData.nodeId = def.id;
      clickableTargets.push(foot, shaft, beacon);

      tg.add(foot, shaft, beacon);
      scene.add(tg);
      towerGroups.push({ group: tg, basePos: new THREE.Vector3(def.x, 0, def.z), beaconMat });
    }

    // Perimeter Data Grid Nodes via InstancedMesh (36 pillars)
    const nodeCount = 36;
    const pillarGeo = track(new THREE.BoxGeometry(0.09, 0.28, 0.09));
    const pillarMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.45,
        metalness: 0.5,
      }),
    );
    const instancedPillars = new THREE.InstancedMesh(pillarGeo, pillarMat, nodeCount);
    const dummy = new THREE.Object3D();
    const colorTmp = new THREE.Color();
    for (let i = 0; i < nodeCount; i++) {
      const ang = (i / nodeCount) * Math.PI * 2;
      const radius = 3.95;
      const scaleY = 0.75 + ((i * 7) % 5) * 0.18;
      dummy.position.set(Math.cos(ang) * radius, 0.14 * scaleY, Math.sin(ang) * radius);
      dummy.rotation.y = -ang;
      dummy.scale.set(1, scaleY, 1);
      dummy.updateMatrix();
      instancedPillars.setMatrixAt(i, dummy.matrix);
      colorTmp.setHex(i % 3 === 0 ? 0x38bdf8 : i % 3 === 1 ? 0x10b981 : 0x64748b);
      instancedPillars.setColorAt(i, colorTmp);
    }
    instancedPillars.instanceMatrix.needsUpdate = true;
    if (instancedPillars.instanceColor) instancedPillars.instanceColor.needsUpdate = true;
    instancedPillars.computeBoundingSphere();
    scene.add(instancedPillars);

    // Pre-compile shaders on hardware WebGL
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycaster for node click selection
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (dx * dx + dy * dy > 36) return; // Ignore drags
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(clickableTargets, false);
      if (hits.length > 0) {
        const hitId = hits[0].object.userData.nodeId as NodeId | undefined;
        if (hitId) {
          onSelectNodeRef.current(hitId);
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // ResizeObserver for crisp responsive viewport
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation loop with Software WebGL afterDraw pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let currentExplode = 0.2;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.elapsedTime;

      // Damped Exploded-View interpolation
      currentExplode = THREE.MathUtils.damp(currentExplode, explodeTargetRef.current, 6, delta);
      shieldGroup.position.y = 1.45 + currentExplode * 0.55;
      ring1.position.z = currentExplode * 0.45;
      ring2.position.y = currentExplode * 0.25;
      ring3.position.z = -currentExplode * 0.45;

      for (const tg of towerGroups) {
        const expand = 1 + currentExplode * 0.28;
        tg.group.position.x = tg.basePos.x * expand;
        tg.group.position.z = tg.basePos.z * expand;
        tg.group.children[2].rotation.y += delta * 1.4;
      }

      // Orbit & threat-mode color kinematics
      const speedMult = threatActiveRef.current ? 2.1 : 0.75;
      ring1.rotation.z += delta * 0.55 * speedMult;
      ring2.rotation.x += delta * 0.42 * speedMult;
      ring3.rotation.y -= delta * 0.35 * speedMult;
      coreCrystal.rotation.y += delta * 0.5 * speedMult;
      coreCrystal.rotation.x = Math.sin(elapsed * 0.8) * 0.18;

      if (threatActiveRef.current) {
        coreCrystalMat.emissive.setHex(0xe11d48);
        coreCrystalMat.color.setHex(0xfb7185);
        shieldEmblemMat.color.setHex(0xf59e0b);
      } else {
        coreCrystalMat.emissive.setHex(0x0284c7);
        coreCrystalMat.color.setHex(0x38bdf8);
        shieldEmblemMat.color.setHex(0x0ea5e9);
      }

      // Smooth Camera Preset Transitions (cancels on arrival or OrbitControls start)
      if (cameraPresetRequestRef.current.active) {
        const targetPreset = cameraPresetRequestRef.current.preset;
        if (targetPreset === 'overview') {
          _camTarget.set(5.4, 4.1, 6.2);
          _nodeWorldPos.set(0, 1.1, 0);
        } else if (targetPreset === 'core') {
          _camTarget.set(0.2, 2.0, 3.8);
          _nodeWorldPos.set(0, 1.45, 0);
        } else {
          _camTarget.set(0.05, 8.6, 1.8);
          _nodeWorldPos.set(0, 0.5, 0);
        }
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _camTarget.x, 5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _camTarget.y, 5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _camTarget.z, 5, delta);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, _nodeWorldPos.x, 5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _nodeWorldPos.y, 5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _nodeWorldPos.z, 5, delta);
        if (camera.position.distanceTo(_camTarget) < 0.04) {
          cameraPresetRequestRef.current.active = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      for (const d of disposables) {
        d.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleSelectPreset = (nextPreset: CameraPreset) => {
    setPreset(nextPreset);
    cameraPresetRequestRef.current = { active: true, preset: nextPreset };
  };

  const activeMeta = DEFENSE_NODES[selectedNode];

  return (
    <section id="cyber-3d" className="border-b border-slate-200 bg-white py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
              <Shield className="h-4 w-4 shrink-0" />
              <span>
                {lang === 'en' ? 'Interactive 3D Security Model' : 'इंटरैक्टिव 3D साइबर सुरक्षा मॉडल'}
              </span>
            </div>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {lang === 'en'
                ? '3D Multi-Layer Cyber Defense Architecture'
                : '3D मल्टी-लेयर साइबर सुरक्षा संरचना'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              {lang === 'en'
                ? 'Drag to orbit, scroll to zoom, and click the shield core or perimeter defense towers to inspect how each protection layer works.'
                : '3D मॉडल को घुमाएं, ज़ूम करें और मुख्य शील्ड या सुरक्षा टावरों पर क्लिक करके समझें कि हर सुरक्षा परत कैसे काम करती है।'}
            </p>
          </div>
        </div>

        {/* Isolated 3D Viewport + Collapsible Bottom Dock */}
        <div className="relative mt-7 h-[460px] sm:h-[520px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          {/* Isolated WebGL mount node (never shares DOM children with React HUD) */}
          <div ref={mountRef} className="absolute inset-0 h-full w-full" />

          {/* Minimal Top-Left Title Badge (static, no backdrop-filter over WebGL, no pulse) */}
          <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-lg border border-slate-700 bg-slate-950/92 px-3.5 py-2 text-white">
            <p className="font-mono text-xs font-semibold text-sky-400">
              {threatActive
                ? lang === 'en'
                  ? 'MODE: ACTIVE PHISHING SHIELD TEST'
                  : 'मोड: फ़िशिंग हमला बचाव परीक्षण'
                : lang === 'en'
                  ? 'MODE: NORMAL DEFENSE GRID'
                  : 'मोड: सामान्य सुरक्षा ग्रिड'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-300">
              {lang === 'en' ? 'Click any tower or central shield · Press H for controls' : 'टावर या शील्ड पर क्लिक करें · H से कंट्रोल छिपाएं'}
            </p>
          </div>

          {webglError && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center text-white">
              <Shield className="h-10 w-10 text-sky-400" />
              <p className="mt-3 text-sm font-semibold">{webglError}</p>
            </div>
          )}

          {/* Unified Collapsible Bottom Control Dock (<=15% viewport height, no backdrop-blur over WebGL) */}
          <div className="pointer-events-auto absolute bottom-3 left-1/2 z-10 w-[min(880px,94%)] -translate-x-1/2">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setDockCollapsed((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-t-lg border border-b-0 border-slate-700 bg-slate-950/95 px-3 py-1 text-[11px] font-semibold text-slate-200 hover:text-white cursor-pointer whitespace-nowrap"
              >
                {dockCollapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                <span>
                  {dockCollapsed
                    ? lang === 'en'
                      ? 'Show 3D Controls'
                      : 'कंट्रोल दिखाएं'
                    : lang === 'en'
                      ? 'Hide Controls'
                      : 'कंट्रोल छिपाएं'}
                </span>
              </button>
            </div>

            {!dockCollapsed && (
              <div className="rounded-xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-white shadow-lg">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  {/* Selected Defense Node Readout */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-sky-400">
                        {activeMeta.status[lang]}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm font-bold text-white">
                      {activeMeta.title[lang]}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-300">
                      {activeMeta.role[lang]}
                    </p>
                  </div>

                  {/* Consolidated Controls: Explode Slider, Threat Sim, Camera Presets */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs">
                      <Layers className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                      <span className="text-slate-300 whitespace-nowrap">
                        {lang === 'en' ? 'Explode' : 'फैलाव'}
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={explodeFactor}
                        onChange={(e) => setExplodeFactor(Number(e.target.value))}
                        aria-label="Explode 3D layers"
                        className="w-16 sm:w-20 accent-sky-400 cursor-pointer"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setThreatActive((prev) => !prev)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        threatActive
                          ? 'bg-rose-600 text-white hover:bg-rose-500'
                          : 'border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {threatActive
                          ? lang === 'en'
                            ? 'Alert Active'
                            : 'अलर्ट चालू'
                          : lang === 'en'
                            ? 'Test Attack'
                            : 'हमला जांचें'}
                      </span>
                    </button>

                    <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
                      {(
                        [
                          { id: 'overview', en: 'Overview', hi: 'पूरा दृश्य' },
                          { id: 'core', en: 'Shield', hi: 'शील्ड' },
                          { id: 'top', en: 'Radar', hi: 'रडार' },
                        ] as const
                      ).map((cam) => (
                        <button
                          key={cam.id}
                          type="button"
                          onClick={() => handleSelectPreset(cam.id)}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold cursor-pointer whitespace-nowrap ${
                            preset === cam.id
                              ? 'bg-sky-600 text-white'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          {cam[lang]}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setExplodeFactor(0.2);
                          setThreatActive(false);
                          setSelectedNode('core');
                          handleSelectPreset('overview');
                        }}
                        aria-label="Reset 3D view"
                        className="rounded-md px-2 py-1 text-slate-300 hover:text-white cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
