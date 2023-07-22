console.log("Script loaded successfully");

document.addEventListener("DOMContentLoaded", function () {
  const colorNameInput = document.getElementById("color-name");
  const baseColorInput = document.getElementById("base-color");
  const stepsInput = document.getElementById("steps");
  const generateColorsButton = document.getElementById("generate-colors");
  const saveStylesButton = document.getElementById("save-styles");
  const colorList = document.getElementById("color-preview");

  if (
    !colorNameInput ||
    !baseColorInput ||
    !stepsInput ||
    !generateColorsButton ||
    !saveStylesButton ||
    !colorList
  ) {
    console.error("One or more elements were not found in the DOM.");
    return;
  }

  let colorName = "";
  let colors = [];

  generateColorsButton.addEventListener("click", () => {
    colorName = colorNameInput.value;
    const baseColor = baseColorInput.value;
    const steps = parseInt(stepsInput.value, 10);

    window.parent.postMessage(
      {
        pluginMessage: {
          type: "generate-colors",
          colorName,
          baseColor,
          steps,
        },
      },
      "*"
    );
  });

  saveStylesButton.addEventListener("click", () => {
    window.parent.postMessage(
      {
        pluginMessage: {
          type: "create-color-styles",
          colorName,
          colors,
        },
      },
      "*"
    );
  });

  window.onmessage = (event) => {
    if (event.data.pluginMessage.type === "color-data") {
      colors = event.data.pluginMessage.colors;
      colorList.innerHTML = "";

      colors.forEach((color, index) => {
        let h = color[0];
        let s = Math.round(color[1]);
        let l = Math.round(color[2]);

        let colorPreview = document.createElement("div");
        colorPreview.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;
        colorPreview.style.width = "20px";
        colorPreview.style.height = "20px";
        colorPreview.style.display = "inline-block";
        colorPreview.style.marginRight = "5px";

        let colorText = document.createElement("span");
        colorText.textContent = `${colorName}/${l} - HSL(${h}, ${s}%, ${l}%)`;

        let listItem = document.createElement("li");
        listItem.style.display = "flex";
        listItem.style.alignItems = "center";
        listItem.appendChild(colorPreview);
        listItem.appendChild(colorText);

        colorList.appendChild(listItem);
      });

      saveStylesButton.disabled = false;
    }
  };
});
