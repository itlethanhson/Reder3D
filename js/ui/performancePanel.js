export class PerformancePanel {
    constructor() {
        this.visible = false;
        this.dom = null;
        this.create();
    }

    create() {
        const div = document.createElement('div');
        div.id = 'performance-panel';
        div.style.display = 'none';

        div.innerHTML = `
            <div class="panel-header">
                <h4>⚡ Hiệu năng & LOD</h4>
            </div>
            
            <div class="perf-section">
                <div class="perf-row">
                    <span class="perf-label">Tốc độ khung hình:</span>
                    <span class="perf-value highlight" id="perf-fps">0 FPS</span>
                </div>
                <div class="perf-chart-container">
                    <div class="perf-fps-bar" id="perf-fps-bar"></div>
                </div>
                <div class="perf-row">
                    <span class="perf-label">Số tam giác:</span>
                    <span class="perf-value" id="perf-triangles">0</span>
                </div>
                <div class="perf-row">
                    <span class="perf-label">Số đỉnh (Vertices):</span>
                    <span class="perf-value" id="perf-vertices">0</span>
                </div>
                <div class="perf-row">
                    <span class="perf-label">Số lượng lưới (Meshes):</span>
                    <span class="perf-value" id="perf-meshes">0</span>
                </div>
            </div>

            <div class="perf-sep"></div>

            <div class="perf-section">
                <h5>Cấu hình LOD & Hiệu ứng</h5>
                <div class="perf-row-checkbox">
                    <input type="checkbox" id="perf-lod-enable" checked>
                    <label for="perf-lod-enable">Bật đa cấp chi tiết (LOD)</label>
                </div>
                <div class="perf-row-checkbox">
                    <input type="checkbox" id="perf-dynamic-lod" checked>
                    <label for="perf-dynamic-lod">Dynamic LOD (Mượt khi xoay)</label>
                </div>
                <div class="perf-row-checkbox">
                    <input type="checkbox" id="perf-ssao-enable" checked>
                    <label for="perf-ssao-enable">Bật đổ bóng kẽ hở (SSAO)</label>
                </div>
                
                <div class="perf-sep"></div>

                <div class="perf-section">
                    <h5>Camera</h5>
                    <div class="perf-row">
                        <span class="perf-label">Khoảng cách zoom:</span>
                        <span class="perf-value" id="perf-camera-dist-label">1.8x</span>
                    </div>
                    <div class="perf-range-row">
                        <input type="range" id="perf-camera-dist" min="0.3" max="5.0" step="0.1" value="1.8">
                        <div class="perf-range-labels">
                            <span>Gần</span>
                            <span>Xa</span>
                        </div>
                    </div>
                </div>

                <div class="perf-sep"></div>

                <div class="perf-section">
                    <h5>Render</h5>
                    <div class="perf-row">
                        <span class="perf-label">Độ sáng (Exposure):</span>
                        <span class="perf-value" id="perf-exposure-label">1.5</span>
                    </div>
                    <div class="perf-range-row">
                        <input type="range" id="perf-exposure" min="0.3" max="5.0" step="0.1" value="1.5">
                        <div class="perf-range-labels">
                            <span>Tối</span>
                            <span>Sáng</span>
                        </div>
                    </div>
                    <div class="perf-row">
                        <span class="perf-label">Phản xạ HDR (EnvMap):</span>
                        <span class="perf-value" id="perf-envmap-label">0.3</span>
                    </div>
                    <div class="perf-range-row">
                        <input type="range" id="perf-envmap" min="0.0" max="5.0" step="0.1" value="0.3">
                        <div class="perf-range-labels">
                            <span>0</span>
                            <span>5</span>
                        </div>
                    </div>
                    <div class="perf-row">
                        <span class="perf-label">Đổ bóng kẽ hở (SSAO):</span>
                        <span class="perf-value" id="perf-ssao-radius-label">8</span>
                    </div>
                    <div class="perf-range-row">
                        <input type="range" id="perf-ssao-radius" min="0" max="30" step="1" value="8">
                        <div class="perf-range-labels">
                            <span>Tắt</span>
                            <span>Mạnh</span>
                        </div>
                    </div>
                    <div class="perf-row" style="margin-top:8px;">
                        <span class="perf-label">Nền render:</span>
                        <select id="perf-bg-color" class="perf-select">
                            <option value="#fafcff">Trắng</option>
                            <option value="#f5f7fa">Xám sáng</option>
                            <option value="#e2e8f0">Xám</option>
                            <option value="#1a1a2e">Tối xanh</option>
                            <option value="#000000">Đen</option>
                        </select>
                    </div>
                    <button id="perf-render-reset" class="perf-btn-reset">↺ Reset mặc định</button>
                </div>

                <div class="perf-row" style="margin-top: 12px;">
                    <span class="perf-label">LOD cấu kiện nặng:</span>
                    <span class="perf-value" id="perf-total-lods">0</span>
                </div>
                <div class="perf-row">
                    <span class="perf-label">Độ chi tiết cao (LOD 0):</span>
                    <span class="perf-value highlight-green" id="perf-high-lods">0</span>
                </div>
                <div class="perf-row">
                    <span class="perf-label">Hộp giới hạn (LOD 1):</span>
                    <span class="perf-value highlight-blue" id="perf-low-lods">0</span>
                </div>
            </div>
        `;

        document.body.appendChild(div);
        this.dom = div;
    }

    toggle() {
        this.visible = !this.visible;
        this.dom.style.display = this.visible ? 'block' : 'none';
        const perfBtn = document.getElementById('perf-btn');
        if (perfBtn) perfBtn.classList.toggle('active', this.visible);
    }

    hide() {
        this.visible = false;
        this.dom.style.display = 'none';
        const perfBtn = document.getElementById('perf-btn');
        if (perfBtn) perfBtn.classList.remove('active');
    }

    /**
     * Cập nhật các thông số đo đạc hiệu năng
     * @param {Number} fps 
     * @param {Object} renderInfo - renderer.info.render
     * @param {Object} lodStats - thống kê từ LODManager
     */
    update(fps, renderInfo, lodStats, scene) {
        if (!this.visible) return;

        // Cập nhật FPS
        const fpsEl = document.getElementById('perf-fps');
        if (fpsEl) {
            fpsEl.textContent = `${Math.round(fps)} FPS`;
            if (fps >= 50) {
                fpsEl.className = 'perf-value highlight-green';
            } else if (fps >= 30) {
                fpsEl.className = 'perf-value highlight-orange';
            } else {
                fpsEl.className = 'perf-value highlight-red';
            }
        }

        // Cập nhật thanh biểu đồ FPS nhỏ
        const bar = document.getElementById('perf-fps-bar');
        if (bar) {
            const w = Math.min((fps / 60) * 100, 100);
            bar.style.width = `${w}%`;
            if (fps >= 50) bar.style.backgroundColor = '#00d2ff';
            else if (fps >= 30) bar.style.backgroundColor = '#ff9100';
            else bar.style.backgroundColor = '#ff1744';
        }

        // Cập nhật Triangles từ bộ đếm GPU
        if (renderInfo) {
            const triEl = document.getElementById('perf-triangles');
            if (triEl) triEl.textContent = (renderInfo.triangles || 0).toLocaleString();
        }

        // Cập nhật Vertices & Meshes từ scene traversal
        const vertEl = document.getElementById('perf-vertices');
        const meshEl = document.getElementById('perf-meshes');
        if ((vertEl || meshEl) && scene) {
            let totalVerts = 0;
            let totalMeshes = 0;
            scene.traverse(node => {
                if (node.isMesh) {
                    totalMeshes++;
                    const geom = node.geometry;
                    if (geom && geom.attributes.position) {
                        totalVerts += geom.attributes.position.count;
                    }
                }
            });
            if (vertEl) vertEl.textContent = totalVerts.toLocaleString();
            if (meshEl) meshEl.textContent = totalMeshes.toLocaleString();
        }

        // Cập nhật thống kê LOD
        if (lodStats) {
            const totEl = document.getElementById('perf-total-lods');
            if (totEl) totEl.textContent = lodStats.totalLODs;

            const highEl = document.getElementById('perf-high-lods');
            if (highEl) highEl.textContent = lodStats.highCount;

            const lowEl = document.getElementById('perf-low-lods');
            if (lowEl) lowEl.textContent = lodStats.lowCount;
        }
    }
}
