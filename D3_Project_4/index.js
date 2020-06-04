//#region Scatter Plot Fund Size and 3 Month Return
var margin1 = { top: 0, right: 0, bottom: 90, left: 70 };

const svg1 = d3.select("#cont1").select("svg");
var width = +svg1.attr("width"),
  height = +svg1.attr("height");
const innerWidth = width - margin1.left - margin1.right;
const innerHeight = height - margin1.top - margin1.bottom;
//actors

const renderScatterPlot = (Idata) => {
  const cdata = Idata;

  //#region ==================slider ====================
  const yExtent = d3.extent(Idata, (d) => d.Netassets);
  var range = yExtent;
  var sliderRange = d3
    .sliderBottom()
    .min(yExtent[0])
    .max(yExtent[1])
    .width(430)
    .tickFormat(d3.format(".2s"))
    .ticks(5)
    .default(yExtent)
    .fill("#2196f3")
    .on("onchange", (val) => {
      d3.select("p#value-range").text(val.map(d3.format(".2s")).join(" To "));
    })
    .on("end", (val) => {
      range = val;
      renderData(cdata);
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

  //#endregion ===========================
  const categories = d3.map(Idata, (d) => d.Category).keys();
  var colourScale = d3
    .scaleOrdinal()
    .domain(categories)
    .range(d3.schemeCategory10);
  //#region ================== Categories ===============
  var p = d3
    .select("#cont1Filter")
    .selectAll("input")
    .data(categories)
    .enter()
    .append("p")
    .classed("checkP", true);

  p.append("input")
    .attr("type", "checkbox")
    .attr("name", (d) => d)
    .property("checked", true)

    .on("click", () => {
      renderData(cdata);
    });

  p.append("label")
    .text((d) => d)
    .style("background-color", (d) => colourScale(d));
  //#endregion
  const g = svg1
    .append("g")
    .attr("transform", `translate(${margin1.left},${margin1.top})`);

  var xScale = d3
    .scaleLinear()
    .range([0, width - (margin1.left + margin1.right)]);
  var yScale = d3
    .scaleLinear()
    .range([height - margin1.top - margin1.bottom, 0]);

  const xAxisG = g.append("g");
  const yAxisG = g.append("g");

  const renderData = (data) => {
    var selectedCat = [];
    d3.selectAll("#cont1Filter input:checked")._groups[0].forEach((element) => {
      selectedCat.push(element.name);
    });
    //filter by Category
    data = data.filter((d) => {
      return selectedCat.find((scat) => d.Category === scat);
    });

    //filter by range
    data = data.filter((d) => d.Netassets > range[0] && d.Netassets < range[1]);
    xScale.domain(d3.extent(data, (d) => d._3MO));
    // Setting up yScale ===========================
    yScale.domain(d3.extent(data, (d) => d.Netassets));
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(15)
      .tickSize(-innerHeight)
      .tickPadding(1);
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(15, "s")
      .tickSize(-innerWidth)
      .tickPadding(15);
    yAxisG.transition().duration(1000).call(yAxis);
    yAxisG.selectAll(".domain").remove();
    xAxisG
      .transition()
      .duration(1000)
      .call(xAxis)
      .attr("transform", `translate(0,${innerHeight})`)
      .attr("width", width - margin1.left)
      .selectAll("text")
      .attr("text-anchor", "start")
      .attr("x", -60)
      .attr("transform", "rotate(-90)");
    xAxisG.select(".domain").remove();

    const circles = g.selectAll("circle").data(data, (d) => d.Name);
    circles
      .enter()
      .append("circle")
      .style("fill", (d) => colourScale(d.Category))
      .attr("id", (d) => d.Title)
      .merge(circles)
      .transition()
      .duration(500)
      .attr("r", 10)
      .transition()
      .duration(500)
      .attr("cy", (d) => yScale(d.Netassets))
      .attr("cx", (d) => xScale(d._3MO))
      .attr("r", 5);

    circles.exit().transition().duration(1000).attr("r", 0);
    g.selectAll("circle")
      .append("title")
      .text(
        (d) =>
          d.Name +
          "\nSymbol: " +
          d.Symbol +
          "\nNet Asset: " +
          d.Netassets +
          "\nYTD: " +
          d.YTD
      );
  };
  renderData(Idata);
};

//#endregion

//#region Top 10 Funds =======================

const renderBarChart = (data) => {
  const keys = [
    { name: "", value: "YTD" },
    { name: "3 Months Return", value: "_3MO" },
    { name: "1 Year Return", value: "_1YR" },
    { name: "3 Year Return", value: "_3YR" },
    { name: "5 Year Return", value: "_5YR" },
    { name: "10 Year Return", value: "_10YR" },
    { name: "Yield", value: "Yield" },
    { name: "Net Assets", value: "Netassets" },
  ];

  //===== Populate Select list===============
  const selectList = d3.select("#top10").on("change", () => {
    renderdata(data);
  });
  selectList
    .selectAll("option")
    .data(keys)
    .enter()
    .append("option")
    .text((d) => d.name)
    .attr("value", (d) => d.value);
  const SelectListCount = d3.selectAll("#count").on("change", () => {
    renderdata(data);
  });
  //=====================================================
  const svg = d3.select("#cont2").select("svg");
  var margin2 = {
      top: 20,
      right: 10,
      bottom: 130,
      left: 300,
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
    top10data = data.slice(0, recordCount);
    for (let index = 0; index < recordCount; index++) {
      item = {
        name: data[index].Name,
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
      .attr("transform", `translate(0,${innerHeight})`)
      .attr("width", width - margin1.left)
      .selectAll("text")
      .attr("text-anchor", "start")
      .attr("x", -60)
      .attr("transform", "rotate(-90)");
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

//#region compare funds

const renderCompare = (data) => {
  var dataOriginal = data;
  data = data.slice(0, 4);
  var dataFilter = data;

  d3.select("#fundSearch")
    .selectAll("option")
    .data(dataOriginal)
    .enter()
    .append("option")
    .text((d) => d.Name);
  d3.select("#fundSearch").on("change", () => {
    found = dataOriginal.find(
      (d) => d.Name == document.getElementById("fundSearch").value
    );
    dataFilter.push(found);
    console.log(dataFilter);
    renderdata(dataFilter);
  });

  var svg = d3.select("#cont3"),
    margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

  const renderdata = (data) => {
    // Render Filter Option
    const filterDiv = d3.select("#filterPs");
    var Ps = filterDiv.selectAll("p").data(dataFilter, (d) => d.Name);
    Ps.enter()
      .append("p")
      .text((d) => d.Name)
      .classed("btnClass", true)
      .append("input")
      .attr("type", "button")
      .attr("value", "X")
      .classed("btnClass", true)
      .on("click", (d) => {
        dataFilter = dataFilter.filter((od) => {
          console.log(od.Name, d.Name);
          return od.Name != d.Name;
        });
        console.log(dataFilter);
        renderdata(dataFilter);
      });
    Ps.exit().remove();
    //===================================================
    svg.selectAll("g").remove();
    g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dataT = [
      { name: "YTD" },
      { name: "3 Month" },
      { name: "1 Year" },
      { name: "3 Year" },
      { name: "5 Year" },
      { name: "10 Year" },
      { name: "Yield" },
    ];
    data.map((d) => {
      dataT.find((d) => d.name == "YTD")[d.Name] = d.YTD;
      dataT.find((d) => d.name == "3 Month")[d.Name] = +d._3MO;
      dataT.find((d) => d.name == "1 Year")[d.Name] = +d._1YR;
      dataT.find((d) => d.name == "3 Year")[d.Name] = +d._3YR;
      dataT.find((d) => d.name == "5 Year")[d.Name] = +d._5YR;
      dataT.find((d) => d.name == "10 Year")[d.Name] = +d._10YR;
      dataT.find((d) => d.name == "Yield")[d.Name] = +d.Yield;
    });
    data = dataT;
    var keys = Object.keys(dataT[0]).slice(1);

    var x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);

    var x1 = d3.scaleBand().padding(0.05);

    var y = d3.scaleLinear().rangeRound([height, 0]);

    var z = d3.scaleOrdinal().range(d3.schemeCategory10);

    x0.domain(
      data.map(function (d) {
        return d.name;
      })
    );
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    maxY = d3.max(data, (d) => {
      return d3.max(keys, (key) => {
        return d[key];
      });
    });

    y.domain([0, maxY + maxY / 10]).nice(); // by /10 so there is blank space on top

    g.append("g")
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function (d) {
        return "translate(" + x0(d.name) + ",0)";
      })
      .selectAll("rect")
      .data(function (d) {
        return keys.map(function (key) {
          return { key: key, value: d[key] };
        });
      })
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return x1(d.key);
      })
      .attr("y", function (d) {
        return y(d.value);
      })
      .attr("width", x1.bandwidth())
      .attr("height", function (d) {
        return height - y(d.value);
      })
      .attr("fill", function (d) {
        return z(d.key);
      });

    g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0));

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
      .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Gain");

    var legend = g
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter()
      .append("g")
      .attr("transform", function (d, i) {
        return "translate(0," + i * 20 + ")";
      });

    legend
      .append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

    legend
      .append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function (d) {
        return d;
      });
  };
  renderdata(dataFilter);
};

//#endregion
d3.csv("DS/a1-mutualfunds.csv").then((data) => {
  data.map((d) => {
    d.YTD = +d.YTD;
    d._3MO = +d._3MO;
    d._1YR = +d._1YR;
    d._5YR = +d._5YR;
    d._10YR = +d._10YR;
    d.Expenseratio = +d.Expenseratio;
    d.Mgrtenure = +d.Mgrtenure;
    d.Netassets = +d.Netassets.replace(/[,]/g, "");
  });
  renderScatterPlot(data);
  renderBarChart(data);
  renderCompare(data);
});
