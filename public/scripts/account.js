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
  $.ajax({
    //get JSON information
    url: "/getTopTracks",
    type: "GET",
  }).done(function (data) {
    console.log(data.body);
  });
});
