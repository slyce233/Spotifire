const express = require("express");
const request = require("request-promise-native");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();

var client_id = process.env.CLIENT_ID; // Client id
var client_secret = process.env.CLIENT_SECRET; // Client secret
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
  "user-library-read",
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

app.get("/profile", function (req, res) {
  res.sendFile(__dirname + "/public/profile.html");
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

app.get("/getProfile", function (req, res) {
  let params = {
    access_token: spotifyApi.getAccessToken(),
    refresh_token: spotifyApi.getRefreshToken(),
  };
  let searchParams = new URLSearchParams(params);
  res.redirect("/profile#" + searchParams.toString());
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
    return Array.from(artistIds);
  });
});

app.get("/getMe", function (req, res) {
  spotifyApi.getMe().then(function (data) {
    res.send(data);
  });
});

app.get("/getTopArtists", function (req, res) {
  spotifyApi.getMyTopArtists({ time_range: "long_term" }).then(function (data) {
    res.send(data);
  });
});

app.get("/getTopTracks", function (req, res) {
  var limit = req.params.limit;
  var offset = req.params.offset;
  // console.log(req);
  // console.log(res);
  spotifyApi
    .getMyTopTracks({ limit: 50, offset: offset })
    .then(function (data) {
      res.send(data);
    });
});

app.get("/getSavedTracks", function (req, res) {
  var limit = req.params.limit;
  spotifyApi.getMySavedTracks({ limit: 50 }).then(function (data) {
    res.send(data);
  });
});

app.get("/getGenreSeeds", function (req, res) {
  spotifyApi.getAvailableGenreSeeds().then(function (data) {
    res.send(data);
  });
});

// getRecommendations uses just artists and genres for now
// apply other parameters later
app.get("/getRecommendations", function (req, res) {
  var seed_artists = req.query.seed_artists;
  var seed_genres = req.query.seed_genres;
  var seed_tracks = req.query.seed_tracks;
  var min_popularity = req.query.min_popularity;
  var target_popularity = req.query.target_popularity;
  spotifyApi
    .getRecommendations({
      seed_artists: seed_artists,
      seed_genres: seed_genres,
      seed_tracks: seed_tracks,
      min_popularity: min_popularity,
      target_popularity: target_popularity,
    })
    .then(function (data) {
      res.send(data);
    });
});

app.get("/getTrack", function (req, res) {
  var trackId = req.query.trackID;
  spotifyApi.getTrack(trackId).then(function (data) {
    res.send(data);
  });
});

app.get("/searchTrack", function (req, res) {
  spotifyApi.searchTracks().then(function (data) {
    res.send(data);
  });
});

app.get("/getTrackAudioFeatures", function (req, res) {
  var trackId = req.query.trackID;
  spotifyApi.getAudioFeaturesForTrack(trackId).then(function (data) {
    res.send(data);
  });
});

app.listen(3000, function () {
  console.log("Server running on localhost 3000");
});
