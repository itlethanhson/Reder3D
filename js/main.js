import * as THREE from 'three';
import { createScene } from './core/sceneManager.js';
import { createRenderer } from './core/rendererManager.js';
import { createCamera } from './core/cameraManager.js';
import { createControls } from './core/controlsManager.js';
import { createToolbar } from './ui/toolbar.js';
import { createEnvironment } from './core/environmentManager.js';
import { homeView } from './camera/homeView.js';
import { frontView } from './camera/frontView.js';
import { isoView } from './camera/isoView.js';
import { SelectionTool } from './tools/selectionTool.js';
import { createComposer } from './core/composerManager.js';
import { createOutlinePass } from './core/outlineManager.js';
import { createSSAOPass } from './core/ssaoManager.js';
import { HoverTool } from './tools/hoverTool.js';
import { createViewCube } from './ui/viewCube.js';
import { PropertyPanel } from './ui/propertyPanel.js';
import { PropertyTool } from './tools/propertyTool.js';
import { createSectionPanel } from './ui/sectionPanel.js';
import { createExplodePanel } from './ui/explodePanel.js';
import { createMeasurePanel } from './ui/measurePanel.js';
import { SectionTool } from './tools/sectionTool.js';
import { ExplodeTool } from './tools/explodeTool.js';
import { MeasureTool } from './tools/measureTool.js';
import { AnnotationTool } from './tools/annotationTool.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { TreePanel } from './ui/treePanel.js';
import { ScreenshotTool } from './tools/screenshotTool.js';
import { ModelListPanel } from './ui/modelListPanel.js';
import { GLTFLoaderWrapper } from './loaders/gltfLoader.js';
import { STLLoaderWrapper } from './loaders/stlLoader.js';
import { OBJLoaderWrapper } from './loaders/objLoader.js';
import { STEPLoaderWrapper } from './loaders/stepLoader.js';
import { LODManager } from './utils/lodManager.js';
import { PerformancePanel } from './ui/performancePanel.js';
import { agentLog } from './utils/agentLog.js';
import { initShapes } from './parametric/parametricBuilder.js';
import { initPanel, toggle as toggleParametricPanel, isVisible as isParametricVisible, loadExternalProfile, populateProfile, setOnView3D } from './parametric/parametricPanel.js';
import { extractProfileFromModel } from './parametric/fileAnalyzer.js';

// ============ Core Setup ============

const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();
const controls = createControls(camera, renderer);

createToolbar();
createEnvironment(scene);

// Init parametric builder + panel
initShapes().then(count => {
    console.log(`Parametric builder: ${count} shapes loaded`);
    initPanel((group, shapeId, material) => {
        // Xoá các parametric shape cũ khỏi scene
        scene.children.slice().forEach(c => {
            if (c.name && c.name.startsWith('parametric_')) scene.remove(c);
        });

        // Xoá model gốc (STEP/GLB) đã được load — thay bằng parametric
        if (_parametricSourceModel) {
            scene.remove(_parametricSourceModel);
            const idx = modelListPanel.models.findIndex(m => m.object === _parametricSourceModel);
            if (idx !== -1) modelListPanel.removeModel(modelListPanel.models[idx].id);
            _parametricSourceModel = null;
        }

        // Gỡ parametric model cũ khỏi modelList (nếu có) để tránh trùng lặp
        if (_parametricModelId) {
            modelListPanel.removeModel(_parametricModelId);
            _parametricModelId = null;
        }

        scene.add(group);
        _currentModel = group;
        _parametricModelId = modelListPanel.addModel(`Tùy chỉnh: ${shapeId}`, group);
        fitCameraToObject(group);
        explodeTool.rebuild();
        treePanel.build(scene, (obj) => {
            selectionTool.selected = obj;
            propertyTool.show(obj);
        });
        updateDownloadBtn();
    });

    // "Xem 3D" callback — chỉ unlock viewer, model đã được generate bởi _generate()
    setOnView3D(() => {
        const locked = document.getElementById('viewer-locked');
        if (locked) locked.classList.add('hidden');
    });
}, (visible) => {
    document.getElementById('parametric-btn')?.classList.toggle('active', visible);
});

const selectionTool = new SelectionTool(scene, camera);
const composer = createComposer(renderer, scene, camera);
const ssaoPass = createSSAOPass(composer, scene, camera);
window.ssaoPass = ssaoPass;
const outlinePass = createOutlinePass(composer, scene, camera);

createSectionPanel();
createExplodePanel();
createMeasurePanel();

const propertyPanel = new PropertyPanel();
const propertyTool = new PropertyTool(propertyPanel);

new HoverTool(scene, camera, outlinePass);

createViewCube(camera, controls);

// Move panels into viewer area
const viewerArea = document.querySelector('#viewer-area') || document.body;
document.querySelectorAll('#view-cube, #section-panel, #explode-panel, #measure-panel, #performance-panel').forEach(el => {
    if (el && el.parentNode !== viewerArea) viewerArea.appendChild(el);
});

// ============ Tools ============

const sectionTool = new SectionTool(scene);
const explodeTool = new ExplodeTool(scene);
const measureTool = new MeasureTool(scene, camera);
const screenshotTool = new ScreenshotTool(renderer);
const treePanel = new TreePanel();
const modelListPanel = new ModelListPanel();

// Performance and LOD Manager
const lodManager = new LODManager();
window.lodManager = lodManager;
const performancePanel = new PerformancePanel();

// CSS2DRenderer for measure labels + annotations
const css2DRenderer = new CSS2DRenderer();
css2DRenderer.domElement.style.position = 'absolute';
css2DRenderer.domElement.style.top = '0';
css2DRenderer.domElement.style.left = '0';
css2DRenderer.domElement.style.pointerEvents = 'none';
document.getElementById('viewer-container').appendChild(css2DRenderer.domElement);

// Give CSS2DRenderer pointer-events only to annotation labels
css2DRenderer.domElement.style.pointerEvents = 'none';

const annotationTool = new AnnotationTool(scene, camera);

// ============ UI Helpers ============

function on(id, fn) {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
}
function onInput(id, fn) {
    const el = document.getElementById(id);
    if (el) el.oninput = fn;
}

// ============ Section Controls ============

const sectionAxis = document.getElementById('section-axis');
const sectionSlider = document.getElementById('section-slider');
const sectionValueDisplay = document.getElementById('section-value-display');

let sectionHelperVisible = false;

if (sectionAxis) sectionAxis.onchange = () => {
    sectionTool.setAxis(sectionAxis.value);
    sectionTool.update(parseFloat(sectionSlider?.value || 0));
};

if (sectionSlider) sectionSlider.oninput = () => {
    const v = parseFloat(sectionSlider.value);
    sectionTool.update(v);
    if (sectionValueDisplay) sectionValueDisplay.textContent = v.toFixed(1);
};

on('section-flip-btn', () => {
    sectionTool.flip();
    const flipBtn = document.getElementById('section-flip-btn');
    if (flipBtn) flipBtn.classList.toggle('active');
});

on('section-reset-btn', () => {
    sectionTool.reset();
    const flipBtn = document.getElementById('section-flip-btn');
    if (flipBtn) flipBtn.classList.remove('active');
    const helperBtn = document.getElementById('section-helper-btn');
    if (helperBtn) helperBtn.classList.remove('active');
    sectionHelperVisible = false;
    if (sectionValueDisplay) sectionValueDisplay.textContent = '0';
});

on('section-helper-btn', () => {
    sectionHelperVisible = !sectionHelperVisible;
    sectionTool.showHelper(sectionHelperVisible);
    const helperBtn = document.getElementById('section-helper-btn');
    if (helperBtn) helperBtn.classList.toggle('active', sectionHelperVisible);
});

// ============ Explode Controls ============

const explodeSlider = document.getElementById('explode-slider');
if (explodeSlider) explodeSlider.oninput = () => {
    explodeTool.update(parseFloat(explodeSlider.value));
};

// ============ Collapse / Expand Toolbar ============
const toolbarEl = document.getElementById('toolbar');
const toggleHandle = document.getElementById('tb-toggle-handle');
if (toggleHandle && toolbarEl) {
    toggleHandle.onclick = (e) => {
        e.stopPropagation();
        toolbarEl.classList.toggle('collapsed');
    };
}

// ============ Toolbar Buttons ============

let wireframeMode = false;
let rotateEnabled = false;
let annotationEnabled = false;

on('wireframe-btn', () => {
    wireframeMode = !wireframeMode;
    scene.traverse(obj => {
        if (obj.isMesh && obj.material) {
            obj.material.wireframe = wireframeMode;
        }
    });
    document.getElementById('wireframe-btn')?.classList.toggle('active', wireframeMode);
});

on('rotate-btn', () => {
    rotateEnabled = !rotateEnabled;
    document.getElementById('rotate-btn')?.classList.toggle('active', rotateEnabled);
});

let sectionActive = false;
let explodeActive = false;

on('section-btn', () => {
    sectionActive = !sectionActive;
    const sectionBtn = document.getElementById('section-btn');
    const sectionPanel = document.getElementById('section-panel');
    
    if (sectionActive) {
        sectionBtn?.classList.add('active');
        if (sectionPanel) sectionPanel.style.display = 'block';
    } else {
        sectionBtn?.classList.remove('active');
        if (sectionPanel) sectionPanel.style.display = 'none';
        sectionTool.reset();
    }
});

on('explode-btn', () => {
    explodeActive = !explodeActive;
    const explodeBtn = document.getElementById('explode-btn');
    const explodePanel = document.getElementById('explode-panel');
    const explodeSlider = document.getElementById('explode-slider');
    
    if (explodeActive) {
        explodeBtn?.classList.add('active');
        if (explodePanel) explodePanel.style.display = 'block';
    } else {
        explodeBtn?.classList.remove('active');
        if (explodePanel) explodePanel.style.display = 'none';
        explodeTool.update(0);
        if (explodeSlider) explodeSlider.value = 0;
    }
});

on('home-btn', () => homeView(camera, controls));
on('front-btn', () => frontView(camera, controls));
on('iso-btn', () => isoView(camera, controls));

on('measure-btn', () => {
    const measurePanel = document.getElementById('measure-panel');
    if (measureTool.enabled) {
        measureTool.disable();
        document.getElementById('measure-btn')?.classList.remove('active');
        if (measurePanel) measurePanel.style.display = 'none';
    } else {
        // Disable annotation if active
        if (annotationEnabled) {
            annotationTool.disable();
            annotationEnabled = false;
            document.getElementById('annotation-btn')?.classList.remove('active');
        }
        measureTool.enable();
        document.getElementById('measure-btn')?.classList.add('active');
        if (measurePanel) measurePanel.style.display = 'block';
    }
});

on('annotation-btn', () => {
    if (annotationEnabled) {
        annotationTool.disable();
        annotationEnabled = false;
        document.getElementById('annotation-btn')?.classList.remove('active');
    } else {
        // Disable measure if active
        if (measureTool.enabled) {
            measureTool.disable();
            document.getElementById('measure-btn')?.classList.remove('active');
            const measurePanel = document.getElementById('measure-panel');
            if (measurePanel) measurePanel.style.display = 'none';
        }
        annotationTool.enable();
        annotationEnabled = true;
        document.getElementById('annotation-btn')?.classList.add('active');
    }
});

on('clear-annotations-btn', () => {
    annotationTool.clearAll();
    // Also disable if active
    if (annotationEnabled) {
        annotationTool.disable();
        annotationEnabled = false;
        document.getElementById('annotation-btn')?.classList.remove('active');
    }
});

on('models-btn', () => {
    modelListPanel.toggle();
    document.getElementById('models-btn')?.classList.toggle('active', modelListPanel.visible);
});

on('parametric-btn', () => {
    // Sidebar luôn hiển thị — scroll vào nếu cần
    document.getElementById('config-sidebar')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

on('tree-btn', () => {
    treePanel.toggle(scene, (obj) => {
        selectionTool.selected = obj;
        propertyTool.show(obj);
    });
    document.getElementById('tree-btn')?.classList.toggle('active', treePanel._enabled);
});

on('property-btn', () => {
    propertyPanel.toggle(selectionTool.selected || undefined);
    document.getElementById('property-btn')?.classList.toggle('active', propertyPanel._enabled);
});

// ============ Performance & LOD Controls ============

on('perf-btn', () => {
    performancePanel.toggle();
});

const lodEnableCb = document.getElementById('perf-lod-enable');
if (lodEnableCb) {
    lodEnableCb.onchange = () => {
        lodManager.enabled = lodEnableCb.checked;
    };
}

const dynamicLodCb = document.getElementById('perf-dynamic-lod');
if (dynamicLodCb) {
    dynamicLodCb.onchange = () => {
        lodManager.dynamicLOD = dynamicLodCb.checked;
    };
}

const ssaoEnableCb = document.getElementById('perf-ssao-enable');
if (ssaoEnableCb) {
    ssaoEnableCb.onchange = () => {
        ssaoPass.enabled = ssaoEnableCb.checked;
    };
}

// Camera distance multiplier (configurable via UI)
let cameraDistMultiplier = 1.8;
let _currentModel = null;
let _parametricSourceModel = null;  // Model gốc được thay thế bởi parametric shape
let _parametricModelId = null;       // ID của parametric model trong modelList
const cameraDistSlider = document.getElementById('perf-camera-dist');
const cameraDistLabel = document.getElementById('perf-camera-dist-label');
if (cameraDistSlider) {
    cameraDistSlider.oninput = () => {
        cameraDistMultiplier = parseFloat(cameraDistSlider.value);
        if (cameraDistLabel) cameraDistLabel.textContent = cameraDistMultiplier.toFixed(1) + 'x';
        if (_currentModel) fitCameraToObject(_currentModel);
    };
}

// Helper gán _currentModel sau mỗi lần load model
function setCurrentModel(model) {
    _currentModel = model;
}

// ============ Render Controls (Performance Panel) ============

// --- Exposure ---
const exposureSlider = document.getElementById('perf-exposure');
const exposureLabel = document.getElementById('perf-exposure-label');
if (exposureSlider) {
    exposureSlider.oninput = () => {
        const v = parseFloat(exposureSlider.value);
        renderer.toneMappingExposure = v;
        if (exposureLabel) exposureLabel.textContent = v.toFixed(1);
    };
}

// --- EnvMap Intensity ---
const envmapSlider = document.getElementById('perf-envmap');
const envmapLabel = document.getElementById('perf-envmap-label');
function applyEnvMapIntensity(value) {
    scene.traverse((node) => {
        if (node.isMesh && node.material) {
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach(m => { m.envMapIntensity = value; });
        }
    });
}
if (envmapSlider) {
    envmapSlider.oninput = () => {
        const v = parseFloat(envmapSlider.value);
        applyEnvMapIntensity(v);
        if (envmapLabel) envmapLabel.textContent = v.toFixed(1);
    };
}

// --- SSAO Radius ---
const ssaoRadiusSlider = document.getElementById('perf-ssao-radius');
const ssaoRadiusLabel = document.getElementById('perf-ssao-radius-label');
if (ssaoRadiusSlider) {
    ssaoRadiusSlider.oninput = () => {
        const v = parseFloat(ssaoRadiusSlider.value);
        if (window.ssaoPass) window.ssaoPass.kernelRadius = v;
        if (ssaoRadiusLabel) ssaoRadiusLabel.textContent = v.toFixed(0);
    };
}

// --- Background Color ---
const bgSelect = document.getElementById('perf-bg-color');
if (bgSelect) {
    bgSelect.onchange = () => {
        scene.background = new THREE.Color(bgSelect.value);
    };
}

// --- Reset Render ---
on('perf-render-reset', () => {
    // Reset Exposure
    renderer.toneMappingExposure = 1.5;
    if (exposureSlider) exposureSlider.value = '1.5';
    if (exposureLabel) exposureLabel.textContent = '1.5';

    // Reset EnvMap
    applyEnvMapIntensity(0.3);
    if (envmapSlider) envmapSlider.value = '0.3';
    if (envmapLabel) envmapLabel.textContent = '0.3';

    // Reset SSAO
    if (window.ssaoPass) window.ssaoPass.kernelRadius = 8;
    if (ssaoRadiusSlider) ssaoRadiusSlider.value = '8';
    if (ssaoRadiusLabel) ssaoRadiusLabel.textContent = '8';

    // Reset Background
    scene.background = new THREE.Color(0xfafcff);
    if (bgSelect) bgSelect.value = '#fafcff';
});

controls.addEventListener('start', () => {
    lodManager.isMoving = true;
});

controls.addEventListener('end', () => {
    lodManager.isMoving = false;
});

// Lắng nghe sự kiện hoàn thành progressive load để cập nhật lại Tree và Explode
window.addEventListener('model-loaded-complete', (e) => {
    explodeTool.rebuild();
    treePanel.build(scene, (obj) => {
        selectionTool.selected = obj;
        propertyTool.show(obj);
    });
});

// ============ Help Modal ============

const helpModal = document.getElementById('help-modal');

function openHelp() {
    if (!helpModal) return;
    helpModal.style.display = 'flex';
    document.getElementById('help-btn')?.classList.add('active');
    // Reset to first tab each open
    document.querySelectorAll('.help-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.help-pane').forEach(p => p.classList.remove('active'));
    const firstTab = document.querySelector('.help-tab[data-pane="start"]');
    const firstPane = document.getElementById('pane-start');
    if (firstTab) firstTab.classList.add('active');
    if (firstPane) firstPane.classList.add('active');
}

function closeHelp() {
    if (!helpModal) return;
    helpModal.style.display = 'none';
    document.getElementById('help-btn')?.classList.remove('active');
}

on('help-btn', openHelp);
on('help-modal-close', closeHelp);
on('help-modal-close2', closeHelp);

// Close on backdrop click
if (helpModal) {
    helpModal.addEventListener('pointerdown', (e) => {
        if (e.target === helpModal) closeHelp();
    });
}

// Close on Escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && helpModal && helpModal.style.display !== 'none') {
        closeHelp();
    }
});

// Tab switching
document.querySelectorAll('.help-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const paneId = tab.dataset.pane;

        document.querySelectorAll('.help-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.help-pane').forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const pane = document.getElementById('pane-' + paneId);
        if (pane) pane.classList.add('active');
    });
});

// ============ Selection Events ============

selectionTool.setOnSelect((object) => {
    propertyTool.show(object);
    treePanel.build(scene, (obj) => {
        selectionTool.selected = obj;
        propertyTool.show(obj);
    });
});

selectionTool.setOnDeselect(() => {
    propertyTool.clear();
});

// ============ File Loading & Progress Overlay ============

const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');
const loadingPercentage = document.getElementById('loading-percentage');
const loadingProgressBar = document.getElementById('loading-progress-bar');

const loaderAppInterface = {
    setLoading: (isLoading, message = 'Đang tải mô hình...') => {
        if (loadingOverlay) {
            loadingOverlay.style.display = isLoading ? 'flex' : 'none';
        }
        if (loadingText) {
            loadingText.textContent = message;
        }
        if (!isLoading) {
            if (loadingProgressBar) loadingProgressBar.style.width = '0%';
            if (loadingPercentage) loadingPercentage.textContent = '0%';
        }
    },
    updateLoadingProgress: (percent) => {
        const rounded = Math.round(percent);
        if (loadingPercentage) loadingPercentage.textContent = `${rounded}%`;
        if (loadingProgressBar) loadingProgressBar.style.width = `${rounded}%`;
    }
};

const loaders = {
    gltf: new GLTFLoaderWrapper(loaderAppInterface),
    glb:  new GLTFLoaderWrapper(loaderAppInterface),
    stl:  new STLLoaderWrapper(loaderAppInterface),
    obj:  new OBJLoaderWrapper(loaderAppInterface),
    step: new STEPLoaderWrapper(loaderAppInterface),
    stp:  new STEPLoaderWrapper(loaderAppInterface),
};

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.glb,.stp,.step';
fileInput.multiple = true;
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

// ============ Reset Viewer State ============
function updateDownloadBtn() {
    const dlBtn = document.getElementById('download-btn');
    if (dlBtn) dlBtn.disabled = modelListPanel.models.length === 0;
}

function resetViewerState() {
    // 1. Clear all models from scene and modelListPanel
    const objects = modelListPanel.clearAll();
    objects.forEach(obj => scene.remove(obj));

    // 2. Reset scene rotation
    scene.rotation.set(0, 0, 0);

    // 3. Reset Wireframe mode
    wireframeMode = false;
    document.getElementById('wireframe-btn')?.classList.remove('active');

    // 4. Reset Rotate mode
    rotateEnabled = false;
    document.getElementById('rotate-btn')?.classList.remove('active');

    // 5. Reset Section View
    sectionActive = false;
    sectionTool.reset();
    document.getElementById('section-btn')?.classList.remove('active');
    const sectionPanel = document.getElementById('section-panel');
    if (sectionPanel) sectionPanel.style.display = 'none';
    const flipBtn = document.getElementById('section-flip-btn');
    if (flipBtn) flipBtn.classList.remove('active');
    const helperBtn = document.getElementById('section-helper-btn');
    if (helperBtn) helperBtn.classList.remove('active');
    sectionHelperVisible = false;
    const sectionSlider = document.getElementById('section-slider');
    if (sectionSlider) sectionSlider.value = 0;
    const sectionValueDisplay = document.getElementById('section-value-display');
    if (sectionValueDisplay) sectionValueDisplay.textContent = '0';

    // 6. Reset Explode View
    explodeActive = false;
    explodeTool.update(0);
    document.getElementById('explode-btn')?.classList.remove('active');
    const explodePanel = document.getElementById('explode-panel');
    if (explodePanel) explodePanel.style.display = 'none';
    const explodeSlider = document.getElementById('explode-slider');
    if (explodeSlider) explodeSlider.value = 0;

    // 7. Reset Measure Tool
    if (measureTool.enabled) {
        measureTool.disable();
    }
    measureTool.clear();
    document.getElementById('measure-btn')?.classList.remove('active');
    const measurePanel = document.getElementById('measure-panel');
    if (measurePanel) measurePanel.style.display = 'none';

    // 8. Reset Annotation Tool
    annotationTool.clearAll();
    if (annotationEnabled) {
        annotationTool.disable();
        annotationEnabled = false;
    }
    document.getElementById('annotation-btn')?.classList.remove('active');

    // 9. Reset Property Panel
    propertyTool.clear();

    // 10. Reset Tree Panel
    treePanel.build(scene, () => {});

    // 11. Disable download button until a model is loaded
    updateDownloadBtn();

    // 12. Rebuild explode tool to clear any cached meshes
    explodeTool.rebuild();

    // 13. Clear current model reference
    _currentModel = null;
    _parametricSourceModel = null;
    _parametricModelId = null;

    // 14. Re-lock viewer
    document.getElementById('viewer-locked')?.classList.remove('hidden');
}

// ============ Color audit (debug) ============
function auditModelColors(model, stage, hypothesisId) {
    const samples = [];
    let meshCount = 0;
    model.traverse(node => {
        if (node.isMesh && node.material && samples.length < 5) {
            meshCount++;
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach(material => {
                if (samples.length >= 5) return;
                samples.push({
                    name: node.name || 'unnamed',
                    type: material.type,
                    colorHex: material.color ? '#' + material.color.getHexString() : null,
                    colorRGB: material.color ? { r: +material.color.r.toFixed(3), g: +material.color.g.toFixed(3), b: +material.color.b.toFixed(3) } : null,
                    metalness: material.metalness,
                    roughness: material.roughness,
                    envMapIntensity: material.envMapIntensity,
                    map: !!material.map,
                    mapColorSpace: material.map?.colorSpace ?? null
                });
            });
        } else if (node.isMesh) {
            meshCount++;
        }
    });
    // #region agent log
    agentLog('main.js:auditModelColors', 'material color audit', { stage, meshCount, samples, hasSceneEnvironment: !!scene.environment, totalLightIntensity: scene.children.filter(c => c.isLight).reduce((s, l) => s + (l.intensity || 0), 0) }, hypothesisId);
    // #endregion
}

// ============ Optimize Model Materials (Color & Brightness Boost) ============
function optimizeModelMaterials(model) {
    auditModelColors(model, 'before-optimize', 'B');
    model.traverse(node => {
        if (node.isMesh && node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach(material => {
                // 1. Tăng cường độ phản xạ môi trường HDR (Environment Map Intensity)
                // Giúp mô hình phản xạ ánh sáng studio chân thực, làm màu sắc sáng bừng và bóng bẩy hơn
                const _envVal = document.getElementById('perf-envmap');
                material.envMapIntensity = _envVal ? parseFloat(_envVal.value) : 0.3;

                // 2. Giới hạn độ nhám (roughness) để bề mặt phản xạ ánh sáng tốt hơn, tránh bị xỉn màu tối tăm
                // Nhiều mô hình CAD xuất khẩu có độ nhám mặc định = 1.0 (hấp thụ sạch ánh sáng)
                if (material.roughness > 0.4) {
                    material.roughness = 0.25;
                }

                // 3. Điều chỉnh độ kim loại (metalness) hợp lý để giữ màu sắc tươi tắn, tránh bị đen hóa
                if (material.metalness > 0.8) {
                    // Đối với kim loại bóng, giảm độ nhám sâu để tạo độ phản xạ gương sáng loáng
                    material.roughness = 0.1;
                }

                // 4. Xử lý màu sắc chuẩn xác (Color Management & Brightness Boost)
                if (material.color) {
                    // Đảm bảo màu sắc không bị quá tối. Nếu tổng giá trị RGB quá thấp, ta nhân nhẹ để nâng sáng
                    const luminance = 0.2126 * material.color.r + 0.7152 * material.color.g + 0.0722 * material.color.b;
                    if (luminance < 0.2 && luminance > 0) {
                        // Nâng sáng nhẹ cho các màu quá tối để nhìn rõ cấu trúc chi tiết của CAD
                        material.color.multiplyScalar(2.0);
                    }

                    // 5. Tăng saturation (độ bão hòa màu) để màu sắc tươi hơn
                    material.color.multiplyScalar(1.15);
                }

                // 5. Yêu cầu vật liệu cập nhật lại shader
                material.needsUpdate = true;
            });
        }
    });
    auditModelColors(model, 'after-optimize', 'B');
}

on('open-btn', () => fileInput.click());

on('load-demo-btn', async () => {
    // 1. Mở modal viewer
    productPage.style.display = 'none';
    viewerModal.style.display = 'flex';
    viewerActive = true;
    
    // 2. Chờ một nhịp nhỏ để DOM cập nhật layout mượt mà trước khi nạp model nặng
    setTimeout(async () => {
        resizeViewer();
        try {
            resetViewerState();
            loaderAppInterface.setLoading(true, 'Đang tải mô hình Demo (GearboxAssy.glb)...');

            const loader = loaders.glb;
            const model = await loader.load('./models/GearboxAssy.glb');
            
            optimizeModelMaterials(model);
            scene.add(model);
            setCurrentModel(model);
            fitCameraToObject(model);
            
            explodeTool.rebuild();
            
            treePanel.build(scene, (obj) => {
                selectionTool.selected = obj;
                propertyTool.show(obj);
            });
            
            // Đưa mô hình vào danh sách quản lý đa model
            modelListPanel.addModel('GearboxAssy.glb', model);
            
            // ---- Populate parametric panel ----
            try {
                const profile = extractProfileFromModel(model, 'GearboxAssy.glb');
                populateProfile(profile);
                _parametricSourceModel = model;
            } catch (e) {
                console.warn('Parametric extraction failed:', e);
            }
            
            // Unlock viewer vì đã có model
            document.getElementById('viewer-locked')?.classList.add('hidden');
            
            // Kích hoạt nút chụp ảnh/download
            updateDownloadBtn();
            
        } catch (err) {
            console.error('Tải mô hình demo thất bại:', err);
            alert('Không thể nạp mô hình demo: ' + (err.message || err));
        } finally {
            loaderAppInterface.setLoading(false);
        }
    }, 50);
});

fileInput.onchange = async () => {

    const files = Array.from(fileInput.files);
    if (!files.length) return;

    resetViewerState();
    let loadedCount = 0;

    for (const file of files) {

        const ext = file.name.split('.').pop().toLowerCase();
        const loader = loaders[ext];

        if (!loader) {
            console.warn('Unsupported format:', ext);
            continue;
        }

        try {

            loaderAppInterface.setLoading(true, `Loading ${file.name}...`);
            const model = await loader.load(file, files);
            // #region agent log
            agentLog('main.js:fileInput', 'file loaded pre-optimize', { fileName: file.name, ext, loaderType: loader.constructor.name }, 'E');
            // #endregion
            optimizeModelMaterials(model);
            scene.add(model);
            setCurrentModel(model);
            fitCameraToObject(model);

            explodeTool.rebuild();

            treePanel.build(scene, (obj) => {
                selectionTool.selected = obj;
                propertyTool.show(obj);
            });

            // ---- Multi-model panel ----
            modelListPanel.addModel(file.name, model);
            loadedCount++;

            // ---- Populate parametric panel from loaded model ----
            try {
                const profile = extractProfileFromModel(model, file.name);
                populateProfile(profile);
                _parametricSourceModel = model;
            } catch (e) {
                console.warn('Parametric extraction failed:', e);
            }

            // Unlock viewer vì đã có model
            document.getElementById('viewer-locked')?.classList.add('hidden');

        } catch (err) {
            console.error('Load failed:', err);
            alert('Cannot load file: ' + (err.message || err));
        } finally {
            loaderAppInterface.setLoading(false);
        }

    }

    fileInput.value = '';

    // Enable screenshot once at least one model is loaded
    updateDownloadBtn();
};

// Model list panel callbacks
modelListPanel.onFocusModel((object) => {
    fitCameraToObject(object);
});

modelListPanel.onRemoveModel((object) => {
    scene.remove(object);
    explodeTool.rebuild();
    treePanel.build(scene, (obj) => {
        selectionTool.selected = obj;
        propertyTool.show(obj);
    });
    updateDownloadBtn();
});

modelListPanel.onClearAll(() => {
    const objects = modelListPanel.clearAll();
    objects.forEach(obj => scene.remove(obj));
    explodeTool.rebuild();
    treePanel.build(scene, () => {});
    updateDownloadBtn();
    _currentModel = null;
});

// ============ Screenshot ============

window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        screenshotTool.capture();
    }
});

on('download-btn', () => screenshotTool.capture());

// ============ Fit Camera ============

function fitCameraToObject(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return;

    controls.target.copy(center);
    controls.minDistance = maxDim * 0.05;
    const dist = maxDim * cameraDistMultiplier;
    camera.position.set(
        center.x + dist * 0.6,
        center.y + dist * 0.6,
        center.z + dist * 0.6
    );
    controls.update();

    // Cập nhật động bán kính bóng SSAO dựa trên kích thước mô hình thực tế
    if (window.ssaoPass) {
        const ssaoVal = maxDim * 0.03;
        window.ssaoPass.kernelRadius = ssaoVal;
        window.ssaoPass.minDistance = maxDim * 0.001;
        window.ssaoPass.maxDistance = maxDim * 0.1;
        // Đồng bộ slider
        const ssaoR = document.getElementById('perf-ssao-radius');
        const ssaoL = document.getElementById('perf-ssao-radius-label');
        const displayVal = Math.round(ssaoVal);
        if (ssaoR) ssaoR.value = String(displayVal);
        if (ssaoL) ssaoL.textContent = String(displayVal);
    }
}

// ============ Modal Overlay Logic ============

const productPage = document.getElementById('product-page');
const viewerModal = document.getElementById('viewer-modal');
let viewerActive = true;

function resizeViewer() {
    const container = document.getElementById('viewer-container');
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;

    if (w === 0 || h === 0) {
        const rect = container.getBoundingClientRect();
        camera.aspect = rect.width / rect.height || 1;
    } else {
        camera.aspect = w / h;
    }

    camera.updateProjectionMatrix();
    renderer.setSize(w || window.innerWidth, h || window.innerHeight);
    composer.setSize(w || window.innerWidth, h || window.innerHeight);
    css2DRenderer.setSize(w || window.innerWidth, h || window.innerHeight);
}

resizeViewer();

// ============ Animation Loop ============

let lastTime = performance.now();
let frames = 0;
let fps = 60;
let colorPipelineLogged = false;

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (!viewerActive) return;

    if (!colorPipelineLogged && viewerActive) {
        colorPipelineLogged = true;
        // #region agent log
        agentLog('main.js:animate', 'render pipeline check', { usesComposer: true, rendererToneMapping: renderer.toneMapping, rendererExposure: renderer.toneMappingExposure, rendererOutputCS: renderer.outputColorSpace, sceneHasEnvironment: !!scene.environment, composerPassCount: composer.passes?.length }, 'C');
        // #endregion
    }

    if (rotateEnabled) {
        scene.rotation.y += 0.005;
    }

    // Cập nhật LOD trước khi render
    lodManager.update(camera);

    // Đo đạc FPS thực tế
    frames++;
    const time = performance.now();
    if (time >= lastTime + 1000) {
        fps = (frames * 1000) / (time - lastTime);
        frames = 0;
        lastTime = time;
    }

    // Render cảnh chính
    composer.render();
    css2DRenderer.render(scene, camera);

    // Cập nhật thông số lên panel
    if (performancePanel.visible) {
        performancePanel.update(fps, renderer.info.render, lodManager.getStats(), scene);
    }
}

animate();

// ============ Modal Open/Close ============

const openViewerBtn = document.getElementById('open-viewer-btn');
if (openViewerBtn) {
    openViewerBtn.onclick = () => {
        productPage.style.display = 'none';
        viewerModal.style.display = 'flex';
        viewerActive = true;

        setTimeout(() => {
            resizeViewer();
            fitCameraToObject(scene);
        }, 50);
    };
}

const closeViewerBtn = document.getElementById('close-viewer-btn');
if (closeViewerBtn) {
    closeViewerBtn.onclick = () => {
        viewerModal.style.display = 'none';
        productPage.style.display = 'flex';
        viewerActive = false;
    };
}

window.addEventListener('resize', () => {
    if (viewerActive) resizeViewer();
});

// Handle analyze-open-viewer event from intro page
window.addEventListener('analyze-open-viewer', async (e) => {
    const profile = e.detail?.profile;
    const file = e.detail?.file;
    if (!profile) return;
    viewerActive = true;

    setTimeout(async () => {
        resizeViewer();

        // Load the actual file into the viewer if provided
        if (file) {
            const ext = file.name.split('.').pop().toLowerCase();
            const loader = loaders[ext];
            if (loader) {
                try {
                    loaderAppInterface.setLoading(true, `Đang tải ${file.name}...`);
                    resetViewerState();
                    const model = await loader.load(file);
                    optimizeModelMaterials(model);
                    scene.add(model);
                    setCurrentModel(model);
                    fitCameraToObject(model);
                    _parametricSourceModel = model;
                    _parametricModelId = modelListPanel.addModel(file.name, model);
                    explodeTool.rebuild();
                    treePanel.build(scene, (obj) => {
                        selectionTool.selected = obj;
                        propertyTool.show(obj);
                    });
                    updateDownloadBtn();
                    document.getElementById('viewer-locked')?.classList.add('hidden');
                } catch (err) {
                    console.warn('Load file failed:', err);
                } finally {
                    loaderAppInterface.setLoading(false);
                }
            }
        }

        // Populate parametric panel with extracted profile
        populateProfile(profile);
    }, 200);
});
