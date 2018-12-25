# Tone the Ear

[link](https://demo-tone-the-ear.snowme34.com/)

This is a small app about ear training.

My first React app project.

In development.

## Features

* A piano that displays the note being played
  * Supports display mutiple notes at the same time
* A pitch trainer
  * Plays a random note based on users' choice
  * Provides useful statistics to help users understand their progress
* A Transcription Practice Page
  * Uses the [Onsets and Frames: Dual-Objective Piano Transcription Model](https://magenta.tensorflow.org/onsets-frames) to transcribe user uploaded non-midi audio file
  * Uses libraries from [@magenta/music](https://tensorflow.github.io/magenta-js/music/modules/_core_player_.html) to process user uploaded midi file and example midi files stored on Firebase
  * Visualizes the note sequence, audio spectrum (user uploaded audio file only), and midi in JSON format
  * Supports playback
* More to come...

## Main Technologies Used

* React
* Material-ui
* Firebase

## Disclaimer

My only knowledge about music comes
from the experience in learning an unpopular music
instrument that requires almost zero knowledge
about music theory.

Create an issue if there is something wrong.

## Credits

The midi files are from [Classical Piano Midi Page](http://www.piano-midi.de/copy.htm) and
are distributed under [cc-by-sa Germany License](https://creativecommons.org/licenses/by-sa/3.0/de/deed.en).
