import axios from "axios";
import { DateTime } from "luxon";
import { useRef, useEffect } from "react";
import { buildAxes } from "../d3";

const colors = ["#001D3D", "#014E8E", "#6798C0", "#99D6EA", "#FFF0AD", "#FFE56E", "#F77F00", "#9E00FF"];
const itemsArr = ["Night","Astronomical Twilight","Nautical Twilight","Civil Twilight","Daylight", "Golden Hour","Solar Noon", "Midnight"];
const timesArr = [
  [["00:00", "nightEnd"], ["night", "00:00"]],
  [["nightEnd", "nauticalDawn"], ["nauticalDusk", "night"]],
  [["nauticalDawn", "dawn"], ["dusk", "nauticalDusk"]],
  [["dawn", "sunriseEnd"], ["sunsetStart", "dusk"]],
  [["sunriseEnd", "sunsetStart"]],
  [["sunriseEnd", "goldenHourEnd"], ["goldenHour", "sunsetStart"]],
  ["solarNoon"],
  ["nadir"]
];

export const Chart = ({fullName, times, getLocation, timeZone, handleError}) => {
  const ref = useRef();

  const buildGraph = ({coords}) => {
    axios.get(`https://api.teleport.org/api/locations/${coords.latitude},${coords.longitude}/`)
      .then(res => getLocation(res.data._embedded["location:nearest-cities"][0]._links["location:nearest-city"].href))
      .catch(err => console.error(err));
  };
  
  useEffect(() => {
    buildAxes(ref.current);
    navigator.geolocation.getCurrentPosition(buildGraph, handleError);
  }, []);

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
      <h1 id="title">{fullName}</h1>
      <svg id="chart" ref={ref}/>
      <ul id="info">{list}</ul>
    </div>
  )
};