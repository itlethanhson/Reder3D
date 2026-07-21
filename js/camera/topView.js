export function topView(
    camera,
    controls
){

    camera.position.set(
        0,
        100,
        0
    );

    camera.up.set(
        0,
        0,
        -1
    );

    controls.target.set(
        0,
        0,
        0
    );

    controls.update();

}