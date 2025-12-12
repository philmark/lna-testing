self.addEventListener('install', event => {
    console.log('[sw]] installing.');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[sw]] activating.');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    console.log('[sw] fetching:', event.request.url);

    event.waitUntil(getLNAState());
});


async function getLNAState() {
    try {
        const permission = await navigator.permissions.query({ name: 'local-network-access' });
        let lnaPermission = permission?.state || 'unknown';
        permission.onchange = () => {
            lnaPermission = permission.state;
            console.log(`[sw] lnaPermission changed to ${lnaPermission}`);
        };

        console.log(`[sw] lnaPermission: ${lnaPermission}`);
    } catch (error) {
        console.log(`[sw] error`, error);
    }
}
