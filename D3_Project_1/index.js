//=========================1st Visualization====================
//#region
var margin = { top: 10, right: 30, bottom: 60, left: 60 },
  width = 500 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
const svg1 = d3
  .select("#container1")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
const g = svg1
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
g.append("text")
  .attr("class", "title")
  .attr("x", 10)
  .attr("y", 15)
  .text(" Location and Tnfected");

const rander1 = (data) => {
  const colour1 = "blue";
  const colour2 = "red";
  const xScale = new d3.scaleLinear()
    .domain([
      d3.min(data, (d) => parseFloat(d.Latitude)) - 0.01,
      d3.max(data, (d) => parseFloat(d.Latitude)),
    ])
    .range([0, width])
    .nice();
  const xax = g
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));
  xax
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 40)
    .attr("x", 210)
    .attr("fill", "black")
    .attr("font-size", 16)
    .style("text-anchor", "middle")
    .text("Latitude");

  const yScale = new d3.scaleLinear()
    .domain([
      d3.min(data, (d) => parseFloat(d.Longitude)),
      d3.max(data, (d) => parseFloat(d.Longitude)) + 0.005,
    ])
    .range([0, height])
    .nice();
  const yax = g.append("g").call(d3.axisLeft(yScale));
  yax
    .append("text")
    .attr("class", "axis-label")
    .attr("y", -45)
    .attr("x", -250)
    .attr("fill", "black")
    .attr("transform", `rotate(-90)`)
    .attr("font-size", 16)
    .style("text-anchor", "middle")
    .text("Longitude");
  const ColourScale = new d3.scaleLinear()
    .domain([
      d3.min(data, (d) => +d.confirmed),
      d3.max(data, (d) => +d.confirmed),
    ])
    .range([colour1, colour2]);

  var defs = g.append("defs");
  var linearGradient = defs
    .append("linearGradient")
    .attr("id", "linear-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");
  linearGradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colour1);
  linearGradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colour2);

  g.append("rect")
    .attr("x", 250)
    .attr("y", 0)
    .attr("fill", "url(#linear-gradient)")
    .attr("height", 20)
    .attr("width", 70);
  g.append("text")
    .attr("x", 240)
    .attr("y", 15)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text(ColourScale.domain()[0]);

  g.append("text")
    .attr("x", 330)
    .attr("y", 15)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text(ColourScale.domain()[1]);

  g.append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return xScale(d.Latitude);
    })
    .attr("cy", function (d) {
      return yScale(d.Longitude);
    })
    .attr("r", 6)
    .style("fill", function (d) {
      return ColourScale(d.confirmed);
    });
};

d3.csv("/Data/data1.csv").then((data) => {
  data.forEach((d) => {
    d.Latitude = +d.Latitude;
    d.Longitude = +d.Longitude;
  });
  rander1(data);
});
//#endregion
//=========================2nd Visualization====================
//#region
var margin = { top: 10, right: 60, bottom: 80, left: 60 },
  width = 500 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
const svg2 = d3
  .select("#container2")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
const g2 = svg2
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
g2.append("text")
  .attr("class", "title")
  .attr("x", 10)
  .attr("y", 15)
  .text("Country wise confirmed and sucpect");
const render2 = (data) => {
  const xScale = d3
    .scaleBand()
    .range([0, width])
    .domain(
      data.map((d) => {
        return d.Country;
      })
    );
  const xAxis = g2
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(270)")
    .style("text-anchor", "end")
    .attr("dy", ".35em")
    .attr("y", 0)
    .attr("x", -5);

  xAxis
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 40)
    .attr("x", 210)
    .attr("fill", "black")
    .attr("font-size", 16)
    .style("text-anchor", "middle")
    .text("Latitude");

  const y1Scale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => +d.Confirmed),
      d3.max(data, (d) => +d.Confirmed),
    ])
    .range([height, 0]);

  const y2Scale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => +d.Suspected),
      d3.max(data, (d) => +d.Suspected),
    ])
    .range([height, 0]);
  const y1Axis = g2.append("g").call(d3.axisLeft(y1Scale));
  const y2Axis = g2
    .append("g")
    .call(d3.axisRight(y2Scale))
    .attr("transform", "translate( " + width + ", 0 )");
  y1Axis
    .append("text")
    .attr("class", "axis-label")
    .attr("y", -35)
    .attr("x", -250)
    .attr("fill", "black")
    .attr("transform", `rotate(-90)`)
    .attr("font-size", 16)
    .style("text-anchor", "middle")
    .text("Confirmed");
  y1Axis
    .append("rect")
    .attr("y", 180)
    .attr("x", -50)
    .attr("height", 20)
    .attr("width", 20)
    .attr("fill", "red");
  y2Axis
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 50)
    .attr("x", -250)
    .attr("fill", "black")
    .attr("transform", `rotate(-90)`)
    .attr("font-size", 16)
    .style("text-anchor", "middle")
    .text("Suspect");
  y2Axis
    .append("rect")
    .attr("y", 180)
    .attr("x", 35)
    .attr("height", 20)
    .attr("width", 20)
    .attr("fill", "blue");
  const lineGenrator1 = d3
    .line()
    .x((d) => xScale(d.Country))
    .y((d) => y1Scale(d.Confirmed))
    .curve(d3.curveBasis);
  g2.append("path")
    .attr("class", "line-path")
    .attr("d", lineGenrator1(data))
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .attr("stroke", "red");
  const lineGenrator2 = d3
    .line()
    .x((d) => xScale(d.Country))
    .y((d) => y2Scale(d.Suspected))
    .curve(d3.curveBasis);
  g2.append("path")
    .attr("class", "line-path")
    .attr("d", lineGenrator2(data))
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .attr("stroke", "blue");
};

d3.csv("/Data/data2.csv").then((data) => {
  render2(data);
});
//#endregion
