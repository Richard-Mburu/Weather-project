# Kenya School Weather Risk Dashboard

A sophisticated GIS-based dashboard designed for educational administrators to monitor and mitigate environmental risks to schools across Kenya's 47 counties.

##Features

- **Geographic Visualizations:** Integrates Leaflet.js for high-fidelity choropleth maps, heatmaps (IDW interpolation), and wind vector overlays.
- **Risk Assessment Engine:** Automatically calculates risk levels (Low, Medium, High) based on cumulative rainfall and maximum wind gusts.
- **Data Versatility:**
  - **KMet CSV Support:** Fuzzy parsing for Kenya Meteorological Department forecast files.
  - **Live API Integration:** Real-time weather data fetching via Open-Meteo.
  - **Simulation Mode:** Deterministic weather modeling for training and demonstrations.
- **Role-Based Views:** Supports National Admin (Full Scope) and County Officer (Scoped View) personas.
- **Advanced Analytics:** Dynamic trend analysis using historical and forecasted data with mini-sparkline visualizations.
- **Reporting:** Exportable CSV summaries and high-quality printable HTML risk reports.

## Tech Stack
 
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3.
- **Mapping:** [Leaflet.js](https://leafletjs.com/) with plugins for heatmaps and marker clustering.
- **API:** [Open-Meteo](https://open-meteo.com/) for live environmental data.
- **Icons:** Lucide Icons & Custom SVG procedural wind icons.

```powershell
python -m http.server 8000
```
## Project Structure

- `assets/js/app.js`: Core logic, GIS modules, and state management.
- `data/`: Directory for GeoJSON boundaries and KMet CSV forecast files.
- `index.html`: Main dashboard interface.

## Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/weather-project.git
   ```
2. Open `index.html` in any modern web browser.
3. Ensure you have an internet connection to load map tiles and Live API data.

## License

This project is developed for educational monitoring and disaster risk reduction (DRR) in Kenya.
