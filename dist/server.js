"use strict";
exports.__esModule = true;
var dotenv = require("dotenv");
dotenv.config();
var express = require("express");
var country_state_city_1 = require("country-state-city");
var geo_tz_1 = require("geo-tz");
var app = express();
var port = process.env.PORT || 8080;
var matchCitites = function (req, res) {
    var name = req.query.name.toLocaleLowerCase();
    if (name) {
        var matches = country_state_city_1.City.getAllCities().filter(function (c) {
            return c.name
                .toLocaleLowerCase()
                .normalize("NFD").replace(/[^a-z | \s]/ig, "")
                .startsWith(name);
        }).slice(0, 5);
        var result = matches.length < 1 ? ["No matches found"] : matches;
        res.send(result);
    }
    else
        res.send([]);
};
var findCity = function (req, res) {
    var _a = req.query, lat = _a.lat, lon = _a.lon, name = _a.name;
    var city = country_state_city_1.City.getAllCities().find(function (c) { return c.name === name; }) || { countryCode: "" };
    var country = country_state_city_1.Country.getCountryByCode(city.countryCode) || { name: "" };
    var result = !lat || !lon
        ? { countryName: country.name }
        : { countryName: country.name, timeZone: (0, geo_tz_1.find)(Number(lat), Number(lon))[0] };
    res.json(result);
};
if (process.env.NODE_ENV === "production") {
    app.use(express.static("build"));
}
else {
    app.use(function (_, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        next();
    });
}
;
app.get("/city", findCity);
app.get("/match_cities", matchCitites);
app.listen(port, function () { return console.log("App listening on port ".concat(port)); });
