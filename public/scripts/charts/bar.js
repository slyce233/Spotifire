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
  const width = 400;
  const height = 450;
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
    .attr("height", height + 100)
    .style("margin-top","20px");
  svg
    .append("text") //set the title
    .attr("x", width / 2)
    .attr("y", margin / 1.5)
    .attr("text-anchor", "middle")
    .attr("class", "title")
    .style("font-size","1.5em")
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
