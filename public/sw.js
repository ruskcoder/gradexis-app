var apiUrl = 'https://api.gradexis.com';
if (location.port == "5173") {
  apiUrl = `http://${location.hostname}:3000`;
}
if (location.host == 'supreme-trout-w6vv69pgppx3p4p-5173.app.github.dev') {
  apiUrl = 'https://supreme-trout-w6vv69pgppx3p4p-3000.app.github.dev'
}

function cleanup(params) {
  [...params.keys()].forEach(key => {
    if (!params.get(key)) params.delete(key);
  });
  return params.toString();
}

const channel4Broadcast = new BroadcastChannel('channel4');
channel4Broadcast.onmessage = (event) => {
  self.users = event.data.users;
  self.currentUserNumber = event.data.currentUserNumber;
}

self.addEventListener('install', event => {
  console.log("SW Installed")
});

self.addEventListener('message', event => {
  if (event.data?.type === 'FORCE_STOP') {
    self.skipWaiting();
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.navigate(client.url));
    });
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  );
});

self.addEventListener('push', async function (event) {
  console.log('Push event received:', event);
  
  // Always show the "Testing 123" notification first
  const testNotification = self.registration.showNotification("Testing 123", {
    body: 'Push notification received successfully!',
    icon: '/icons/192x192.png',
    badge: '/icons/96x96.png',
    tag: 'test-notification'
  });

  // Then proceed with grade checking logic
  let users = self.users;
  let user = users[self.currentUserNumber] || {};

  if (!user.username) {
    console.log('No user data available for grade checking');
    return;
  }

  const queryParams = new URLSearchParams({
    link: user.link || "",
    clsession: user.clsession || "",
    username: user.username || "",
    password: user.password || "",
    term: "",
    stream: "",
  });

  try {
    const response = await fetch(`${apiUrl}/${user.platform}/classes?${cleanup(queryParams)}`);
    const data = await response.json();
    
    if (data.success != false) {
      if (Object.keys(user.gradelist).includes(data.term)) { 
        for (cls of Object.keys(user.gradelist[data.term]).filter(c => c != "lastUpdated")) { 
          let dataClass = data.classes.find(c => c.name === cls);
          if (dataClass && user.gradelist[data.term][cls].average != dataClass.average) {
            let gradeChangeOptions = {
              body: `Your grade for ${cls} has changed from ${user.gradelist[data.term][cls].average} to ${dataClass.average}`,
              icon: '/icons/192x192.png',
              badge: '/icons/96x96.png',
              tag: `grade-change-${cls}`,
              actions: [
                {
                  action: 'view',
                  title: 'View Grades'
                }
              ]
            };
            user.gradelist[data.term][cls].average = dataClass.average;
            self.users[self.currentUserNumber] = user;
            self.registration.showNotification("Grade Update", gradeChangeOptions);
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to check grades:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event.notification);
  event.notification.close();

  if (event.action === 'view') {
    // Open the grades page when "View Grades" is clicked
    event.waitUntil(
      clients.openWindow('/#/grades/')
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll().then(function(clientList) {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
}); 
