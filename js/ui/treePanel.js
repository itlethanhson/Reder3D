// js/ui/treePanel.js

export class TreePanel {

    constructor(containerId = "tree-panel") {

        this.container = document.getElementById(containerId);

        this.selectedElement = null;
        this._root = null;
        this._onSelect = null;
        this._enabled = false;
    }

    toggle(root, onSelect) {
        this._enabled = !this._enabled;
        if (this._enabled) {
            if (root) { this._root = root; this._onSelect = onSelect; }
            this.build(this._root || root, this._onSelect || onSelect);
        } else {
            this.container.style.display = 'none';
        }
    }

    build(root, onSelect = null) {

        this._root = root;
        this._onSelect = onSelect;
        this.container.innerHTML = "";

        const header = document.createElement("div");
        header.className = "panel-header-row";
        header.innerHTML = `
            <span class="panel-header-title">Scene Tree</span>
            <button class="panel-close-btn" data-panel="tree" title="Đóng bảng">✕</button>
        `;
        header.querySelector('.panel-close-btn').onclick = () => {
            this.container.style.display = 'none';
            this._enabled = false;
        };
        this.container.appendChild(header);

        const ul = document.createElement("ul");
        ul.className = "tree-root";

        this.createNode(root, ul, onSelect);

        this.container.appendChild(ul);

        this.container.style.display = this._enabled ? 'block' : 'none';
    }

    createNode(object, parent, onSelect) {

        const li = document.createElement("li");

        const row = document.createElement("div");
        row.className = "tree-node";

        row.innerHTML = `
            <span class="tree-label">
                ${object.name || object.type}
            </span>
        `;

        row.addEventListener("click", e => {

            e.stopPropagation();

            this.select(row);

            if (onSelect) {
                onSelect(object);
            }

        });

        li.appendChild(row);

        if (object.children.length > 0) {

            const childList = document.createElement("ul");

            object.children.forEach(child => {
                this.createNode(child, childList, onSelect);
            });

            li.appendChild(childList);
        }

        parent.appendChild(li);
    }

    select(element) {

        if (this.selectedElement) {
            this.selectedElement.classList.remove("selected");
        }

        this.selectedElement = element;

        element.classList.add("selected");
    }

}