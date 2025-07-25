import store from "./store.js";
import terminal from 'virtual:terminal';

export var apiUrl = 'https://api.gradexis.com';
if (location.port == "5173") {
    apiUrl = 'http://localhost:3000';
}
if (location.host == 'supreme-trout-w6vv69pgppx3p4p-5173.app.github.dev') {
    apiUrl = 'https://supreme-trout-w6vv69pgppx3p4p-3000.app.github.dev'
}

function updateSession(data) {
    // if (store.state.currentUser.platform != 'powerschool') {
    if (data.session && data.session.cookies.length > 0) {
        store.dispatch('setSession', data.session);
    }
    // } // TODO: This is a temporary fix for powerschool, we need to find a better way to handle this
}

function cleanup(params) {
    [...params.keys()].forEach(key => {
        if (!params.get(key)) params.delete(key);
    });
    return params.toString();
}

async function checkResponse(response) {
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Incorrect username or password. Maybe your password has changed? Log out and log back in.");
        }
        throw new Error(`HTTP error! Status Code: ${response.status}`);
    }
}

export async function login(loginData) {
    try {
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
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function* getClasses(term = null) {
    window.classesFetch = new AbortController();
    const user = store.state.currentUser;
    const session = store.state.session;
    const stream = user.stream;
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
    try {
        const response = await fetch(`${apiUrl}/${user.platform}/classes?${cleanup(queryParams)}`, {
            signal: window.classesFetch.signal,
        });
        await checkResponse(response);
        if (stream) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let chunks = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) { break; }
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
        } else {
            data = await response.json();
        }
        if (!data || data.success == false) {
            throw data.message || "Failed to fetch classes";
        }
        updateSession(data);
        return data;
    } catch (error) {
        if (error.name === "AbortError") {
            return { success: false, message: "abort" };
        }
        throw error;
    }
}

export async function getGrades(className, term = null) {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        const response = await fetch(
            `${apiUrl}/${user.platform}/grades?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}&class=${className}${term ? `&term=${term}` : ""}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
        );
        await checkResponse(response);
        const data = await response.json();
        updateSession(data);
        return data
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getAttendance(date = "") {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        const response = await fetch(
            `${apiUrl}/${user.platform}/attendance?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}${date ? `&date=${date}` : ""}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
        );
        await checkResponse(response);
        const data = await response.json();
        updateSession(data);
        return data
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getSchedule() {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        const response = await fetch(
            `${apiUrl}/${user.platform}/schedule?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
        );
        await checkResponse(response);
        const data = await response.json();
        updateSession(data);
        return data
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getTeachers() {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        const response = await fetch(
            `${apiUrl}/${user.platform}/teachers?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
        );
        await checkResponse(response);
        const data = await response.json();
        updateSession(data);
        return data
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getProgressReport() {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        const response = await fetch(
            `${apiUrl}/${user.platform}/ipr?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
        );
        await checkResponse(response);
        const data = await response.json();
        updateSession(data);
        return data
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getReportCard() {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        const response = await fetch(
            `${apiUrl}/${user.platform}/reportCard?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
        );
        await checkResponse(response);
        const data = await response.json();
        updateSession(data);
        return data
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getTranscript() {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        const response = await fetch(
            `${apiUrl}/${user.platform}/transcript?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
        );
        await checkResponse(response);
        const data = await response.json();
        updateSession(data);
        return data
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getBellSchedule() {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        const response = await fetch(
            `${apiUrl}/${user.platform}/bellSchedule?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
        );
        await checkResponse(response);
        const data = await response.json();
        updateSession(data);
        return data
    } catch (error) {
        return { success: false, message: error.message };
    }
}