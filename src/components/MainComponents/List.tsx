import React from "react";
import { DateTime } from "luxon";
import { Col, Row } from "react-bootstrap";
const colors = ["#001D3D", "#014E8E", "#6798C0", "#99D6EA", "#FFF0AD", "#FFE56E", "#F77F00", "#9E00FF"];
const itemsArr = ["Night","Astronomical Twilight","Nautical Twilight","Civil Twilight","Day", "Golden Hour","Solar Noon", "Midnight"];
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
const isInvalidDate = (date: Date) => date && isNaN(date.getDate());
const toHHMMFormat = (date: Date, timeZone: string) => `${DateTime.fromJSDate(date).setZone(timeZone).toISOTime().slice(0,5)}`;

export const List = ({ times, timeZone }) => (
  <Row as="ul" className="gy-3 my-2 p-0 mx-auto">
    {
        itemsArr.map((d, i) => {
            const itemTime = [];
            const li = (
                <Col as="li" md="3" sm="4" xs="6" key={i}>
                    <Row>
                        <Col sm="auto" xs="1" className="pt-1">
                            <span className="rect" style={{background: colors[i]}}/>
                        </Col>
                        <Col className="info pe-0">
                            <label>{d+": "}</label><br/>
                            <label>{itemTime}</label>
                        </Col>
                    </Row>
                </Col>
            );
            for(let o = 0; o < timesArr[i].length; o++)
                if (!times && !timeZone) itemTime.push("-");
                else {
                    const time = timesArr[i][o];
                    if(typeof time === "string") 
                        itemTime.push(toHHMMFormat(times[time], timeZone));
                    else {
                        const t = [];
                        for(let u = 0; u < time.length; u++) {
                            const date: Date = times[time[u]];
                            if(isInvalidDate(date)) {
                                itemTime.push("-");
                                return li;
                            }
                            if(!date) t.push(time[u])
                            else t.push(toHHMMFormat(date, timeZone));
                        };
                        t.splice(1,0," - ");
                        itemTime.push(<div key={o}>{t}</div>);
                    }
                }
            return li;
        })
    }
  </Row>
)