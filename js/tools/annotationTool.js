import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { raycaster, mouse } from '../core/raycasterManager.js';

export class AnnotationTool {

    constructor(scene, camera) {

        this.scene = scene;
        this.camera = camera;
        this.enabled = false;
        this.annotations = [];
        this._bound = this._onClick.bind(this);

    }

    enable() {
        this.enabled = true;
        window.addEventListener('pointerdown', this._bound);
        document.body.style.cursor = 'crosshair';
    }

    disable() {
        this.enabled = false;
        window.removeEventListener('pointerdown', this._bound);
        document.body.style.cursor = '';
    }

    _onClick(event) {

        if (!this.enabled) return;

        // Ignore right-click / middle-click
        if (event.button !== 0) return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, this.camera);

        const intersects = raycaster.intersectObjects(
            this.scene.children,
            true
        );

        if (!intersects.length) return;

        // Filter out helper objects (PlaneHelper lines etc.)
        const hit = intersects.find(i =>
            i.object.isMesh &&
            !i.object.userData.isHelper
        );

        if (!hit) return;

        const point = hit.point.clone();

        this.disable(); // pause while prompting

        // Use a styled modal instead of prompt
        this._showInputModal(point);

    }

    _showInputModal(point) {

        // Remove existing modal if any
        const existing = document.getElementById('annotation-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'annotation-modal';
        modal.innerHTML = `
            <div class="ann-modal-card">
                <div class="ann-modal-title">📌 Add Annotation</div>
                <textarea
                    id="ann-input"
                    class="ann-textarea"
                    placeholder="Enter annotation text..."
                    rows="3"
                    autofocus
                ></textarea>
                <div class="ann-modal-actions">
                    <button id="ann-cancel-btn" class="ann-btn ann-btn-cancel">Cancel</button>
                    <button id="ann-ok-btn" class="ann-btn ann-btn-ok">Add Pin</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const input = document.getElementById('ann-input');
        input.focus();

        document.getElementById('ann-ok-btn').onclick = () => {
            const text = input.value.trim();
            modal.remove();
            if (text) {
                this._createAnnotation(point, text);
            }
            this.enable();
        };

        document.getElementById('ann-cancel-btn').onclick = () => {
            modal.remove();
            this.enable();
        };

        // Enter to confirm
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.getElementById('ann-ok-btn').click();
            }
            if (e.key === 'Escape') {
                document.getElementById('ann-cancel-btn').click();
            }
        });

    }

    _createAnnotation(point, text) {

        const id = 'ann_' + Date.now();

        // CSS2DObject label
        const container = document.createElement('div');
        container.className = 'annotation-label';
        container.dataset.id = id;

        container.innerHTML = `
            <div class="ann-pin">📌</div>
            <div class="ann-card">
                <div class="ann-text">${this._escapeHtml(text)}</div>
                <button class="ann-delete-btn" title="Remove annotation">✕</button>
            </div>
        `;

        const label = new CSS2DObject(container);
        label.position.copy(point);
        label.userData.annotationId = id;

        this.scene.add(label);

        // Dot marker at point
        const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.03, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffcc00, depthTest: false })
        );
        dot.position.copy(point);
        dot.renderOrder = 999;
        dot.userData.annotationId = id;
        dot.userData.isHelper = true;
        this.scene.add(dot);

        const record = { id, label, dot, text, point };
        this.annotations.push(record);

        // Delete button handler
        container.querySelector('.ann-delete-btn').onclick = (e) => {
            e.stopPropagation();
            this._removeAnnotation(id);
        };

        this._updateCounter();

        return record;

    }

    _removeAnnotation(id) {

        const idx = this.annotations.findIndex(a => a.id === id);
        if (idx === -1) return;

        const { label, dot } = this.annotations[idx];

        this.scene.remove(label);
        this.scene.remove(dot);

        label.element.remove();
        dot.geometry.dispose();
        dot.material.dispose();

        this.annotations.splice(idx, 1);

        this._updateCounter();

    }

    clearAll() {

        [...this.annotations].forEach(a => this._removeAnnotation(a.id));

    }

    _updateCounter() {

        const btn = document.getElementById('annotation-btn');
        if (!btn) return;

        const count = this.annotations.length;
        const badge = btn.querySelector('.ann-badge');

        if (count > 0) {
            if (badge) {
                badge.textContent = count;
            } else {
                const b = document.createElement('span');
                b.className = 'ann-badge';
                b.textContent = count;
                btn.appendChild(b);
            }
        } else {
            if (badge) badge.remove();
        }

    }

    _escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

}
