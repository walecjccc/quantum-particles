import * as THREE from "three";
import { BaseScene } from "./BaseScene";

export class BlackholeScene extends BaseScene {
  private points: THREE.Points | null = null;
  private angles: Float32Array | null = null;
  private radii: Float32Array | null = null;
  private speeds: Float32Array | null = null;

  init(): void {
    const count = 25000;
    this.particleCount = count;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const angles = new Float32Array(count);
    const radii = new Float32Array(count);
    const speeds = new Float32Array(count);

    const hot = new THREE.Color(0xffeecc);
    const warm = new THREE.Color(0xff8c42);
    const cool = new THREE.Color(0x6a1fff);
    const maxRadius = 6;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = Math.pow(Math.random(), 0.4) * maxRadius + 0.5;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.15 * Math.max(1, radius);

      angles[i] = angle;
      radii[i] = radius;
      speeds[i] = 1.0 / Math.pow(radius, 1.5);

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(angle) * radius;

      const t = (radius - 0.5) / maxRadius;
      let col: THREE.Color;
      if (t < 0.3) col = hot.clone().lerp(warm, t / 0.3);
      else col = warm.clone().lerp(cool, (t - 0.3) / 0.7);

      const brightness = 0.6 + Math.random() * 0.4;
      colors[i3] = col.r * brightness;
      colors[i3 + 1] = col.g * brightness;
      colors[i3 + 2] = col.b * brightness;

      sizes[i] = Math.random() * 3 + 0.5;
    }

    this.angles = angles;
    this.radii = radii;
    this.speeds = speeds;
    this.points = this.createPoints(positions, colors, sizes);
    this.group.add(this.points);
  }

  update(elapsed: number, _delta: number): void {
    if (!this.points || !this.angles || !this.radii || !this.speeds) return;

    const count = this.particleCount;
    const pos = this.points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      this.angles[i] += this.speeds[i] * 0.016 * 2;
      const r = this.radii[i];
      arr[i3] = Math.cos(this.angles[i]) * r;
      arr[i3 + 2] = Math.sin(this.angles[i]) * r;
    }
    pos.needsUpdate = true;
    this.group.rotation.x = -0.35;
    this.updatePointsMaterial(this.points, elapsed);
  }
}
