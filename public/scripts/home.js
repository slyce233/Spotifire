import { analyzePlaylist, analyzeTrack } from "./helpers.js";

$(document).ready(function () {
  $("#playlist-warning").hide();

  $("#analyze").on("click", function () {
    //function to analyze track playlist or album
    if ($("#input-field").val().substring(25, 33) === "playlist") {
      if ($(".track-info").css("visibility") == "visible") {
        $(".track-info").css("visibility", "hidden");
      }
      $(".bar-chart").html(``);
      $(".pie-chart").html(``);
      $(".container").css("visibility", "visible");
      var playlistLink = $("#input-field").val();
      var playlistID = playlistLink.substring(34, playlistLink.length);

      analyzePlaylist(playlistLink, playlistID);
    } else if ($("#input-field").val().substring(25, 30) === "track") {
      if ($(".playlist-info").css("visibility") == "visible") {
        $(".playlist-info").css("visibility", "hidden");
        $("#bar-chart").css("visibility", "hidden");
        $("#pie-chart").css("visibility", "hidden");
      }
      $(".track-info").css("visibility", "visible");
      var trackLink = $("#input-field").val();
      var substring = trackLink.substring(31, trackLink.length);
      var re = /[^?]*/;
      var trackID = re.exec(substring)[0];

      analyzeTrack(trackLink, trackID);
    } else if ($("#input-field").val().substring(25, 30) === "album") {
      console.log("Album");
    } else {
      console.log("Error");
    }
  });
});
