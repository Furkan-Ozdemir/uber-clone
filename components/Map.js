import { Platform, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef } from "react";
import MapView, { Marker } from "react-native-maps";
import tailwind from "twrnc";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDestination,
  selectOrigin,
  setTravelTimeInformation,
} from "../slices/navSlice";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_KEY } from "@env";

const Map = () => {
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const mapRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // androidde calismiyor
    if (!origin || !destination) return;

    if (Platform.OS === "ios") {
      mapRef.current.fitToSuppliedMarkers(["origin", "destination"], {
        edgePadding: 50,
      });
      // } else {
      //   mapRef.current.fitToCoordinates([origin, destination], {
      //     edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      //   });
    }
  }, [origin, destination]);

  const handleFitMarkersAndroid = () => {
    // console.log(origin.location);
    // console.log(destination.location);
    if (!origin || !destination) return;
    mapRef.current.fitToCoordinates(
      [
        { latitude: origin.location.lat, longitude: origin.location.lng },
        {
          latitude: destination.location.lat,
          longitude: destination.location.lng,
        },
      ],
      {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      }
    );
  };

  useEffect(() => {
    if (!origin || !destination) return;
    const getTravelTime = async () => {
      fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin.description}&destinations=${destination.description}&key=${GOOGLE_MAPS_KEY}`
      )
        .then((res) => res.json())
        .then((data) => {
          dispatch(setTravelTimeInformation(data.rows[0].elements[0]));
        });
    };
    getTravelTime();
  }, [origin, destination, GOOGLE_MAPS_KEY]);

  return (
    <MapView
      ref={mapRef}
      style={tailwind`flex-1`}
      mapType="mutedStandard"
      initialRegion={{
        latitude: origin.location.lat,
        longitude: origin.location.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
      onLayout={Platform.OS === "android" ? handleFitMarkersAndroid : null}
    >
      {origin && destination && (
        <MapViewDirections
          origin={origin.description}
          destination={destination.description}
          apikey={GOOGLE_MAPS_KEY}
          strokeColor="black"
          strokeWidth={3}
        />
      )}
      {origin?.location && (
        <Marker
          coordinate={{
            latitude: origin.location.lat,
            longitude: origin.location.lng,
          }}
          title="Origin"
          description={origin.description}
          identifier="origin" // need for fitToSuppliedMarkers
        />
      )}
      {destination?.location && (
        <Marker
          coordinate={{
            latitude: destination.location.lat,
            longitude: destination.location.lng,
          }}
          title="Origin"
          description={destination.description}
          identifier="destination" // need for fitToSuppliedMarkers
        />
      )}
    </MapView>
  );
};

export default Map;

const styles = StyleSheet.create({});
