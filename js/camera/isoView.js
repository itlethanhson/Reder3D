export function isoView(
    camera,
    controls
){

    camera.position.set(
        80,
        80,
        80
    );

    controls.target.set(
        0,
        0,
        0
    );

    controls.update();

}