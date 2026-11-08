# SFY - Safety for You

An offline-ready, mobile-friendly Node.js prototype for water-safety awareness. The original interface is preserved as V1; the root route serves the expanded V2 prototype.

## Run it

Requires Node.js 18.11 or newer. Run `npm install` once to install the local Prettier dev dependency used by the formatting scripts; the app server itself has no runtime packages.

```sh
npm start
```

Open [http://localhost:3000](http://localhost:3000) for V2 or [http://localhost:3000/v1/](http://localhost:3000/v1/) for the original V1. Browser location access works on localhost; deployed use requires HTTPS. V2 can be installed as a PWA from a compatible browser. After the first load, its app shell and safety guide are cached for offline use.

## Development scripts

- `npm run start` - start the Node server.
- `npm run dev` or `npm run start:dev` - restart the server when files change.
- `npm run start:debug` - watch files with the Node inspector enabled.
- `npm run build` - copy the server and static app into `dist/`.
- `npm run start:prod` - serve the built `dist/` app.
- `npm run format` / `npm run format:check` - format or check Markdown, JSON, JavaScript, HTML, CSS, and YAML with Prettier.

This is a dependency-light Node HTTP app, not a NestJS project, so its build and start scripts use Node directly.

## What's in the prototype

- Responsive safety dashboard and real OpenStreetMap view with ten Bengaluru lake reference points.
- Activity selector with walking, driving, fishing and swimming reminders.
- A foreground browser location test that compares device position with local lake reference points and shows an in-app proximity alert.
- A “Test water bodies” mode that recenters on Bengaluru and previews all four alert labels; only the water alert uses a lake reference point.
- Service-worker caching for the interface and safety guide.
- A small dependency-free Node static-file server.

V2 adds a visible current-version badge, a real interactive [Leaflet](https://leafletjs.com/) map using [OpenStreetMap](https://www.openstreetmap.org/), ten source-linked Bengaluru lake reference points, proximity checks while a location watch is active, activity preferences saved in the browser, a locally saved safety checklist, an offline quick guide, and a PWA install prompt. V1 remains available at `/v1/`.

The map loads Leaflet from its CDN and map tiles from OpenStreetMap, so the map needs an internet connection. OpenStreetMap attribution is shown on the map. The public OSM tile service is community infrastructure with a usage policy, not a guaranteed production map API; review the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/) before public or high-volume deployment.

The included water-body names and reference coordinates come from the [CPCB Water Quality Monitoring Network list](https://cpcb.nic.in/wqm/WQMN_list.pdf); lake names are cross-checked against the [BBMP lake inventory](https://lms.bbmpgov.in/lake). The coordinates are monitoring points, not shoreline polygons. Each 550–1,000 m proximity radius is an approximate demo threshold chosen for testing; it is not a surveyed boundary or danger rating. The browser compares the GPS fix with this bundled data locally and shows an in-page alert while the tab is open. SFY does not post the GPS fix to its server, but the map provider receives tile requests that reveal the viewed area. It does not provide background alerts, route detection, or emergency service. Location permission requires HTTPS when deployed. Do not use this prototype for navigation or emergency response.

## Brainstorm: a responsible path to a real SFY

1. **Start with trusted local data.** Partner with local authorities and communities to map water bodies, dangerous access points, bridges and flood-prone areas. Store source, confidence, last-verified date and seasonal validity for every hazard.
2. **Design alerts around context.** Combine distance, travel direction, speed and selected activity to avoid noisy warnings. Make the alert accessible, multilingual, dismissible and useful without asking users to interact while driving.
3. **Build the offline experience first.** Download signed regional hazard packs and safety guidance ahead of time. Define a clear refresh and expiry policy, and show when information may be stale.
4. **Pilot one community.** Co-design with residents, emergency services and accessibility groups; measure warning usefulness and false alarms before expanding coverage.
5. **Add integrations carefully.** Navigation overlays, car integrations, SMS/feature-phone access and official flood notices each need partner APIs, device support and operational agreements.

### A note on “satellite” and offline claims

Satellite positioning can help a device estimate its location, but it does not by itself provide a water-hazard database or deliver a message to a phone. A real no-internet warning would need hazard data already stored on the device, a supported location source, and an operating system that permits background location and alerts. Direct satellite messaging would require compatible hardware and a satellite service. SFY should describe each supported device and offline capability precisely instead of promising universal coverage.

## Next product milestones

- Replace monitoring-point circles with verified lake shoreline polygons and validated local hazard data.
- Add background geofencing in a native app and field-test alert thresholds and false positives.
- Add consent, battery-aware background geofencing and accessible notification controls.
- Establish data governance, incident reporting, update ownership and safety review before a public pilot.
