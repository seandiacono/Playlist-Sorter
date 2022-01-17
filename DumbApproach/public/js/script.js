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


function best_match(genres){
  var electronic_genres = ['disco house', 'filter house', 'electro', 'deep house', 'diva house', 'house', 'vocal house', 'alternative dance', 'electro house', 'electronica', 'new rave', 'hip house', 'edm', 'escape room', 'indie soul', 'lgbtq+ hip hop', 'danish electronic', 'pop edm', 'indie poptimism', 'indietronica', 'modern rock', 'new french touch', 'nu disco', 'pop', 'tropical house', 'vapor soul', 'electra', 'float house', 'uk dance']
  var chill_genres = ['alternative r&b', 'hip hop', 'lgbtq+ hip hop', 'neo soul', 'pop', 'uk alternative pop', 'bedroom soul', 'chill r&b', 'indie r&b', 'r&b', 'afrofuturism', 'indie soul', 'modern indie pop', 'rap', 'filter house', 'alt z', 'dance pop', 'electropop', 'indie poptimism', 'modern rock', 'post-teen pop', 'talent show', 'leicester indie', 'indietronica', 'modern alternative rock', 'pop rock', 'rock', 'bedroom pop', 'bergen indie', 'indie pop', 'norwegian indie', 'canadian hip hop', 'canadian pop', 'toronto rap', 'weirdcore', 'gauze pop', 'shiver pop', 'irish trap', 'psychedelic hip hop', 'french indie pop', 'french indietronica', 'new french touch', 'alternative hip hop', 'east coast hip hop', 'hardcore hip hop', 'jazz rap', 'west coast rap', 'edmonton indie', 'lo-fi indie', 'indian electronic', 'indian indie', 'new delhi indie', 'rare groove', 'oakland indie', 'jazz pop']
  var rock_genres = ['alternative metal', 'alternative rock', 'modern rock', 'permanent wave', 'post-grunge', 'rock', 'beatlesque', 'britpop', 'madchester', 'brighton indie', 'garage rock', 'leicester indie', 'solo wave', 'alternative dance', 'dance-punk', 'new rave', 'queercore', 'riot grrrl']
  var jazz_genres = ['alternative hip hop', 'hardcore hip hop', 'hip hop', 'jazz rap', 'rap', 'west coast rap', 'afrofuturism', 'east coast hip hop', 'psychedelic hip hop', 'conscious hip hop', 'gangster rap', 'golden age hip hop', 'queens hip hop', 'turntablism', 'jazz boom bap', 'southern hip hop', 'chillhop', 'indie jazz']
  var hiphop_genres =  ['indie hip hop', 'hip hop', 'pittsburgh rap', 'rap', 'alternative r&b', 'escape room', 'indie r&b', 'indie soul', 'underground hip hop', 'pop rap', 'uk alternative hip hop', 'uk hip hop', 'alternative hip hop', 'conscious hip hop', 'north carolina hip hop', 'psychedelic hip hop', 'afrofuturism', 'east coast hip hop', 'hardcore hip hop', 'jazz rap', 'dmv rap', 'west coast rap', 'pop']
  var indie_genres = ['dance pop', 'pop', 'r&b', 'urban contemporary', 'indie pop', 'lo-fi indie', 'bedroom pop', 'bergen indie', 'norwegian indie', 'weirdcore', 'edmonton indie', 'alternative dance', 'dance-punk', 'new rave', 'queercore', 'riot grrrl']
  var playlists = {'BEETZ.':electronic_genres,'CHILL.': chill_genres, 'ROCK.': rock_genres,'JAZZ-Y.': jazz_genres, 'RAP 2.': hiphop_genres, 'INDIE.': indie_genres}

  var max_common_genres = 0;
  var best_playlists = ['No Match'];
  for (let playlist in playlists){
    common_genres = playlists[playlist].filter(value => genres.includes(value));
    if (common_genres.length > max_common_genres){
      max_common_genres = common_genres.length;
      best_playlists = [playlist];
    }else if (common_genres.length == max_common_genres){
      best_playlists.push(playlist);
    }
  }
  return best_playlists
}

if (error) {
  alert("There was an error during the authentication");
} else {
  if (access_token) {
    var display_name;

    $.ajax({
      url: "https://api.spotify.com/v1/me",
      headers: {
        Authorization: "Bearer " + access_token,
      },
      success: function (response) {
        userProfilePlaceholder.innerHTML = userProfileTemplate(response);
        display_name = response.display_name;

        $("#login").hide();
        $("#loggedin").show();
      },
    });

    $.ajax({
      url: "https://api.spotify.com/v1/me/playlists",
      headers: {
        Authorization: "Bearer " + access_token,
      },
      success: function (response) {
        var genre_playlists = {};
        var sorter_playlist;
        var sorted_uris = {'tracks': []}

        response.items.forEach(function (playlist) {
          if(playlist.owner.display_name == display_name){
            if (playlist.name == "Sorter") {
              sorter_playlist = playlist;
            }else{
              genre_playlists[playlist.name] = playlist;
            }
          }
        });

        console.log(genre_playlists)

        $.ajax({
          url: sorter_playlist.tracks.href,
          headers: {
            Authorization: "Bearer " + access_token,
          },
          success: function(response){
            // var playlist_genres = []
            response.items.forEach(function(song){
              $.ajax({
                url: song.track.artists[0].href,
                headers: {
                  Authorization: "Bearer " + access_token,
                },
                async: false,
                success: function(response){
                  // playlist_genres = playlist_genres.concat(response.genres)
                  best_playlists = best_match(response.genres);
                  if (best_playlists != ['No Match']){
                  // console.log('Track:' + song.track.name + ', Playlist:' + best_playlists + ', Genres:' + response.genres)
                    best_playlists.forEach(function(playlist){
                      console.log(playlist);
                      $.ajax({
                        url: genre_playlists[playlist].tracks.href + '?' + $.param(({uris: song.track.uri})),
                        headers: {
                          Authorization: "Bearer " + access_token,
                        },
                        async: false,
                        method: 'POST',
                        success: function(response){
                          sorted_uri = {'uri': song.track.uri}
                          sorted_uris['tracks'].push(sorted_uri)
                        }
                      })
                    })
                }
                }
              })
            });
            // var genre_set = new Set(playlist_genres);
            // console.log(Array.from(genre_set))

            $.ajax({
              url: sorter_playlist.tracks.href,
              headers: {
                Authorization: "Bearer " + access_token,
              },
              async:false,
              method: 'DELETE',
              data: JSON.stringify(sorted_uris)
            })


          }
        })
      },
    });
  } else {
    // render initial screen
    $("#login").show();
    $("#loggedin").hide();
  }
}
