import * as THREE from "three";
import { BaseScene } from "./BaseScene";

interface Particle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  r: number; g: number; b: number;
  size: number;
  life: number;
  maxLife: number;
  type: number; // 0=launch, 1=spark, 2=trail/flash
  targetY: number;
}

const PALETTES = [
  [1.0, 0.3, 0.3], [0.3, 0.6, 1.0], [1.0, 0.8, 0.2],
  [0.5, 1.0, 0.4], [1.0, 0.4, 0.8], [0.8, 0.3, 1.0],
  [0.2, 1.0, 1.0], [1.0, 0.6, 0.2],
];

export class FireworksScene extends BaseScene {
  private points: THREE.Points | null = null;
  private pool: Particle[] = [];
  private maxParticles = 6000;
  private positions!: Float32Array;
  private colors!: Float32Array;
  private sizes!: Float32Array;
  private lastLaunch = 0;
  private launchInterval = 0.6;

  init(): void {
    this.particleCount = 0;
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);
    for (let i = 0; i < this.maxParticles; i++) this.sizes[i] = 0;

    this.points = this.createPoints(this.positions, this.colors, this.sizes);
    this.group.add(this.points);
  }

  private spawn(p: Partial<Particle>): void {
    const life = p.life ?? 1.0;
    this.pool.push({
      x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0,
      r: 1, g: 1, b: 1, size: 2,
      life, type: 1, targetY: 0,
      ...p,
      maxLife: life,
    });
  }

  private launch(x: number, z: number): void {
    this.spawn({
      x, y: -6, z,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 7 + Math.random() * 5,
      vz: (Math.random() - 0.5) * 0.8,
      r: 1, g: 0.85, b: 0.6,
      size: 2.0,
      life: 3.0,
      type: 0,
      targetY: 1 + Math.random() * 6,
    });
  }

  private explode(x: number, y: number, z: number): void {
    const pal = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const count = 100 + Math.floor(Math.random() * 100);
    const pattern = Math.random();

    for (let i = 0; i < count; i++) {
      let vx: number, vy: number, vz: number;
      if (pattern < 0.33) {
        const a = (i / count) * Math.PI * 2;
        const sp = 3 + Math.random() * 3;
        vx = Math.cos(a) * sp;
        vy = Math.cos((i / count) * Math.PI * 4) * 2;
        vz = Math.sin(a) * sp;
      } else if (pattern < 0.66) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const sp = 2 + Math.random() * 5;
        vx = Math.sin(phi) * Math.cos(theta) * sp;
        vy = Math.cos(phi) * sp;
        vz = Math.sin(phi) * Math.sin(theta) * sp;
      } else {
        const sp = 1 + Math.random() * 6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        vx = Math.sin(phi) * Math.cos(theta) * sp;
        vy = Math.cos(phi) * sp;
        vz = Math.sin(phi) * Math.sin(theta) * sp;
      }
      const life = 1.0 + Math.random() * 1.5;
      this.spawn({
        x, y, z, vx, vy, vz,
        r: pal[0], g: pal[1], b: pal[2],
        size: 0.5 + Math.random() * 1.2,
        life, type: 1,
      });
    }
    // Flash
    this.spawn({
      x, y, z, vx: 0, vy: 0, vz: 0,
      r: 1, g: 1, b: 1, size: 5, life: 0.15, type: 2,
    });
  }

  update(elapsed: number, delta: number): void {
    // Auto-launch
    if (elapsed - this.lastLaunch > this.launchInterval) {
      this.lastLaunch = elapsed;
      this.launch(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
      );
      this.launchInterval = 0.3 + Math.random() * 0.9;
    }

    // Click to launch
    if (this.mouseClickWorld) {
      this.launch(this.mouseClickWorld.x, this.mouseClickWorld.z);
      this.mouseClickWorld = null;
    }

    const explosions: { x: number; y: number; z: number }[] = [];
    const trails: { x: number; y: number; z: number }[] = [];

    for (let i = this.pool.length - 1; i >= 0; i--) {
      const p = this.pool[i];

      if (p.type === 0) {
        p.vy -= 7 * delta;
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.z += p.vz * delta;
        if (Math.random() < 0.6) trails.push({ x: p.x, y: p.y, z: p.z });
        if (p.vy <= 0 || p.y >= p.targetY) {
          explosions.push({ x: p.x, y: p.y, z: p.z });
          this.pool.splice(i, 1);
          continue;
        }
      } else if (p.type === 1) {
        p.vy -= 3.5 * delta;
        p.vx *= Math.pow(0.96, delta * 60);
        p.vz *= Math.pow(0.96, delta * 60);
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.z += p.vz * delta;
        p.life -= delta;

        if (this.mouseWorld) {
          const dx = this.mouseWorld.x - p.x;
          const dy = this.mouseWorld.y - p.y;
          const dz = this.mouseWorld.z - p.z;
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (d < 5 && d > 0.1) {
            const f = 0.04 * (1 - d / 5);
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
            p.vz += (dz / d) * f;
          }
        }

        if (p.life <= 0 || p.y < -8) { this.pool.splice(i, 1); continue; }
      } else {
        p.life -= delta;
        if (p.life <= 0) { this.pool.splice(i, 1); continue; }
      }
    }

    for (const e of explosions) this.explode(e.x, e.y, e.z);
    for (const t of trails) {
      this.spawn({
        x: t.x, y: t.y, z: t.z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.8 + Math.random() * 0.3,
        vz: (Math.random() - 0.5) * 0.4,
        r: 1, g: 0.7, b: 0.4,
        size: 0.3 + Math.random() * 0.5, life: 0.3, type: 2,
      });
    }

    // Write to buffers
    const n = Math.min(this.pool.length, this.maxParticles);
    for (let i = 0; i < n; i++) {
      const p = this.pool[i];
      const i3 = i * 3;
      this.positions[i3] = p.x;
      this.positions[i3 + 1] = p.y;
      this.positions[i3 + 2] = p.z;
      this.colors[i3] = p.r;
      this.colors[i3 + 1] = p.g;
      this.colors[i3 + 2] = p.b;
      const lr = Math.max(0, p.life / p.maxLife);
      this.sizes[i] = p.size * (0.3 + lr * 0.7);
    }
    for (let i = n; i < this.maxParticles; i++) this.sizes[i] = 0;
    this.particleCount = n;

    const geom = this.points!.geometry;
    (geom.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (geom.getAttribute("aColor") as THREE.BufferAttribute).needsUpdate = true;
    (geom.getAttribute("aSize") as THREE.BufferAttribute).needsUpdate = true;
    this.updatePointsMaterial(this.points!, elapsed);
  }

  dispose(): void {
    this.pool = [];
    super.dispose();
  }
}
