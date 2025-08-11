import React, { useEffect, useState, useMemo, useRef, useCallback, use, useDebugValue } from 'react';
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
import { errorDialog } from '../components/app.jsx';
import { getClasses } from '../js/grades-api.js';
import $, { prev } from 'dom7';
import { createRoot } from 'react-dom/client';
import { terminal } from 'virtual:terminal'
import store from '../js/store.js';
import { updateGradelist, updateScoresIncludedHistory, updateTermGradelist } from '../js/gradelist.jsx';

const GradesPage = ({ f7router }) => {
  const user = useStore('currentUser');
  const userNumber = useStore('currentUserNumber');

  const [sortMode, setSortMode] = useState(false);
  const globalgradelist = useStore('gradelist')

  const [activeButtonIndex, setActiveButtonIndex] = useState(-1);

  const [loading, setLoading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState('Logging In...');
  const [termsLoading, setTermsLoading] = useState(false);
  const [usingCache, setUsingCache] = useState(false);
  const [invalidData, setInvalidData] = useState(false);

  useEffect(() => {
    if (user.username) {
      if (window.classesFetch) {
        window.classesFetch.abort();
      }
      setInvalidData(false);
      setLoading(true);
      setTermsLoading(true);
      setUsingCache(false);
      setProgressPercent(0);
      setProgressMessage('Logging In...');
      setActiveButtonIndex(-1);
      fetchClasses();
    }
  }, [userNumber]);

  f7.on('refetch', () => {
    if (user.username) {
      if (window.classesFetch) {
        window.classesFetch.abort();
      }
      setInvalidData(false);
      setLoading(true);
      setTermsLoading(true);
      setUsingCache(false);
      setProgressPercent(0);
      setProgressMessage('Logging In...');
      setActiveButtonIndex(-1);
      fetchClasses();
    }
  });

  async function fetchClasses(index = -1) {
    if (window.classesFetch) {
      window.classesFetch.abort();
    }
    var selectedTerm = null;
    if (index == -1) {
      setTermsLoading(true);
    } else {
      selectedTerm = user.termList[index];
      setActiveButtonIndex(index);
    }
    setLoading(true);
    setProgressPercent(0);
    setProgressMessage('Fetching Classes...');
    setUsingCache(false);
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
      setProgressPercent(100);
      setProgressMessage('Done!');
      if (data.termList.length > 0) {

        updateTermGradelist(data.term, data.classes);

        store.dispatch('changeUserData', {
          item: 'termList',
          value: data.termList,
        });
        store.dispatch('changeUserData', {
          item: 'term',
          value: data.term,
        });
        store.dispatch('changeUserData', {
          item: 'scoresIncluded',
          value: !!data.scoresIncluded,
        });
        if (data.scoresIncluded) {
          updateScoresIncludedHistory(data.term, data.classes);
        }
        setActiveButtonIndex(data.termList.indexOf(data.term));
        setTermsLoading(false);
        setLoading(false);
        setUsingCache(false);
        store.state.loaded = true;
        setTimeout(() => {
          const subnavbar = document.querySelector('.subnavbar-terms .segmented');
          if (subnavbar) {
            subnavbar.scrollTo({
              left: subnavbar.scrollWidth,
              behavior: 'smooth'
            });
          }
        }, 10);
      }
      else {
        setInvalidData(true);
      }
    }
    else if (data.success == false) {
      if (data.message !== "abort") {
        errorDialog(data.message);
      }
    }
  }

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

  const handleCourseAction = useCallback((course, action) => {
    const termGradelist = user.gradelist[user.term];
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
    const termGradelist = user.gradelist[user.term];
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

  useEffect(() => {
    $('.grades-list-item, .grade-card').each(function () {
      const course = $(this).find('.item-subtitle, .subtitle').text().trim();

      $(this).on('click', function () {
        if (!(window.f7alert && window.f7alert.opened == true)) {
          const cls = Object.keys(user.gradelist[user.term]).find(
            key => user.gradelist[user.term][key].course === course
          );
          const opts = user.gradelist[user.term][cls];
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
            const hidden = Object.values(user.gradelist[user.term]).find(
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
    const lastUpdated = new Date(user.gradelist[user.term].lastUpdated);
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

  const setCacheMode = () => {
    setUsingCache(true);
    setLoading(false);
    if (activeButtonIndex === -1) {
      setActiveButtonIndex(user.termList.indexOf(user.term));
    }
    else {
      store.dispatch('changeUserData', {
        item: 'term',
        value: user.termList[activeButtonIndex],
      });
    }
    setTermsLoading(false);
  }

  return (
    <Page name="grades" >
      <Navbar title="Grades" subtitle={usingCache ? `Last Updated: ${lastUpdated()}` : ""} sliding={true} className='navbar-grades'>

      </Navbar>
      {loading && !invalidData &&
        <Block className='display-flex align-items-center flex-direction-column justify-content-center'>
          {user.stream != false &&
            <>
              <Progressbar progress={progressPercent} />
              <BlockTitle style={{ marginTop: 12, }}>{progressMessage}</BlockTitle>
            </>
          }
          {user.stream == false &&
            <Preloader className='margin-bottom' />
          }
          <Button small fillIos outlineMd className='margin-top-half' onClick={() => setCacheMode()} disabled={!Object.keys(globalgradelist).includes(user.term)}>
            Load from Storage
          </Button>
        </Block>
      }

      {invalidData &&
        <Block strong inset>No valid data was returned</Block>
      }

      {!termsLoading && user.termList &&
        <Subnavbar sliding={true} style={{ marginTop: "-1px !important" }} className='subnavbar-terms'>
          <Segmented strong>
            {user.termList.map((_, index) => (
              <Button
                key={index}
                smallMd
                active={activeButtonIndex === index}
                onClick={() => fetchClasses(index)}
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
              <CardGradeItem
                key={index}
                index={index}
                theme={user.theme}
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
                  className='grades-list-item'
                  style={{ "--index": index }}
                >
                  <GradeItem
                    index={index}
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