import axios from "axios";
import { useState } from "react";
import { Search } from "./components/Search";
import { Chart } from "./components/Chart";
import { replaceSunGraph } from "./d3";
import "./app.css";

export const App = () => {
  const [city, setCity] = useState({ name: "", matches: [] });

  const getMatches = () => {
    if (!city.name) return;
    axios.get(`https://api.teleport.org/api/cities/?search=${city.name}&limit=5`)
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
        replaceSunGraph(position, res.data._links["city:timezone"].name);
        setCity({ ...city, matches: [] });
      })
      .catch(e => console.error(e))
  }

  const handleInput = e => setCity({ ...city, name: e.target.value });
  return (
    <main className="container">
      <Search
        getMatches={getMatches}
        getLocation={getLocation}
        handleInput={handleInput}
        city={city}
      />
      <Chart/>
    </main>
  )
};