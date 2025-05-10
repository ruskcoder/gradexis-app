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
import { GradeItem, CardGradeItem } from '../components/grades-item.jsx';
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
  const [cardColor, setCardColor] = useState(store.state.currentUser.theme)

  useEffect(() => {
    store.state.activeButtonIndex = activeButtonIndex;
  }, [activeButtonIndex])

  const updateTermGradelist = (term, classes) => {
    const previousTerm = Object.keys(store.state.currentUser.gradelist).pop();
    const previousTermGradelist = store.state.currentUser.gradelist[previousTerm] || {};
    const updatedTermGradelist = Object.keys(previousTermGradelist).reduce((acc, key) => {
      const item = classes.find(cls => cls.name === key);
      if (item) {
        acc[key] = {
          ...previousTermGradelist[key],
          average: item.average,
          course: item.course,
          scores: item.scores || [],
          categories: item.categories || {},
        };
      }
      return acc;
    }, {});

    // Add any new classes that are not in the previousTermGradelist
    classes.forEach(item => {
      if (!updatedTermGradelist[item.name]) {
        updatedTermGradelist[item.name] = {
          hide: false,
          rename: item.name,
          average: item.average,
          course: item.course,
          scores: item.scores || [],
          categories: item.categories || {},
        };
      }
    });

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

  const cacheToastTimeout = (newterm) => {
    const timeoutId = setTimeout(() => {
      if (useCacheToast.current == null
        && Object.keys(store.state.currentUser.gradelist).length > 0
        && store.state.currentUser.gradelist[newterm] != undefined) {
        useCacheToast.current = f7.toast.create({
          text: `Taking a while to load. Use cached data for term ${newterm}?`,
          closeButton: true,
          closeButtonText: 'Yes',
          closeButtonColor: 'red',
          closeTimeout: 10000,
          buttons: [
            {
              text: 'No',
              color: 'blue',
              onClick: () => {
                if (useCacheToast.current) {
                  useCacheToast.current.close();
                }
                setLoading(false);
                setTermsLoading(false);
                setUsingCache(false);
              }
            }
          ],
          on: {
            close: () => {
              useCacheToast.current = null;
            },
            closeButtonClick: () => {
              if (useCacheToast.current) {
                useCacheToast.current.close();
              }
              setActiveButtonIndex(store.state.currentUser.termList.indexOf(newterm));
              store.dispatch('changeUserData', {
                userNumber: store.state.currentUserNumber,
                item: 'term',
                value: newterm,
              });
              store.state.loaded = true;
              store.state.useCache = true;
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
          if (useCacheToast.current) { useCacheToast.current.close(); }
        };
        checkTabActive();
      }
    }, 1);

    return timeoutId;
  };

  useEffect(() => {
    return () => {
      if (window.cacheToastTimeout) {
        clearTimeout(window.cacheToastTimeout);
      }
    };
  }, []);

  const closeCacheToast = (timeout) => {
    clearTimeout(timeout);
    if (useCacheToast.current) {
      useCacheToast.current.close();
      useCacheToast.current = null;
    }
  }

  useEffect(() => {
    f7.on('userChanged', function () {
      if (!loading) {
        if (window.classesFetch) {
          window.classesFetch.abort();
        }
        useCacheToast.current = null;
        closeCacheToast(window.cacheToastTimeout);
        setLoading(true);
        setTermsLoading(true);
        setUsingCache(false);
        setProgressPercent(0);
        setProgressMessage('Logging In...');
        setActiveButtonIndex(-1);
        fetchClasses();
      }
    })
    const fetchClasses = async () => {
      try {
        setTermsLoading(true);
        setLoading(true);
        window.cacheToastTimeout = cacheToastTimeout(store.state.currentUser.term);
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

        closeCacheToast(window.cacheToastTimeout);

        if (data.success !== false && !usingCache && data.termList.length > 0) {
          if (store.state.currentUser.termList != data.termList) {
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
          else {
            store.dispatch('changeUserData', {
              userNumber: store.state.currentUserNumber,
              item: 'scoresIncluded',
              value: false,
            });
          }
          if (!usingCache) {
            setActiveButtonIndex(data.termList.indexOf(data.term));
            setTermsLoading(false);
            setLoading(false);
            store.state.loaded = true;
            setTimeout(
              function () {
                const subnavbar = document.querySelector('.subnavbar-terms .segmented');
                if (subnavbar) {
                  subnavbar.scrollTo({
                    left: subnavbar.scrollWidth,
                    behavior: 'smooth'
                  });
                }
              }, 1
            )
          }
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
  }, [user.username, store.state.currentUser.username]);

  const switchTerm = async (index) => {
    if (window.classesFetch) {
      window.classesFetch.abort();
    }
    const selectedTerm = store.state.currentUser.termList[index];
    setProgressMessage('Logging In...');
    setUsingCache(false);
    store.state.useCache = false;
    store.state.loaded = false;
    try {
      setLoading(true);
      setActiveButtonIndex(index);
      closeCacheToast(window.cacheToastTimeout);
      window.cacheToastTimeout = cacheToastTimeout(store.state.currentUser.termList[index]);

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
        if (data.termList[store.state.activeButtonIndex] == data.term) {
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
          store.state.loaded = true;
          setActiveButtonIndex(store.state.currentUser.termList.indexOf(data.term));
          setTermsLoading(false);
          setLoading(false);
        }
      } else {
        if (data.message != "abort") {
          closeCacheToast(window.cacheToastTimeout);
          errorDialog(data.message);
        }
      }
    } catch (err) {
      closeCacheToast(window.cacheToastTimeout);
      errorDialog(err.message);
      throw err;
    }
  };

  const ptr = (done) => {
    getClasses(store.state.currentUser.termList[activeButtonIndex]).then((data) => {
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
    const updatedGradelist = {
      ...store.state.currentUser.gradelist,
      [term]: { ...termGradelist, lastUpdated: store.state.currentUser.gradelist[term].lastUpdated },
    };
    store.dispatch('changeUserData', {
      userNumber: store.state.currentUserNumber,
      item: 'gradelist',
      value: updatedGradelist,
    });
    setGradelist({ ...updatedGradelist });
  }, []);

  const handleCourseAction = useCallback((course, action) => {
    const termGradelist = store.state.currentUser.gradelist[user.term];
    if (!termGradelist) return;

    const key = Object.keys(termGradelist).find(key => termGradelist[key].course === course);
    if (!key) return;

    // Check if hiding the last visible item
    const visibleItems = Object.values(termGradelist).filter(item => !item.hide);
    if (action === 'hide' && visibleItems.length <= 1) {
      window.f7alert = f7.dialog.alert('You need at least one item unhidden.');
      return;
    }

    if (action === 'unhide') termGradelist[key].hide = false;
    if (action === 'hide') termGradelist[key].hide = true;
    if (action === 'rename') {
      window.f7alert = f7.dialog.prompt(
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

  const createDialog = useCallback((course, hidden) => {
    window.f7alert = f7.dialog.create({
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
      const course = $(this).find('.item-subtitle').text().trim();
      const cls = Object.keys(termGradelist).find(key => termGradelist[key].course === course);
      if (cls) {
        newTermGradelist[cls] = {
          ...termGradelist[cls],
          hide: false,
        };
      }
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
        if (!(window.f7alert && window.f7alert.opened == true)) {
          const cls = Object.keys(store.state.currentUser.gradelist[user.term]).find(
            key => store.state.currentUser.gradelist[user.term][key].course === course
          );
          const opts = store.state.currentUser.gradelist[user.term][cls];
          try {
            if (opts.hide) {
              createDialog(course, true);
            } else {
              if (opts.average !== "" && sortMode === false) {
                f7router.navigate(`/grades/${encodeURIComponent(cls)}/`)
              }
            }
          }
          catch {
            //pass
          }
        }
      });

      if ($(this).attr('class') && !$(this).attr('class').includes('grade-card')) {
        $(this).on('taphold', function () {
          if (!(window.f7alert && window.f7alert.opened == true)) {
            const hidden = Object.values(store.state.currentUser.gradelist[user.term]).find(
              item => item.course === course
            ).hide;
            createDialog(course, hidden);
          }
        });
      }
    });
  },
    [sortMode, termsLoading, user.gradelist, createDialog, f7router, user.term]);

  const lastUpdated = () => {
    const lastUpdated = new Date(store.state.currentUser.gradelist[store.state.currentUser.term].lastUpdated);
    try {
      return lastUpdated.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    catch (e) {
      return ""
    }
  }
  f7.on('themeUpdated', function () {
    if (cardColor != user.theme) {
      setCardColor(user.theme);
    }
  })
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

      {!termsLoading && store.state.currentUser.termList &&
        <Subnavbar sliding={true} style={{ marginTop: "-1px !important" }} className='subnavbar-terms'>
          <Segmented strong>
            {store.state.currentUser.termList.map((_, index) => (
              <Button
                key={index}
                smallMd
                active={activeButtonIndex === index}
                onClick={() => switchTerm(index)}
              >
                {store.state.currentUser.termList[index]}
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
              <CardGradeItem
                key={index}
                index={index}
                theme={cardColor}
                title={globalgradelist[user.term][item].rename}
                subtitle={globalgradelist[user.term][item].course}
                grade={globalgradelist[user.term][item].average}
              />
            )
          ))}
        </div>
      }

      {!loading && (store.state.currentUser.gradesView ? store.state.currentUser.gradesView == "list" : true) &&
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
                  <GradeItem
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
                        <GradeItem
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