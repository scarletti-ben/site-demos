/**
 * Global functionality for site-demos
 * 
 * @author Ben Scarletti
 * @version 0.9.0
 * @since 2025-08-31
 * @see {@link https://github.com/scarletti-ben}
 * @license MIT
 */

// < ======================================================
// < Global Functionality
// < ======================================================

/** 
 * Test function to log or alert message
 * 
 * @param {boolean} [alerting=false] Option to alert
 * @returns {void}
 */
function test(alerting = false) {
    const message = 'Hello from from global.js';
    console.log(message);
    if (alerting) {
        alert(message)
    }
}

/**
 * Shuffle an array in-place using Fisher-Yates algorithm
 * 
 * @param {Array} array - The array to shuffle
 * @returns {void}
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Set theme via HTML data attribute "dataset-theme"
 * 
 * @param {string} [name] - Name of the theme to apply, defaults to ""
 * @param {HTMLElement} [element] - Element to apply the theme to, defaults to `document.body`
 * @throws {Error} If name is not a string, or element is not valid
 * @returns {void}
 */
function setTheme(name, element) {
    if (element === undefined) element = document.body;
    if (!name || name === 'default') {
        element.dataset.theme = '';
    } else {
        element.dataset.theme = name;
    }
}

// ! ======================================================
// ! Experimental
// ! ======================================================

const experimental = {}

// > ======================================================
// > Exports
// > ======================================================

export {
    experimental,
    test,
    shuffle,
    setTheme
}