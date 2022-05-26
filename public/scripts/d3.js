export function compare(a, b) {
  //function used to compare 2 popularity values because javascript comparisons suck
  if (a.track.popularity < b.track.popularity) {
    return 1;
  }
  if (a.track.popularity > b.track.popularity) {
    return -1;
  }
  return 0;
}

export function drawbarchart(data) {
  //function to draw the bar graph
  if (data.length === 1) {
    //get title based on how maany songs in the playlist
    var title = "Highest Rated Song";
  } else {
    var title = `Top ${data.length} Highest Rating Songs`;
  }
  const margin = 50; //set chart sizing
  const width = 500;
  const height = 550;
  const chartWidth = width - 2 * margin;
  const chartHeight = height - 2 * margin;
  let maxVal =
    Math.ceil(Math.max(...data.map((val) => val.track.popularity)) / 10) * 10;
  let minVal =
    Math.floor(Math.min(...data.map((val) => val.track.popularity)) / 10) * 10 -
    1;
  const yScale = d3
    .scaleLinear() //set y scale
    .domain([minVal, maxVal])
    .range([chartHeight, 0]);
  const xScale = d3
    .scaleBand() //set x scale
    .domain(data.map((val) => val.track.name))
    .range([0, chartWidth])
    .padding(0.3);
  const svg = d3
    .select("#bar-chart") //make an svg tag in the HTML program
    .append("svg")
    .attr("width", width)
    .attr("height", height + 100);
  svg
    .append("text") //set the title
    .attr("x", width / 2)
    .attr("y", margin / 1.5)
    .attr("text-anchor", "middle")
    .attr("class", "title")
    .text(title);
  const g = svg
    .append("g") //setup the chart layout
    .attr("transform", `translate(${margin}, ${margin})`);
  g.append("g").attr("class", "white").call(d3.axisLeft(yScale));
  g.append("text") //set the x-axis label
    .attr("x", -margin / 2)
    .attr("y", chartHeight + margin / 1.5)
    .attr("text-anchor", "middle")
    .text("Song:");
  g.append("text") //set the y-axis label
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - width / 2 + margin)
    .attr("y", -35)
    .attr("text-anchor", "middle")
    .text("Rating (%)");

  g.append("g") //set the x-axis values
    .attr("transform", `translate(0, ${chartHeight})`)
    .attr("id", "x-text")
    .attr("class", "white")
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("y", 10)
    .attr("x", 10)
    .attr("dy", ".35em")
    .attr("transform", "rotate(45)")
    .style("text-anchor", "start")
    .style("fill", "white");
  const bars = g
    .selectAll("rect") //set the bars for the data
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (val) => xScale(val.track.name))
    .attr("y", (val) => chartHeight)
    .attr("width", xScale.bandwidth())
    .attr("height", (val) => 0)
    .attr("fill", "#1DB954")
    .attr("opacity", (val) => val.track.popularity / (maxVal / 1.5));
  bars
    .transition() //make the graph do a pretty animation
    .ease(d3.easeCubic)
    .attr("height", (val) => chartHeight - yScale(val.track.popularity))
    .attr("y", (val) => yScale(val.track.popularity))
    .duration(1000)
    .delay((data, index) => index * 50);
}

export function drawpiechart(data) {
  //function to draw the pie chart
  const width = 500; //set chart sizing
  const height = 550;
  const radius = Math.min(width, 350) / 2;
  var svg = d3
    .select("#pie-chart") //make an svg tag in the HTML program
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  var g = svg
    .append("g") //setup the chart layout
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var color = d3.scaleOrdinal([
    "#6050DC",
    "#D52DB7",
    "#FF2E7E",
    "#FF6B45",
    "#FFAB05",
  ]); //set the pie chart colours

  var pie = d3.pie().value(function (d) {
    //get the data for the pie chart
    return d.popularity;
  });

  var path = d3
    .arc() //get the path of the pie chart
    .outerRadius(radius - 10)
    .innerRadius(100);

  var label = d3
    .arc() //get the label location of the pie chart data
    .outerRadius(radius)
    .innerRadius(radius - 80);

  var arc = g
    .selectAll(".arc") //put the data on the pie chart
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc");
  arc
    .append("path")
    .attr("fill", function (d) {
      return color(d.data.distribution);
    })
    .transition()
    .ease(d3.easeCubic)
    .duration(1000)
    .attrTween("d", tweenPie);

  svg
    .append("g") //set the title
    .attr("transform", "translate(" + (width / 2 - 220) + "," + 35 + ")")
    .append("text")
    .text("Popularity Distribution")
    .attr("class", "title");

  arc
    .append("text") //set the data labels
    .transition()
    .duration(1000)
    .attr("transform", function (d) {
      return `translate(${
        label.centroid(d)[0] * 1.5
      }, ${label.centroid(d)[1] * 1.5})`;
    })
    .text(function (d) {
      return d.data.distribution;
    });

  function tweenPie(b) {
    //function to determine the start/end location to animate the pie chart
    var i = d3.interpolate({ startAngle: Math.PI, endAngle: Math.PI }, b);
    return function (t) {
      return path(i(t));
    };
  }
}

/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/// mthh - 2017 /////////////////////////////////////////
// Inspired by the code of alangrafu and Nadieh Bremer //
// (VisualCinnamon.com) and modified for d3 v4 //////////
/////////////////////////////////////////////////////////

const max = Math.max;
const sin = Math.sin;
const cos = Math.cos;
const HALF_PI = Math.PI / 2;

export function RadarChart(parent_selector, data, options) {
  //Wraps SVG text - Taken from http://bl.ocks.org/mbostock/7555321
  const wrap = (text, width) => {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.4, // ems
        y = text.attr("y"),
        x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", dy + "em");

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }; //wrap

  const cfg = {
    w: 600, //Width of the circle
    h: 600, //Height of the circle
    margin: { top: 20, right: 20, bottom: 20, left: 20 }, //The margins of the SVG
    levels: 3, //How many levels or inner circles should there be drawn
    maxValue: 0, //What is the value that the biggest circle will represent
    labelFactor: 1.25, //How much farther than the radius of the outer circle should the labels be placed
    wrapWidth: 60, //The number of pixels after which a label needs to be given a new line
    opacityArea: 0.35, //The opacity of the area of the blob
    dotRadius: 4, //The size of the colored circles of each blog
    opacityCircles: 0.1, //The opacity of the circles of each blob
    strokeWidth: 2, //The width of the stroke around each blob
    roundStrokes: false, //If true the area and stroke will follow a round path (cardinal-closed)
    color: d3.scaleOrdinal(d3.schemeCategory10), //Color function,
    format: ".2%",
    unit: "",
    legend: false,
  };

  //Put all of the options into a variable called cfg
  if ("undefined" !== typeof options) {
    for (var i in options) {
      if ("undefined" !== typeof options[i]) {
        cfg[i] = options[i];
      }
    } //for i
  } //if

  //If the supplied maxValue is smaller than the actual one, replace by the max in the data
  // var maxValue = max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
  let maxValue = 0;
  for (let j = 0; j < data.length; j++) {
    for (let i = 0; i < data[j].axes.length; i++) {
      data[j].axes[i]["id"] = data[j].name;
      if (data[j].axes[i]["value"] > maxValue) {
        maxValue = data[j].axes[i]["value"];
      }
    }
  }
  maxValue = max(cfg.maxValue, maxValue);

  const allAxis = data[0].axes.map((i, j) => i.axis), //Names of each axis
    total = allAxis.length, //The number of different axes
    radius = Math.min(cfg.w / 2, cfg.h / 2), //Radius of the outermost circle
    Format = d3.format(cfg.format), //Formatting
    angleSlice = (Math.PI * 2) / total; //The width in radians of each "slice"

  //Scale for the radius
  const rScale = d3.scaleLinear().range([0, radius]).domain([0, maxValue]);

  /////////////////////////////////////////////////////////
  //////////// Create the container SVG and g /////////////
  /////////////////////////////////////////////////////////
  const parent = d3.select(parent_selector);
  //Remove whatever chart with the same id/class was present before
  parent.select("svg").remove();

  //Initiate the radar chart SVG
  let svg = parent
    .append("svg")
    .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
    .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
    .attr("class", "radar");

  //Append a g element
  let g = svg
    .append("g")
    .attr(
      "transform",
      "translate(" +
        (cfg.w / 2 + cfg.margin.left) +
        "," +
        (cfg.h / 2 + cfg.margin.top) +
        ")"
    );

  /////////////////////////////////////////////////////////
  ////////// Glow filter for some extra pizzazz ///////////
  /////////////////////////////////////////////////////////

  //Filter for the outside glow
  let filter = g.append("defs").append("filter").attr("id", "glow"),
    feGaussianBlur = filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "coloredBlur"),
    feMerge = filter.append("feMerge"),
    feMergeNode_1 = feMerge.append("feMergeNode").attr("in", "coloredBlur"),
    feMergeNode_2 = feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  /////////////////////////////////////////////////////////
  /////////////// Draw the Circular grid //////////////////
  /////////////////////////////////////////////////////////

  //Wrapper for the grid & axes
  let axisGrid = g.append("g").attr("class", "axisWrapper");

  //Draw the background circles
  axisGrid
    .selectAll(".levels")
    .data(d3.range(1, cfg.levels + 1).reverse())
    .enter()
    .append("circle")
    .attr("class", "gridCircle")
    .attr("r", (d) => (radius / cfg.levels) * d)
    .style("fill", "#CDCDCD")
    .style("stroke", "#CDCDCD")
    .style("fill-opacity", cfg.opacityCircles)
    .style("filter", "url(#glow)");

  //Text indicating at what % each level is
  axisGrid
    .selectAll(".axisLabel")
    .data(d3.range(1, cfg.levels + 1).reverse())
    .enter()
    .append("text")
    .attr("class", "axisLabel")
    .attr("x", 4)
    .attr("y", (d) => (-d * radius) / cfg.levels)
    .attr("dy", "0.4em")
    .style("font-size", "10px")
    .attr("fill", "#737373")
    .text((d) => Format((maxValue * d) / cfg.levels) + cfg.unit);

  /////////////////////////////////////////////////////////
  //////////////////// Draw the axes //////////////////////
  /////////////////////////////////////////////////////////

  //Create the straight lines radiating outward from the center
  var axis = axisGrid
    .selectAll(".axis")
    .data(allAxis)
    .enter()
    .append("g")
    .attr("class", "axis");
  //Append the lines
  axis
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr(
      "x2",
      (d, i) => rScale(maxValue * 1.02) * cos(angleSlice * i - HALF_PI)
    )
    .attr(
      "y2",
      (d, i) => rScale(maxValue * 1.02) * sin(angleSlice * i - HALF_PI)
    )
    .attr("class", "line")
    .style("stroke", "white")
    .style("stroke-width", "2px");

  //Append the labels at each axis
  axis
    .append("text")
    .attr("class", "legend")
    .style("font-size", "11px")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr(
      "x",
      (d, i) =>
        rScale(maxValue * cfg.labelFactor) * cos(angleSlice * i - HALF_PI)
    )
    .attr(
      "y",
      (d, i) =>
        rScale(maxValue * cfg.labelFactor) * sin(angleSlice * i - HALF_PI)
    )
    .text((d) => d)
    .call(wrap, cfg.wrapWidth);

  /////////////////////////////////////////////////////////
  ///////////// Draw the radar chart blobs ////////////////
  /////////////////////////////////////////////////////////

  //The radial line function
  const radarLine = d3
    .radialLine()
    .curve(d3.curveLinearClosed)
    .radius((d) => rScale(d.value))
    .angle((d, i) => i * angleSlice);

  if (cfg.roundStrokes) {
    radarLine.curve(d3.curveCardinalClosed);
  }

  //Create a wrapper for the blobs
  const blobWrapper = g
    .selectAll(".radarWrapper")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "radarWrapper");

  //Append the backgrounds
  blobWrapper
    .append("path")
    .attr("class", "radarArea")
    .attr("d", (d) => radarLine(d.axes))
    .style("fill", (d, i) => cfg.color(i))
    .style("fill-opacity", cfg.opacityArea)
    .on("mouseover", function (d, i) {
      //Dim all blobs
      parent
        .selectAll(".radarArea")
        .transition()
        .duration(200)
        .style("fill-opacity", 0.1);
      //Bring back the hovered over blob
      d3.select(this).transition().duration(200).style("fill-opacity", 0.7);
    })
    .on("mouseout", () => {
      //Bring back all blobs
      parent
        .selectAll(".radarArea")
        .transition()
        .duration(200)
        .style("fill-opacity", cfg.opacityArea);
    });

  //Create the outlines
  blobWrapper
    .append("path")
    .attr("class", "radarStroke")
    .attr("d", function (d, i) {
      return radarLine(d.axes);
    })
    .style("stroke-width", cfg.strokeWidth + "px")
    .style("stroke", (d, i) => cfg.color(i))
    .style("fill", "none")
    .style("filter", "url(#glow)");

  //Append the circles
  blobWrapper
    .selectAll(".radarCircle")
    .data((d) => d.axes)
    .enter()
    .append("circle")
    .attr("class", "radarCircle")
    .attr("r", cfg.dotRadius)
    .attr("cx", (d, i) => rScale(d.value) * cos(angleSlice * i - HALF_PI))
    .attr("cy", (d, i) => rScale(d.value) * sin(angleSlice * i - HALF_PI))
    .style("fill", (d) => cfg.color(d.id))
    .style("fill-opacity", 0.8);

  /////////////////////////////////////////////////////////
  //////// Append invisible circles for tooltip ///////////
  /////////////////////////////////////////////////////////

  //Wrapper for the invisible circles on top
  const blobCircleWrapper = g
    .selectAll(".radarCircleWrapper")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "radarCircleWrapper");

  //Append a set of invisible circles on top for the mouseover pop-up
  blobCircleWrapper
    .selectAll(".radarInvisibleCircle")
    .data((d) => d.axes)
    .enter()
    .append("circle")
    .attr("class", "radarInvisibleCircle")
    .attr("r", cfg.dotRadius * 1.5)
    .attr("cx", (d, i) => rScale(d.value) * cos(angleSlice * i - HALF_PI))
    .attr("cy", (d, i) => rScale(d.value) * sin(angleSlice * i - HALF_PI))
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", function (d, i) {
      tooltip
        .attr("x", this.cx.baseVal.value - 10)
        .attr("y", this.cy.baseVal.value - 10)
        .transition()
        .style("display", "block")
        .text(Format(d.value) + cfg.unit);
    })
    .on("mouseout", function () {
      tooltip.transition().style("display", "none").text("");
    });

  const tooltip = g
    .append("text")
    .attr("class", "tooltip")
    .attr("x", 0)
    .attr("y", 0)
    .style("font-size", "12px")
    .style("display", "none")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em");

  if (cfg.legend !== false && typeof cfg.legend === "object") {
    let legendZone = svg.append("g");
    let names = data.map((el) => el.name);
    if (cfg.legend.title) {
      let title = legendZone
        .append("text")
        .attr("class", "title")
        .attr(
          "transform",
          `translate(${cfg.legend.translateX},${cfg.legend.translateY})`
        )
        .attr("x", cfg.w - 70)
        .attr("y", 10)
        .attr("font-size", "12px")
        .attr("fill", "#404040")
        .text(cfg.legend.title);
    }
    let legend = legendZone
      .append("g")
      .attr("class", "legend")
      .attr("height", 100)
      .attr("width", 200)
      .attr(
        "transform",
        `translate(${cfg.legend.translateX},${cfg.legend.translateY + 20})`
      );
    // Create rectangles markers
    legend
      .selectAll("rect")
      .data(names)
      .enter()
      .append("rect")
      .attr("x", cfg.w - 65)
      .attr("y", (d, i) => i * 20)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", (d, i) => cfg.color(i));
    // Create labels
    legend
      .selectAll("text")
      .data(names)
      .enter()
      .append("text")
      .attr("x", cfg.w - 52)
      .attr("y", (d, i) => i * 20 + 9)
      .attr("font-size", "11px")
      .attr("fill", "#737373")
      .text((d) => d);
  }
  return svg;
}
