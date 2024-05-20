"use client";
import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, MarkerClusterer } from '@react-google-maps/api';
import { db } from '@/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { addNewQuest } from '@/firebaseService';

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
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const [markers, setMarkers] = useState<{ lat: number, lng: number, id: string }[]>([]);
  const [count, setCount] = useState(1);

  const onMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const latLng = event.latLng;
      const newMarker = {
        lat: latLng.lat(),
        lng: latLng.lng(),
        id: `${count}`
      };
      setMarkers(current => [...current, newMarker]);
      setCount(count + 1);

      await addDoc(collection(db, 'quests'), {
        location: { lat: newMarker.lat, lng: newMarker.lng },
        timestamp: serverTimestamp(),
        next: null
      });
    }
  }, [count]);

  const onMarkerDragEnd = useCallback((event: google.maps.MapMouseEvent, markerId: string) => {
    if (event.latLng) {
      const latLng = event.latLng;
      setMarkers(current => current.map(marker => 
        marker.id === markerId ? { ...marker, lat: latLng.lat(), lng: latLng.lng() } : marker
      ));
    }
  }, []);
    
   const handleClick = async () => {
    try {
        // Перевіряємо, чи підтримується геолокація в браузері
        if (navigator.geolocation) {
        // Отримуємо геопозицію користувача
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            
            await addNewQuest({ lat: latitude, long: longitude });
        });
        } else {
        throw new Error("Геолокація не підтримується в цьому браузері.");
        }
    } catch (error) {
        console.error("Помилка при додаванні нового квесту:", error);
    }
};


  return isLoaded ? (
      <>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
              onClick={onMapClick}>
              
                <MarkerClusterer>
                    {(clusterer) => (
                    <>
                        {markers.map((marker) => (
                        <Marker
                            key={marker.id}
                            position={{ lat: marker.lat, lng: marker.lng }}
                            label={marker.id}
                            clusterer={clusterer}
                            draggable
                            onDragEnd={(event) => onMarkerDragEnd(event, marker.id)}
                        />
                        ))}
                    </>
                    )}
                </MarkerClusterer>
            </GoogleMap>
        
        <div>
            <button onClick={handleClick} className='mt-10'>Додати новий квест</button>
        </div>
    </>
  ) : <></>
};

export default React.memo(MyMap);
