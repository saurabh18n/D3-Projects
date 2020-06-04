//#region  Treemap
//https://codepen.io/meerkat00/pen/LQNYrv
var margin1 = { top: 24, right: 0, bottom: 0, left: 0 },
  width = 900,
  height = 600,
  formatNumber = d3.format(",d"),
  transitioning;
var x = d3.scaleLinear().domain([0, width]).range([0, width]);

var y = d3
  .scaleLinear()
  .domain([0, height - margin1.top - margin1.bottom])
  .range([0, height - margin1.top - margin1.bottom]);

var color = d3.scaleOrdinal().range(
  d3.schemeTableau10.map(function (c) {
    c = d3.rgb(c);
    c.opacity = 1;
    return c;
  })
);

var fader = function (color) {
  return d3.schemeTableau10(color, "#fff")(0.2);
};
var format = d3.format(",d");
var treemap;
var svg, grandparent;

d3.json("cars.json").then((data) => {
  updateDrillDown(data);
});

function updateDrillDown(data) {
  if (svg) {
    svg.selectAll("*").remove();
  } else {
    svg = d3
      .select("#treeCont")
      .select("svg")
      .style("margin-left", -margin1.left + "px")
      .style("margin.right", -margin1.right + "px")
      .append("g")
      .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")")
      .style("shape-rendering", "crispEdges");

    grandparent = svg.append("g").attr("class", "grandparent");

    grandparent
      .append("rect")
      .attr("y", -margin1.top)
      .attr("width", width)
      .attr("height", margin1.top)
      .attr("fill", "yellow");

    grandparent
      .append("text")
      .attr("x", 6)
      .attr("y", 6 - margin1.top)
      .attr("dy", ".75em");

    treemap = d3
      .treemap()
      .tile(
        d3.treemapResquarify.ratio((height / width) * 0.5 * (1 + Math.sqrt(5)))
      )
      .size([width, height])
      .round(false)
      .paddingInner(1);
  }

  var root = d3
    .hierarchy(data)
    .eachBefore(function (d) {
      d.id = (d.parent ? d.parent.id + "." : "") + d.data.name;
    })
    .sum((d) => d.value);
  initialize(root);
  accumulate(root);
  layout(root);
  treemap(root);
  display(root);
}

function initialize(root) {
  root.x = root.y = 0;
  root.x1 = width;
  root.y1 = height;
  root.depth = 0;
}

// Aggregate the values for internal nodes. This is normally done by the
// treemap layout, but not here because of our custom implementation.
// We also take a snapshot of the original children (_children) to avoid
// the children being overwritten when when layout is computed.
function accumulate(d) {
  return (d._children = d.children)
    ? (d.value = d.children.reduce(function (p, v) {
        return p + accumulate(v);
      }, 0))
    : d.value;
}

// Compute the treemap layout recursively such that each group of siblings
// uses the same size (1×1) rather than the dimensions of the parent cell.
// This optimizes the layout for the current zoom state. Note that a wrapper
// object is created for the parent node for each group of siblings so that
// the parent’s dimensions are not discarded as we recurse. Since each group
// of sibling was laid out in 1×1, we must rescale to fit using absolute
// coordinates. This lets us use a viewport to zoom.
function layout(d) {
  if (d._children) {
    d._children.forEach(function (c) {
      c.x0 = d.x0 + c.x0 * d.x1;
      c.y0 = d.y0 + c.y0 * d.y1;
      c.x1 *= d.x1 - d.x0;
      c.y1 *= d.y1 - d.y0;
      c.parent = d;
      layout(c);
    });
  }
}

function display(d) {
  grandparent
    .datum(d.parent)
    .on("click", transition)
    .select("text")
    .text(name(d));

  var g1 = svg.insert("g", ".grandparent").datum(d).attr("class", "depth");

  var g = g1.selectAll("g").data(d._children).enter().append("g");

  g.filter(function (d) {
    return d._children;
  })
    .classed("children", true)
    .on("click", transition);

  var children = g
    .selectAll(".child")
    .data(function (d) {
      return d._children || [d];
    })
    .enter()
    .append("g");

  children
    .append("rect")
    .attr("class", "child")
    .call(rect)
    .append("title")
    .text(function (d) {
      return d.data.name + " (" + formatNumber(d.value) + ")";
    });

  children
    .append("text")
    .attr("class", "ctext")
    .text(function (d) {
      return d.data.name;
    })
    .call(text2);

  g.append("rect").attr("class", "parent").call(rect);

  var t = g.append("text").attr("class", "ptext").attr("dy", ".75em");

  t.append("tspan").text(function (d) {
    return d.data.name;
  });

  t.append("tspan")
    .attr("dy", "1.0em")
    .text(function (d) {
      return formatNumber(d.value);
    });

  t.call(text);

  g.selectAll("rect").style("fill", function (d) {
    return color(d.data.name);
  });

  function transition(d) {
    if (transitioning || !d) return;
    transitioning = true;
    var g2 = display(d),
      t1 = g1.transition().duration(750),
      t2 = g2.transition().duration(750);

    // Update the domain only after entering new elements.
    //x.domain([d.x0, d.x0 + d.x1]);
    //y.domain([d.y0, d.y0 + d.y1]);
    x.domain([d.x0, d.x0 + (d.x1 - d.x0)]);
    y.domain([d.y0, d.y0 + (d.y1 - d.y0)]);

    // Enable anti-aliasing during the transition.
    svg.style("shape-rendering", null);

    // Draw child nodes on top of parent nodes.
    svg.selectAll(".depth").sort(function (a, b) {
      console.log(".depth sort a " + a.depth + " b " + b.depth);
      return a.depth - b.depth;
    });

    // Fade-in entering text.
    g2.selectAll("text").style("fill-opacity", 0);

    // Transition to the new view.
    t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
    t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
    t1.selectAll("rect").call(rect);
    t2.selectAll("rect").call(rect);

    // Remove the old node when the transition is finished.
    t1.remove().on("end", function () {
      svg.style("shape-rendering", "crispEdges");
      transitioning = false;
    });
  }
  return g;
}

function text(text) {
  text.selectAll("tspan").attr("x", function (d) {
    return x(d.x0) + 6;
  });
  text
    .attr("x", function (d) {
      return x(d.x0) + 6;
    })
    .attr("y", function (d) {
      return y(d.y0) + 3;
    });
}

function text2(text) {
  text
    .attr("x", function (d) {
      return x(d.x1) - this.getComputedTextLength() - 6;
    })
    .attr("y", function (d) {
      return y(d.y1) - 6;
    })
    .style("opacity", function (d) {
      var w = x(d.x1) - x(d.x0);
      //   console.log(
      //     "text2 opacity setting textlength " +
      //       this.getComputedTextLength() +
      //       " d size " +
      //       w
      //   );
      return this.getComputedTextLength() < w - 6 ? 1 : 0;
    });
}

function rect(rect) {
  rect
    .attr("x", function (d) {
      return x(d.x0);
    })
    .attr("y", function (d) {
      return y(d.y0);
    })
    .attr("width", function (d) {
      var w = x(d.x1) - x(d.x0);
      return w;
    })
    .attr("height", function (d) {
      var h = y(d.y1) - y(d.y0);
      return h;
    });
}
// This write the Top line
function name(d) {
  return d.parent
    ? name(d.parent) + " / " + d.data.name + " (" + formatNumber(d.value) + ")"
    : d.data.name + " (" + formatNumber(d.value) + ")";
}

//#endregion

//#region Scatterplot
const titleText = "Cars Weight Vs Horse Power";

var svg2 = d3.select("#scatterCont").select("svg");

//Removing Graph and Circle Apart

const xAxisLabelText = "Horsepower";
const yAxisLabelText = "Weight";
margin2 = { top: 50, right: 40, bottom: 90, left: 120 };
const innerWidth = width - margin2.left - margin2.right;
const innerHeight = height - margin2.top - margin2.bottom;
const circleRadius = 5;
let xScale, yScale, colourScale, g_scplt;

const render = (data) => {
  xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.Horsepower))
    .range([0, innerWidth])
    .nice();

  yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.Weight))
    .range([innerHeight, 0])
    .nice();

  const origins = d3
    .map(data, function (d) {
      return d.Origin;
    })
    .keys();
  colourScale = d3.scaleOrdinal().domain(origins).range(d3.schemeCategory10);
  const origiLinks = d3
    .selectAll("#scatterContFilter")
    .selectAll("h3")
    .data(origins)
    .enter()
    .append("h3")
    .style("background-color", (d) => colourScale(d))
    .style("color", "white")
    .style("cursor", "pointer")
    .attr("onmouseover", "handleHower(this)")
    .attr("onmouseout", "handleHowerLeft()")
    .text((d) => d);

  g_scplt = svg2
    .append("g")
    .attr("transform", `translate(${margin2.left},${margin2.top})`);

  const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight).tickPadding(15);

  const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(15);

  const yAxisG = g_scplt.append("g").call(yAxis);

  yAxisG.selectAll(".domain").remove();

  yAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", -100)
    .attr("x", -innerHeight / 2)
    .attr("fill", "black")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text(yAxisLabelText);

  const xAxisG = g_scplt
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(0,${innerHeight})`);

  xAxisG.select(".domain").remove();

  xAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 80)
    .attr("x", innerWidth / 2)
    .attr("fill", "black")
    .text(xAxisLabelText);

  //Title text
  g_scplt
    .append("text")
    .attr("class", "title")
    .attr("y", -10)
    .attr("x", innerWidth / 2)
    .attr("text-anchor", "middle")
    .text(titleText);
};

const renderCircles = (data) => {
  const circles = g_scplt.selectAll("circle").data(data, (d) => d.Rid);
  circles
    .enter()
    .append("circle")
    .attr("cy", (d) => yScale(d.Weight))
    .attr("cx", (d) => xScale(d.Horsepower))
    .attr("fill", (d) => colourScale(d.Origin))
    .attr("id", (d) => d.Rid)
    .attr("r", circleRadius)
    .merge(circles)
    .transition()
    .duration(1000)
    .attr("r", circleRadius);

  circles.exit().transition().duration(1000).attr("r", 0);
};

let csvData;
d3.csv("DS/a1-cars.csv").then((data) => {
  data.forEach((d, i) => {
    d.MPG = +d.MPG;
    d.Cylinders = +d.Cylinders;
    d.Displacement = +d.Displacement;
    d.Horsepower = +d.Horsepower;
    d.Weight = +d.Weight;
    d.Acceleration = +d.Acceleration;
    d.ModelYear = +d.ModelYear;
    d.Rid = "c" + i;
  });
  csvData = data;
  render(data);
  renderCircles(data);
});

function handleHower(e) {
  const data = csvData.filter((d) => {
    return d.Origin == e.innerText;
  });
  renderCircles(data);
}

function handleHowerLeft() {
  renderCircles(csvData);
}

//#endregion

//#region Line Chart

const LC_Title = "Trend of MPG Over time";
const LC_xAxisLabelText = "Years";
const LC_yAxisLabelText = "MPG";
var g_lc;
margin3 = { top: 50, right: 40, bottom: 90, left: 120 };

const renderLineChart = (data) => {
  var marginLC = {
      top: 20,
      right: 80,
      bottom: 50,
      left: 50,
    },
    width = 900 - marginLC.left - marginLC.right,
    height = 500 - marginLC.top - marginLC.bottom;

  var x = d3.scaleLinear().range([0, width]);

  var y = d3.scaleLinear().range([height, 0]);

  var color = d3
    .scaleOrdinal()
    .domain(["American", "European", "Japanese"])
    .range(d3.schemeCategory10);

  const xAxis = d3.axisBottom(x); //.tickSize(-20).tickPadding(15);

  const yAxis = d3.axisLeft(y); //.tickSize(-innerWidth).tickPadding(15);

  var line = d3
    .line()
    .curve(d3.curveBasis)
    .x(function (d) {
      return x(d.year);
    })
    .y(function (d) {
      return y(d.MPG);
    });

  var svg3 = d3
    .select("#lineChart")
    .append("svg")
    .attr("width", width + margin3.left + margin3.right)
    .attr("height", height + margin3.top + margin3.bottom)
    .append("g")
    .attr("transform", "translate(" + margin3.left + "," + margin3.top + ")");

  var countries = color.domain().map(function (name) {
    return {
      name: name,
      values: data.map(function (d) {
        return {
          year: +d.year,
          MPG: +d[name],
        };
      }),
    };
  });

  x.domain(
    d3.extent(data, function (d) {
      return d.year;
    })
  );

  y.domain([
    d3.min(countries, function (c) {
      return d3.min(c.values, function (v) {
        return v.MPG;
      });
    }),
    d3.max(countries, function (c) {
      return d3.max(c.values, function (v) {
        return v.MPG;
      });
    }),
  ]);

  var legend = svg3
    .selectAll("g")
    .data(countries)
    .enter()
    .append("g")
    .attr("class", "legend");

  legend
    .append("rect")
    .attr("x", 20)
    .attr("y", function (d, i) {
      return i * 20;
    })
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", function (d) {
      return color(d.name);
    });
  legend
    .append("text")
    .attr("x", function (d) {
      return 40;
    })
    .attr("y", function (d, i) {
      return i * 20 + 9;
    })
    .text(function (d) {
      return d.name;
    });

  var xAxisG = svg3
    .append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  xAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 60)
    .attr("x", innerWidth / 2)
    .attr("fill", "black")
    .text(LC_xAxisLabelText);

  var yAxisG = svg3.append("g").attr("class", "y axis").call(yAxis);
  yAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", -60)
    .attr("x", -innerHeight / 2)
    .attr("fill", "black")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text(LC_yAxisLabelText);

  var city = svg3
    .selectAll(".city")
    .data(countries)
    .enter()
    .append("g")
    .attr("class", "city");

  city
    .append("path")
    .attr("class", "line")
    .attr("d", function (d) {
      return line(d.values);
    })
    .style("stroke", function (d) {
      return color(d.name);
    })
    .style("stroke-width", 5);

  var mouseG = svg3.append("g").attr("class", "mouse-over-effects");

  mouseG
    .append("path") // this is the black vertical line to follow mouse
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  var lines = document.getElementsByClassName("line");

  var mousePerLine = mouseG
    .selectAll(".mouse-per-line")
    .data(countries)
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");

  mousePerLine
    .append("circle")
    .attr("r", 7)
    .style("stroke", function (d) {
      return color(d.name);
    })
    .style("fill", "none")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  mousePerLine.append("text").attr("transform", "translate(10,3)");

  mouseG
    .append("svg:rect") // append a rect to catch mouse movements on canvas
    .attr("width", width) // can't catch mouse events on a g element
    .attr("height", height)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseout", function () {
      // on mouse out hide line, circles and text
      d3.select(".mouse-line").style("opacity", "0");
      d3.selectAll(".mouse-per-line circle").style("opacity", "0");
      d3.selectAll(".mouse-per-line text").style("opacity", "0");
    })
    .on("mouseover", function () {
      // on mouse in show line, circles and text
      d3.select(".mouse-line").style("opacity", "1");
      d3.selectAll(".mouse-per-line circle").style("opacity", "1");
      d3.selectAll(".mouse-per-line text").style("opacity", "1");
    })
    .on("mousemove", function () {
      // mouse moving over canvas
      var mouse = d3.mouse(this);
      d3.select(".mouse-line").attr("d", function () {
        var d = "M" + mouse[0] + "," + height;
        d += " " + mouse[0] + "," + 0;
        return d;
      });

      d3.selectAll(".mouse-per-line").attr("transform", function (d, i) {
        //console.log(width / mouse[0]);
        var xDate = x.invert(mouse[0]),
          bisect = d3.bisector(function (d) {
            return d.date;
          }).right;
        idx = bisect(d.values, xDate);

        var beginning = 0,
          end = lines[i].getTotalLength(),
          target = null;

        while (true) {
          target = Math.floor((beginning + end) / 2);
          pos = lines[i].getPointAtLength(target);
          if ((target === end || target === beginning) && pos.x !== mouse[0]) {
            break;
          }
          if (pos.x > mouse[0]) end = target;
          else if (pos.x < mouse[0]) beginning = target;
          else break; //position found
        }

        d3.select(this).select("text").text(y.invert(pos.y).toFixed(2));

        return "translate(" + mouse[0] + "," + pos.y + ")";
      });
    });
};

d3.csv("DS/a1-cars.csv").then((data) => {
  //Finding Unique Years
  let years = d3
    .map(data, (d) => {
      return d.ModelYear;
    })
    .keys();
  //converting string array to array of objects
  years = years.map((y) => {
    return { year: y };
  });
  //Finding mean of MPG Per year for different countries
  years = years.map((y) => {
    yearDataAmerican = data.filter((d) => {
      return d.ModelYear == y.year && d.Origin == "American";
    });
    const yearAmericanMean = d3.mean(
      yearDataAmerican.map((d) => {
        return d.MPG;
      })
    );
    yearDataEuropean = data.filter((d) => {
      return d.ModelYear == y.year && d.Origin == "European";
    });

    const yearEuropeanMean = d3.mean(
      yearDataEuropean.map((d) => {
        return d.MPG;
      })
    );

    yearDataJapanese = data.filter((d) => {
      return d.ModelYear == y.year && d.Origin == "Japanese";
    });

    const yearJapaneseMean = d3.mean(
      yearDataJapanese.map((d) => {
        return d.MPG;
      })
    );

    return {
      year: y.year,
      American: yearAmericanMean,
      Japanese: yearJapaneseMean,
      European: yearEuropeanMean,
    };
  });
  renderLineChart(years);
});
//let offsetX = document.getElementById("lineChart").offsetLeft();
//console.log(offsetX);

//#endregion
