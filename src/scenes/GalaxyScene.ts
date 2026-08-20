import * as THREE from "three";
import { BaseScene } from "./BaseScene";

export class GalaxyScene extends BaseScene {
  private points: THREE.Points | null = null;
  private rotationSpeed = 0.04;

  init(): void {
    const galaxyCount = 45000;
    const bgCount = 5000;
    const count = galaxyCount + bgCount;
    this.particleCount = count;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const arms = 4;
    const maxRadius = 8;
    const spin = 0.65;

    const coreColor = new THREE.Color(0xfff0c8);
    const armColor = new THREE.Color(0x5577ff);
    const hiiColor = new THREE.Color(0xff5577);

    for (let i = 0; i < galaxyCount; i++) {
      const i3 = i * 3;
      const radius = Math.pow(Math.random(), 1.6) * maxRadius;
      const arm = i % arms;
      const armAngle = arm * ((Math.PI * 2) / arms);
      const spinAngle = radius * spin;
      const scatterScale = 0.4 + radius * 0.08;
      const scatter = (Math.random() - 0.5) * scatterScale;
      const yThick = 0.12 * (1 - (radius / maxRadius) * 0.6) + 0.03;
      const scatterY = (Math.random() - 0.5) * yThick * (1 + (1 - radius / maxRadius) * 2.5);
      const angle = armAngle + spinAngle;
      const jitter = (Math.random() - 0.5) * 0.2;

      positions[i3] = Math.cos(angle) * radius + Math.cos(angle) * scatter + jitter;
      positions[i3 + 1] = scatterY;
      positions[i3 + 2] = Math.sin(angle) * radius + Math.sin(angle) * scatter + jitter;

      const t = radius / maxRadius;
      let col: THREE.Color;
      if (t < 0.12) {
        col = coreColor.clone();
      } else {
        col = coreColor.clone().lerp(armColor, Math.min(1, (t - 0.12) / 0.88));
      }
      if (Math.random() < 0.015 && t > 0.15) col = hiiColor.clone();

      const brightness = 0.25 + Math.random() * 0.65;
      colors[i3] = col.r * brightness;
      colors[i3 + 1] = col.g * brightness;
      colors[i3 + 2] = col.b * brightness;

      const roll = Math.random();
      if (roll < 0.82) sizes[i] = 0.15 + Math.random() * 0.5;
      else if (roll < 0.96) sizes[i] = 0.7 + Math.random() * 0.6;
      else sizes[i] = 1.3 + Math.random() * 0.9;
    }

    // Background stars
    for (let i = galaxyCount; i < count; i++) {
      const i3 = i * 3;
      const r = 15 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
      positions[i3 + 2] = r * Math.cos(phi);
      const b = 0.15 + Math.random() * 0.3;
      colors[i3] = b;
      colors[i3 + 1] = b;
      colors[i3 + 2] = b * (0.85 + Math.random() * 0.15);
      sizes[i] = 0.1 + Math.random() * 0.25;
    }

    this.points = this.createPoints(positions, colors, sizes);
    this.group.add(this.points);
  }

  update(elapsed: number, _delta: number): void {
    if (!this.points) return;
    this.group.rotation.y = elapsed * this.rotationSpeed;
    this.updatePointsMaterial(this.points, elapsed);
  }
}
