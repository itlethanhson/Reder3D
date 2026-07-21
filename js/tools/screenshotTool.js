export class ScreenshotTool{

    constructor(
        renderer
    ){

        this.renderer =
            renderer;

    }

    capture(){

        const url =
            this.renderer
            .domElement
            .toDataURL(
                "image/png"
            );

        const a =
            document.createElement(
                "a"
            );

        a.href = url;

        a.download =
            "capture.png";

        a.click();

    }

}