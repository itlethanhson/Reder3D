export function frontView(
    camera,
    controls
){

    camera.position.set(
        0,
        0,
        100
    );

    controls.target.set(
        0,
        0,
        0
    );

    controls.update();

}