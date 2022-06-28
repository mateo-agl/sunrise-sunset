import axios from "axios";
import React, { useEffect, useState } from "react";
import { Search } from "./components/Search.jsx";
import SunCalc from "suncalc";
import { DateTime } from "luxon";
import { buildSunGraph } from "./d3";
import { Main } from "./components/Main";
import { Container } from "react-bootstrap";
import "./app.css";
import "bootstrap/dist/css/bootstrap.min.css";

interface State {
  fullName: string,
  cityName: string,
  matches: Array<string>,
  times: boolean | Object,
  timeZone: string
}

interface LocationObj {
  name: string,
  lat: number,
  lng: number
}

export const App = () => {
  const [city, setCity] = useState<State>({
      fullName: "",
      cityName: "",
      matches: [],
      times: false,
      timeZone: ""
  });

  const getMatches = () => {
    const url = `http://api.geonames.org/searchJSON?q=${city.cityName}&maxRows=5&username=sunrise_sunset`;
    axios.get(url)
      .then(res => {
        const matches = res.data.geonames;
        matches.length === 0 && matches.push("No matches found");
        setCity({ ...city, matches: matches });
      })
      .catch(e => console.error(e));
  };
  
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => setCity({ ...city, cityName: e.target.value });

  const reset = () => setCity({...city, matches: []});

  const getLocation = (obj: LocationObj) => {
    const position = { coords: { latitude: obj.lat, longitude: obj.lng } };

    const url = `http://api.geonames.org/timezoneJSON?lat=${obj.lat}&lng=${obj.lng}&username=sunrise_sunset`
    axios.get(url)
      .then(res => {
        const timeZone = res.data.timezoneId;
        buildSunGraph(position, timeZone);
        setCity({
          ...city,
          fullName: `${obj.name}, ${res.data.countryName} - ${DateTime.now().year}`,
          matches: [],
          times: SunCalc.getTimes(DateTime.now(), obj.lat, obj.lng),
          timeZone: timeZone
        })
      })
      .catch(e => console.error(e))
  };
  
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const name = timeZone.split("/")[1].replace("_", " ");
    let latLon: any = localStorage.getItem("location");
    
    if(latLon) {
      latLon = JSON.parse(latLon);
      getLocation({ ...latLon, name: name });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({coords}) => {
        const latLon = { lat: coords.latitude, lng: coords.longitude };
        localStorage.setItem("location", JSON.stringify(latLon));
        getLocation({ ...latLon, name: name });
      },
      () => setCity(c => ({...c, fullName: "Couldn't get your location. Please search a city."}))
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