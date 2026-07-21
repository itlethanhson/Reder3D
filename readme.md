# CAD Viewer

3D CAD viewer based on **Three.js** (r160), inspired by Autodesk Forge Viewer / YHDFA Viewer. Runs entirely in the browser via ES modules.

## Features

| Module | Status |
|--------|--------|
| Scene / Camera / Renderer | ✅ |
| OrbitControls | ✅ |
| HDR Environment (procedural fallback) | ✅ |
| Postprocessing (SSAO + OutlinePass + FXAA) | ✅ |
| Toolbar (Home/Front/Iso/Wireframe/Rotate) | ✅ |
| Camera Views (Home/Front/Left/Right/Top/Iso/Back/Bottom) | ✅ |
| ViewCube | ✅ |
| Selection + Hover + Highlight (Outline) | ✅ |
| Measure Tool (distance + label) | ✅ |
| Section Tool (X/Y/Z clipping plane) | ✅ |
| Explode View | ✅ |
| Annotation Tool (CSS2D labels) | ✅ |
| Multi-Model Load (tab bar per file) | ✅ |
| Property Panel (toggle) | ✅ |
| Tree Panel (toggle) | ✅ |
| Screenshot Capture | ✅ |
| MeshBVH Optimization | ✅ |
| Loaders: GLB / GLTF / STL / OBJ / STEP | ✅ |
| Progressive Loading / LOD | ✅ |
| Help Modal (hướng dẫn 8 tab) | ✅ |

## Structure

```
cad-viewer/
├── index.php                 # Entry point (PHP/Apache)
├── css/
│   ├── viewer.css            # Layout & containers
│   ├── toolbar.css           # Toolbar styles
│   ├── tree.css              # Tree panel
│   ├── property.css          # Property panel
│   ├── section.css           # Section panel
│   ├── measure.css           # Measure panel
│   ├── annotation.css        # Annotation labels
│   ├── modellist.css         # Multi-model tab bar
│   └── performance.css       # Performance overlay
├── js/
│   ├── main.js               # App bootstrap
│   ├── core/                 # Engine (scene, renderer, composer, BVH)
│   ├── camera/               # View presets + ViewCube
│   ├── ui/                   # UI panels (tree, property, toolbar, help)
│   ├── tools/                # Interactive tools (measure, section, explode, annotation)
│   ├── loaders/              # GLTF / STL / OBJ / STEP wrappers
│   └── utils/                # Helpers (screenshot, thumbnail)
├── assets/hdr/               # HDR environment maps
├── libs/occt-import-js/      # STEP file parser (WASM)
└── models/                   # Sample models (.glb)
```

## How to Run

Serve the root folder with any static HTTP server:

```bash
# NPM (Recommended — auto-opens browser)
npm start

# Python
python -m http.server 8080

# Node
npx serve .

# PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in a browser.

## Tech Stack

- **Three.js** (r160) via CDN (ESM importmap)
- **Postprocessing**: EffectComposer, RenderPass, UnrealBloomPass, OutlinePass, FXAAShader
- **Loaders**: GLTFLoader, STLLoader, OBJLoader, STEP (occt-import-js WASM)
- **Utilities**: OrbitControls, CSS2DRenderer, MeshBVH, RGBELoader
- **Front UI**: Alpine.js (modal), Fancybox (toast notifications)

## Browser Support

Chrome, Firefox, Edge, Safari (ES module + WebGL2 required).

## Notes

- **Open dialog** currently filters `.glb` only. Drag-and-drop supports GLB, GLTF, STL, OBJ, STEP.
- All CSS files are loaded via `<link>` in `index.php` (no bundler).
