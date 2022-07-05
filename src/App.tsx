import axios from "axios";
import React, { useEffect, useState } from "react";
import { Search } from "./components/Search";
import SunCalc from "suncalc";
import { DateTime } from "luxon";
import { buildSunGraph } from "./d3";
import { Main } from "./components/Main";
import { Container } from "react-bootstrap";
import { ICity } from "country-state-city/dist/lib/interface.js";
import "./app.css";
import "bootstrap/dist/css/bootstrap.min.css";

interface AppState {
  fullName: string,
  matches: Array<ICity | string>,
  times: boolean | Object,
  timeZone: string,
  allCities: Array<ICity>
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
      timeZone: "",
      allCities: []
  });
  const hostName = process.env.NODE_ENV === "development" 
    ? "http://localhost:8080" : "";

  const getMatches = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    axios.get(`${hostName}/match_cities?name=${name}`)
      .then(res => setCity({ ...city, matches: res.data}))
      .catch(err => console.error(err));
  };
  
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => getMatches(e);

  const reset = () => setCity({...city, matches: []});

  const getLocation = async (obj: LocationObj) => {
    const url = `${hostName}/city?${!obj.timeZone ? `lat=${obj.latitude}&lon=${obj.longitude}` : ""}&name=${obj.name}`;
    const { data } = await axios.get(url);
    const timeZone: string = obj.timeZone ? obj.timeZone : data.timeZone;
    const position = { coords: { latitude: obj.latitude, longitude: obj.longitude } };

    buildSunGraph(position, timeZone);

    setCity({
      ...city,
      fullName: `${obj.name}, ${data.countryName} - ${DateTime.now().year}`,
      matches: [],
      times: SunCalc.getTimes(DateTime.now(), obj.latitude, obj.longitude),
      timeZone: timeZone
    });
  };
  
  useEffect(() => {
    let latLon: any = localStorage.getItem("location");
    
    if(latLon) {
      latLon = JSON.parse(latLon);
      getLocation({ ...latLon });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({coords}) => {
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
      }))
    );
  }, []);

  return (
    <Container as="main" fluid>
      <Search
        getMatches={getMatches}
        getLocation={getLocation}
        handleInput={handleInput}
        city={city}
        reset={reset}
      />
      <Main city={city}/>
    </Container>
  )
};