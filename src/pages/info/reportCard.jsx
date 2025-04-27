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
    f7
} from 'framework7-react';
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
        if (string.includes('com')) {
            return string.toUpperCase();
        } else {
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
                                <tfoot style={{ borderTop: '1px solid var(--f7-table-cell-border-color)' }}>
                                    <tr>
                                        <td colSpan={Object.keys(reportCards[selectedPeriod].report[0]).length} className="table-cell string-padding padding-top padding-bottom"><strong>Total Earned Credit:</strong> {reportCards[selectedPeriod].report.find(item => item.totalEarnedCredit).totalEarnedCredit}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </CardContent>
                    </Card>
                    <Block strong inset className="margin-top">
                        <h3>Comments</h3>
                        {Array.isArray(reportCards[selectedPeriod].report.find(item => item.comments)?.comments) &&
                            reportCards[selectedPeriod].report.find(item => item.comments).comments.map((comment, index) => (
                                <p key={index} className="string-padding">{comment.comment}: {comment.commentDescription}</p>
                            ))}
                    </Block>
                    <Popover className="popover-menu">
                        <List>
                            {reportCards.map((report, index) => (
                                <ListItem key={index} title={`Period ${report.reportCardRun}`} onClick={() => handlePeriodChange(index)} />
                            ))}
                        </List>
                    </Popover>
                </>
            }
            {!loading && !hasData && <Block strong inset>No report card available</Block>}
        </Page>
    );
}

export default ReportCardPage;