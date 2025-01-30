import React, { useEffect, useState } from "react";
import { Page, Navbar, Block, List, ListItem, Preloader, Button, Popover, f7 } from 'framework7-react';
import { updateRouter } from '@/components/app';
import { getReportCard } from "@/js/grades-api";

const ReportCardPage = ({ f7router }) => {
    updateRouter(f7router);
    const [loading, setLoading] = useState(true);
    const [reportCards, setReportCards] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(0);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        getReportCard()
            .then((data) => {
                setReportCards(data.reportCards);
                setHasData(data.reportCards.length > 0);
                setLoading(false);
            })
            .catch(() => {
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
        return reportCards[selectedPeriod].reportCardRun;
    }

    const handlePeriodChange = (index) => {
        setSelectedPeriod(index);
        f7.popover.close();
    };

    return (
        <Page>
            <Navbar title="Report Card" backLink="Back" />
            {loading ? (
                <div className='display-flex align-items-center justify-content-center' style={{ height: '100%', width: '100%' }}>
                    <Preloader />
                </div>
            ) : (
                hasData ? (
                    <>
                        <Button popoverOpen=".popover-menu" className="margin-top">Select Period (Current : {getCurrentPeriod()})</Button>
                        <Popover className="popover-menu">
                            <List>
                                {reportCards.map((report, index) => (
                                    <ListItem key={index} title={`Period ${report.reportCardRun}`} onClick={() => handlePeriodChange(index)} />
                                ))}
                            </List>
                        </Popover>
                        <Block strong className="margin-top report-card-block">
                            <table>
                                <thead>
                                <tr>
                                    {Object.keys(reportCards[selectedPeriod].report[0]).filter(key => key !== 'comments' && key !== 'totalEarnedCredit').map((key, index) => (
                                        <th key={index} className="table-header">{capitalizeHeader(key)}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {reportCards[selectedPeriod].report.filter(item => !item.comments).map((item, index) => (
                                    <tr key={index}>
                                        {Object.entries(item).filter(([key]) => key !== 'comments' && key !== 'totalEarnedCredit').map(([key, value], idx) => (
                                            <td key={idx} className="table-cell string-padding">{typeof value === 'object' ? JSON.stringify(value) : value}</td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={Object.keys(reportCards[selectedPeriod].report[0]).length} className="table-cell string-padding">Total Earned Credit: {reportCards[selectedPeriod].report.find(item => item.totalEarnedCredit).totalEarnedCredit}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </Block>
                        <Block strong className="margin-top report-card-block">
                            <h3>Comments</h3>
                            {Array.isArray(reportCards[selectedPeriod].report.find(item => item.comments)?.comments) &&
                                reportCards[selectedPeriod].report.find(item => item.comments).comments.map((comment, index) => (
                                    <p key={index} className="string-padding">{comment.comment}: {comment.commentDescription}</p>
                                ))
                            }
                        </Block>
                    </>
                ) : (
                    <Block strong className="margin-top">
                        <p>No report card available.</p>
                    </Block>
                )
            )}
        </Page>
    );
}

export default ReportCardPage;