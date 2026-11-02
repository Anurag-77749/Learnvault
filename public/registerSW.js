// Immediately unregister all service workers and clear caches
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (var reg of registrations) {
      reg.unregister();
    }
  });
}
if ('caches' in window) {
  caches.keys().then(function(keys) {
    for (var key of keys) {
      caches.delete(key);
    }
  });
}
