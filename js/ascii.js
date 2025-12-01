// p5.js ASCII Designer — Attached to #sketch-container
let cell = 24;
let txtSizeFactor = 0.50;
let cols, rows;

let charset;
const CHARSETS = [
    "@#%*+=-:. ",
    "█▓▒░ .:-=+*#",
    "#&$%*+=-:. ",
    "Xx/*\\|-_ .",
    "01.:;+=*#@",
    "<>v^/\\|_-."
];

let invert = false;
let style = "noise";
let params = {};
let titleText = "ALGORITHMIC IDENTITIES";
let gfxMask;

let cnv;

function setup() {
    let container = document.getElementById("sketch-container");

    let cnv = createCanvas(container.offsetWidth, container.offsetHeight);
    cnv.parent("sketch-container");

    pixelDensity(2);
    textFont("monospace");
    textAlign(CENTER, CENTER);

    randomize(true);
    computeGrid();
}

function windowResized() {
    let container = document.getElementById("sketch-container");
    resizeCanvas(container.offsetWidth, container.offsetHeight);
    computeGrid();
}

function computeGrid() {
    textSize(cell * txtSizeFactor);
    cols = floor(width / cell);
    rows = floor(height / cell);
    if (style === "textmask") buildTextMask();
}

function randomize(seedAll = false) {
    if (seedAll) {
        noiseSeed(floor(random(1e9)));
        randomSeed(floor(random(1e9)));
    }

    charset = shuffle(CHARSETS[floor(random(CHARSETS.length))].split("")).join("");

    params = {
        scale: random(0.02, 0.12),
        timeSpeed: random(0.001, 0.01),
        contrastPow: random(0.8, 1.8),
        jitter: random(0.0, 0.12),
        waveFreq: random(0.6, 2.0),
        waveAmp: random(0.5, 2.5),
        ringFreq: random(0.4, 1.2),
        diagFreq: random(0.5, 1.5),
        flowFreq: random(0.5, 1.5),
    };
}

function draw() {
    background(255);
    fill(0);
    noStroke();
    const t = millis() * params.timeSpeed;
    const N = charset.length;

    for (let gy = 0; gy < rows; gy++) {
        const py = (gy + 0.5) * cell;

        for (let gx = 0; gx < cols; gx++) {
            const px = (gx + 0.5) * cell;

            const u = gx / max(1, cols - 1);
            const v = gy / max(1, rows - 1);
            let n;

            switch (style) {
                case "noise":
                    n = noise(gx * params.scale, gy * params.scale, t);
                    n = pow(n, params.contrastPow);
                    break;

                case "waves":
                    n = 0.5 + 0.5 * sin((u * TAU * params.waveFreq) + t * 2.0);
                    n = pow(n, params.contrastPow);
                    break;

                case "rings": {
                    const dx = u - 0.5, dy = v - 0.5;
                    const r = sqrt(dx * dx + dy * dy);
                    n = 0.5 + 0.5 * sin((r * TAU * 2.0 * params.ringFreq) - t * 2.0);
                    n = pow(n, params.contrastPow);
                    break;
                }

                case "diag":
                    n = 0.5 + 0.5 * sin(((u + v) * TAU * params.diagFreq) + t * 2.0);
                    n = pow(n, params.contrastPow);
                    break;

                case "flow": {
                    const ang = TWO_PI * (noise(u * params.flowFreq, v * params.flowFreq) - 0.5);
                    const uu = u + 0.15 * cos(ang);
                    const vv = v + 0.15 * sin(ang);
                    n = noise(uu * 2.0, vv * 2.0, t * 0.6);
                    n = pow(n, params.contrastPow);
                    break;
                }

                case "textmask": {
                    const mx = floor(u * (gfxMask.width - 1));
                    const my = floor(v * (gfxMask.height - 1));
                    gfxMask.loadPixels();
                    const idxPx = 4 * (my * gfxMask.width + mx);
                    const lum = gfxMask.pixels[idxPx];
                    n = lum / 255.0;
                    break;
                }

                default:
                    n = 0.0;
            }

            if (style !== "textmask" && params.jitter > 0) {
                n = lerp(n, random(), params.jitter);
            }

            if (invert) n = 1.0 - n;

            const ci = constrain(floor(n * N), 0, N - 1);
            const ch = charset[ci];
            text(ch, px, py);
        }
    }
}

function buildTextMask() {
    gfxMask = createGraphics(cols, rows);
    gfxMask.pixelDensity(1);
    gfxMask.background(0);
    gfxMask.fill(255);
    gfxMask.noStroke();
    gfxMask.textAlign(CENTER, CENTER);

    let fs = rows * 0.6;
    gfxMask.textSize(fs);
    let tw = gfxMask.textWidth(titleText);

    while (tw > cols * 0.85 && fs > 8) {
        fs *= 0.92;
        gfxMask.textSize(fs);
        tw = gfxMask.textWidth(titleText);
    }

    gfxMask.text(titleText, cols / 2, rows / 2 + fs * 0.05);
}

function keyPressed() {
    if (key === '1') style = "noise";
    if (key === '2') style = "waves";
    if (key === '3') style = "rings";
    if (key === '4') style = "diag";
    if (key === '5') style = "flow";
    if (key === '6') { style = "textmask"; buildTextMask(); }

    if (key === 'I' || key === 'i') invert = !invert;

    if (key === 'R' || key === 'r') randomize(true);

    if (key === 'S' || key === 's') {
        const stamp = nf(year(), 4) + "-" + nf(month(), 2) + "-" + nf(day(), 2) + "_" +
            nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
        saveCanvas(`ascii_${style}_${stamp}`, 'png');
    }

    if (key === '[') { cell = max(8, cell - 2); computeGrid(); }
    if (key === ']') { cell = min(160, cell + 2); computeGrid(); }

    if (key === '-') { txtSizeFactor = max(0.2, txtSizeFactor - 0.04); computeGrid(); }
    if (key === '=') { txtSizeFactor = min(0.95, txtSizeFactor + 0.04); computeGrid(); }

    if (key === 'T' || key === 't') {
        const tNew = prompt("Banner title for TEXTMASK:", titleText);
        if (tNew && tNew.trim().length > 0) {
            titleText = tNew.toUpperCase();
            if (style === "textmask") buildTextMask();
        }
    }
}

function startAsciiSketch(targetId) {
    const container = document.getElementById(targetId);

    function render() {
        // Your existing ASCII generation code:
        // e.g.: let ascii = generateAscii();
        // container.innerHTML = ascii;

        container.innerHTML = generateAsciiFrame(); // <-- your old code
        requestAnimationFrame(render);
    }

    render();
}

startAsciiSketch("sketch-1", asciiModeA);
startAsciiSketch("sketch-2", asciiModeB);
startAsciiSketch("sketch-3", asciiModeC);

// ---------------- BUTTON UI HOOKS ----------------
window.addEventListener("DOMContentLoaded", () => {
    document.querySelector('#ascii-buttons button[data-style="noise"]').classList.add('active');
    const buttons = document.querySelectorAll("#ascii-buttons button");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            // remove active state from others
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // apply ASCII style
            const newStyle = btn.dataset.style;
            style = newStyle;

            if (style === "textmask") buildTextMask();
            computeGrid();
        });
    });
});
