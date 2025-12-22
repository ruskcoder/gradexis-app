import { f7 } from 'framework7-react';

export const containerDark = "#171717";
export const containerLight = "#f0f0f0";

export const containerColor = () => {
    return f7.darkMode ? containerDark : containerLight;
};

