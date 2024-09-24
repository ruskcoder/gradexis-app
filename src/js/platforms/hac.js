export class hac {
    static async login(loginData) {
      try {
            const response = await fetch(
                `http://localhost:5000/api/name?link=${loginData.link}/&user=${loginData.username}&pass=${loginData.password}`);
            if (!response.ok) {
                throw new Error(
                    "Network response was not ok " + response.statusText
                );
            }
            const data = await response.json();
            return { name: data.name, ...loginData };
        } catch (error) {
            console.error("Error:", error);
            throw error; // Propagate the error
        }
    }
}
