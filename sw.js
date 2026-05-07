self.addEventListener('push', function(event) {
    console.log('Push received');
    
    event.waitUntil(
        getLocationsFromIndexedDB().then(locations => {
            if (!locations || locations.length === 0) {
                return self.registration.showNotification('Weather Notifier', {
                    body: 'No locations configured.'
                });
            }
            
            const promises = locations.map(loc => {
                return fetchWeather(loc.lat, loc.lon).then(weather => {
                    return self.registration.showNotification(`Weather for ${loc.name}`, {
                        body: `Temp: ${weather.current.temperature_2m}°C, Code: ${weather.current.weather_code}`
                    });
                });
            });
            
            return Promise.all(promises);
        })
    );
});

function getLocationsFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const dbName = 'WeatherNotifierDB';
        const request = indexedDB.open(dbName, 1);
        
        request.onerror = (event) => {
            reject('Error opening DB');
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('locations')) {
                 resolve([]);
                 return;
            }
            const tx = db.transaction('locations', 'readonly');
            const store = tx.objectStore('locations');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result);
            };
            
            getAllRequest.onerror = () => {
                reject('Error getting locations');
            };
        };
    });
}

async function fetchWeather(lat, lon) {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
    return await response.json();
}
