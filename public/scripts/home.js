var songIDs = [];

$(document).ready(function () {
  $("#playlist-warning").hide();
  $("#get-playlist").on("click", function () {
    //function to start analyzing a playlist
    var playlistLink = $("#playlist-input-field").val();
    var playlistID = playlistLink.substring(34, playlistLink.length);
    if (
      playlistLink.substring(0, 34) !== "https://open.spotify.com/playlist/"
    ) {
      //make sure the input is a valid spotify playlist link
      $("#playlist-warning").show();
      console.log("err");
    } else {
      $.ajax({
        //get playlist JSON information
        url: "/getPlaylist",
        type: "GET",
        data: {
          playlistID: playlistID,
        },
      }).done(function (data) {
        console.log(data);
        $("#bar-chart").html("");
        $("#pie-chart").html("");
        var songs = data.body.tracks.items;
        var playlistImageLink = data.body.images[0].url; //Image to be sent out
        songs.sort(compare);
        drawbarchart(songs.slice(0, 5)); //get the top 5 most popular songs and graph them
        var description = data.body.description;
        var followers = data.body.followers.total;
        var imageURL = data.body.images[0].url;

        let image = document.createElement("img"); //display the playlist image card/information
        image.setAttribute("src", imageURL);
        image.setAttribute(
          "style",
          "display: block;max-width:200px;max-height:200px;width: auto;height: auto;"
        );
        image.addEventListener("load", (e) => {
          $(".playlist-image").html(e.target);
          $("#playlist-description").text(
            "Description: " + description.substring(0, 150)
          );
          $("#playlist-followers").text("Followers: " + followers);
          $(".playlist-info").attr("style", "visibility:visible");
        });
        for (let i = 0; i < songs.length; i++) {
          songIDs.push(songs[i].track.id);
        }
        console.log(songIDs);

        var popDist = [
          { distribution: "0%-20%", popularity: 0 },
          { distribution: "21%-40%", popularity: 0 },
          { distribution: "41%-60%", popularity: 0 },
          { distribution: "61%-80%", popularity: 0 },
          { distribution: "81%-100%", popularity: 0 },
        ];
        $.each(songs, function (index, song) {
          //determine the distribution of song popularity of a playlist
          if (song.track.popularity <= 20) {
            popDist[0].popularity++;
          } else if (song.track.popularity <= 40) {
            popDist[1].popularity++;
          } else if (song.track.popularity <= 60) {
            popDist[2].popularity++;
          } else if (song.track.popularity <= 80) {
            popDist[3].popularity++;
          } else if (song.track.popularity <= 100) {
            popDist[4].popularity++;
          }

          console.log(song.track.name + ": " + song.track.popularity);
        });
        popDist[0].popularity /= songs.length;
        popDist[1].popularity /= songs.length;
        popDist[2].popularity /= songs.length;
        popDist[3].popularity /= songs.length;
        popDist[4].popularity /= songs.length;
        console.log(popDist);
        console.log(playlistImageLink);

        var empty = [];
        $.each(popDist, function (index, data) {
          //find any distributions that have no data in them
          if (data.popularity == 0) {
            empty.push(index);
          }
        });
        empty.reverse();
        $.each(empty, function (index, data) {
          //clean up popularity distibution if any valuus are empty
          popDist.splice(data, 1);
        });
        drawpiechart(popDist);
      });
      $("#playlist-warning").hide();
    }
  });
});
function compare(a, b) {
  //function used to compare 2 popularity values because javascript comparisons suck
  if (a.track.popularity < b.track.popularity) {
    return 1;
  }
  if (a.track.popularity > b.track.popularity) {
    return -1;
  }
  return 0;
}

function drawbarchart(data) {
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

function drawpiechart(data) {
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
