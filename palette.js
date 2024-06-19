/**
 * Adjusts the hue value to be within the range of 0 to 359 degrees.
 * If the input value is negative, it wraps around to the positive range.
 *
 * @param {number} val - The hue value to adjust.
 * @returns {number} - The adjusted hue value.
 */
function adjustHue(val) {
    if (val < 0) val += Math.ceil(-val / 360) * 360;
  
    return val % 360;
}
  
/**
 * Maps a color value from one range to another range.
 *
 * @param {number} n - The value to be mapped.
 * @param {number} start1 - The lower bound of the input range.
 * @param {number} end1 - The upper bound of the input range.
 * @param {number} start2 - The lower bound of the output range.
 * @param {number} end2 - The upper bound of the output range.
 * @returns {number} - The mapped value.
 */
function mapcol(n, start1, end1, start2, end2) {
    return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
}

function makePopColor(base, offset=180) {
    // Given a base color, return a color that is offset by a certain amount
    let h = {
        l: 1,
        c: 1,
        h: adjustHue(base.h + offset),
        mode: "oklch"
    };
    console.log(h);
    return h;
}
  
/**
 * Creates a hue shift palette based on the provided parameters.
 * @param {object} base - The base color object with properties l, c, h, and mode.
 * @param {number} minLightness - The minimum lightness value for the palette.
 * @param {number} maxLightness - The maximum lightness value for the palette.
 * @param {number} hueStep - The hue step value for each iteration.
 * @returns {Array} - The generated hue shift palette.
 */
function createHueShiftPalette(base, minLightness, maxLightness, hueStep) {
    const palette = [];
    // const palette = [base];
    // console.log(palette)

    for (let i = 0; i < 4; i++) {
        const hueDark = adjustHue(base.h - hueStep * i);
        const hueLight = adjustHue(base.h + hueStep * i);
        const lightnessDark = mapcol(i, 0, 4, base.l, minLightness);
        const lightnessLight = mapcol(i, 0, 4, base.l, maxLightness);
        const chromatic = base.c;

        console.log(hueDark, hueLight, lightnessDark, lightnessLight, chromatic)
    
        palette.push({
            l: lightnessDark,
            c: chromatic,
            h: hueDark,
            mode: "oklch"
        });
    
        palette.unshift({
            l: lightnessLight,
            c: chromatic,
            h: hueLight,
            mode: "oklch"
        });
        // console.log(palette[0])
    }

    // Add a pop color to the palette at the end
    let pop = makePopColor(base, -135);
    palette.push(pop);

    return palette;
}

// Convert an OKLCH color to hex
function convertOKLCHColorToHexColor(color) {
    let c = chroma(color['l'], color['c'], color['h'], color['mode']).hex();
    
    // Hex string to hex value
    color = parseInt(c.slice(1), 16);

    // Add to palette as a THREE.Color
    color = new THREE.Color(c);

    return color;
}

let paletteRaw = createHueShiftPalette(
    // Base palette settings
    {
        l: 0.5,
        c: 0.1,
        h: Math.random() * 360,
        // h: 180,
        mode: "oklch"
    },
    0.1,      // minLightness
    1,    // maxLightness
    15        // hueStep
)

function generatePalette() {
    let palette = {
        "fg": paletteRaw[0],
        "lighter": paletteRaw[2],
        "midtone": paletteRaw[4],   // new!
        "darker": paletteRaw[6],
        "bg": paletteRaw[7],
        "pop": paletteRaw[8],       // updated!
    
        "0": paletteRaw[0],         // specific numeral entries just in case
        "1": paletteRaw[1],
        "2": paletteRaw[2],
        // "3": paletteRaw[3],      // 3 is removed -- it's the same color as 4 because of the way the palette is generated
        "3": paletteRaw[4],
        "4": paletteRaw[5],
        "5": paletteRaw[6],
        "6": paletteRaw[7],
    }
    return palette;
}

function setColorsToPalette(palette) {
    // Set palette bg css var
    var r = document.querySelector(':root');
    for (let key in palette) {
        // Set CSS variables using OKLCH values TODO: once browser compat becomes better
        // let color = palette[key];
        // let oklchValue = `oklch(${color.l * 100}% ${color.c} ${color.h})`;
        // r.style.setProperty('--palette-' + key, oklchValue);

        // Convert colors to Hex values for three.js :(
        palette[key] = convertOKLCHColorToHexColor(palette[key]);

        // Set CSS variables using Hex values
        let hex = palette[key].getHexString();
        r.style.setProperty('--palette-' + key, '#' + hex);
    }
    return true;
}

let palette = generatePalette();
setColorsToPalette(palette);