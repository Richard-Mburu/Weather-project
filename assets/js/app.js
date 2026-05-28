// ═══════════════════════════════════════════
// COUNTY DATA & SESSION MANAGEMENT
// Static metadata for Kenya's 47 counties and session-based 
// access control logic (National Admin vs County Officer).
// ═══════════════════════════════════════════
const COUNTIES=[
  {id:1,name:'Mombasa',lat:-4.05,lon:39.67,area:229},{id:2,name:'Kwale',lat:-4.18,lon:39.45,area:8270},
  {id:3,name:'Kilifi',lat:-3.51,lon:39.85,area:12245},{id:4,name:'Tana River',lat:-1.80,lon:40.10,area:35375},
  {id:5,name:'Lamu',lat:-2.27,lon:40.90,area:6497},{id:6,name:'Taita-Taveta',lat:-3.40,lon:38.35,area:17084},
  {id:7,name:'Garissa',lat:-0.45,lon:39.65,area:44175},{id:8,name:'Wajir',lat:1.75,lon:40.05,area:56686},
  {id:9,name:'Mandera',lat:3.94,lon:41.87,area:25991},{id:10,name:'Marsabit',lat:2.34,lon:37.99,area:70961},
  {id:11,name:'Isiolo',lat:0.35,lon:38.48,area:25336},{id:12,name:'Meru',lat:0.05,lon:37.65,area:6936},
  {id:13,name:'Tharaka-Nithi',lat:-0.30,lon:37.92,area:2609},{id:14,name:'Embu',lat:-0.54,lon:37.46,area:2714},
  {id:15,name:'Kitui',lat:-1.37,lon:38.01,area:24385},{id:16,name:'Machakos',lat:-1.52,lon:37.26,area:5952},
  {id:17,name:'Makueni',lat:-1.80,lon:37.62,area:8009},{id:18,name:'Nyandarua',lat:-0.18,lon:36.52,area:3107},
  {id:19,name:'Nyeri',lat:-0.42,lon:37.05,area:3284},{id:20,name:'Kirinyaga',lat:-0.51,lon:37.27,area:1478},
  {id:21,name:"Murang'a",lat:-0.72,lon:37.15,area:2558},{id:22,name:'Kiambu',lat:-1.03,lon:36.83,area:2543},
  {id:23,name:'Turkana',lat:3.11,lon:35.57,area:71597},{id:24,name:'West Pokot',lat:1.62,lon:35.10,area:9169},
  {id:25,name:'Samburu',lat:1.21,lon:36.98,area:21022},{id:26,name:'Trans-Nzoia',lat:1.05,lon:35.00,area:2494},
  {id:27,name:'Uasin Gishu',lat:0.55,lon:35.27,area:3345},{id:28,name:'Elgeyo-Marakwet',lat:0.73,lon:35.51,area:3030},
  {id:29,name:'Nandi',lat:0.18,lon:35.12,area:2884},{id:30,name:'Baringo',lat:0.67,lon:36.10,area:11015},
  {id:31,name:'Laikipia',lat:0.36,lon:36.78,area:9462},{id:32,name:'Nakuru',lat:-0.30,lon:35.93,area:7495},
  {id:33,name:'Narok',lat:-1.08,lon:35.87,area:17921},{id:34,name:'Kajiado',lat:-1.85,lon:36.78,area:21924},
  {id:35,name:'Kericho',lat:-0.37,lon:35.28,area:2479},{id:36,name:'Bomet',lat:-0.78,lon:35.35,area:1997},
  {id:37,name:'Kakamega',lat:0.28,lon:34.75,area:3033},{id:38,name:'Vihiga',lat:0.08,lon:34.73,area:531},
  {id:39,name:'Bungoma',lat:0.57,lon:34.56,area:3032},{id:40,name:'Busia',lat:0.46,lon:34.11,area:1695},
  {id:41,name:'Siaya',lat:-0.06,lon:34.29,area:2530},{id:42,name:'Kisumu',lat:-0.10,lon:34.76,area:2085},
  {id:43,name:'Homa Bay',lat:-0.52,lon:34.46,area:3183},{id:44,name:'Migori',lat:-1.06,lon:34.47,area:2586},
  {id:45,name:'Kisii',lat:-0.68,lon:34.77,area:1317},{id:46,name:'Nyamira',lat:-0.57,lon:34.93,area:912},
  {id:47,name:'Nairobi',lat:-1.29,lon:36.82,area:696}
];

/**
 * Session State: Manages user permissions and data scoping.
 * 'NATIONAL_ADMIN' sees everything; 'COUNTY_OFFICER' is restricted to a specific countyId.
 */
let userSession={role:'NATIONAL_ADMIN',countyId:null};

function isCountyMode(){return userSession.role==='COUNTY_OFFICER'&&userSession.countyId!==null;}
function canAccessCounty(cid){return !isCountyMode()||cid===userSession.countyId;}
function activeCounties(){return COUNTIES.filter(c=>canAccessCounty(c.id));}
function activeSchools(){return SCHOOLS.filter(s=>canAccessCounty(s.cid));}
function selectedCounty(){return COUNTIES.find(c=>c.id===userSession.countyId)||null;}
function filterCdataForScope(data){
  const scoped={};
  activeCounties().forEach(c=>{if(data[c.id])scoped[c.id]=data[c.id];});
  return scoped;
}

// BASE defines the climatological "normal" values for different regions of Kenya.
// Used for simulation and as fallbacks when specific data points are missing.
const BASE={};
COUNTIES.forEach(c=>{
  let rain=22,tmin=17,tmax=29,wind=12,wind_dir=45;
  if(c.lon<35.5&&c.lat>-2){rain=115;tmin=12;tmax=23;}
  else if(c.lat<-3.5||(c.lon>39&&c.lat<-1)){rain=70;tmin=22;tmax=32;} 
  // ... additional regional weather logic ...
  else if(Math.abs(c.lat)<1.5&&c.lon>36&&c.lon<38.5){rain=80;tmin=13;tmax=25;}
  else if(c.lat>2){rain=8;tmin=20;tmax=36;}
  else if(c.lon>38&&c.lat>-1){rain=10;tmin=21;tmax=37;}
  else if(c.lat>0&&c.lon<37){rain=45;tmin=14;tmax=27;}
  BASE[c.id]={rain,tmin,tmax,wind,wind_dir};
});

// Seedable random number generator for deterministic simulations.
function mkRng(s){let x=s*1664525+1013904223|0;return()=>{x=x*1664525+1013904223|0;return(x>>>0)/4294967296;};}

// Defines the forecast periods (weeks) available in the system.
const WEEKS=Array.from({length:8},(_,i)=>{
  const d=new Date('2026-03-10');d.setDate(d.getDate()+i*7);
  const e=new Date(d);e.setDate(e.getDate()+6);
  return{label:`${d.toLocaleDateString('en-KE',{day:'numeric',month:'short'})} – ${e.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'2-digit'})}`,seed:(i+1)*31337};
});

// Generates simulated county-level weather data based on geographic baselines.
function genCData(seed){
  const r=mkRng(seed),res={};
  COUNTIES.forEach(c=>{
    const b=BASE[c.id];
    res[c.id]={
      rain:Math.max(0,Math.round((b.rain+(r()-.45)*b.rain*.9+(r()-.5)*18)*10)/10),
      tmin:Math.round((b.tmin+(r()-.5)*2.5)*10)/10,
      tmax:Math.round((b.tmax+(r()-.5)*3.5)*10)/10,
      wind:Math.round((b.wind+(r()-.5)*8)*10)/10,
      wind_dir:Math.round((b.wind_dir+(r()-.5)*60+360)%360)
    };
  });
  return res;
}

// GIS Utility: Finds the closest county to a given lat/lon point.
function nearestCounty(lat,lon,counties=COUNTIES){
  let best=counties[0]||COUNTIES[0],bd=Infinity;
  counties.forEach(c=>{const d=(c.lat-lat)**2+(c.lon-lon)**2;if(d<bd){bd=d;best=c;}});
  return{c:best,d2:bd};
}
function nearest(lat,lon){return nearestCounty(lat,lon,COUNTIES);}

// ═══════════════════════════════════════════
// COLOUR SCHEMES
// Maps weather values to colors, labels, and risk levels using KMD palettes.
// ═══════════════════════════════════════════
const SCHEMES={
  rain:{
    classify:v=>{
      if(v<0.5)return{color:'#e8f4fd',label:'Dry (0 mm)',risk:'low',desc:'Mostly dry week'};
      if(v<30) return{color:'#a8d8ea',label:'Light (<30 mm)',risk:'low',desc:'Gentle rain, drizzle'};
      if(v<100)return{color:'#2196f3',label:'Moderate (30–100 mm)',risk:'med',desc:'Steady, noticeable rain'};
      if(v<250)return{color:'#0d47a1',label:'Heavy (101–250 mm)',risk:'high',desc:'Intense rain, thunder'};
      return    {color:'#4a148c',label:'Very Heavy (>250 mm)',risk:'high',desc:'Prolonged, high flood risk'};
    },
    legend:[
      {color:'#e8f4fd',label:'Dry (0 mm)',border:true},
      {color:'#a8d8ea',label:'Light  (<30 mm)'},
      {color:'#2196f3',label:'Moderate  (30–100 mm)'},
      {color:'#0d47a1',label:'Heavy  (101–250 mm)'},
      {color:'#4a148c',label:'Very Heavy  (>250 mm)'}
    ]
  },
  tmin:{
    classify:v=>{
      if(v<10)return{color:'#3c3489',label:'Cold (<10 °C)',risk:'low'};
      if(v<14)return{color:'#1e88e5',label:'Cool (10–14 °C)',risk:'low'};
      if(v<18)return{color:'#1d9e75',label:'Mild (14–18 °C)',risk:'med'};
      return   {color:'#d85a30',label:'Warm (>18 °C)',risk:'high'};
    },
    legend:[
      {color:'#3c3489',label:'Cold  <10 °C'},
      {color:'#1e88e5',label:'Cool  10–14 °C'},
      {color:'#1d9e75',label:'Mild  14–18 °C'},
      {color:'#d85a30',label:'Warm  >18 °C'}
    ]
  },
  tmax:{
    classify:v=>{
      if(v<24)return{color:'#fac775',label:'Mild (<24 °C)',risk:'low'};
      if(v<30)return{color:'#ef9f27',label:'Warm (24–30 °C)',risk:'low'};
      if(v<35)return{color:'#d85a30',label:'Hot (30–35 °C)',risk:'med'};
      return   {color:'#993c1d',label:'Very Hot (>35 °C)',risk:'high'};
    },
    legend:[
      {color:'#fac775',label:'Mild  <24 °C'},
      {color:'#ef9f27',label:'Warm  24–30 °C'},
      {color:'#d85a30',label:'Hot  30–35 °C'},
      {color:'#993c1d',label:'Very Hot  >35 °C'}
    ]
  },
  wind:{
    classify:v=>{
      if(v<10)return{color:'#e8f5e9',label:'Light (<10 km/h)',risk:'low'};
      if(v<20)return{color:'#81c784',label:'Moderate (10–20 km/h)',risk:'low'};
      if(v<40)return{color:'#673ab7',label:'Fresh (20–40 km/h)',risk:'med'};
      return   {color:'#b71c1c',label:'Strong (>40 km/h)',risk:'high'};
    },
    legend:[
      {color:'#e8f5e9',label:'Light  <10 km/h',border:true},
      {color:'#81c784',label:'Moderate  10–20 km/h'},
      {color:'#673ab7',label:'Fresh  20–40 km/h'},
      {color:'#b71c1c',label:'Strong  >40 km/h'}
    ]
  }
};

// School marker colour by rainfall risk
const RISK_COLORS={high:'#e53935',med:'#fb8c00',low:'#43a047'};

// Global thresholds for high/medium risk alerts.
const RISK_CONFIG = { rain: { high: 100, med: 30 }, wind: { high: 40, med: 25 } };
const dataState = {
  rainSource: 'Waiting for CSV',
  windSource: 'Waiting for API',
  pointCount: 0,
  lastSync: 'Not synced'
};

const forecastDataCache=new Map();
const analyticsCache=new Map();
const MAX_RAW_POINTS=2500;
let PRECOMPUTED_FORECASTS=null;

// Colors used for the dynamic choropleth when multiple counties are selected.
const DYNAMIC_CHOROPLETH_COLORS={
  rain:['#e8f4fd','#a8d8ea','#2196f3','#0d47a1','#4a148c'],
  tmin:['#3c3489','#1e88e5','#1d9e75','#f6c85f','#d85a30'],
  tmax:['#fac775','#ef9f27','#d85a30','#b84a26','#7f2718'],
  wind:['#e8f5e9','#81c784','#26a69a','#673ab7','#b71c1c']
};

// Maps metric keys to human-readable units.
function metricUnit(metric){
  return {rain:'mm',tmin:'°C',tmax:'°C',wind:'km/h'}[metric] || '';
}

// Stats Helper: Calculates value breaks for map shading based on the current data range.
/**
 * Dynamic Breaks: Calculates Jenks-style natural breaks for choropleth shading
 * based on the specific range of the currently loaded data.
 */
function getScopedMetricValues(metric){
  return activeCounties()
    .map(c=>cdata[c.id]&&Number(cdata[c.id][metric]))
    .filter(Number.isFinite)
    .sort((a,b)=>a-b);
}

function getDynamicBreaks(metric){
  const values=getScopedMetricValues(metric);
  if(!values.length)return null;
  const min=values[0],max=values[values.length-1];
  if(Math.abs(max-min)<0.001)return {min,max,breaks:[min,min,min,min,max]};
  return {
    min,max,
    breaks:[0,0.2,0.4,0.6,0.8,1].map(p=>min+(max-min)*p)
  };
}

function classifyChoropleth(metric,value){
  const dynamic=getDynamicBreaks(metric);
  if(activeCounties().length<2||!dynamic||!Number.isFinite(value))return SCHEMES[metric].classify(value||0);
  const colors=DYNAMIC_CHOROPLETH_COLORS[metric]||DYNAMIC_CHOROPLETH_COLORS.rain;
  if(Math.abs(dynamic.max-dynamic.min)<0.001)return SCHEMES[metric].classify(value||0);
  const idx=Math.min(colors.length-1,Math.max(0,Math.floor(((value-dynamic.min)/(dynamic.max-dynamic.min))*colors.length)));
  return {color:colors[idx],label:`${value.toFixed(1)} ${metricUnit(metric)}`};
}

function getDynamicLegendItems(metric){
  const dynamic=getDynamicBreaks(metric);
  const colors=DYNAMIC_CHOROPLETH_COLORS[metric]||DYNAMIC_CHOROPLETH_COLORS.rain;
  if(activeCounties().length<2||!dynamic||Math.abs(dynamic.max-dynamic.min)<0.001)return SCHEMES[metric].legend;
  return colors.map((color,i)=>{
    const a=dynamic.breaks[i],b=dynamic.breaks[i+1];
    return {color,label:`${a.toFixed(1)}-${b.toFixed(1)} ${metricUnit(metric)}`,desc:'Current selected period'};
  });
}

function normalizeMetricValue(metric,value){
  const dynamic=getDynamicBreaks(metric);
  if(!dynamic||!Number.isFinite(value))return 0;
  if(Math.abs(dynamic.max-dynamic.min)<0.001)return 0.5;
  return Math.max(0.05,Math.min(1,(value-dynamic.min)/(dynamic.max-dynamic.min)));
}

function riskLabel(risk) {
  return {high:'High risk',med:'Moderate risk',low:'Low risk'}[risk] || 'Low risk';
}

function getSchoolWeather(school, currentCData, rawPoints) {
  const countyData=currentCData[school.cid] || {};
  let rainVal = countyData.rain || 0;
  return {
    rain: rainVal,
    tmin: countyData.tmin || 0,
    tmax: countyData.tmax || 0,
    wind: countyData.wind || 0,
    wind_dir: countyData.wind_dir || 0
  };
}

// Core Risk Logic: Evaluates a school's environmental threat based on local rainfall
// and wind speed compared against the RISK_CONFIG thresholds.
function calculateSchoolRiskDetails(school, currentCData, rawPoints) {
  if(!currentCData[school.cid]) return {risk:'low',weather:getSchoolWeather(school,currentCData,rawPoints),reason:'No county data'};
  const weather=getSchoolWeather(school,currentCData,rawPoints);
  let score=weather.rain >= RISK_CONFIG.rain.high ? 2 : weather.rain >= RISK_CONFIG.rain.med ? 1 : 0;
  const reasons=[];
  if(weather.rain >= RISK_CONFIG.rain.high)reasons.push(`heavy rain ${weather.rain.toFixed(1)} mm`);
  else if(weather.rain >= RISK_CONFIG.rain.med)reasons.push(`moderate rain ${weather.rain.toFixed(1)} mm`);
  if(weather.wind >= RISK_CONFIG.wind.high){score=Math.min(2,score+1);reasons.push(`strong wind ${weather.wind.toFixed(1)} km/h`);}
  else if(weather.wind >= RISK_CONFIG.wind.med){reasons.push(`fresh wind ${weather.wind.toFixed(1)} km/h`);}
  const risk=score>=2?'high':score===1?'med':'low';
  if(!reasons.length)reasons.push('below rainfall and wind thresholds');
  return {risk,weather,reason:reasons.join('; ')};
}

function calculateSchoolRisk(school, currentCData, rawPoints) {
  return calculateSchoolRiskDetails(school,currentCData,rawPoints).risk;
}

function normalizeName(n) {
  if (!n) return "";
  // Remove apostrophes, spaces, and lowercase for comparison
  return n.toString().toLowerCase().replace(/['’\s-]/g, '').trim();
}

// ═══════════════════════════════════════════
// KENYA BOUNDARY — simplified polygon ring used to
// clip the choropleth canvas so fill stays within borders.
// Derived from the official admin0 boundary, simplified to ~120 points.
// ═══════════════════════════════════════════
const KENYA_RING=[
  [4.62,41.90],[4.45,41.58],[4.23,41.22],[3.99,40.77],[3.86,40.45],[3.50,40.02],
  [3.07,39.85],[2.45,40.77],[1.97,41.56],[1.75,41.23],[1.42,41.01],[1.14,40.56],
  [0.83,40.06],[0.42,39.65],[0.18,39.43],[-0.10,39.58],[-0.41,39.60],
  [-0.85,40.44],[-1.15,40.65],[-1.62,40.18],[-2.09,40.76],[-2.48,41.56],
  [-2.75,41.78],[-3.07,40.97],[-3.52,39.80],[-3.96,39.20],[-4.45,39.05],
  [-4.67,38.58],[-4.42,37.64],[-3.85,37.00],[-3.30,36.94],[-2.95,36.50],
  [-2.50,35.97],[-1.96,34.98],[-1.49,34.18],[-1.28,34.08],[-0.99,33.94],
  [-0.48,34.38],[-0.03,34.05],[0.38,34.08],[0.74,33.92],[1.09,34.09],
  [1.48,34.91],[1.77,34.95],[2.04,34.36],[2.41,34.15],[2.84,34.37],
  [3.51,35.20],[3.77,35.94],[3.97,36.83],[4.05,37.63],[4.28,38.05],
  [4.62,38.56],[4.62,41.90]
];

// ═══════════════════════════════════════════
// MODULE: COUNTY CHOROPLETH
// Manages the base map layer for counties. 
// Loads external GeoJSON for high-fidelity boundaries.
// Falls back to centroid circles if GeoJSON fails
// ═══════════════════════════════════════════
const CountyChoroModule=(()=>{
  let _geoLayer=null;
  let _countyFeatures=null;
  let _ready=false;
  let _useFallback=false;
  
  // Build county GeoJSON from admin1 data
  async function loadCountyGeoJSON(){
    if(_countyFeatures)return _countyFeatures;
    try{
      const resp=await fetch('data/ken_admin1.geojson');
      if(!resp.ok)throw new Error(`HTTP ${resp.status}`);
      const geojson=await resp.json();
      _countyFeatures={};
      geojson.features.forEach(feat=>{
        const countyName=feat.properties.adm1_name || feat.properties.adm2_name || feat.properties.name;
        _countyFeatures[countyName]=feat;
      });
      _useFallback=false;
      console.log('✓ Loaded',Object.keys(_countyFeatures).length,'counties from GeoJSON');
      return _countyFeatures;
    }catch(e){
      console.warn('GeoJSON load failed, using fallback circles',e);
      _useFallback=true;
      return null;
    }
  }
  
  function buildFallback(map){
    // Fallback: circles at county centroids
    _geoLayer=L.layerGroup();
    activeCounties().forEach(c=>{
      L.circle([c.lat,c.lon],{radius:Math.sqrt(c.area)*50,color:'#333',fill:true,fillOpacity:0.1,weight:1.5,opacity:0.7}).addTo(_geoLayer);
    });
    _geoLayer.addTo(map);
    _ready=true;
    _useFallback=true;
    console.log('✓ Fallback choropleth (county circles) ready');
  }
  
  function ensureChoroPane(map){
    if(!map.getPane('choropleth')){
      map.createPane('choropleth');
      map.getPane('choropleth').style.zIndex = 450;
      map.getPane('choropleth').style.pointerEvents = 'none';
    }
  }

  function build(map){
    ensureChoroPane(map);
    loadCountyGeoJSON()
      .then(features=>{
        if(features){
          _geoLayer=L.geoJSON({type: "FeatureCollection", features: Object.values(features)},{
            style:{color:'#111',weight:1.8,opacity:0.9,fillOpacity:0},
            interactive:false,
            pane:'choropleth'
          });
          _geoLayer.addTo(map);
          _ready=true;
          _useFallback=false;
          document.getElementById('zLbl').innerHTML += ' <span style="color:#4caf50">● High Fidelity</span>';
        }else{
          buildFallback(map);
        }
      })
      .catch(e => {
        console.warn('CountyChoroModule build error:', e);
        if(!_geoLayer)buildFallback(map);
      })
      .finally(() => {
        try { if(typeof refresh === 'function') refresh(); }
        catch(e) { console.warn('refresh after CountyChoroModule.build failed:', e); }
      });
  }
  
  function update(cdata,metric){
    if(!_geoLayer || (!_useFallback && !_countyFeatures))return;
    
    if(_useFallback){
      // Fallback: recolor circles by county
      _geoLayer.eachLayer(layer=>{
        const latLng=layer.getLatLng && layer.getLatLng();
        if(!latLng)return;
        const countyMatch=COUNTIES.find(c=>Math.abs(c.lat-latLng.lat)<0.1&&Math.abs(c.lon-latLng.lng)<0.1);
        if(!countyMatch)return;
        if(!canAccessCounty(countyMatch.id) || !cdata[countyMatch.id]){layer.setStyle({fillOpacity:0,opacity:0});return;}
        const metricVal=cdata[countyMatch.id][metric] || 0;
        const{color}=classifyChoropleth(metric,metricVal);
        const isVisible = layerVis.heat && _ready;
        layer.setStyle({fillColor:color,fillOpacity:isVisible?0.82:0, opacity: isVisible?0.7:0});
      });
    }else{
      // Recolor polygon layer
      _geoLayer.eachLayer(layer=>{
        if(!layer.feature)return;
        const props = layer.feature.properties;
        const countyName = props.adm1_name || props.adm2_name || props.name;
        const normName = normalizeName(countyName);
        
        const countyMatch=COUNTIES.find(c=>normalizeName(c.name)===normName);
        if(!countyMatch || !canAccessCounty(countyMatch.id) || !cdata[countyMatch.id]){
          layer.setStyle({fillOpacity:0,opacity:0});
          return;
        }
        const metricVal=cdata[countyMatch.id][metric] || 0;
        const{color}=classifyChoropleth(metric,metricVal);
        const isVisible = layerVis.heat && _ready;
        layer.setStyle({fillColor:color,fillOpacity:isVisible?0.82:0,fill:true,opacity:isVisible?0.8:0});
      });
      if(_geoLayer.bringToFront)_geoLayer.bringToFront();
    }
  }
  
  function setVisible(v){
    if(!_geoLayer)return;
    update(cdata, activeMetric);
  }
  
  return{build,update,setVisible};
})();

// ═══════════════════════════════════════════
// MODULE: HEATMAP (fallback: IDW grid)
// For demo, generates interpolated points from counties
// For production, feed real KMet CSV grid points
// ═══════════════════════════════════════════
const SubcountyModule=(()=>{
  let _geoLayer=null;
  let _features=[];
  let _ready=false;
  let _map=null;

  function ensurePane(map){
    if(!map.getPane('subcounties')){
      map.createPane('subcounties');
      map.getPane('subcounties').style.zIndex=470;
      map.getPane('subcounties').style.pointerEvents='none';
    }
  }

  async function loadSubcounties(){
    if(_features.length)return _features;
    const resp=await fetch('data/ken_admin2.geojson');
    if(!resp.ok)throw new Error(`HTTP ${resp.status}`);
    const geojson=await resp.json();
    _features=geojson.features||[];
    return _features;
  }

  function selectedFeatures(){
    const county=selectedCounty();
    if(!county)return [];
    const countyName=normalizeName(county.name);
    return _features.filter(feat=>normalizeName(feat.properties&&feat.properties.adm1_name)===countyName);
  }

  function rebuildLayer(){
    if(!_map||!_ready)return;
    if(_geoLayer){
      _map.removeLayer(_geoLayer);
      _geoLayer=null;
    }
    const feats=isCountyMode()?selectedFeatures():[];
    if(!feats.length)return;
    _geoLayer=L.geoJSON({type:'FeatureCollection',features:feats},{
      style:{color:'#263238',weight:1.2,opacity:0.8,dashArray:'3 4',fillOpacity:0.08,fillColor:'#fff',fill:true},
      interactive:false,
      pane:'subcounties'
    });
    if(layerVis.heat)_geoLayer.addTo(_map);
  }

  function build(map){
    _map=map;
    ensurePane(map);
    loadSubcounties()
      .then(()=>{_ready=true;rebuildLayer();update(cdata,activeMetric);})
      .catch(e=>console.warn('SubcountyModule build error:',e));
  }

  function update(data,metric){
    if(!_ready)return;
    if(!_geoLayer||!isCountyMode()){
      rebuildLayer();
      if(!_geoLayer)return;
    }
    const county=selectedCounty();
    const row=county&&data[county.id];
    const color=row?classifyChoropleth(metric,row[metric]||0).color:'#ffffff';
    _geoLayer.eachLayer(layer=>layer.setStyle({
      fillColor:color,
      fillOpacity:layerVis.heat&&isCountyMode()?0.16:0,
      opacity:layerVis.heat&&isCountyMode()?0.9:0
    }));
    if(_geoLayer.bringToFront)_geoLayer.bringToFront();
  }

  function setVisible(map,visible){
    if(!_ready)return;
    if(!_geoLayer)rebuildLayer();
    if(!_geoLayer)return;
    if(visible&&isCountyMode()){
      if(!map.hasLayer(_geoLayer))_geoLayer.addTo(map);
      update(cdata,activeMetric);
    }else if(map.hasLayer(_geoLayer)){
      map.removeLayer(_geoLayer);
    }
  }

  function getBounds(){
    if(!_geoLayer)return null;
    const bounds=_geoLayer.getBounds();
    return bounds&&bounds.isValid()?bounds:null;
  }

  return{build,update,setVisible,getBounds,rebuild:rebuildLayer};
})();

// ═══════════════════════════════════════════
// MODULE: HEATMAP
// Uses Inverse Distance Weighting (IDW) to interpolate weather values
// across a continuous grid, creating a smooth visual gradient.
// ═══════════════════════════════════════════
const HeatmapModule=(()=>{
  let _heatLayer=null;
  
  // Generate IDW-interpolated points from county centroids
  function genIDWPoints(cdata,metric,resolution=8,rawPoints=null){
    if(rawPoints && rawPoints.length > 0) {
      const validRawPoints=rawPoints
        .filter(p => Number.isFinite(p[metric]))
        .map(p => [p.lat, p.lon, normalizeMetricValue(metric,p[metric])]);
      if(validRawPoints.length>0)return validRawPoints;
    }
    const counties=activeCounties();
    const points=[];
    const selected=selectedCounty();
    const bbox=selected
      ? {minLat:selected.lat-0.75,maxLat:selected.lat+0.75,minLon:selected.lon-0.75,maxLon:selected.lon+0.75}
      : {minLat:-4.72,maxLat:4.62,minLon:33.88,maxLon:41.90};
    const step=(bbox.maxLon-bbox.minLon)/resolution;
    for(let lon=bbox.minLon;lon<=bbox.maxLon;lon+=step){
      for(let lat=bbox.minLat;lat<=bbox.maxLat;lat+=step){
        // Find 3 nearest counties, weight by inverse distance
        const dists=counties.map(c=>{
           const val = cdata[c.id] ? cdata[c.id][metric] : 0;
           return {
            c,val,
            d:Math.sqrt((c.lat-lat)**2+(c.lon-lon)**2)+0.01
           };
        }).sort((a,b)=>a.d-b.d).slice(0,3);
        const wSum=dists.reduce((s,d)=>s+1/d.d,0);
        const wVal=dists.reduce((s,d)=>s+(d.val/d.d),0)/wSum;
        points.push([lat,lon,normalizeMetricValue(metric,wVal)]);
      }
    }
    console.log('✓ Generated',points.length,'heatmap points');
    return points;
  }
  
  function build(map, gradient){
    // Create heatmap with visible gradient
    try {
      if (typeof L.heatLayer !== 'function') throw new Error('Leaflet.heat not loaded');
      _heatLayer=L.heatLayer([],{
        radius:42,blur:26,maxZoom:12,minOpacity:0.12,
        gradient: gradient || {0.0:'#e8f4fd',0.25:'#a8d8ea',0.5:'#2196f3',0.75:'#0d47a1',1.0:'#4a148c'}
      }).addTo(map);
      console.log('✓ Heatmap layer created');
    } catch(e) {
      console.warn('Heatmap module disabled:', e.message);
    }
  }
  
  function update(cdata,metric,rawPoints=null){
    if(!_heatLayer)return;
    const points=genIDWPoints(cdata,metric,metric==='rain'?10:12, rawPoints);
    _heatLayer.setLatLngs(points);
  }
  
  function setVisible(v){
    if(!_heatLayer) return;
    if(v) _heatLayer.addTo(map);
    else _heatLayer.remove();
  }
  
  return{build,update,setVisible,genIDWPoints};
})();

// ═══════════════════════════════════════════
// MODULE: WIND ARROWS
// Renders dynamic arrows indicating wind speed (via size/color) and direction.
// ═══════════════════════════════════════════
const WindArrowModule=(()=>{
  let _lg=null;

  function windColor(speed){
    if(speed<10)return '#2e7d32';
    if(speed<20)return '#00897b';
    if(speed<40)return '#673ab7';
    return '#b71c1c';
  }

  function windSize(speed){
    return Math.max(22,Math.min(44,18 + speed * 0.65));
  }

  function build(){
    _lg=L.layerGroup();
  }

  function update(cdata){
    if(!_lg)return;
    _lg.clearLayers();
    activeCounties().forEach(c=>{
      const d=cdata[c.id]||{};
      const speed=Number(d.wind);
      const dir=Number(d.wind_dir);
      if(!Number.isFinite(speed)||!Number.isFinite(dir))return;
      const size=windSize(speed);
      const icon=L.divIcon({
        className:'wind-arrow-icon',
        html:`<div class="wind-arrow" style="color:${windColor(speed)};transform:rotate(${dir}deg) scale(${size/32})"></div>`,
        iconSize:[size,size],
        iconAnchor:[size/2,size/2]
      });
      L.marker([c.lat,c.lon],{icon,interactive:true})
        .bindTooltip(`${c.name}: ${speed.toFixed(1)} km/h, ${Math.round(dir)}°`,{direction:'top',offset:[0,-10]})
        .addTo(_lg);
    });
  }

  function setVisible(map,visible){
    if(!_lg)return;
    visible?map.addLayer(_lg):map.removeLayer(_lg);
  }

  return{build,update,setVisible};
})();

// ═══════════════════════════════════════════
// MODULE: COUNTY LABELS
// ═══════════════════════════════════════════
const BorderModule=(()=>{
  let _lg=null;
  function build(map,visible){
    if(_lg)map.removeLayer(_lg);
    _lg=L.layerGroup();
    if(!visible)return;
    activeCounties().forEach(c=>{
      const icon=L.divIcon({
        className:'',
        html:`<div style="font-family:Lato,sans-serif;font-size:9px;color:rgba(255,255,255,0.92);text-shadow:0 0 3px #000,0 0 4px #000;white-space:nowrap;pointer-events:none;font-weight:700">${c.name}</div>`,
        iconAnchor:[0,6]
      });
      L.marker([c.lat,c.lon],{icon,interactive:false}).addTo(_lg);
    });
    map.addLayer(_lg);
  }
  function setVisible(map,v){if(!_lg)return;v?map.addLayer(_lg):map.removeLayer(_lg);}
  return{build,setVisible};
})();

// ═══════════════════════════════════════════
// MODULE: SCHOOLS  (colour by rainfall risk)
// Handles the distribution and clustering of school markers.
// Handles the distribution and clustering of markers.
// Schools are procedurally generated for the demo, but logic supports 
// real coordinates. Markers change color dynamically based on weather data.
// ═══════════════════════════════════════════
const SCHOOLS=(()=>{
  const r=mkRng(54321),res=[];
  COUNTIES.forEach(c=>{
    const n=50+Math.floor(r()*55);
    for(let i=0;i<n;i++){
      const type=r()<0.65?'Primary':'Secondary';
      res.push({lat:c.lat+(r()-.5)*.9,lon:c.lon+(r()-.5)*.9,
        county:c.name,cid:c.id,type,
        name:`${c.name} ${type} School ${i+1}`,
        enrollment:Math.floor(150+r()*900)});
    }
  });
  return res;
})();

const SchoolModule=(()=>{
  let _cluster=null;
  let _schoolMarkers={}; // Store markers by school index for recoloring
  

  function build(map,visible){
    if(_cluster){map.removeLayer(_cluster);_cluster=null;_schoolMarkers={};}
    const filterActive = layerVis.floodOnly;

    _cluster=L.markerClusterGroup({
      maxClusterRadius:55,disableClusteringAtZoom:12,showCoverageOnHover:false,chunkedLoading:true,
      spiderfyOnMaxZoom: true,
      iconCreateFunction(cl){
        const n=cl.getChildCount(),sz=n>200?40:n>50?33:27;
        const children=cl.getAllChildMarkers();
        let h=0,m=0,l=0;
        children.forEach(mk=>{const r=mk._risk;if(r==='high')h++;else if(r==='med')m++;else l++;});
        const bg=h>0?'rgba(229,57,53,.82)':m>0?'rgba(251,140,0,.82)':'rgba(67,160,71,.82)';
        return L.divIcon({
          html:`<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;color:#fff;font-size:${sz>33?11:10}px;font-weight:600;border:1.5px solid rgba(255,255,255,.4)">${n}</div>`,
          className:'',iconSize:[sz,sz]
        });
      }
    });

    // Populate clusters with school points
    activeSchools().forEach((s,idx)=>{
      const risk = calculateSchoolRisk(s, cdata, rawCsvData);
      const col=RISK_COLORS[risk];

      const mk=L.circleMarker([s.lat,s.lon],{radius:5,fillColor:col,fillOpacity:.92,color:'rgba(255,255,255,.35)',weight:1.2});
      mk._schoolIdx=idx;
      mk._risk=risk;
      mk.bindPopup(()=>{
        const d=cdata[s.cid];
        const details=calculateSchoolRiskDetails(s, cdata, rawCsvData);
        const{label}=SCHEMES.rain.classify(details.weather.rain);
        const risk=details.risk;
        const popupCol=RISK_COLORS[risk];
        return`<div style="font-family:Lato,sans-serif;min-width:195px;padding:2px">
          <div style="font-size:13px;font-weight:600;margin-bottom:6px;color:#000">${s.name}</div>
          <div style="margin-bottom:6px">
            <span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 8px;border-radius:3px;background:${popupCol}22;color:${popupCol};border:1px solid ${popupCol}55">${riskLabel(risk)}</span>
          </div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:3px 10px;font-size:11px">
            <span style="color:#999">County</span><span>${s.county}</span>
            <span style="color:#999">Type</span><span>${s.type}</span>
            <span style="color:#999">Enrollment</span><span>${s.enrollment.toLocaleString()} pupils</span>
            <span style="color:#999">7-day rain</span><span style="font-weight:600;color:${col}">${d.rain} mm · ${label}</span>
            <span style="color:#999">Tmin / Tmax</span><span>${d.tmin}°C / ${d.tmax}°C</span>
            <span style="color:#999">Conditions</span><span>${d.tmin}°C / ${d.tmax}°C · ${d.wind} km/h Wind</span>
          </div></div>`;
      },{maxWidth:240});
      mk.on('mouseover',()=>fillCard(s.county+' — '+s.name,s.cid));
      mk.on('mouseout',hideCard);
      _schoolMarkers[idx]=mk;
      _cluster.addLayer(mk);
    });
    if(visible)map.addLayer(_cluster);
  }
  
  function findAndZoom(query){
    const q = query.toLowerCase();
    const match = activeSchools().find(s => s.name.toLowerCase().includes(q));
    if(match) {
      map.flyTo([match.lat, match.lon], 14);
      return true;
    }
    return false;
  }

  function recolorMarkers(){
    // Recolor all markers based on current cdata rainfall
    activeSchools().forEach((s,idx)=>{
      const mk=_schoolMarkers[idx];
      if(!mk)return;
      const newRisk=calculateSchoolRisk(s, cdata, rawCsvData);
      const newCol=RISK_COLORS[newRisk];
      mk.setStyle({fillColor:newCol});
      mk._risk=newRisk;
    });
    if(_cluster)_cluster.refreshClusters();
  }
  
  function setVisible(map,v){if(!_cluster)return;v?map.addLayer(_cluster):map.removeLayer(_cluster);}
  
  return{build,recolorMarkers,setVisible,findAndZoom};
})();

// ═══════════════════════════════════════════
// TREND helper — compare county value to previous week
// ═══════════════════════════════════════════
let prevCdata=null;

function getTrendData(curr, prev, badIsUp = true) {
  if (prev === null || prev === undefined) return { cls: 'trend-eq', text: '–' };
  const diff = curr - prev;
  if (Math.abs(diff) < 0.1) return { cls: 'trend-eq', text: '→ 0' };
  const isUp = diff > 0;
  const cls = isUp === badIsUp ? 'trend-up' : 'trend-dn';
  const arrow = isUp ? '↑' : '↓';
  return { cls, text: `${arrow} ${Math.abs(diff).toFixed(1)}` };
}

// ═══════════════════════════════════════════
// UI: HOVER CARD
// Updates the detailed side-panel when hovering over counties or schools.
// ═══════════════════════════════════════════
function fillCard(title,cid){
  const d=cdata[cid];
  const prev=prevCdata?prevCdata[cid]:null;
  const{label,color,risk}=SCHEMES.rain.classify(d.rain);
  const sc=activeSchools().filter(s=>s.cid===cid).length;

  document.getElementById('hcR').textContent=d.rain+' mm';
  const rTr = getTrendData(d.rain, prev ? prev.rain : null, true);
  document.getElementById('hcRt').className = `hc-trend ${rTr.cls}`;
  document.getElementById('hcRt').textContent = rTr.text + ' mm';

  document.getElementById('hcC').textContent=label;
  document.getElementById('hcC').style.color=color;

  const tnTr = getTrendData(d.tmin, prev ? prev.tmin : null, false);
  document.getElementById('hcTn').textContent = d.tmin+'°C';
  document.getElementById('hcTnt').className = `hc-trend ${tnTr.cls}`;
  document.getElementById('hcTnt').textContent = tnTr.text + '°C';

  const wTr = getTrendData(d.wind, prev ? prev.wind : null, true);
  document.getElementById('hcW').textContent = d.wind+' km/h';
  document.getElementById('hcWt').className = `hc-trend ${wTr.cls}`;
  document.getElementById('hcWt').textContent = wTr.text + ' km/h';

  document.getElementById('hcS').textContent=sc+' schools';

  // Risk badge
  const riskCol={high:'#e53935',med:'#fb8c00',low:'#43a047'}[risk];
  const riskText={high:'HIGH RISK — immediate attention',med:'MODERATE — monitor closely',low:'LOW RISK — normal operations'}[risk];
  document.getElementById('hcBadge').innerHTML=`<div class="hc-risk-badge" style="background:${riskCol}18;color:${riskCol};border:1px solid ${riskCol}44">${riskText}</div>`;

  document.getElementById('hcard').classList.add('show');
}
function hideCard(){document.getElementById('hcard').classList.remove('show');}

// ═══════════════════════════════════════════
// UI: DASHBOARD UPDATES
// Aggregates statistics for the top-level summary cards.
// ═══════════════════════════════════════════
function updateDashboard(){
  let high=0,med=0,low=0;
  activeSchools().forEach(s=>{const r=calculateSchoolRisk(s, cdata, rawCsvData);if(r==='high')high++;else if(r==='med')med++;else low++;});
  const counties=activeCounties();
  const avgR=(counties.reduce((s,c)=>s+cdata[c.id].rain,0)/counties.length);

  const setCell=(id,val,prevVal,unit,badIsUp=true)=>{
    document.getElementById(id).textContent=val.toLocaleString()+(unit||'');
    const tEl=document.getElementById(id+'Trend');
    if(prevVal===null){tEl.textContent='–';tEl.className='dash-trend dash-eq';return;}
    const diff=val-prevVal;
    if(Math.abs(diff)<0.5){tEl.textContent='→ no change';tEl.className='dash-trend dash-eq';return;}
    const up=diff>0;
    tEl.textContent=(up?'↑ ':'↓ ')+Math.abs(diff).toFixed(unit?' 1':0)+(unit||'');
    // badIsUp: for risk counts, up is bad (red); for avg rainfall up is bad
    tEl.className='dash-trend '+(up===badIsUp?'dash-up':'dash-dn');
  };

  const ind = document.getElementById('sourceIndicator');
  if(rawCsvData) {
    ind.textContent = ind.dataset.mode === 'csv-api-wind' ? 'KMet CSV + API wind' : ind.dataset.mode === 'csv-baseline-wind' ? 'KMet CSV + wind baseline' : 'KMet CSV';
    ind.style.background = 'var(--status-live)';
  }
  else { ind.textContent = 'Simulated'; ind.style.background = 'var(--status-sim)'; }
  if(ind.dataset.mode === 'api') { ind.textContent = 'Live API'; ind.style.background = 'var(--status-api)'; }

  let pH=null,pM=null,pL=null,pA=null;
  if(prevCdata){
    let ph=0,pm=0,pl=0;
    activeSchools().forEach(s=>{ const r = calculateSchoolRisk(s, prevCdata, null); if(r==='high')ph++; else if(r==='med')pm++; else pl++; });
    pH=ph;pM=pm;pL=pl; pA=counties.reduce((s,c)=>s+prevCdata[c.id].rain,0)/counties.length;
  }

  setCell('dHigh',high,pH,'',true);
  setCell('dMed',med,pM,'',true);
  setCell('dLow',low,pL,'',false); // low risk going up is good
  setCell('dAvgR',Math.round(avgR*10)/10,pA,' mm',true);
}

function updateDataPanel(){
  document.getElementById('rainSource').textContent=dataState.rainSource;
  document.getElementById('windSource').textContent=dataState.windSource;
  document.getElementById('pointCount').textContent=dataState.pointCount.toLocaleString();
  document.getElementById('lastSync').textContent=dataState.lastSync;
}

function showStatus(message,isError=false){
  const st=document.getElementById('csvStatus');
  st.textContent=message;
  st.style.background=isError?'#fdecea':'var(--color-background-success)';
  st.style.borderColor=isError?'#e53935':'var(--color-border-success)';
  st.style.display='block';
  setTimeout(()=>st.style.display='none',4500);
}

function setUiBusy(isBusy){
  document.querySelectorAll('button,select,input').forEach(el=>{el.disabled=isBusy;});
}

function getAffectedSchools(){
  return activeSchools().map(s=>({school:s,details:calculateSchoolRiskDetails(s,cdata,rawCsvData)}))
    .filter(row=>row.details.risk!=='low')
    .sort((a,b)=>{
      const rank={high:2,med:1,low:0};
      return rank[b.details.risk]-rank[a.details.risk] || b.details.weather.rain-a.details.weather.rain || b.details.weather.wind-a.details.weather.wind;
    });
}

function getCountySummaryRows(){
  return activeCounties().map(c=>{
    const schools=activeSchools().filter(s=>s.cid===c.id);
    let high=0,med=0,low=0;
    schools.forEach(s=>{
      const risk=calculateSchoolRisk(s,cdata,rawCsvData);
      if(risk==='high')high++;else if(risk==='med')med++;else low++;
    });
    const d=cdata[c.id]||{};
    return {
      county:c.name,total:schools.length,high,moderate:med,low,
      rain:d.rain||0,tmin:d.tmin||0,tmax:d.tmax||0,wind:d.wind||0,wind_dir:d.wind_dir||0
    };
  }).sort((a,b)=>b.high-a.high || b.moderate-a.moderate || b.rain-a.rain);
}

function updateRiskTable(){
  const rows=getAffectedSchools().slice(0,80);
  const body=document.getElementById('riskTableBody');
  if(!body)return;
  if(!rows.length){
    body.innerHTML='<tr><td colspan="6">No moderate or high risk schools for the current data.</td></tr>';
    return;
  }
  body.innerHTML=rows.map(({school,details})=>`
    <tr>
      <td>${school.name}</td>
      <td>${school.county}</td>
      <td><span class="risk-badge ${details.risk}">${riskLabel(details.risk)}</span></td>
      <td>${details.weather.rain.toFixed(1)} mm</td>
      <td>${details.weather.wind.toFixed(1)} km/h</td>
      <td>${details.reason}</td>
    </tr>`).join('');
}

// ═══════════════════════════════════════════
// ANALYTICS & TRENDS
// Handles historical data aggregation and chart rendering.
// ═══════════════════════════════════════════
function cacheKeyForForecast(forecast){
  return `${userSession.role}:${userSession.countyId||'ALL'}:${forecast.file}`;
}

function parsedFromPrecomputed(forecast){
  if(!PRECOMPUTED_FORECASTS)return null;
  const period=PRECOMPUTED_FORECASTS.periods.find(p=>p.file===forecast.file);
  if(!period)return null;
  const data={};
  let count=0;
  activeCounties().forEach(c=>{
    const row=period.counties[String(c.id)];
    if(!row)return;
    count+=row.point_count||0;
    data[c.id]={
      rain:row.rain,
      tmin:row.tmin,
      tmax:row.tmax,
      wind:row.wind ?? BASE[c.id].wind,
      wind_dir:row.wind_dir ?? BASE[c.id].wind_dir
    };
  });
  return {data,count,name:forecast.file,raw:null,hasWind:false,hasWindDir:false};
}

async function loadForecastData(forecast){
  const key=cacheKeyForForecast(forecast);
  if(forecastDataCache.has(key))return forecastDataCache.get(key);
  const precomputed=parsedFromPrecomputed(forecast);
  if(precomputed){
    forecastDataCache.set(key,precomputed);
    return precomputed;
  }
  const resp=await fetch(`data/${forecast.file}`);
  if(!resp.ok)throw new Error(`HTTP ${resp.status}`);
  const parsed=parseForecastCSV(await resp.text(),forecast.file);
  forecastDataCache.set(key,parsed);
  return parsed;
}

function getTrendCountySelection(){
  const sel=document.getElementById('trendCountySel');
  return sel?sel.value:'scope';
}

function getTrendMetricSelection(){
  const sel=document.getElementById('trendMetricSel');
  return sel?sel.value:'all';
}

function getTrendPeriodSelection(){
  const sel=document.getElementById('trendPeriodSel');
  return sel?sel.value:'yearly';
}

function getTrendYearSelection(){
  const sel=document.getElementById('trendYearSel');
  return sel?sel.value:'';
}

function getTrendCounties(){
  const selected=getTrendCountySelection();
  if(selected==='scope')return activeCounties();
  const county=COUNTIES.find(c=>String(c.id)===selected);
  if(county&&canAccessCounty(county.id))return [county];
  return activeCounties();
}

function populateTrendControls(){
  const countySel=document.getElementById('trendCountySel');
  if(countySel){
    const current=countySel.value||'scope';
    countySel.innerHTML='';
    const scopeOpt=document.createElement('option');
    scopeOpt.value='scope';
    scopeOpt.textContent=isCountyMode()?'Selected county':'All accessible counties';
    countySel.appendChild(scopeOpt);
    activeCounties().forEach(c=>{
      const opt=document.createElement('option');
      opt.value=c.id;
      opt.textContent=c.name;
      countySel.appendChild(opt);
    });
    countySel.value=[...countySel.options].some(o=>o.value===current)?current:'scope';
    countySel.disabled=isCountyMode();
  }

  const yearSel=document.getElementById('trendYearSel');
  if(yearSel){
    const current=yearSel.value;
    const years=[...new Set(FORECASTS.map(f=>(f.start||'').slice(0,4)).filter(Boolean))].sort();
    yearSel.innerHTML='';
    years.forEach(year=>{
      const opt=document.createElement('option');
      opt.value=year;
      opt.textContent=year;
      yearSel.appendChild(opt);
    });
    yearSel.value=years.includes(current)?current:(years[years.length-1]||'');
    yearSel.disabled=getTrendPeriodSelection()==='yearly';
  }
}

async function buildAnalyticsSeries(){
  const trendCountyKey=getTrendCounties().map(c=>c.id).join(',');
  const scopeKey=`${userSession.role}:${userSession.countyId||'ALL'}:${trendCountyKey}:raw:${FORECASTS.map(f=>f.file).join('|')}`;
  if(analyticsCache.has(scopeKey))return analyticsCache.get(scopeKey);
  const series=[];
  for(const forecast of FORECASTS){
    let parsed=null;
    if(PRECOMPUTED_FORECASTS)parsed=parsedFromPrecomputed(forecast);
    else {
      const key=cacheKeyForForecast(forecast);
      if(forecastDataCache.has(key))parsed=forecastDataCache.get(key);
    }
    if(!parsed)continue;
    const allowed=new Set(getTrendCounties().map(c=>c.id));
    const vals=Object.entries(parsed.data).filter(([cid])=>allowed.has(Number(cid))).map(([,row])=>row);
    const avg=metric=>vals.length?vals.reduce((sum,v)=>sum+(Number(v[metric])||0),0)/vals.length:0;
    series.push({
      label:forecast.label,
      file:forecast.file,
      start:forecast.start,
      end:forecast.end,
      year:(forecast.start||'').slice(0,4),
      month:(forecast.start||'').slice(4,6),
      rain:avg('rain'),
      tmin:avg('tmin'),
      tmax:avg('tmax'),
      wind:avg('wind')
    });
  }
  analyticsCache.set(scopeKey,series);
  return series;
}

function monthLabel(month){
  const names=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const idx=Number(month)-1;
  return names[idx]||month||'';
}

function aggregateAnalyticsSeries(series){
  const period=getTrendPeriodSelection();
  const selectedYear=getTrendYearSelection();
  const rows=period==='monthly'?series.filter(row=>row.year===selectedYear):series;
  const groups=new Map();
  rows.forEach(row=>{
    const key=period==='monthly'?`${row.year}-${row.month}`:row.year;
    if(!key||key==='-')return;
    if(!groups.has(key))groups.set(key,{key,label:period==='monthly'?monthLabel(row.month):key,count:0,rain:0,tmin:0,tmax:0,wind:0});
    const group=groups.get(key);
    group.count+=1;
    ['rain','tmin','tmax','wind'].forEach(metric=>{group[metric]+=Number(row[metric])||0;});
  });
  return [...groups.values()].sort((a,b)=>a.key.localeCompare(b.key)).map(group=>{
    ['rain','tmin','tmax','wind'].forEach(metric=>{group[metric]=group.count?group[metric]/group.count:0;});
    return group;
  });
}

function renderMiniBars(id,series,metric,unit,color){
  const el=document.getElementById(id);
  if(!el)return;
  const vals=series.map(row=>row[metric]);
  const max=Math.max(...vals,0.001);
  const points=series.map((row,idx)=>{
    const x=series.length===1?50:(idx/(series.length-1))*100;
    const y=100-((row[metric]/max)*88+6);
    return `${x.toFixed(2)},${Math.max(4,Math.min(96,y)).toFixed(2)}`;
  }).join(' ');
  const bars=series.map(row=>{
    const h=Math.max(6,(row[metric]/max)*78);
    return `<div class="mini-bar" style="height:${h}px;background:${color}" data-tip="${row.label}: ${row[metric].toFixed(1)} ${unit}"></div>`;
  }).join('');
  const axis=series.length>1
    ? `<span>${series[0].label}</span><span>${series[series.length-1].label}</span>`
    : `<span>${series[0]?.label||''}</span>`;
  el.classList.add('trend-chart');
  el.innerHTML=`<div class="trend-plot"><div class="mini-bars">${bars}</div><svg class="trend-line" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${points}" fill="none" stroke="#fff" stroke-width="5" opacity="0.45" vector-effect="non-scaling-stroke"/><polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg></div><div class="trend-axis">${axis}</div>`;
}

async function updateAnalytics(){
  populateTrendControls();
  const trendCounties=getTrendCounties();
  const scopeEl=document.getElementById('analyticsScope');
  if(scopeEl)scopeEl.textContent=trendCounties.length===1?`${trendCounties[0].name} County`:'All accessible counties';
  try{
    const series=await buildAnalyticsSeries();
    if(!series.length)return;
    const displaySeries=aggregateAnalyticsSeries(series);
    if(!displaySeries.length)return;
    const selectedMetric=getTrendMetricSelection();
    ['rain','tmin','tmax','wind'].forEach(metric=>{
      const ids={rain:'rainTrend',tmin:'tminTrend',tmax:'tmaxTrend',wind:'windTrend'};
      const units={rain:'mm',tmin:'C',tmax:'C',wind:'km/h'};
      const colors={rain:'#2196f3',tmin:'#1d9e75',tmax:'#d85a30',wind:'#673ab7'};
      const card=document.getElementById(ids[metric])?.closest('.analytics-card');
      if(card)card.style.display=(selectedMetric==='all'||selectedMetric===metric)?'block':'none';
      renderMiniBars(ids[metric],displaySeries,metric,units[metric],colors[metric]);
    });
  }catch(e){
    console.warn('Analytics update failed:',e);
  }
}

function csvEscape(value){
  const text=String(value??'');
  return /[",\n]/.test(text)?`"${text.replace(/"/g,'""')}"`:text;
}

function downloadCSV(filename,rows){
  const csv=rows.map(r=>r.map(csvEscape).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
  URL.revokeObjectURL(url);
}

function exportCountyCSV(){
  const rows=[['county','total_schools','high_risk','moderate_risk','low_risk','rain_mm','tmin_c','tmax_c','wind_kmh','wind_direction_deg']];
  getCountySummaryRows().forEach(r=>rows.push([r.county,r.total,r.high,r.moderate,r.low,r.rain.toFixed(1),r.tmin.toFixed(1),r.tmax.toFixed(1),r.wind.toFixed(1),Math.round(r.wind_dir)]));
  downloadCSV('county-risk-summary.csv',rows);
}

function exportAffectedSchoolsCSV(){
  const rows=[['school','county','risk','rain_mm','wind_kmh','wind_direction_deg','reason','enrollment','type']];
  getAffectedSchools().forEach(({school,details})=>rows.push([school.name,school.county,details.risk,details.weather.rain.toFixed(1),details.weather.wind.toFixed(1),Math.round(details.weather.wind_dir),details.reason,school.enrollment,school.type]));
  downloadCSV('affected-schools.csv',rows);
}

function printCountyReport(){
  const summaries=getCountySummaryRows().filter(r=>r.high||r.moderate).slice(0,20);
  const schools=getAffectedSchools().slice(0,120);
  const html=`<!doctype html><html><head><title>County Risk Report</title><style>
    body{font-family:Arial,sans-serif;margin:24px;color:#111}h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin-top:22px}
    .meta{color:#555;font-size:12px;margin-bottom:16px}.county{border:1px solid #ddd;border-radius:6px;padding:10px;margin:8px 0;break-inside:avoid}
    .county strong{font-size:14px}.stats{font-size:12px;color:#333;margin-top:5px}table{width:100%;border-collapse:collapse;font-size:11px;margin-top:8px}
    th,td{border-bottom:1px solid #ddd;padding:6px;text-align:left}th{background:#f4f4f4}.high{color:#c62828;font-weight:700}.med{color:#ef6c00;font-weight:700}
  </style></head><body>
    <h1>County School Weather Risk Report</h1>
    <div class="meta">Rain/temp: ${dataState.rainSource} | Wind: ${dataState.windSource} | Generated: ${new Date().toLocaleString('en-KE')}</div>
    <h2>County Snapshot</h2>
    ${summaries.map(r=>`<div class="county"><strong>${r.county}</strong><div class="stats">Schools: ${r.total} | High: ${r.high} | Moderate: ${r.moderate} | Rain: ${r.rain.toFixed(1)} mm | Wind: ${r.wind.toFixed(1)} km/h @ ${Math.round(r.wind_dir)} deg</div></div>`).join('')}
    <h2>Affected Schools</h2>
    <table><thead><tr><th>School</th><th>County</th><th>Risk</th><th>Rain</th><th>Wind</th><th>Reason</th></tr></thead><tbody>
    ${schools.map(({school,details})=>`<tr><td>${school.name}</td><td>${school.county}</td><td class="${details.risk}">${riskLabel(details.risk)}</td><td>${details.weather.rain.toFixed(1)} mm</td><td>${details.weather.wind.toFixed(1)} km/h</td><td>${details.reason}</td></tr>`).join('')}
    </tbody></table></body></html>`;
  const win=window.open('','_blank');
  if(!win){alert('Allow popups to open the report.');return;}
  win.document.write(html);win.document.close();win.focus();win.print();
}

// ═══════════════════════════════════════════
// LEGEND + STATS
// ═══════════════════════════════════════════
function updateLegend(){
  const scheme = SCHEMES[activeMetric];
  const items = getDynamicLegendItems(activeMetric);
  let html = '';
  items.forEach(l => {
    // Extract numeric threshold for matching description, but adjust for range logic
    let val = parseFloat(l.label.replace(/[^0-9.]/g, '')) || 0;
    if (l.label.includes('<')) val = val - 1; 
    if (l.label.includes('>')) val = val + 1;
    
    const classification = scheme.classify(val);
    const desc = l.desc || classification.desc || '';

    html += `<div class="leg-row" style="margin-bottom:6px">
      <div class="leg-sw" style="background:${l.color}${l.border?';border:0.5px solid #aaa':''};height:12px"></div>
      <div style="display:flex;flex-direction:column"><span class="leg-lbl" style="font-weight:700">${l.label}</span>
      <span style="font-size:9px;color:rgba(255,255,255,0.7);line-height:1">${desc}</span></div>
    </div>`;
  });
  document.getElementById('legItems').innerHTML = html;
}
function updateStats(){
  const counties=activeCounties();
  const vals=counties.map(c=>cdata[c.id]).filter(Boolean);
  document.getElementById('stSch').textContent=activeSchools().length.toLocaleString();
  if(!vals.length)return;
  document.getElementById('stAvR').textContent=(vals.reduce((s,v)=>s+v.rain,0)/vals.length).toFixed(1)+' mm';
  document.getElementById('stMxR').textContent=Math.max(...vals.map(v=>v.rain)).toFixed(1)+' mm';
  document.getElementById('stTmx').textContent=(vals.reduce((s,v)=>s+v.tmax,0)/vals.length).toFixed(1)+'°C';
  document.getElementById('stWnd').textContent=(vals.reduce((s,v)=>s+v.wind,0)/vals.length).toFixed(1)+' km/h';
  const atRisk=activeSchools().filter(s=>calculateSchoolRisk(s,cdata,rawCsvData)==='high').length;
  document.getElementById('stRsk').textContent=atRisk.toLocaleString();
}
function updateZoomLabel(){
  if(isCountyMode()){
    const c=selectedCounty();
    document.getElementById('zLbl').textContent=`${c.name} County view`;
    return;
  }
  const z=map.getZoom();
  document.getElementById('zLbl').textContent=
    z<7?'National view — smooth fill':z<12?'County view — clusters visible':'Local view — individual schools';
}

// ═══════════════════════════════════════════
// EXTERNAL INTEGRATIONS
// 1. LIVE API: Fetches real-time wind/temp from Open-Meteo.
// 2. CSV LOADER: Parses KMet weather forecast files with fuzzy header matching.
// ═══════════════════════════════════════════
async function fetchOpenMeteoDaily() {
  const counties=activeCounties();
  const lats = counties.map(c => c.lat).join(',');
  const lons = counties.map(c => c.lon).join(',');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant&timezone=Africa%2FNairobi`;
  const resp = await fetch(url);
  if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  return {counties,data:Array.isArray(data) ? data : [data]};
}

async function fetchLiveWindAPI({showStatus=false}={}) {
  const ind = document.getElementById('sourceIndicator');
  if(showStatus) ind.textContent = 'Syncing wind...';
  const {counties,data} = await fetchOpenMeteoDaily();
  counties.forEach((c, i) => {
    const daily = data[i]?.daily;
    if(!daily || !cdata[c.id])return;
    cdata[c.id].wind = daily.wind_speed_10m_max?.[0] ?? cdata[c.id].wind;
    cdata[c.id].wind_dir = daily.wind_direction_10m_dominant?.[0] ?? cdata[c.id].wind_dir;
  });
  if(rawCsvData) ind.dataset.mode = 'csv-api-wind';
  dataState.windSource='Open-Meteo API';
  dataState.lastSync=new Date().toLocaleString('en-KE');
  refresh();
  SchoolModule.recolorMarkers();
  return data.length;
}

async function fetchLiveAPI() {
  const ind = document.getElementById('sourceIndicator');
  ind.textContent = 'Syncing wind...';
  try {
    await fetchLiveWindAPI({showStatus:true});
    document.getElementById('togWindLayer').checked = true;
    layerVis.wind = true;
    WindArrowModule.setVisible(map,true);
    SchoolModule.recolorMarkers();
  } catch(e) {
    showStatus('Wind API sync failed: ' + e.message,true);
    ind.textContent = 'Error';
  }
}

// ═══════════════════════════════════════════
// CSV LOADER
// ═══════════════════════════════════════════
function findHeader(headers, names) {
  return headers.findIndex(h => names.includes(h.replace(/[\s_-]+/g, '')));
}

/**
 * Fuzzy CSV Parser:
 * Automatically detects latitude, longitude, and weather metrics regardless of header names.
 */
function parseForecastCSV(text, name='forecast.csv') {
  const lines=text.trim().split(/\r?\n/);
  const sep=lines[0].includes('\t')?'\t':',';
  const hdrs=lines[0].split(sep).map(h=>h.trim().toLowerCase());
  const normalized=hdrs.map(h=>h.replace(/[\s_-]+/g, ''));
  const iLon=findHeader(normalized,['lon','lng','longitude']);
  const iLat=findHeader(normalized,['lat','latitude']);
  const iR=findHeader(normalized,['rain','rainfall','precipitation','precipitationsum']);
  const iTn=findHeader(normalized,['tmin','mintemp','temperaturemin','temperature2mmin']);
  const iTx=findHeader(normalized,['tmax','maxtemp','temperaturemax','temperature2mmax']);
  const iWind=findHeader(normalized,['wind','windspeed','windspeed10mmax','windspd']);
  const iWindDir=findHeader(normalized,['winddir','winddirection','winddirection10mdominant']);
  if(iLon<0||iLat<0||iR<0) throw new Error('CSV needs: lon, lat, Rain');

  const scopedCountyIds=new Set(activeCounties().map(c=>c.id));
  const agg={};
  const raw=[];
  activeCounties().forEach(c=>{agg[c.id]={rain:[],tmin:[],tmax:[],wind:[],wind_dir:[]};});
  let n=0;
  for(let i=1;i<lines.length;i++){
    const cols=lines[i].split(sep);
    const lon=+cols[iLon],lat=+cols[iLat],rain=+cols[iR];
    const tmin=iTn>=0?+cols[iTn]:NaN;
    const tmax=iTx>=0?+cols[iTx]:NaN;
    const wind=iWind>=0?+cols[iWind]:NaN;
    const windDir=iWindDir>=0?+cols[iWindDir]:NaN;
    if(isNaN(lon)||isNaN(lat)||isNaN(rain))continue;
    const{c}=nearest(lat,lon);
    if(!scopedCountyIds.has(c.id))continue;
    n++;
    agg[c.id].rain.push(rain);
    if(!isNaN(tmin))agg[c.id].tmin.push(tmin);
    if(!isNaN(tmax))agg[c.id].tmax.push(tmax);
    if(!isNaN(wind))agg[c.id].wind.push(wind);
    if(!isNaN(windDir))agg[c.id].wind_dir.push(windDir);
    if(raw.length<MAX_RAW_POINTS || i % 50 === 0)raw.push({lat,lon,rain,tmin,tmax,wind,wind_dir:windDir});
  }

  const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
  const nd={};
  activeCounties().forEach(c=>{
    const a=agg[c.id];
    nd[c.id]={
      rain:Math.round((avg(a.rain)??BASE[c.id].rain)*10)/10,
      tmin:Math.round((avg(a.tmin)??BASE[c.id].tmin)*10)/10,
      tmax:Math.round((avg(a.tmax)??BASE[c.id].tmax)*10)/10,
      wind:Math.round((avg(a.wind)??BASE[c.id].wind)*10)/10,
      wind_dir:Math.round((avg(a.wind_dir)??BASE[c.id].wind_dir)*10)/10
    };
  });

  return {data:nd,count:n,name,raw,hasWind:iWind>=0,hasWindDir:iWindDir>=0};
}

function applyForecastData(parsed) {
  prevCdata={...cdata};
  cdata=parsed.data;
  rawCsvData=parsed.raw;
  const ind=document.getElementById('sourceIndicator');
  ind.dataset.mode=parsed.hasWind ? 'csv' : 'csv-baseline-wind';
  dataState.rainSource=`CSV: ${parsed.name}`;
  dataState.pointCount=parsed.count;
  dataState.lastSync=new Date().toLocaleString('en-KE');
  if(parsed.hasWind)dataState.windSource=`CSV: ${parsed.name}`;
  refresh();
  SchoolModule.recolorMarkers();
}

function loadCSV(file,onDone){
  const reader=new FileReader();
  reader.onload=ev=>{
    try {
      const parsed=parseForecastCSV(ev.target.result,file.name);
      forecastDataCache.set(`${userSession.role}:${userSession.countyId||'ALL'}:${file.name}`,parsed);
      analyticsCache.clear();
      onDone(parsed);
    } catch(e) {
      alert(e.message);
    }
  };
  reader.readAsText(file);
}

async function loadDefaultForecastCSV(){
  try{
    const forecast=FORECASTS[currentWeek]||FORECASTS[FORECASTS.length-1];
    const parsed=await loadForecastData(forecast);
    applyForecastData(parsed);
    const st=document.getElementById('csvStatus');
    st.textContent=`✓ ${parsed.count.toLocaleString()} forecast points loaded from ${parsed.name}`;
    st.style.display='block';setTimeout(()=>st.style.display='none',4000);
    if(!parsed.hasWind)await fetchLiveWindAPI();
  }catch(e){
    console.warn('Default forecast CSV load failed:',e);
  }
}

async function loadSelectedForecastCSV(){
  showStatus('Loading selected forecast...');
  setUiBusy(true);
  try{
    cdata=genCData(FORECASTS[currentWeek].seed);
    prevCdata=currentWeek>0?genCData(FORECASTS[currentWeek-1].seed):null;
    if(isCountyMode()){
      cdata=filterCdataForScope(cdata);
      prevCdata=prevCdata?filterCdataForScope(prevCdata):null;
    }
    rawCsvData=null;
    document.getElementById('sourceIndicator').dataset.mode='';
    refresh();
    SchoolModule.recolorMarkers();
    await loadDefaultForecastCSV();
    await updateAnalytics();
    if(isCountyMode())fitSelectedCounty();
  }finally{
    setUiBusy(false);
  }
}

function parseForecastDate(value){
  return new Date(`${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}T00:00:00`);
}

function formatForecastLabel(start,end){
  const s=parseForecastDate(start);
  const e=parseForecastDate(end);
  return `${s.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'2-digit'})} to ${e.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'2-digit'})}`;
}

let FORECASTS=[
  {file:'20260105_to_20260112_fcst.csv',start:'20260105',end:'20260112'},
  {file:'20260202_to_20260209_fcst.csv',start:'20260202',end:'20260209'},
  {file:'20260302_to_20260309_fcst.csv',start:'20260302',end:'20260309'},
  {file:'20260413_to_20260420_fcst.csv',start:'20260413',end:'20260420'},
  {file:'20260504_to_20260511_fcst.csv',start:'20260504',end:'20260511'}
].map((f,i)=>({...f,label:formatForecastLabel(f.start,f.end),seed:(i+1)*31337}));

function forecastFromFilename(file){
  const match=file.match(/^(\d{8})_to_(\d{8})_fcst\.csv$/);
  if(!match)return null;
  return {file,start:match[1],end:match[2]};
}

async function discoverForecastFiles(){
  const resp=await fetch('data/');
  if(!resp.ok)throw new Error(`HTTP ${resp.status}`);
  const html=await resp.text();
  const doc=new DOMParser().parseFromString(html,'text/html');
  const files=[...doc.querySelectorAll('a')]
    .map(a=>decodeURIComponent(a.getAttribute('href')||'').split('/').pop())
    .map(forecastFromFilename)
    .filter(Boolean);
  if(!files.length)throw new Error('No forecast CSV files found in data directory listing');
  return files;
}

async function loadForecastManifest(){
  try{
    const resp=await fetch('data/forecast_county_data.json');
    if(resp.ok){
      PRECOMPUTED_FORECASTS=await resp.json();
      FORECASTS=PRECOMPUTED_FORECASTS.periods
        .map((f,i)=>({...f,label:formatForecastLabel(f.start,f.end),seed:(i+1)*31337}))
        .sort((a,b)=>a.start.localeCompare(b.start));
      return;
    }
  }catch(e){
    console.warn('Precomputed forecast data unavailable:',e);
  }
  try{
    const files=await discoverForecastFiles();
    FORECASTS=files
      .map((f,i)=>({...f,label:formatForecastLabel(f.start,f.end),seed:(i+1)*31337}))
      .sort((a,b)=>a.start.localeCompare(b.start));
  }catch(e){
    console.warn('Forecast directory discovery failed, trying manifest:',e);
    try{
      const resp=await fetch('data/forecast_files.json');
      if(!resp.ok)throw new Error(`HTTP ${resp.status}`);
      const files=await resp.json();
      FORECASTS=files
        .map((f,i)=>({...f,label:formatForecastLabel(f.start,f.end),seed:(i+1)*31337}))
        .sort((a,b)=>a.start.localeCompare(b.start));
    }catch(err){
      console.warn('Forecast manifest load failed, using built-in list:',err);
    }
  }
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════
const map=L.map('map',{center:[-0.5,37.9],zoom:6,zoomControl:true});
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'© OpenStreetMap contributors'
}).addTo(map);

let activeMetric='rain';
let currentWeek=FORECASTS.length-1;
let cdata=genCData(FORECASTS[currentWeek].seed);
prevCdata=currentWeek>0?genCData(FORECASTS[currentWeek-1].seed):null;
let rawCsvData=null;
const layerVis={heat:true,county:true,school:true,wind:false};

// Build modules
CountyChoroModule.build(map);
SubcountyModule.build(map);
HeatmapModule.build(map);
WindArrowModule.build(map);

function fitSelectedCounty(){
  const c=selectedCounty();
  if(!c)return;
  const admin2Bounds=SubcountyModule.getBounds();
  if(admin2Bounds){
    map.fitBounds(admin2Bounds,{padding:[28,28],maxZoom:10});
    return;
  }
  const pad=Math.max(0.35,Math.min(1.25,Math.sqrt(c.area)/130));
  map.fitBounds([[c.lat-pad,c.lon-pad],[c.lat+pad,c.lon+pad]],{padding:[28,28],maxZoom:10});
}

function rebuildScopedLayers(){
  SubcountyModule.rebuild();
  BorderModule.build(map,layerVis.county);
  SchoolModule.build(map,layerVis.school);
  refresh();
}

async function loadNationalView(){
  userSession={role:'NATIONAL_ADMIN',countyId:null};
  cdata=genCData(FORECASTS[currentWeek].seed);
  prevCdata=currentWeek>0?genCData(FORECASTS[currentWeek-1].seed):null;
  rawCsvData=null;
  dataState.rainSource='Waiting for CSV';
  dataState.windSource='Waiting for API';
  dataState.pointCount=0;
  dataState.lastSync='Not synced';
  map.setView([-0.5,37.9],6);
  rebuildScopedLayers();
  await loadDefaultForecastCSV();
  await updateAnalytics();
}

async function loadCountyView(countyId){
  userSession={role:'COUNTY_OFFICER',countyId:Number(countyId)};
  cdata=filterCdataForScope(genCData(FORECASTS[currentWeek].seed));
  prevCdata=currentWeek>0?filterCdataForScope(genCData(FORECASTS[currentWeek-1].seed)):null;
  rawCsvData=null;
  dataState.rainSource='Waiting for county CSV';
  dataState.windSource='Waiting for county API';
  dataState.pointCount=0;
  dataState.lastSync='Not synced';
  rebuildScopedLayers();
  fitSelectedCounty();
  await loadDefaultForecastCSV();
  await updateAnalytics();
  fitSelectedCounty();
}

function refresh(){
  CountyChoroModule.update(cdata,activeMetric);
  SubcountyModule.update(cdata,activeMetric);
  HeatmapModule.update(cdata,activeMetric,rawCsvData);
  WindArrowModule.update(cdata);
  CountyChoroModule.setVisible(layerVis.heat);
  SubcountyModule.setVisible(map,layerVis.heat);
  HeatmapModule.setVisible(layerVis.heat);
  WindArrowModule.setVisible(map,layerVis.wind);
  updateLegend();updateStats();updateZoomLabel();updateDashboard();updateDataPanel();
}

BorderModule.build(map,layerVis.county);
SchoolModule.build(map,layerVis.school);

// Forecast selector
const ws=document.getElementById('weekSel');
function populateForecastSelector(){
  ws.innerHTML='';
  FORECASTS.forEach((w,i)=>{
    const o=document.createElement('option');o.value=i;o.textContent=w.label;
    if(i===currentWeek)o.selected=true;ws.appendChild(o);
  });
}
ws.addEventListener('change',async e=>{
  currentWeek=+e.target.value;
  await loadSelectedForecastCSV();
});

// Metric buttons
document.querySelectorAll('.metric-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.metric-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');activeMetric=btn.dataset.m;refresh();
  });
});

// API Sync Button
document.getElementById('apiSyncBtn').addEventListener('click', fetchLiveAPI);
document.getElementById('exportCountyBtn').addEventListener('click', exportCountyCSV);
document.getElementById('exportSchoolsBtn').addEventListener('click', exportAffectedSchoolsCSV);
document.getElementById('printReportBtn').addEventListener('click', printCountyReport);

// Layer toggles
document.getElementById('togHeat').addEventListener('change',e=>{layerVis.heat=e.target.checked;CountyChoroModule.setVisible(e.target.checked);SubcountyModule.setVisible(map,e.target.checked);HeatmapModule.setVisible(e.target.checked);});
document.getElementById('togCounty').addEventListener('change',e=>{layerVis.county=e.target.checked;BorderModule.setVisible(map,e.target.checked);});
document.getElementById('togWindLayer').addEventListener('change',e=>{layerVis.wind=e.target.checked;WindArrowModule.setVisible(map,e.target.checked);});
document.getElementById('togSchool').addEventListener('change',e=>{layerVis.school=e.target.checked;SchoolModule.setVisible(map,e.target.checked);});
document.getElementById('trendCountySel')?.addEventListener('change',()=>{analyticsCache.clear();updateAnalytics();});
document.getElementById('trendPeriodSel')?.addEventListener('change',updateAnalytics);
document.getElementById('trendYearSel')?.addEventListener('change',updateAnalytics);
document.getElementById('trendMetricSel')?.addEventListener('change',updateAnalytics);

// Search implementation
document.getElementById('mapSearch').addEventListener('keypress', e => {
  if(e.key === 'Enter') {
    const val = e.target.value;
    const found = SchoolModule.findAndZoom(val);
    if(!found) { alert('No matching school found.'); }
  }
});

// Hover card
map.on('mousemove',e=>{
  const{lat,lng}=e.latlng;
  const{c,d2}=nearestCounty(lat,lng,activeCounties());
  if(d2<2.5)fillCard(c.name+' County',c.id);else hideCard();
});
map.on('mouseout',hideCard);
map.on('zoomend',updateZoomLabel);

// CSV upload
document.getElementById('csvIn').addEventListener('change',e=>{
  const file=e.target.files[0];if(!file)return;
  loadCSV(file,async(parsed)=>{
    applyForecastData(parsed);
    if(!parsed.hasWind)await fetchLiveWindAPI();
    await updateAnalytics();
    const st=document.getElementById('csvStatus');
    st.textContent=`✓ ${parsed.count.toLocaleString()} points loaded from ${parsed.name}`;
    st.style.display='block';setTimeout(()=>st.style.display='none',4000);
  });
  e.target.value='';
});

function initLogin(){
  const roleSel=document.getElementById('roleSel');
  const countySel=document.getElementById('countySel');
  const form=document.getElementById('loginForm');
  COUNTIES.forEach(c=>{
    const opt=document.createElement('option');
    opt.value=c.id;opt.textContent=c.name;countySel.appendChild(opt);
  });
  function syncCountyControl(){
    countySel.disabled=roleSel.value==='NATIONAL_ADMIN';
  }
  roleSel.addEventListener('change',syncCountyControl);
  syncCountyControl();
  document.getElementById('switchAccountBtn')?.addEventListener('click',()=>{
    roleSel.value=userSession.role;
    countySel.value=userSession.countyId||COUNTIES[0].id;
    syncCountyControl();
    document.getElementById('loginOverlay').classList.remove('hidden');
  });
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    document.getElementById('loginOverlay').classList.add('hidden');
    map.invalidateSize();
    if(roleSel.value==='COUNTY_OFFICER')await loadCountyView(countySel.value);
    else await loadNationalView();
  });
}

// Initial render waits for role/county login.
setTimeout(async()=>{
  map.invalidateSize();
  await loadForecastManifest();
  currentWeek=FORECASTS.length-1;
  populateForecastSelector();
  initLogin();
},50);
