import subscribe from "./notifications.js";
import { updateSW } from "./store.js";

async function unregisterAndWait() {
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(async registration => {
            const workers = [registration.active, registration.waiting, registration.installing]
                .filter(Boolean);
            workers.forEach(worker => worker.postMessage({ type: 'FORCE_STOP' }));
            const success = await registration.unregister();
            console.log(`Unregistered: ${success}`);
        }));
    } else {
        console.log('Service workers are not supported in this browser.');
    }
}

async function fetchSWCode(swPath) {
    try {
        const response = await fetch(swPath, { cache: 'no-store' });
        const code = await response.text();
        return code;
    } catch (error) {
        console.error('Failed to fetch SW code:', error);
        return null;
    }
}

export default async function registerSW() {
    const serviceWorkerVersion = Math.floor(Math.random() * 10000);
    const swPath = `/sw.js?version=${serviceWorkerVersion}`;

    const newCode = await fetchSWCode(swPath);
    const oldCode = localStorage.getItem('cachedSW');

    if (oldCode && newCode && oldCode !== newCode) {
        console.log('Service Worker code changed. Unregistering and reloading...');
        await unregisterAndWait();
        localStorage.setItem('cachedSW', newCode);
        window.location.reload();
        return;
    }

    if (newCode && !oldCode) {
        localStorage.setItem('cachedSW', newCode);
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(swPath, { updateViaCache: 'none' })
            .then(registration => {
                registration.update();
                console.log('Service Worker registered with scope:', registration.scope);

                // Ensure immediate control
                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }

                setTimeout(() => {
                    updateSW();
                    subscribe(registration);
                }, 1000);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    } else {
        console.error('Service Worker not supported.');
    }
}
