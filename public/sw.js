var apiUrl = 'https://api.gradexis.com';
if (location.port == "5173") {
  apiUrl = 'http://localhost:3000';
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
  let users = self.users;
  let user = users[self.currentUserNumber] || {};

  const queryParams = new URLSearchParams({
    link: user.link || "",
    classlink: user.classlink || "",
    username: user.username,
    password: user.password,
    stream: false,
  });

  const response = await fetch(`${apiUrl}/${user.platform}/classes?${cleanup(queryParams)}`)
  const data = await response.json();
  if (data.success != false) {
    if (Object.keys(user.gradelist).includes(data.term)) { 
      for (cls of Object.keys(user.gradelist[data.term]).filter(c => c != "lastUpdated")) { 
        let dataClass = data.classes.find(c => c.name === cls);
        if (user.gradelist[data.term][cls].average != dataClass.average) {
          let options = {
            body: `Your grade for ${cls} has changed from ${user.gradelist[data.term][cls].average} to ${dataClass.average}`,
            icon: '/icons/192x192.png',
          };
          user.gradelist[data.term][cls].average = dataClass.average;
          self.users[self.currentUserNumber] = user;
          self.registration.showNotification("Gradexis", options);
        }
      }
    }
  }  
}); 
