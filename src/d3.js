import * as d3 from "d3";
import SunCalc from "suncalc";

const h = 450,
w = 1400,
p = { vertical: 25, horizontal: 50 },
year = new Date().getFullYear(),
hoursInDay = 24,
minutesInDay = 1440,
daysInYear = ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0) ? 366 : 365,
tickValues = [0, 3, 6, 9, 12, 15, 18, 21],
thresholds = [-90, -18, -12, -6, 0, 6],
contourColors = ["#001D3D", "#014E8E", "#6798C0", "#99D6EA", "#FFE985", "#FFF0AD"],
lines = [{name: "solarNoon", color: "#F77F00"}, {name: "nadir", color: "#6B00FF"}],
circleColor = "#DD0000",
monthFormat = d3.timeFormat("%B");

const x = d3.scaleTime()
    .domain([new Date(year,0,1), new Date(year,11,31)])
    .range([p.horizontal, w - p.horizontal]);

const y = d3.scaleLinear()
    .domain([0, hoursInDay])
    .range([p.vertical, h - p.vertical]);

const getTimeZonesOffset = timeZone => {
    const localDate = new Date();
    const miliInHour = 3600000;
    const tzDate = new Date(localDate.toLocaleString('en-US', {timeZone}));
    const val = (localDate.getHours() + localDate.getMinutes() / 60) - (tzDate.getHours() + tzDate.getMinutes() / 60);
    return val.toFixed() * miliInHour;
}

const createContours = (timeZone, lat, lon, thresholds) => {
    let date = new Date(year,0,1);
    const miliInMinute = 60000;
    const offset = getTimeZonesOffset(timeZone);
    const data = [];
    
    for(let i = 0; i < (daysInYear * minutesInDay); i++) {
        const val = date.getTime() + offset;
        data[i] = SunCalc.getPosition(val, lat, lon).altitude * (180/Math.PI);
        date = new Date(date.getTime() + miliInMinute);
    };
    
    const contours = d3.contours()
      .size([minutesInDay, daysInYear])
      .thresholds(thresholds)(data);
    
    return contours;
};

const createLines = (lat, lon) => {
    const miliInDay = 86400000;
    const data = lines.map((l,i) => {
        let date = new Date(year, 0, i+1);
        const d = [];
        for(let i = 0; i < daysInYear; i++) {
            d[i] = SunCalc.getTimes(date,lat,lon)[l.name];
            date = new Date(date.getTime() + miliInDay);
        };
        return d;
    });
    
    return data;
};

const buildAxes = chart => {
    const svg = d3.select(chart)
        .attr("height", h)
        .attr("width", w)
        .attr("viewBox", [0, 0, w, h]);

    const xAxis = d3.axisBottom(x)
        .tickFormat(monthFormat);

    const yAxis = d3.axisLeft(y)
        .tickValues(tickValues)
        .tickFormat(t => t > 9 ? t : `0${t}`)

    svg.append("g")
        .attr("id", "x")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${h - p.vertical})`)
        .call(xAxis);

    svg.append("g")
        .attr("id", "y")
        .attr("class", "axis")
        .attr("transform", `translate(${p.horizontal}, 0)`)
        .call(yAxis);
};

const buildSunGraph = ({coords}, timeZone) => {
    const graph = d3.select("#sun-graph");
    if(graph) graph.remove();
    const {latitude, longitude} = coords;
    const svg = d3.select("#chart");
    const contours = createContours(timeZone, latitude, longitude, thresholds);
    const linesData = createLines(latitude, longitude);
    
    const line = d3.line()
        .x(d => x(d))
        .y(d => y(d.getHours() + d.getMinutes() / 60));
        
    const projection = d3.geoTransform({
        point: function(x, y) {
            const xx = (y * ((w - p.horizontal * 2) / daysInYear)) + p.horizontal;
            const yy = (x * ((h - p.vertical * 2) / minutesInDay)) + p.vertical;
            this.stream.point(xx, yy);
        }
    });

    svg.append("g")
        .attr("id", "sun-graph")
        .selectAll("path")
        .data(contours)
        .enter()
        .append("path")
        .attr("id", d => "g-" + d.value)
        .attr("d", d3.geoPath(projection))
        .style("fill", (d, i) => contourColors[i]);
    
    svg.append("g")
        .selectAll("path")
        .data(linesData)
        .enter()
        .append("path")
        .attr("d", (d, i) => line(linesData[i]))
        .attr("stroke", (d, i) => lines[i].color)
        .attr("fill", "none");

    svg.append("circle")
        .attr("cx", x(new Date()))
        .attr("cy", () => {
            const today = new Date();
            const miliInHour = 3600000;
            const offset = getTimeZonesOffset(timeZone) / miliInHour;
            return y((today.getHours() + today.getMinutes() / 60) - offset);
        })
        .attr("r", "4px")
        .attr("fill", circleColor);
};

export { buildAxes, buildSunGraph };