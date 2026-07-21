import { analyzeFile } from '../parametric/fileAnalyzer.js';
import { saveProfile, listProfiles, loadProfile, deleteProfile } from '../parametric/profileManager.js';

let _analyzedProfile = null;
let _analyzedFile = null;

export function initAnalyzeTab() {
    const dropZone = document.getElementById('analyze-drop-zone');
    const fileInput = document.getElementById('analyze-file-input');
    const resultsDiv = document.getElementById('analyze-results');
    const resultsBody = document.getElementById('analyze-results-body');
    const profileNameInput = document.getElementById('analyze-profile-name');
    const saveBtn = document.getElementById('analyze-save-btn');
    const loadBtn = document.getElementById('analyze-load-btn');
    const openBtn = document.getElementById('analyze-open-btn');

    if (!dropZone || !fileInput) return;

    // Click to upload
    dropZone.onclick = () => fileInput.click();

    // Drag & drop
    dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); };
    dropZone.ondragleave = () => dropZone.classList.remove('drag-over');
    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0]);
    };

    fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (file) handleFile(file);
    };

    // Save button
    if (saveBtn) {
        saveBtn.onclick = async () => {
            if (!_analyzedProfile) return alert('Vui lòng phân tích file trước.');
            saveBtn.textContent = '⏳...';
            saveBtn.disabled = true;
            try {
                const name = profileNameInput?.value?.trim() || _analyzedProfile.name;
                const result = await saveProfile({
                    name,
                    shapeId: _analyzedProfile.shapeId,
                    material: _analyzedProfile.material,
                    params: _analyzedProfile.params
                });
                alert('✅ Đã lưu: ' + name);
            } catch (e) {
                alert('❌ Lỗi: ' + e.message);
            } finally {
                saveBtn.textContent = '💾 Lưu vào DB';
                saveBtn.disabled = false;
            }
        };
    }

    // Load button
    if (loadBtn) {
        loadBtn.onclick = async () => {
            loadBtn.textContent = '⏳...';
            loadBtn.disabled = true;
            try {
                const profiles = await listProfiles();
                if (!profiles.length) { alert('Chưa có profile nào.'); return; }
                showProfileList(profiles);
            } catch (e) {
                alert('❌ Lỗi: ' + e.message);
            } finally {
                loadBtn.textContent = '📂 Tải từ DB';
                loadBtn.disabled = false;
            }
        };
    }

    // Open in viewer button
    if (openBtn) {
        openBtn.onclick = () => {
            if (!_analyzedProfile) return;
            const productPage = document.getElementById('product-page');
            const viewerModal = document.getElementById('viewer-modal');
            if (productPage) productPage.style.display = 'none';
            if (viewerModal) viewerModal.style.display = 'flex';
            // Dispatch custom event for viewer to handle
            window.dispatchEvent(new CustomEvent('analyze-open-viewer', {
                detail: { profile: _analyzedProfile, file: _analyzedFile }
            }));
        };
    }
}

async function handleFile(file) {
    const dropZone = document.getElementById('analyze-drop-zone');
    const resultsDiv = document.getElementById('analyze-results');
    const resultsBody = document.getElementById('analyze-results-body');
    const profileNameInput = document.getElementById('analyze-profile-name');
    const statusEl = document.getElementById('analyze-status');

    if (dropZone) dropZone.style.display = 'none';
    if (statusEl) { statusEl.style.display = 'block'; statusEl.textContent = '⏳ Đang phân tích ' + file.name + '...'; }

    try {
        _analyzedProfile = await analyzeFile(file);
        _analyzedFile = file;
        if (profileNameInput) profileNameInput.value = file.name.replace(/\.[^.]+$/, '');

        renderResults(_analyzedProfile);
        if (resultsDiv) resultsDiv.style.display = 'block';
    } catch (e) {
        alert('❌ Phân tích thất bại: ' + e.message);
        if (dropZone) dropZone.style.display = 'flex';
    } finally {
        if (statusEl) statusEl.style.display = 'none';
    }
}

function renderResults(profile) {
    const body = document.getElementById('analyze-results-body');
    const shapeLabel = document.getElementById('analyze-shape-label');
    const materialLabel = document.getElementById('analyze-material-label');

    if (!body) return;

    if (shapeLabel) shapeLabel.textContent = profile.shapeId;
    if (materialLabel) materialLabel.textContent = profile.material;

    // Bounding box info
    let html = '';
    if (profile.bbox) {
        html += `<div style="font-size:12px;color:#6b7280;margin-bottom:8px;">
            📐 Kích thước: ${profile.bbox.width} × ${profile.bbox.height} × ${profile.bbox.depth} mm
        </div>`;
    }

    // Params table
    html += '<table style="width:100%;font-size:12px;border-collapse:collapse;">';
    html += '<thead><tr style="background:#f9fafb;"><th style="padding:6px 8px;text-align:left;border-bottom:1px solid #e5e7eb;">Tham số</th><th style="padding:6px 8px;text-align:right;border-bottom:1px solid #e5e7eb;">Giá trị</th></tr></thead><tbody>';

    for (const [key, val] of Object.entries(profile.params)) {
        html += `<tr>
            <td style="padding:4px 8px;border-bottom:1px solid #f3f4f6;">${key}</td>
            <td style="padding:4px 8px;text-align:right;border-bottom:1px solid #f3f4f6;font-weight:600;font-family:monospace;">${val}</td>
        </tr>`;
    }

    html += '</tbody></table>';
    body.innerHTML = html;
}

function showProfileList(profiles) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:2000;display:flex;align-items:center;justify-content:center;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    let html = '<div style="background:#fff;border-radius:12px;width:400px;max-height:70vh;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.2);">';
    html += '<div style="padding:14px 20px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">';
    html += '<span style="font-weight:700;font-size:15px;">📂 Profile đã lưu</span>';
    html += '<button style="background:none;border:none;font-size:18px;cursor:pointer;color:#6b7280;" id="al-close">✕</button>';
    html += '</div>';
    html += '<div style="max-height:400px;overflow-y:auto;padding:8px;">';

    for (const p of profiles) {
        html += `<div style="padding:10px 14px;border-bottom:1px solid #f3f4f6;cursor:pointer;border-radius:6px;"
            data-slug="${p.slug}" class="al-item"
            onmouseenter="this.style.background='#f0fdfa'" onmouseleave="this.style.background=''">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="font-weight:600;font-size:13px;">${p.name}</div>
                    <div style="font-size:11px;color:#9ca3af;">${p.shapeId} · ${p.material}</div>
                </div>
                <button style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;padding:4px 8px;"
                    data-delete="${p.slug}" class="al-del-btn">🗑</button>
            </div>
        </div>`;
    }

    html += '</div></div>';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    overlay.querySelector('#al-close').onclick = () => overlay.remove();

    overlay.querySelectorAll('.al-item').forEach(el => {
        el.onclick = async (e) => {
            if (e.target.closest('.al-del-btn')) return;
            const slug = el.dataset.slug;
            overlay.remove();
            await loadProfileData(slug);
        };
    });

    overlay.querySelectorAll('.al-del-btn').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            if (!confirm('Xóa profile này?')) return;
            try {
                await deleteProfile(btn.dataset.delete);
                overlay.remove();
                // Reload list
                const updated = await listProfiles();
                showProfileList(updated);
            } catch (err) {
                alert('Lỗi: ' + err.message);
            }
        };
    });
}

async function loadProfileData(slug) {
    try {
        const profile = await loadProfile(slug);
        if (!profile) throw new Error('Không tìm thấy');
        _analyzedProfile = profile;

        const nameInput = document.getElementById('analyze-profile-name');
        if (nameInput) nameInput.value = profile.name;

        renderResults(profile);
        const resultsDiv = document.getElementById('analyze-results');
        if (resultsDiv) resultsDiv.style.display = 'block';
    } catch (e) {
        alert('❌ ' + e.message);
    }
}
