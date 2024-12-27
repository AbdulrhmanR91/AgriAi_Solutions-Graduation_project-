import  { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { SearchBox } from '@react-google-maps/api';

const MapLocationPicker = ({ onLocationSelect, error }) => {
    const [map, setMap] = useState(null);
    const [searchBox, setSearchBox] = useState(null);
    const [marker, setMarker] = useState(null);
    const [center, setCenter] = useState({ lat: 30.0444, lng: 31.2357 }); // Default to Cairo

    const mapContainerStyle = {
        width: '100%',
        height: '400px'
    };

    const onLoad = useCallback((map) => {
        setMap(map);
    }, []);

    const onSearchBoxLoad = useCallback((searchBox) => {
        setSearchBox(searchBox);
    }, []);

    const onPlacesChanged = () => {
        if (searchBox) {
            const places = searchBox.getPlaces();
            if (places && places.length > 0) {
                const place = places[0];
                const location = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    address: place.formatted_address
                };
                setCenter(location);
                setMarker(location);
                onLocationSelect(location);
                map.panTo(location);
            }
        }
    };

    const onMapClick = useCallback((e) => {
        const location = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setMarker(location);
        
        // Get address from coordinates using Geocoding service
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results[0]) {
                onLocationSelect({
                    ...location,
                    address: results[0].formatted_address
                });
            }
        });
    }, [onLocationSelect]);

    return (
        <div className="space-y-4">
            <SearchBox
                onLoad={onSearchBoxLoad}
                onPlacesChanged={onPlacesChanged}
            >
                <input
                    type="text"
                    placeholder="Search for a location"
                    className="w-full px-4 py-2 border-2 rounded-xl focus:outline-none focus:border-green-500"
                />
            </SearchBox>

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
                onLoad={onLoad}
                onClick={onMapClick}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                }}
            >
                {marker && (
                    <Marker
                        position={marker}
                        animation={window.google.maps.Animation.DROP}
                    />
                )}
            </GoogleMap>

            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};
MapLocationPicker.propTypes = {
    onLocationSelect: PropTypes.func.isRequired,
    error: PropTypes.string
};

export default MapLocationPicker;
