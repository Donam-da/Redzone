document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const calendarGrid = document.getElementById('calendar-grid');
    const currentYearEl = document.getElementById('current-year');
    const prevYearBtn = document.getElementById('prev-year-btn');
    const nextYearBtn = document.getElementById('next-year-btn');
    const saveBtn = document.getElementById('save-btn');
    const editBtn = document.getElementById('edit-btn');

    let currentYear = 2025;
    let markedDates = JSON.parse(localStorage.getItem('markedDates')) || {};
    let inEditMode = false;
    const editPassword = '523181';

    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    const setEditMode = (isEditing) => {
        inEditMode = isEditing;
        if (isEditing) {
            container.classList.remove('view-mode');
        } else {
            container.classList.add('view-mode');
        }
    };

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
            dayNames.forEach(name => {
                const dayNameEl = document.createElement('div');
                dayNameEl.className = 'day-name';
                dayNameEl.textContent = name;
                daysGrid.appendChild(dayNameEl);
            });
            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
            const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
            for (let i = 0; i < firstDayOfMonth; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'day empty';
                daysGrid.appendChild(emptyCell);
            }
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'day';
                dayCell.textContent = day;
                const dateString = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                dayCell.dataset.date = dateString;
                if (markedDates[dateString]) {
                    dayCell.classList.add('marked');
                }
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
        if (!inEditMode) return;
        if (markedDates[dateString]) {
            delete markedDates[dateString];
            cell.classList.remove('marked');
        } else {
            markedDates[dateString] = true;
            cell.classList.add('marked');
        }
    };

    const saveMarkedDates = () => {
        if (!inEditMode) return;
        localStorage.setItem('markedDates', JSON.stringify(markedDates));
        saveBtn.textContent = 'Đã lưu!';
        saveBtn.classList.add('saved');
        setTimeout(() => {
            saveBtn.textContent = 'Lưu';
            saveBtn.classList.remove('saved');
            setEditMode(false); // Automatically exit edit mode
        }, 1500);
    };

    editBtn.addEventListener('click', () => {
        const password = prompt('Nhập mật khẩu để chỉnh sửa:');
        if (password === editPassword) {
            setEditMode(true);
        } else if (password !== null && password !== "") {
            alert('Mật khẩu không đúng!');
        }
    });
    
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
        const swipeThreshold = 50;
        if (pointerStartX - pointerEndX > swipeThreshold) {
            changeYear('next');
        } else if (pointerEndX - pointerStartX > swipeThreshold) {
            changeYear('prev');
        }
    };

    container.addEventListener('touchstart', e => { pointerStartX = e.changedTouches[0].screenX; }, { passive: true });
    container.addEventListener('touchend', e => { pointerEndX = e.changedTouches[0].screenX; handleGesture(); });
    container.addEventListener('mousedown', e => { if (e.button !== 0) return; pointerStartX = e.screenX; isDragging = true; e.preventDefault(); });
    container.addEventListener('mouseup', e => { if (!isDragging || e.button !== 0) return; isDragging = false; pointerEndX = e.screenX; handleGesture(); });
    container.addEventListener('mouseleave', e => { if (!isDragging) return; isDragging = false; pointerEndX = e.screenX; handleGesture(); });
    container.addEventListener('mousemove', e => { if (!isDragging) e.preventDefault(); });

    prevYearBtn.addEventListener('click', () => changeYear('prev'));
    nextYearBtn.addEventListener('click', () => changeYear('next'));
    saveBtn.addEventListener('click', saveMarkedDates);

    // Initial setup
    setEditMode(false); // Start in view-only mode
    generateCalendar(currentYear);

});
