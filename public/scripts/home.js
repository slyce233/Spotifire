import { analyzePlaylist, analyzeTrack } from "./helpers.js";

$(document).ready(function () {
  $("#playlist-warning").hide();

  $("#analyze").on("click", function () {
    //function to analyze track playlist or album
    if ($("#input-field").val().substring(25, 33) === "playlist") {
      var playlistLink = $("#input-field").val();
      var playlistID = playlistLink.substring(34, playlistLink.length);

      analyzePlaylist(playlistLink, playlistID);
    } else if ($("#input-field").val().substring(25, 30) === "track") {
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
