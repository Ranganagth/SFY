const purposeTips = {
  Walking: 'Stay on marked paths around the water.',
  Driving: 'Slow down near bridges and never drive through floodwater.',
  Fishing: 'Keep a stable footing and wear a life jacket near deep water.',
  Swimming: 'Swim only in designated areas with a lifeguard present.',
};
const toast = document.querySelector('#toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

document.querySelectorAll('.purpose-button').forEach((button) =>
  button.addEventListener('click', () => {
    document.querySelectorAll('.purpose-button').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    const purpose = button.dataset.purpose;
    document.querySelector('#purpose-response').textContent = purposeTips[purpose];
    document.querySelector('#modal-copy').textContent =
      `${purposeTips[purpose]} Remember, this is a sample reminder for the illustrated map.`;
  }),
);

const modal = document.querySelector('#alert-modal');
function closeModal() {
  modal.hidden = true;
}
document.querySelector('#simulate-btn').addEventListener('click', () => {
  modal.hidden = false;
  document.querySelector('#ack-alert').focus();
});
document.querySelector('.modal-close').addEventListener('click', closeModal);
document.querySelector('#ack-alert').addEventListener('click', () => {
  closeModal();
  showToast('Thanks for taking a moment to stay aware.');
});
document.querySelector('#guide-btn').addEventListener('click', () => {
  closeModal();
  document.querySelector('#safety-guide').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});

let mapScale = 1;
const mapArt = document.querySelector('.map-art');
document.querySelector('#zoom-in').addEventListener('click', () => {
  mapScale = Math.min(1.3, mapScale + 0.1);
  mapArt.style.transform = `scale(${mapScale})`;
});
document.querySelector('#zoom-out').addEventListener('click', () => {
  mapScale = Math.max(0.85, mapScale - 0.1);
  mapArt.style.transform = `scale(${mapScale})`;
});

document.querySelector('#locate-btn').addEventListener('click', () => {
  if (!navigator.geolocation) return showToast('Location is not available in this browser.');
  showToast('Requesting your location…');
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      document.querySelector('#location-label').textContent =
        `Location read (not shown on demo map): ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
      showToast('Location read. Map and hazards remain illustrative.');
    },
    (error) => {
      const message =
        error.code === 1
          ? 'Allow location access in your browser to use this feature.'
          : 'Could not get your location. You can still explore the demo.';
      showToast(message);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
  );
});

const connectionText = document.querySelector('#connection-text');
const connectionDot = document.querySelector('.connection-dot');
function updateConnection() {
  const online = navigator.onLine;
  connectionText.textContent = online ? 'Online' : 'Offline · Safety guide available';
  connectionDot.classList.toggle('offline', !online);
}
window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
updateConnection();
document.querySelector('#today-label').textContent = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
}).format(new Date());

if ('serviceWorker' in navigator && location.protocol.startsWith('http'))
  navigator.serviceWorker.register('/v1/sw.js', { scope: '/v1/' }).catch(() => {});
