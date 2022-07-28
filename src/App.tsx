import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { Search } from "./components/Search";
import SunCalc from "suncalc";
import { DateTime } from "luxon";
import { buildSunGraph } from "./d3";
import { Main } from "./components/Main";
import { Map } from "./components/Map";
import { Col, Container, Row } from "react-bootstrap";
import { ICity } from "country-state-city/dist/lib/interface.js";
import "./app.css";
import "bootstrap/dist/css/bootstrap.min.css";

interface AppState {
  fullName: string,
  matches: Array<ICity | string>,
  times: boolean | Object,
  timeZone: string,
  lat?: number,
  lon?: number
}

interface LocationObj {
  countryName?: string,
  name: string,
  timeZone?: string,
  latitude: number,
  longitude: number
}

export const App = () => {
  const [city, setCity] = useState<AppState>({
      fullName: "",
      matches: [],
      times: false,
      timeZone: ""
  });
  const hostName = process.env.NODE_ENV === "development" 
    ? "http://localhost:8080" : "";

  const getMatches = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const { data } = await axios.get(`${hostName}/match_cities?name=${name}`);
    try {
      setCity({ ...city, matches: data})
    } catch(e) {
      console.error(e);
    }
  };
  
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => getMatches(e);

  const reset = () => setCity({...city, matches: []});

  const getLocation = useCallback(async (obj: LocationObj) => {
    const url = `${hostName}/city?${!obj.timeZone ? `lat=${obj.latitude}&lon=${obj.longitude}` : ""}&name=${obj.name}`;
    const { data } = await axios.get(url);
    const position = { coords: { latitude: obj.latitude, longitude: obj.longitude } };
    try {
      const timeZone: string = obj.timeZone ? obj.timeZone : data.timeZone;

      buildSunGraph(position, timeZone);

      setCity({
        fullName: `${obj.name}, ${data.countryName} - ${DateTime.now().year}`,
        matches: [],
        times: SunCalc.getTimes(DateTime.now(), obj.latitude, obj.longitude),
        timeZone: timeZone,
        lat: obj.latitude,
        lon: obj.longitude
      });
    } catch(e) {
      console.error(e);
    }
  }, [hostName]);
  
  useEffect(() => {
    let latLonString: string = localStorage.getItem("location");
    
    if(latLonString) {
      getLocation(JSON.parse(latLonString));
      return;
    };
    
    navigator.geolocation.getCurrentPosition(({coords}) => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const name = timeZone.split("/")[1].replace("_", " ");
      const latLon: LocationObj = { 
        latitude: coords.latitude,
        longitude: coords.longitude,
        name: name,
        timeZone: timeZone
      };
      localStorage.setItem("location", JSON.stringify(latLon));
      getLocation({ ...latLon });
    },
    () => setCity(c => ({
        ...c,
        fullName: "Couldn't get your location. Please search a city."
    })));
  }, [getLocation]);
  
  return (
    <Container fluid>
      <Search
        getMatches={getMatches}
        getLocation={getLocation}
        handleInput={handleInput}
        city={city}
        reset={reset}
      />
      <Row>
        <Col as="main" xxl={10} xl={9}>
          <Main city={city}/>
        </Col>
        <Col xxl={2} xl={3} className="map-cont">
          <Map lat={city.lat} lon={city.lon} />
        </Col>
      </Row>
    </Container>
  )
};