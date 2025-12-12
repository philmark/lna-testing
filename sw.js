self.addEventListener('install', event => {
    console.log('[sw] installing.');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[sw] activating.');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    event.waitUntil(getLNAState());

    if (event.request.headers.get('X-Use-SW') !== 'true') {
        console.log('[sw] not handling fetch, X-Use-SW header not set');
        return;
    }

    const strippedHeaders = new Headers(event.request.headers);
    strippedHeaders.delete('X-Use-SW');
    const modifiedRequest = new Request(event.request, {
        headers: strippedHeaders
    });
    if (self.lnaPermission === 'granted') {
        console.log('[sw] handling fetch with LNA granted');
        event.respondWith(fetch(modifiedRequest));
    } else {
        console.log('[sw] not handling fetch, LNA not granted');
        event.respondWith(fetch(modifiedRequest));
        return;
    }
});


async function getLNAState() {
    try {
        const permission = await navigator.permissions.query({ name: 'local-network-access' });
        self.lnaPermission = permission?.state || 'unknown';
        permission.onchange = () => {
            self.lnaPermission = permission.state;
            console.log(`[sw] lnaPermission changed to ${self.lnaPermission}`);
        };

        console.log(`[sw] lnaPermission: ${self.lnaPermission}`);
    } catch (error) {
        console.log(`[sw] error`, error);
    }
}
