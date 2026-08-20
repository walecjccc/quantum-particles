import * as THREE from "three";
import { BaseScene } from "./BaseScene";

export class DNAScene extends BaseScene {
  private points: THREE.Points | null = null;

  init(): void {
    const length = 12;
    const radius = 2;
    const twists = 3;
    const stepsPerUnit = 80;
    const steps = length * stepsPerUnit;
    const strands = 2;
    const rungInterval = 40;

    const count = steps * strands + Math.floor(steps / rungInterval) * 8;
    this.particleCount = count;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const strandA = new THREE.Color(0x00e5ff);
    const strandB = new THREE.Color(0xff5ea8);
    const rungCol = new THREE.Color(0xffd56b);

    let idx = 0;
    for (let s = 0; s < steps; s++) {
      const t = (s / steps) * length - length / 2;
      const angle = (s / steps) * Math.PI * 2 * twists;
      const i3 = idx * 3;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = t;
      positions[i3 + 2] = Math.sin(angle) * radius;
      colors[i3] = strandA.r;
      colors[i3 + 1] = strandA.g;
      colors[i3 + 2] = strandA.b;
      sizes[idx] = 2.5;
      idx++;

      const j3 = idx * 3;
      positions[j3] = Math.cos(angle + Math.PI) * radius;
      positions[j3 + 1] = t;
      positions[j3 + 2] = Math.sin(angle + Math.PI) * radius;
      colors[j3] = strandB.r;
      colors[j3 + 1] = strandB.g;
      colors[j3 + 2] = strandB.b;
      sizes[idx] = 2.5;
      idx++;

      if (s % rungInterval === 0) {
        const rungSteps = 6;
        for (let r = 1; r < rungSteps; r++) {
          const f = r / rungSteps;
          const ax = Math.cos(angle) * radius;
          const az = Math.sin(angle) * radius;
          const bx = Math.cos(angle + Math.PI) * radius;
          const bz = Math.sin(angle + Math.PI) * radius;
          const k3 = idx * 3;
          positions[k3] = ax * (1 - f) + bx * f;
          positions[k3 + 1] = t;
          positions[k3 + 2] = az * (1 - f) + bz * f;
          colors[k3] = rungCol.r;
          colors[k3 + 1] = rungCol.g;
          colors[k3 + 2] = rungCol.b;
          sizes[idx] = 1.5;
          idx++;
        }
      }
    }

    this.particleCount = idx;
    const trimmedPos = positions.slice(0, idx * 3);
    const trimmedCol = colors.slice(0, idx * 3);
    const trimmedSize = sizes.slice(0, idx);

    this.points = this.createPoints(trimmedPos, trimmedCol, trimmedSize);
    this.group.add(this.points);
  }

  update(elapsed: number, _delta: number): void {
    if (!this.points) return;
    this.group.rotation.y = elapsed * 0.3;
    this.updatePointsMaterial(this.points, elapsed);
  }
}
