import React, { useEffect, useState } from "react";
import { createRoot } from 'react-dom/client';
import { Page, Navbar, Block, List, ListItem, Preloader, f7 } from 'framework7-react';

import { getSchedule } from "@/js/grades-api";
import { errorDialog } from "../../components/app";
const SchedulePage = ({ f7router }) => {
    
    const [loading, setLoading] = useState(true);
    const [schedule, setSchedule] = useState([]);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        getSchedule().then((data) => {
            if (data.success != false) {
                setSchedule(data);
                setHasData(data.schedule.length > 0)
                setLoading(false);
            }
            else {
                errorDialog(data.message);
            }
        }).catch((error) => {
            errorDialog(error.message);
        })
    }, []);

    const infoDialog = (schedule) => {
        return () => {
            var scheduleItems = Object.keys(schedule);
            var description = schedule['Description'];
            scheduleItems = scheduleItems.filter(item => item !== 'Description');
            const container = document.createElement('div');
            createRoot(container).render(
                <>
                    <div className="extra-info last-info grid grid-cols-2 grid-gap margin-top">
                        {
                            scheduleItems.map((item, index) => (
                                <div key={index}>
                                    <p className="info-category-title" style={{ whiteSpace: 'normal' }}>{item}</p>
                                    <p className="info-category-data" style={{ whiteSpace: 'normal' }}>{schedule[item]}</p>
                                </div>
                            ))
                        }
                    </div>
                </>
            );

            setTimeout(() => {
                window.f7alert = f7.dialog.create({
                    title: description,
                    closeByBackdropClick: true,
                    cssClass: 'extra-info-dialog',
                    content: container.innerHTML,
                })
                window.f7alert.open();
            }, 0);
        }
    }
    return (
        <Page>
            <Navbar title="Schedule" backLink="Back" />
            {loading &&
                <div className='loader-container'>
                    <Preloader />
                </div>
            }
            {!loading && hasData &&
                <List mediaList inset strong className="margin-top" noChevron>
                    {schedule.schedule.map((item, index) => (
                        <ListItem
                            key={index}
                            title={item.Description}
                            link="#"
                            onClick={infoDialog(item)}
                            subtitle={item.Teacher}
                            after={item.Room}
                        >
                            <div
                                slot="media"
                                style={{
                                    borderRadius: '8px',
                                    backgroundColor: "var(--f7-theme-color)",
                                    color: "var(--f7-text-editor-bg-color)",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    fontWeight: '600er',
                                    width: '44px',
                                    height: '44px',
                                }}
                            >
                                {item.Periods}
                            </div>
                        </ListItem>
                    ))}
                </List>
            }
            {!loading && !hasData && <Block strong inset>No data available</Block>}

        </Page>
    );
}

export default SchedulePage;