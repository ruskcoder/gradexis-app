import React, { useEffect, useRef, useState } from 'react';
import { Page, Navbar, Block, List, ListItem, f7, Preloader } from 'framework7-react';
import { errorDialog, updateRouter } from '../../components/app';
import { getAttendance } from '../../js/grades-api';

const AttendancePage = ({ f7router }) => {
  updateRouter(f7router);
  const [loading, setLoading] = useState(true);
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

        // eslint-disable-next-line react-hooks/exhaustive-deps
        events = Object.keys(data.events).map(event => {
          const [month, day, year] = event.split('/');
          return {
            date: new Date("20"+year, month - 1, day),
            color: data.events[event].color,
            title: data.events[event].event,
          };
        });
        calendarRef.current.params.events = events;
        console.log(events)
        calendarRef.current.update();

      }
      else {
        errorDialog(data.message)
      }
    });
  }, []);
  // setTimeout(() => {
  //   events = [
  //     {
  //       date: new Date(2025, 0, 1),
  //       color: '#FF0000',
  //       title: 'Event 1',
  //     },
  //     {
  //       date: new Date(2025, 1, 1),
  //       color: '#4caf50',
  //       title: 'Event 2',
  //     },
  //   ]
  //     calendarRef.current.params.events = events;
  //     calendarRef.current.update();
  // }, 5000);
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const today = new Date(year, month, day);
  let events = [
    
  ];

  const [eventItems, setEventItems] = useState([]);
  const calendarRef = useRef(null);

  const renderEvents = (calendar) => {
    const currentDate = calendar.value[0];
    const currentEvents = events.filter(
      (event) =>
        event.date.getTime() >= currentDate.getTime() &&
        event.date.getTime() < currentDate.getTime() + 24 * 60 * 60 * 1000,
    );

    const newEventItems = [];
    if (currentEvents.length) {
      currentEvents.forEach((event) => {
        const hours = event.hours;
        let minutes = event.minutes;
        if (minutes < 10) minutes = `0${minutes}`;
        newEventItems.push({
          title: event.title,
          time: `${hours}:${minutes}`,
          color: event.color,
        });
      });
    }
    setEventItems([...newEventItems]);
  };

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
      <List id="calendar-events" noHairlines className="no-margin no-safe-area-left">
        {eventItems.map((item, index) => (
          <ListItem key={index} title={item.title} after={item.time}>
            <div
              className="event-color"
              style={{ backgroundColor: item.color }}
              slot="root-start"
            ></div> 
          </ListItem>
        ))}
        {loading && (
            <div className='display-flex align-items-center justify-content-center' style={{height: '100%', width: '100%'}}>
              <Preloader />
            </div>
        )}

      </List>
    </Page>
  );
}

export default AttendancePage;
