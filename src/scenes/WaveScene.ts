import * as THREE from "three";
import { BaseScene } from "./BaseScene";

export class WaveScene extends BaseScene {
  private points: THREE.Points | null = null;
  private gridX: Float32Array | null = null;
  private gridZ: Float32Array | null = null;

  init(): void {
    const size = 10;
    const resolution = 120;
    const count = resolution * resolution;
    this.particleCount = count;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const gridX = new Float32Array(count);
    const gridZ = new Float32Array(count);

    const lowColor = new THREE.Color(0x1a3a8a);
    const midColor = new THREE.Color(0x00e5ff);
    const highColor = new THREE.Color(0xff5ea8);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = (i % resolution) / (resolution - 1) * size - size / 2;
      const z = Math.floor(i / resolution) / (resolution - 1) * size - size / 2;
      positions[i3] = x;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = z;
      gridX[i] = x;
      gridZ[i] = z;

      colors[i3] = midColor.r;
      colors[i3 + 1] = midColor.g;
      colors[i3 + 2] = midColor.b;
      sizes[i] = 0.4 + Math.random() * 1.0;
    }

    this.gridX = gridX;
    this.gridZ = gridZ;
    this.points = this.createPoints(positions, colors, sizes);
    this.group.add(this.points);
  }

  update(elapsed: number, _delta: number): void {
    if (!this.points || !this.gridX || !this.gridZ) return;

    const count = this.particleCount;
    const pos = this.points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const col = this.points.geometry.getAttribute("aColor") as THREE.BufferAttribute;
    const posArr = pos.array as Float32Array;
    const colArr = col.array as Float32Array;

    const t = elapsed * 1.2;
    const lowColor = new THREE.Color(0x1a3a8a);
    const midColor = new THREE.Color(0x00e5ff);
    const highColor = new THREE.Color(0xff5ea8);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = this.gridX[i];
      const z = this.gridZ[i];
      const wave = Math.sin(x * 0.6 + t) * 1.5 + Math.sin(z * 0.6 + t * 0.8) * 1.5;
      const ripple = Math.sin(Math.sqrt(x * x + z * z) * 0.5 - t * 2) * 0.8;
      const y = wave + ripple;
      posArr[i3 + 1] = y;

      const norm = (y + 3.8) / 7.6;
      let c: THREE.Color;
      if (norm < 0.5) c = lowColor.clone().lerp(midColor, norm * 2);
      else c = midColor.clone().lerp(highColor, (norm - 0.5) * 2);
      colArr[i3] = c.r;
      colArr[i3 + 1] = c.g;
      colArr[i3 + 2] = c.b;
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    this.group.rotation.x = -0.4;
    this.updatePointsMaterial(this.points, elapsed);
  }
}
