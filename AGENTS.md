# AGENTS.md — Dự án CAD Viewer

## Giới thiệu

Dự án CAD Viewer là viewer 3D WebGL dùng Three.js chạy hoàn toàn trên trình duyệt. Hỗ trợ GLTF, STL, OBJ, STEP.

## Phát hiện lỗi (24/06/2026 — ĐÃ SỬA)

Tất cả lỗi đã được fix trong phiên bản hiện tại:

### ✅ Đã sửa

1. **`selectionTool.js`** — Code orphan + `setOnDeselect()` ngoài class → đã dọn.
2. **`main.js`** — `explodeTool.rebuild()` không khởi tạo, `home-btn` null, double `setOnSelect` → đã fix flow.
3. **Loaders** — Thiếu import `MeshBVHManager` → đã thêm.
4. **`main.js`** — SectionPanel/ExplodePanel gọi dạng class → đã gọi đúng dạng function.
5. **`labelManager.js`** — Label không add vào scene → measureTool đã add label vào scene.
6. **`index.html`** — Thiếu CSS + `lang="en"` → đã thêm đủ CSS + `lang="vi"`.
7. **`postprocessing.js`** — Trùng lặp → đã chuyển thành re-export deprecated.
8. **`createEnvironment`** — Đã gọi trong main.js, có fallback procedural khi thiếu HDR.
9. **Tích hợp tools** — SectionTool, ExplodeTool, MeasureTool, TreePanel, ScreenshotTool, CSS2DRenderer đã tích hợp đầy đủ.
10. **`three-mesh-bvh`** — Đã thêm vào importmap.
11. **File loading** — Thêm nút Open + cơ chế load GLTF/STL/OBJ/STEP. (26/06: chỉ cho Open file .GLB)
12. **Wireframe/Rotate buttons** — Đã có event handler.
13. **Resize handler** — Đã xử lý resize cho renderer, composer, CSS2DRenderer.
14. **Property/Tree panels** — Chuyển sang toggle-only: không auto-open khi load model hay chọn object. Thêm button Cây + Thông tin trên toolbar.

## Coding Convention

- **Format**: Indent 4 spaces, export function `createXxx()`, class `XxxTool`.
- **Import**: ES modules, importmap Three.js r160 CDN.
- **Naming**: camelCase cho biến/hàm, PascalCase cho class.
- **CSS**: ID selectors (`#panel-id`), position absolute layout.
- **Tool pattern**: class nhận `scene, camera` trong constructor, add event listener trong constructor.

## Quick Commands

```bash
# Serve locally via npm (auto-open browser)
npm start

# Or python
python -m http.server 8080
```

## Module Status (100% complete)

Core engine ✅ → Toolbar + Camera ✅ → Selection + Highlight ✅ → Measure ✅ → Section + Explode ✅ → Tree + Property ✅ → Loaders ✅ → File loading ✅ → CSS2DRenderer ✅ → Performance ✅ → Screenshot ✅ → Progressive Loading/LOD ✅
