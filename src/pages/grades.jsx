import React, { useEffect, useState, useMemo, useRef, useCallback, use } from 'react';
import { Page, BlockFooter, Navbar, Subnavbar, Segmented, Button, List, ListItem, ListButton, f7, Preloader, CardHeader, Block, useStore, f7ready, AccordionContent } from 'framework7-react';
import { ClassGradeItem } from '../components/grades-item.jsx';
import { errorDialog, initEmits } from '../components/app.jsx';
import { getClasses } from '../js/grades-api.js';
import $ from 'dom7';
import { createRoot } from 'react-dom/client';

import store from '../js/store.js';
import e from 'cors';
const GradesPage = ({ f7router }) => {
  // initEmits(f7, f7router);
  const user = useStore('currentUser');
  const [sortMode, setSortMode] = useState(false);
  const [globalgradelist, setGradelist] = useState(store.state.currentUser.gradelist);
  useEffect(() => {
    setTermsLoading(true);

    if (user.username) {
      getClasses().then((data) => {
        if (!('success' in data)) {
          store.dispatch('changeUserData',
            {
              userNumber: store.state.currentUserNumber,
              item: 'termList',
              value: data.termList
            }
          )
          store.dispatch('changeUserData',
            {
              userNumber: store.state.currentUserNumber,
              item: 'term',
              value: data.term
            }
          )
          setActiveButtonIndex(user.termList.indexOf(data.term));
          setTermsLoading(false);
          setLoading(false);
          if (store.state.currentUser.gradelist && store.state.currentUser.gradelist[data.term]) {
            for (const item of data.classes) {
              if (store.state.currentUser.gradelist[data.term][item.name]) {
                store.state.currentUser.gradelist[data.term][item.name]['average'] = item.average;
                if (data.scoresIncluded) {
                  store.state.scoresIncluded = true;
                  store.state.currentUser.gradelist[data.term][item.name]['scores'] = item.scores;
                  store.state.currentUser.gradelist[data.term][item.name]['categories'] = item.categories;
                }
              }
              else {
                let found = false;
                for (const [className, opts] of Object.entries(store.state.currentUser.gradelist[data.term])) {
                  if (opts.course == item.course) {
                    delete store.state.currentUser.gradelist[data.term][className];
                    store.state.currentUser.gradelist[data.term][item.name] = opts;
                    store.state.currentUser.gradelist[data.term][item.name]['rename'] = item.name;
                    found = true;
                    break;
                  }
                }
                if (!found) {
                  store.state.currentUser.gradelist[data.term][item.name] = { hide: false, rename: item.name, average: item.average, course: item.course, scores: {}, categories: {} };
                }
              }
            }
            for (const item of Object.keys(store.state.currentUser.gradelist[data.term])) {
              if (!data.classes.find((classItem) => classItem.name == item)) {
                delete store.state.currentUser.gradelist[data.term][item];
              }
            }
            store.dispatch('changeUserData',
              {
                userNumber: store.state.currentUserNumber,
                item: 'gradelist',
                value: store.state.currentUser.gradelist
              }
            )
          }
          else if (store.state.currentUser.gradelist && !store.state.currentUser.gradelist[data.term]) {
            const gradelist = { [data.term]: {} };

            // Get the previous term's gradelist if it exists
            const previousTerm = Object.keys(store.state.currentUser.gradelist).pop();
            const previousTermGradelist = store.state.currentUser.gradelist[previousTerm] || {};

            // Create the new term gradelist based on the previous term
            for (const item of data.classes) {
              if (previousTermGradelist[item.name]) {
                // Match hide, rename, and other properties from the previous term
                gradelist[data.term][item.name] = {
                  ...previousTermGradelist[item.name],
                  average: item.average, // Update the grade for the new term
                  course: item.course, // Ensure the course is updated
                };
              } else {
                // Add new classes to the end
                gradelist[data.term][item.name] = {
                  hide: false,
                  rename: item.name,
                  average: item.average,
                  course: item.course,
                  scores: {},
                  categories: {},
                };
              }
            }

            // Dispatch the updated gradelist to the store
            store.dispatch('changeUserData', {
              userNumber: store.state.currentUserNumber,
              item: 'gradelist',
              value: { ...store.state.currentUser.gradelist, ...gradelist },
            });

            // Update the local state
            setGradelist({ ...store.state.currentUser.gradelist, ...gradelist });
          }
          else {
            const gradelist = {
              [data.term]: data.classes.reduce((acc, item) => {
                acc[item.name] = { hide: false, rename: item.name, average: item.average, course: item.course, scores: {}, categories: {} };
                return acc;
              }, {})
            };
            store.dispatch('changeUserData',
              {
                userNumber: store.state.currentUserNumber,
                item: 'gradelist',
                value: gradelist
              }
            )
            setGradelist({ ...gradelist });
          }
        }
      })
      // .catch(() => { errorDialog() })
    }
  }, [user.username])

  const [activeButtonIndex, setActiveButtonIndex] = useState(-1);

  const [loading, setLoading] = useState(true);
  const [termsLoading, setTermsLoading] = useState(true);

  const switchTerm = (index) => {
    setLoading(true);
    setActiveButtonIndex(index);

    getClasses(user.termList[index]).then((data) => {
      if (!('success' in data)) {
        const term = data.term;
        const classes = data.classes;

        // Get the previous term's gradelist if it exists
        const previousTerm = Object.keys(store.state.currentUser.gradelist).pop();
        const previousTermGradelist = store.state.currentUser.gradelist[previousTerm] || {};

        // Initialize or update the gradelist for the selected term
        const updatedTermGradelist = classes.reduce((acc, item) => {
          if (store.state.currentUser.gradelist[term] && store.state.currentUser.gradelist[term][item.name]) {
            // Update existing class data for the term
            acc[item.name] = {
              ...store.state.currentUser.gradelist[term][item.name],
              average: item.average, // Update the grade for the term
              course: item.course, // Ensure the course is updated
              scores: item.scores || [], // Add scores as a list
              categories: item.categories || {}, // Update categories
            };
          } else if (previousTermGradelist[item.name]) {
            // Match hide, rename, and other properties from the previous term
            acc[item.name] = {
              ...previousTermGradelist[item.name],
              average: item.average, // Update the grade for the new term
              course: item.course, // Ensure the course is updated
              scores: item.scores || [], // Add scores as a list
            };
          } else {
            // Add new classes to the end
            acc[item.name] = {
              hide: false,
              rename: item.name,
              average: item.average,
              course: item.course,
              scores: item.scores || [], // Add scores as a list
              categories: item.categories || {},
            };
          }
          return acc;
        }, {});

        // Update the store and state with the updated term gradelist
        const updatedGradelist = {
          ...store.state.currentUser.gradelist,
          [term]: updatedTermGradelist,
        };

        store.dispatch('changeUserData', {
          userNumber: store.state.currentUserNumber,
          item: 'gradelist',
          value: updatedGradelist,
        });

        setGradelist(updatedGradelist);

        // Update the store with the new term and classes
        store.dispatch('setClasses', classes);
        store.dispatch('setTerm', term);
        setActiveButtonIndex(user.termList.indexOf(term));
        setTermsLoading(false);
        setLoading(false);
      } else {
        errorDialog(data.message);
      }
    }).catch((err) => {
      errorDialog(err.message);
    });
  };

  const createAverages = () => {
    return;
  }

  const ptr = (done) => {
    getClasses(user.termList[activeButtonIndex]).then((data) => {
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

  // Update updateGradelist to handle term-based gradelist
  const updateGradelist = useCallback((term, termGradelist) => {
    const updatedGradelist = { ...store.state.currentUser.gradelist, [term]: termGradelist };
    store.dispatch('changeUserData', {
      userNumber: store.state.currentUserNumber,
      item: 'gradelist',
      value: updatedGradelist,
    });
    setGradelist({ ...updatedGradelist });
  }, []);

  // Update handleCourseAction to handle term-based gradelist
  const handleCourseAction = useCallback((course, action) => {
    const termGradelist = store.state.currentUser.gradelist[user.term];
    if (!termGradelist) return;

    const key = Object.keys(termGradelist).find(key => termGradelist[key].course === course);
    if (!key) return;

    // Check if hiding the last visible item
    const visibleItems = Object.values(termGradelist).filter(item => !item.hide);
    if (action === 'hide' && visibleItems.length <= 1) {
      f7.dialog.alert('You need at least one item unhidden.');
      return;
    }

    if (action === 'unhide') termGradelist[key].hide = false;
    if (action === 'hide') termGradelist[key].hide = true;
    if (action === 'rename') {
      f7.dialog.prompt(
        `Enter a new course name for: ${course}`,
        'Rename',
        (value) => {
          termGradelist[key].rename = value;
          updateGradelist(user.term, termGradelist);
        }
      );
      return;
    }

    updateGradelist(user.term, termGradelist);
  }, [user.term, updateGradelist]);

  // Update createDialog to pass the correct term-based gradelist
  const createDialog = useCallback((course, hidden) => {
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
  }, [sortMode, handleCourseAction]);

  // Update completeSorting to handle term-based gradelist
  const completeSorting = () => {
    setSortMode(false);
    const list = $('.grades-list-item');
    const termGradelist = store.state.currentUser.gradelist[user.term];
    if (!termGradelist) return;

    let newTermGradelist = {};
    list.each(function () {
      const name = $(this).find('.item-title').text().trim();
      newTermGradelist[name] = termGradelist[name];
    });

    const hidden = {};
    for (const [key, val] of Object.entries(termGradelist)) {
      if (val && val.hide === true) {
        hidden[key] = val;
      }
    }

    newTermGradelist = { ...newTermGradelist, ...hidden };
    updateGradelist(user.term, newTermGradelist);
  };

  // Update the click and taphold handlers in the useEffect
  useEffect(() => {
    $('.grades-list-item').each(function () {
      const course = $(this).find('.item-subtitle').text().trim();

      $(this).on('click', function () {
        const cls = Object.keys(store.state.currentUser.gradelist[user.term]).find(
          key => store.state.currentUser.gradelist[user.term][key].course === course
        );
        const opts = store.state.currentUser.gradelist[user.term][cls];
        if (opts.hide) {
          createDialog(course, true);
        } else {
          if (opts.grade !== "" && sortMode === false) {
            f7router.navigate(`/grades/${cls}/`);
          }
        }
      });

      $(this).on('taphold', function () {
        const hidden = Object.values(store.state.currentUser.gradelist[user.term]).find(
          item => item.course === course
        ).hide;
        createDialog(course, hidden);
      });
    });
  }, [sortMode, termsLoading, user.gradelist, createDialog, f7router, user.term]);
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
            {user.termList.map((_, index) => (
              <Button
                key={index}
                smallMd
                active={activeButtonIndex === index}
                onClick={() => switchTerm(index)}
              >
                {user.termList[index]}
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
            {Object.keys(globalgradelist[user.term] || {}).map((item, index) => (
              globalgradelist[user.term][item] && globalgradelist[user.term][item].hide == false && (
                <ListItem key={index}
                  link="#"
                  className='grades-list-item'>
                  <ClassGradeItem
                    title={globalgradelist[user.term][item].rename}
                    subtitle={globalgradelist[user.term][item].course}
                    grade={globalgradelist[user.term][item].average}
                  />
                </ListItem>
              )
            ))}
          </List>
          {sortMode && <List strong dividersIos insetMd accordionList insetIos>
            <ListItem accordionItem title="Hidden Items">
              <AccordionContent>
                <List>
                  {Object.keys(globalgradelist[user.term] || {}).map((item, index) => (
                    globalgradelist[user.term][item].hide == true && (
                      <ListItem key={index}
                        link=""
                        className='grades-list-item'>
                        <ClassGradeItem
                          title={globalgradelist[user.term][item].rename}
                          subtitle={globalgradelist[user.term][item].course}
                          grade={globalgradelist[user.term][item].average}
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