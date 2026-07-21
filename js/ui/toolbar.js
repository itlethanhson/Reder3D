export function createToolbar() {

    const toolbar = document.getElementById('toolbar');

    toolbar.innerHTML = `

<!-- ======= GROUP: File ======= -->
<div class="tb-group" data-label="File">
    <button id="open-btn" class="tb-btn tb-btn--accent" data-tooltip="Mở file 3D (.GLB)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span>Mở File</span>
    </button>
    <button id="models-btn" class="tb-btn" data-tooltip="Danh sách model đã tải">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        <span>Models</span>
    </button>
    <button id="tree-btn" class="tb-btn" data-tooltip="Cây cấu trúc đối tượng">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M5 3v18M9 3l4 6h-3v6h-2M18 15l-3-3h2V9h-2l3-3"/>
        </svg>
        <span>Cây</span>
    </button>
    <button id="property-btn" class="tb-btn" data-tooltip="Thông tin thuộc tính đối tượng">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span>Thông tin</span>
    </button>
</div>

<div class="tb-sep"></div>

<!-- ======= GROUP: View Camera ======= -->
<div class="tb-group" data-label="Camera">
    <button id="home-btn" class="tb-btn" data-tooltip="Về góc nhìn mặc định (Home)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Home</span>
    </button>
    <button id="front-btn" class="tb-btn" data-tooltip="Góc nhìn từ phía trước (Front)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <rect x="3" y="3" width="18" height="18" rx="2.5"/>
            <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
        <span>Front</span>
    </button>
    <button id="iso-btn" class="tb-btn" data-tooltip="Góc nhìn isometric (Iso)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span>Iso</span>
    </button>
    <button id="rotate-btn" class="tb-btn" data-tooltip="Tự động xoay model">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        <span>Xoay</span>
    </button>
</div>

<div class="tb-sep"></div>

<!-- ======= GROUP: Display ======= -->
<div class="tb-group" data-label="Hiển thị">
    <button id="wireframe-btn" class="tb-btn" data-tooltip="Chuyển sang chế độ Wireframe">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
            <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="8.5" x2="22" y2="8.5"/>
            <line x1="2" y1="15.5" x2="22" y2="15.5"/>
        </svg>
        <span>Wireframe</span>
    </button>
    <button id="section-btn" class="tb-btn" data-tooltip="Xem mặt cắt ngang (Section View)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="2" x2="12" y2="22"/>
        </svg>
        <span>Mặt cắt</span>
    </button>
    <button id="perf-btn" class="tb-btn" data-tooltip="Bảng điều khiển hiệu năng & LOD">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M3 12a9 9 0 0 1 15 0"/>
            <path d="M12 17V11"/>
            <circle cx="12" cy="17" r="1"/>
        </svg>
        <span>Hiệu năng</span>
    </button>
</div>

<div class="tb-sep"></div>

<!-- ======= GROUP: Tools ======= -->
<div class="tb-group" data-label="Công cụ">
    <button id="measure-btn" class="tb-btn" data-tooltip="Đo khoảng cách giữa 2 điểm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M2 12h20M2 6l4 6-4 6M22 6l-4 6 4 6"/>
        </svg>
        <span>Đo</span>
    </button>
    <button id="explode-btn" class="tb-btn" data-tooltip="Rã tách các chi tiết lắp ráp (Explode)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M6 14l6 3 6-3" opacity="0.6"/>
            <path d="M4 19l8 4 8-4"/>
        </svg>
        <span>Rã tách</span>
    </button>
    <button id="annotation-btn" class="tb-btn" data-tooltip="Ghim ghi chú vào bề mặt model">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
        </svg>
        <span>Ghi chú</span>
    </button>
    <button id="clear-annotations-btn" class="tb-btn tb-btn--danger-ghost" data-tooltip="Xóa tất cả ghi chú">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
        </svg>
        <span>Xóa pin</span>
    </button>
    <button id="parametric-btn" class="tb-btn" data-tooltip="Tùy chỉnh và tạo vật thể 3D">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
        </svg>
        <span>Tùy chỉnh</span>
    </button>
    <button id="download-btn" class="tb-btn" data-tooltip="Chụp ảnh màn hình (Ctrl+S)" disabled>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>Screenshot</span>
    </button>
</div>

<div class="tb-sep"></div>

<!-- ======= Help Button ======= -->
<div class="tb-group">
    <button id="help-btn" class="tb-btn tb-btn--help" data-tooltip="Hướng dẫn sử dụng">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>Hướng dẫn</span>
    </button>
</div>

<!-- ======= Toggle Handle ======= -->
<div id="tb-toggle-handle" data-tooltip="Thu gọn / Mở rộng thanh công cụ">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="18 15 12 9 6 15"/>
    </svg>
</div>

`;

}