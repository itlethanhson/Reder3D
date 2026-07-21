<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>CAD Model Viewer</title>

<link rel="icon" href="data:,">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">

<link rel="stylesheet" href="./css/viewer.css">
<link rel="stylesheet" href="./css/toolbar.css">
<link rel="stylesheet" href="./css/tree.css">
<link rel="stylesheet" href="./css/property.css">
<link rel="stylesheet" href="./css/measure.css">
<link rel="stylesheet" href="./css/section.css">
<link rel="stylesheet" href="./css/annotation.css">
<link rel="stylesheet" href="./css/modellist.css">
<link rel="stylesheet" href="./css/performance.css">
<link rel="stylesheet" href="./css/parametric.css">
<script type="importmap">
{
    "imports": {
        "three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
        "three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/",
        "three-mesh-bvh":"https://cdn.jsdelivr.net/npm/three-mesh-bvh@0.7.8/build/index.module.js"
    }
}
</script>

</head>
<body>

<div id="product-page">
    <div class="product-content">
        <div class="product-header">
            <div class="product-badge">3D</div>
            <h1>CAD Model Viewer</h1>
            <p class="product-subtitle">Interactive 3D Model Visualization</p>
        </div>

        <div class="product-card">
            <div class="product-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#09a2a5" stroke-width="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
            </div>
            <h2>Open 3D Model</h2>
            <p>Load and inspect your 3D models with full interactive controls</p>
            <div class="product-actions" style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
                    <button id="open-viewer-btn" class="btn-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        Mở File Cục Bộ
                    </button>
                    <button id="load-demo-btn" class="btn-secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                            <polyline points="2 17 12 22 22 17"/>
                            <polyline points="2 12 12 17 22 12"/>
                        </svg>
                        Xem Model Demo (Gearbox)
                    </button>
                </div>
                <p class="product-hint">Hỗ trợ các định dạng: GLB, GLTF, STL, OBJ, STEP</p>
            </div>
        </div>

        <!-- ============ Analyze & Customize Card ============ -->
        <div class="product-card" id="analyze-card" style="margin-bottom:24px;">
            <div class="product-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#09a2a5" stroke-width="1.5">
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
            </div>
            <h2>Phân Tích & Tùy Chỉnh</h2>
            <p>Upload file STEP/GLB/STL để tự động phân tích thông số và tùy chỉnh kích thước</p>

            <div id="analyze-drop-zone" class="analyze-drop-zone" style="border:2px dashed #d1d5db;border-radius:12px;padding:32px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:12px;" onmouseenter="this.style.borderColor='#09a2a5';this.style.background='rgba(9,162,165,.03)';" onmouseleave="this.style.borderColor='#d1d5db';this.style.background='';">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" style="margin-bottom:8px;">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <p style="font-size:14px;color:#6b7280;margin:0;">Kéo thả file vào đây hoặc click để chọn</p>
                <p style="font-size:11px;color:#9ca3af;margin:4px 0 0;">STEP · GLB · GLTF · STL</p>
                <input type="file" id="analyze-file-input" accept=".stp,.step,.glb,.gltf,.stl" style="display:none;">
            </div>

            <div id="analyze-status" style="display:none;text-align:center;font-size:14px;color:#09a2a5;font-weight:600;padding:12px;"></div>

            <div id="analyze-results" style="display:none;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                    <span style="background:rgba(9,162,165,.1);color:#09a2a5;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;" id="analyze-shape-label">-</span>
                    <span style="background:rgba(107,114,128,.1);color:#6b7280;font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;" id="analyze-material-label">-</span>
                </div>
                <div id="analyze-results-body" style="max-height:200px;overflow-y:auto;"></div>
                <div style="display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap;">
                    <input type="text" id="analyze-profile-name" placeholder="Tên profile" style="flex:1;padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;font-family:inherit;min-width:120px;">
                    <button id="analyze-save-btn" class="btn-secondary" style="padding:8px 16px;font-size:13px;">💾 Lưu vào DB</button>
                    <button id="analyze-load-btn" class="btn-secondary" style="padding:8px 16px;font-size:13px;">📂 Tải từ DB</button>
                    <button id="analyze-open-btn" class="btn-primary" style="padding:8px 16px;font-size:13px;">🔧 Mở trong Viewer</button>
                </div>
            </div>
        </div>

        <div class="product-features">
            <div class="feature">
                <div class="feature-icon">↔</div>
                <span>Orbit & Pan</span>
            </div>
            <div class="feature">
                <div class="feature-icon">✧</div>
                <span>Section View</span>
            </div>
            <div class="feature">
                <div class="feature-icon">↗</div>
                <span>Explode</span>
            </div>
            <div class="feature">
                <div class="feature-icon">📏</div>
                <span>Measure</span>
            </div>
            <div class="feature">
                <div class="feature-icon">⬜</div>
                <span>Wireframe</span>
            </div>
            <div class="feature">
                <div class="feature-icon">📷</div>
                <span>Screenshot</span>
            </div>
        </div>
    </div>
</div>

<div id="viewer-modal" style="display:none">
    <div class="modal-backdrop"></div>
    <div class="modal-dialog">
        <div class="modal-header">
            <span class="modal-title">3D Model</span>
            <div class="modal-header-actions">
                <span class="mode-info">Supports: <span class="highlight">GLB, GLTF, STL, OBJ, STEP</span></span>
                <button id="close-viewer-btn" class="btn-close" title="Close">✕</button>
            </div>
        </div>
        <div class="modal-body">
            <div id="config-sidebar"></div>
            <div id="viewer-area">
                <div id="toolbar"></div>
                <div id="tree-panel"></div>
                <div id="property-panel"></div>
                <div id="viewer-container"></div>
                <div id="viewer-locked" class="viewer-locked">
                    <div class="viewer-locked-card">
                        <div class="viewer-locked-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div class="viewer-locked-title">Cấu hình thông số</div>
                        <div class="viewer-locked-desc">Vui lòng chọn kiểu vật thể và thông số kỹ thuật<br>ở cột bên trái, sau đó nhấn <strong>Xem 3D</strong></div>
                    </div>
                </div>
                <div id="loading-overlay" class="loading-overlay" style="display: none;">
                    <div class="loading-card">
                        <div class="loading-spinner-container">
                            <div class="loading-spinner"></div>
                            <div class="loading-percentage" id="loading-percentage">0%</div>
                        </div>
                        <div class="loading-text" id="loading-text">Đang tải mô hình...</div>
                        <div class="loading-progress-bar-container">
                            <div class="loading-progress-bar" id="loading-progress-bar" style="width: 0%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button id="download-btn" class="btn-footer" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                Download 3D Model
            </button>
        </div>
    </div>
</div>

<!-- ==================== HELP MODAL ==================== -->
<div id="help-modal" style="display:none" role="dialog" aria-modal="true" aria-label="Hướng dẫn sử dụng">
    <div class="help-dialog">

        <!-- Header -->
        <div class="help-header">
            <div class="help-header-left">
                <div class="help-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </div>
                <div>
                    <div class="help-title">Hướng Dẫn Sử Dụng</div>
                    <div class="help-subtitle">CAD Model Viewer — WebGL 3D</div>
                </div>
            </div>
            <button class="help-close" id="help-modal-close" title="Đóng">✕</button>
        </div>

        <!-- Body: Sidebar tabs + Content -->
        <div class="help-body">

            <!-- Sidebar Tabs -->
            <nav class="help-tabs" role="tablist">
                <button class="help-tab active" data-pane="start" role="tab">
                    <span class="help-tab-icon">🚀</span> Bắt đầu
                </button>
                <button class="help-tab" data-pane="camera" role="tab">
                    <span class="help-tab-icon">🎥</span> Camera
                </button>
                <button class="help-tab" data-pane="tools" role="tab">
                    <span class="help-tab-icon">🔧</span> Công cụ
                </button>
                <button class="help-tab" data-pane="section" role="tab">
                    <span class="help-tab-icon">✂️</span> Section
                </button>
                <button class="help-tab" data-pane="annotation" role="tab">
                    <span class="help-tab-icon">📌</span> Ghi chú
                </button>
                <button class="help-tab" data-pane="models" role="tab">
                    <span class="help-tab-icon">📦</span> Multi-Model
                </button>
                <button class="help-tab" data-pane="shortcuts" role="tab">
                    <span class="help-tab-icon">⌨️</span> Phím tắt
                </button>
                <button class="help-tab" data-pane="formats" role="tab">
                    <span class="help-tab-icon">📁</span> Định dạng
                </button>
            </nav>

            <!-- Content Panes -->
            <div class="help-content">

                <!-- Bắt đầu -->
                <div class="help-pane active" id="pane-start">
                    <div class="help-section-title">Bắt đầu nhanh</div>
                    <div class="help-cards">
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">📂</span>
                                <span class="help-card-name">Mở file</span>
                            </div>
                            <div class="help-card-desc">Nhấn nút <strong>Mở File</strong> trên toolbar để chọn file 3D từ máy tính. Hỗ trợ chọn nhiều file cùng lúc.</div>
                        </div>
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">🖱️</span>
                                <span class="help-card-name">Điều hướng</span>
                            </div>
                            <div class="help-card-desc"><strong>Chuột trái:</strong> Xoay model<br><strong>Chuột phải:</strong> Di chuyển<br><strong>Cuộn:</strong> Zoom in/out</div>
                        </div>
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">👆</span>
                                <span class="help-card-name">Chọn Part</span>
                            </div>
                            <div class="help-card-desc">Click vào bất kỳ phần nào của model để chọn và xem thông tin chi tiết trong Property Panel.</div>
                        </div>
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">📷</span>
                                <span class="help-card-name">Screenshot</span>
                            </div>
                            <div class="help-card-desc">Nhấn <strong>Ctrl+S</strong> hoặc nút Screenshot để chụp ảnh màn hình viewer và lưu về máy.</div>
                        </div>
                    </div>
                    <div class="help-tips">
                        <div class="help-tip">
                            <span class="help-tip-icon">💡</span>
                            <span class="help-tip-text">Sau khi mở file, camera sẽ tự động zoom vừa khít với model. Nhấn <strong>Home</strong> bất kỳ lúc nào để trở về góc nhìn này.</span>
                        </div>
                        <div class="help-tip">
                            <span class="help-tip-icon">⚡</span>
                            <span class="help-tip-text">Viewer sử dụng <strong>WebGL + BVH acceleration</strong> để render và raycasting nhanh, phù hợp với model có nhiều polygon.</span>
                        </div>
                    </div>
                </div>

                <!-- Camera -->
                <div class="help-pane" id="pane-camera">
                    <div class="help-section-title">Điều khiển Camera</div>
                    <div class="help-cards">
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">🏠</span>
                                <span class="help-card-name">Home View</span>
                            </div>
                            <div class="help-card-desc">Reset camera về góc nhìn mặc định, zoom vừa khít với toàn bộ model.</div>
                        </div>
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">⬜</span>
                                <span class="help-card-name">Front View</span>
                            </div>
                            <div class="help-card-desc">Chuyển sang góc nhìn từ phía trước (mặt XY), vuông góc với trục Z.</div>
                        </div>
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">◈</span>
                                <span class="help-card-name">Iso View</span>
                            </div>
                            <div class="help-card-desc">Góc nhìn isometric (45°/35.26°) — hiển thị 3 mặt của model cùng lúc.</div>
                        </div>
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">🔄</span>
                                <span class="help-card-name">Auto Xoay</span>
                            </div>
                            <div class="help-card-desc">Bật chế độ tự động xoay model liên tục quanh trục Y. Nhấn lại để tắt.</div>
                        </div>
                    </div>
                    <div class="help-tips">
                        <div class="help-tip">
                            <span class="help-tip-icon">💡</span>
                            <span class="help-tip-text">Giữ <strong>Shift + chuột trái</strong> để panning (di chuyển ngang) thay vì xoay.</span>
                        </div>
                        <div class="help-tip">
                            <span class="help-tip-icon">💡</span>
                            <span class="help-tip-text">ViewCube ở góc dưới phải hiển thị hướng trục X/Y/Z hiện tại của camera.</span>
                        </div>
                    </div>
                </div>

                <!-- Công cụ -->
                <div class="help-pane" id="pane-tools">
                    <div class="help-section-title">Công cụ phân tích</div>
                    <div class="help-cards">
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">📏</span>
                                <span class="help-card-name">Đo khoảng cách</span>
                            </div>
                            <div class="help-card-desc">Nhấn <strong>Đo</strong>, sau đó click 2 điểm bất kỳ trên bề mặt model để hiển thị khoảng cách.</div>
                        </div>
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">🔲</span>
                                <span class="help-card-name">Wireframe</span>
                            </div>
                            <div class="help-card-desc">Chuyển sang chế độ hiển thị khung lưới (wireframe) để thấy cấu trúc polygon của model.</div>
                        </div>
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">💥</span>
                                <span class="help-card-name">Explode</span>
                            </div>
                            <div class="help-card-desc">Mở Section Panel → dùng thanh Explode để tách rời các part của model theo hướng tâm.</div>
                        </div>
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">🌳</span>
                                <span class="help-card-name">Object Tree</span>
                            </div>
                            <div class="help-card-desc">Khi chọn một part, Tree Panel sẽ hiển thị cây cấu trúc phân cấp của scene.</div>
                        </div>
                    </div>
                </div>

                <!-- Section -->
                <div class="help-pane" id="pane-section">
                    <div class="help-section-title">Section View — Cắt mặt phẳng</div>
                    <div class="help-tips">
                        <div class="help-tip">
                            <span class="help-tip-icon">1️⃣</span>
                            <span class="help-tip-text">Mở <strong>Section Panel</strong> từ toolbar, chọn trục cắt: X, Y hoặc Z.</span>
                        </div>
                        <div class="help-tip">
                            <span class="help-tip-icon">2️⃣</span>
                            <span class="help-tip-text">Kéo thanh <strong>Position</strong> để di chuyển mặt phẳng cắt theo chiều dọc/ngang.</span>
                        </div>
                        <div class="help-tip">
                            <span class="help-tip-icon">↕️</span>
                            <span class="help-tip-text">Nhấn <strong>⇅ Flip</strong> để đảo chiều cắt — hiện phần dưới thay vì phần trên.</span>
                        </div>
                        <div class="help-tip">
                            <span class="help-tip-icon">⬡</span>
                            <span class="help-tip-text">Nhấn <strong>⬡ Helper</strong> để hiện mặt phẳng cắt trực quan màu cyan trong 3D viewport.</span>
                        </div>
                        <div class="help-tip">
                            <span class="help-tip-icon">↺</span>
                            <span class="help-tip-text">Nhấn <strong>↺ Reset</strong> để xóa toàn bộ clipping planes, trở về view đầy đủ.</span>
                        </div>
                    </div>
                </div>

                <!-- Annotation -->
                <div class="help-pane" id="pane-annotation">
                    <div class="help-section-title">Ghi chú 3D (Annotation Pin)</div>
                    <div class="help-tips">
                        <div class="help-tip">
                            <span class="help-tip-icon">1️⃣</span>
                            <span class="help-tip-text">Nhấn nút <strong>📌 Ghi chú</strong> trên toolbar để bật chế độ ghim (con trỏ đổi thành crosshair).</span>
                        </div>
                        <div class="help-tip">
                            <span class="help-tip-icon">2️⃣</span>
                            <span class="help-tip-text">Click vào bất kỳ điểm nào trên bề mặt model — hộp thoại nhập text sẽ xuất hiện.</span>
                        </div>
                        <div class="help-tip">
                            <span class="help-tip-icon">3️⃣</span>
                            <span class="help-tip-text">Nhập nội dung ghi chú, nhấn <strong>Add Pin</strong> hoặc <strong>Enter</strong> để xác nhận.</span>
                        </div>
                        <div class="help-tip">
                            <span class="help-tip-icon">✕</span>
                            <span class="help-tip-text">Hover vào label, nhấn nút <strong>✕</strong> để xóa từng ghi chú riêng lẻ.</span>
                        </div>
                        <div class="help-tip">
                            <span class="help-tip-icon">🗑️</span>
                            <span class="help-tip-text">Nhấn nút <strong>Xóa pin</strong> trên toolbar để xóa toàn bộ annotations cùng lúc.</span>
                        </div>
                    </div>
                </div>

                <!-- Multi-Model -->
                <div class="help-pane" id="pane-models">
                    <div class="help-section-title">Quản lý nhiều Model</div>
                    <div class="help-tips">
                        <div class="help-tip">
                            <span class="help-tip-icon">📂</span>
                            <span class="help-tip-text">Nhấn <strong>Mở File</strong> và chọn nhiều file cùng lúc — mỗi file sẽ được load và thêm vào scene riêng biệt.</span>
                        </div>
                        <div class="help-tip">
                            <span class="help-tip-icon">☰</span>
                            <span class="help-tip-text">Nhấn nút <strong>Models</strong> trên toolbar để mở danh sách các model đã tải.</span>
                        </div>
                        <div class="help-tip">
                            <span class="help-tip-icon">👁️</span>
                            <span class="help-tip-text">Checkbox 👁 trong danh sách để <strong>ẩn/hiện</strong> từng model mà không xóa khỏi scene.</span>
                        </div>
                        <div class="help-tip">
                            <span class="help-tip-icon">⊙</span>
                            <span class="help-tip-text">Nhấn nút <strong>⊙ Focus</strong> để camera zoom vào và căn giữa model đó.</span>
                        </div>
                        <div class="help-tip">
                            <span class="help-tip-icon">✕</span>
                            <span class="help-tip-text">Nhấn <strong>✕ Remove</strong> để xóa hẳn một model khỏi scene và giải phóng bộ nhớ.</span>
                        </div>
                    </div>
                </div>

                <!-- Phím tắt -->
                <div class="help-pane" id="pane-shortcuts">
                    <div class="help-section-title">Phím tắt</div>
                    <table class="help-shortcuts">
                        <thead>
                            <tr>
                                <th>Phím</th>
                                <th>Chức năng</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">S</kbd></td>
                                <td>Chụp ảnh màn hình (Screenshot)</td>
                            </tr>
                            <tr>
                                <td><kbd class="kbd">Esc</kbd></td>
                                <td>Hủy ghi chú / hủy modal đang mở</td>
                            </tr>
                            <tr>
                                <td><kbd class="kbd">Enter</kbd></td>
                                <td>Xác nhận thêm ghi chú</td>
                            </tr>
                            <tr>
                                <td><kbd class="kbd">Chuột trái</kbd> kéo</td>
                                <td>Xoay model (Orbit)</td>
                            </tr>
                            <tr>
                                <td><kbd class="kbd">Chuột phải</kbd> kéo</td>
                                <td>Di chuyển camera (Pan)</td>
                            </tr>
                            <tr>
                                <td><kbd class="kbd">Cuộn</kbd></td>
                                <td>Zoom in / Zoom out</td>
                            </tr>
                            <tr>
                                <td><kbd class="kbd">Double click</kbd></td>
                                <td>Chọn part và zoom vào điểm đó</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Định dạng -->
                <div class="help-pane" id="pane-formats">
                    <div class="help-section-title">Định dạng hỗ trợ</div>
                    <div class="format-list">
                        <span class="format-badge gltf">GLTF</span>
                        <span class="format-badge glb">GLB</span>
                        <span class="format-badge stl">STL</span>
                        <span class="format-badge obj">OBJ</span>
                        <span class="format-badge step">STEP / STP</span>
                    </div>
                    <div class="help-cards">
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">🏆</span>
                                <span class="help-card-name">GLTF / GLB</span>
                            </div>
                            <div class="help-card-desc">Định dạng 3D hiện đại nhất. Hỗ trợ đầy đủ: materials PBR, texture, animation, skinning. <strong>Khuyến nghị sử dụng.</strong></div>
                            <div class="help-card-desc" style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #eee; font-size: 12px; color: #e67e22;">
                                <strong>Lưu ý:</strong> File <code>.gltf</code> thường có file <code>.bin</code> đi kèm. Khi dùng nút <strong>Open</strong>, chọn đồng thời cả <code>.gltf</code> + <code>.bin</code> + texture (nếu có).
                            </div>
                        </div>
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">🔩</span>
                                <span class="help-card-name">STL</span>
                            </div>
                            <div class="help-card-desc">Định dạng phổ biến trong 3D printing. Chỉ chứa geometry, không có màu sắc hay material.</div>
                        </div>
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">📐</span>
                                <span class="help-card-name">OBJ</span>
                            </div>
                            <div class="help-card-desc">Định dạng cổ điển, tương thích rộng. Hỗ trợ material MTL đính kèm.</div>
                        </div>
                        <div class="help-card">
                            <div class="help-card-header">
                                <span class="help-card-icon">⚙️</span>
                                <span class="help-card-name">STEP / STP</span>
                            </div>
                            <div class="help-card-desc">Định dạng CAD chuẩn ISO. Hỗ trợ solid geometry từ phần mềm CAD (SolidWorks, CATIA, Fusion 360...).</div>
                        </div>
                    </div>
                    <div class="help-tips">
                        <div class="help-tip">
                            <span class="help-tip-icon">💡</span>
                            <span class="help-tip-text">Với file STEP lớn, quá trình phân tích geometry có thể mất vài giây. Thanh tiến trình sẽ hiển thị trong quá trình tải.</span>
                        </div>
                    </div>
                </div>

            </div><!-- /help-content -->
        </div><!-- /help-body -->

        <!-- Footer -->
        <div class="help-footer">
            <span class="help-footer-text">CAD Viewer v1.0 · WebGL · Three.js r160</span>
            <button class="btn-footer" id="help-modal-close2" style="padding: 8px 24px; font-size: 13px;">Đã hiểu</button>
        </div>

    </div><!-- /help-dialog -->
</div><!-- /help-modal -->

<script type="module" src="./js/main.js?v=2"></script>
<script type="module">
import { initAnalyzeTab } from './js/intro/analyzeTab.js?v=2';
initAnalyzeTab();
</script>

</body>
</html>