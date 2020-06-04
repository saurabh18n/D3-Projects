//#region Top 10 Cars of year
const renderPieChart = (data) => {
  const carParameters = d3
    .keys(data[0])
    .filter(
      (d) =>
        d != "Car" && d != "Manufacturer" && d != "Origin" && d != "ModelYear"
    );
  const svg = d3.select("#cont").select("svg");
  var margin = {
      top: 0,
      right: 10,
      bottom: 0,
      left: 10,
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;
  var g = svg.append("g");
  // Variables to Filter Data =================
  var originKey = "";
  var manufacturerKey = "";
  var modelYearKey = "";
  var depth = 0;
  var Key = "Origin";
  //================================================

  var btngrp = svg.append("g");
  btngrp;

  btngrp
    .append("text")
    .text("Home")
    .style("fill", "black")
    .attr("transform", "translate(15,24)");
  btngrp
    .append("rect")
    .attr("height", 20)
    .attr("width", 50)
    .attr("x", 10)
    .attr("y", 10)
    .style("fill", "white")

    .style("opacity", 0.6)
    .style("cursor", "pointer")
    .style("stroke", "Black")
    .on("click", () => {
      originKey = "";
      manufacturerKey = "";
      modelYearKey = "";
      depth = 0;
      Key = "Origin";
      renderData(data);
    });

  svg
    .append("g")
    .attr("class", "labels")
    .attr("transform", "translate(400,300)"); // Group for Text
  svg
    .append("g")
    .attr("class", "lines")
    .attr("transform", "translate(400,300)"); // Group for Lines

  const colourScale = d3
    .scaleOrdinal()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
    .range(d3.schemeCategory10);

  const renderData = (idata) => {
    var data = idata;
    //filterdata
    if (originKey != "") {
      data = idata.filter((d) => d.Origin == originKey);
    }
    if (manufacturerKey != "") {
      data = data.filter((d) => d.Manufacturer == manufacturerKey);
    }
    if (modelYearKey != "") {
      data = data.filter((d) => d.ModelYear == +modelYearKey);
    }
    //Group Data=============================================
    if (depth == 3) {
      origins = data.map((d) => {
        return { name: d.Car, count: 1 };
      });
    } else {
      var origins = data.reduce((AllOrigins, curruntCar) => {
        if (AllOrigins.find((d) => d.name == curruntCar[Key])) {
          AllOrigins.find((d) => d.name == curruntCar[Key]).count++;
        } else {
          AllOrigins.push({ name: curruntCar[Key], count: 1 });
        }
        return AllOrigins;
      }, []);
    }
    //===============================================
    var pie = d3.pie().value((d) => d.count);
    var key = (d) => d.data.name;
    var arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(height / 2 - 100)
      .startAngle((d) => d.startAngle)
      .endAngle((d) => d.endAngle)
      .cornerRadius(5);

    var chart = g.selectAll("g").data(pie(origins), (d) => d.data.name);
    var slice = chart
      .enter()
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);
    slice
      .append("path")
      .attr("d", (d) => arc(d))
      .style("stroke-width", "1")
      .style("stroke", "white")
      .style("fill", (d, i) => colourScale(i));
    slice
      .selectAll("path")
      .classed("path", true)
      .on("click", (d) => {
        // Click handler
        switch (depth) {
          case 0: {
            originKey = d.data.name;
            Key = "Manufacturer";
            depth++;
            renderData(idata);
            break;
          }
          case 1: {
            manufacturerKey = d.data.name;
            Key = "ModelYear";
            depth++;
            renderData(idata);
            break;
          }
          case 2: {
            modelYearKey = d.data.name;
            Key = "Car";
            depth++;
            renderData(idata);
            break;
          }
        }
      });
    chart.exit().remove();
    //putting lables=====================================================
    var text = svg.select(".labels").selectAll("text").data(pie(origins), key);
    text
      .enter()
      .append("text")
      .attr("dy", ".35em")
      .text(function (d) {
        return d.data.name + " (" + d.data.count + ")";
      })
      .attr("text-anchor", "middle")
      .attr("transform", function (d, i) {
        var centroid = arc.centroid(d);
        return "translate(" + centroid[0] * 3 + "," + centroid[1] * 2.5 + ")";
      });

    text.exit().remove();
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
  renderPieChart(data);
});
