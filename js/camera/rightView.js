export function rightView(
    camera,
    controls
){

    camera.position.set(
        100,
        0,
        0
    );

    controls.target.set(
        0,
        0,
        0
    );

    controls.update();

}