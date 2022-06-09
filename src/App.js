import axios from "axios";
import { useEffect, useState } from "react";
import { Search } from "./components/Search";
import SunCalc from "suncalc";
import "./app.css";
import { DateTime } from "luxon";
import { buildSunGraph } from "./d3";
import { Main } from "./components/Main";

export const App = () => {
  const [city, setCity] = useState(
    {
      fullName: "",
      cityName: "",
      matches: [],
      times: false,
      timeZone: ""
    }
  );

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

  useEffect(() => navigator.geolocation.getCurrentPosition(({coords}) => {
      axios.get(`https://api.teleport.org/api/locations/${coords.latitude},${coords.longitude}/`)
        .then(res => getLocation(res.data._embedded["location:nearest-cities"][0]._links["location:nearest-city"].href))
        .catch(err => console.error(err));
    }, () => setCity({...city, fullName: "Couldn't get your location. Please search a city."}))
  , []);

  const getMatches = () => {
    if (!city.cityName) return;
    axios.get(`https://api.teleport.org/api/cities/?search=${city.cityName}&limit=5`)
      .then(res => {
        const matches = res.data._embedded["city:search-results"];
        if (matches.length === 0) matches.push("No matches found");
        setCity({ ...city, matches: matches });
      })
      .catch(e => console.error(e));
  };

  const handleInput = e => setCity({ ...city, cityName: e.target.value });

  window.onclick = () => setCity({...city, matches: []});

  return (
    <main className="container">
      <Search
        getMatches={getMatches}
        getLocation={getLocation}
        handleInput={handleInput}
        city={city}
      />
      <Main city={city}/>
    </main>
  )
};