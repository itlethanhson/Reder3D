export function createSectionPanel() {

    const div = document.createElement('div');

    div.id = 'section-panel';

    div.innerHTML = `
<h4>✧ Section View</h4>

<div class="section-row">
    <label>Axis</label>
    <select id="section-axis">
        <option value="x">X</option>
        <option value="y" selected>Y</option>
        <option value="z">Z</option>
    </select>
</div>

<div class="section-row">
    <label>Position</label>
    <input
        type="range"
        id="section-slider"
        min="-200"
        max="200"
        step="0.5"
        value="0">
</div>

<div class="section-row section-value-row">
    <span class="section-value-label">Value:</span>
    <span id="section-value-display">0</span>
</div>

<div class="section-actions">
    <button id="section-flip-btn" title="Flip cut direction">⇅ Flip</button>
    <button id="section-reset-btn" title="Reset section">↺ Reset</button>
    <button id="section-helper-btn" title="Toggle plane helper" class="section-helper-toggle">⬡ Helper</button>
</div>
`;

    document.body.appendChild(div);

}