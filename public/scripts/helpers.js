import { compare, drawbarchart, drawpiechart, RadarChart } from "./d3.js";
var songIDs = [];

export function analyzePlaylist(playlistLink, playlistID) {
  if (playlistLink.substring(0, 34) !== "https://open.spotify.com/playlist/") {
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
        $("#bar-chart").css("visibility","visible");
        $("#pie-chart").css("visibility","visible");
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
  }
}

export function analyzeTrack(trackLink, trackID) {
  if (trackLink.substring(0, 31) !== "https://open.spotify.com/track/") {
    //make sure the input is a valid spotify track link
    $("#playlist-warning").show();
    console.log("err");
  } else {
    $.ajax({
      //get playlist JSON information
      url: "/getTrackAudioFeatures",
      type: "GET",
      data: {
        trackID: trackID,
      },
    }).done(function (data) {
      console.log(data.body);
      var acousticness = data.body.acousticness;
      var danceability = data.body.danceability;
      var energy = data.body.energy;
      var instrumentalness = data.body.instrumentalness;
      var liveness = data.body.liveness;
      var speechiness = data.body.speechiness;
      var valence = data.body.valence;
      var margin = { top: 50, right: 80, bottom: 50, left: 80 },
        width =
          Math.min(700, window.innerWidth / 4) - margin.left - margin.right,
        height = Math.min(
          width,
          window.innerHeight - margin.top - margin.bottom
        );

      var data = [
        {
          name: "Track 1",
          axes: [
            { axis: "acousticness", value: acousticness },
            { axis: "danceability", value: danceability },
            { axis: "energy", value: energy },
            { axis: "instrumentalness", value: instrumentalness },
            { axis: "liveness", value: liveness },
            { axis: "speechiness", value: speechiness },
            { axis: "valence", value: valence },
          ],
          color: "#26AF32",
        },
        // {
        //   name: "Track 2",
        //   axes: [
        //     { axis: "acousticness", value: 0.000282 },
        //     { axis: "danceability", value: 0.908 },
        //     { axis: "energy", value: 0.621 },
        //     { axis: "instrumentalness", value: 0.0000539 },
        //     { axis: "liveness", value: 0.0958 },
        //     { axis: "speechiness", value: 0.102 },
        //     { axis: "valence", value: 0.421 },
        //   ],
        //   color: "#762712",
        // },
      ];

      var radarChartOptions = {
        w: 350,
        h: 350,
        margin: margin,
        levels: 5,
        dotRadius: 3,
        roundStrokes: false,
        color: d3.scaleOrdinal().range(["#26AF32"]),
        format: ".2f",
        // legend: { title: "Track 1 vs Track 2", translateX: 100, translateY: 40 },
      };

      // Draw the chart, get a reference the created svg element :
      RadarChart(".radarChart", data, radarChartOptions);

      $.ajax({
        //get playlist JSON information
        url: "/getTrack",
        type: "GET",
        data: {
          trackID: trackID,
        },
      }).done( function(data){
        var image = data.body.album.images[1].url;
        var name = data.body.name;
        var artist = data.body.artists[0].name;
        var popularity = data.body.popularity;
        var duration = data.body.duration_ms;
        console.log(data.body);
        $(".track-info-text").html(`
        <img class="track-image" src=`+ image + `>
        <p>Track Name: `+ name + `</p>
        <p>Artist: `+ artist + `</p>
        <p>Popularity: `+ popularity + `</p>
        <p>Duration: `+ duration + ` </p>`)
      })
    });


  } 

}
