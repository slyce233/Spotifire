// import { play } from "./helpers.js";
$(document).ready(function () {
  $.ajax({
    //get JSON information
    url: "/getMe",
    type: "GET",
  }).done(function (data) {
    var displayName = data.body.display_name;
    var email = data.body.email;
    var id = data.body.id;
    var followers = data.body.followers.total;
    var image = data.body.images[0].url;
    $(".account-card").html(
      `
    <img class="display-picture" src="` +
        image +
        `" alt="Display Picture" style="width:100%">
      <div class="text-area">
          <p class='display-name'></p>
          <p class="id"></p>
          <p class="email"></p>
          <p class="followers"></p>
      </div>`
    );

    $(".display-name").text("Display Name: " + displayName);
    $(".email").text("Email: " + email);
    $(".id").text("Id: " + id);
    $(".followers").text("Followers: " + followers);
  });

  var topTrackIds = [];
  var topTrackNames = [];
  var topTrackArtists = [];
  var topTrackImages = [];
  var songDetails = [];
  var ids = [
    "pl0",
    "pl1",
    "pl2",
    "pl3",
    "pl4",
    "pl5",
    "pl6",
    "pl7",
    "pl8",
    "pl9",
  ];

  $.ajax({
    //get JSON information
    url: "/getTopTracks",
    type: "GET",
    data: {
      limit: 50,
      offset: 0,
    },
  }).done(function (data) {
    console.log("Top Tracks:");
    for (let i = 0; i < data.body.items.length; i++) {
      topTrackIds.push(data.body.items[i].id);
      topTrackNames.push(data.body.items[i].name);
      topTrackArtists.push(data.body.items[i].artists[0].name);
      topTrackImages.push(data.body.items[i].album.images[2].url);
      songDetails.push({
        name: data.body.items[i].name,
        artist: data.body.items[i].artists[0].name,
      });
      console.log(
        data.body.items[i].name,
        ":",
        data.body.items[i].artists[0].name
      );
    }
    console.log(songDetails);
    $(
      ".top-tracks-list"
    ).html(`<h1 class="track-grid-desc">Your Top 10 Tracks</h1>
    <div class="row">
          <div class="col">
            <table class="tracks-table-1">
            </table>
          </div>
          <div class="col">
            <table class="tracks-table-2">
            </table>
          </div>`);
    for (let i = 0; i < 5; i++) {
      $(".tracks-table-1").append(
        `<tr class="outer-row-1">
      <td class="track-image-td" rowspan="2"><img src = ` +
          topTrackImages[i] +
          ` class="top-track-image"></td>
      <td class="track-name-td">` +
          topTrackNames[i] +
          `</td>
      <td class="play-button-td"rowspan="2"><div id="` +
          ids[i] +
          `" class="botón" onclick="this.classList.toggle('active')">
        <div class="fondo" x="0" y="0" width="200" height="200"></div>
        <div class="icono" width="200" height="200">
          <div class="parte izquierda" x="0" y="0" width="200" height="200" fill="#fff"></div>
          <div class="parte derecha" x="0" y="0" width="200" height="200" fill="#fff"></div>
        </div>
        <div class="puntero"></div>
      </div></td>
    </tr>
    <tr class="outer-row-2">
      <td class="artist-name-td">` +
          topTrackArtists[i] +
          `</td>
    </tr>`
      );
    }
    for (let i = 5; i < 10; i++) {
      $(".tracks-table-2").append(
        `<tr class="outer-row-1">
      <td class="track-image-td" rowspan="2"><img src = ` +
          topTrackImages[i] +
          ` class="top-track-image"></td>
      <td class="track-name-td">` +
          topTrackNames[i] +
          `</td>
      <td class="play-button-td"rowspan="2"><div id="` +
          ids[i] +
          `" class="botón" onclick="this.classList.toggle('active')">
        <div class="fondo" x="0" y="0" width="200" height="200"></div>
        <div class="icono" width="200" height="200">
          <div class="parte izquierda" x="0" y="0" width="200" height="200" fill="#fff"></div>
          <div class="parte derecha" x="0" y="0" width="200" height="200" fill="#fff"></div>
        </div>
        <div class="puntero"></div>
      </div></td>
    </tr>
    <tr class="outer-row-2">
      <td class="artist-name-td">` +
          topTrackArtists[i] +
          `</td>
    </tr>`
      );
    }
  });

  var topArtistIds = [];
  var topArtistNames = [];
  var topArtistImages = [];
  $.ajax({
    //get JSON information
    url: "/getTopArtists",
    type: "GET",
  }).done(function (data) {
    // console.log("Top Artists: ");
    for (let i = 0; i < data.body.items.length; i++) {
      topArtistIds.push(data.body.items[i].id);
      topArtistNames.push(data.body.items[i].name);
      topArtistImages.push(data.body.items[i].images[0].url);
      // console.log(data.body.items[i].id, ":", data.body.items[i].name);
    }
    $(".artist-grid").html(
      `<h1 class="artist-grid-desc">Your Top 5 Artists</h1>
      <table class="artist-grid-table">
        <tr>
          <td>
            <div class = "top-artist-info">
              <img class="artist-image" src = "` +
        topArtistImages[0] +
        `">
              <p class="top-artist-name">` +
        topArtistNames[0] +
        `</p>
            </div>
          </td>
          <td>
            <div class = "top-artist-info">
              <img class="artist-image" src = "` +
        topArtistImages[1] +
        `">
              <p class="top-artist-name">` +
        topArtistNames[1] +
        `</p>
            </div>
          </td>
          <td>
            <div class = "top-artist-info">
              <img class="artist-image" src = "` +
        topArtistImages[2] +
        `">
              <p class="top-artist-name">` +
        topArtistNames[2] +
        `</p>
            </div>
          </td>
        </tr>
      </table>
      <table class="artist-grid-table-2">
        <tr>
          <td>
            <div class = "top-artist-info">
              <img class="artist-image" src = "` +
        topArtistImages[3] +
        `">
              <p class="top-artist-name">` +
        topArtistNames[3] +
        `</p>
            </div>
          </td>
          <td>
            <div class = "top-artist-info">
              <img class="artist-image" src = "` +
        topArtistImages[4] +
        `">
              <p class="top-artist-name">` +
        topArtistNames[4] +
        `</p>
            </div>
          </td>
        </tr>
      </table>`
    );
  });

  var seed_artists = topArtistIds;
  var seed_genres = ["rap", "hip-hop"];
  var seed_tracks = topTrackNames;
  var min_popularity = 65;
  var target_popularity = 85;
  var recommendationIds = [];
  var recommendationNames = [];
  $.ajax({
    //get JSON information
    url: "/getRecommendations",
    type: "GET",
    data: {
      seed_artists: seed_artists,
      seed_genres: seed_genres,
      seed_tracks: seed_tracks,
      min_popularity: min_popularity,
      target_popularity: target_popularity,
    },
  }).done(function (data) {
    console.log("Recommendations:");
    for (let i = 0; i < data.body.tracks.length; i++) {
      recommendationIds.push(data.body.tracks[i].id);
      recommendationNames.push(data.body.tracks[i].name);
      // console.log(data.body.tracks[i].id, ":", data.body.tracks[i].name);
    }
    // console.log("Recommendations: ", recommendationIds);
  });
  
});
