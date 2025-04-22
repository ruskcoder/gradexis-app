import store from "./store.js";
import terminal from 'virtual:terminal';

var apiUrl = 'https://supreme-trout-w6vv69pgppx3p4p-3000.app.github.dev';
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
        } else { return { success: false, message: "Invalid Platform" }; }

    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getClasses(term = null) {
    const user = store.state.currentUser;
    const session = store.state.session;
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `${apiUrl}/${user.platform}/classes?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}${term ? `&term=${term}` : ""}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            // await new Promise(resolve => setTimeout(resolve, 5));
            return data;
        }
        else {
            return { success: false, message: "Invalid Platform" };
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
                `${apiUrl}/${user.platform}/grades?${user.link ? "link=" + user.link : ""}${user.useClasslink ? "&classlink=" + user.classlink : ""}&username=${user.username}&password=${user.password}&class=${className}${term ? `&term=${term}` : ""}${Object.keys(session).length != 0 ? `&session=${JSON.stringify(session)}` : ""}`,
            );
            const data = await response.json();
            updateSession(data);
            return data
        }
        else {
            return { success: false, message: "Invalid Platform" };
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
            return { success: false, message: "Invalid Platform" };
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
            return { success: false, message: "Invalid Platform" };
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
            return { success: false, message: "Invalid Platform" };
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
            return { success: false, message: "Invalid Platform" };
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
            return { success: false, message: "Invalid Platform" };
        }

    } catch (error) {
        return { success: false, message: error.message };
    }
}
