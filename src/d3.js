import * as d3 from "d3";
import SunCalc from "suncalc";

const h = 400,
w = 1200,
p = 60,
year = new Date().getFullYear(),
days = d3.timeDays(new Date(year,0), new Date(year+1,0,1)),
monthFormat = d3.timeFormat("%B"),
tickValues = [0, 3, 6, 9, 12, 15, 18, 21],
thresholds = [-90, -18, -12, -6, 0],
colors = ["#001D3D", "#014E8E", "#6798C0", "#99D6EA", "#FFE985", "#FFF0AD", "#F77F00"],
x = d3.scaleTime()
        .domain([d3.min(days), d3.max(days)])
        .range([p, w - p]),
y = d3.scaleLinear()
        .domain([24, 0])
        .range([h - p, p]),
changeTimeZone = (date, timeZone) => new Date(date.toLocaleString('en-US', {timeZone})),
streams = [
    [],
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
        .tickValues(tickValues)
        .tickFormat(t => t > 9 ? t : `0${t}`)

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

const sunContours = (tz ,lat, long, resolution, thresholds) => {
    let date = changeTimeZone(days[0],tz);
    const daysInYear = days.length;
    const minutesPerDay = 1440;
    const data = new Array();
  
    for (let i = 0; i < (daysInYear * minutesPerDay / resolution); i++) {
      data[i] = SunCalc.getPosition(date, lat, long).altitude * (180/Math.PI);
      date = new Date(date.getTime() + 3600000)
    }

    const contours = d3.contours()
      .size([minutesPerDay / resolution, daysInYear])
      .thresholds(thresholds)(data);
    
    return contours;
};

const buildSunGraph = ({coords}, timezone) => {
    const {latitude, longitude} = coords;
    const daysInYear = days.length;
    const contours = sunContours(timezone,latitude,longitude,60,thresholds);
    
    const projection = d3.geoTransform({
        point: function(x, y) {
            let xx = (y * ((w - p * 2) / daysInYear)) + p;
            let yy = x * ((h - p) / 24);
            console.log(xx,yy)
            this.stream.point(xx, yy);
        }
    });
    // let data = streams.map((s, i) => {
    //     return days.map(d => {
    //         const times = SunCalc.getTimes(d, latitude, longitude);
    //         if(i < 1) return [0, 24];
    //         const [y0, y1] = Array(2).fill("").map((y, u) => {
    //             const date = changeTimeZone(times[s[u]],timezone);
    //             if(!date.getHours()) return 0;
    //             return date.getHours() + date.getMinutes() / 60;
    //         });
    //         return [y0, y1];
    //     });
    // });

    // const area = d3.area()
    //     .x((d,i) => x(days[i]))
    //     .y0(h => y(h[0]))
    //     .y1(h => y(h[1]));
    
    d3.select("#chart")
        .append("g")
        .attr("class", "contours")
        .selectAll("path")
        .data(contours)
        .enter().append("path")
        .attr("id", d => "g-" + d.value)
        .attr("d", d3.geoPath(projection))
        .style("fill", (d, i) => colors[i]);
};

const replaceSunGraph = (position, timezone) => {
    d3.select("#sun-graph")
        .remove();

    buildSunGraph(position, timezone);
}

export { buildAxes, buildSunGraph, replaceSunGraph };