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

export async function averages(user = store.state.currentUser) { 
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `https://supreme-trout-w6vv69pgppx3p4p-8000.app.github.dev/${user.platform}/api/averages?link=${user.link}&user=${user.username}&pass=${user.password}`,
            );
            const data = await response.json();
            
            if (data.success == false) return data;
            return data;
        } else { return false }

    } catch (error) {
        console.error('Error:', error);
        return {success: false, message: error.message};
    }
}

export async function assignments(user = store.state.currentUser, course = "") { 
    try {
        if (platformList.includes(user.platform)) {
            const response = await fetch(
                `https://supreme-trout-w6vv69pgppx3p4p-8000.app.github.dev/${user.platform}/api/assignments?link=${user.link}&user=${user.username}&pass=${user.password}`,
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

