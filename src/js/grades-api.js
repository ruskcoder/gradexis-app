import store from "./store.js";
import terminal from 'virtual:terminal';

var apiUrl = 'https://supreme-trout-w6vv69pgppx3p4p-3000.app.github.dev';
if (location.host == "mobile.gradexis.com") { 
    apiUrl = 'https://api.gradexis.com'; 
}

const platformList = ['hac']
function updateSession(data) {
    store.dispatch('setSession', data.session);
}

export async function login(loginData) {
    try {
        if (platformList.includes(loginData.platform)) {
            const response = await fetch(
                `${apiUrl}/${loginData.platform}/info?link=${loginData.link}&username=${loginData.username}&password=${loginData.password}`,
            );
            const data = await response.json();
            updateSession(data);
            if (data.success == false) return data;
            return { name: data.name, ...loginData };
        } else { return false }

    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getClasses(term = null) {
    // return {
    //     "termList": [
    //         "1",
    //         "2",
    //         "3",
    //         "4",
    //         "5",
    //         "6"
    //     ],
    //     "term": "4",
    //     "classes": [
    //         {
    //             "course": "0271B - 9",
    //             "name": "AP COMP SCI M B",
    //             "period": "1",
    //             "teacher": "Ponce De Leon, Antonio",
    //             "room": "2224",
    //             "average": "100%"
    //         },
    //         {
    //             "course": "6339B - 2",
    //             "name": "SPAN 3 KAP B",
    //             "period": "2",
    //             "teacher": "Wagner, Mennell",
    //             "room": "1216",
    //             "average": "50.00%"
    //         },
    //         {
    //             "course": "0471B - 34",
    //             "name": "BIO KAP B",
    //             "period": "3",
    //             "teacher": "Hsu, Joshua",
    //             "room": "2005",
    //             "average": "90%"
    //         },
    //         {
    //             "course": "0347B - 11",
    //             "name": "AP HUMAN GEO B",
    //             "period": "4",
    //             "teacher": "Gage, Emma",
    //             "room": "2018",
    //             "average": "93.33%"
    //         },
    //         {
    //             "course": "0253B - 31",
    //             "name": "ALG 2 KAP B",
    //             "period": "5",
    //             "teacher": "Nuti, Vyjayanthi",
    //             "room": "2209",
    //             "average": "92.88%"
    //         },
    //         {
    //             "course": "0020B - 110",
    //             "name": "STUDY HALL (INSTRUCT)",
    //             "period": "6",
    //             "teacher": "O'Callaghan, Jennifer",
    //             "room": "9CAFE",
    //             "average": ""
    //         },
    //         {
    //             "course": "0141B - 38",
    //             "name": "ENG 1 KAP B",
    //             "period": "7",
    //             "teacher": "Messenger, Brittany",
    //             "room": "2008",
    //             "average": "95.41%"
    //         }
    //     ],
    //     "session": {
    //         "version": "tough-cookie@5.0.0",
    //         "storeType": "MemoryCookieStore",
    //         "rejectPublicSuffixes": true,
    //         "enableLooseMode": false,
    //         "allowSpecialUseDomain": true,
    //         "prefixSecurity": "silent",
    //         "cookies": [
    //             {
    //                 "key": "ASP.NET_SessionId",
    //                 "value": "cqsknisjbuanvppmnsymnfb4",
    //                 "domain": "homeaccess.katyisd.org",
    //                 "path": "/",
    //                 "secure": true,
    //                 "httpOnly": true,
    //                 "hostOnly": true,
    //                 "creation": "2025-01-27T21:32:42.347Z",
    //                 "lastAccessed": "2025-01-27T21:32:48.739Z",
    //                 "sameSite": "lax"
    //             },
    //             {
    //                 "key": "SPIHACSiteCode",
    //                 "domain": "homeaccess.katyisd.org",
    //                 "path": "/",
    //                 "secure": true,
    //                 "httpOnly": true,
    //                 "hostOnly": true,
    //                 "creation": "2025-01-27T21:32:42.347Z",
    //                 "lastAccessed": "2025-01-27T21:32:48.739Z"
    //             },
    //             {
    //                 "key": "__RequestVerificationToken_L0hvbWVBY2Nlc3M1",
    //                 "value": "waRqNk5CciHJZ4S0ZfWpzzsVFlVW83_glp3z0WnbX6jJJ8CFPkcwVR_w9sE4PQT4fMr8jKKtJzdbzLpJ9AJf_oR6-FFqp-mdZOsrcfodHrE1",
    //                 "domain": "homeaccess.katyisd.org",
    //                 "path": "/",
    //                 "secure": true,
    //                 "httpOnly": true,
    //                 "hostOnly": true,
    //                 "creation": "2025-01-27T21:32:42.347Z",
    //                 "lastAccessed": "2025-01-27T21:32:48.739Z"
    //             },
    //             {
    //                 "key": ".AuthCookie",
    //                 "value": "D116CC5A5953C681AE121A706D5E756FE1E73276D919D8BF110E478E803D42C5DBB0B848B798D1CEA3C0776C9A66F97F4898E58CB630A053C08EF8B175EDA4B5E3D158D6F5711A7C789785A995F68C6D17F8A30FF54E159CABA03EE50B9E35D1",
    //                 "domain": "homeaccess.katyisd.org",
    //                 "path": "/",
    //                 "secure": true,
    //                 "httpOnly": true,
    //                 "hostOnly": true,
    //                 "creation": "2025-01-27T21:32:42.675Z",
    //                 "lastAccessed": "2025-01-27T21:32:48.739Z",
    //                 "sameSite": "lax"
    //             }
    //         ]
    //     }
    // }
    // eslint-disable-next-line no-unreachable
    const user = store.state.currentUser;
    const session = store.state.session;

    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `${apiUrl}/${user.platform}/classes?link=${user.link}&username=${user.username}&password=${user.password}${term ? `&term=${term}` : ""}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            if (data.success == false) return data;
            return data;
        }
        else {
            return false
        }

    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getGrades(className, term = null) {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `${apiUrl}/${user.platform}/grades?link=${user.link}&username=${user.username}&password=${user.password}&class=${className}${term ? `&term=${term}` : ""}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            return data
        }
        else {
            return false
        }

    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getAttendance(mo = "") {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `${apiUrl}/${user.platform}/attendance?link=${user.link}&username=${user.username}&password=${user.password}${mo ? `&month=${mo}` : ""}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            return data
        }
        else {
            return false
        }

    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getSchedule() {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `${apiUrl}/${user.platform}/schedule?link=${user.link}&username=${user.username}&password=${user.password}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            return data
        }
        else {
            return false
        }

    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getTeachers() {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `${apiUrl}/${user.platform}/teachers?link=${user.link}&username=${user.username}&password=${user.password}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            return data
        }
        else {
            return false
        }

    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getProgressReport() {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `${apiUrl}/${user.platform}/ipr?link=${user.link}&username=${user.username}&password=${user.password}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            return data
        }
        else {
            return false
        }

    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getReportCard() {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `${apiUrl}/${user.platform}/reportCard?link=${user.link}&username=${user.username}&password=${user.password}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            return data
        }
        else {
            return false
        }

    } catch (error) {
        return { success: false, message: error.message };
    }
}
