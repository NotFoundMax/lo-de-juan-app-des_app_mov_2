import { useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface MapWebViewProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (data: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
}

// Construye el HTML del mapa con Leaflet
function buildHtml(initialLat: number, initialLng: number) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, sans-serif; overflow:hidden; }
  #map { position:absolute; top:56px; left:0; right:0; bottom:0; }
  #search-box {
    position:absolute; top:8px; left:8px; right:8px; z-index:999;
    background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.18);
    overflow:hidden;
  }
  #search-input {
    width:100%; border:none; outline:none; padding:14px 16px; font-size:15px;
    background:transparent;
  }
  #suggestions {
    max-height:200px; overflow-y:auto; display:none;
    border-top:1px solid #e5e7eb;
  }
  .suggestion-item {
    padding:12px 16px; font-size:14px; color:#374151;
    border-bottom:1px solid #f3f4f6; cursor:pointer;
  }
  .suggestion-item:hover, .suggestion-item:active {
    background:#f3f4f6;
  }
  .suggestion-item .sug-title { font-weight:600; }
  .suggestion-item .sug-sub { font-size:12px; color:#9ca3af; margin-top:2px; }
  #locate-btn {
    position:absolute; bottom:20px; right:16px; z-index:999;
    width:44px; height:44px; border-radius:22px; background:#fff;
    box-shadow:0 2px 8px rgba(0,0,0,0.2); border:none;
    display:flex; align-items:center; justify-content:center; font-size:20px;
    cursor:pointer;
  }
  .leaflet-control-zoom { border:none !important; }
  .leaflet-control-zoom a {
    border:none !important; box-shadow:0 2px 6px rgba(0,0,0,0.15) !important;
    border-radius:8px !important; width:36px !important; height:36px !important;
    line-height:36px !important; font-size:18px !important;
  }
</style>
</head>
<body>
<div id="search-box">
  <input id="search-input" type="text" placeholder="Buscar dirección..."/>
  <div id="suggestions"></div>
</div>
<div id="map"></div>
<button id="locate-btn" title="Mi ubicación">📍</button>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var map = L.map('map',{ zoomControl:false }).setView([${initialLat},${initialLng}],15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OpenStreetMap'
  }).addTo(map);
  L.control.zoom({position:'bottomleft'}).addTo(map);

  var marker = L.marker([${initialLat},${initialLng}],{draggable:true}).addTo(map);
  var selectedData = {lat:${initialLat}, lng:${initialLng}, address:''};

  var searchInput = document.getElementById('search-input');
  var suggestionsEl = document.getElementById('suggestions');
  var debounceTimer = null;

  searchInput.addEventListener('input', function(){
    clearTimeout(debounceTimer);
    var q = this.value.trim();
    if(q.length < 3){ suggestionsEl.style.display='none'; return; }
    debounceTimer = setTimeout(function(){
      fetch('https://nominatim.openstreetmap.org/search?format=json&q='+encodeURIComponent(q)+'&countrycodes=pe&limit=5')
        .then(function(r){ return r.json(); })
        .then(function(results){
          if(!results.length){ suggestionsEl.style.display='none'; return; }
          suggestionsEl.innerHTML = '';
          suggestionsEl.style.display='block';
          results.forEach(function(r){
            var div = document.createElement('div');
            div.className='suggestion-item';
            div.innerHTML='<div class="sug-title">'+r.display_name.split(',')[0]+'</div><div class="sug-sub">'+r.display_name+'</div>';
            div.addEventListener('click', function(){
              var lat = parseFloat(r.lat);
              var lng = parseFloat(r.lon);
              map.setView([lat,lng],17);
              marker.setLatLng([lat,lng]);
              selectedData = {lat:lat, lng:lng, address:r.display_name};
              searchInput.value = r.display_name.split(',')[0];
              suggestionsEl.style.display='none';
              sendLocation();
            });
            suggestionsEl.appendChild(div);
          });
        });
    },400);
  });

  searchInput.addEventListener('blur', function(){
    setTimeout(function(){ suggestionsEl.style.display='none'; },200);
  });

  map.on('click', function(e){
    marker.setLatLng(e.latlng);
    selectedData.lat = e.latlng.lat;
    selectedData.lng = e.latlng.lng;
    reverseGeocode(e.latlng.lat, e.latlng.lng);
  });

  marker.on('dragend', function(){
    var pos = marker.getLatLng();
    selectedData.lat = pos.lat;
    selectedData.lng = pos.lng;
    reverseGeocode(pos.lat, pos.lng);
  });

  function reverseGeocode(lat, lng){
    fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat='+lat+'&lon='+lng+'&zoom=18')
      .then(function(r){ return r.json(); })
      .then(function(data){
        selectedData.address = data.display_name || '';
        searchInput.value = data.display_name ? data.display_name.split(',')[0] : '';
        sendLocation();
      });
  }

  function sendLocation(){
    window.ReactNativeWebView.postMessage(JSON.stringify(selectedData));
  }

  document.getElementById('locate-btn').addEventListener('click', function(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(pos){
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        map.setView([lat,lng],17);
        marker.setLatLng([lat,lng]);
        selectedData.lat = lat;
        selectedData.lng = lng;
        reverseGeocode(lat,lng);
      });
    }
  });
</script>
</body>
</html>`;
}

// Renderiza el mapa dentro de un WebView
export default function MapWebView({
  initialLat = -12.046,
  initialLng = -77.043,
  onLocationSelect,
}: MapWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const lastSent = useRef<string>("");

  // Procesa el mensaje de ubicación del mapa
  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        const key = `${data.lat.toFixed(5)},${data.lng.toFixed(5)}`;
        if (key !== lastSent.current) {
          lastSent.current = key;
          onLocationSelect(data);
        }
      } catch (e) {
        console.error("MapWebView message error:", e);
      }
    },
    [onLocationSelect],
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: buildHtml(initialLat, initialLng) }}
        onMessage={handleMessage}
        style={styles.webview}
        scrollEnabled={false}
        overScrollMode="never"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 250, borderRadius: 12, overflow: "hidden" },
  webview: { flex: 1 },
});
