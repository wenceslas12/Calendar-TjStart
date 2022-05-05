const calendarTable = document.getElementById('calendar_table');
const events1 = [];
const readTable = (calendarTable) => {
    for (let i = 0; i < calendarTable.rows.length; i++) {
        const event = [];
        const oCell = calendarTable.rows.item(i).cells
        const cellLenght = oCell.length;
        for (let j = 0; j < cellLenght; j++) {
            const value = oCell.item(j).innerHTML;
            event.push(value.trim());
        }
        const single_event = {
            title: event[0],
            start: event[1],
            end: event[2]
        }
        events1.push(single_event);
    }
}
readTable(calendarTable);

document.addEventListener('DOMContentLoaded', function () {
    let calendarEl = document.getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        displayEventEnd: true,
        timeFormat: 'hh:mm:ss',
        locale: 'cs',
        events: events1
    });
    calendar.render();
});
calendarTable.remove();