import { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/* ══════════════════════════════════════════════════════════════════════
   ROBOT BOT

   The robot out of the RobotHero component, on its own. Everything around
   it is gone — the navbar, the giant background word, the grey gradient
   backdrop, the contact shadow — because here it is a chat launcher in the
   corner, not a hero section.

   Converted from TSX to JSX for this codebase. Two other deliberate
   changes:
     · drei's <Environment preset="studio"> is dropped. It fetches an HDR
       from a CDN at runtime, and the body materials use envMapIntensity 0
       anyway, so it cost a network dependency for nothing. Plain lights
       give the same result offline.
     · The canvas is transparent, so it sits on the page rather than on a
       panel of its own.

   It stays interactive: the head and body track the cursor, it blinks on a
   cycle, and pressing it turns the eyes into hearts.
   ══════════════════════════════════════════════════════════════════════ */

class HeartCurve extends THREE.Curve {
  getPoint(t, optionalTarget = new THREE.Vector3()) {
    t = t * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return optionalTarget.set(x * 0.002, (y + 6) * 0.002, 0);
  }
}
const sharedHeartCurve = new HeartCurve();

function ResponsiveGroup({ children, scale = 1 }) {
  const { viewport } = useThree();
  const s = Math.min(1.1, viewport.width / 3.5) * scale;
  return <group scale={s}>{children}</group>;
}

function GlassCapsule({ color, power, intensity }) {
  const materialRef = useRef(null);
  const uniforms = useMemo(() => ({
    color: { value: new THREE.Color('#ffffff') },
    power: { value: 2.5 },
    intensity: { value: 0.6 },
  }), []);

  useFrame(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.color.value.set(color);
    materialRef.current.uniforms.power.value = power;
    materialRef.current.uniforms.intensity.value = intensity;
  });

  return (
    <mesh>
      <sphereGeometry args={[0.3, 64, 64, 0, Math.PI * 2, 0, Math.PI]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mvPosition;
          }`}
        fragmentShader={`
          uniform vec3 color;
          uniform float power;
          uniform float intensity;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
            fresnel = pow(fresnel, power);
            gl_FragColor = vec4(color, fresnel * intensity);
          }`}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

const earBaseMat     = new THREE.MeshStandardMaterial({ color: '#f0f0f0', roughness: 0.5 });
const earRingMat     = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 });
const earCenterMat   = new THREE.MeshStandardMaterial({ color: '#cccccc', roughness: 0.8 });
const antennaBaseMat = new THREE.MeshStandardMaterial({ color: '#999999', roughness: 0.4, metalness: 0.5 });
const antennaStickMat= new THREE.MeshStandardMaterial({ color: '#d0d0d0', roughness: 0.4, metalness: 0.2 });
const antennaTipMat  = new THREE.MeshStandardMaterial({ color: '#ff3366', roughness: 0.2, toneMapped: false });

function RobotEar({ position, scale = 1, isLeft = false }) {
  const dir = isLeft ? -1 : 1;
  return (
    <group position={position} scale={scale}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={earBaseMat}>
        <cylinderGeometry args={[0.04, 0.04, 0.025, 32]} />
      </mesh>
      <mesh position={[dir * 0.012, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={earRingMat}>
        <torusGeometry args={[0.032, 0.008, 16, 32]} />
      </mesh>
      <mesh position={[dir * 0.012, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={earCenterMat}>
        <cylinderGeometry args={[0.03, 0.03, 0.005, 32]} />
      </mesh>
      <group position={[dir * 0.015, 0.035, 0]} rotation={[-0.4, 0, 0]}>
        <mesh position={[0, 0.01, 0]} castShadow receiveShadow material={antennaBaseMat}>
          <cylinderGeometry args={[0.006, 0.008, 0.02, 16]} />
        </mesh>
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow material={antennaStickMat}>
          <cylinderGeometry args={[0.003, 0.003, 0.1, 8]} />
        </mesh>
        <mesh position={[0, 0.11, 0]} castShadow receiveShadow material={antennaTipMat}>
          <sphereGeometry args={[0.006, 16, 16]} />
        </mesh>
      </group>
    </group>
  );
}

const eyeMat   = new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 2, 2), toneMapped: false, transparent: true });
const heartMat = new THREE.MeshBasicMaterial({ color: '#ff3366', toneMapped: false });

function RobotEye({ position, rotation, scale = 1, blinkDuration = 0.15, blinkCycle = 3.0, isLovedRef }) {
  const groupRef = useRef(null);
  const normalEyesRef = useRef(null);
  const heartEyeRef = useRef(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !normalEyesRef.current || !heartEyeRef.current) return;
    const isHeart = isLovedRef.current;
    normalEyesRef.current.visible = !isHeart;
    heartEyeRef.current.visible = isHeart;

    const cycle = clock.getElapsedTime() % blinkCycle;
    let targetScaleY = 1;
    if (cycle < blinkDuration && !isHeart) {
      const blinkClose = Math.sin((cycle / blinkDuration) * Math.PI);
      targetScaleY = Math.max(0.05, 1.0 - blinkClose);
    }
    groupRef.current.scale.set(scale, scale * targetScaleY, scale);
  });

  const { topPath, bottomPath } = useMemo(() => {
    const w = 0.025, h = 0.035, r = 0.02, g = 0.005;
    const V = (x, y) => new THREE.Vector3(x, y, 0);
    const tPath = new THREE.CurvePath();
    tPath.add(new THREE.LineCurve3(V(-w, g), V(-w, h - r)));
    tPath.add(new THREE.QuadraticBezierCurve3(V(-w, h - r), V(-w, h), V(-w + r, h)));
    tPath.add(new THREE.LineCurve3(V(-w + r, h), V(w - r, h)));
    tPath.add(new THREE.QuadraticBezierCurve3(V(w - r, h), V(w, h), V(w, h - r)));
    tPath.add(new THREE.LineCurve3(V(w, h - r), V(w, g)));

    const bPath = new THREE.CurvePath();
    bPath.add(new THREE.LineCurve3(V(-w, -g), V(-w, -(h - r))));
    bPath.add(new THREE.QuadraticBezierCurve3(V(-w, -(h - r)), V(-w, -h), V(-w + r, -h)));
    bPath.add(new THREE.LineCurve3(V(-w + r, -h), V(w - r, -h)));
    bPath.add(new THREE.QuadraticBezierCurve3(V(w - r, -h), V(w, -h), V(w, -(h - r))));
    bPath.add(new THREE.LineCurve3(V(w, -(h - r)), V(w, -g)));
    return { topPath: tPath, bottomPath: bPath };
  }, []);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh ref={heartEyeRef} visible={false} material={heartMat}>
        <tubeGeometry args={[sharedHeartCurve, 64, 0.0035, 8, true]} />
      </mesh>
      <group ref={normalEyesRef}>
        <mesh material={eyeMat}><tubeGeometry args={[topPath, 20, 0.0035, 8, false]} /></mesh>
        <mesh material={eyeMat}><tubeGeometry args={[bottomPath, 20, 0.0035, 8, false]} /></mesh>
      </group>
    </group>
  );
}

function generatePbrTexturesAsync() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const size = 512;
      const canvasC = document.createElement('canvas');
      const canvasB = document.createElement('canvas');
      canvasC.width = canvasB.width = size;
      canvasC.height = canvasB.height = size;
      const ctxC = canvasC.getContext('2d');
      const ctxB = canvasB.getContext('2d');

      if (ctxC && ctxB) {
        ctxC.fillStyle = '#dcdcdc'; ctxC.fillRect(0, 0, size, size);
        ctxB.fillStyle = '#808080'; ctxB.fillRect(0, 0, size, size);
        // Fewer specks than the original 10,000 — this is a 150px bot in a
        // corner, not a full-screen hero, and the loop is synchronous.
        for (let i = 0; i < 2500; i++) {
          const x = Math.random() * size, y = Math.random() * size;
          const r = 0.5 + Math.random() * 1.5;
          const isDark = Math.random() > 0.15;
          ctxC.beginPath(); ctxC.arc(x, y, r, 0, Math.PI * 2);
          ctxC.fillStyle = isDark ? '#222222' : '#dddddd'; ctxC.fill();
          ctxB.beginPath(); ctxB.arc(x, y, r, 0, Math.PI * 2);
          ctxB.fillStyle = isDark ? '#000000' : '#ffffff'; ctxB.fill();
        }
      }
      const texC = new THREE.CanvasTexture(canvasC);
      const texB = new THREE.CanvasTexture(canvasB);
      texC.wrapS = texB.wrapS = THREE.RepeatWrapping;
      texC.wrapT = texB.wrapT = THREE.RepeatWrapping;
      texC.repeat.set(6, 3); texB.repeat.set(6, 3);
      texC.needsUpdate = texB.needsUpdate = true;
      resolve({ colorMap: texC, bumpMap: texB });
    }, 0);
  });
}

function RobotPrototype({ color, pantallaColor, pantallaBrillo, blinkCycle, metalness, follow }) {
  const isLovedRef = useRef(false);
  const timeoutRef = useRef(null);
  const bodyRef = useRef(null);
  const headRef = useRef(null);
  const [textures, setTextures] = useState({ colorMap: null, bumpMap: null });

  const neckParams = { baseR: 0.215, baseH: -0.05, midR: 0.28, midH: 0.02,
    lipBottomR: 0.295, lipBottomH: 0.045, lipTopR: 0.27, lipTopH: 0.055, innerR: 0.1, innerDropH: 0.0 };
  const bodyParams = { bodyBevelR: 0.235, bodyBevelY: 0.34, bodyBevelT: 0.025 };

  const design = {
    pantallaGrosor: 3.8, separacionOjos: 0.07, tamañoOrejas: 1.3,
    escalaOjos: 1.1, parpadeoDuracion: 0.45, alturaCabeza: 0.6,
  };
  const config = { moveSpeed: 0.35, bodyRotSpeed: 10.0, headRotSpeed: 20.0,
    bodyTiltX: 0.0, bodyTiltY: 0.95, headLookX: 0.3, headLookY: 1.8 };

  useFrame((state, delta) => {
    if (!bodyRef.current || !headRef.current) return;
    const dt = Math.min(delta, 0.1);
    const tx = state.pointer.x, ty = state.pointer.y;

    /* The original slides the whole body along X to follow the cursor. In
       a 152px corner that walks the robot straight out of frame, so it is
       opt-in: off in the dock, on over the chat where there is room. */
    const L = THREE.MathUtils.lerp;
    if (follow) {
      const maxMoveX = state.viewport.width / 3.5;
      bodyRef.current.position.x = L(bodyRef.current.position.x, tx * maxMoveX, config.moveSpeed * dt);
    }
    const relativeX = follow ? tx - bodyRef.current.position.x / 2.5 : tx;
    bodyRef.current.rotation.y = L(bodyRef.current.rotation.y, -relativeX * config.bodyTiltY, config.bodyRotSpeed * dt);
    bodyRef.current.rotation.x = L(bodyRef.current.rotation.x, -ty * 0.25, config.bodyRotSpeed * dt);
    bodyRef.current.rotation.z = L(bodyRef.current.rotation.z, -relativeX * 0.15, config.bodyRotSpeed * dt);
    headRef.current.rotation.y = L(headRef.current.rotation.y, relativeX * config.headLookY, config.headRotSpeed * dt);
    headRef.current.rotation.x = L(headRef.current.rotation.x, -ty * config.headLookX, config.headRotSpeed * dt);
  });

  useEffect(() => {
    let mounted = true;
    let maps = null;
    generatePbrTexturesAsync().then((res) => {
      if (mounted) { maps = res; setTextures(res); }
      else { res.colorMap.dispose(); res.bumpMap.dispose(); }
    });
    return () => {
      mounted = false;
      if (maps) { maps.colorMap.dispose(); maps.bumpMap.dispose(); }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    isLovedRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { isLovedRef.current = false; }, 2000);
  };

  const neckProfile = useMemo(() => {
    const V2 = (x, y) => new THREE.Vector2(x, y);
    return [
      V2(neckParams.innerR, neckParams.baseH),
      V2(neckParams.baseR, neckParams.baseH),
      V2(neckParams.midR, neckParams.midH),
      V2(neckParams.lipBottomR, neckParams.lipBottomH),
      V2(neckParams.lipTopR, neckParams.lipTopH),
      V2(neckParams.innerR, neckParams.lipTopH),
      V2(neckParams.innerR, neckParams.lipTopH - neckParams.innerDropH),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#111111', roughness: 1.0, metalness: 0.0 }), []);

  if (!textures.colorMap) return null;

  const shell = {
    color,
    map: textures.colorMap || undefined,
    bumpMap: textures.bumpMap || undefined,
    bumpScale: 0.005,
    roughness: 1.0,
    metalness,
    envMapIntensity: 0.0,
  };

  return (
    <group ref={bodyRef} position={[0, -0.3, 0]} onPointerDown={handlePointerDown}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.43, 64, 64, 0, Math.PI * 2, Math.PI * 0.15, Math.PI * 0.85]} />
        <meshStandardMaterial {...shell} />
      </mesh>

      <mesh position={[0, bodyParams.bodyBevelY, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[bodyParams.bodyBevelR, bodyParams.bodyBevelT, 32, 64]} />
        <meshStandardMaterial {...shell} />
      </mesh>

      <mesh position={[0, 0.38, 0]} receiveShadow castShadow>
        <latheGeometry args={[neckProfile, 64]} />
        <meshStandardMaterial {...shell} />
      </mesh>

      <group ref={headRef} position={[0, design.alturaCabeza, 0]}>
        <mesh material={headMat} castShadow receiveShadow>
          <sphereGeometry args={[0.28, 64, 64, 0, Math.PI * 2, 0, Math.PI]} />
        </mesh>

        <GlassCapsule color={pantallaColor} power={design.pantallaGrosor} intensity={pantallaBrillo} />

        <group position={[0, -0.02, 0.29]}>
          <RobotEye position={[-design.separacionOjos, 0, 0]} rotation={[0, -0.2, 0]}
            scale={design.escalaOjos} blinkDuration={design.parpadeoDuracion}
            blinkCycle={blinkCycle} isLovedRef={isLovedRef} />
          <RobotEye position={[design.separacionOjos, 0, 0]} rotation={[0, 0.2, 0]}
            scale={design.escalaOjos} blinkDuration={design.parpadeoDuracion}
            blinkCycle={blinkCycle} isLovedRef={isLovedRef} />
        </group>

        <RobotEar position={[-0.29, 0, 0]} isLeft scale={design.tamañoOrejas} />
        <RobotEar position={[0.29, 0, 0]} scale={design.tamañoOrejas} />
      </group>
    </group>
  );
}

export default function RobotBot({
  color = '#c4c4c4',
  scale = 1,
  follow = false,
  pantallaColor = '#00ffc6',
  pantallaBrillo = 1.2,
  blinkCycle = 3.0,
  metalness = 0.0,
  ground = false,
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 6], fov: 40 }}
      dpr={[1, 2]}
      gl={{ alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
    >
      {/* Plain lights instead of drei's <Environment preset="studio">,
          which fetches an HDR from a CDN. The shell uses envMapIntensity 0
          anyway, so there was nothing to gain from it. */}
      <ambientLight intensity={0.75} color="#ffffff" />
      <directionalLight position={[2, 4, 5]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-4, 1, -3]} intensity={0.35} color="#dbdbdb" />

      <ResponsiveGroup scale={scale}>
        {/* A soft contact shadow under the robot is what makes it read as
            standing on something rather than floating. Off by default —
            the corner dock has no surface for it to fall on. */}
        {ground && (
          <ContactShadows
            position={[0, -0.79, 0]}
            opacity={0.6}
            scale={9}
            resolution={512}
            blur={2.2}
            far={2.2}
            color="#000000"
          />
        )}
        <RobotPrototype
          follow={follow}
          color={color}
          pantallaColor={pantallaColor}
          pantallaBrillo={pantallaBrillo}
          blinkCycle={blinkCycle}
          metalness={metalness}
        />
      </ResponsiveGroup>
    </Canvas>
  );
}
