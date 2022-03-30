import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import axios from "axios";

navigator.geolocation.getCurrentPosition(
  position => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=2022-03-26`;
    axios.get(url)
    .then(res => {
      const data = res.data.results;
      let sunrise = data.sunrise;
      let sunset = data.sunset.split(":");
      let length = data.day_length;
      const timeOffset = new Date().getTimezoneOffset() / 60000;
      const toMiliseconds = (time) => {
        let miliseconds = 0;
        const nums = time.split(":"),
        hours = nums[0],
        minutes = nums[1],
        seconds = nums[2].slice(0,2);
        miliseconds += hours * 3600000;
        miliseconds += minutes * 60000;
        miliseconds += seconds * 1000;
        return miliseconds - timeOffset;
      }
      console.log(1 - -1)
    })
    .catch(e => console.error(e))
  }
)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);