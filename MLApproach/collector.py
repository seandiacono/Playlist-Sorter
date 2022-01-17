# This script is responsible for collecting track data from the spotify users's playlists and saving it to a csv file.

import spotipy
from spotipy.oauth2 import SpotifyOAuth
import pandas as pd

scope = "playlist-read-private"

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(scope=scope))

# Get the user's current genre playlists


def get_genre_playlists():
    results = sp.current_user_playlists()
    genre_playlists = []
    for item in results["items"]:
        if 'genre' in item["description"].lower():
            genre_playlists.append(item)
    return genre_playlists


genre_playlists = get_genre_playlists()


# Get the tracks from each genre playlist and group them by genre
def get_tracks(genre_playlists):
    tracks = []
    genre_codes = {}
    for idx, playlist in enumerate(genre_playlists):
        genre_codes[idx] = playlist["name"]
        results = sp.user_playlist_tracks(
            playlist["owner"]["id"], playlist["id"])
        for item in results["items"]:
            item['track']['genre_code'] = idx
            tracks.append(item["track"])
    return tracks, genre_codes


tracks, genre_codes = get_tracks(genre_playlists)

# Get the audio features for each track


def get_audio_features(tracks):
    audio_features = []
    for track in tracks:
        try:
            features = sp.audio_features(track["id"])
        except:
            print(track["name"])
            continue
        features[0]['genre_code'] = track['genre_code']
        features[0]['name'] = track['name']
        features[0]['artist'] = track['artists'][0]['name']
        audio_features.append(features[0])
    return audio_features


audio_features = get_audio_features(tracks)

# Save the data to a csv file
def save_data(audio_features):
    df = pd.DataFrame(audio_features)
    df.to_csv('tracks.csv', index=False)


save_data(audio_features)
