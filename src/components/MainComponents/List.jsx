import { DateTime } from "luxon";
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

export const List = ({ times, timeZone }) => (
    <ul id="info">
        {
            times && timeZone && itemsArr.map((d, i) => {
                const itemTime = [];
                const li = (
                    <li className="info-item" key={i}>
                    <span className="rect" style={{background: colors[i]}}/>{d+": "}
                    <div>{itemTime}</div>
                    </li>
                );
                for(let o = 0; o < timesArr[i].length; o++) {
                    const time = timesArr[i][o];
                    if(typeof time === "string") {
                        itemTime.push(`${DateTime.fromJSDate(times[time]).setZone(timeZone).toISOTime().slice(0,5)}`);
                    } else {
                        const t = [];
                        for(let u = 0; u < time.length; u++) {
                            const date = times[time[u]];
                            if(date instanceof Date && isNaN(date)) {
                                itemTime.push("-");
                                return li;
                            }
                            if(!date) {
                                t.push(time[u])
                            } else {
                                t.push(`${DateTime.fromJSDate(date).setZone(timeZone).toISOTime().slice(0,5)}`)
                            };
                        };
                        t.splice(1,0," - ");
                        itemTime.push(<div key={o}>{t}</div>);
                    }
                }
                return li;
            })
        }
    </ul>
)