//#region Parral Cordinate with filter
var margin1 = { top: 30, right: 10, bottom: 10, left: 0 };
const svg1 = d3
  .select("#cont1")
  .select("svg")
  .attr("width", document.getElementById("cont1").clientWidth)
  .attr("height", 400);
var width = +svg1.attr("width"),
  height = +svg1.attr("height");
const innerWidth = width - margin1.left - margin1.right;
const innerHeight = height - margin1.top - margin1.bottom;

const g = svg1
  .append("g")
  .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

const renderParallelCordinate = (data) => {
  dimensions = d3
    .keys(data[0])
    .filter(
      (d) =>
        d != "Cereal" &&
        d != "Manufacturer" &&
        d != "Type" &&
        d != "Shelf" &&
        d != "Weight" &&
        d != "Cups"
    );

  var yScale = {};
  for (i in dimensions) {
    name = dimensions[i];
    yScale[name] = d3
      .scaleLinear()
      .domain(
        d3.extent(data, function (d) {
          return +d[name];
        })
      )
      .range([innerHeight, 0]);
  }
  xScale = d3.scalePoint().range([0, innerWidth]).padding(1).domain(dimensions);

  const path = (d) => {
    return d3.line()(
      dimensions.map(function (p) {
        return [xScale(p), yScale[p](d[p])];
      })
    );
  };

  // Draw the axis:
  g.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions)
    .enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function (d) {
      return "translate(" + xScale(d) + ")";
    })
    // And I build the axis with the call function
    .each(function (d) {
      d3.select(this).call(d3.axisLeft().scale(yScale[d]));
    })
    // Add axis title
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function (d) {
      return d;
    })
    .style("fill", "black");
  //rendering paths
  const renderData = (fdata) => {
    var Paths = g.selectAll(".PathClass").data(fdata, (d) => d.Cereal);
    Paths.enter()
      .append("path")
      .style("fill", "none")
      .style("stroke", "#69b3a2")
      .style("opacity", 0.5)
      .classed("PathClass", true)
      .attr("d", path)
      .append("title")
      .append("text")
      .text((d) => d.Cereal)
      .merge(Paths)
      .style("display", "block");

    //console.log();
    Paths.exit().style("display", "none");

    var Cereals = d3
      .select("#CerealsList")
      .selectAll("text")
      .data(fdata, (d) => d.Cereal);
    Cereals.enter()
      .append("text")
      .text((d) => d.Cereal)
      .style("margin-right", 10);
    Cereals.exit().remove();
  };

  //filterhandler

  d3.select("#filterText").on("keyup", () => {
    var term = document.getElementById("filterText").value;
    if (term == "") {
      tempdata = data;
    } else {
      tempdata = data.filter((d) => {
        return d.Cereal.toLowerCase().search(term.toLowerCase()) >= 0;
      });
    }
    renderData(tempdata);
  });
  renderData(data); // Render Initial data
};

//#endregion

//#region Top 10 Funds =======================

const renderBarChart = (data) => {
  const keys = d3
    .keys(data[0])
    .filter(
      (d) =>
        d != "Cereal" &&
        d != "Manufacturer" &&
        d != "Type" &&
        d != "Shelf" &&
        d != "Weight" &&
        d != "Cups"
    );
  //===== Populate Select list===============
  const selectList = d3.select("#top10").on("change", () => {
    renderdata(data);
  });
  selectList
    .selectAll("option")
    .data(keys)
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d);
  d3.selectAll("#count").on("change", () => {
    renderdata(data);
  });
  //=====================================================
  const svg = d3.select("#cont2").select("svg");
  var margin2 = {
      top: 20,
      right: 10,
      bottom: 130,
      left: 270,
    },
    width = +svg.attr("width") - margin2.left - margin2.right,
    height = +svg.attr("height") - margin2.top - margin2.bottom;

  var g = svg
    .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

  var xScale = d3.scaleLinear().range([0, width]);
  var yScale = d3.scaleBand().range([0, height]); //scalePoint

  const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".2s"));
  const yAxis = d3.axisLeft(yScale);

  const xAxisG = g.append("g");
  const yAxisG = g.append("g");

  const renderdata = (data) => {
    //sort Data
    let key = document.getElementById("top10").value;
    data = data.slice().sort((a, b) => d3.descending(a[key], b[key]));
    let top10data = [];

    let recordCount = parseInt(document.getElementById("count").value);
    data = data.slice(0, recordCount);
    for (let index = 0; index < recordCount; index++) {
      item = {
        name: data[index].Cereal,
        value: data[index][key],
      };
      top10data.push(item);
    }
    //========================
    xScale.domain([0, d3.max(top10data, (d) => d.value)]);
    yScale.domain(d3.map(top10data, (d) => d.name).keys());
    yAxisG.transition().duration(1000).call(yAxis);
    yAxisG.selectAll(".domain").remove();
    yAxisG.selectAll("text").style("font-size", "1.5em");
    xAxisG
      .transition()
      .duration(1000)
      .call(xAxis)
      .attr("transform", `translate(0,${height})`)
      .attr("width", width - margin1.left)
      .selectAll("text")
      .attr("text-anchor", "start")
      .attr("x", -60)
      .attr("transform", "rotate(-90)")
      .style("font-size", "1.5em");
    xAxisG.select(".domain").remove();
    g.selectAll("rect").remove();
    const bars = g
      .selectAll("rect")
      .data(top10data)
      .enter()
      .append("rect")
      .attr("y", (d) => yScale(d.name))
      .attr("height", yScale.bandwidth() - 5)
      .style("fill", "#6178f8")
      .transition()
      .delay(1000)
      .attr("width", (d) => xScale(d.value));
  };
  renderdata(data);
};

//#endregion

//#region ScatterPlot
const renderScatterPlot = (data) => {
  const keys = d3
    .keys(data[0])
    .filter(
      (d) =>
        d != "Cereal" &&
        d != "Manufacturer" &&
        d != "Type" &&
        d != "Shelf" &&
        d != "Weight" &&
        d != "Cups" &&
        d != "Calories"
    );
  //Populating Select List

  d3.select("#selectY")
    .selectAll("option")
    .data(keys)
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d);
  d3.select("#selectY").on("change", () => {
    renderData(data);
  });
  //======================

  var svg = d3.select("#cont3");
  margin3 = {
    top: 50,
    right: 40,
    bottom: 90,
    left: 70,
  };
  const innerWidth = +svg.attr("width") - margin3.left - margin3.right;
  const innerHeight = +svg.attr("height") - margin3.top - margin3.bottom;

  xScale = d3.scaleLinear().range([0, innerWidth]).nice();
  yScale = d3.scaleLinear().range([0, innerHeight]).nice();

  const Manufacturers = d3
    .map(data, function (d) {
      return d.Manufacturer;
    })
    .keys();
  colourScale = d3
    .scaleOrdinal()
    .domain(Manufacturers)
    .range(d3.schemeCategory10);

  var g = svg
    .append("g")
    .attr("transform", `translate(${margin3.left},${margin3.top})`);

  //Manufecturer Legends
  var Legends = g
    .selectAll("g")
    .data(Manufacturers)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${60 * i},-30)`);
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

  xAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 50)
    .attr("x", innerWidth / 2)
    .attr("fill", "black")
    .attr("id", "xAxisText");

  const renderData = (data) => {
    // x axis key
    var key = document.getElementById("selectY").value;

    //===================
    xScale.domain(d3.extent(data, (d) => d[key]));
    yScale.domain(d3.extent(data, (d) => d.Calories));

    yAxisG.call(yAxis);
    //yAxisG.selectAll(".domain").remove();
    yAxisG
      .append("text")
      .attr("class", "axis-label")
      .attr("y", -50)
      .attr("x", -innerHeight / 2)
      .attr("fill", "black")
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Calories");
    xAxisG.transition().delay(1000).call(xAxis);

    //xAxisG.select(".domain").remove();

    const circles = g.selectAll("circle").data(data, (d) => d.Rid);
    circles
      .enter()
      .append("circle")
      .attr("cy", (d) => yScale(d.Calories))
      .attr("fill", (d) => colourScale(d.Manufacturer))
      .attr("id", (d) => d.Rid)
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

d3.csv("DS/a1-cereals.csv").then((data) => {
  data.map((d) => {
    d.Calories = +d.Calories;
    d.Carbohydrates = +d.Carbohydrates;
    d.Cups = +d.Cups;
    d.Fat = +d.Fat;
    d.Fiber = +d.Fiber;
    d.Manufacturer = d.Manufacturer;
    d.Potassium = +d.Potassium;
    d.Protein = +d.Protein;
    d.Shelf = +d.Shelf;
    d.Sodium = +d.Sodium;
    d.Sugars = +d.Sugars;
    d.Vitamins = +d.Vitamins;
    d.Weight = +d.Weight;
  });
  renderParallelCordinate(data);
  renderBarChart(data);
  renderScatterPlot(data);
});
