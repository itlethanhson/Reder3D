export class HighlightTool{

    constructor(
        outlinePass
    ){

        this.outlinePass =
            outlinePass;

    }

    select(
        mesh
    ){

        this.outlinePass.selectedObjects =
        [
            mesh
        ];

    }

    clear(){

        this.outlinePass.selectedObjects =
        [];

    }

}