import store from "./store.js";
import terminal from 'virtual:terminal';

// const apiUrl = 'https://api.gradexis.com';
const apiUrl = 'https://supreme-trout-w6vv69pgppx3p4p-3000.app.github.dev';
// 192.12.146.182   school wifi

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
    const user = store.state.currentUser;
    const session = store.state.session;
    return {
        "term": "3",
        "classes": [
            {
                "course": "0271A - 8",
                "name": "AP COMP SCI M A",
                "period": "1",
                "teacher": "Ponce De Leon, Antonio",
                "room": "2224",
                "average": "100.00%"
            },
            {
                "course": "6339A - 1",
                "name": "SPAN 3 KAP A",
                "period": "2",
                "teacher": "Wagner, Mennell",
                "room": "1216",
                "average": "98.43%"
            },
            {
                "course": "0471A - 34",
                "name": "BIO KAP A",
                "period": "3",
                "teacher": "Hsu, Joshua",
                "room": "2005",
                "average": "97.60%"
            },
            {
                "course": "0347A - 1",
                "name": "AP HUMAN GEO A",
                "period": "4",
                "teacher": "Gage, Emma",
                "room": "2018",
                "average": "98.28%"
            },
            {
                "course": "0253A - 31",
                "name": "ALG 2 KAP A",
                "period": "5",
                "teacher": "Nuti, Vyjayanthi",
                "room": "2209",
                "average": "98.80%"
            },
            {
                "course": "0020A - 113",
                "name": "STUDY HALL (INSTRUCT)",
                "period": "6",
                "teacher": "O'Callaghan, Jennifer",
                "room": "9CAFE",
                "average": ""
            },
            {
                "course": "0141A - 41",
                "name": "ENG 1 KAP A",
                "period": "7",
                "teacher": "Messenger, Brittany",
                "room": "2008",
                "average": "94.04%"
            },
            {
                "course": "6991A - 1",
                "name": "APTASCAL A",
                "period": "1",
                "teacher": "Staff",
                "room": "N/A",
                "average": ""
            }
        ],
        "session": {
            "version": "tough-cookie@5.0.0",
            "storeType": "MemoryCookieStore",
            "rejectPublicSuffixes": true,
            "enableLooseMode": false,
            "allowSpecialUseDomain": true,
            "prefixSecurity": "silent",
            "cookies": [
                {
                    "key": "ASP.NET_SessionId",
                    "value": "raotkt1v00gilgns2mvxepko",
                    "domain": "homeaccess.katyisd.org",
                    "path": "/",
                    "secure": true,
                    "httpOnly": true,
                    "hostOnly": true,
                    "creation": "2024-12-13T19:16:53.244Z",
                    "lastAccessed": "2024-12-13T19:17:42.329Z",
                    "sameSite": "lax"
                },
                {
                    "key": "SPIHACSiteCode",
                    "domain": "homeaccess.katyisd.org",
                    "path": "/",
                    "secure": true,
                    "httpOnly": true,
                    "hostOnly": true,
                    "creation": "2024-12-13T19:16:53.244Z",
                    "lastAccessed": "2024-12-13T19:17:42.329Z"
                },
                {
                    "key": "__RequestVerificationToken_L0hvbWVBY2Nlc3M1",
                    "value": "C7PVxvXS6VyzXlBPZWkbbod0mNFzg4kfSof-gnH1GrhWQbxAvfhYTQxhhea0pbKHLG8inmCg8qiZAV-MIAsaH6GwkOtur9o4rqAS78qAfeo1",
                    "domain": "homeaccess.katyisd.org",
                    "path": "/",
                    "secure": true,
                    "httpOnly": true,
                    "hostOnly": true,
                    "creation": "2024-12-13T19:16:53.244Z",
                    "lastAccessed": "2024-12-13T19:17:42.329Z"
                },
                {
                    "key": ".AuthCookie",
                    "value": "338E53F18796184FEA5FB59CDC456C1A10324D52C9E638EA6FA8D52D1B4D4865CFC7A2CDAD13024AD26B25C4E606876797D2B5EF0C58ED984F15DF0F1D8806F927A528B66E2A1F0F0E10B40AAE8A6BB90DC5F6660D5102CDC9E3A49A20DE2658",
                    "domain": "homeaccess.katyisd.org",
                    "path": "/",
                    "secure": true,
                    "httpOnly": true,
                    "hostOnly": true,
                    "creation": "2024-12-13T19:16:53.898Z",
                    "lastAccessed": "2024-12-13T19:17:42.329Z",
                    "sameSite": "lax"
                }
            ]
        }
    }
    /* eslint-disable no-unreachable */
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
        console.error('Error:', error);
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
            if (data.success == false) return data;
            return data;
        } 
        else { 
            return false
        }

    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: error.message };
    }
}

