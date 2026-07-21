import { getShapeTypes, getShapeMetadata, getDefaultParams, build, MaterialPresets } from './parametricBuilder.js';
import { getPresets, getPresetData } from './parametricPresets.js';
import { saveProfile, listProfiles, loadProfile, deleteProfile } from './profileManager.js';

let _panel = null;
let _visible = false;
let _currentShapeId = null;
let _currentMaterial = 'steel';
let _currentParams = {};
let _onGenerate = null;
let _onVisibilityChange = null;
let _onView3D = null;
let _debounceTimer = null;
let _suppressAutoGenerate = false;

function _scheduleRender() {
    if (_suppressAutoGenerate) return;
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => _generate(), 100);
}

function createPanel() {
    if (_panel) return _panel;

    const panel = document.createElement('div');
    panel.id = 'parametric-panel';
    panel.innerHTML = `
        <div class="parametric-header">
            <div class="parametric-title">
                <span class="parametric-title-icon">📐</span>
                Cấu hình
            </div>
        </div>
        <div class="parametric-body">
            <div class="parametric-section">
                <div class="parametric-section-label">Kiểu vật thể</div>
                <select class="parametric-select" id="parametric-shape-select"></select>
            </div>
            <div class="parametric-section">
                <div class="parametric-section-label">Tham số</div>
                <div class="parametric-params" id="parametric-params-container"></div>
            </div>
            <div class="parametric-section">
                <div class="parametric-section-label">Vật liệu</div>
                <div class="material-presets" id="parametric-material-list"></div>
            </div>
            <div class="parametric-section">
                <div class="parametric-section-label">Mẫu nhanh</div>
                <div id="parametric-presets-list" style="display:flex;flex-wrap:wrap;gap:6px;"></div>
            </div>
            <div class="parametric-section">
                <div class="parametric-section-label">Mã sản phẩm</div>
                <div class="parametric-partno" id="parametric-partno">---</div>
            </div>
            <div class="parametric-section">
                <div class="parametric-section-label">Tên profile</div>
                <div style="display:flex;gap:6px;">
                    <input type="text" class="parametric-select" id="parametric-profile-name" placeholder="Nhập tên để lưu..." style="flex:1;">
                </div>
            </div>
        </div>
        <div class="parametric-footer" style="flex-direction:column;gap:8px;">
            <button class="parametric-btn parametric-btn-view" id="parametric-view3d-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                Xem 3D
            </button>
            <div style="display:flex;gap:6px;">
                <button class="parametric-btn parametric-btn-reset" id="parametric-load-btn" style="flex:1;">📂</button>
                <button class="parametric-btn parametric-btn-reset" id="parametric-reset-btn" style="flex:1;">↺</button>
                <button class="parametric-btn parametric-btn-generate" id="parametric-save-btn" style="flex:1;">💾</button>
                <button class="parametric-btn parametric-btn-generate" id="parametric-generate-btn" style="flex:1;" title="Tạo nhanh">✓</button>
            </div>
        </div>
    `;

    document.querySelector('#config-sidebar')?.appendChild(panel);
    _panel = panel;

    // Bind events
    panel.querySelector('#parametric-view3d-btn').onclick = () => {
        _generate();                          // Luôn generate model
        if (_onView3D) _onView3D();           // Unlock viewer sau khi generate
    };
    panel.querySelector('#parametric-generate-btn').onclick = () => _generate();
    panel.querySelector('#parametric-reset-btn').onclick = () => _resetToDefaults();
    panel.querySelector('#parametric-save-btn').onclick = () => _handleSave();
    panel.querySelector('#parametric-load-btn').onclick = () => _handleLoad();

    // Shape selector change — chỉ cập nhật params, KHÔNG auto-generate
    panel.querySelector('#parametric-shape-select').onchange = (e) => {
        _currentShapeId = e.target.value;
        _currentParams = getDefaultParams(_currentShapeId);
        _renderParams();
        _renderPresets();
        _updatePartNumber();
    };

    // Build material buttons
    _buildMaterialButtons(panel.querySelector('#parametric-material-list'));

    return _panel;
}

function _buildMaterialButtons(container) {
    container.innerHTML = '';
    for (const [key, preset] of Object.entries(MaterialPresets)) {
        const btn = document.createElement('button');
        btn.className = 'material-preset' + (key === _currentMaterial ? ' active' : '');
        btn.innerHTML = `<span class="material-swatch" style="background:${preset.color}"></span>${preset.name}`;
        btn.dataset.key = key;
        btn.onclick = () => {
            _currentMaterial = key;
            container.querySelectorAll('.material-preset').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            _updatePartNumber();
        };
        container.appendChild(btn);
    }
}

// ─── Part Number Generator ──────────────────────────

const SHAPE_CODES = { tube: 'TUB', flange: 'FLG', steppedShaft: 'SHF', basePlate: 'PLT', adjusterPad: 'ADJ' };
const MAT_CODES = { steel: 'ST', aluminum: 'AL', brass: 'BR', plastic: 'PL', copper: 'CU', titanium: 'TI' };

function _updatePartNumber() {
    const el = _panel?.querySelector('#parametric-partno');
    if (!el) return;
    const shapeCode = SHAPE_CODES[_currentShapeId] || _currentShapeId?.substring(0, 3).toUpperCase() || '???';
    const matCode = MAT_CODES[_currentMaterial] || _currentMaterial?.substring(0, 2).toUpperCase() || '??';

    // Build param segments
    const parts = [shapeCode];
    const meta = getShapeMetadata(_currentShapeId);
    if (meta && _currentParams) {
        for (const p of meta.params) {
            const val = _currentParams[p.key];
            if (val !== undefined && val !== null) {
                parts.push(p.key.charAt(0).toUpperCase() + val);
            }
        }
    }
    parts.push(matCode);
    el.textContent = parts.join('-');
}

function _renderPresets() {
    const container = _panel?.querySelector('#parametric-presets-list');
    if (!container) return;

    const presets = getPresets().filter(p => p.shapeId === _currentShapeId);
    container.innerHTML = '';

    if (presets.length === 0) {
        container.innerHTML = '<span style="font-size:11px;color:#9ca3af;">Không có mẫu cho kiểu này</span>';
        return;
    }

    for (const preset of presets) {
        const data = getPresetData(preset.id);
        if (!data) continue;

        const btn = document.createElement('button');
        btn.style.cssText = 'padding:5px 10px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;font-size:11px;cursor:pointer;font-family:inherit;transition:all .15s;';
        btn.textContent = preset.name;
        btn.title = preset.name;
        btn.onmouseenter = () => { btn.style.borderColor = '#09a2a5'; btn.style.background = 'rgba(9,162,165,.05)'; };
        btn.onmouseleave = () => { btn.style.borderColor = '#e5e7eb'; btn.style.background = '#fff'; };
        btn.onclick = () => {
            _currentShapeId = data.shapeId;
            _currentMaterial = data.material;
            _currentParams = { ...data.params };

            // Update selector
            const sel = _panel?.querySelector('#parametric-shape-select');
            if (sel) sel.value = _currentShapeId;

            // Update material buttons
            const matList = _panel?.querySelector('#parametric-material-list');
            if (matList) {
                matList.querySelectorAll('.material-preset').forEach(b => {
                    b.classList.toggle('active', b.dataset.key === _currentMaterial);
                });
            }

            _renderParams();
            _generate();
        };
        container.appendChild(btn);
    }
}

function _renderParams() {
    const container = _panel?.querySelector('#parametric-params-container');
    if (!container) return;

    const meta = getShapeMetadata(_currentShapeId);
    if (!meta) { container.innerHTML = ''; return; }

    const count = _currentParams.stepCount || 1;
    let html = '';

    for (const p of meta.params) {
        // Hide params for steps beyond stepCount
        const stepMatch = p.key.match(/^(diameter|length|chamfer)(\d+)$/);
        if (stepMatch) {
            const stepNum = parseInt(stepMatch[2]);
            if (stepNum > count) continue;
        }

        const val = _currentParams[p.key] ?? p.default;
        html += `
            <div class="param-row" data-key="${p.key}">
                <div class="param-label">
                    <span>${p.label}</span>
                    <span class="param-value" id="param-val-${p.key}">${val}${p.unit ? ' ' + p.unit : ''}</span>
                </div>
                <div class="param-input-row">
                    <input type="range" class="param-slider" data-key="${p.key}"
                        min="${p.min}" max="${p.max}" step="${p.step}" value="${val}">
                    <input type="number" class="param-number" data-key="${p.key}"
                        min="${p.min}" max="${p.max}" step="${p.step}" value="${val}">
                    ${p.unit ? `<span class="param-unit">${p.unit}</span>` : ''}
                </div>
            </div>`;
    }

    container.innerHTML = html;

    // Bind slider + number inputs
    container.querySelectorAll('.param-slider').forEach(slider => {
        slider.oninput = () => {
            const key = slider.dataset.key;
            const val = parseFloat(slider.value);
            _currentParams[key] = val;
            const numInput = container.querySelector(`.param-number[data-key="${key}"]`);
            if (numInput) numInput.value = val;
            _updateValueDisplay(key, val);
            _updatePartNumber();
            if (key === 'stepCount') _renderParams();
        };
    });

    container.querySelectorAll('.param-number').forEach(input => {
        input.onchange = () => {
            const key = input.dataset.key;
            const val = parseFloat(input.value);
            if (isNaN(val)) return;
            _currentParams[key] = Math.max(
                parseFloat(input.min),
                Math.min(parseFloat(input.max), val)
            );
            input.value = _currentParams[key];
            const slider = container.querySelector(`.param-slider[data-key="${key}"]`);
            if (slider) slider.value = _currentParams[key];
            _updateValueDisplay(key, _currentParams[key]);
            _updatePartNumber();
            if (key === 'stepCount') _renderParams();
        };
    });
}

function _updateValueDisplay(key, val) {
    const meta = getShapeMetadata(_currentShapeId);
    const p = meta?.params.find(pp => pp.key === key);
    if (!p) return;
    const el = _panel?.querySelector(`#param-val-${key}`);
    if (el) el.textContent = `${val}${p.unit ? ' ' + p.unit : ''}`;
}

function _resetToDefaults() {
    _currentParams = getDefaultParams(_currentShapeId);
    _updatePartNumber();
    _renderParams();
}

function _generate() {
    const group = build(_currentShapeId, _currentParams, _currentMaterial);
    if (group && _onGenerate) {
        _onGenerate(group, _currentShapeId, _currentMaterial);
    }
}

// ─── Save / Load Profile ─────────────────────────────

let _currentSlug = null;

function _getProfileName() {
    const input = _panel?.querySelector('#parametric-profile-name');
    return input?.value?.trim() || ('CAD_' + new Date().toISOString().slice(0, 10));
}

async function _handleSave() {
    const saveBtn = _panel?.querySelector('#parametric-save-btn');
    const name = _getProfileName();
    if (!saveBtn) return;
    saveBtn.textContent = '⏳...';
    saveBtn.disabled = true;
    try {
        const result = await saveProfile({
            name,
            shapeId: _currentShapeId,
            material: _currentMaterial,
            params: _currentParams,
            slug: _currentSlug || undefined
        });
        _currentSlug = result.slug;
        alert('✅ ' + result.message + ': ' + name);
    } catch (e) {
        alert('❌ Lỗi: ' + e.message);
    } finally {
        saveBtn.textContent = '💾 Lưu';
        saveBtn.disabled = false;
    }
}

async function _handleLoad() {
    const loadBtn = _panel?.querySelector('#parametric-load-btn');
    if (!loadBtn) return;
    loadBtn.textContent = '⏳...';
    loadBtn.disabled = true;
    try {
        const profiles = await listProfiles();
        _showProfilePicker(profiles);
    } catch (e) {
        alert('❌ Lỗi: ' + e.message);
    } finally {
        loadBtn.textContent = '📂 Tải';
        loadBtn.disabled = false;
    }
}

function _showProfilePicker(profiles) {
    // Remove any existing picker
    const old = _panel?.querySelector('#parametric-profile-picker');
    if (old) old.remove();

    if (!profiles.length) {
        alert('Chưa có profile nào được lưu.');
        return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'parametric-profile-picker';
    overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.4);z-index:200;display:flex;align-items:center;justify-content:center;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    let html = '<div style="background:#fff;border-radius:12px;width:85%;max-height:70%;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.2);">';
    html += '<div style="padding:12px 16px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">';
    html += '<span style="font-weight:700;font-size:14px;">📂 Profile đã lưu</span>';
    html += '<button style="background:none;border:none;font-size:16px;cursor:pointer;color:#6b7280;" id="profile-picker-close">✕</button>';
    html += '</div>';
    html += '<div style="max-height:350px;overflow-y:auto;padding:8px;">';

    for (const p of profiles) {
        html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #f3f4f6;cursor:pointer;border-radius:6px;"
            data-slug="${p.slug}" class="profile-item"
            onmouseenter="this.style.background='#f0fdfa'" onmouseleave="this.style.background=''">
            <div>
                <div style="font-weight:600;font-size:13px;">${p.name}</div>
                <div style="font-size:11px;color:#9ca3af;">${p.shapeId} · ${p.material} · ${p.date || ''}</div>
            </div>
            <button style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px;padding:4px 8px;"
                data-delete="${p.slug}" class="profile-delete-btn">🗑</button>
        </div>`;
    }

    html += '</div></div>';
    overlay.innerHTML = html;

    _panel.appendChild(overlay);

    // Bind close
    overlay.querySelector('#profile-picker-close').onclick = () => overlay.remove();

    // Bind click to load
    overlay.querySelectorAll('.profile-item').forEach(el => {
        el.onclick = async (e) => {
            if (e.target.closest('.profile-delete-btn')) return;
            const slug = el.dataset.slug;
            overlay.remove();
            await _loadProfileBySlug(slug);
        };
    });

    // Bind delete
    overlay.querySelectorAll('.profile-delete-btn').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            if (!confirm('Xóa profile này?')) return;
            try {
                await deleteProfile(btn.dataset.delete);
                overlay.remove();
                _handleLoad();
            } catch (err) {
                alert('Lỗi xóa: ' + err.message);
            }
        };
    });
}

async function _loadProfileBySlug(slug) {
    try {
        const profile = await loadProfile(slug);
        if (!profile) throw new Error('Không tìm thấy profile');

        _currentSlug = profile.slug;
        _currentShapeId = profile.shapeId;
        _currentMaterial = profile.material;
        _currentParams = { ...getDefaultParams(profile.shapeId), ...profile.params };

        // Update profile name input
        const nameInput = _panel?.querySelector('#parametric-profile-name');
        if (nameInput) nameInput.value = profile.name;

        // Update selector
        const sel = _panel?.querySelector('#parametric-shape-select');
        if (sel) sel.value = _currentShapeId;

        // Update material buttons
        const matList = _panel?.querySelector('#parametric-material-list');
        if (matList) {
            matList.querySelectorAll('.material-preset').forEach(b => {
                b.classList.toggle('active', b.dataset.key === _currentMaterial);
            });
        }

        _renderParams();
        _renderPresets();
        _generate();
    } catch (e) {
        alert('❌ Lỗi tải profile: ' + e.message);
    }
}

// ---- Public API ----

export function initPanel(onGenerate, onVisibilityChange) {
    _onGenerate = onGenerate;
    _onVisibilityChange = onVisibilityChange;
    const panel = createPanel();

    // Populate shape selector
    const select = panel.querySelector('#parametric-shape-select');
    const types = getShapeTypes();
    select.innerHTML = '';
    for (const t of types) {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = `${t.icon || ''} ${t.name}`;
        select.appendChild(opt);
    }

    // Suppress auto-generation during initialization
    _suppressAutoGenerate = true;
    if (types.length > 0) {
        _currentShapeId = types[0].id;
        _currentParams = getDefaultParams(_currentShapeId);
        select.value = _currentShapeId;
        _renderParams();
        _renderPresets();
        _updatePartNumber();
    }
    _suppressAutoGenerate = false;

    return _panel;
}

export function setOnView3D(callback) {
    _onView3D = callback;
}

export function show() {
    if (!_panel) return;
    _panel.classList.add('visible');
    _visible = true;
    _notifyVisibility();
}

export function hide() {
    if (!_panel) return;
    _panel.classList.remove('visible');
    _visible = false;
    _notifyVisibility();
}

export function toggle() {
    _visible ? hide() : show();
}

export function isVisible() {
    return _visible;
}

/**
 * Nạp profile vào panel mà KHÔNG tự động generate shape.
 * Dùng khi load model từ viewer — chỉ hiển thị tham số, chờ user bấm "Tạo".
 * @param {object} profile { shapeId, material, params, name? }
 */
export function populateProfile(profile) {
    if (!_panel || !profile) return;
    _suppressAutoGenerate = true;
    _currentShapeId = profile.shapeId || _currentShapeId;
    _currentMaterial = profile.material || 'steel';
    _currentParams = { ...getDefaultParams(_currentShapeId), ...profile.params };

    // Update name input
    if (profile.name) {
        const nameInput = _panel.querySelector('#parametric-profile-name');
        if (nameInput) nameInput.value = profile.name;
    }

    // Update selector
    const sel = _panel.querySelector('#parametric-shape-select');
    if (sel) sel.value = _currentShapeId;

    // Update material buttons
    const matList = _panel.querySelector('#parametric-material-list');
    if (matList) {
        matList.querySelectorAll('.material-preset').forEach(b => {
            b.classList.toggle('active', b.dataset.key === _currentMaterial);
        });
    }

    _renderParams();
    _renderPresets();
    _updatePartNumber();
    _suppressAutoGenerate = false;
    // KHÔNG gọi _generate() — để user tự bấm "Xem 3D"
}

function _refreshAll() {
    _renderParams();
    _renderPresets();
    _updatePartNumber();
}

/**
 * Load a profile from external source (analyze tab, URL, etc.)
 * @param {object} profile { shapeId, material, params, name? }
 */
export function loadExternalProfile(profile) {
    if (!_panel || !profile) return;
    _currentShapeId = profile.shapeId || _currentShapeId;
    _currentMaterial = profile.material || 'steel';
    _currentParams = { ...getDefaultParams(_currentShapeId), ...profile.params };

    // Update name input
    if (profile.name) {
        const nameInput = _panel.querySelector('#parametric-profile-name');
        if (nameInput) nameInput.value = profile.name;
    }

    // Update selector
    const sel = _panel.querySelector('#parametric-shape-select');
    if (sel) sel.value = _currentShapeId;

    // Update material buttons
    const matList = _panel.querySelector('#parametric-material-list');
    if (matList) {
        matList.querySelectorAll('.material-preset').forEach(b => {
            b.classList.toggle('active', b.dataset.key === _currentMaterial);
        });
    }

    _renderParams();
    _renderPresets();
    _updatePartNumber();
    _generate();

    // Show panel if hidden
    if (!_visible) show();
}

function _notifyVisibility() {
    if (typeof _onVisibilityChange === 'function') {
        _onVisibilityChange(_visible);
    }
}
