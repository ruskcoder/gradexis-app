import React, { useEffect, useState } from "react";
import { Page, Navbar, Block, List, ListItem, Preloader, Link, f7, useStore } from 'framework7-react';
import { primaryFromColor, updateRouter } from '@/components/app';
import { getTeachers } from "@/js/grades-api";

const TeachersPage = ({ f7router }) => {
    updateRouter(f7router);
    const [loading, setLoading] = useState(true);
    const [teachers, setTeachers] = useState([]);
    const user = useStore('currentUser');

    useEffect(() => {
        getTeachers()
            .then((data) => {
                setTeachers(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching teachers data:', error);
                setLoading(false);
            });
    }, []);

    function filterTeachers(teachers) {
        let unique = {};
        teachers = teachers.filter(obj => !unique[obj.teacher] && (unique[obj.teacher] = true) && (obj.teacher !== ""));
        console.log(teachers);
        return teachers;
    }

    function prettifyName(name) {
        let splitName = name.split(', ');
        return splitName[1] + ' ' + splitName[0];
    }

    function teacherInitials(name) {
        let splitName = name.split(' ');
        return splitName[0].charAt(0) + splitName[1].charAt(0);
    }

    return (
        <Page>
            <Navbar title="Teachers" backLink="Back" />
            {loading ? (
                <div className='display-flex align-items-center justify-content-center' style={{ height: '100%', width: '100%' }}>
                    <Preloader />
                </div>
            ) : (
                <List mediaList inset strong className="margin-top teachers-list">
                    {teachers.teachers.length > 0 ? (
                        filterTeachers(teachers.teachers).map((item, index) => (
                            <ListItem
                                key={index}
                                title={prettifyName(item.teacher)}
                                subtitle={item.email}
                                text={item.class}>
                                <div slot="media" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '44px',
                                    height: '44px',
                                    backgroundColor: `var(--f7-${user.layout}-primary)`,
                                    borderRadius: '8px',
                                    color: 'var(--f7-text-editor-bg-color)',
                                    fontWeight: '600'
                                }}>
                                    {teacherInitials(item.teacher)}
                                </div>
                                <Link
                                    iconMaterial="link"
                                    className='material-symbols-outlined'
                                    style={{height: '24px', width: '24px'}}
                                    slot="after"
                                    onClick={() => navigator.clipboard.writeText(item.email)}
                                />
                            </ListItem>
                        ))
                    ) : (
                        <Block strong>No teacher data available</Block>
                    )}
                </List>
            )}
        </Page>
    );
}

export default TeachersPage;