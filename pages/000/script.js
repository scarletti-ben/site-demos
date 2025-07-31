const calendar = document.getElementById('calendar');
const buttons = document.querySelectorAll(".button");
const leftButton = buttons[0];
const rightButton = buttons[1];
const monthSpan = document.querySelector('.heading-date');

// > ======================================================
// > Date Objects
// > ======================================================

const dates = {
    current: new Date(),
    calendar: new Date()
}
dates.calendar.setDate(1); // Set calendar day to first of the month

// > ======================================================
// > Populate Calendar
// > ======================================================


// Function to populate the calendar grid
function populateCalendar() {
    const year = dates.calendar.getFullYear();
    const month = dates.calendar.getMonth();

    // Get first day of the month and what day of week it falls on
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

    // Get number of days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get number of days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Get all date cells (skip header row)
    const rows = document.querySelectorAll('.row');
    const dateCells = [];
    for (let i = 1; i < rows.length; i++) { // Skip first row (headers)
        dateCells.push(...rows[i].querySelectorAll('.cell'));
    }

    let cellIndex = 0;

    // Fill in previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        dateCells[cellIndex].textContent = day;
        dateCells[cellIndex].classList.add('inactive');
        cellIndex++;
    }

    // Fill in current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        dateCells[cellIndex].textContent = day;
        dateCells[cellIndex].classList.remove('inactive');
        cellIndex++;
    }

    // Fill in next month's leading days
    let nextMonthDay = 1;
    while (cellIndex < dateCells.length) {
        dateCells[cellIndex].textContent = nextMonthDay;
        dateCells[cellIndex].classList.add('inactive');
        nextMonthDay++;
        cellIndex++;
    }
}

// > ======================================================
// > 
// > ======================================================

// Month names array
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Function to update the month display
function updateMonthDisplay() {
    const year = dates.calendar.getFullYear();
    const month = dates.calendar.getMonth();

    // Update the span text
    monthSpan.textContent = `${MONTHS[month]} ${year}`;

    // Add dataset-iso attribute with YYYY-MM format
    const monthString = (month + 1).toString().padStart(2, '0');
    monthSpan.setAttribute('data-iso', `${year}-${monthString}`);

    // Update the calendar grid
    populateCalendar();
}

function navigateMonthDisplay(change) {
    const month = dates.calendar.getMonth() + change;
    dates.calendar.setMonth(month);
    updateMonthDisplay();
}


// Initialise the display
updateMonthDisplay();

// < ======================================================
// < Background Selector
// < ======================================================

const backgroundSelector = document.getElementById('background-selector');

const backgroundColours = {
    "Default": "default",
    "Black": "black",
    "Dark Grey": "#1a1a1a",
    "Grey": "grey",
    "Blue": "#1a237e",
    "Green": "#0d4f3c",
    "Purple": "purple",
    "Red": "#b71c1c",
    "Dark Orange": "#bf360c",
    "White": "white"
};

for (const [name, value] of Object.entries(backgroundColours)) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = name;
    backgroundSelector.appendChild(opt);
}

backgroundSelector.addEventListener('change', function () {
    const selectedBackground = this.value;
    if (selectedBackground === 'default') {
        document.body.style.background = '';
    } else {
        document.body.style.background = selectedBackground;
    }
});

// < ======================================================
// < Calendar Selector
// < ======================================================

const calendarSelector = document.getElementById('calendar-selector');

const calendarColours = {
    "Default": "default",
    "Monochrome": "monochrome",
    "Emerald": "emerald",
    "Ocean": "ocean",
    "Sunset": "sunset",
    "Forest": "forest",
    "Neon": "neon",
    "Amber": "amber"
};

for (const [name, value] of Object.entries(calendarColours)) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = name;
    calendarSelector.appendChild(opt);
}

calendarSelector.addEventListener('change', function () {
    const selectedTheme = this.value;
    if (selectedTheme === 'default') {
        document.body.removeAttribute('data-theme');
    } else {
        document.body.setAttribute('data-theme', selectedTheme);
    }
});

// < ======================================================
// < Options Selector
// < ======================================================

const optionsSelector = document.getElementById('calendar-options');

const calendarOptions = {
    "Default": "",
    "Compact": "compact"
};

for (const [name, value] of Object.entries(calendarOptions)) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = name;
    optionsSelector.appendChild(opt);
}

optionsSelector.addEventListener('change', function () {
    const selectedOption = this.value;
    if (selectedOption === 'default') {
        calendar.className = '';
    } else {
        calendar.className = selectedOption;
    }
});

// < ======================================================
// < Month Navigation - Left and Right Buttons
// < ======================================================

leftButton.addEventListener('click', () => {
    navigateMonthDisplay(-1);
});

rightButton.addEventListener('click', () => {
    navigateMonthDisplay(+1);
});

// < ======================================================
// < Other
// < ======================================================

// Add this after your existing code
document.querySelector('.table').addEventListener('click', (event) => {
    if (event.target.classList.contains('cell') && event.target.textContent.match(/^\d+$/)) {
        if (event.target.classList.contains('inactive')) {
            return;
        }
        const day = parseInt(event.target.textContent) + 1;
        const year = dates.calendar.getFullYear();
        const month = dates.calendar.getMonth();

        const cellDate = new Date(year, month, day);

        event.target.classList.toggle('accented');

        console.log(`Clicked: ${cellDate.toISOString().split('T')[0]}`);
    }
});

// Arrow keys to change theme
const acceptedKeys = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
document.addEventListener('keydown', (event) => {
    if (!acceptedKeys.has(event.key)) return;
    event.preventDefault;

    const key = event.key;
    const colourKeys = Object.keys(calendarColours);
    const currentKey = colourKeys.find(k => calendarColours[k] === calendarSelector.value);
    const currentIndex = colourKeys.indexOf(currentKey);

    let change;
    if (key === "ArrowDown" || key === "ArrowLeft") {
        change = -1;
    } else if (key === "ArrowUp" || key === "ArrowRight") {
        change = +1;
    }

    const newIndex = (currentIndex + change + colourKeys.length) % colourKeys.length;
    const colourKey = colourKeys[newIndex];
    const colour = calendarColours[colourKey];
    calendarSelector.value = colour;
    calendarSelector.dispatchEvent(new Event('change'));

});

// Reset date to current date on click
monthSpan.addEventListener('click', () => {
    dates.calendar = new Date();
    updateMonthDisplay();
});

// Focus the calendar selector to allow arrow key control
calendarSelector.focus();

// ~ TODO
// - Mark current date
// - Wipe selections on month change