import React, { useEffect, useState } from "react";
import { Page, Navbar, Block, List, ListItem, Preloader } from 'framework7-react';
import { updateRouter } from '@/components/app';
import { getSchedule } from "@/js/grades-api";

const SchedulePage = ({ f7router }) => {
    updateRouter(f7router);
    const [loading, setLoading] = useState(true);
    const [schedule, setSchedule] = useState([]);

    useEffect(() => {
        getSchedule().then((data) => {
            console.log(data);
            // List the type of data
            console.log(typeof data);
            setSchedule(data);
            setLoading(false);
        });
    }, []);

    return (
        <Page>
            <Navbar title="Schedule" backLink="Back" />
            <Block strong inset>
                {loading ? (
                    <div className='display-flex align-items-center justify-content-center' style={{ height: '100%', width: '100%' }}>
                        <Preloader />
                    </div>
                ) : (
                    <List mediaList>
                        {schedule.schedule.map((item, index) => (
                            <ListItem
                                key={index}
                                title={item.Description}
                                subtitle={`Teacher: ${item.Teacher}, Room: ${item.Room}, Periods: ${item.Periods}`}
                                text={`Days: ${item.Days}, Marking Periods: ${item['Marking Periods']}, Building: ${item.Building}, Status: ${item.Status}`}
                            />
                        ))}
                    </List>
                )}
            </Block>
        </Page>
    );
}

export default SchedulePage;