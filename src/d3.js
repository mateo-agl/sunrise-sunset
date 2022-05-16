import * as d3 from "d3";
import SunCalc from "suncalc";

const h = 450,
w = 1400,
p = { vertical: 25, horizontal: 50 },
year = new Date().getFullYear(),
hoursInDay = 24,
daysInYear = ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0) ? 366 : 365,
tickValues = [0, 3, 6, 9, 12, 15, 18, 21],
thresholds = [-90, -18, -12, -6, 0, 6],
contourColors = ["#001D3D", "#014E8E", "#6798C0", "#99D6EA", "#FFE985", "#FFF0AD"],
lines = [{name: "solarNoon", color: "#F77F00"},{name: "nadir", color: "#9E00FF"}],
circleColor = "#DD0000",
monthFormat = d3.timeFormat("%B");

const x = d3.scaleTime()
    .domain([new Date(year,0,1), new Date(year,11,31)])
    .range([p.horizontal, w - p.horizontal]);

const y = d3.scaleLinear()
    .domain([0, hoursInDay])
    .range([p.vertical, h - p.vertical]);

const getTimeZoneTimes = (timeZone, i) => {
    const localDate = new Date(year,0,1,i).getTime();
    const tzDate = new Date(new Date(year,0,1,i).toLocaleString("en-US", {timeZone})).getTime();
    return (localDate - tzDate) + localDate;
}

const toLocalTime = (val, timeZone) => {
    const date = new Date(val.toLocaleString("en-US", {timeZone}));
    return date.getHours() + date.getMinutes() / 60;
}

const createContours = (timeZone, lat, lon) => {
    const data = [];
    
    for(let i = 0; i < daysInYear * hoursInDay; i++) {
        data[i] = SunCalc.getPosition(getTimeZoneTimes(timeZone, i), lat, lon).altitude * (180/Math.PI);
    };
    
    const contours = d3.contours()
      .size([hoursInDay, daysInYear])
      .thresholds(thresholds)(data);
    
    return contours;
};

const createLines = (timeZone, lat, lon) => {
    const miliInDay = 86400000;
    const data = lines.map(l => {
        let date = new Date(year, 0);
        const d = [];
        for(let i = 0; i < daysInYear; i++) {
            const val = SunCalc.getTimes(date, lat ,lon)[l.name];
            d[i] = [toLocalTime(val, timeZone), l.name];
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
    const contours = createContours(timeZone, latitude, longitude);
    const linesData = createLines(timeZone, latitude, longitude);
    const currentDate = new Date(new Date().toLocaleString("en-US", {timeZone}));
    
    const projection = d3.geoTransform({
        point: function(x, y) {
            const xx = (y * ((w - p.horizontal * 2) / daysInYear) + p.horizontal);
            const yy = (x * ((h - p.vertical * 2) / hoursInDay) + p.vertical);
            this.stream.point(xx, yy);
        }
    });
    
    const line = d3.line()
        .defined((d, i) => {
            if(d[1] === "solarNoon") return true;
            const midnight = linesData[1][i+1];
            if(midnight) {
                const val = d[0] - midnight[0];
                if(val >= 23 || val <= -23) return false;
                return true;
            } else { return true }
        })
        .x((d, i) => x(new Date(year,0,i+1)))
        .y(d => y(d[0]));
    
    const sunGraph = svg.append("g")
        .attr("id", "sun-graph")

    const tooltip = d3.select('body')
        .append("div")
        .attr('id', 'tooltip');

    sunGraph.selectAll("path")
        .data(contours)
        .enter()
        .append("path")
        .attr("d", d3.geoPath(projection))
        .style("fill", (d, i) => contourColors[i]);
    
    sunGraph.selectAll("g")
        .data(linesData)
        .enter()
        .append("path")
        .attr("d", line)
        .attr("stroke", (d, i) => lines[i].color)
        .attr("stroke-width", 3)
        .attr("fill", "none");

    sunGraph.append("circle")
        .attr("cx", x(currentDate))
        .attr("cy", y(currentDate.getHours() + currentDate.getMinutes() / 60))
        .attr("r", "6px")
        .attr("fill", circleColor)
        .on("mouseover", e => {
            const left = e.pageX;
            const top = e.pageY;
            tooltip.transition()
                .duration(100)
                .style('opacity', .8);
            tooltip.html(currentDate.toLocaleString())
                .style('left', (left + 15) + 'px')		
                .style('top', (top - 15) + 'px');
        })
        .on('mouseout', () => {
            tooltip.transition()
              .duration(200)
              .style('opacity', 0)
        })
};

export { buildAxes, buildSunGraph };