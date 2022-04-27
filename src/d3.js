import * as d3 from "d3";
import SunCalc from "suncalc";

const h = 400,
w = 1200,
p = 60,
year = new Date().getFullYear(),
days = d3.timeDays(new Date(year,0), new Date(year+1,0,1)),
monthFormat = d3.timeFormat("%B"),
hourFormat = d3.timeFormat("%H"),
colors = ["#001D3D", "#6798C0", "#99D6EA", "#FFE985", "#FFF0AD", "#F77F00"],
x = d3.scaleTime()
        .domain([d3.min(days), d3.max(days)])
        .range([p, w - p]),
y = d3.scaleTime()
        .domain([new Date(0,0,0,24), new Date(0,0,0,0)])
        .range([h - p, p]),
changeTimeZone = (date, timeZone) => new Date(date.toLocaleString('en-US', {timeZone})),
streams = [
    ["night", "nightEnd"],
    ["nauticalDawn", "nauticalDusk"],
    ["dawn", "dusk"],
    ["sunriseEnd", "sunsetStart"],
    ["goldenHour", "goldenHourEnd"],
    ["solarNoon", "solarNoon"],
];

const buildAxes = chart => {
    const svg = d3.select(chart)
        .attr("height", h)
        .attr("width", w)
        .attr("viewBox", [0, 0, w, h]);

    const xAxis = d3.axisBottom(x)
        .tickFormat(monthFormat);

    const yAxis = d3.axisLeft(y)
        .tickFormat(hourFormat);

    svg.append("g")
        .attr("id", "x")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${h - p})`)
        .call(xAxis);

    svg.append("g")
        .attr("id", "y")
        .attr("class", "axis")
        .attr("transform", `translate(${p}, 0)`)
        .call(yAxis);
};

const testfunc = (data, date, st, day) => {
    return date == "Invalid Date"
        ? 0
        : y(new Date(0,0,0,date.getHours(),date.getMinutes()));
}

const buildSunGraph = ({coords}, timezone) => {
    const lat = coords.latitude,
    lng = coords.longitude,
    data = streams.map((s, i) => {
        return days.map(d => {
            const times = SunCalc.getTimes(d, lat, lng);
            const y0 = i < 1
                ? new Date(0,0,0,23,59)
                : changeTimeZone(times[s[0]],timezone);
            const y1 = i < 1
                ? new Date(0,0,0,0)
                : changeTimeZone(times[s[1]],timezone);
            return [y0, y1, i];
        });
    });
    
    const area = d3.area()
        .x((d,i) => x(days[i]))
        .y0((d,i) => testfunc(data,d[0],d[2],i))
        .y1((d,i) => testfunc(data,d[1],d[2],i));
    
    d3.select("#chart")
        .append("g")
        .attr("id", "sun-graph")
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("d", area)
        .attr("fill", (c, i) => colors[i])
        .attr("stroke", (c, i) => i === 5 ? colors[i] : false);
};

const replaceSunGraph = (position, timezone) => {
    d3.select("#sun-graph")
        .remove();

    buildSunGraph(position, timezone);
}

export { buildAxes, buildSunGraph, replaceSunGraph };