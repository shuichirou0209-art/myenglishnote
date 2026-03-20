// Service Workerのバージョン
const CACHE_NAME = 'expression-stock-v1';
const urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './js/script.js',
    './icon.png'
];

// インストール時にキャッシュを作成
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('キャッシュを作成しました');
            return cache.addAll(urlsToCache);
        }).catch(error => {
            console.log('キャッシュ作成エラー:', error);
        })
    );
    // すぐにアクティベートさせる
    self.skipWaiting();
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('古いキャッシュを削除:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // すぐにクライアントを制御開始
    self.clients.claim();
});

// ネットワークリクエストをインターセプト
self.addEventListener('fetch', event => {
    // GETリクエストのみ処理
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        // まずキャッシュから確認
        caches.match(event.request).then(response => {
            // キャッシュあればそれを返す
            if (response) {
                return response;
            }

            // キャッシュなければネットワークからフェッチ
            return fetch(event.request).then(response => {
                // ネットワークエラーの場合
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // 成功したレスポンスをキャッシュに保存
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch(() => {
                // ネットワークエラー時はキャッシュから返すか、オフラインページを返す
                console.log('ネットワークエラー:', event.request.url);
                // オフラインページがあれば返す
                return caches.match('./index.html');
            });
        })
    );
});
