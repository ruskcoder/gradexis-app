import React, { useEffect, useState } from "react";
import {
    Page,
    Navbar,
    Block,
    Preloader,
    Card,
    CardContent,
    CardHeader,
    f7
} from 'framework7-react';
import { updateRouter } from '@/components/app';
import { getTranscript } from '@/js/grades-api';

const TranscriptPage = ({ f7router }) => {
    updateRouter(f7router);
    const [loading, setLoading] = useState(true);
    const [transcriptData, setTranscriptData] = useState(null);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        getTranscript()
            .then((data) => {
                if (data.transcriptData) {
                    // Map JSON keys to JavaScript-friendly keys
                    const keyMapping = {
                        "Unweighted GPA*": "unweightedGPA",
                        "Weighted GPA*": "weightedGPA",
                        "Quartile": "quartile",
                        "Rank": "rank"
                    };

                    const transformedData = Object.entries(data.transcriptData).reduce((acc, [key, value]) => {
                        const newKey = keyMapping[key] || key; // Use mapped key or original key
                        acc[newKey] = value;
                        return acc;
                    }, {});

                    setTranscriptData(transformedData); // Use transformed data
                    setHasData(true);
                }
                setLoading(false);
            })
            .catch(() => {
                console.log("Data not fetched");
                setLoading(false);
            });
    }, []);

    return (
        <Page>
            <Navbar title="Transcript" backLink="Back" />
            {loading && (
                <div className="loader-container">
                    <Preloader />
                </div>
            )}
            {!loading && hasData && (
                <>
                    {Object.entries(transcriptData)
                        .filter(([key]) => !["unweightedGPA", "weightedGPA", "quartile", "rank"].includes(key)) // Exclude specific keys
                        .map(([key, value], index) => (
                            <Card key={index} className="data-table data-table-init">
                                <CardHeader>
                                    <div className="data-table-title">{value.year} - Semester {value.semester}</div>
                                </CardHeader>
                                <CardContent padding={false}>
                                    {value.data && value.data.length > 0 ? (
                                        <table>
                                            <thead>
                                            <tr>
                                                {value.data[0].map((header, idx) => (
                                                    <th key={idx} className="table-header">{header}</th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {value.data.slice(1).map((row, idx) => (
                                                <tr key={idx}>
                                                    {row.map((cell, cellIdx) => (
                                                        <td key={cellIdx} className="table-cell string-padding">{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                            </tbody>
                                            <tfoot>
                                            <tr>
                                                <td colSpan={value.data[0].length} className="table-cell string-padding">
                                                    Total Credits: {value.credits}
                                                </td>
                                            </tr>
                                            </tfoot>
                                        </table>
                                    ) : (
                                        <Block strong inset>No data available for this semester</Block>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    <Block strong inset className="final-box">
                        {Object.entries({
                            unweightedGPA: "Unweighted GPA",
                            weightedGPA: "Weighted GPA",
                            quartile: "Quartile",
                            rank: "Rank"
                        }).map(([key, label]) => (
                            <p key={key}>{label}: {transcriptData[key] || "N/A"}</p>
                        ))}
                    </Block>
                </>
            )}
            {!loading && !hasData && <Block strong inset>No transcript available</Block>}
        </Page>
    );
};

export default TranscriptPage;