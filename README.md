# Quantum Particles

An interactive 3D particle universe built with Three.js and TypeScript. Explore five visually stunning particle scenes — from spiral galaxies to black hole accretion disks — all rendered in real-time WebGL with smooth camera controls.

## Features

- **5 Animated Scenes**
  - Galaxy — a 30,000-particle spiral galaxy with 5 arms and color gradients
  - Nebula — a swirling cosmic cloud with multi-color palettes
  - DNA Helix — a rotating double-helix structure with connecting rungs
  - Black Hole — particles orbiting and spiraling around a gravitational singularity
  - Wave — a ripple grid with multi-frequency wave interference

- **Interactive Controls**
  - Drag to rotate the camera
  - Scroll to zoom in/out
  - Right-drag to pan
  - Press keys 1–5 to switch scenes instantly
  - Auto-rotation with damping for smooth motion

- **Custom Shader Particles** — Each particle is rendered with a custom GLSL shader featuring soft circular falloff, additive blending, and per-particle coloring for a glowing, volumetric look

- **Real-time Stats** — Live particle count and FPS counter

## Tech Stack

- [Three.js](https://threejs.org/) — WebGL 3D rendering
- [TypeScript](https://www.typescriptlang.org/) — Type-safe development
- [Vite](https://vitejs.dev/) — Fast build tooling and dev server

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Deployment

### GitHub Pages

1. Build the project: `npm run build`
2. The `dist/` folder contains the static site
3. Push to GitHub and enable Pages in repo Settings → Pages, selecting the `dist` folder (or use the `gh-pages` branch)

Or use the deploy script:
```bash
npx gh-pages -d dist
```

### Vercel / Netlify

Import the repository and set:
- Build command: `npm run build`
- Output directory: `dist`

## Project Structure

```
quantum-particles/
├── index.html              # HTML entry with UI overlay
├── src/
│   ├── main.ts             # Engine: renderer, camera, scene manager, animation loop
│   ├── style.css           # UI styles (glassmorphism, responsive)
│   └── scenes/
│       ├── BaseScene.ts    # Abstract base class + shared shader material
│       ├── GalaxyScene.ts  # Spiral galaxy
│       ├── NebulaScene.ts  # Cosmic cloud
│       ├── DNAScene.ts     # Double helix
│       ├── BlackholeScene.ts # Accretion disk
│       └── WaveScene.ts    # Ripple grid
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## License

MIT
