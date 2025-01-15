import React from 'react';
import { Page, Navbar, List, ListItem, Block, Button, useStore, f7, f7ready } from 'framework7-react';
// import $ from 'dom7'
import store from '../js/store';
import canvas from '../assets/canvas-logo.png';
import gcalendar from '../assets/google-calendar-logo.png';
const TodoPage = ({ f7router }) => {
  const users = useStore('users');
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  f7ready(() => {
    if (window.calendarInline) {return; }
    window.calendarInline = f7.calendar.create({
      containerEl: '#calendar-todo',
      value: [new Date()],
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
          document.querySelector('.calendar-custom-toolbar .center').textContent = monthNames[c.currentMonth] + ', ' + c.currentYear;
          document.querySelector('.calendar-custom-toolbar .left .link').addEventListener('click', function () {
            window.calendarInline.prevMonth();
          });
          document.querySelector('.calendar-custom-toolbar .right .link').addEventListener('click', function () {
            window.calendarInline.nextMonth();
          });
        },
        monthYearChangeStart: function (c) {
          document.querySelector('.calendar-custom-toolbar .center').textContent = monthNames[c.currentMonth] + ', ' + c.currentYear;
        }
      }
    })
  });

  return (
    <Page name="todo">
      <Navbar title="Todo (coming soon)" subtitle='Coming Soon' large/>
      <Block id="calendar-todo" strong 
        className="no-padding margin" 
        style={{borderRadius: "var(--f7-block-inset-border-radius)"}}
      />
      <Block>
        
      <Button outline disabled style={{ marginBottom: '1em' }}>
          <img src={gcalendar} alt="Google Calendar Logo" style={{ width: '1.5em', marginRight: '0.5em' }} />
          Link with Google Calendar
        </Button>

        <Button outline disabled>
          <img src={canvas} alt="Canvas Logo" style={{ width: '1.5em', marginRight: '0.5em' }} />
          Link with Canvas (coming soon!)
        </Button>
      </Block>
    </Page>
  );
};

export default TodoPage;
