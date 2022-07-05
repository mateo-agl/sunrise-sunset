import * as dotenv from "dotenv";
dotenv.config();
import express = require("express");
import { City, Country } from "country-state-city";
import { find } from 'geo-tz';
import { ICity } from "country-state-city/dist/lib/interface.js";
import { RequestHandler } from "express";
const app: express.Express = express();
const port = process.env.PORT || 8080;

type Params = {};
type ResBody = {};
type ReqBody = {};
type ReqQuery = {
    name: string;
}

const matchCitites: RequestHandler<Params, ResBody, ReqBody, ReqQuery> = (req, res) => {
    const name = req.query.name.toLocaleLowerCase();

    if(name) {
      const matches: Array<ICity> = City.getAllCities().filter((c: ICity) => 
        c.name
          .toLocaleLowerCase()
          .normalize("NFD").replace(/[^a-z | \s]/ig, "")
          .startsWith(name)
      ).slice(0,5);
      const result: Array<ICity | string> = matches.length < 1 ? ["No matches found"] : matches;
      res.send(result);
    } else res.send([]);
};

const findCity: RequestHandler = (req, res) => {
    const { lat, lon, name } = req.query;
    const city = City.getAllCities().find(c => c.name === name) || { countryCode: "" };
    const country = Country.getCountryByCode(city.countryCode) || { name: "" };
    const result = !lat || !lon 
        ? { countryName: country.name } 
        : { countryName: country.name, timeZone: find(Number(lat), Number(lon))[0] };
    res.json(result);
};

if(process.env.NODE_ENV === "production") {
    app.use(express.static("build"));
} else {
    app.use((_, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        next();
    });
};

app.get("/city", findCity);

app.get("/match_cities", matchCitites);

app.listen(port, () => console.log(`App listening on port ${port}`));