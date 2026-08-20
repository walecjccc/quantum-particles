import * as THREE from "three";

export abstract class BaseScene {
  protected group = new THREE.Group();
  protected particleCount = 0;
  mouseWorld: THREE.Vector3 | null = null;
  mouseClickWorld: THREE.Vector3 | null = null;

  abstract init(): void;
  abstract update(elapsed: number, delta: number): void;

  get object3D(): THREE.Group {
    return this.group;
  }

  get count(): number {
    return this.particleCount;
  }

  setMouseWorld(pos: THREE.Vector3 | null): void {
    this.mouseWorld = pos;
  }

  setMouseClick(pos: THREE.Vector3 | null): void {
    this.mouseClickWorld = pos;
  }

  applyMouseForce(worldPos: THREE.Vector3, strength = 0.008, radius = 4): void {
    const local = worldPos.clone();
    this.group.worldToLocal(local);
    const r2 = radius * radius;
    const mx = local.x, my = local.y, mz = local.z;

    this.group.traverse((child) => {
      if (!(child instanceof THREE.Points)) return;
      const attr = child.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      const count = arr.length / 3;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const dx = mx - arr[i3];
        const dy = my - arr[i3 + 1];
        const dz = mz - arr[i3 + 2];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < r2 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = strength * (1 - d / radius);
          arr[i3] += (dx / d) * f;
          arr[i3 + 1] += (dy / d) * f;
          arr[i3 + 2] += (dz / d) * f;
        }
      }
      attr.needsUpdate = true;
    });
  }

  protected createPoints(
    positions: Float32Array,
    colors: Float32Array,
    sizes: Float32Array,
  ): THREE.Points {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uSize: { value: 2.5 },
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute vec3 aColor;
        varying vec3 vColor;
        uniform float uSize;
        void main() {
          vColor = aColor;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uSize * (320.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, d);
          float core = smoothstep(0.3, 0.0, d);
          vec3 col = vColor + core * 0.5;
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Points(geometry, material);
  }

  protected updatePointsMaterial(points: THREE.Points, elapsed: number): void {
    const mat = points.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = elapsed;
  }

  dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Points) {
        child.geometry.dispose();
        const mat = child.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    });
    this.group.clear();
  }
}
