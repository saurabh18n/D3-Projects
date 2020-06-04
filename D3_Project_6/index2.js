//#region Top 10 Cars of year
const renderTopCars = (data) => {
  const carParameters = d3
    .keys(data[0])
    .filter(
      (d) =>
        d != "Car" && d != "Manufacturer" && d != "Origin" && d != "ModelYear"
    );
  //===== Populate Select list===============
  const selectList = d3.select("#CarParam2").on("change", () => {
    renderdata(data);
  });
  selectList
    .selectAll("option")
    .data(carParameters)
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d);
  d3.select("#CarParam2").on("change", () => {
    renderdata(data);
  });
  //=====================================================
  //Populate Range Slider

  const Years = d3.extent(data, (d) => d.ModelYear);
  var range = Years;
  var sliderRange = d3
    .sliderBottom()
    .min(Years[0])
    .max(Years[1])
    .width(430)
    .tickFormat(d3.format(".2s"))
    .ticks(5)
    .default(Years)
    .fill("#2196f3")
    .on("onchange", (val) => {
      d3.select("h1#value-range").text(
        "Top 10 Car of Year " + val.map(d3.format(".2s")).join(" To ")
      );
    })
    .on("end", (val) => {
      range = val;
      renderdata(data);
    });

  var gRange = d3
    .select("div#slider-range")
    .append("svg")
    .attr("width", 500)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

  gRange.call(sliderRange);
  gRange.selectAll("text").classed("sliderText", true);
  d3.select("p#value-range").text(
    sliderRange.value().map(d3.format("2s")).join("-")
  );

  //=====================================================
  const svg = d3.select("#cont2").select("svg");
  var margin = {
      top: 20,
      right: 10,
      bottom: 130,
      left: 250,
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

  var g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xScale = d3.scaleLinear().range([0, width]);
  var yScale = d3.scaleBand().range([0, height]); //scalePoint

  const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".2s"));
  const yAxis = d3.axisLeft(yScale);

  const xAxisG = g.append("g");
  const yAxisG = g.append("g");

  const renderdata = (data) => {
    //filter data
    data = data.filter(
      (d) => d.ModelYear >= range[0] && d.ModelYear <= range[1]
    );
    //sort Data
    let carParam = document.getElementById("CarParam2").value;
    data = data.slice().sort((a, b) => d3.descending(a[carParam], b[carParam]));
    let top10data = [];
    data = data.slice(0, 10); //Getting top 10 Cars
    for (let index = 0; index < 10; index++) {
      item = {
        name: data[index].Manufacturer + " " + data[index].Car,
        value: data[index][carParam],
      };
      top10data.push(item);
    }
    //========================
    xScale.domain([0, d3.max(top10data, (d) => d.value)]);
    yScale.domain(d3.map(top10data, (d) => d.name).keys());
    yAxisG.transition().duration(1000).call(yAxis);
    //yAxisG.selectAll(".domain").remove();
    yAxisG.selectAll("text").style("font-size", "1.5em");
    xAxisG
      .transition()
      .call(xAxis)
      .attr("transform", `translate(0,${height})`)
      .attr("width", width - margin.left)
      .selectAll("text")
      .attr("text-anchor", "middle")
      .attr("y", -8)
      .attr("x", -25)
      .attr("transform", "rotate(-90)");
    //xAxisG.select(".domain").remove();
    g.selectAll("rect").remove();
    const bars = g
      .selectAll("rect")
      .data(top10data)
      .enter()
      .append("rect")
      .attr("y", (d) => yScale(d.name))
      .attr("height", yScale.bandwidth() - 5)
      .attr("width", 0)
      .style("fill", "#6178f8")
      .transition()
      .attr("width", (d) => xScale(d.value));
  };
  renderdata(data);
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
  renderTopCars(data);
});
