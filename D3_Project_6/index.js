//#region Scatter Plot Different Perameters

const renderScatterPlot = (data) => {
  var margin = { top: 50, right: 10, bottom: 60, left: 80 };
  const svg = d3
    .select("#cont1")
    .select("svg")
    .attr("width", document.getElementById("cont1").clientWidth)
    .attr("height", 600);

  const keys = d3
    .keys(data[0])
    .filter(
      (d) => d != "Car" && d != "Manufacturer" && d != "Origin" && d != "MPG"
    );

  //Populating Select List
  d3.select("#CarParam1")
    .selectAll("option")
    .data(keys)
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d);
  d3.select("#CarParam1").on("change", () => {
    renderData(data);
  });
  //======================

  const innerWidth = +svg.attr("width") - margin.left - margin.right;
  const innerHeight = +svg.attr("height") - margin.top - margin.bottom;

  xScale = d3.scaleLinear().range([0, innerWidth]).nice();
  yScale = d3.scaleLinear().range([innerHeight, 0]).nice();

  const Origins = d3
    .map(data, function (d) {
      return d.Origin;
    })
    .keys();
  colourScale = d3.scaleOrdinal().domain(Origins).range(d3.schemeCategory10);

  var g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  //Manufecturer Legends
  var Legends = g
    .selectAll("g")
    .data(Origins)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${120 * i},-30)`)
    .style("cursor", "pointer")
    .on("mouseover", (o) => {
      renderData(data.filter((d) => d.Origin == o));
    })
    .on("mouseout", () => {
      renderData(data);
    });

  Legends.append("rect")
    .attr("height", 10)
    .attr("width", 20)
    .style("fill", (d) => colourScale(d));
  Legends.append("text")
    .text((d) => d)
    .attr("x", 30)
    .attr("y", 10);

  const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight).tickPadding(15);
  const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(15);

  const yAxisG = g.append("g");
  const xAxisG = g.append("g").attr("transform", `translate(0,${innerHeight})`);

  yAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", -50)
    .attr("x", -innerHeight / 2)
    .attr("fill", "black")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("MPG");

  xAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 50)
    .attr("x", innerWidth / 2)
    .attr("fill", "black")
    .attr("id", "xAxisText");

  const renderData = (data) => {
    // x axis key
    var key = document.getElementById("CarParam1").value;
    //===================
    xScale.domain(d3.extent(data, (d) => d[key]));
    yScale.domain(d3.extent(data, (d) => d.MPG));

    yAxisG.transition().ease(d3.easeLinear).call(yAxis);
    //yAxisG.selectAll(".domain").remove();

    xAxisG.transition().ease(d3.easeLinear).call(xAxis);

    //xAxisG.select(".domain").remove();

    const circles = g.selectAll("circle").data(data, (d) => d.Car);
    circles
      .enter()
      .append("circle")
      .attr("cy", (d) => yScale(d.MPG))
      .attr("fill", (d) => colourScale(d.Origin))
      .attr("id", (d) => d.Car)
      .merge(circles)
      .transition()
      .duration(1000)
      .attr("cx", (d) => xScale(d[key]))
      .attr("r", 5);
    circles.exit().transition().duration(1000).attr("r", 0);
    d3.select("#xAxisText").text(key);
  };
  renderData(data);
};

//#endregion

d3.csv("DS/a1-cars.csv").then((data) => {
  data.map((d) => {
    d.Acceleration = +d.Acceleration;
    d.Cylinders = +d.Cylinders;
    d.Displacement = +d.Displacement;
    d.Horsepower = +d.Horsepower;
    d.MPG = +d.MPG;
    d.ModelYear = +d.ModelYear;
    d.Weight = +d.Weight;
  });
  //console.log(data[2]);
  renderScatterPlot(data);
});
