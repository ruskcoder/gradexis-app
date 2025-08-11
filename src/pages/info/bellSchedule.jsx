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

const BellSchedulePage = ({ f7router }) => {
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
    }, []);

    return (
        <Page>
            <Navbar title="Bell Schedule" backLink="Back" />
            
        </Page>
    );
}

export default BellSchedulePage;