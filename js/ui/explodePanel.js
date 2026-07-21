export function createExplodePanel(){

    const div =
        document.createElement(
            "div"
        );

    div.id =
        "explode-panel";

    div.innerHTML = `

<h4>Explode</h4>

<input
type="range"
id="explode-slider"
min="0"
max="100"
value="0">

`;

    document.body.appendChild(
        div
    );

}