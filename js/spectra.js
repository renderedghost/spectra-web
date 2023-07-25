console.log("Script loaded successfully");

// Convert HEX to HSL
function hexToHSL(H) {
  // Check for invalid HEX color
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i.test(H)) {
    console.error("Invalid HEX color: " + H);
    return;
  }

  let r, g, b;
  // 3 digits
  if (H.length === 4) {
    r = parseInt("0x" + H[1] + H[1]) / 255;
    g = parseInt("0x" + H[2] + H[2]) / 255;
    b = parseInt("0x" + H[3] + H[3]) / 255;
  }
  // 6 digits
  else if (H.length === 7) {
    r = parseInt("0x" + H[1] + H[2]) / 255;
    g = parseInt("0x" + H[3] + H[4]) / 255;
    b = parseInt("0x" + H[5] + H[6]) / 255;
  }

  // Find greatest and smallest channel values
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;

  let h, s, l;

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
  for (let i = 0; i < steps; i++) {
    let luminance = i / (steps - 1); // Adjust luminance calculation
    colors.push([hsl[0], hsl[1], luminance]);
  }
  return colors;
}

document.addEventListener("DOMContentLoaded", function () {
  const colorNameInput = document.getElementById("color-name");
  const baseColorInput = document.getElementById("color-value");
  const stepsInput = document.getElementById("color-count");
  const generateColorsButton = document.getElementById("generate-colors");
  const copyButton = document.getElementById("copy-css");
  const colorList = document.getElementById("color-preview");

  if (
    !colorNameInput ||
    !baseColorInput ||
    !stepsInput ||
    !generateColorsButton ||
    !copyButton ||
    !colorList
  ) {
    console.error("One or more elements were not found in the DOM.");
    return;
  }

  // Load stored values
  colorNameInput.value = localStorage.getItem("colorName") || "";
  baseColorInput.value = localStorage.getItem("baseColor") || "";
  stepsInput.value = localStorage.getItem("steps") || "";

  generateColorsButton.addEventListener("click", async (event) => { // Async keyword for await usage inside
    // Prevent the default form submission
    event.preventDefault();

    const colorName = colorNameInput.value;
    const baseColor = baseColorInput.value;
    const steps = parseInt(stepsInput.value, 10);

    // Save current inputs to localStorage
    localStorage.setItem('colorName', colorName);
    localStorage.setItem('baseColor', baseColor);
    localStorage.setItem('steps', steps);

    const hsl = hexToHSL(baseColor);
    let colors = generateLuminanceColors(hsl, steps);

    // clear the color preview
    colorList.innerHTML = "";

    let cssVariableText = `:root { /* ${colorName} */\n`;

    // display each generated color in the color preview
    for (let i = 0; i < colors.length; i++) { // Changed to traditional for loop for await inside loop
      let color = colors[i];
      let hue = Math.round(color[0] * 360);
      let saturation = Math.round(color[1] * 100);
      let lightness = Math.round(color[2] * 100);

      let li = document.createElement("li");
      li.className = "color-preview";

      let div = document.createElement("div");
      div.className = "color-swatch";
      div.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      li.appendChild(div);

      let cssVariable = `--${colorName}-${lightness}: hsl(${hue}, ${saturation}%, ${lightness}%);`;
      let span = document.createElement("code");
      span.className = "css-variable";
      span.textContent = cssVariable;
      li.appendChild(span);

      colorList.appendChild(li);

      cssVariableText += `  ${cssVariable}\n`;

      // Pause for the animation interval
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms animation interval
    }

    cssVariableText += '}';

    // store the :root wrapped CSS variables for copying
    localStorage.setItem('cssVariables', cssVariableText);

    // Show the "Copy CSS variables" button
    copyButton.style.display = 'block';
  });


  copyButton.addEventListener("click", function (event) {
    // Prevent the form from submitting (which causes a page refresh)
    event.preventDefault();

    const cssVariables = localStorage.getItem('cssVariables');

    navigator.clipboard.writeText(cssVariables).then(function () {
      // success
      alert("Copied to Clipboard!");
    }, function (err) {
      // error
      alert("Error: " + err);
    });
  });
});