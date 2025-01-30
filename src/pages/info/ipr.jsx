import React, { useEffect, useState } from "react";
import { Page, Navbar, Block, List, ListItem, Preloader, Button, Popover, f7 } from 'framework7-react';
import { updateRouter } from '@/components/app';
import { getProgressReport } from "@/js/grades-api";

const ProgressReportPage = ({ f7router }) => {
    updateRouter(f7router);
    const [loading, setLoading] = useState(true);
    const [progressReports, setProgressReports] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(0);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        getProgressReport()
            .then((data) => {
                setProgressReports(data.progressReports);
                setHasData(data.progressReports.length > 0);
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
            });
    }, []);

    function capitalizeHeader(string) {
        if (string.includes('com')){
            return string.toUpperCase();
        }
        else {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    }

    function getCurrentPeriod() {
        return progressReports[selectedPeriod].date;
    }


    const handlePeriodChange = (index) => {
        setSelectedPeriod(index);
        f7.popover.close();
    };

    return (
        <Page>
            <Navbar title="Progress Report" backLink="Back" />
            {loading ? (
                <div className='display-flex align-items-center justify-content-center' style={{ height: '100%', width: '100%' }}>
                    <Preloader />
                </div>
            ) : (
                hasData ? (
                    <>
                        <Button popoverOpen=".popover-menu" className="margin-top">Select Period (Current: {getCurrentPeriod()})</Button>
                        <Popover className="popover-menu">
                            <List>
                                {progressReports.map((report, index) => (
                                    <ListItem key={index} title={report.date} onClick={() => handlePeriodChange(index)} />
                                ))}
                            </List>
                        </Popover>
                        <Block strong className="margin-top report-card-block">
                            <table>
                                <thead>
                                <tr>
                                    {Object.keys(progressReports[selectedPeriod].report[0]).filter(key => key !== 'comments').map((key, index) => (
                                        <th key={index} className="table-header">{capitalizeHeader(key)}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {progressReports[selectedPeriod].report.filter(item => !item.comments).map((item, index) => (
                                    <tr key={index}>
                                        {Object.values(item).map((value, idx) => (
                                            <td key={idx} className="table-cell string-padding">{typeof value === 'object' ? JSON.stringify(value) : value}</td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </Block>
                        <Block strong className="margin-top report-card-block">
                            <h3>Comments</h3>
                            {Array.isArray(progressReports[selectedPeriod].report.find(item => item.comments)?.comments) &&
                                progressReports[selectedPeriod].report.find(item => item.comments).comments.map((comment, index) => (
                                    <p key={index} className="string-padding">{comment.comment}: {comment.commentDescription}</p>
                                ))
                            }
                        </Block>
                    </>
                ) : (
                    <Block strong className="margin-top">
                        <p>No progress report data available.</p>
                    </Block>
                )
            )}
        </Page>
    );
}

export default ProgressReportPage;