// tools/propertyTool.js

export class PropertyTool {

    constructor(propertyPanel) {

        this.panel = propertyPanel;
    }

    show(object) {

        this.panel.show(object);
    }

    clear() {

        this.panel.clear();
    }

}