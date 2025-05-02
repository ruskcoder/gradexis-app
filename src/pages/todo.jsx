import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Page,
  Navbar,
  List,
  ListItem,
  Block,
  BlockTitle,
  Button,
  Fab,
  ListInput,
  Popover,
  Icon,
  Accordion,
  AccordionItem,
  AccordionToggle,
  AccordionContent,
  useStore,
  f7,
  f7ready
} from 'framework7-react';
// import $ from 'dom7'
import store from '../js/store';
import canvas from '../assets/canvas-logo.png';
import gcalendar from '../assets/google-calendar-logo.png';
const TodoPage = ({ f7router }) => {
  const user = useStore('currentUser');
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [todo, setTodo] = useState(user.todo != undefined ? user.todo : {})

  function addTodoItem(name, date) {
    let newTodo = { ...todo };

    if (!newTodo[date]) {
      newTodo[date] = {
        'complete': [],
        'incomplete': []
      };
    }
    newTodo[date]['incomplete'].push(name);

    const sortedEntries = Object.entries(newTodo).sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB));
    const sortedTodo = Object.fromEntries(sortedEntries);

    setTodo(sortedTodo);
    store.dispatch('changeUserData', {
      userNumber: store.state.currentUserNumber,
      item: 'todo',
      value: sortedTodo
    })
  }

  function dateToReadable(date) {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  }
  function completeTodo(date, index) {
    return () => {
      setTimeout(() => {
        let newTodo = { ...todo };
        newTodo[date]['complete'].push(newTodo[date]['incomplete'][index]);
        newTodo[date]['incomplete'].splice(index, 1);
        setTodo(newTodo);
        store.dispatch('changeUserData', {
          userNumber: store.state.currentUserNumber,
          item: 'todo',
          value: newTodo
        })
      }, 150)
    }
  }
  function uncompleteTodo(date, index) {
    return () => {
      setTimeout(() => {
        let newTodo = { ...todo };
        newTodo[date]['incomplete'].push(newTodo[date]['complete'][index]);
        newTodo[date]['complete'].splice(index, 1);
        setTodo(newTodo);
        store.dispatch('changeUserData', {
          userNumber: store.state.currentUserNumber,
          item: 'todo',
          value: newTodo
        })
      }, 150)
    }
  }
  function clearTodo() {
    return () => {
      window.dialog = f7.dialog.confirm('Are you sure you want to clear your todo list?', () => {
        window.dialog.close();
        setTodo({});
        store.dispatch('changeUserData', {
          userNumber: store.state.currentUserNumber,
          item: 'todo',
          value: {}
        })
      }).open()
    }
  }

  f7ready(() => {
    if (window.calendarInline) { return; }
    // window.calendarInline = f7.calendar.create({
    //   containerEl: '#calendar-todo',
    //   value: [new Date()],
    //   renderToolbar: function () {
    //     return `
    //       <div class="toolbar calendar-custom-toolbar no-shadow margin-bottom-half" 
    //         style="border-top-right-radius: var(--f7-block-inset-border-radius);
    //               border-top-left-radius: var(--f7-block-inset-border-radius)
    //         ">

    //         <div class="toolbar-inner">
    //           <div class="left">
    //       <a class="link icon-only"><i class="icon icon-back"></i></a>
    //           </div>
    //           <div class="center"></div>
    //           <div class="right">
    //       <a class="link icon-only"><i class="icon icon-forward"></i></a>
    //           </div>
    //         </div>
    //       </div>
    //     `;
    //   },
    //   on: {
    //     init: function (c) {
    //       document.querySelector('#calendar-todo .calendar-custom-toolbar .center').textContent = monthNames[c.currentMonth] + ', ' + c.currentYear;
    //       document.querySelector('#calendar-todo .calendar-custom-toolbar .left .link').addEventListener('click', function () {
    //         window.calendarInline.prevMonth();
    //       });
    //       document.querySelector('#calendar-todo .calendar-custom-toolbar .right .link').addEventListener('click', function () {
    //         window.calendarInline.nextMonth();
    //       });
    //     },
    //     monthYearChangeStart: function (c) {
    //       document.querySelector('#calendar-todo .calendar-custom-toolbar .center').textContent = monthNames[c.currentMonth] + ', ' + c.currentYear;
    //     }
    //   }
    // })
  });

  const createTodo = () => {
    return () => {
      let dialog = f7.dialog.prompt('Add a new todo', 'New Todo', (todo) => {
        dialog.close();
        dialog = f7.dialog.create({
          closeByBackdropClick: true,
          cssClass: 'todo-edit-dialog',
          content: '<div id="todo-add-calendar" class="padding-half"></div><div id="todo-dialog"></div>',
          buttons: [
            {
              text: 'Done',
              close: true,
              onClick: () => {
                addTodoItem(todo, window.currentTodoSelect);
              }
            }
          ]
        })
        dialog.open();
        window.f7alert = dialog;
        const TodoDialog = () => {
          const $ = f7.$;
          const calendarInline = useRef(null);
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
          calendarInline.current = f7.calendar.create({
            containerEl: '#todo-add-calendar',
            value: [new Date()],
            renderToolbar() {
              return `
            <div class="toolbar calendar-custom-toolbar" style="background-color: transparent;">
              <div class="toolbar-inner">
                <div class="left">
                  <a  class="link icon-only"><i class="icon icon-back"></i></a>
                </div>
                <div class="center"></div>
                <div class="right">
                  <a  class="link icon-only"><i class="icon icon-forward"></i></a>
                </div>
              </div>
            </div>
          `.trim();
            },
            on: {
              init(c) {
                $('#todo-add-calendar .calendar-custom-toolbar .center').text(
                  `${monthNames[c.currentMonth]}, ${c.currentYear}`,
                );
                $('#todo-add-calendar  .calendar-custom-toolbar .left .link').on('click', () => {
                  calendarInline.current.prevMonth();
                });
                $('#todo-add-calendar  .calendar-custom-toolbar .right .link').on('click', () => {
                  calendarInline.current.nextMonth();
                });
              },
              monthYearChangeStart(c) {
                $('#todo-add-calendar  .calendar-custom-toolbar .center').text(
                  `${monthNames[c.currentMonth]}, ${c.currentYear}`,
                );
              },
              change(c) {
                window.currentTodoSelect = c.value[0];
              },
            },
          });
          return (
            <>
              <List dividersMd dividersIos className='no-margin-top no-margin-bottom'>
                <ListItem disabled link="#" title="Set Time" noChevron className='list-border-top' id="set-time" popoverOpen=".popover-menu">
                  <Icon slot="media" material='schedule' />
                </ListItem>
              </List>
            </>
          )
        };
        createRoot(document.getElementById('todo-dialog')).render(
          <TodoDialog />
        );

        window.f7alert = dialog;
      }, () => {

      })
      dialog.open();
      window.f7alert = dialog

    }
  }



  return (
    <Page name="todo">
      <Navbar title="Todo" large />
      <Block id="calendar-todo" strong
        className="no-padding margin"
        style={{ borderRadius: "var(--f7-block-inset-border-radius)" }}
      />
      {/* <Block>
        <Button outline disabled style={{ marginBottom: '1em' }}>
          <img src={gcalendar} alt="Google Calendar Logo" style={{ width: '1.5em', marginRight: '0.5em' }} />
          Link with Google Calendar (Tasks)
        </Button>

        <Button outline disabled>
          <img src={canvas} alt="Canvas Logo" style={{ width: '1.5em', marginRight: '0.5em' }} />
          Link with Canvas
        </Button>
      </Block> */}
      <Block>
        <Button outline onClick={clearTodo()}>Clear All Todo</Button>
      </Block>
      {Object.entries(todo).map(([date, items]) => (
        <div key={date}>
          <BlockTitle>{dateToReadable(date)}</BlockTitle>
          <List strong inset outlineIos dividersIos>
            {items.incomplete.length > 0 && items.incomplete.map((item, index) => (
              <ListItem key={index} checkbox title={item} onClick={completeTodo(date, index)} />
            ))}
            {items.incomplete.length === 0 && <ListItem title="No Incomplete items" />}
            <ListItem accordionItem title="Completed Items" style={{ borderTop: "1px solid var(--f7-list-item-border-color)" }}>
              <AccordionContent>
                <List>
                  {items.complete.map((item, index) => (
                    <ListItem key={index} checkbox title={item} checked onClick={uncompleteTodo(date, index)} />
                  ))}
                </List>
              </AccordionContent>
            </ListItem>
          </List>
        </div>
      ))}

      <Fab position="right-bottom" slot="fixed" onClick={createTodo()}>
        <Icon ios="f7:plus" md="material:add" />
      </Fab>
    </Page>
  );
};

export default TodoPage;
