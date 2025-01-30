import React, { useEffect, useState } from "react";
import { createRoot } from 'react-dom/client';
import { Page, Navbar, Block, List, ListItem, Preloader, f7 } from 'framework7-react';
import { updateRouter } from '@/components/app';
import { getSchedule } from "@/js/grades-api";
const SchedulePage = ({ f7router }) => {
    updateRouter(f7router);
    const [loading, setLoading] = useState(true);
    const [schedule, setSchedule] = useState([]);

    useEffect(() => {
        getSchedule().then((data) => {
            setSchedule(data);
            setLoading(false);
        });
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
            {loading ? (
                <div className='display-flex align-items-center justify-content-center' style={{ height: '100%', width: '100%' }}>
                    <Preloader />
                </div>
            ) : (
                <List mediaList inset strong className="margin-top">
                    {schedule.schedule.map((item, index) => (
                        <ListItem
                            key={index}
                            title={item.Description}
                            link="#"
                            onClick={infoDialog(item)}
                            subtitle={`${item.Teacher}, Room: ${item.Room}`}
                            // text={`${item.Days}, Marking Periods: ${item['Marking Periods']}, Building: ${item.Building}, Status: ${item.Status}`}
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
                                    fontWeight: 'bolder',
                                    width: '44px',
                                    height: '44px',
                                }}
                            >
                                {item.Periods}
                            </div>
                        </ListItem>
                    ))}
                </List>
            )}
        </Page>
    );
}

export default SchedulePage;