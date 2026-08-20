import * as THREE from "three";
import { BaseScene } from "./BaseScene";

export class GalaxyScene extends BaseScene {
  private points: THREE.Points | null = null;
  private rotationSpeed = 0.05;

  init(): void {
    const count = 30000;
    this.particleCount = count;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const arms = 5;
    const armWidth = 0.6;
    const maxRadius = 8;
    const spin = 0.8;

    const inner = new THREE.Color(0xffe9a0);
    const outer = new THREE.Color(0x4a6fff);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = Math.pow(Math.random(), 1.5) * maxRadius;
      const arm = i % arms;
      const armAngle = arm * ((Math.PI * 2) / arms);
      const spinAngle = radius * spin;
      const scatter = (Math.random() - 0.5) * armWidth * (1 + radius * 0.3);
      const scatterY = (Math.random() - 0.5) * 0.25 * (1 - radius / maxRadius);

      const angle = armAngle + spinAngle;
      positions[i3] = Math.cos(angle) * radius + Math.cos(angle) * scatter;
      positions[i3 + 1] = scatterY;
      positions[i3 + 2] = Math.sin(angle) * radius + Math.sin(angle) * scatter;

      const t = radius / maxRadius;
      const col = inner.clone().lerp(outer, t);
      const brightness = 0.5 + Math.random() * 0.5;
      colors[i3] = col.r * brightness;
      colors[i3 + 1] = col.g * brightness;
      colors[i3 + 2] = col.b * brightness;

      sizes[i] = Math.random() * 3 + 0.5;
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
