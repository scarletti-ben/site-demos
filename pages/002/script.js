// < ======================================================
// < Imports
// < ======================================================

import {
    CalendarWidget,
    tools
} from "./components/calendar-widget.js";

import {
    SimpleDatabase
} from "./utils/simple-database.js";

// < ======================================================
// < Declarations
// < ======================================================

/**
 * Application identifier
 * - Used by `SimpleDatabase` for IndexedDB interactions
 * @type {string}
 */
const APP_NAME = "2025-08-03_CALENDAR_NOTES";

/** Theme code object
 * @type {Object.<string, string>}
 */
const THEMES = {
    "Default": "default",
    "Monochrome": "monochrome",
    "Emerald": "emerald",
    "Ocean": "ocean",
    "Sunset": "sunset",
    "Forest": "forest",
    "Neon": "neon",
    "Amber": "amber"
};


// > ======================================================
// > Element Queries
// > ======================================================

const modal = /** @type {HTMLDivElement} */
    (document.getElementById('modal'));

const footer = /** @type {HTMLDivElement} */
    (document.getElementById('footer'));

const modalContent = /** @type {HTMLDivElement} */
    (document.getElementById('modal-content'));

// < ======================================================
// < Helper Functions
// < ======================================================

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

function flash(element, colour = 'limegreen', ms = 300) {
    element.style.transition = `background ${ms}ms`;
    element.style.background = colour;
    setTimeout(() => {
        element.style.transition = '';
        element.style.background = ''
    }, ms);
}

// < ======================================================
// < Element Queries
// < ======================================================

const main = /** @type {HTMLDivElement} */
    (document.getElementById('main'));

const textarea = /** @type {HTMLTextAreaElement} */
    (document.getElementById('textarea'));

// ~ ======================================================
// ~ Entry Point
// ~ ======================================================

// ? Run callback when all resources have loaded
window.addEventListener('load', async () => {

    // Create database instance for IndexedDB
    const db = new SimpleDatabase(APP_NAME);
    let result;

    result = await db.open();
    if (result.success) {
        console.log('Database opened');
    } else {
        console.error('Database failed to open:', result.message, result.error);
    }

    result = await db.loadAll();
    console.log(`read`, result);
    console.log(JSON.stringify(result.data, null, 2));


    document.addEventListener('keydown', async (event) => {
        if (event.ctrlKey && event.key.toLowerCase() === 's') {
            event.preventDefault();
            const text = textarea.value;
            const date = footerDate.dataset.date;
            result = await db.save(date, text);
            if (result.success) {
                flash(footer, 'rgba(0,255,0,0.2)');
                widget.starredDates.push(date);
            } else {
                flash(footer, 'rgba(255,0,0,0.2)');
            }
            console.log(`write ${date}`, result);
        }
    });

    const footerDate = document.getElementById('footer-date');

    modal.addEventListener('click', (event) => {
        if (!event.target.closest('#modal-content')) {
            modal.classList.toggle('shown', false);
        }
    });

    footerDate.addEventListener('click', () => {
        modal.classList.toggle('shown', true);
    })

    setTheme('emerald');

    const widget = new CalendarWidget();
    modalContent.appendChild(widget);

    result = await db._loadAllKeys();
    widget.starredDates.push(...result.data);
    widget.updateCalendar(new Date());

    // widget.toggleDayMarked();

    footerDate.textContent = tools.toPretty(widget.dateToday);
    footerDate.dataset.date = tools.toShort(widget.dateToday);

    widget.onDayClick = async (date, element) => {
        footerDate.textContent = tools.toPretty(date);
        footerDate.dataset.date = tools.toShort(date);
        modal.classList.toggle('shown', false);
        {
            const date = footerDate.dataset.date;
            result = await db.load(date);
            if (result.success) {
                textarea.value = result.data;
            } else {
                textarea.value = '';
            }
            console.log(result);
        }

        // console.log(date);
    }


    {
        const date = footerDate.dataset.date;
        result = await db.load(date);
        if (result.success) {
            textarea.value = result.data;
        }
        console.log(result);
    }


    document.body.style = '';

    // Set up theme switching functionality
    let themeIndex = 0;
    document.addEventListener('mousedown', (event) => {
        // Middle click
        if (event.button === 1) {
            event.preventDefault();
            const themeValues = Object.values(THEMES);
            themeIndex = (themeIndex + 1) % themeValues.length;
            const themeName = themeValues[themeIndex];
            setTheme(themeName);
        }
    });

});