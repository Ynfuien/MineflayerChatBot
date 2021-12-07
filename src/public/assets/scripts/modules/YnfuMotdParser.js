// Made by Ynfuien
export {parseMessage};


"use strict";

// Colors and formats to css styles
let stylesLegend = {
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
    'l': 'font-family: Mojangles-bold',
    // 'l': 'font-weight: bold',
    'm': 'text-decoration: line-through',
    'n': 'text-decoration: underline',
    'o': 'font-style: italic'
};

// Color codes list
let allColorCodes = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'
];

// Format codes list
let allFormatCodes = [
    'l', 'o', 'm', 'n'
];

// Main function
function parseStyles(string, codesChar = '§') {
    // Creating main <pre> element
    let finalPre = document.createElement('pre');
    finalPre.className = "ynfu-minecraft-text";

    let actualSpan = document.createElement("span");
    let textChangeAfterAddFormat = false;
    
    // Loop all chars in string
    for (let i = 0; i < string.length; i++) {
        // Actual iterated char
        let char = string[i];
        // Next char after currently iterated char
        let nextChar = string[i + 1];

        // Make next char be lower case, if it exist at all
        if (nextChar) nextChar = nextChar.toLowerCase();

        // Check if char is not paragraf and add this char to actual span text
        if (char != codesChar) {
            actualSpan.innerHTML += char;
            textChangeAfterAddFormat = true;

            continue;
        }

        // If after coloring or formating is no characters, span will not be created 
        if (!string[i + 2]) {
            i += 2;
            continue;
        }

        // Check if next char is color char
        if (allColorCodes.includes(nextChar)) {
            addActualSpanToFinalPreIfItHasAnyContentAndCreateNewOne();

            addStyleIfNotAdded(actualSpan, stylesLegend[nextChar]);
            // addStyleIfNotAdded(actualSpan, `text-shadow: 2px 2px #${getTextShadowHex(stylesLegend[nextChar].split(':')[1])}`);
            textChangeAfterAddFormat = false;
            i++;
            
            continue;
        }

        // Check if next char is format char
        if (allFormatCodes.includes(nextChar)) {
            if (textChangeAfterAddFormat) {
                if (!actualSpan.style.cssText.includes(stylesLegend[nextChar])) {
                    finalPre.appendChild(actualSpan);
                    let styles = actualSpan.style.cssText;
                    actualSpan = document.createElement("span");
                    actualSpan.style.cssText = styles;
                }
            }
            addStyleIfNotAdded(actualSpan, stylesLegend[nextChar]);
            textChangeAfterAddFormat = false;
            i++;

            continue;
        }

        // Check if next char is hash, that might be used for RGB color
        if (nextChar == "#") {
            // Get 6 chars of potential HEX color code
            let hex = string.substr(i + 2, 6);
            let pattern = new RegExp("^[a-f0-9]{6}", 'i');

            // Check if HEX code is correct
            if (pattern.test(hex)) {
                addActualSpanToFinalPreIfItHasAnyContentAndCreateNewOne();

                addStyleIfNotAdded(actualSpan, `color:#${hex}`);
                // addStyleIfNotAdded(actualSpan, `text-shadow: 2px 2px #${getTextShadowHex(hex)}`);
                textChangeAfterAddFormat = false;
                i += 7;
            }
            // If HEX color isn't correct, just add hash to normal text
            else {
                actualSpan.innerHTML += char;
                textChangeAfterAddFormat = true;
            }

            continue;
        }

        // Check if next char is k, which is for matrix effect, and skip it
        if (nextChar == "k") {
            i++;

            continue;
        }

        // Check if next char is r, which is for reset previously colors and formats
        if (nextChar == "r") {
            addActualSpanToFinalPreIfItHasAnyContentAndCreateNewOne();

            i++;

            continue;
        }
    }

    if (actualSpan) finalPre.appendChild(actualSpan);

    return finalPre;

    // Just like in name - add actual span to final pre,
    // if it has any content (if span has content, not pre),
    // and create new span
    function addActualSpanToFinalPreIfItHasAnyContentAndCreateNewOne() {
        if (actualSpan && actualSpan.innerHTML) {
            finalPre.appendChild(actualSpan);
            actualSpan = document.createElement("span");
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
        // If style property is text-decoration and element styles includes also this property 
        if (style.includes("text-decoration") && element.style.cssText.includes("text-decoration")) {
            // Get already set style from text-decoration property
            let actualTextDec = element.style.cssText.match(/text-decoration: (line\-through|underline);/)[0];
            actualTextDec = actualTextDec.split(": ")[1].replace(/;/, "");

            // Add new style to earlier element style
            element.style.cssText += style + ` ${actualTextDec};`;
        } else {
            // Just add style to other element styles
            element.style.cssText += style + ";";
        }
    }
}


// Function to use out of script
function parseMessage(input, codesChar = '§') {
    return parseStyles(input, codesChar);
};