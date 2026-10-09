import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const vertex = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform vec2 uMouse;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;
${noise}
float disp(vec3 p){
  float n = snoise(p * 1.15 + vec3(uTime * 0.18 + uMouse.x * 0.4, uTime * 0.12 + uMouse.y * 0.4, 0.0));
  n += 0.45 * snoise(p * 2.6 - vec3(0.0, uTime * 0.22, uTime * 0.1) + vec3(uMouse.x * 0.3, uMouse.y * 0.3, 0.0));
  return n * uAmp;
}
void main(){
  vec3 p = position;
  float d = disp(normal + vec3(uMouse * 0.8, 0.0));
  vec3 np = p + normal * d;
  vec3 t = normalize(cross(normal, vec3(0.0, 1.0, 0.0)) + 0.0001);
  vec3 b = normalize(cross(normal, t));
  float e = 0.01;
  vec3 n1 = normalize(normal + t * e);
  vec3 n2 = normalize(normal + b * e);
  vec3 p1 = n1 * length(position) + n1 * disp(n1 + vec3(uMouse * 0.8, 0.0));
  vec3 p2 = n2 * length(position) + n2 * disp(n2 + vec3(uMouse * 0.8, 0.0));
  vec3 nn = normalize(cross(p1 - np, p2 - np));
  if(dot(nn, normal) < 0.0) nn = -nn;
  vec4 mv = modelViewMatrix * vec4(np, 1.0);
  vNormal = normalize(normalMatrix * nn);
  vView = normalize(-mv.xyz);
  vDisp = d;
  gl_Position = projectionMatrix * mv;
}`;

const fragment = /* glsl */ `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;
vec3 pal(float t){
  vec3 a=vec3(0.55,0.5,0.65); vec3 b=vec3(0.45,0.4,0.4);
  vec3 c=vec3(1.0,1.0,1.0); vec3 d=vec3(0.72,0.45,0.18);
  return a + b*cos(6.28318*(c*t+d));
}
void main(){
  vec3 n = normalize(vNormal);
  float fres = pow(1.0 - max(dot(n, vView), 0.0), 2.2);
  vec3 refl = reflect(-vView, n);
  float t = refl.y*0.5 + refl.x*0.25 + vDisp*0.8 + uTime*0.04;
  vec3 iri = pal(t);
  float band = smoothstep(0.55,0.95, sin(refl.y*6.0 + refl.x*2.0)*0.5+0.5);
  vec3 base = mix(vec3(0.02,0.02,0.04), iri, 0.55 + fres*0.45);
  base += band*0.35;
  base += fres*vec3(0.6,0.55,1.0)*0.8;
  float spec = pow(max(dot(refl, normalize(vec3(0.4,0.8,0.6))),0.0), 40.0);
  base += spec*1.2;
  gl_FragColor = vec4(base, 1.0);
}`;

const scroll = { y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener("scroll", () => (scroll.y = window.scrollY), { passive: true });
}

function Blob() {
  const mesh = useRef<THREE.Mesh>(null);
  const mouse = useRef(new THREE.Vector2());
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.35 },
      uMouse: { value: new THREE.Vector2() },
    }),
    []
  );

  useFrame((state, dt) => {
    uniforms.uTime.value += dt;
    // Fluid responsive mouse interpolation
    mouse.current.lerp(state.pointer, 0.08);
    uniforms.uMouse.value.copy(mouse.current);

    const vh = window.innerHeight;
    const s = Math.min(scroll.y / vh, 1.5);
    uniforms.uAmp.value = THREE.MathUtils.lerp(
      uniforms.uAmp.value,
      0.35 + s * 0.25 + mouse.current.length() * 0.08,
      0.08
    );

    if (mesh.current) {
      // Dynamic rotational responsiveness to cursor movement
      const targetRotY = mouse.current.x * 1.5 + state.clock.getElapsedTime() * 0.15;
      const targetRotX = -mouse.current.y * 1.3 + s * 0.6;
      const targetRotZ = -mouse.current.x * 0.6;

      mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, targetRotY, 0.08);
      mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, targetRotX, 0.08);
      mesh.current.rotation.z = THREE.MathUtils.lerp(mesh.current.rotation.z, targetRotZ, 0.08);

      // Subtle positional parallax towards cursor
      const targetPosX = mouse.current.x * 0.55;
      const targetPosY = mouse.current.y * 0.35 + s * 1.6;
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, targetPosX, 0.08);
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, targetPosY, 0.08);

      const sc = 1.05 - s * 0.25;
      mesh.current.scale.setScalar(THREE.MathUtils.lerp(mesh.current.scale.x, sc, 0.08));
    }
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.38, 64]} />
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
    </mesh>
  );
}

function Particles({ count = 1000 }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 6;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      a[i * 3] = r * Math.sin(ph) * Math.cos(th);
      a[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      a[i * 3 + 2] = r * Math.cos(ph) - 2;
    }
    return a;
  }, [count]);

  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.03 + state.pointer.x * 0.002;
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -state.pointer.y * 0.25, 0.05);
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, state.pointer.x * 0.15, 0.05);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#c7c3ff" transparent opacity={0.75} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <Blob />
      <Particles />
    </Canvas>
  );
}
