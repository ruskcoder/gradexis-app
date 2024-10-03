import { hac } from "./platforms/hac.js";

export async function login(loginData) { 
    switch (loginData.platform) {
      case "hac":
        return hac.login(loginData);
      default:
        console.log("Unknown platform");
    }
}