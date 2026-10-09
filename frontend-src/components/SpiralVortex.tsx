import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function SpiralVortex() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
    camera.position.set(0, 6.5, 11);

    const starVertexShader = `
      attribute float aSize;
      attribute float aPhase;
      attribute float aSpeed;
      attribute vec3 aColor;

      uniform float uTime;
      uniform float uPixelRatio;

      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = aColor;
        float twinkle = 0.55 + 0.45 * sin(uTime * aSpeed + aPhase);
        vAlpha = twinkle;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = (aSize * 1.15) * uPixelRatio * (280.0 / -mvPosition.z) * (0.85 + 0.25 * sin(uTime * 1.5 + aPhase));
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const starFragmentShader = `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;

        float intensity = clamp(1.0 - dist * 2.0, 0.0, 1.0);
        intensity = pow(intensity, 1.35);

        gl_FragColor = vec4(vColor, intensity * vAlpha * 0.95);
      }
    `;

    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x00d2ff),
      new THREE.Color(0xa78bfa),
      new THREE.Color(0xf43f5e),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xe0e7ff),
    ];

    const N_SPIRAL = 2400;
    const N_OUTER = 800;
    const N_TOTAL = N_SPIRAL + N_OUTER;

    const positions = new Float32Array(N_TOTAL * 3);
    const colors = new Float32Array(N_TOTAL * 3);
    const sizes = new Float32Array(N_TOTAL);
    const phases = new Float32Array(N_TOTAL);
    const speeds = new Float32Array(N_TOTAL);

    for (let i = 0; i < N_TOTAL; i++) {
      if (i < N_SPIRAL) {
        const r = Math.pow(Math.random(), 1.7) * 11.5 + 0.3;
        const arms = 4;
        const armAngle = (i % arms) * ((Math.PI * 2) / arms);
        const spiralAngle = armAngle + r * 0.65;

        const spread = (Math.random() - 0.5) * (0.24 + r * 0.14);
        const ySpread = (Math.random() - 0.5) * (0.32 + r * 0.08);

        positions[i * 3] = Math.cos(spiralAngle) * r + spread;
        positions[i * 3 + 1] = ySpread;
        positions[i * 3 + 2] = Math.sin(spiralAngle) * r + spread;

        const normR = r / 11.5;
        let c: THREE.Color;
        if (normR < 0.2) {
          c = colorPalette[0];
        } else if (normR < 0.6) {
          const pool = [colorPalette[0], colorPalette[1], colorPalette[2]];
          c = pool[Math.floor(Math.random() * pool.length)];
        } else {
          const pool = [colorPalette[1], colorPalette[2], colorPalette[3], colorPalette[4]];
          c = pool[Math.floor(Math.random() * pool.length)];
        }
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;

        const isBeacon = Math.random() < 0.12;
        sizes[i] = isBeacon ? 0.3 + Math.random() * 0.18 : 0.14 + Math.random() * 0.08;
      } else {
        const sr = 14.0 + Math.random() * 24.0;
        const st = Math.random() * Math.PI * 2;
        const sp = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = sr * Math.sin(sp) * Math.cos(st);
        positions[i * 3 + 1] = sr * Math.sin(sp) * Math.sin(st);
        positions[i * 3 + 2] = sr * Math.cos(sp);

        const pool = [colorPalette[0], colorPalette[1], colorPalette[2]];
        const c = pool[Math.floor(Math.random() * pool.length)];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;

        sizes[i] = 0.11 + Math.random() * 0.07;
      }

      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 1.2 + Math.random() * 2.2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starField = new THREE.Points(geometry, material);
    scene.add(starField);

    let spin = 0;
    let lastScroll = window.scrollY;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
    };
    window.addEventListener("resize", resize);
    resize();

    const onPointerMove = (e: PointerEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotY = mouseX * 0.22;
      targetRotX = mouseY * 0.14;
    };
    window.addEventListener("pointermove", onPointerMove);

    const clock = new THREE.Clock();
    let animId: number;

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      material.uniforms.uTime.value = t;

      const currentScroll = window.scrollY;
      const heroHeight = window.innerHeight;

      // Spiral background starts fading in after scrolling past the 1st section (Hero)
      // When currentScroll <= heroHeight * 0.4: opacity is 0
      // Fades in smoothly between 0.4 * vh and 1.0 * vh
      const fadeProgress = Math.min(1, Math.max(0, (currentScroll - heroHeight * 0.4) / (heroHeight * 0.6)));
      container.style.opacity = String(fadeProgress);

      const delta = currentScroll - lastScroll;
      lastScroll = currentScroll;
      spin += delta * 0.00025;
      spin *= 0.94;

      starField.rotation.y += 0.001 + spin;
      starField.rotation.x += (targetRotX * 0.25 - starField.rotation.x) * 0.04;
      starField.rotation.z += (-targetRotY * 0.18 - starField.rotation.z) * 0.04;

      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const scrollProgress = Math.min(1, Math.max(0, currentScroll / maxScroll));
      const targetCamY = 6.5 - scrollProgress * 3.2;
      const targetCamZ = 11.0 - scrollProgress * 3.5;

      camera.position.y += (targetCamY - camera.position.y) * 0.08;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      camera.position.x += (targetRotY * 1.4 - camera.position.x) * 0.05;

      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
      style={{ opacity: 0 }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
