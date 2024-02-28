// Made by Ynfuien
export { parseMessage };


"use strict";

// Colors and formats to css styles
const stylesLegend = {
    '0': 'color:#000000',
    '1': 'color:#0000AA',
    '2': 'color:#00AA00',
    '3': 'color:#00AAAA',
    '4': 'color:#AA0000',
    '5': 'color:#AA00AA',
    '6': 'color:#FFAA00',
    '7': 'color:#AAAAAA',
    '8': 'color:#555555',
    '9': 'color:#5555FF',
    'a': 'color:#55FF55',
    'b': 'color:#55FFFF',
    'c': 'color:#FF5555',
    'd': 'color:#FF55FF',
    'e': 'color:#FFFF55',
    'f': 'color:#FFFFFF',
    'l': 'font-weight: bold',
    'm': 'text-decoration-line: line-through',
    'n': 'text-decoration-line: underline',
    'o': 'font-style: italic'
};

// Color codes list
const colorCodes = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' ];

// Format codes list
const formatCodes = [ 'l', 'o', 'm', 'n' ];


function parseMessage(string, codesChar = '§') {
    // Creating main <pre> element
    const finalPre = document.createElement('pre');

    let currentSpan = document.createElement("span");
    let textChangeAfterFormatting = false;
    
    // Loop all chars in string
    for (let i = 0; i < string.length; i++) {
        // Currently iterated char
        const char = string[i];
        // Next char after currently iterated char
        let nextChar = string[i + 1];

        // Make next char be lower case, if it exist at all
        if (nextChar) nextChar = nextChar.toLowerCase();

        // Check if char is not paragraf and add this char to current span text
        if (char != codesChar) {
            currentSpan.innerHTML += char;
            textChangeAfterFormatting = true;

            continue;
        }

        // If after coloring or formating is no characters, span will not be created 
        if (!string[i + 2]) {
            i += 2;
            continue;
        }

        // Check if next char is color char
        if (colorCodes.includes(nextChar)) {
            appendCurrentSpanToPre();

            addStyleIfNotAdded(currentSpan, stylesLegend[nextChar]);
            textChangeAfterFormatting = false;
            i++;
            
            continue;
        }

        // Check if next char is format char
        if (formatCodes.includes(nextChar)) {
            if (textChangeAfterFormatting) {
                if (!currentSpan.style.cssText.includes(stylesLegend[nextChar])) {
                    finalPre.appendChild(currentSpan);
                    let styles = currentSpan.style.cssText;
                    currentSpan = document.createElement("span");
                    currentSpan.style.cssText = styles;
                }
            }
            addStyleIfNotAdded(currentSpan, stylesLegend[nextChar]);
            textChangeAfterFormatting = false;
            i++;

            continue;
        }

        // Check if next char is hash, that might be used for RGB color
        if (nextChar == "#") {
            // Get 6 chars of potential HEX color code
            const hex = string.substr(i + 2, 6);
            const pattern = new RegExp("^[a-f0-9]{6}", 'i');

            // Check if HEX code is correct
            if (pattern.test(hex)) {
                appendCurrentSpanToPre();

                addStyleIfNotAdded(currentSpan, `color:#${hex}`);
                textChangeAfterFormatting = false;
                i += 7;
            } else { // If HEX color isn't correct, just add hash to normal text
                currentSpan.innerHTML += char;
                textChangeAfterFormatting = true;
            }

            continue;
        }

        // Check if next char is k, which is for matrix effect, and skip it
        if (nextChar == "k") {
            i++;

            continue;
        }

        // Check if next char is r, which is a reset
        if (nextChar == "r") {
            appendCurrentSpanToPre();
            i++;

            continue;
        }
    }

    if (currentSpan) finalPre.appendChild(currentSpan);

    return finalPre;


    // Add current span to final pre and create a new one
    function appendCurrentSpanToPre() {
        if (currentSpan && currentSpan.innerHTML) {
            finalPre.appendChild(currentSpan);
            currentSpan = document.createElement("span");
        }
    }
}

// Additional function for add css style to element
function addStyleIfNotAdded(element, style) {
    // If style is with color
    if (style.includes("color")) {
        element.style.cssText += style + ";";
        return;
    }

    // If style isn't with color, and if element styles isn't already contains this style
    if (!element.style.cssText.includes(style)) {
        // If style property is text-decoration-line and element styles includes also this property 
        if (style.includes("text-decoration-line") && element.style.cssText.includes("text-decoration-line")) {
            // Get already set style from text-decoration-line property
            let textDecoration = element.style.cssText.match(/text-decoration-line: (line\-through|underline);/)[0];
            textDecoration = textDecoration.split(": ")[1].replace(/;/, "");

            // Add new style to earlier element style
            element.style.cssText += style + ` ${textDecoration};`;
        } else {
            // Just add style to other element styles
            element.style.cssText += style + ";";
        }
    }
}