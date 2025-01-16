import React, { useEffect, useRef, useState } from 'react';
import { Page, Navbar, Block, List, ListItem, f7, Preloader } from 'framework7-react';
import { errorDialog, updateRouter } from '../../components/app';
import { getAttendance } from '../../js/grades-api';

const AttendancePage = ({ f7router }) => {
  updateRouter(f7router);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getAttendance().then((data) => {
      if (!('success' in data)) {
        setLoading(false);
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthIndex = monthNames.indexOf(data.month);
        const year = parseInt(data.year, 10);
        calendarRef.current.setYearMonth(year, monthIndex);

        const newEvents = Object.keys(data.events).map(event => {
          const [month, day, year] = event.split('/');
          return {
            date: new Date("20" + year, month - 1, day),
            color: data.events[event].color,
            title: data.events[event].event,
          };
        });

        setEvents(newEvents);
        calendarRef.current.params.events = newEvents;
        calendarRef.current.update();
        document.querySelectorAll('.calendar-day-event').forEach(function (e) { e.parentElement.parentElement.style.backgroundColor = e.style.backgroundColor })
        console.log(newEvents);
      }
      else {
        errorDialog(data.message)
      }
    });
  }, []);
 
  const calendarRef = useRef(null);

  const onPageInit = (page) => {

    const $ = f7.$;
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    calendarRef.current = f7.calendar.create({
      containerEl: '#calendar',
      value: [new Date()],
      firstDay: 0,
      events: events,
      renderToolbar: function () {
        return `
              <div class="toolbar calendar-custom-toolbar no-shadow margin-bottom-half" 
                style="border-top-right-radius: var(--f7-block-inset-border-radius);
                      border-top-left-radius: var(--f7-block-inset-border-radius)
                ">
                
                <div class="toolbar-inner">
                  <div class="left">
              <a class="link icon-only"><i class="icon icon-back"></i></a>
                  </div>
                  <div class="center"></div>
                  <div class="right">
              <a class="link icon-only"><i class="icon icon-forward"></i></a>
                  </div>
                </div>
              </div>
            `;
      },
      on: {
        init: function (c) {
          console.log('Calendar initialized');
          document.querySelector('#calendar .calendar-custom-toolbar .center').textContent = monthNames[c.currentMonth] + ', ' + c.currentYear;
          document.querySelector('#calendar .calendar-custom-toolbar .left .link').addEventListener('click', function () {
            calendarRef.current.prevMonth();
          });
          document.querySelector('#calendar .calendar-custom-toolbar .right .link').addEventListener('click', function () {
            calendarRef.current.nextMonth();
          });
        },
        monthYearChangeStart: function (c) {
          document.querySelector('#calendar .calendar-custom-toolbar .center').textContent = monthNames[c.currentMonth] + ', ' + c.currentYear;
          document.querySelectorAll('.calendar-day-event').forEach(function (e) { e.parentElement.parentElement.style.backgroundColor = e.style.backgroundColor })
        }
      }
    })
  }
  const onPageBeforeRemove = () => {
    calendarRef.current.destroy();
  };

  return (
    <Page onPageInit={onPageInit} onPageBeforeRemove={onPageBeforeRemove}>
      <Navbar backLink="Back" title="Attendance">
      </Navbar>
      <Block id="calendar" strong
        className="no-padding margin"
        style={{ borderRadius: "var(--f7-block-inset-border-radius)" }}
      />

      <List id="calendar-events"
        noHairlines
        mediaList
        inset
        strong
        className="no-margin-top">
        {loading && (
          <div className='display-flex align-items-center justify-content-center' style={{ height: '100%', width: '100%' }}>
            <Preloader />
          </div>
        )}
        {events.map((event, index) => (
          <ListItem key={index} title={event.title} subtitle={`${event.date.getMonth() + 1}/${event.date.getDate()}/${event.date.getFullYear()}`}>
            <div
              slot="media"
              style={{
                borderRadius: '8px',
                backgroundColor: event.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                width: '44px',
                height: '44px',
              }}
            >
              {event.date.getDate()}
            </div>
          </ListItem>
        ))}
      </List>
    </Page>
  );
}

export default AttendancePage;
