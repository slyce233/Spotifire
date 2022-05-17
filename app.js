const express = require("express");
const request = require("request-promise-native");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var SpotifyWebApi = require("spotify-web-api-node");

var client_id = "f69840b68d374e869dcc8cdaa5eae67a"; // Client id
var client_secret = "1c1751addd44484b87566ff324df3902"; // Client secret
var redirect_uri = "http://localhost:3000/callback"; // Redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = "spotify_auth_state";

const app = express();
const scopes = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-private",
  "user-read-email",
  "user-top-read",
];

var spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri,
});

app
  .use(express.static(__dirname + "/public"))
  .use(cors())
  .use(cookieParser());

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/home", function (req, res) {
  res.sendFile(__dirname + "/public/home.html");
});

app.get("/account", function (req, res) {
  res.sendFile(__dirname + "/public/account.html");
});

app.get("/login", function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization

  let params = {
    response_type: "code",
    client_id: client_id,
    scope: scopes,
    redirect_uri: redirect_uri,
    state: state,
  };
  let searchParams = new URLSearchParams(params);
  res.redirect(
    "https://accounts.spotify.com/authorize?" + searchParams.toString()
  );
});
app.get("/callback", function (req, res) {
  // Application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  let params = {
    error: "state_mismatch",
  };
  let searchParams = new URLSearchParams(params);
  if (state === null || state !== storedState) {
    res.redirect("/#" + searchParams.toString());
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token;
        var expires_in = body.expires_in;

        var options = {
          url: "https://api.spotify.com/v1/me",
          headers: { Authorization: "Bearer " + access_token },
          json: true,
        };
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        setInterval(async function () {
          const data = await spotifyApi.refreshAccessToken();
          const access_token = data.body["access_token"];
          spotifyApi.setAccessToken(access_token);
          console.log("Access token has been refreshed");
          console.log("access_token: ", access_token);
        }, (expires_in / 2) * 1000);

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          console.log(body);
        });
        // we can also pass the token to the browser to make requests from there
        let params = {
          access_token: access_token,
          refresh_token: refresh_token,
        };
        let searchParams = new URLSearchParams(params);
        res.redirect("/home#" + searchParams.toString());
      } else {
        let params = {
          error: "state_mismatch",
        };
        let searchParams = new URLSearchParams(params);
        res.redirect("/#" + searchParams.toString());
      }
    });
  }
});

app.get("/getAccount", function (req, res) {
  let params = {
    access_token: spotifyApi.getAccessToken(),
    refresh_token: spotifyApi.getRefreshToken(),
  };
  let searchParams = new URLSearchParams(params);
  res.redirect("/account#" + searchParams.toString());
});

app.get("/getHome", function (req, res) {
  let params = {
    access_token: spotifyApi.getAccessToken(),
    refresh_token: spotifyApi.getRefreshToken(),
  };
  let searchParams = new URLSearchParams(params);
  res.redirect("/home#" + searchParams.toString());
});

app.get("/getPlaylist", function (req, res) {
  var playlistId = req.query.playlistID;
  var artistIds = new Set();
  spotifyApi.getPlaylist(playlistId).then(function (data) {
    res.send(data);
    data.body.tracks.items.map(function (t) {
      t.track.artists.map(function (artists) {
        artistIds.add(artists.id);
      });
    });
    console.log(artistIds);
    return Array.from(artistIds);
  });
});

app.get("/getMe", function (req, res) {
  spotifyApi.getMe().then(function (data) {
    res.send(data);
  });
});

app.get("/getTopTracks", function (req, res) {
  spotifyApi.getMyTopTracks().then(function (data) {
    res.send(data);
  });
});

app.get("/getTrack", function (req, res) {
  var trackId = req.query.trackID;
  console.log(playlistId);
  spotifyApi.getTrack(trackId).then(function (data) {
    res.send(data);
  });
});

app.listen(3000, function () {
  console.log("Server running on localhost 3000");
});
