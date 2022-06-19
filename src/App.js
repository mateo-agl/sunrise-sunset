import axios from "axios";
import { useEffect, useState } from "react";
import { Search } from "./components/Search";
import SunCalc from "suncalc";
import { DateTime } from "luxon";
import { buildSunGraph } from "./d3";
import { Main } from "./components/Main";
import { Container } from "react-bootstrap";
import "./app.css";
import "bootstrap/dist/css/bootstrap.min.css";

export const App = () => {
  const [city, setCity] = useState({
      fullName: "",
      cityName: "",
      matches: [],
      times: false,
      timeZone: ""
  });

  const getMatches = () => {
    city.cityName &&
    axios.get(`https://api.teleport.org/api/cities/?search=${city.cityName}&limit=5`)
      .then(res => {
        const matches = res.data._embedded["city:search-results"];
        matches.length === 0 && matches.push("No matches found");
        setCity({ ...city, matches: matches });
      })
      .catch(e => console.error(e));
  };

  const handleInput = e => setCity({ ...city, cityName: e.target.value });

  const reset = () => setCity({...city, matches: []});

  const getLocation = url => {
    setCity({...city, fullName: "Loading..."});
    axios.get(url)
      .then(res => {
        const position = { coords: res.data.location.latlon };
        const timeZone = res.data._links["city:timezone"].name;
        buildSunGraph(position, timeZone);
        return {fullName: res.data.full_name, position, timeZone};
      })
      .then(res => setCity({
          ...city,
          fullName: `${res.fullName} - ${DateTime.now().year}`,
          matches: [],
          times: SunCalc.getTimes(
            DateTime.now(),
            res.position.coords.latitude,
            res.position.coords.longitude
          ),
          timeZone: res.timeZone
        })
      )
      .catch(e => console.error(e))
  };
  
  useEffect(() => navigator.geolocation.getCurrentPosition(({coords}) => (
    axios.get(`https://api.teleport.org/api/locations/${coords.latitude},${coords.longitude}/`)
      .then(res => getLocation(res.data._embedded["location:nearest-cities"][0]._links["location:nearest-city"].href))
      .catch(err => console.error(err))
    ), () => setCity(c => ({...c, fullName: "Couldn't get your location. Please search a city."})))
  , []);

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