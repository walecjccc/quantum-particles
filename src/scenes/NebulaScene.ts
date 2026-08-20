import * as THREE from "three";
import { BaseScene } from "./BaseScene";

export class NebulaScene extends BaseScene {
  private points: THREE.Points | null = null;
  private positions: Float32Array | null = null;
  private originals: Float32Array | null = null;

  init(): void {
    const count = 20000;
    this.particleCount = count;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const palettes = [
      new THREE.Color(0xff4488),
      new THREE.Color(0x44aaff),
      new THREE.Color(0xaa44ff),
      new THREE.Color(0x44ffaa),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 0.5) * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i3 + 2] = r * Math.cos(phi);

      const paletteIdx = Math.floor(Math.random() * palettes.length);
      const col = palettes[paletteIdx];
      const t = r / 6;
      const mixed = col.clone().lerp(new THREE.Color(0x2222ff), t * 0.3);
      const brightness = 0.4 + Math.random() * 0.6;
      colors[i3] = mixed.r * brightness;
      colors[i3 + 1] = mixed.g * brightness;
      colors[i3 + 2] = mixed.b * brightness;

      sizes[i] = Math.random() * 4 + 0.5;
    }

    this.positions = positions;
    this.originals = new Float32Array(positions);
    this.points = this.createPoints(positions, colors, sizes);
    this.group.add(this.points);
  }

  update(elapsed: number, _delta: number): void {
    if (!this.points || !this.positions || !this.originals) return;

    const count = this.particleCount;
    const t = elapsed * 0.15;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const ox = this.originals[i3];
      const oy = this.originals[i3 + 1];
      const oz = this.originals[i3 + 2];
      this.positions[i3] = ox + Math.sin(t + oy * 0.5) * 0.3;
      this.positions[i3 + 1] = oy + Math.cos(t + ox * 0.5) * 0.2;
      this.positions[i3 + 2] = oz + Math.sin(t + ox * 0.3) * 0.25;
    }
    const attr = this.points.geometry.getAttribute("position") as THREE.BufferAttribute;
    attr.needsUpdate = true;
    this.group.rotation.y = elapsed * 0.02;
    this.updatePointsMaterial(this.points, elapsed);
  }
}
