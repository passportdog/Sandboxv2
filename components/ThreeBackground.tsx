"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

interface Props {
  state: "idle" | "loading" | "active";
}

const STATE_CONFIG = {
  idle:    { opacity: 0.06, speedMult: 1,   rotSpeed: 0.0008 },
  loading: { opacity: 0.15, speedMult: 4,   rotSpeed: 0.005  },
  active:  { opacity: 0.08, speedMult: 1.5, rotSpeed: 0.0008 },
};

export default function ThreeBackground({ state }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  // Keep ref in sync without re-running effect
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const initScene = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfafafa, 0.0025);

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Camera
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.z = 25;
    camera.position.y = 2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xfafafa, 0);
    container.appendChild(renderer.domElement);

    // Torus Knot
    const geometry = new THREE.TorusKnotGeometry(10, 2, 120, 16);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x888888,
      emissive: 0x000000,
      roughness: 0.2,
      metalness: 0.1,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Sparks (60 InstancedMesh circles traveling along torus knot surface)
    const sparkCount = 60;
    const sparkGeo = new THREE.CircleGeometry(0.12, 4);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xa3a3a3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
      depthTest: false,
    });
    const sparks = new THREE.InstancedMesh(sparkGeo, sparkMat, sparkCount);
    torusKnot.add(sparks);

    const dummy = new THREE.Object3D();
    const radialSegments = 16;
    const tubularSegments = 120;

    const sparkData = Array.from({ length: sparkCount }, () => ({
      baseSpeed: 0.0003 + Math.random() * 0.0008,
      progress: Math.random(),
      pathIndex: Math.floor(Math.random() * radialSegments),
    }));

    const posAttribute = geometry.attributes.position;
    const stride = radialSegments + 1;
    const v1 = new THREE.Vector3();
    const v2 = new THREE.Vector3();

    function updateSparks(speedMultiplier: number) {
      sparkData.forEach((spark, i) => {
        spark.progress += spark.baseSpeed * speedMultiplier;
        if (spark.progress >= 1) spark.progress = 0;

        const exactInd = spark.progress * tubularSegments;
        const u = Math.floor(exactInd);
        const nextU = (u + 1) % tubularSegments;
        const v = spark.pathIndex;

        const idx1 = (u * stride + v) * 3;
        const idx2 = (nextU * stride + v) * 3;

        v1.fromArray(posAttribute.array as number[], idx1);
        v2.fromArray(posAttribute.array as number[], idx2);
        v1.lerp(v2, exactInd - u);

        dummy.position.copy(v1);
        dummy.lookAt(v2);
        dummy.updateMatrix();
        sparks.setMatrixAt(i, dummy.matrix);
      });
      sparks.instanceMatrix.needsUpdate = true;
    }

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0002;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0002;
    };
    document.addEventListener("mousemove", onMouseMove);

    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const cfg = STATE_CONFIG[stateRef.current];
      material.opacity += (cfg.opacity - material.opacity) * 0.05;

      const targetX = mouseX * 0.5;
      const targetY = mouseY * 0.5;

      torusKnot.rotation.y += 0.03 * (targetX - torusKnot.rotation.y) + cfg.rotSpeed;
      torusKnot.rotation.x += 0.03 * (targetY - torusKnot.rotation.x) + cfg.rotSpeed / 2;

      updateSparks(cfg.speedMult);
      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  return (
    <div
      ref={containerRef}
      id="canvas-container"
      aria-hidden="true"
    />
  );
}
