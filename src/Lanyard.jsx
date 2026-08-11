'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

// replace with your own imports, see the usage snippet for details
import cardGLB from './assets/lanyard/card.glb';
import lanyard from './assets/lanyard/lanyard.png';

import * as THREE from 'three';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

// 1x1 transparent pixel — lets useTexture be called unconditionally when a
// front/back image isn't supplied.
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb). Each
// custom image is composited into its own half so the two faces render
// independently, aspect-preserving (no stretching).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  eventSource,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position: position, fov: fov }}
        /* With eventSource set, R3F binds its pointer listeners to that
           element instead of the canvas, so the canvas can stay
           pointer-events:none — click-through for the page — while the
           card is still draggable anywhere on screen. eventPrefix must be
           'client' then, or the raycast coordinates are computed against
           the wrong origin. */
        eventSource={eventSource}
        eventPrefix={eventSource ? 'client' : undefined}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
          />
          <Bounds />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}
/* ══════════════════════════════════════════════════════════════════════
   BOUNDS

   Invisible walls at the visible edges. Without them the card swings past
   the side of the canvas and is cut in half by it — most obviously to the
   left, where there is nothing between the anchor and the edge.

   The card's own collider is 0.8 half-width, and the wall's inner face is
   placed at the frame edge, so the card centre stops 0.8 short of it and
   the whole card stays inside. MARGIN keeps a sliver of clearance so the
   edge pixel is never touched.

   viewport is world units at z=0, which is the plane the card hangs in, so
   these line up with exactly what the camera sees at any stage size.
   ══════════════════════════════════════════════════════════════════════ */
const WALL_T = 2;

// How far right of centre the lanyard hangs, as a fraction of the frame.
const ANCHOR_FRACTION = 0.28;
const MARGIN = 0.12;

function Bounds() {
  const { viewport } = useThree();
  const x = Math.max(viewport.width / 2 - MARGIN, 1);
  const y = Math.max(viewport.height / 2 - MARGIN, 1);

  return (
    <>
      <RigidBody type="fixed" colliders={false} position={[x + WALL_T, 0, 0]}>
        <CuboidCollider args={[WALL_T, y * 4, 12]} />
      </RigidBody>
      <RigidBody type="fixed" colliders={false} position={[-x - WALL_T, 0, 0]}>
        <CuboidCollider args={[WALL_T, y * 4, 12]} />
      </RigidBody>
      {/* Floor, so a hard drag cannot fling it out of the bottom either. */}
      <RigidBody type="fixed" colliders={false} position={[0, -y - WALL_T, 0]}>
        <CuboidCollider args={[x * 4, WALL_T, 12]} />
      </RigidBody>
    </>
  );
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
}) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef();
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  /* The anchor was a hardcoded y=4, which only reads as "hanging from the
     top" at the component's own camera distance. Deriving it from the
     viewport puts the fixing point just above the top edge at any stage
     size or camera, so the band always comes in from off-screen rather
     than starting mid-air. */
  const { viewport } = useThree();
  const anchorY = viewport.height / 2 + 0.5;

  /* Hang it on the right-hand side of the page rather than the middle.
     Straight-down gravity settles the card roughly below its anchor, so
     the anchor is what decides where it ends up — moving it is the only
     thing that actually shifts the card across.

     A fraction of the viewport rather than a fixed number, so it stays in
     the same place proportionally at any screen width. Clamped so a narrow
     window cannot push the anchor into the right wall, which would pin the
     card against the edge instead of letting it swing. */
  const anchorX = Math.min(viewport.width * ANCHOR_FRACTION, viewport.width / 2 - 1.6);

  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyardImage || lanyard);
  // useTexture must be called unconditionally; use a blank pixel when an image
  // isn't supplied for a given face, then skip compositing it below.
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  // Composite the front/back images into the card's texture atlas (front = left
  // half, back = right half). Each image is drawn aspect-preserving (no stretch).
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    if (!frontImage && !backImage) return baseMap;

    /* Everything below is wrapped, not just the CORS probe. A custom image
       can fail in several ways — the load rejected, the decode is broken,
       drawImage throws on a tainted source, the atlas has no image yet —
       and every one of them previously killed the whole scene, because a
       throw here unmounts the Canvas. Any failure now degrades to the
       model's own artwork, which always works. */
    try {
      const baseImg = baseMap.image;
      if (!baseImg || !baseImg.width) return baseMap;
      const W = baseImg.width;
      const H = baseImg.height;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return baseMap;
      // Keep the original baked atlas for the card edges and any untouched face.
      ctx.drawImage(baseImg, 0, 0, W, H);

      const drawFitted = (img, rect) => {
        const rx = rect.x * W;
        const ry = rect.y * H;
        const rw = rect.w * W;
        const rh = rect.h * H;
        const pick = imageFit === 'contain' ? Math.min : Math.max;
        const scale = pick(rw / img.width, rh / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = rx + (rw - dw) / 2;
        const dy = ry + (rh - dh) / 2;
        ctx.save();
        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        ctx.clip();
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      };

      if (frontImage && frontTex.image) drawFitted(frontTex.image, FRONT_UV_RECT);
      if (backImage && backTex.image) drawFitted(backTex.image, BACK_UV_RECT);

      // Reading one pixel proves the canvas is not tainted. A tainted
      // canvas uploads as a texture and only then throws, deep inside the
      // renderer where it cannot be caught.
      ctx.getImageData(0, 0, 1, 1);

      const composite = new THREE.CanvasTexture(canvas);
      composite.colorSpace = THREE.SRGBColorSpace;
      composite.flipY = baseMap.flipY;
      composite.anisotropy = 16;
      composite.needsUpdate = true;
      return composite;
    } catch (err) {
      console.warn('[Lanyard] could not composite the card images, using the built-in texture:', err?.message || err);
      return baseMap;
    }
  }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base.map]);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  /* Upstream set these two during render, mutating objects React does not
     own at a moment it may re-run. Both are one-time setup, so they belong
     in an effect — same result, no mid-render mutation. */
  /* eslint-disable react-hooks/immutability --
     curve and texture are Three.js objects, not React state. Mutation is
     the only API they have; the rule cannot tell the difference. */
  useEffect(() => {
    curve.curveType = 'chordal';
  }, [curve]);

  useEffect(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
  }, [texture]);
  /* eslint-enable react-hooks/immutability */

  return (
    <>
      <group position={[anchorX, anchorY, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={e => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}
