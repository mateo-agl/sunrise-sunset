import axios from "axios";
import { useRef, useEffect } from "react";
import { buildAxes } from "../d3";

const colors = ["#001D3D", "#014E8E", "#6798C0", "#99D6EA", "#FFE985", "#FFF0AD", "#F77F00"];
const itemsArr = ["Night","Astronomical Twilight","Nautical Twilight","Civil Twilight","Daylight","Solar Noon", "Midnight"];
const timesArr = [
  [["00:00", "nightEnd"], ["night", "00:00"]],
  [["nightEnd", "nauticalDawn"], ["nauticalDusk", "night"]],
  [["nauticalDawn", "dawn"], ["dusk", "nauticalDusk"]],
  [["dawn", "sunriseEnd"], ["sunsetStart", "dusk"]],
  [["sunriseEnd", "sunsetStart"]],
  ["solarNoon"],
  ["nadir"]
];

export const Chart = ({fullName, info, getLocation}) => {
    const ref = useRef();
    
    useEffect(() => {
      buildAxes(ref.current);
      navigator.geolocation.getCurrentPosition(({coords}) => {
        axios.get(`https://api.teleport.org/api/locations/${coords.latitude},${coords.longitude}/`)
          .then(res => getLocation(res.data._embedded["location:nearest-cities"][0]._links["location:nearest-city"].href))
      });
    }, []);

    const currentYear = new Date().getFullYear();
    const title = fullName ? `${fullName} - ${currentYear}` : "Loading...";
    const list = info ? itemsArr.map((d, i) => {
      const itemTime = [];
      const rect = <span className="rect" style={{background: colors[i]}}/>
      const li = <li className="info-item" key={i}>{rect}{d+": "}<div>{itemTime}</div></li>
      for(let o = 0; o < timesArr[i].length; o++) {
        const time = timesArr[i][o];
        if(typeof time === "string") {
          itemTime.push(info[time].toTimeString().slice(0,5));
        } else {
          let t = [];
          for(let u = 0; u < time.length; u++) {
            const date = info[time[u]];
            if(date == "Invalid Date") {
              itemTime.push("-")
              return li;
            }
            if(!date) {t.push(time[u])} else {t.push(date.toTimeString().slice(0,5))};
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