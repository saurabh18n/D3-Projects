const svg = d3.select("svg");
var width = parseInt(svg.attr("width"));
var height = parseInt(svg.attr("height"));

//Functioin Start
const renderMap = (datedata, topoData) => {
  const colourScale = d3.scaleSequential(d3.interpolateReds).domain([0, 2000]);

  const projection = d3
    .geoMercator()
    .scale(700)
    .translate([width / 2, height / 2]);
  const pathGenrator = d3.geoPath().projection(projection);
  const prov = topojson.feature(topoData, topoData.objects.CHN_adm1);
  projection.center(d3.geoCentroid(prov));
  const dateParser = d3.timeParse("%d-%m-%Y");
  const dateKeys = Object.keys(datedata[0])
    .filter((key) => {
      if (!(key === "Province" || key === "Lat" || key === "Long")) {
        return true;
      } else {
        return false;
      }
    })
    .map((key) => {
      return dateParser(key);
    });

  var formatDate = d3.timeFormat("%d-%m-%Y");
  var curruntDate = formatDate(d3.min(dateKeys));
  const getConfirmed = (provName) => {
    var found = datedata.find((p) => p.Province === provName);
    if (found) {
      return found[curruntDate];
    } else {
      return 0;
    }
  };
  const dateScale = d3.scaleTime().domain(d3.extent(dateKeys));
  // ==============putting Legends ====================================
  //creating Gredient
  const legendGred = svg
    .append("defs")
    .append("linearGradient")
    .attr("id", "legendGred")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");
  legendGred.append("stop").attr("class", "stop-left").attr("offset", "0");
  legendGred.append("stop").attr("class", "stop-right").attr("offset", "1");

  const legendGroup = svg.append("g");
  legendGroup
    .append("rect")
    .attr("width", "200")
    .attr("height", "20")
    .attr("x", 10)
    .attr("y", 10)
    .attr("fill", "url(#legendGred)");
  legendGroup
    .append("text")
    .text("0")
    .attr("x", 10)
    .attr("y", 50)
    .attr("stroke", "black");
  legendGroup
    .append("text")
    .text("68135")
    .attr("x", 172)
    .attr("y", 50)
    .attr("stroke", "black");

  //=====================================================================
  const pathsGroup = svg.append("g");
  const labelsGroup = svg.append("g");

  const randerPaths = () => {
    const paths = pathsGroup.selectAll("path").data(prov.features);
    paths
      .enter()
      .append("path")
      .attr("d", pathGenrator)
      .classed("provience", true)
      .merge(paths)
      .attr("fill", (d) => colourScale(getConfirmed(d.properties.NAME_1)))
      .append("title");
    paths
      .selectAll("title")
      .text(
        (d) =>
          `${d.properties.NAME_1} \n Confirmed: ${getConfirmed(
            d.properties.NAME_1
          )}`
      );
    const labels = labelsGroup.selectAll("text").data(prov.features);
    labels
      .enter()
      .append("text")
      .attr("x", function (d) {
        return pathGenrator.centroid(d)[0];
      })
      .attr("y", function (d) {
        return pathGenrator.centroid(d)[1];
      })
      .merge(labels)
      .text(function (d) {
        return `${d.properties.NAME_1} (${getConfirmed(d.properties.NAME_1)})`;
      })
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central")
      .style("font-size", 11)
      .style("fill", "Black");
  };
  //slider
  var sliderTime = d3
    .sliderBottom()
    .min(d3.min(dateKeys))
    .max(d3.max(dateKeys))
    .step(1000 * 60 * 60 * 24)
    .width(300)
    .tickFormat(d3.timeFormat("%d-%b"))
    .ticks(0)
    .default(new Date(2020, 0, 22))
    .on("onchange", (val) => {
      curruntDate = formatDate(sliderTime.value());
      randerPaths();
    });
  var gTime = d3
    .select("div#slider-time")
    .append("svg")
    .attr("width", 400)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

  gTime.call(sliderTime);

  d3.select("p#value-time").text(d3.timeFormat("%Y")(sliderTime.value()));
  //starting slider automatic
  const increaseDate = (date) => {
    var result = new Date(date);
    result.setDate(result.getDate() + 1);
    return result;
  };
  var updateTimer;
  const startTimer = () => {
    curruntDate = formatDate(d3.min(dateKeys));
    sliderTime.value(d3.min(dateKeys));
    updateTimer = setInterval(() => {
      sliderTime.value(increaseDate(sliderTime.value()));
      if (formatDate(sliderTime.value()) === formatDate(d3.max(dateKeys))) {
        console.log("reached end");
        clearInterval(updateTimer);
        d3.select("#stopBtn").text("Start");
      }
      curruntDate = formatDate(sliderTime.value());
      randerPaths();
    }, 500);
  };
  const stopTimer = () => {
    clearInterval(updateTimer);
  };
  //Stop Button
  d3.select("#stopButton")
    .append("button")
    .attr("id", "stopBtn")
    .text("Start")
    .on("click", () => {
      if (d3.select("#stopBtn").text() === "Stop") {
        d3.select("#stopBtn").text("Start");
        stopTimer();
      } else {
        d3.select("#stopBtn").text("Stop");
        startTimer();
      }
    });

  randerPaths();
  //
};

Promise.all([
  d3.csv("data/confirmed_casses.csv"),
  d3.json("data/china-provinces.json"),
]).then(([datedata, topodata]) => {
  renderMap(datedata, topodata);
});
