import store from "./store.js";
const platformList = ['hac']
export async function login(loginData) { 
    try {
        if (platformList.includes(loginData.platform)) {
            const response = await fetch(
                `https://supreme-trout-w6vv69pgppx3p4p-8000.app.github.dev/${loginData.platform}/api/name?link=${loginData.link}&user=${loginData.username}&pass=${loginData.password}`,
            );
            const data = await response.json();
            
            if (data.success == false) return data;
            return { name: data.name, ...loginData };
        } else { return false }

    } catch (error) {
        console.error('Error:', error);
        return {success: false, message: error.message};
    }
}

export async function averages(term = null) { 
    const user = store.state.currentUser;
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `https://supreme-trout-w6vv69pgppx3p4p-8000.app.github.dev/${user.platform}/api/averages?link=${user.link}&user=${user.username}&pass=${user.password}${term ? `&term=${term}` : ""}`,
            );
            const data = await response.json();
            
            return data;
        } else { return false }

    } catch (error) {
        console.error('Error:', error);
        return {success: false, message: error.message};
    }
}

export async function assignments(course = "", term = null) { 
    const user = store.state.currentUser;
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `https://supreme-trout-w6vv69pgppx3p4p-8000.app.github.dev/${user.platform}/api/assignments?link=${user.link}&user=${user.username}&pass=${user.password}${term ? `&term=${term}` : ""}`,
            );
            const data = await response.json();
            
            if (data.success == false) return data;
            return course == "" ? data : data[course];
        } else { return false }

    } catch (error) {
        console.error('Error:', error);
        return {success: false, message: error.message};
    }
}

export async function term(user = store.state.currentUser) { 
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `https://supreme-trout-w6vv69pgppx3p4p-8000.app.github.dev/${user.platform}/api/term?link=${user.link}&user=${user.username}&pass=${user.password}`,
            );
            const data = await response.json();
            
            return data;
        } else { return false }

    } catch (error) {
        console.error('Error:', error);
        return {success: false, message: error.message};
    }
}

export async function ipr(user = store.state.currentUser) { 
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `https://supreme-trout-w6vv69pgppx3p4p-8000.app.github.dev/${user.platform}/api/ipr?link=${user.link}&user=${user.username}&pass=${user.password}`,
            );
            const data = await response.json();
            
            return data;
        } else { return false }

    } catch (error) {
        console.error('Error:', error);
        return {success: false, message: error.message};
    }
}

