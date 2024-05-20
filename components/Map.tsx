"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, MarkerClusterer } from '@react-google-maps/api';
import { db } from '@/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { addNewQuest } from '@/firebaseService';
import { firebaseConfig } from "@/firebaseConfig";

const containerStyle = {
    width: '100%',
    height: '400px'
};

const center = {
    lat: -3.745,
    lng: -38.523
};

const MyMap: React.FC = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: firebaseConfig.apiKey as string,
    });

    const [markers, setMarkers] = useState<{ lat: number, lng: number, id: string }[]>([]);
    const [count, setCount] = useState(1);
    const [addedMessage, setAddedMessage] = useState<string | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setAddedMessage(null);
        }, 2000);

        return () => clearTimeout(timeout);
    }, [addedMessage]);

    const onMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            const latLng = event.latLng;
            const newMarker = {
                lat: parseFloat(latLng.lat().toFixed(6)),
                lng: parseFloat(latLng.lng().toFixed(6)),
                id: `${count}`
            };

            const isDuplicate = markers.some(marker =>
                marker.lat.toFixed(6) === newMarker.lat.toFixed(6) &&
                marker.lng.toFixed(6) === newMarker.lng.toFixed(6)
            );
            if (isDuplicate) {
                alert("Ця мітка вже була додана!");
                return;
            }

            setMarkers(prevMarkers => [...prevMarkers, newMarker]);
            setCount(prevCount => prevCount + 1);

            try {
                await addDoc(collection(db, 'quests'), {
                    location: { lat: newMarker.lat, lng: newMarker.lng },
                    timestamp: serverTimestamp(),
                    next: null
                });
                setAddedMessage('Мітка успішно додана!');
            } catch (error) {
                console.error("Помилка при додаванні мітки:", error);
            }
        }
    }, [count, markers]);



    const onMarkerDragEnd = useCallback((event: google.maps.MapMouseEvent, markerId: string) => {
        if (event.latLng) {
            const latLng = event.latLng;
            setMarkers(prevMarkers =>
                prevMarkers.map(marker =>
                    marker.id === markerId ? { ...marker, lat: latLng.lat(), lng: latLng.lng() } : marker
                )
            );
        }
    }, []);

    const handleClick = async () => {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;

                    await addNewQuest({ lat: latitude, long: longitude });
                    setAddedMessage('Мітка успішно додана!');
                });
            } else {
                throw new Error("Геолокація не підтримується в цьому браузері.");
            }
        } catch (error) {
            console.error("Помилка при додаванні мітки:", error);
        }
    };

    return isLoaded ? (
        <>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
                onClick={onMapClick}
            >
                <MarkerClusterer>
                    {(cluster) => (
                        <>
                            {markers.length === 0 ? (
                                <div style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'white', padding: 5, borderRadius: 5 }}>
                                    Поставте мітку на карті, щоб зберегти її!
                                </div>
                            ) : null}
                            {markers.map((marker) => (
                                <Marker
                                    key={marker.id}
                                    position={{ lat: marker.lat, lng: marker.lng }}
                                    label={marker.id}
                                    clusterer={cluster}
                                    draggable
                                    onDragEnd={(event) => onMarkerDragEnd(event, marker.id)}
                                />
                            ))}
                        </>
                    )}
                </MarkerClusterer>
            </GoogleMap>

            <div>
                <button onClick={handleClick} className="ml-2 p-2 mt-4 rounded-xl bg-blue-700 text-white">Додати мітку</button>
                {addedMessage && <div className="ml-2 mt-2 text-green-700">{addedMessage}</div>}
            </div>
        </>
    ) : <></>;
};

export default React.memo(MyMap);
