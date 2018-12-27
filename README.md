# Tone the Ear

[demo link](https://demo-tone-the-ear.snowme34.com/) | [alternative demo link](https://tone-the-ear.some-cs-student.com)

A small Progressive Web App about ear training. First React app project of a student.

## Features

* A virtual piano
  * Displays the currently played note
* A perfect pitch trainer
  * Plays a random note based on users' choice
  * Has a build-in timer and answer correctness check mechanism
  * Provides useful statistics to help users understand their progress
* A Transcription Practice Page
  * Uses the [Onsets and Frames: Dual-Objective Piano Transcription Model](https://magenta.tensorflow.org/onsets-frames) to transcribe user uploaded non-midi audio files and example audio files
  * Uses libraries from [@magenta/music](https://tensorflow.github.io/magenta-js/music/modules/_core_player_.html) to process user uploaded midi files and example midi files stored on Firebase
  * Visualizes the note sequence, audio spectrum (currently only support non-midi audio files), and midi in JSON format
  * Supports playback of uploaded audio file and the midi generated by the transcription model. Gives user options to mute either or both
* More to come...

## Screenshots

Home:

![screenshot0-home](/screenshots/screenshot0_tone-the-ear_home.png)

Virtual Piano:

![screenshot1-tone](/screenshots/screenshot1_tone-the-ear_tone.png)

Perfect Pitch Training Menu:

![screenshot2-pitch](/screenshots/screenshot2_tone-the-ear_pitch_start_stat.png)

Perfect Pitch Training:

![screenshot3-pitch](/screenshots/screenshot3_tone-the-ear_pitch_started.png)

Transcription Practice Menu:

![screenshot4-midi](/screenshots/screenshot4_tone-the-ear_midi_file_chosen.png)

Transcription Practice with midi file:

![screenshot5-midi](/screenshots/screenshot5_tone-the-ear_midi_mid.png)

Transcription Practice with non-midi audio file:

![screenshot6-midi](/screenshots/screenshot6_tone-the-ear_mid_audio.png)

## Technologies

### Main Technologies Used

* React
* Material-ui
* Firebase
* @magenta/music

### Details about Implementation

* Set up the app with [create-react-app](https://github.com/facebook/create-react-app)
* Use Material Design from [Material-UI](https://material-ui.com/)
* Add mutiple 'pages' to this single page web app using [react-router-dom](https://reacttraining.com/react-router/web/guides/quick-start)
* Connect thie app to Firebase using [react-redux-firebase](https://github.com/prescottprue/react-redux-firebase)
  * Using high order component
* Retrieve example files from Firebase's storage
* Combine React's ref forwarding technique and recompose utility to interoperate third-party libraries with a component that takes a reference as parameter for its child component
* Use react virtualized table to display large content
* Make a workaround solution feasible for users to choose for a large input problem of TensorFlow.js on Chrome

## Disclaimer

My only knowledge about music comes
from the experience in learning an unpopular music
instrument that requires almost zero knowledge
about music theory.

Create an issue if there is something wrong, please.

## Credits

### Example Files

The midi files are from [Classical Piano Midi Page](http://www.piano-midi.de/copy.htm) and
are distributed under [cc-by-sa Germany License](https://creativecommons.org/licenses/by-sa/3.0/de/deed.en).

The full list of sources and authors of the example audio files can be found [here](audio-attributions.md).

### Ideas

Thank [@tianlanzi](https://github.com/tianlanzi), a pianist, for the instructions and ideas about transcription practice and professional feedback.
