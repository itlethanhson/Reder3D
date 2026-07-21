export function createMeasurePanel(){

    const div =
        document.createElement(
            "div"
        );

    div.id =
        "measure-panel";

    div.innerHTML =

`
<button id="measure-btn">

Measure

</button>

`;

    document.body.appendChild(
        div
    );

}