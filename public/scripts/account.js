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
    // for (let i = 0; i < data.body.items.length; i++) {
    //   songIds.push(data.body.items[i].id);
    // }s
    console.log("Top Artist: ", data.body.items);
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
