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
          <h1 class='display-name'></h1>
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
  $.ajax({
    //get JSON information
    url: "/getTopTracks",
    type: "GET",
  }).done(function (data) {
    for (let i = 0; i < data.body.items.length; i++) {
      topTrackIds.push(data.body.items[i].id);
    }
    console.log("Top Tracks: ", topTrackIds);
  });

  $.ajax({
    //get JSON information
    url: "/getTopArtists",
    type: "GET",
  }).done(function (data) {
    var topArtistNames = [];
    var topArtistImages = [];
    for (let i = 0; i < data.body.items.length; i++) {
      topArtistNames.push(data.body.items[i].name);
      topArtistImages.push(data.body.items[i].images[0].url);
    }
    console.log(topArtistNames, ":", topArtistImages);
    $(".artist-grid").html(
      `<h1 class="artist-grid-desc">Your Top 5 Artists This Month</h1>
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
              <img class="artist-image" src =` +
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
  var seed_artists = [
    "2YZyLoL8N0Wb9xBt1NhZWg",
    "1RyvyyTE3xzB2ZywiAwp0i",
    "0WK3H9OErSn5zKOkOV5egm",
  ];
  var seed_genres = ["rap", "hip-hop"];
  var min_popularity = 65;
  var target_popularity = 80;
  var recommendationIds = [];
  $.ajax({
    //get JSON information
    url: "/getRecommendations",
    type: "GET",
    data: {
      seed_artists: seed_artists,
      seed_genres: seed_genres,
      min_popularity: min_popularity,
      target_popularity: target_popularity,
    },
  }).done(function (data) {
    for (let i = 0; i < data.body.tracks.length; i++) {
      recommendationIds.push(data.body.tracks[i].id);
    }
    console.log("Recommendations: ", recommendationIds);
  });
  $.ajax({
    //get JSON information
    url: "/getGenreSeeds",
    type: "GET",
  }).done(function (data) {
    console.log(data.body);
  });
});