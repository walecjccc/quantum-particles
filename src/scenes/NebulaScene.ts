import * as THREE from "three";
import { BaseScene } from "./BaseScene";

function gaussian(): number {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export class NebulaScene extends BaseScene {
  private points: THREE.Points | null = null;
  private positions: Float32Array | null = null;
  private originals: Float32Array | null = null;

  init(): void {
    const count = 30000;
    this.particleCount = count;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const palettes = [
      new THREE.Color(0xff4488),
      new THREE.Color(0x4488ff),
      new THREE.Color(0xaa44ff),
      new THREE.Color(0x44ffaa),
      new THREE.Color(0xffaa44),
    ];

    interface Center { x: number; y: number; z: number; r: number; color: THREE.Color }
    const centers: Center[] = [];
    for (let c = 0; c < 6; c++) {
      centers.push({
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 8,
        r: 1.2 + Math.random() * 2.5,
        color: palettes[c % palettes.length],
      });
    }

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const center = centers[Math.floor(Math.random() * centers.length)];
      const r = Math.abs(gaussian()) * center.r;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = center.x + r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = center.y + r * Math.sin(phi) * Math.sin(theta) * 0.5;
      positions[i3 + 2] = center.z + r * Math.cos(phi);

      const distRatio = Math.min(1, r / (center.r * 2));
      const mixed = center.color.clone().lerp(new THREE.Color(0x1a1a3a), distRatio * 0.6);
      const brightness = 0.15 + Math.random() * 0.5;
      colors[i3] = mixed.r * brightness;
      colors[i3 + 1] = mixed.g * brightness;
      colors[i3 + 2] = mixed.b * brightness;

      const roll = Math.random();
      if (roll < 0.88) sizes[i] = 0.2 + Math.random() * 0.5;
      else sizes[i] = 0.7 + Math.random() * 1.0;
    }

    this.positions = positions;
    this.originals = new Float32Array(positions);
    this.points = this.createPoints(positions, colors, sizes);
    this.group.add(this.points);
  }

  update(elapsed: number, _delta: number): void {
    if (!this.points || !this.positions || !this.originals) return;

    const count = this.particleCount;
    const t = elapsed * 0.12;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const ox = this.originals[i3];
      const oy = this.originals[i3 + 1];
      const oz = this.originals[i3 + 2];
      this.positions[i3] = ox + Math.sin(t + oy * 0.5) * 0.2;
      this.positions[i3 + 1] = oy + Math.cos(t + ox * 0.5) * 0.15;
      this.positions[i3 + 2] = oz + Math.sin(t + ox * 0.3) * 0.18;
    }
    const attr = this.points.geometry.getAttribute("position") as THREE.BufferAttribute;
    attr.needsUpdate = true;
    this.group.rotation.y = elapsed * 0.02;
    this.updatePointsMaterial(this.points, elapsed);
  }
}
