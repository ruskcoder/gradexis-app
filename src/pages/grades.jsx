import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Page, BlockFooter, Navbar, Subnavbar, Segmented, Button, List, ListItem, ListButton, f7, Preloader, CardHeader, Block, useStore, f7ready, AccordionContent } from 'framework7-react';
import { ClassGradeItem } from '../components/grades-item.jsx';
import { errorDialog, initEmits } from '../components/app.jsx';
import { getClasses } from '../js/grades-api.js';
import $ from 'dom7';
import { createRoot } from 'react-dom/client';

import store from '../js/store.js';
import CalendarComponent from 'framework7/components/calendar';
const GradesPage = ({ f7router }) => {
  // initEmits(f7, f7router);
  const user = useStore('currentUser');
  const classes = useStore('classes');
  const term = useStore('term');
  const termList = useStore('termList');
  const [sortMode, setSortMode] = useState(false);
  const [globalgradelist, setGradelist] = useState(store.state.currentUser.gradelist);
  useEffect(() => {
    if (term == -1) {
      setTermsLoading(true);
    }
    if (classes.length != 0) {
      setActiveButtonIndex(termList.indexOf(term));
      setTermsLoading(false);
      if (!store.state.currentUser.gradelist) {
        const gradelist = classes.reduce((acc, item) => {
          acc[item.name] = { hide: false, rename: item.name, grade: item.average, course: item.course };
          return acc;
        }, {});
        store.dispatch('changeUserData',
          {
            userNumber: store.state.currentUserNumber,
            item: 'gradelist',
            value: gradelist
          }
        )
        setGradelist({ ...gradelist });
      }
      const classNames = new Set(classes.map((item) => item.name));
      const gradeListNames = new Set(Object.keys(store.state.currentUser.gradelist));
      // console.log([...classNames].every(name => gradeListNames.has(name)));
      // console.log(Object.keys(store.state.currentUser.gradelist).sort())

      setLoading(false);
    }
  }, [classes, term, termList]);
  const [activeButtonIndex, setActiveButtonIndex] = useState(-1);

  const [loading, setLoading] = useState(true);
  const [termsLoading, setTermsLoading] = useState(true);

  const switchTerm = (index) => {
    setLoading(true);
    setActiveButtonIndex(index);
    getClasses(termList[index]).then((data) => {
      if (!('success' in data)) {
        store.dispatch('setClasses', data.classes);
        store.dispatch('setTerm', data.term);
      }
      else {
        errorDialog(data.message)
      }
    }).catch(() => { errorDialog() })
  }
  const createAverages = () => {
    return;
  }

  const ptr = (done) => {
    getClasses(termList[activeButtonIndex]).then((data) => {
      if (!('success' in data)) {
        done();
        store.dispatch('setClasses', data.classes);
        store.dispatch('setTerm', data.term);
      }
      else {
        done();
        errorDialog(data.message)
      }
    }).catch(() => { errorDialog() })
  };

  const handleCourseAction = (course, action) => {
    const gradelist = store.state.currentUser.gradelist;
    const key = Object.keys(gradelist).find(key => gradelist[key].course === course);
    if (!key) return;

    // Check if hiding the last visible item
    const visibleItems = Object.values(gradelist).filter(item => !item.hide);
    if (action === 'hide' && visibleItems.length <= 1) {
      f7.dialog.alert('You need at least one item unhidden.');
      return;
    }

    if (action === 'unhide') gradelist[key].hide = false;
    if (action === 'hide') gradelist[key].hide = true;
    if (action === 'rename') {
      f7.dialog.prompt(
        `Enter a new course name for: ${course}`,
        'Rename',
        (value) => {
          gradelist[key].rename = value;
          updateGradelist(gradelist);
        }
      );
      return;
    }

    updateGradelist(gradelist);
  };

  const updateGradelist = (gradelist) => {
    store.dispatch('changeUserData', {
      userNumber: store.state.currentUserNumber,
      item: 'gradelist',
      value: gradelist,
    });
    setGradelist({ ...gradelist });
  };

  const createDialog = (course, hidden) => {
    f7.dialog.create({
      title: 'Options',
      cssClass: 'options-dialog',
      closeByBackdropClick: true,
      buttons: [
        !hidden && {
          text: 'Reorder',
          strong: true,
          onClick: () => setSortMode(!sortMode),
        },
        {
          text: hidden ? 'Unhide' : 'Hide',
          strong: true,
          onClick: () => handleCourseAction(course, hidden ? 'unhide' : 'hide'),
        },
        {
          text: 'Rename',
          strong: true,
          onClick: () => handleCourseAction(course, 'rename'),
        },
      ].filter(Boolean), // Filter out `false` values
    }).open();
  };

  useEffect(() => {
    $('.grades-list-item').each(function () {
      const course = $(this).find('.item-subtitle').text().trim();

      $(this).on('click', function () {
        const cls = Object.keys(store.state.currentUser.gradelist).find(
          key => store.state.currentUser.gradelist[key].course === course
        );
        const opts = store.state.currentUser.gradelist[cls];
        if (opts.hide) {
          createDialog(course, true);
        } else {
          if (opts.grade != "" && sortMode == false) {
            f7router.navigate(`/grades/${cls}/`);
          }
        }
      });

      $(this).on('taphold', function () {
        const hidden = Object.values(store.state.currentUser.gradelist).find(
          item => item.course === course
        ).hide;
        createDialog(course, hidden);
      });
    });
  }, [sortMode, termsLoading, user.gradelist]);


  const completeSorting = () => {
    setSortMode(false);
    const list = $('.grades-list-item');
    const gradelist = store.state.currentUser.gradelist;
    var newGradelist = {};
    list.each(function (index) {
      const name = $(this).find('.item-title').text().trim();
      newGradelist[name] = gradelist[name];
    });
    var hidden = {}
    for (const [key, val] of Object.entries(gradelist)) {
      if (val && val.hide == true) {
        hidden[key] = val;
      }
    }
    newGradelist = { ...newGradelist, ...hidden };
    store.dispatch('changeUserData', {
      userNumber: store.state.currentUserNumber,
      item: 'gradelist',
      value: newGradelist
    });
    setGradelist({ ...newGradelist });
  }
  return (
    <Page name="grades" >
      <Navbar title="Grades" >

      </Navbar>
      {loading &&
        <Block className='display-flex align-items-center justify-content-center'>
          <Preloader />
        </Block>
      }

      {!termsLoading &&
        <Subnavbar sliding={true} style={{ marginTop: "-1px !important" }}>
          <Segmented strong>
            {termList.map((_, index) => (
              <Button
                key={index}
                smallMd
                active={activeButtonIndex === index}
                onClick={() => switchTerm(index)}
              >
                {termList[index]}
              </Button>
            ))}
          </Segmented>
        </Subnavbar>
      }
      {sortMode &&
        <Button fill className={`margin-left margin-right margin-top-half ${user.groupLists == true ? "margin-bottom-half" : ""}`} onClick={() => completeSorting()}>
          Complete Sorting
        </Button>
      }
      {/* {!sortMode && <Button fill onClick={setSortMode(false)}>Complete Sorting</Button>} */}
      {!loading &&
        <>
          <List
            dividersIos={user.groupLists == true}
            outlineIos={user.groupLists == true}
            strongIos={user.groupLists == true}
            mediaList
            noChevron
            className={`gradesList list-padding mod-list mt-fix ${user.groupLists == true ? "" : "iosRound"}`}
            sortable={sortMode}
            sortableEnabled={sortMode}
          >
            {Object.keys(globalgradelist).map((item, index) => (
              globalgradelist[item] && globalgradelist[item].hide == false && (
                <ListItem key={index}
                  link="#"
                  className='grades-list-item'>
                  <ClassGradeItem
                    title={globalgradelist[item].rename}
                    subtitle={globalgradelist[item].course}
                    grade={globalgradelist[item].grade}
                  />
                </ListItem>
              )
            ))}
          </List>
          {sortMode && <List strong dividersIos insetMd accordionList insetIos>
            <ListItem accordionItem title="Hidden Items">
              <AccordionContent>
                <List>
                  {Object.keys(globalgradelist).map((item, index) => (
                    globalgradelist[item].hide == true && (
                      <ListItem key={index}
                        link=""
                        className='grades-list-item'>
                        <ClassGradeItem
                          title={globalgradelist[item].rename}
                          subtitle={globalgradelist[item].course}
                          grade={globalgradelist[item].grade}
                        />
                      </ListItem>
                    )
                  ))}
                </List>
              </AccordionContent>
            </ListItem>
          </List>}
        </>
      }
    </Page>
  );
};

export default GradesPage;