console.log("Script loaded successfully");

// Convert HEX to HSL
function hexToHSL(H) {
  // Check for invalid HEX color
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i.test(H)) {
    console.error("Invalid HEX color: " + H);
    return;
  }

  let r = 0,
    g = 0,
    b = 0;
  // 3 digits
  if (H.length === 4) {
    r = parseInt("0x" + H[1] + H[1]);
    g = parseInt("0x" + H[2] + H[2]);
    b = parseInt("0x" + H[3] + H[3]);
  }
  // 6 digits
  else if (H.length === 7) {
    r = parseInt("0x" + H[1] + H[2]);
    g = parseInt("0x" + H[3] + H[4]);
    b = parseInt("0x" + H[5] + H[6]);
  }
  // Convert to decimals
  r /= 255;
  g /= 255;
  b /= 255;

  // Find greatest and smallest channel values
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  // Calculate hue
  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  // Make negative hues positive behind 360°
  if (h < 0) h += 360;

  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return [h / 360, s / 100, l / 100];
}

// Generate Luminance Colors
function generateLuminanceColors(hsl, steps) {
  let colors = [];
  for (let i = 0; i <= steps; i++) {
    let luminance = i / steps;
    colors.push([hsl[0], hsl[1], luminance]);
  }
  return colors;
}

document.addEventListener("DOMContentLoaded", function () {
  const colorNameInput = document.getElementById("color-name");
  const baseColorInput = document.getElementById("color-value");
  const stepsInput = document.getElementById("color-count");
  const generateColorsButton = document.getElementById("generate-colors");
  const copyCssButton = document.getElementById("copy-css");
  const copyStatus = document.getElementById("copy-status");
  const colorList = document.getElementById("color-preview");

  if (
    !colorNameInput ||
    !baseColorInput ||
    !stepsInput ||
    !generateColorsButton ||
    !colorList
  ) {
    console.error("One or more elements were not found in the DOM.");
    return;
  }

  // Load stored values
  colorNameInput.value = localStorage.getItem("colorName") || "";
  baseColorInput.value = localStorage.getItem("baseColor") || "";
  stepsInput.value = localStorage.getItem("steps") || "";

  generateColorsButton.addEventListener("click", (event) => {
    // Prevent the form from being submitted
    event.preventDefault();

    const colorName = colorNameInput.value;
    const baseColor = baseColorInput.value;
    const steps = parseInt(stepsInput.value, 10);

    // Store values
    localStorage.setItem("colorName", colorName);
    localStorage.setItem("baseColor", baseColor);
    localStorage.setItem("steps", steps);

    const hsl = hexToHSL(baseColor);
    let colors = generateLuminanceColors(hsl, steps);

    // clear the color preview
    colorList.innerHTML = "";

    // display each generated color in the color preview
    colors.forEach(function (color, index) {
      let li = document.createElement("li");
      li.className = "color-sample";

      let div = document.createElement("div");
      div.className = "color-swatch";
      div.style.backgroundColor = `hsl(${color[0] * 360}, ${color[1] * 100}%, ${color[2] * 100
        }%)`;
      li.appendChild(div);

      let cssVariable = document.createElement("code");
      cssVariable.className = "css-variable";
      cssVariable.textContent = `--${colorName}-${Math.round(
        color[2] * 100
      )}: hsl(${Math.round(color[0] * 360)}, ${Math.round(
        color[1] * 100
      )}%, ${Math.round(color[2] * 100)}%);`;
      li.appendChild(cssVariable);

      colorList.appendChild(li);

      copyCssButton.style.display = "block"; // make the copy button visible after generating colors
    });
  });

  copyCssButton.addEventListener("click", function () {
    let cssVariables = Array.from(
      document.querySelectorAll(".css-variable")
    ).map((el) => el.textContent);
    let cssVariablesString = cssVariables.join("\n");
    navigator.clipboard
      .writeText(cssVariablesString)
      .then(function () {
        copyStatus.textContent = "Copied to Clipboard";
      })
      .catch(function () {
        copyStatus.textContent = "Error";
      });
  });

});