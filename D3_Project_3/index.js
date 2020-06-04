//#region Scatter Plot Subject Vs Year
//https://codepen.io/meerkat00/pen/LQNYrv
var margin1 = { top: 0, right: 0, bottom: 90, left: 150 };

var zoom = d3.zoom;
const svg1 = d3.select("#cont1").select("svg");
var width = +svg1.attr("width"),
  height = +svg1.attr("height");
const innerWidth = width - margin1.left - margin1.right;
const innerHeight = height - margin1.top - margin1.bottom;
//actors
var data1;
var selectedActors = [];
var Actors = [];

const renderScatterPlot = (data) => {
  actors = d3
    .map(data, (d) => d.Actor)
    .keys()
    .map((actor) => {
      var actorName = actor.split(",", 2);
      var name = actorName[1] + " " + actorName[0];
      return {
        name: name,
        value: actor,
        selected: false,
      };
    });
  Actors = actors;
  var xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.Year))
    .range([0, width - (margin1.left + margin1.right)]);
  var yScale = d3
    .scalePoint()
    .domain(d3.map(data, (d) => d.Subject).keys())
    .range([30, height - margin1.top - margin1.bottom - 30]);
  var color = d3.scaleOrdinal().range(
    d3.schemeTableau10.map(function (c) {
      c = d3.rgb(c);
      c.opacity = 1;
      return c;
    })
  );

  const g = svg1
    .append("g")
    .attr("transform", `translate(${margin1.left},${margin1.top})`);

  const xAxis = d3.axisBottom(xScale).ticks(15); //.tickSize(-innerHeight).tickPadding(1);
  const yAxis = d3.axisLeft(yScale); //.tickSize(-innerWidth).tickPadding(15);

  const yAxisG = g.append("g").call(yAxis);

  yAxisG.selectAll(".domain").remove();

  const xAxisG = g
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(0,${innerHeight})`)
    .attr("width", width - margin1.left)
    .selectAll("text")
    .attr("text-anchor", "start")
    .attr("x", -60)
    .attr("transform", "rotate(-90)");

  xAxisG.select(".domain").remove();
  // Chart Title
  xAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 80)
    .attr("x", innerWidth / 2)
    .attr("fill", "black")
    .text("Release Year");

  //Title text
  // g.append("text")
  //   .attr("class", "title")
  //   .attr("y", -10)
  //   .attr("x", innerWidth / 2)
  //   .attr("text-anchor", "middle")
  //   .text("Plote Title");

  renderCircles = (data) => {
    if (selectedActors.length !== 0) {
      data = data.filter((d) => {
        if (selectedActors.find((actor) => actor === d.Actor)) {
          return d;
        } else {
          return null;
        }
      });
    }
    const circles = g.selectAll("circle").data(data, (d) => d.Title);
    circles
      .enter()
      .append("circle")
      .attr("cy", (d) => yScale(d.Subject))
      .attr("cx", (d) => xScale(d.Year))
      .style("fill", "Red")
      .attr("id", (d) => d.Title)
      .transition()
      .duration(1000)
      .attr("r", 5);
    circles
      .transition()
      .duration(500)
      .attr("r", 20)
      .transition()
      .duration(500)
      .attr("r", 5);

    circles.exit().transition().duration(1000).attr("r", 0);
  };

  const renderActors = (actors) => {
    const actorsDiv = d3
      .select("#actors")
      .selectAll("label")
      .data(actors, (d) => d.value);
    actorsDiv
      .enter()
      .append("label")
      .text((d) => d.name)

      .on("click", (d) => {
        if (d.selected) {
          selectedActors = selectedActors.filter((actor) => {
            if (actor == d.value) {
              return false;
            } else {
              return true;
            }
          });
          Actors.find((actor) => actor == d).selected = false;
          renderCircles(data1);
          renderActors(Actors);
        } else {
          selectedActors.push(d.value);
          Actors.find((actor) => actor == d).selected = true;
          renderCircles(data1);
          renderActors(Actors);
        }
      })
      .merge(actorsDiv)
      .classed("actorLabel", (d) => !d.selected)
      .classed("actorSelected", (d) => d.selected);
  };

  d3.select("#actorsContainer input").on("click", () => {
    Actors.map((d) => {
      d.selected = false;
    });
    selectedActors = [];
    renderCircles(data);
    renderActors(Actors);
  });

  const ResetAllActors = () => {};
  renderCircles(data);
  renderActors(Actors);
};

d3.csv("DS/films.csv").then((data) => {
  data.map((d) => {
    d.Year = new Date(+d.Year, 0, 1);
    d.Popularity = +d.Popularity;
    d.Length = +d.Length;
  });
  data1 = data;
  renderScatterPlot(data);
});

//#endregion

//#region Popularity of Subject Over Years
const renderLineChart = (data) => {
  const svg = d3.select("#cont2").select("svg");
  var margin2 = {
      top: 20,
      right: 80,
      bottom: 90,
      left: 100,
    },
    width = +svg.attr("width") - margin2.left - margin2.right,
    height = +svg.attr("height") - margin2.top - margin2.bottom;

  var svg3 = svg
    .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

  var x = d3.scaleLinear().range([0, width]);

  var y = d3.scaleLinear().range([height, 0]);

  var color = d3
    .scaleOrdinal()
    .domain(Object.keys(data[0]).filter((key) => key != "year"))
    .range(d3.schemeCategory10);

  const xAxis = d3.axisBottom(x).ticks(20).tickFormat(d3.format("0"));
  //.tickSize(-20); //.tickPadding(15);

  const yAxis = d3.axisLeft(y); //.tickSize(-innerWidth).tickPadding(15);

  var line = d3
    .line()
    .curve(d3.curveBasis)
    .x(function (d) {
      return x(d.year);
    })
    .y(function (d) {
      return y(d.Popularity);
    });

  var svg3 = d3
    .select("#cont2")
    .select("svg")
    .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

  var Subject = color.domain().map(function (name) {
    return {
      name: name,
      values: data.map(function (d) {
        return {
          year: +d.year,
          Popularity: +d[name],
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
    d3.min(Subject, function (c) {
      return d3.min(c.values, function (v) {
        return v.Popularity;
      });
    }),
    d3.max(Subject, function (c) {
      return d3.max(c.values, function (v) {
        return v.Popularity;
      });
    }),
  ]);

  var legend = svg3
    .selectAll("g")
    .data(Subject)
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
    .selectAll("text")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "start")
    .attr("x", -70);

  xAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 85)
    .attr("x", width / 2)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Years");

  var yAxisG = svg3.append("g").attr("class", "y axis").call(yAxis);
  yAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", -60)
    .attr("x", -height / 2)
    .attr("fill", "black")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Number of films");

  var city = svg3
    .selectAll(".city")
    .data(Subject)
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
    .data(Subject)
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

d3.csv("DS/films.csv").then((data) => {
  //Finding Unique Years
  let years = d3
    .map(data, (d) => {
      return d.Year;
    })
    .keys();
  //converting string array to array of objects
  years = years.map((y) => {
    return { year: y };
  });
  //finding subjects
  let Subjects = d3
    .map(data, (d) => {
      return d.Subject;
    })
    .keys();

  //Finding mean of Popularity Per year for different Subjects

  Subjects.map((Subject) => {
    let lastMean = 0;
    years.map((y) => {
      yearData = data.filter((d) => {
        return d.Year == y.year && d.Subject == Subject;
      });
      mean = yearData.length;
      //d3.count(
      //   (d) => d.Year
      //   // yearData.map((d) => {
      //   //   return d.Popularity;
      //   // })
      // );
      y[Subject] = mean === undefined ? lastMean : mean;
      y.year = +y.year;
      lastMean = mean === undefined ? lastMean / 2 : mean;
    });
  });

  //sorting data by year
  years.sort((x, y) => {
    return d3.ascending(x.year, y.year);
  });
  renderLineChart(years);
});
//#endregion

//#region  Use of word in film titles

convertName = (name) => {
  tempName = name.split(",", 2);
  return tempName[1] + " " + tempName[0];
};

renderWordCloud = (data) => {
  var margin3 = {
    top: 20,
    right: 80,
    bottom: 90,
    left: 100,
  };
  const svgwc = d3
    .select("#cont3")
    .select("svg")
    .append("g")
    .attr("transform", "translate(" + margin3.left + "," + margin3.top + ")")
    .style("cursor", "pointer");

  var widthwc = +svgwc.attr("width") - margin3.left - margin3.right,
    heightwc = +svgwc.attr("height") - margin3.top - margin3.bottom;
  var wordcloud = svgwc
    .append("g")
    .attr("class", "wordcloud")
    .attr("transform", "translate(" + 280 + "," + 300 + ")");

  //defining layout
  var layout = d3.layout
    .cloud()
    .words(data)
    .rotate(0)
    .size([1000, 900])
    .fontSize((d) => d.count * 3)
    .text((d) => d.word)
    .spiral("archimedean")
    .on("end", draw)
    .start();
  const renderMovies = (data) => {
    var films = d3
      .select("#filmsDiv")
      .selectAll("p")
      .data(data, (d) => d.Title);
    films
      .enter()
      .append("p")
      .text(
        (d) =>
          `${d.Title} was released in year ${d.Year} directed by ${convertName(
            d.Director
          )} and starring ${convertName(d.Actor)} and ${convertName(d.Actress)}`
      )
      .classed("moviepara", true);
    films.exit().remove();
  };
  function draw(words) {
    wordcloud
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .attr("class", "wctext") //
      .style("font-size", function (d) {
        return d.size + "px";
      })
      //.style("fill", "black")
      .attr("text-anchor", "middle")
      .attr("transform", function (d) {
        return "translate(" + [d.x, d.y] + ")rotate(0)";
      })
      .text(function (d) {
        return d.text;
      })
      .on("click", (d) => {
        renderMovies(d.movies);
      });
  }

  var xScale = d3.scaleOrdinal().range([0, width]).domain(["hello", "this"]);
  const xAxis = d3.axisBottom(xScale);

  svgwc
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("font-size", "20px")
    .style("fill", "red")
    .style("font", "sans-serif");
};

d3.csv("DS/films.csv").then((data) => {
  words = [];
  data.map((d) => {
    sentence = d.Title.replace("-", "")
      .replace("&", "")
      .replace(",", "")
      .replace(" a ", " ")
      .replace(" The ", " ")
      .replace(" of ", " ")
      .replace(" to ", " ")
      .replace(" for ", " ")
      .replace("The", " ")
      .replace("the", " ")
      .replace(".", "")
      .split(" ");
    sentence.map((word) => {
      index = words.findIndex((wd) => wd.word === word);
      if (index != -1) {
        words[index].count += 1;
        words[index].movies.push(d);
      } else {
        words.push({ word: word, count: 1, movies: [d] });
      }
    });
  });
  renderWordCloud(words.filter((w) => w.count > 3 && w.word.length > 2));
});

//#endregion
