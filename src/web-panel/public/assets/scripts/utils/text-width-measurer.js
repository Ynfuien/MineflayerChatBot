export { getTextWidth, getElementFont }

/**
  * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
  * 
  * @param {string} text The text to be rendered.
  * @param {string} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
  * @returns {number}
  * 
  * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
  */
function getTextWidth(text, font) {
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;

    /** @type {TextMetrics} */
    const metrics = context.measureText(text);
    return metrics.width;
}

/**
 * Get css font string
 * @param {HTMLElement} element
 * @returns {string}
 */
function getElementFont(element) {
    const style = getComputedStyle(element);

    const { fontFamily, fontWeight, fontSize } = style;
    return `${fontWeight} ${fontSize} ${fontFamily}`;
}