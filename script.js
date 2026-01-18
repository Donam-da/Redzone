document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendar-grid');
    const currentYearEl = document.getElementById('current-year');
    const prevYearBtn = document.getElementById('prev-year-btn');
    const nextYearBtn = document.getElementById('next-year-btn');
    const saveBtn = document.getElementById('save-btn');

    let currentYear = 2025;
    let markedDates = JSON.parse(localStorage.getItem('markedDates')) || {};

    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    const updateNavButtons = (year) => {
        prevYearBtn.disabled = year <= 2025;
    };

    const generateCalendar = (year) => {
        calendarGrid.innerHTML = '';
        currentYearEl.textContent = year;
        updateNavButtons(year);

        monthNames.forEach((monthName, monthIndex) => {
            const monthContainer = document.createElement('div');
            monthContainer.className = 'month-container';

            const monthHeader = document.createElement('h3');
            monthHeader.className = 'month-header';
            monthHeader.textContent = monthName;
            monthContainer.appendChild(monthHeader);

            const daysGrid = document.createElement('div');
            daysGrid.className = 'days-grid';

            // Add day names
            dayNames.forEach(name => {
                const dayNameEl = document.createElement('div');
                dayNameEl.className = 'day-name';
                dayNameEl.textContent = name;
                daysGrid.appendChild(dayNameEl);
            });

            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
            const firstDayOfMonth = new Date(year, monthIndex, 1).getDay(); // 0 = Sunday, 1 = Monday...

            // Add empty cells for days before the 1st
            for (let i = 0; i < firstDayOfMonth; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'day empty';
                daysGrid.appendChild(emptyCell);
            }

            // Add day cells
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'day';
                dayCell.textContent = day;
                
                const dateString = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                dayCell.dataset.date = dateString;

                if (markedDates[dateString]) {
                    dayCell.classList.add('marked');
                }
                
                // Highlight today
                const today = new Date();
                if (year === today.getFullYear() && monthIndex === today.getMonth() && day === today.getDate()) {
                    dayCell.classList.add('today');
                }

                dayCell.addEventListener('click', () => toggleMark(dateString, dayCell));
                daysGrid.appendChild(dayCell);
            }

            monthContainer.appendChild(daysGrid);
            calendarGrid.appendChild(monthContainer);
        });
    };

    const toggleMark = (dateString, cell) => {
        if (markedDates[dateString]) {
            delete markedDates[dateString];
            cell.classList.remove('marked');
        } else {
            markedDates[dateString] = true;
            cell.classList.add('marked');
        }
    };

    const saveMarkedDates = () => {
        localStorage.setItem('markedDates', JSON.stringify(markedDates));
        // Add a visual confirmation
        saveBtn.textContent = 'Đã lưu!';
        saveBtn.classList.add('saved');
        setTimeout(() => {
            saveBtn.textContent = 'Lưu';
            saveBtn.classList.remove('saved');
        }, 1500);
    };

    const container = document.querySelector('.container');
    let pointerStartX = 0;
    let pointerEndX = 0;
    let isDragging = false;

    const changeYear = (direction) => {
        if (direction === 'next') {
            currentYear++;
            generateCalendar(currentYear);
        } else if (direction === 'prev' && currentYear > 2025) {
            currentYear--;
            generateCalendar(currentYear);
        }
    };

    const handleGesture = () => {
        const swipeThreshold = 50; // Minimum distance for a swipe/drag
        if (pointerStartX - pointerEndX > swipeThreshold) {
            changeYear('next'); // Swiped/dragged left
        } else if (pointerEndX - pointerStartX > swipeThreshold) {
            changeYear('prev'); // Swiped/dragged right
        }
    };

    // Touch Events
    container.addEventListener('touchstart', e => {
        pointerStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', e => {
        pointerEndX = e.changedTouches[0].screenX;
        handleGesture();
    });

    // Mouse Events
    container.addEventListener('mousedown', e => {
        // Only for left click
        if (e.button !== 0) return;
        pointerStartX = e.screenX;
        isDragging = true;
        // Prevent text selection during drag
        e.preventDefault();
    });

    container.addEventListener('mouseup', e => {
        if (!isDragging || e.button !== 0) return;
        isDragging = false;
        pointerEndX = e.screenX;
        handleGesture();
    });

    container.addEventListener('mouseleave', e => {
        if (!isDragging) return;
        isDragging = false;
        pointerEndX = e.screenX;
        handleGesture();
    });

    // If the mouse is moved, we are dragging
    container.addEventListener('mousemove', e => {
        if (!isDragging) return;
        // This prevents clicks from firing on the dragged element
        e.preventDefault();
    });


    prevYearBtn.addEventListener('click', () => changeYear('prev'));
    nextYearBtn.addEventListener('click', () => changeYear('next'));

    saveBtn.addEventListener('click', saveMarkedDates);

    // Initial calendar generation
    generateCalendar(currentYear);
});
