require("dotenv").config();
const express = require("express");
const app = express();
const { City, Country } = require("country-state-city");
const port = process.env.PORT || 8080;
const { find } = require('geo-tz');

if(process.env.NODE_ENV === "production") {
    app.use(express.static("build"));
} else {
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        next();
    });
};

app.get("/city", (req, res) => {
    const { lat, lon, name } = req.query;
    const city = City.getAllCities().find(c => c.name === name);
    const country = Country.getCountryByCode(city.countryCode);
    const result = !lat || !lon 
        ? { countryName: country.name } 
        : { countryName: country.name, timeZone: find(lat, lon)[0] };
    res.json(result);
});

app.get("/match_cities", (req, res) => {
    const name = req.query.name.toLocaleLowerCase();

    if(name) {
      const matches = City.getAllCities().filter(c => 
        c.name
          .toLocaleLowerCase()
          .normalize("NFD").replace(/[^a-z | \s]/ig, "")
          .startsWith(name)
      ).slice(0,5);
      const result = matches.length < 1 ? ["No matches found"] : matches;
      res.send(result)
    } else res.send([]);
});

app.listen(port, () => console.log(`App listening on port ${port}`));