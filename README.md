# Kenya Schools KMet Forecast Map

Static Leaflet dashboard for Kenya school rainfall, temperature, wind, and risk monitoring.

## Project Structure

- `index.html` - page shell and vendor CDN links
- `assets/css/styles.css` - app styles
- `assets/js/app.js` - map data, modules, and interactions
- `data/` - CSV, GeoJSON, and JSON data files
- `kenya_kmet_schools_rainfall_map_v4.original.html` - original single-file version kept for reference

## Run Locally

Serve the folder over HTTP so the browser can load files from `data/`:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.
