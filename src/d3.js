import * as d3 from "d3";
import SunCalc from "suncalc";
import { DateTime } from "luxon";

const h = 450,
w = 1400,
p = { vertical: 25, horizontal: 50 },
year = DateTime.now().year,
hoursInDay = 24,
quarterHourInDay = 24 * 4,
daysInYear = DateTime.now().daysInYear,
tickValues = [0, 3, 6, 9, 12, 15, 18, 21],
thresholds = [-90, -18, -12, -6, 0, 6],
contourColors = ["#001D3D", "#014E8E", "#6798C0", "#99D6EA", "#FFE56E", "#FFF0AD"],
lineColors = [{name: "solarNoon", color: "#F77F00"},{name: "nadir", color: "#9E00FF"}],
circleColor = "#DD0000",
monthFormat = d3.timeFormat("%B"),
tooltip = d3.select('body')
    .append("div")
    .attr('id', 'tooltip');

const x = d3.scaleTime()
    .domain([new Date(year,0,1), new Date(year,11,31)])
    .range([p.horizontal, w - p.horizontal]);

const y = d3.scaleLinear()
    .domain([0, hoursInDay])
    .range([p.vertical, h - p.vertical]);

const createContours = (timeZone, lat, lon) => {
    const data = [];
    
    for(let i = 0; i < daysInYear * quarterHourInDay; i++) {
        const local = DateTime.local(year,1,1,0).plus({minutes: i * 15});
        const rezoned = local.setZone(timeZone);
        const result = rezoned.ts + ((local.offset * 60000) - (rezoned.offset * 60000));
        data[i] = SunCalc.getPosition(result, lat, lon).altitude * (180/Math.PI);
    };
    
    const contours = d3.contours()
      .size([quarterHourInDay, daysInYear])
      .thresholds(thresholds)(data);
    
    return contours;
};

const projection = d3.geoTransform({
    point: function(x, y) {
        const xx = (y * ((w - p.horizontal * 2) / daysInYear) + p.horizontal);
        const yy = (x * ((h - p.vertical * 2) / quarterHourInDay) + p.vertical);
        this.stream.point(xx, yy);
    }
});

const createLines = (timeZone, lat, lon) => {
    const data = lineColors.map(l => {
        const d = [];
        for(let i = 0; i < daysInYear; i++) {
            const date = DateTime.local(year,1,1).plus({days: i});
            const nadirNoon = SunCalc.getTimes(date, lat ,lon)[l.name];
            const rezoned = DateTime.fromJSDate(nadirNoon).setZone(timeZone);
            d[i] = [rezoned.hour + rezoned.minute / 60, l.name];
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
    const svg = d3.select("#chart");
    let sunGraph = d3.select("#sun-graph");
    const {latitude, longitude} = coords;
    const contours = createContours(timeZone, latitude, longitude);
    const linesData = createLines(timeZone, latitude, longitude);
    const currentDate = DateTime.now().setZone(timeZone);
    
    const line = d3.area()
        .defined((d, i) => {
            if(d[1] === "nadir") {
                const nextDate = linesData[1][i+1];
                if(nextDate) {
                    const val = d[0] - nextDate[0];
                    if(val >= 23 || val <= -23) return false;
                }
            }
            return true;
        })
        .x((d, i) => x(new Date(year,0,i+1)))
        .y(d => y(d[0]));

    if (sunGraph.empty()) {
        sunGraph = svg.append("g").attr("id", "sun-graph")
    } else {
        const streams = sunGraph.selectAll(".streams");
        const lines = sunGraph.selectAll(".lines");
        const circle = sunGraph.select("circle");

        streams.data(contours).attr("d", d3.geoPath(projection));

        lines.data(linesData).attr("d", line);

        circle.attr("cx", x(currentDate))
        .attr("cy", y(currentDate.hour + currentDate.minute / 60))
        .on("mouseover", e => {
            const left = e.pageX;
            const top = e.pageY;
            tooltip.transition()
                .duration(100)
                .style('opacity', .8);
            tooltip.html(`${currentDate.toLocaleString()} ${currentDate.toISOTime().slice(0,5)}`)
                .style('left', (left + 15) + 'px')		
                .style('top', (top - 15) + 'px');
        });
        return;
    };

    sunGraph.selectAll("path")
        .data(contours)
        .enter()
        .append("path")        
        .attr("d", d3.geoPath(projection))
        .attr("class", "streams")
        .style("fill", (d, i) => contourColors[i]);

    sunGraph.selectAll("g")
        .data(linesData)
        .enter()
        .append("path")
        .attr("d", line)
        .attr("stroke", (d, i) => lineColors[i].color)
        .attr("stroke-width", 3)
        .attr("class", "lines")
        .attr("fill", "none");

    sunGraph.append("circle")
        .attr("cx", x(currentDate))
        .attr("cy", y(currentDate.hour + currentDate.minute / 60))
        .attr("r", "6px")
        .attr("fill", circleColor)
        .on("mouseover", e => {
            const left = e.pageX;
            const top = e.pageY;
            tooltip.transition()
                .duration(100)
                .style('opacity', .8);
            tooltip.html(`${currentDate.toLocaleString()} ${currentDate.toISOTime().slice(0,5)}`)
                .style('left', (left + 15) + 'px')		
                .style('top', (top - 15) + 'px');
        })
        .on('mouseout', () => {
            tooltip.transition()
              .duration(200)
              .style('opacity', 0)
        });
};

export { buildAxes, buildSunGraph };