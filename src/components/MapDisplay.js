import React, { useState, useCallback, useEffect, useContext } from "react";
import { FaInfoCircle } from "react-icons/fa";
import styles from "./MapDisplay.module.css";
import {
  GoogleMap,
  MarkerF,
  useJsApiLoader,
  InfoWindowF,
} from "@react-google-maps/api";
import WeatherContext from "../contexts/WeatherContext";
import { v4 as uuidv4 } from "uuid";
// import { mapStyles } from "./mapStyles";

const mapContainerStyle = {
  height: "100vh",
  width: "90vw",
};

const options = {
  // styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
  minZoom: 0,
  disableDoubleClickZoom: true,
  restriction: {
    latLngBounds: {
      north: 85.0,
      south: -85.0,
      west: -180.0,
      east: 180.0,
    },
    strictBounds: true,
  },
};

function MapDisplay({ weather, searchParam, onSubmit, apiKey, owmKey }) {
  const [libraries] = useState(["places"]);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });
  const ctx = useContext(WeatherContext);
  const [mapCoords, setMapCoords] = useState("");
  const [weatherMapType, setWeatherMapType] = useState("");
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isShowMarkers, setIsShowMarkers] = useState(true);

  const weatherOverlay = () => {
    return (
      weatherMapType &&
      new window.google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
          const normalizedCoord = getNormalizedCoord(coord, zoom);
          if (!normalizedCoord) {
            return "";
          }
          return (
            "https://tile.openweathermap.org/map/" +
            weatherMapType +
            "/" +
            zoom +
            "/" +
            normalizedCoord.x +
            "/" +
            normalizedCoord.y +
            ".png?appid=" +
            owmKey
          );
        },
        tileSize: new window.google.maps.Size(256, 256),
        maxZoom: 15,
        minZoom: 0,
        name: "Weather",
      })
    );
  };

  useEffect(() => {
    if (map) {
      map.overlayMapTypes.pop();
      let layer = weatherOverlay();
      map.overlayMapTypes.insertAt(0, layer);
    }
    // eslint-disable-next-line
  }, [weatherMapType]);

  useEffect(() => {
    setMapCoords({
      lat: searchParam.lat,
      lng: searchParam.lon,
    });
  }, [searchParam]);

  useEffect(() => {
    const inMarkers = markers.some((marker) => {
      if (marker.name === weather.name && marker.lat === weather.lat) {
        return true;
      }
      return false;
    });
    if (!inMarkers) {
      setMarkers((current) => [
        ...current,
        {
          markerId: uuidv4(),
          lat: weather.lat,
          lng: weather.lon,
          icon: weather.icon,
          name: weather.name,
          desc: weather.description,
          temp: weather.temp.toFixed(1),
          high: weather.temp_max.toFixed(1),
          low: weather.temp_min.toFixed(1),
          feels_like: weather.feels_like.toFixed(1),
          wind: weather.speed.toFixed(1),
          humidity: weather.humidity.toFixed(1),
        },
      ]);
    }
    // console.log(markers);
    // eslint-disable-next-line
  }, [weather]);

  const onMapLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onMapClick = useCallback(
    (event) => {
      const latlng = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      geocoderlatlng(latlng, onSubmit, ctx.isMetric);
    },
    [ctx.isMetric, onSubmit]
  );

  const hideMarkers = () => {
    markers.length !== 0 && setIsShowMarkers(false);
  };

  const showMarkers = () => {
    setIsShowMarkers(true);
    // console.log(markers);
  };

  const deleteMarkers = () => {
    setMarkers([]);
    setIsShowMarkers(true);
  };

  const handleDeleteMarker = (marker_id) => {
    const newMarkers = [...markers];
    const filteredMarkers = newMarkers.filter(function (marker) {
      return marker.markerId !== marker_id;
    });
    // console.log(filteredMarkers);
    setMarkers(filteredMarkers);
  };

  if (loadError) return "Error loading maps";
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <div className="flex flex-col justify-center">
        <div className="flex justify-center gap-5">
          {weatherMapType !== "temp_new" ? (
            <button
              onClick={() => setWeatherMapType("temp_new")}
              className="bg-blue-300 hover:bg-blue-400 text-black py-2 px-4 rounded-xl"
            >
              Temperature
            </button>
          ) : (
            <button
              onClick={() => setWeatherMapType("temp_new")}
              className="bg-blue-400 hover:bg-blue-400 text-black py-2 px-4 rounded-xl"
            >
              Temperature
            </button>
          )}

          {weatherMapType !== "wind_new" ? (
            <button
              onClick={() => setWeatherMapType("wind_new")}
              className="bg-blue-300 hover:bg-blue-400 text-black py-2 px-4 rounded-xl"
            >
              Wind Speed
            </button>
          ) : (
            <button
              onClick={() => setWeatherMapType("wind_new")}
              className="bg-blue-400 hover:bg-blue-400 text-black py-2 px-4 rounded-xl"
            >
              Wind Speed
            </button>
          )}

          {weatherMapType !== "clouds_new" ? (
            <button
              onClick={() => setWeatherMapType("clouds_new")}
              className="bg-blue-300 hover:bg-blue-400 text-black py-2 px-4 rounded-xl"
            >
              Clouds
            </button>
          ) : (
            <button
              onClick={() => setWeatherMapType("clouds_new")}
              className="bg-blue-400 hover:bg-blue-400 text-black py-2 px-4 rounded-xl"
            >
              Clouds
            </button>
          )}

          {weatherMapType !== "precipitation_new" ? (
            <button
              onClick={() => setWeatherMapType("precipitation_new")}
              className="bg-blue-300 hover:bg-blue-400 text-black py-2 px-4 rounded-xl"
            >
              Precipitation
            </button>
          ) : (
            <button
              onClick={() => setWeatherMapType("precipitation_new")}
              className="bg-blue-400 hover:bg-blue-400 text-black py-2 px-4 rounded-xl"
            >
              Precipitation
            </button>
          )}

          {weatherMapType !== "pressure_new" ? (
            <button
              onClick={() => setWeatherMapType("pressure_new")}
              className="bg-blue-300 hover:bg-blue-400 text-black py-2 px-4 rounded-xl"
            >
              Sea Level Pressure
            </button>
          ) : (
            <button
              onClick={() => setWeatherMapType("pressure_new")}
              className="bg-blue-400 hover:bg-blue-400 text-black py-2 px-4 rounded-xl"
            >
              Sea Level Pressure
            </button>
          )}
          <button
            onClick={() => {
              map.overlayMapTypes.pop();
              setWeatherMapType("");
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full"
          >
            Clear Overlays
          </button>
        </div>

        <div className={styles.markersPanel}>
          <div className={styles.tooltip}>
            <button>
              <FaInfoCircle size={30} />
            </button>
            <div className={styles.tooltiptext}>
              <p>Click on Weather Icon to see more info</p>
              <p>Right Click on Weather Icon to Remove it</p>
              <p>Click on other locations to add more icons</p>
            </div>
          </div>
          {isShowMarkers ? (
            <button
              onClick={hideMarkers}
              className="bg-blue-300 hover:bg-blue-400 text-black py-2 px-4 rounded-xl"
            >
              Hide Icons
            </button>
          ) : (
            <button
              onClick={hideMarkers}
              className="bg-blue-400 hover:bg-blue-400 text-black py-2 px-4 rounded-xl"
            >
              Hide Icons
            </button>
          )}
          {!isShowMarkers ? (
            <button
              onClick={showMarkers}
              className="bg-blue-300 hover:bg-blue-400 text-black py-2 px-4 rounded-xl"
            >
              Show Icons
            </button>
          ) : (
            <button
              onClick={showMarkers}
              className="bg-blue-400 hover:bg-blue-400 text-black py-2 px-4 rounded-xl"
            >
              Show Icons
            </button>
          )}
          <button
            onClick={deleteMarkers}
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full"
          >
            Remove All Icons
          </button>
        </div>
      </div>
      <div className="flex justify-center z-0">
        <GoogleMap
          id="map"
          options={options}
          mapContainerStyle={mapContainerStyle}
          center={mapCoords}
          zoom={10}
          onClick={onMapClick}
          onLoad={onMapLoad}
          onUnmount={onUnmount}
        >
          {isShowMarkers &&
            markers.map((marker, i) => (
              <MarkerF
                key={marker.markerId}
                position={{ lat: marker.lat, lng: marker.lng }}
                onClick={() => {
                  setSelected(marker);
                }}
                onRightClick={() => {
                  handleDeleteMarker(marker.markerId);
                }}
                icon={{
                  url: `https://openweathermap.org/img/wn/${marker.icon}@2x.png`,
                  anchor: new window.google.maps.Point(40, 40),
                  scaledSize: new window.google.maps.Size(80, 80),
                }}
              />
            ))}

          {selected ? (
            <InfoWindowF
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => {
                setSelected(null);
              }}
            >
              <div className="text-base">
                <p className="font-bold">{selected.name}</p>
                <ul className="list-disc list-inside">
                  <li>
                    {selected.desc.charAt(0).toUpperCase() +
                      selected.desc.slice(1)}
                  </li>
                  <li>
                    Temperature: {selected.temp} {ctx.isMetric ? "°C" : "°F"}
                  </li>
                  <li>
                    Wind speed: {selected.wind} {ctx.isMetric ? "m/s" : "ft/s"}
                  </li>
                  <li>Humidity: {selected.humidity}%</li>
                </ul>
              </div>
            </InfoWindowF>
          ) : null}
        </GoogleMap>
      </div>
    </>
  );
}

export default MapDisplay;

export function geocoderlatlng(latlng, onSubmit, isMetric) {
  const geocoder = new window.google.maps.Geocoder();
  geocoder
    .geocode({ location: latlng })
    .then((response) => {
      if (response.results[0]) {
        onSubmit({
          name: response.results[0].formatted_address,
          lat: latlng.lat,
          lon: latlng.lng,
          units: isMetric ? "metric" : "imperial",
        });
      } else {
        window.alert("No results found");
      }
    })
    .catch((e) => window.alert("Geocoder failed due to: " + e));
}

function getNormalizedCoord(coord, zoom) {
  const y = coord.y;
  let x = coord.x;
  // tile range in one direction range is dependent on zoom level
  // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
  const tileRange = 1 << zoom;

  // don't repeat across y-axis (vertically)
  if (y < 0 || y >= tileRange) {
    return null;
  }

  // repeat across x-axis
  if (x < 0 || x >= tileRange) {
    x = ((x % tileRange) + tileRange) % tileRange;
  }
  return { x: x, y: y };
}
