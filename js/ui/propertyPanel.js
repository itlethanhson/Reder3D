// js/ui/propertyPanel.js
import * as THREE from 'three';

/**
 * Parse tham số từ tên file STEP kiểu: SER11-D10-L100-E10-F10-A5-B5-P8-Q6-S10
 * Quy ước: SER=Series, D=Diameter, L=Length, E=Edge, F=Flange, A=Angle,
 *          B=Base, P=Pitch, Q=Quality, S=Step, R=Radius, H=Height, W=Width, T=Thickness
 */
const PARAM_MAP = {
    SER: ['Series', ''],
    D: ['Đường kính', 'mm'],
    L: ['Chiều dài', 'mm'],
    E: ['Cạnh/Mép', 'mm'],
    F: ['Mặt bích', 'mm'],
    A: ['Góc', '°'],
    B: ['Đế', 'mm'],
    P: ['Bước', 'mm'],
    Q: ['Chất lượng', ''],
    S: ['Bước răng', 'mm'],
    R: ['Bán kính', 'mm'],
    H: ['Chiều cao', 'mm'],
    W: ['Chiều rộng', 'mm'],
    T: ['Độ dày', 'mm'],
    OD: ['ĐK ngoài', 'mm'],
    ID: ['ĐK trong', 'mm'],
    N: ['Số lượng', ''],
    C: ['Vát mép', 'mm'],
};

function parseModelParams(name) {
    if (!name) return null;
    // Tách tên file bỏ đuôi .stp/.step/.glb...
    const baseName = name.replace(/\.[^.]+$/, '');
    // Regex: bắt cặp [chữ]+[số]+ (có thể có dấu chấm)
    const regex = /([A-Z]+)(\d+(?:\.\d+)?)/g;
    const params = [];
    let match;
    while ((match = regex.exec(baseName)) !== null) {
        const key = match[1];
        const val = match[2];
        const info = PARAM_MAP[key];
        if (info) {
            params.push({ key, label: info[0], value: val, unit: info[1] });
        } else {
            params.push({ key, label: key, value: val, unit: '' });
        }
    }
    return params.length > 0 ? params : null;
}

function findRootModel(object) {
    let current = object;
    while (current.parent && current.parent.type === 'Group') {
        current = current.parent;
    }
    return current;
}

function getParentChain(object) {
    const chain = [];
    let current = object;
    while (current) {
        chain.unshift(current);
        current = current.parent;
    }
    return chain;
}

function getBBoxSize(object) {
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    return {
        width: +size.x.toFixed(2),
        height: +size.y.toFixed(2),
        depth: +size.z.toFixed(2),
        centerX: +center.x.toFixed(2),
        centerY: +center.y.toFixed(2),
        centerZ: +center.z.toFixed(2),
        isEmpty: box.isEmpty()
    };
}

function countDescendants(object) {
    let count = 0;
    object.traverse(() => count++);
    return count - 1; // trừ chính nó
}

export class PropertyPanel {

    constructor(containerId = "property-panel") {
        this.container = document.getElementById(containerId);
        this._lastObject = null;
        this._enabled = false;
    }

    toggle(object) {
        this._enabled = !this._enabled;
        if (this._enabled) {
            if (object) this._lastObject = object;
            this.show(this._lastObject);
        } else {
            this.container.style.display = 'none';
        }
    }

    clear() {
        this.container.innerHTML = `
            <div class="prop-panel-header">
                <span class="prop-panel-title">📋 Thuộc tính</span>
                <button class="prop-panel-close" data-panel="property" title="Đóng">✕</button>
            </div>
            <div class="prop-empty">Chọn một đối tượng để xem thuộc tính</div>
        `;
        this.container.style.display = 'none';
        this._enabled = false;
    }

    show(object) {
        this._lastObject = object;
        if (!object) { this.clear(); return; }
        // Tự động bật panel khi có object được chọn
        if (!this._enabled) this._enabled = true;

        const geometry = object.geometry;
        let vertices = 0, faces = 0;
        if (geometry && geometry.attributes.position) {
            vertices = geometry.attributes.position.count;
            faces = geometry.index ? geometry.index.count / 3 : vertices / 3;
        }

        const bbox = getBBoxSize(object);
        const rootModel = findRootModel(object);
        const rootName = rootModel ? rootModel.name : '-';
        const modelParams = parseModelParams(rootName);
        const parentChain = getParentChain(object);
        const childCount = countDescendants(object);

        // Material info
        let materialType = '-', materialColor = '-', materialColorHex = '';
        if (object.material) {
            const mat = Array.isArray(object.material) ? object.material[0] : object.material;
            materialType = mat.type || '-';
            if (mat.color) {
                materialColorHex = '#' + mat.color.getHexString();
                materialColor = materialColorHex;
            }
        }

        // Build HTML
        let html = `
            <div class="prop-panel-header">
                <span class="prop-panel-title">📋 Thuộc tính</span>
                <button class="prop-panel-close" data-panel="property" title="Đóng">✕</button>
            </div>

            <div class="prop-scroll">

            <!-- ── Thông tin đối tượng ── -->
            <div class="prop-section">
                <div class="prop-section-title">🔍 Đối tượng</div>
                <table class="prop-table">
                    <tr><td class="prop-label">Tên</td><td class="prop-value prop-name">${object.name || '-'}</td></tr>
                    <tr><td class="prop-label">Loại</td><td class="prop-value"><span class="prop-tag">${object.type}</span></td></tr>
                    <tr><td class="prop-label">Hiển thị</td><td class="prop-value">${object.visible ? '✅ Có' : '❌ Ẩn'}</td></tr>
                </table>
            </div>

            <!-- ── Model gốc ── -->
            <div class="prop-section">
                <div class="prop-section-title">📦 Model</div>
                <table class="prop-table">
                    <tr><td class="prop-label">Tên model</td><td class="prop-value prop-name">${rootName}</td></tr>`;

        // Nếu parse được tham số từ tên model
        if (modelParams && modelParams.length > 0) {
            for (const p of modelParams) {
                html += `<tr>
                    <td class="prop-label">${p.label}</td>
                    <td class="prop-value">${p.value}${p.unit ? ' ' + p.unit : ''}</td>
                </tr>`;
            }
        }

        html += `</table></div>`;

        // ── Kích thước ──
        if (!bbox.isEmpty) {
            html += `
            <div class="prop-section">
                <div class="prop-section-title">📐 Kích thước (BBox)</div>
                <table class="prop-table">
                    <tr><td class="prop-label">Rộng (X)</td><td class="prop-value prop-dim">${bbox.width} mm</td></tr>
                    <tr><td class="prop-label">Cao (Y)</td><td class="prop-value prop-dim">${bbox.height} mm</td></tr>
                    <tr><td class="prop-label">Sâu (Z)</td><td class="prop-value prop-dim">${bbox.depth} mm</td></tr>
                    <tr><td class="prop-label">Tâm</td><td class="prop-value">(${bbox.centerX}, ${bbox.centerY}, ${bbox.centerZ})</td></tr>
                </table>
            </div>`;
        }

        // ── Vị trí & Biến đổi ──
        html += `
            <div class="prop-section">
                <div class="prop-section-title">📍 Biến đổi</div>
                <table class="prop-table">
                    <tr><td class="prop-label">Vị trí</td><td class="prop-value">(${object.position.x.toFixed(2)}, ${object.position.y.toFixed(2)}, ${object.position.z.toFixed(2)})</td></tr>
                    <tr><td class="prop-label">Xoay</td><td class="prop-value">(${object.rotation.x.toFixed(2)}, ${object.rotation.y.toFixed(2)}, ${object.rotation.z.toFixed(2)})</td></tr>
                    <tr><td class="prop-label">Tỉ lệ</td><td class="prop-value">(${object.scale.x.toFixed(2)}, ${object.scale.y.toFixed(2)}, ${object.scale.z.toFixed(2)})</td></tr>
                </table>
            </div>`;

        // ── Vật liệu ──
        html += `
            <div class="prop-section">
                <div class="prop-section-title">🎨 Vật liệu</div>
                <table class="prop-table">
                    <tr><td class="prop-label">Shader</td><td class="prop-value">${materialType}</td></tr>`;

        if (materialColorHex) {
            html += `<tr><td class="prop-label">Màu</td><td class="prop-value"><span class="prop-color-swatch" style="background:${materialColorHex}"></span> ${materialColor}</td></tr>`;
        }

        html += `</table></div>`;

        // ── Thống kê ──
        html += `
            <div class="prop-section">
                <div class="prop-section-title">📊 Thống kê</div>
                <table class="prop-table">
                    <tr><td class="prop-label">Đỉnh</td><td class="prop-value">${vertices.toLocaleString()}</td></tr>
                    <tr><td class="prop-label">Mặt</td><td class="prop-value">${faces.toLocaleString()}</td></tr>
                    <tr><td class="prop-label">Con</td><td class="prop-value">${childCount}</td></tr>
                </table>
            </div>`;

        // ── Đường dẫn phân cấp ──
        if (parentChain.length > 1) {
            html += `
            <div class="prop-section">
                <div class="prop-section-title">🌳 Phân cấp</div>
                <div class="prop-hierarchy">`;
            for (let i = 0; i < parentChain.length; i++) {
                const node = parentChain[i];
                if (i > 0) html += `<span class="prop-hier-arrow">›</span>`;
                const isSelected = (i === parentChain.length - 1);
                html += `<span class="prop-hier-node${isSelected ? ' prop-hier-current' : ''}">${node.name || node.type}</span>`;
            }
            html += `</div></div>`;
        }

        html += `</div><!-- /prop-scroll -->`;

        this.container.innerHTML = html;

        // Bind close button
        const closeBtn = this.container.querySelector('.prop-panel-close');
        if (closeBtn) {
            closeBtn.onclick = () => { this.container.style.display = 'none'; this._enabled = false; };
        }

        this.container.style.display = this._enabled ? 'block' : 'none';
    }
}
