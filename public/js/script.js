/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
function getHashParams() {
  var hashParams = {};
  var e,
    r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
  while ((e = r.exec(q))) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

Handlebars.registerHelper("inc", function (value) {
  return parseInt(value) + 1;
});

Handlebars.registerHelper("firstName", function (value) {
  return value.split(" ")[0];
});

var userProfileSource = document.getElementById("user-profile-template")
    .innerHTML,
  userProfileTemplate = Handlebars.compile(userProfileSource),
  userProfilePlaceholder = document.getElementById("user-profile");

var topArtistsSoruce = document.getElementById("top-artists-template")
    .innerHTML,
  topArtistsTemplate = Handlebars.compile(topArtistsSoruce),
  topArtistsPlaceHolder = document.getElementById("top-artists");

var topTracksSource = document.getElementById("top-tracks-template").innerHTML,
  topTracksTemplate = Handlebars.compile(topTracksSource),
  topTracksPlaceHolder = document.getElementById("top-tracks");

var params = getHashParams();

var access_token = params.access_token,
  refresh_token = params.refresh_token,
  error = params.error;

if (error) {
  alert("There was an error during the authentication");
} else {
  if (access_token) {
    $.ajax({
      url: "https://api.spotify.com/v1/me",
      headers: {
        Authorization: "Bearer " + access_token,
      },
      success: function (response) {
        userProfilePlaceholder.innerHTML = userProfileTemplate(response);

        $("#login").hide();
        $("#loggedin").show();
      },
    });

    $.ajax({
      url: "https://api.spotify.com/v1/me/top/artists",
      data: {
        time_range: "short_term",
        limit: 5,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      success: function (response) {
        console.log(response);
      },
    });

    $.ajax({
      url: "https://api.spotify.com/v1/me/playlists",
      headers: {
        Authorization: "Bearer " + access_token,
      },
      success: function (response) {
        var id;
        response.items.forEach(function (playlist) {
          if (playlist.name == "Your Top Songs 2020") {
            id = playlist.id;
          }
        });

        $.ajax({
          url: "https://api.spotify.com/v1/playlists/" + id + "/tracks",
          headers: {
            Authorization: "Bearer " + access_token,
          },
          success: function (response) {
            console.log(response);
            var artistDict = new Object();
            var urlDict = new Object();
            var previewUrl = response.items[0].track.preview_url;
            response.items.forEach(function (item) {
              if (artistDict[item.track.artists[0].name] == null) {
                artistDict[item.track.artists[0].name] = 0;
                urlDict[item.track.artists[0].name] =
                  item.track.album.images[2].url;
              }
              artistDict[item.track.artists[0].name] =
                artistDict[item.track.artists[0].name] + 1;
            });

            orderedObj = Object.keys(artistDict).map(function (key) {
              return [key, artistDict[key]];
            });
            orderedObj.sort(function (first, second) {
              return second[1] - first[1];
            });

            orderedObj = orderedObj.slice(0, 8);

            var finalObj = new Object();
            var items = [];

            orderedObj.forEach(function (obj) {
              var newObj = new Object();
              newObj["name"] = obj[0];
              newObj["count"] = obj[1];
              newObj["url"] = urlDict[obj[0]];
              items.push(newObj);
            });

            finalObj["items"] = items;

            console.log(finalObj);
            var audio = new Audio(previewUrl);
            audio.play();
            topArtistsPlaceHolder.innerHTML = topArtistsTemplate(finalObj);
          },
        });
      },
    });
  } else {
    // render initial screen
    $("#login").show();
    $("#loggedin").hide();
  }
}
