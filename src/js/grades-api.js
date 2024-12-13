import store from "./store.js";
import terminal from 'virtual:terminal';

const apiUrl = 'https://api.gradexis.com';

const platformList = ['hac']
export async function login(loginData) {
    try {   
        if (platformList.includes(loginData.platform)) {
            const response = await fetch(
                `${apiUrl}/${loginData.platform}/info?link=${loginData.link}&username=${loginData.username}&password=${loginData.password}`,
            );
            const data = await response.json();

            if (data.success == false) return data;
            return { name: data.name, ...loginData };
        } else { return false }

    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getClasses(term = null) {
    const user = store.state.currentUser;
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `${apiUrl}/${user.platform}/classes?link=${user.link}&username=${user.username}&password=${user.password}${term ? `&term=${term}` : ""}`, 
            );
            const data = await response.json();

            return data;
        } else { return false }

    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: error.message };
    }
}

export async function ipr(user = store.state.currentUser) {
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `${apiUrl}/${user.platform}/ipr?link=${user.link}&username=${user.username}&password=${user.password}`,
            );
            const data = await response.json();

            return data;
        } else { return false }

    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: error.message };
    }
}

