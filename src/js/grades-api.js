import store from "./store.js";
import terminal from 'virtual:terminal';

// var apiUrl = 'https://supreme-trout-w6vv69pgppx3p4p-3000.app.github.dev';
var apiUrl = 'https://3000-ruskcoder-gradexis-app-em4szju5qc.app.codeanywhere.com/'
// var apiUrl = 'https://api.gradexis.com';
if (location.host == "mobile.gradexis.com") {
    apiUrl = 'https://api.gradexis.com';
}
else if (location.hostname == "localhost") {
    apiUrl = 'http://localhost:3000';
}
const platformList = ['hac']
function updateSession(data) {
    store.dispatch('setSession', data.session);
}

function cleanup(params) {
    [...params.keys()].forEach(key => {
        if (!params.get(key)) params.delete(key);
    });
    return params.toString();
}

export async function login(loginData) {
    try {
        if (platformList.includes(loginData.platform)) {
            const response = await fetch(
                `${apiUrl}/${loginData.platform}/info?${loginData.link ? "link=" + loginData.link : ""}${loginData.useClasslink ? "&classlink=" + loginData.classlink : ""}&username=${loginData.username}&password=${loginData.password}`,
            );
            const data = await response.json();
            updateSession(data);
            if (data.success == false) return data;
            if (!loginData.link) {
                loginData.link = data.link;
            }
            return { name: data.name, ...loginData };
        } else {
            throw "Invalid Platform";
            return;
        }

    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function* getClasses(term = null) {
    const user = store.state.currentUser;
    const session = store.state.session;
    const stream = user.stream;
    if (platformList.includes(user.platform)) {
        const queryParams = new URLSearchParams({
            link: user.link || "",
            classlink: user.classlink || "",
            username: user.username,
            password: user.password,
            term: term || "",
            stream: stream || "",
            session: Object.keys(session).length ? JSON.stringify(session) : "",
        });
        let data;
        const response = await fetch(`${apiUrl}/${user.platform}/classes?${cleanup(queryParams)}`);
        if (stream) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let chunks = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks += decoder.decode(value, { stream: true });
                try {
                    if (chunks.split('\n\n').length > 2) {
                        for (const chunk of chunks.split('\n\n')) {
                            if (chunk.trim() === "") continue;
                            const parsedChunk = JSON.parse(chunk);
                            yield parsedChunk;
                            data = parsedChunk;
                            chunks = "";
                        }
                        continue;
                    }
                    const chunk = JSON.parse(chunks);
                    yield chunk;
                    data = chunk;
                    chunks = "";
                } catch (error) {
                    continue;
                }
            }
        }
        else {
            data = await response.json();
        }
        if (!data || data.success == false) {
            throw "An error occurred";
            return;
        }
        updateSession(data);
        return data;
    }
    else {
        throw "Invalid Platform";
        return;
    }

}

export async function getGrades(className, term = null) {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `${apiUrl}/${user.platform}/grades?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}&class=${className}${term ? `&term=${term}` : ""}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            return data
        }
        else {
            throw "Invalid Platform";
            return;
        }

    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getAttendance(date = "") {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `${apiUrl}/${user.platform}/attendance?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}${date ? `&date=${date}` : ""}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            return data
        }
        else {
            throw "Invalid Platform";
            return;
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
                `${apiUrl}/${user.platform}/schedule?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            return data
        }
        else {
            throw "Invalid Platform";
            return;
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
                `${apiUrl}/${user.platform}/teachers?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            return data
        }
        else {
            throw "Invalid Platform";
            return;
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
                `${apiUrl}/${user.platform}/ipr?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            return data
        }
        else {
            throw "Invalid Platform";
            return;
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
                `${apiUrl}/${user.platform}/reportCard?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            return data
        }
        else {
            throw "Invalid Platform";
            return;
        }

    } catch (error) {
        return { success: false, message: error.message };
    }
}
