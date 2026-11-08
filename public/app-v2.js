const tips = {
  Walking: 'Stay on marked paths around the water.',
  Driving: 'Slow down near bridges and never drive through floodwater.',
  Fishing: 'Keep stable footing and wear a life jacket near deep water.',
  Swimming: 'Swim only in designated areas with a lifeguard present.',
};
const toast = document.querySelector('#toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

const purposeButtons = [...document.querySelectorAll('.purpose-button')];
let selectedPurpose = localStorage.getItem('sfy-v2-purpose') || 'Walking';
function selectPurpose(purpose) {
  if (!tips[purpose]) purpose = 'Walking';
  selectedPurpose = purpose;
  purposeButtons.forEach((button) => {
    const selected = button.dataset.purpose === purpose;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('#purpose-response').textContent = tips[purpose];
  document.querySelector('#modal-copy').textContent =
    `${tips[purpose]} Remember, this is a sample reminder for the illustrated map.`;
  localStorage.setItem('sfy-v2-purpose', purpose);
}
purposeButtons.forEach((button) =>
  button.addEventListener('click', () => selectPurpose(button.dataset.purpose)),
);
selectPurpose(selectedPurpose);

const layerButtons = [...document.querySelectorAll('.filter-button')];
let leafletMap = null;
let waterBodyData = [];
let demoSafetyFeatures = [];
let deviceLocationMarker = null;
const renderedHazards = { water: [], bridge: [], crossing: [], flood: [] };
let floodZoneShape = null;
function setLayer(layer, visible) {
  document
    .querySelectorAll(`[data-hazard="${layer}"]`)
    .forEach((marker) => marker.classList.toggle('filtered-out', !visible));
  const polygon = document.querySelector('.flood-zone');
  if (layer === 'flood' && polygon) polygon.classList.toggle('filtered-out', !visible);
  if (leafletMap) {
    renderedHazards[layer].forEach((marker) =>
      visible ? marker.addTo(leafletMap) : leafletMap.removeLayer(marker),
    );
    if (layer === 'flood' && floodZoneShape)
      visible ? floodZoneShape.addTo(leafletMap) : leafletMap.removeLayer(floodZoneShape);
  }
}
layerButtons.forEach((button) =>
  button.addEventListener('click', () => {
    const visible = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(visible));
    button.classList.toggle('active', visible);
    setLayer(button.dataset.layer, visible);
  }),
);

const alertModal = document.querySelector('#alert-modal');
const hazardModal = document.querySelector('#hazard-modal');
let selectedHazard = {
  name: 'Bengaluru lake',
  warning: 'Water body nearby',
  detail: 'Approximate demo reference point.',
};
let scenarioStep = 0;
let liveAlertPending = false;
let alertTestActive = false;
let alertTestStep = 0;
let demoUserMarker = null;
const alertTestCategories = ['Water nearby', 'Bridge ahead', 'Unsafe crossing', 'Flood-prone area'];
const scenarioCopy = [
  () =>
    `This walkthrough uses ${selectedHazard.name} as an example. It does not read your location. The separate location test uses an approximate radius around its monitoring point.`,
  () =>
    `${tips[selectedPurpose]} This is a ${selectedPurpose.toLowerCase()} reminder; it is not based on your actual position.`,
  () => `Demo complete. Follow local instructions and use verified information. ${selectedHazard.detail}`,
];
function closeModal(modal) {
  modal.hidden = true;
}
function hideAlertTestList() {
  document.querySelector('#alert-test-list').hidden = true;
}
function openScenario() {
  alertTestActive = false;
  hideAlertTestList();
  liveAlertPending = false;
  scenarioStep = 0;
  document.querySelector('#modal-title').textContent = selectedHazard.warning;
  document.querySelector('#scenario-step').textContent = 'STEP 1 OF 3 · SAMPLE APPROACH';
  document.querySelector('#modal-copy').textContent = scenarioCopy[0]();
  document.querySelector('#scenario-next').innerHTML = 'Continue demo <span>→</span>';
  alertModal.hidden = false;
  document.querySelector('#scenario-next').focus();
}
document.querySelector('#simulate-btn').addEventListener('click', openScenario);
document.querySelector('#scenario-next').addEventListener('click', () => {
  if (alertTestActive) {
    alertTestStep += 1;
    if (alertTestStep >= alertTestCategories.length) {
      alertTestActive = false;
      hideAlertTestList();
      closeModal(alertModal);
      showToast('Bengaluru alert preview complete. Only lake points are in the location dataset.');
      return;
    }
    showAlertTestStep();
    return;
  }
  if (liveAlertPending) {
    liveAlertPending = false;
    closeModal(alertModal);
    return;
  }
  scenarioStep += 1;
  if (scenarioStep >= scenarioCopy.length) {
    closeModal(alertModal);
    showToast('Demo finished. This was not a live location alert.');
    return;
  }
  document.querySelector('#scenario-step').textContent =
    `STEP ${scenarioStep + 1} OF 3 · ${scenarioStep === 1 ? 'ACTIVITY TIP' : 'SAFER CHOICE'}`;
  document.querySelector('#modal-copy').textContent = scenarioCopy[scenarioStep]();
  document.querySelector('#scenario-next').innerHTML =
    scenarioStep === 2 ? 'Finish demo <span>✓</span>' : 'Continue demo <span>→</span>';
});
document.querySelector('.modal-close').addEventListener('click', () => {
  alertTestActive = false;
  hideAlertTestList();
  liveAlertPending = false;
  closeModal(alertModal);
});
document.querySelector('#guide-btn').addEventListener('click', () => {
  alertTestActive = false;
  hideAlertTestList();
  closeModal(alertModal);
  document.querySelector('#offline-guide').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
alertModal.addEventListener('click', (event) => {
  if (event.target === alertModal) {
    alertTestActive = false;
    hideAlertTestList();
    liveAlertPending = false;
    closeModal(alertModal);
  }
});

function openHazard(marker) {
  selectedHazard = marker.dataset
    ? { name: marker.dataset.name, warning: marker.dataset.warning, detail: marker.dataset.detail }
    : marker;
  document.querySelector('#hazard-title').textContent = `${selectedHazard.name} · ${selectedHazard.warning}`;
  document.querySelector('#hazard-detail').textContent = selectedHazard.detail;
  hazardModal.hidden = false;
  document.querySelector('.hazard-close').focus();
}
document.querySelectorAll('.hazard-marker').forEach((marker) => {
  marker.addEventListener('click', () => openHazard(marker));
  marker.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openHazard(marker);
    }
  });
});
document.querySelector('.hazard-close').addEventListener('click', () => closeModal(hazardModal));
hazardModal.addEventListener('click', (event) => {
  if (event.target === hazardModal) closeModal(hazardModal);
});

function initializeMap() {
  const status = document.querySelector('#map-status');
  fetch('/data/bengaluru-water-bodies.json')
    .then((response) => {
      if (!response.ok) throw new Error('Lake data unavailable');
      return response.json();
    })
    .then((data) => {
      waterBodyData = data.waterBodies || [];
      demoSafetyFeatures = data.demoSafetyFeatures || [];
      if (!waterBodyData.length) throw new Error('No lake data found');
      selectedHazard = {
        name: waterBodyData[0].name,
        warning: 'Water body nearby',
        detail: 'Reference-point distance is approximate and is not a shoreline measurement.',
      };
      const trackingButton = document.querySelector('#tracking-button');
      document.querySelector('#test-water-bodies').disabled = false;
      trackingButton.disabled = false;
      trackingButton.dataset.ready = 'true';
      if (!window.L) {
        status.textContent = 'Map tiles are offline. Stored lake points are ready for a location test.';
        return;
      }
      leafletMap = L.map('real-map', { zoomControl: false, scrollWheelZoom: true });
      const bounds = L.latLngBounds(waterBodyData.map((body) => body.coordinates));
      leafletMap.fitBounds(bounds.pad(0.15), { maxZoom: 12 });
      const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      }).addTo(leafletMap);
      tiles.once('load', () => {
        status.textContent = `${waterBodyData.length} Bengaluru lakes · approximate reference points`;
      });
      tiles.on('tileerror', () => {
        status.textContent = 'Map tiles need internet. Location checks use local lake points.';
      });
      waterBodyData.forEach((body) => {
        const marker = L.circleMarker(body.coordinates, {
          radius: 9,
          color: '#fff',
          weight: 2,
          fillColor: '#337c91',
          fillOpacity: 1,
        });
        marker.bindTooltip(`${body.name} · demo point`);
        marker.on('click', () =>
          openHazard({
            name: body.name,
            warning: 'Water body reference point',
            detail: `${body.referenceType}. The ${body.demoAlertRadiusMeters} m alert radius is an approximate demo test range, not a shoreline or danger boundary.`,
          }),
        );
        renderedHazards.water.push(marker.addTo(leafletMap));
      });
      const safetyStyles = {
        bridge: { color: '#c69719', symbol: 'Bridge ahead' },
        crossing: { color: '#c64b45', symbol: 'Unsafe crossing' },
        flood: { color: '#dd7a27', symbol: 'Flood-prone area' },
      };
      demoSafetyFeatures.forEach((feature) => {
        const style = safetyStyles[feature.layer];
        if (!style || !renderedHazards[feature.layer]) return;
        const marker = L.circleMarker(feature.coordinates, {
          radius: 10,
          color: '#fff',
          weight: 2,
          fillColor: style.color,
          fillOpacity: 1,
        });
        marker.bindTooltip(`${style.symbol} · demo marker`);
        marker.on('click', () => openHazard(feature));
        renderedHazards[feature.layer].push(marker.addTo(leafletMap));
      });
      setTimeout(() => leafletMap.invalidateSize(), 100);
      status.textContent = `${waterBodyData.length} Bengaluru lakes and ${demoSafetyFeatures.length} safety demo markers loaded`;
    })
    .catch((error) => {
      status.textContent = `${error.message}. Reload while online to load Bengaluru lake points.`;
      document.querySelector('#tracking-status').textContent =
        'Lake data could not load. Connect to the internet and reload.';
    });
}
initializeMap();
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    alertTestActive = false;
    hideAlertTestList();
    liveAlertPending = false;
    closeModal(alertModal);
    closeModal(hazardModal);
  }
});

document.querySelector('#zoom-in').addEventListener('click', () => leafletMap?.zoomIn());
document.querySelector('#zoom-out').addEventListener('click', () => leafletMap?.zoomOut());

const checklistKey = 'sfy-v2-checklist';
const checklist = [...document.querySelectorAll('[data-check]')];
function saveChecklist() {
  localStorage.setItem(
    checklistKey,
    JSON.stringify(checklist.filter((item) => item.checked).map((item) => item.dataset.check)),
  );
}
try {
  const savedChecks = JSON.parse(localStorage.getItem(checklistKey) || '[]');
  checklist.forEach((item) => {
    item.checked = savedChecks.includes(item.dataset.check);
  });
} catch {
  localStorage.removeItem(checklistKey);
}
checklist.forEach((item) => item.addEventListener('change', saveChecklist));
document.querySelector('#reset-checklist').addEventListener('click', () => {
  checklist.forEach((item) => {
    item.checked = false;
  });
  saveChecklist();
  showToast('Checklist cleared.');
});

let watchId = null;
const activeLakeAlerts = new Set();
const trackingButton = document.querySelector('#tracking-button');
trackingButton.disabled = true;
const testWaterBodiesButton = document.querySelector('#test-water-bodies');
function distanceMeters(a, b) {
  const radians = (value) => (value * Math.PI) / 180;
  const [lat1, lon1] = a;
  const [lat2, lon2] = b;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
function proximityAlert(body, distance) {
  selectedHazard = { name: body.name, warning: 'Water body nearby', detail: '' };
  liveAlertPending = true;
  hideAlertTestList();
  document.querySelector('#modal-title').textContent = `${body.name} nearby`;
  document.querySelector('#scenario-step').textContent = 'LOCATION TEST · APPROXIMATE REFERENCE DISTANCE';
  document.querySelector('#modal-copy').textContent =
    `Your device is about ${Math.round(distance)} m from this lake’s CPCB monitoring point. The ${body.demoAlertRadiusMeters} m test radius is approximate and does not measure distance to the shoreline or indicate danger. For ${selectedPurpose.toLowerCase()}: ${tips[selectedPurpose]} Follow local signs and keep a safe distance from the water.`;
  document.querySelector('#scenario-next').innerHTML = 'I understand <span>✓</span>';
  alertModal.hidden = false;
}
function showAlertTestStep() {
  const category = alertTestCategories[alertTestStep];
  const body = waterBodyData.find((item) => item.id === 'ulsoor') || waterBodyData[0];
  const alertTestList = document.querySelector('#alert-test-list');
  alertTestList.hidden = false;
  alertTestList.querySelectorAll('[data-alert-category]').forEach((item, index) => {
    item.classList.toggle('is-current', index === alertTestStep);
    item.classList.toggle('is-complete', index < alertTestStep);
    if (index === alertTestStep) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
  document.querySelector('#modal-title').textContent = category;
  document.querySelector('#scenario-step').textContent =
    `BENGALURU ALERT TEST · ${alertTestStep + 1} OF ${alertTestCategories.length}`;
  document.querySelector('#scenario-next').innerHTML =
    alertTestStep === alertTestCategories.length - 1
      ? 'Finish test <span>✓</span>'
      : 'Next alert <span>→</span>';
  if (alertTestStep === 0) {
    const demoDistance = Math.min(450, Math.round(body.demoAlertRadiusMeters * 0.7));
    document.querySelector('#modal-copy').textContent =
      `Simulated position: about ${demoDistance} m from ${body.name}'s CPCB monitoring point, inside the ${body.demoAlertRadiusMeters} m demo radius. The map is centered on Bengaluru. This is a simulated position, not your GPS.`;
  } else {
    document.querySelector('#modal-copy').textContent =
      `Preview-only ${category.toLowerCase()} alert. There are no verified ${category.toLowerCase()} locations in the current dataset, so this step is not triggered by your position.`;
  }
  alertModal.hidden = false;
}
function startBengaluruAlertTest() {
  if (!waterBodyData.length) return showToast('Bengaluru lake data is still loading.');
  if (watchId !== null) stopTracking();
  activeLakeAlerts.clear();
  alertTestActive = true;
  liveAlertPending = false;
  alertTestStep = 0;
  const body = waterBodyData.find((item) => item.id === 'ulsoor') || waterBodyData[0];
  const offset = Math.min(450, Math.round(body.demoAlertRadiusMeters * 0.7)) / 111320;
  const simulatedPoint = [body.coordinates[0] - offset, body.coordinates[1]];
  if (leafletMap && window.L) {
    if (deviceLocationMarker) {
      leafletMap.removeLayer(deviceLocationMarker);
      deviceLocationMarker = null;
    }
    if (demoUserMarker) leafletMap.removeLayer(demoUserMarker);
    demoUserMarker = L.circleMarker(simulatedPoint, {
      radius: 9,
      color: '#fff',
      weight: 3,
      fillColor: '#8b4bb0',
      fillOpacity: 1,
    }).addTo(leafletMap);
    demoUserMarker.bindTooltip('Simulated demo position · not GPS');
    leafletMap.fitBounds(
      L.latLngBounds([
        ...waterBodyData.map((item) => item.coordinates),
        ...demoSafetyFeatures.map((item) => item.coordinates),
        simulatedPoint,
      ]).pad(0.15),
      { maxZoom: 12 },
    );
  }
  document.querySelector('#location-label').textContent =
    'Bengaluru demo view · simulated position · not your GPS';
  document.querySelector('#tracking-status').textContent =
    'Map centered on Bengaluru. Water step uses a simulated point; bridge, unsafe-crossing, and flood steps are preview-only.';
  showAlertTestStep();
}
testWaterBodiesButton.addEventListener('click', startBengaluruAlertTest);
function handleLocation(position) {
  const { latitude, longitude, accuracy } = position.coords;
  const point = [latitude, longitude];
  if (leafletMap) {
    if (demoUserMarker) {
      leafletMap.removeLayer(demoUserMarker);
      demoUserMarker = null;
    }
    if (deviceLocationMarker) deviceLocationMarker.setLatLng(point);
    else {
      deviceLocationMarker = L.circleMarker(point, {
        radius: 8,
        color: '#fff',
        weight: 3,
        fillColor: '#34796e',
        fillOpacity: 1,
      }).addTo(leafletMap);
      leafletMap.setView(point, 14);
    }
    if (deviceLocationMarker) leafletMap.panTo(point);
    deviceLocationMarker.bindTooltip('Your device location');
  }
  const label = document.querySelector('#location-label');
  const status = document.querySelector('#tracking-status');
  if (!waterBodyData.length) {
    status.textContent = 'Lake reference data has not loaded yet.';
    return;
  }
  const distances = waterBodyData
    .map((body) => ({ body, distance: distanceMeters(point, body.coordinates) }))
    .sort((a, b) => a.distance - b.distance);
  for (const id of activeLakeAlerts) {
    const entry = distances.find((item) => item.body.id === id);
    if (!entry || entry.distance > entry.body.demoAlertRadiusMeters + 250) activeLakeAlerts.delete(id);
  }
  const nearest = distances[0];
  label.textContent = `Your location · accuracy ±${Math.round(accuracy)} m · nearest reference: ${nearest.body.name}`;
  status.textContent = `${nearest.body.name} is about ${Math.round(nearest.distance)} m from its monitoring point. Demo alert radius: ${nearest.body.demoAlertRadiusMeters} m. Keep this page open; do not interact while moving.`;
  const inRange = distances.find(
    (item) => item.distance <= item.body.demoAlertRadiusMeters && !activeLakeAlerts.has(item.body.id),
  );
  if (inRange) {
    activeLakeAlerts.add(inRange.body.id);
    proximityAlert(inRange.body, inRange.distance);
  }
}
function stopTracking() {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
  trackingButton.setAttribute('aria-pressed', 'false');
  trackingButton.innerHTML = 'Start location test <span>⌖</span>';
  document.querySelector('#tracking-status').textContent =
    'Location test stopped. It only works while this page is open.';
}
trackingButton.addEventListener('click', () => {
  if (watchId !== null) return stopTracking();
  if (!navigator.geolocation) return showToast('Location is not available in this browser.');
  alertTestActive = false;
  activeLakeAlerts.clear();
  trackingButton.setAttribute('aria-pressed', 'true');
  trackingButton.innerHTML = 'Stop location test <span>×</span>';
  document.querySelector('#tracking-status').textContent =
    'Requesting location permission… GPS is compared locally; map tile requests reveal the viewed area. Keep this page open.';
  watchId = navigator.geolocation.watchPosition(
    handleLocation,
    (error) => {
      stopTracking();
      showToast(
        error.code === 1
          ? 'Allow location access in your browser to test nearby lakes.'
          : 'Could not read your location. Check device settings and try again.',
      );
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
  );
});

document.querySelector('#locate-btn').addEventListener('click', () => {
  if (!navigator.geolocation) return showToast('Location is not available in this browser.');
  showToast('Requesting your location…');
  navigator.geolocation.getCurrentPosition(
    (position) => {
      handleLocation(position);
      if (leafletMap) leafletMap.setZoom(14);
      showToast('Checking distance to Bengaluru lake reference points.');
    },
    (error) => {
      showToast(
        error.code === 1
          ? 'Allow location access in your browser to use this feature.'
          : 'Could not get your location. You can still explore the demo.',
      );
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
  );
});

function updateConnection() {
  const online = navigator.onLine;
  document.querySelector('#connection-text').textContent = online ? 'Online' : 'Offline · Guide available';
  document.querySelector('.connection-dot').classList.toggle('offline', !online);
  if (!online)
    document.querySelector('#map-status').textContent =
      'Offline · map tiles may not load. The safety guide is available.';
  else if (leafletMap)
    document.querySelector('#map-status').textContent =
      'Online · OpenStreetMap · Bengaluru lake reference points';
}
window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
updateConnection();
document.querySelector('#today-label').textContent = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
}).format(new Date());

let installPrompt = null;
const installButton = document.querySelector('#install-button');
installButton.hidden = false;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.textContent = 'Install app';
});
installButton.addEventListener('click', async () => {
  if (!installPrompt) return showToast('Use your browser menu and choose Install app or Add to Home Screen.');
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
});
window.addEventListener('appinstalled', () => {
  installButton.hidden = true;
  showToast('SFY added to your device.');
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http'))
  navigator.serviceWorker.register('/sw.js').catch(() => {});
