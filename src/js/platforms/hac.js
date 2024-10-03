import { terminal } from 'virtual:terminal'

export class hac {
    static async login(loginData) {
        // return { name: "HAC User", ...loginData };
        await new Promise(resolve => setTimeout(resolve, 3000));
        return { name: "HAC User", ...loginData };
    // eslint-disable-next-line no-unreachable
      try {
            const response = await fetch(
                `https://supreme-trout-w6vv69pgppx3p4p-5000.app.github.dev/api/name?link=${loginData.link}&user=${loginData.username}&pass=${loginData.password}`,
            );
            if (!response.ok) {
                throw new Error(
                    "Network response was not ok " + response.status
                );
            }
            const data = await response.json();
            return { name: data.name, ...loginData };
        } catch (error) {
            terminal.error("Error details:", {
                message: error.respose,
            });
            throw error; // Propagate the error
        }
    }
}
