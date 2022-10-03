export function drawpiechart(data) {
  //function to draw the pie chart
  const width = 450; //set chart sizing
  const height = 550;
  const radius = Math.min(width, 350) / 2;
  var svg = d3
    .select("#pie-chart") //make an svg tag in the HTML program
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("margin-top","20px");
  var g = svg
    .append("g") //setup the chart layout
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var myColor = d3.scaleOrdinal([
    "#90EE90",
    "#A7F432",
    "#299617",
    "#00563F",
    "#013220",
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
      return myColor(d.data.distribution);
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
    .attr("class", "title")
    .style("font-size","1.5em")
    .style("text-align","right");

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

  pie.colors(color);

  function tweenPie(b) {
    //function to determine the start/end location to animate the pie chart
    var i = d3.interpolate({ startAngle: Math.PI, endAngle: Math.PI }, b);
    return function (t) {
      return path(i(t));
    };
  }
}
