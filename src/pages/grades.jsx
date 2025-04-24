import React, { useEffect, useState, useMemo, useRef, useCallback, use } from 'react';
import {
  Page,
  Card,
  CardContent,
  CardHeader,
  Navbar,
  Subnavbar,
  Segmented,
  Button,
  List,
  ListItem,
  Progressbar,
  f7,
  Preloader,
  BlockTitle,
  Block,
  useStore,
  Link,
  AccordionContent,
  CardFooter,
} from 'framework7-react';
import { ClassGradeItem, CardClassGradeItem } from '../components/grades-item.jsx';
import { errorDialog, initEmits } from '../components/app.jsx';
import { getClasses } from '../js/grades-api.js';
import $ from 'dom7';
import { createRoot } from 'react-dom/client';
import { terminal } from 'virtual:terminal'
import store from '../js/store.js';
import e from 'cors';
const GradesPage = ({ f7router }) => {
  // initEmits(f7, f7router);
  const user = useStore('currentUser');
  const [sortMode, setSortMode] = useState(false);
  const [globalgradelist, setGradelist] = useState(store.state.currentUser.gradelist);
  const useCacheToast = useRef(null);

  const [activeButtonIndex, setActiveButtonIndex] = useState(store.state.activeButtonIndex);

  const [loading, setLoading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState('Logging In...');
  const [termsLoading, setTermsLoading] = useState(false);
  const [usingCache, setUsingCache] = useState(false);

  useEffect(() => {
    store.state.activeButtonIndex = activeButtonIndex;
  }, [activeButtonIndex])

  const updateTermGradelist = (term, classes) => {
    const previousTerm = Object.keys(store.state.currentUser.gradelist).pop();
    const previousTermGradelist = store.state.currentUser.gradelist[previousTerm] || {};

    // Initialize or update the gradelist for the selected term
    const updatedTermGradelist = classes.reduce((acc, item) => {
      if (store.state.currentUser.gradelist[term] && store.state.currentUser.gradelist[term][item.name]) {
        // Update existing class data for the term
        acc[item.name] = {
          ...store.state.currentUser.gradelist[term][item.name],
          average: item.average,
          course: item.course,
          scores: item.scores || [],
          categories: item.categories || {},
        };
      } else if (previousTermGradelist[item.name]) {
        // Match hide, rename, and other properties from the previous term
        acc[item.name] = {
          ...previousTermGradelist[item.name],
          average: item.average,
          course: item.course,
          scores: item.scores || [],
        };
      } else {
        // Add new classes to the end
        acc[item.name] = {
          hide: false,
          rename: item.name,
          average: item.average,
          course: item.course,
          scores: item.scores || [],
          categories: item.categories || {},
        };
      }
      return acc;
    }, {});

    // Add or update the lastUpdated field for the term
    updatedTermGradelist.lastUpdated = new Date();

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
    return updatedGradelist;
  };

  useEffect(() => {
    window.activeButtonIndex = activeButtonIndex;
  }, [activeButtonIndex]);
  const cacheToastTimeout = (newterm) => {
    return setTimeout(() => {
      if (!useCacheToast.current
        && Object.keys(user.gradelist).length > 0
        && user.gradelist[newterm] != undefined) {
        useCacheToast.current = f7.toast.create({
          text: `Taking a while to load. Use cached data for term ${newterm}?`,
          closeButton: true,
          closeButtonText: 'Yes',
          closeButtonColor: 'red',
          closeTimeout: 100000,
          on: {
            close: () => {
              useCacheToast.current = null;
            },
            closeButtonClick: () => {
              if (useCacheToast.current) {
                useCacheToast.current.close();
              }
              if (activeButtonIndex == -1) {
                setActiveButtonIndex(user.termList.indexOf(newterm));
              }
              else {
                store.dispatch('changeUserData', {
                  userNumber: store.state.currentUserNumber,
                  item: 'term',
                  value: newterm,
                });
              }
              store.state.loaded = true;
              setLoading(false);
              setTermsLoading(false);
              setUsingCache(true);
            }
          }
        });
        const checkTabActive = async () => {
          while (!$('#view-grades').attr('class').includes('tab-active')) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          if (useCacheToast.current) {
            useCacheToast.current.open();
          }
          while ($('#view-grades').attr('class').includes('tab-active') && useCacheToast.current) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          if (useCacheToast.current) { useCacheToast.current.close() }
        };
        checkTabActive();
      }
    }, 3000);
  }
  const closeCacheToast = (timeout) => {
    clearTimeout(timeout);
    if (useCacheToast.current) {
      useCacheToast.current.close();
      useCacheToast.current = null;
    }
  }

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setTermsLoading(true);
        setLoading(true);
        window.cacheToastTimeout = cacheToastTimeout(user.term);

        const classesGen = getClasses();
        let done = false;
        let data;
        while (done == false) {
          let result = await classesGen.next()
          done = result.done;
          if (done) { data = result.value; break; }
          if (result.value) {
            setProgressPercent(result.value.percent);
            setProgressMessage(result.value.message);
          }
        }

        store.state.loaded = true;
        closeCacheToast(window.cacheToastTimeout);

        if (data.success !== false && !usingCache) {
          if (user.termList.length == 0) {
            store.dispatch('changeUserData', {
              userNumber: store.state.currentUserNumber,
              item: 'termList',
              value: data.termList,
            });
          }
          store.dispatch('changeUserData', {
            userNumber: store.state.currentUserNumber,
            item: 'term',
            value: data.term,
          });
          if (data.scoresIncluded) {
            store.dispatch('changeUserData', {
              userNumber: store.state.currentUserNumber,
              item: 'scoresIncluded',
              value: true,
            });
          }
          setActiveButtonIndex(data.termList.indexOf(data.term));
          setTermsLoading(false);
          setLoading(false);
          updateTermGradelist(data.term, data.classes);
        }
      } catch (err) {
        clearTimeout(window.cacheToastTimeout); // Clear the timeout if an error occurs
        errorDialog(err.message);
        throw err;
      }
    };

    if (user.username && !store.state.loaded) {
      fetchClasses();
    }
  }, [user.username]);

  const switchTerm = async (index) => {
    const selectedTerm = user.termList[index];
    setProgressMessage('Logging In...');
    try {
      setLoading(true);
      setActiveButtonIndex(index);
      closeCacheToast(window.cacheToastTimeout);
      window.cacheToastTimeout = cacheToastTimeout(user.termList[index]);

      const classesGen = getClasses(selectedTerm);
      let done = false;
      let data;
      while (done == false) {
        let result = await classesGen.next()
        done = result.done;
        if (done) { data = result.value; break; }
        if (result.value) {
          setProgressPercent(result.value.percent);
          setProgressMessage(result.value.message);
        }
      }

      if (data.success !== false) {
        updateTermGradelist(data.term, data.classes);

        if (user.termList[window.activeButtonIndex] === data.term) {
          closeCacheToast(window.cacheToastTimeout);

          if (data.scoresIncluded) {
            store.dispatch('changeUserData', {
              userNumber: store.state.currentUserNumber,
              item: 'scoresIncluded',
              value: true,
            });
          }

          store.dispatch('changeUserData', {
            userNumber: store.state.currentUserNumber,
            item: 'term',
            value: data.term,
          });

          setActiveButtonIndex(user.termList.indexOf(data.term));
          setTermsLoading(false);
          setLoading(false);
        }
      } else {
        closeCacheToast(window.cacheToastTimeout);
        errorDialog(data.message);
      }
    } catch (err) {
      closeCacheToast(window.cacheToastTimeout);
      errorDialog(err.message);
      throw err;
    }
  };

  const ptr = (done) => {
    getClasses(user.termList[activeButtonIndex]).then((data) => {
      if (data.success != false) {
        done();
        store.dispatch('setClasses', data.classes);
        store.dispatch('setTerm', data.term);
      }
      else {
        done();
        errorDialog(data.message)
      }
    }).catch((e) => { errorDialog(e.message) })
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
    $('.grades-list-item, .grade-card').each(function () {
      const course = $(this).find('.item-subtitle, .subtitle').text().trim();

      $(this).on('click', function () {
        const cls = Object.keys(store.state.currentUser.gradelist[user.term]).find(
          key => store.state.currentUser.gradelist[user.term][key].course === course
        );
        const opts = store.state.currentUser.gradelist[user.term][cls];
        try {
          if (opts.hide) {
            createDialog(course, true);
          } else {
            if (opts.average !== "" && sortMode === false) {
              f7router.navigate(`/grades/${cls}/`)
            }
          }
        }
        catch {
          //pass
        }
      });

      if ($(this).attr('class') && !$(this).attr('class').includes('grade-card')) {
        $(this).on('taphold', function () {
          const hidden = Object.values(store.state.currentUser.gradelist[user.term]).find(
            item => item.course === course
          ).hide;
          createDialog(course, hidden);
        });
      }
    });
  },
    [sortMode, termsLoading, user.gradelist, createDialog, f7router, user.term]);

  const lastUpdated = () => {
    const lastUpdated = new Date(user.gradelist[user.term].lastUpdated);
    return lastUpdated.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  return (
    <Page name="grades" >
      <Navbar title="Grades" subtitle={usingCache ? `Last Updated: ${lastUpdated()}` : ""} sliding={true} className='navbar-grades'>

      </Navbar>
      {loading &&
        <Block className='display-flex align-items-center flex-direction-column justify-content-center'>
          {user.stream != false &&
            <>
              <Progressbar progress={progressPercent} />
              <BlockTitle style={{ marginTop: 12, }}>{progressMessage}</BlockTitle>
            </>
          }
          {user.stream == false &&
            <Preloader />
          }
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
      {!loading && user.gradesView == "card" &&
        <div className='cards-grades'>
          {Object.keys(globalgradelist[user.term] || {}).map((item, index) => (
            globalgradelist[user.term][item] && globalgradelist[user.term][item].hide == false && (
              <CardClassGradeItem
                key={index}
                title={globalgradelist[user.term][item].rename}
                subtitle={globalgradelist[user.term][item].course}
                grade={globalgradelist[user.term][item].average}
              />
            )
          ))}
        </div>
      }

      {!loading && (user.gradesView ? user.gradesView == "list" : true) &&
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