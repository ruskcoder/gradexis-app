import React, { useEffect, useState } from "react";
import {
    Page,
    Navbar,
    Block,
    List,
    ListItem,
    Preloader,
    Button,
    Popover,
    Card,
    CardContent,
    CardHeader,
    Link,
    Checkbox,
    Icon,
    f7
} from 'framework7-react';

import { getProgressReport } from "@/js/grades-api";

const ProgressReportPage = ({ f7router }) => {
    
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
        if (string.includes('com')) {
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
            {loading && 
                <div className='loader-container'>
                    <Preloader />
                </div>
            }
            {!loading && hasData &&
                <>
                    <Card className="data-table data-table-init">
                        <CardHeader>
                            <div className="data-table-title margin-right">Period: </div>
                            <Button fill small popoverOpen=".popover-menu">
                                {getCurrentPeriod()}
                            </Button>
                        </CardHeader>
                        <CardContent padding={false}>
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
                        </CardContent>
                    </Card>
                    <Block strong inset className="margin-top">
                        <h3>Comments</h3>
                        {Array.isArray(progressReports[selectedPeriod].report.find(item => item.comments)?.comments) &&
                            progressReports[selectedPeriod].report.find(item => item.comments).comments.map((comment, index) => (
                                <p key={index} className="string-padding">{comment.comment}: {comment.commentDescription}</p>
                            ))}
                    </Block>
                    <Popover className="popover-menu">
                        <List>
                            {progressReports.map((report, index) => (
                                <ListItem key={index} title={report.date} onClick={() => handlePeriodChange(index)} />
                            ))}
                        </List>
                    </Popover>
                </>
            }
            {!loading && !hasData && <Block strong inset>No data available</Block>}
        </Page>
    );
}

export default ProgressReportPage;