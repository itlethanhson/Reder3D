export class ModelListPanel {

    constructor() {

        this.models = []; // { id, name, object, visible }

        this._createDOM();

        this.visible = false;

    }

    _createDOM() {

        const panel = document.createElement('div');
        panel.id = 'model-list-panel';
        panel.innerHTML = `
            <div class="mlp-header">
                <span class="mlp-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                    Models
                </span>
                <span class="mlp-count" id="mlp-count">0</span>
            </div>
            <div class="mlp-list" id="mlp-list">
                <div class="mlp-empty">No models loaded</div>
            </div>
            <div class="mlp-footer">
                <button id="mlp-clear-btn" class="mlp-clear-btn">Clear All</button>
            </div>
        `;

        document.body.appendChild(panel);

        this._panel = panel;

        document.getElementById('mlp-clear-btn').onclick = () => {
            this._clearAllCallback?.();
        };

    }

    show() {
        this._panel.classList.add('mlp-open');
        this.visible = true;
    }

    hide() {
        this._panel.classList.remove('mlp-open');
        this.visible = false;
    }

    toggle() {
        this.visible ? this.hide() : this.show();
    }

    /**
     * @param {string} name - file name
     * @param {THREE.Object3D} object - the loaded model
     * @param {Function} onFocus - cb when focus clicked
     * @param {Function} onRemove - cb when delete clicked
     */
    addModel(name, object, onFocus, onRemove) {

        const id = 'mdl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

        const record = {
            id,
            name,
            object,
            visible: true
        };

        this.models.push(record);

        this._render();

        return id;

    }

    removeModel(id) {

        const idx = this.models.findIndex(m => m.id === id);
        if (idx === -1) return null;

        const { object } = this.models[idx];
        this.models.splice(idx, 1);
        this._render();

        return object;

    }

    clearAll() {

        const objects = this.models.map(m => m.object);
        this.models = [];
        this._render();

        return objects;

    }

    onClearAll(cb) {
        this._clearAllCallback = cb;
    }

    onFocusModel(cb) {
        this._focusCallback = cb;
    }

    onRemoveModel(cb) {
        this._removeCallback = cb;
    }

    onToggleVisibility(cb) {
        this._visibilityCallback = cb;
    }

    _render() {

        const list = document.getElementById('mlp-list');
        const count = document.getElementById('mlp-count');

        if (!list) return;

        count.textContent = this.models.length;

        if (this.models.length === 0) {
            list.innerHTML = '<div class="mlp-empty">No models loaded</div>';
            return;
        }

        list.innerHTML = this.models.map(m => `
            <div class="mlp-item" data-id="${m.id}">
                <label class="mlp-vis-toggle" title="Toggle visibility">
                    <input
                        type="checkbox"
                        class="mlp-checkbox"
                        data-id="${m.id}"
                        ${m.visible ? 'checked' : ''}
                    >
                    <span class="mlp-vis-icon">${m.visible ? '👁' : '🚫'}</span>
                </label>
                <div class="mlp-item-name" title="${m.name}">${this._shortName(m.name)}</div>
                <div class="mlp-item-actions">
                    <button class="mlp-focus-btn" data-id="${m.id}" title="Focus camera">⊙</button>
                    <button class="mlp-remove-btn" data-id="${m.id}" title="Remove model">✕</button>
                </div>
            </div>
        `).join('');

        // Bind events
        list.querySelectorAll('.mlp-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                const rec = this.models.find(m => m.id === id);
                if (rec) {
                    rec.visible = e.target.checked;
                    rec.object.visible = rec.visible;
                    this._visibilityCallback?.(rec.object, rec.visible);
                    this._render();
                }
            });
        });

        list.querySelectorAll('.mlp-focus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const rec = this.models.find(m => m.id === id);
                if (rec) this._focusCallback?.(rec.object);
            });
        });

        list.querySelectorAll('.mlp-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const object = this.removeModel(id);
                if (object) this._removeCallback?.(object);
            });
        });

    }

    _shortName(name, maxLen = 22) {
        if (name.length <= maxLen) return name;
        const ext = name.lastIndexOf('.');
        if (ext > 0) {
            const base = name.slice(0, ext);
            const suffix = name.slice(ext);
            return base.slice(0, maxLen - suffix.length - 3) + '...' + suffix;
        }
        return name.slice(0, maxLen - 3) + '...';
    }

}
