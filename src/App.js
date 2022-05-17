import axios from "axios";
import { useState } from "react";
import { Search } from "./components/Search";
import { Chart } from "./components/Chart";
import { buildSunGraph } from "./d3";
import SunCalc from "suncalc";
import "./app.css";
import { DateTime } from "luxon";

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

  const getMatches = () => {
    if (!city.cityName) return;
    axios.get(`https://api.teleport.org/api/cities/?search=${city.cityName}&limit=5`)
      .then(res => {
          const matches = res.data._embedded["city:search-results"];
          setCity({ ...city, matches: matches });
      })
      .catch(e => console.error(e));
  };

  const getLocation = url => {
    axios.get(url)
      .then(res => {
        const position = { coords: res.data.location.latlon };
        const timeZone = res.data._links["city:timezone"].name;
        const times = SunCalc.getTimes(
          DateTime.now(),
          position.coords.latitude,
          position.coords.longitude
        );
        buildSunGraph(position, timeZone);
        setCity({
          ...city,
          fullName: res.data.full_name,
          matches: [],
          times: times,
          timeZone: timeZone
        });
      })
      .catch(e => console.error(e))
  };

  const handleInput = e => setCity({ ...city, cityName: e.target.value });
  return (
    <main className="container">
      <Search
        getMatches={getMatches}
        getLocation={getLocation}
        handleInput={handleInput}
        city={city}
      />
      <Chart
        fullName={city.fullName}
        times={city.times}
        getLocation={getLocation}
        timeZone={city.timeZone}
      />
    </main>
  )
};