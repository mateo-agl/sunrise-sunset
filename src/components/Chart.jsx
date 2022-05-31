import axios from "axios";
import { DateTime } from "luxon";
import { useRef, useEffect } from "react";
import { buildAxes } from "../d3";

const colors = ["#001D3D", "#014E8E", "#6798C0", "#99D6EA", "#FFE985", "#FFF0AD", "#F77F00", "#9E00FF"];
const itemsArr = ["Night","Astronomical Twilight","Nautical Twilight","Civil Twilight","Daylight", "Golden Hour","Solar Noon", "Midnight"];
const timesArr = [
  [["00:00", "nightEnd"], ["night", "00:00"]],
  [["nightEnd", "nauticalDawn"], ["nauticalDusk", "night"]],
  [["nauticalDawn", "dawn"], ["dusk", "nauticalDusk"]],
  [["dawn", "sunriseEnd"], ["sunsetStart", "dusk"]],
  [["sunriseEnd", "sunsetStart"]],
  [["goldenHourEnd", "goldenHour"]],
  ["solarNoon"],
  ["nadir"]
];

export const Chart = ({fullName, times, getLocation, timeZone}) => {
    const ref = useRef();

    const buildGraph = ({coords}) => {
      axios.get(`https://api.teleport.org/api/locations/${coords.latitude},${coords.longitude}/`)
        .then(res => getLocation(res.data._embedded["location:nearest-cities"][0]._links["location:nearest-city"].href))
        .catch(err => console.error(err));
    };

    const handleError = () => alert("This app needs access to your location to display the graph corresponding to your location. You can also search your city or any other to display it.");
    
    useEffect(() => {
      buildAxes(ref.current);
      navigator.geolocation.getCurrentPosition(buildGraph, handleError);
    }, []);

    const currentYear = new Date().getFullYear();
    const title = fullName ? `${fullName} - ${currentYear}` : "Waiting...";
    const list = times && timeZone ? itemsArr.map((d, i) => {
      const itemTime = [];
      const rect = <span className="rect" style={{background: colors[i]}}/>
      const li = <li className="info-item" key={i}>{rect}{d+": "}<div>{itemTime}</div></li>
      for(let o = 0; o < timesArr[i].length; o++) {
        const time = timesArr[i][o];
        if(typeof time === "string") {
          const d = DateTime.fromJSDate(times[time]).setZone(timeZone);
          itemTime.push(`${d.toISOTime().slice(0,5)}`);
        } else {
          const t = [];
          for(let u = 0; u < time.length; u++) {
            const date = times[time[u]];
            if(date == "Invalid Date") {
              itemTime.push("-");
              return li;
            }
            if(!date) {
              t.push(time[u])
            } else {
              const d = DateTime.fromJSDate(date).setZone(timeZone);
              t.push(`${d.toISOTime().slice(0,5)}`)
            };
          }
          t.splice(1,0," - ");
          itemTime.push(<div key={o}>{t}</div>);
        }
      }
      return li;
    }) : "";

    return (
      <div id="chart-cont">
        <h1 id="title">{title}</h1>
        <svg id="chart" ref={ref}/>
        <ul id="info">{list}</ul>
      </div>
    )
};