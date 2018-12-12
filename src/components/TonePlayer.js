import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// import { Sampler } from 'tone';
// import {note, chord} from 'teoria'
import Piano from 'react-piano-component';
import NoteDisplay from '../components/NoteDisplay'
import getKeyMap from '../util/getKeyMap'
// import KEY2MAP from '../constants/KEY2MAP'
// import getNotesBetween from '../util/getNotesBetween'
// import RANGES from '../constants/RANGES'
// import NOTERANGES from '../constants/NOTERANGES'
import "./TonePlayer.css"

function PianoContainer({ children }) {
  return (
    <div
      className={'the-piano__piano-container'}
      onMouseDown={event => event.preventDefault()}
    >
      {children}
    </div>
  );
}

// TODO
// beautify backspace
function AccidentalKey({ isPlaying, text, eventHandlers }) {
  let content = (text==="BACKSPACE") ? "<-" : text;
  return (
    <div className={'the-piano__accidental-key__wrapper'}>
      <button
        className={`the-piano__accidental-key ${
          isPlaying ? 'the-piano__accidental-key--playing' : ''
        }`}
        {...eventHandlers}
      >
        <div className={'the-piano__text'}>{content}</div>
      </button>
    </div>
  );
}

// TODO
// beautify backspace
function NaturalKey({ isPlaying, text, eventHandlers }) {
  let content = (text==="BACKSPACE") ? "<-" : text;
  return (
    <button
      className={`the-piano__natural-key ${
        isPlaying ? 'the-piano__natural-key--playing' : ''
      }`}
      {...eventHandlers}
    >
      <div className={'the-piano__text'}>{content}</div>
    </button>
  );
}

class ThePiano extends Component {
  render() {
    const startNote = this.props.startNote, endNote = this.props.endNote;
    let handleNotePlay = (note) => this.props.handleNotePlay(note), handleNoteStop = (note) => this.props.handleNoteStop(note);
    let keyMapping = getKeyMap(startNote,endNote);
    // const notesBetween = getNotesBetween(startNote,endNote);
    // const idx = Math.min(notesBetween.length, KEY2MAP.length);
    // let keyMapping = {};
    // for(let i = 0; i < idx; ++i){
    //   keyMapping = Object.assign({[KEY2MAP[i]]:notesBetween[i]},keyMapping)
    // }
    return (
      <Piano
        startNote={this.props.startNote}
        endNote={this.props.endNote}
        keyboardMap={keyMapping}
        renderPianoKey={
          ({
            note,               // (String) The note corresponding to the key
            isNoteAccidental,   // (Boolean) Whether the note is accidental (C#, D#, F#, G#, or A#)
            isNotePlaying,      // (Boolean) Whether the note is currently playing
      
            startPlayingNote,   // (Function) A function that starts playing the note
            stopPlayingNote,    // (Function) A function that stops playing the note
      
            keyboardShortcuts,  // (Array) Keyboard keys mapped to the note, defined by `keyboardMap`.
          }) => {
            /* Return a styled piano key */

            function keyHandleNotePlay() {
              handleNotePlay(note);
              startPlayingNote();
            }

            function keyHandleNoteStop() {
              if(!isNotePlaying) return;
              handleNoteStop(note);
              stopPlayingNote();
            }

            /* https://github.com/lillydinhle/react-piano-component/blob/master/src/demo/components/InteractivePiano.js */
            function handleMouseEnter(event) {
              if (event.buttons) {
                handleNotePlay(note);
                startPlayingNote();
              }
            }
          
            const KeyComponent = isNoteAccidental ? AccidentalKey : NaturalKey;
            // const eventHandlers = {
            //   onMouseDown: startPlayingNote,
            //   onMouseEnter: handleMouseEnter,
            //   onTouchStart: startPlayingNote,
            //   onMouseUp: stopPlayingNote,
            //   onMouseOut: stopPlayingNote,
            //   onTouchEnd: stopPlayingNote,
            // };
            const eventHandlers = {
              onMouseDown: keyHandleNotePlay,
              onMouseEnter: handleMouseEnter,
              onTouchStart: keyHandleNotePlay,
              onMouseUp: keyHandleNoteStop,
              onMouseOut: keyHandleNoteStop,
              onTouchEnd: keyHandleNoteStop,
            };
            return (
              <KeyComponent
                isPlaying={isNotePlaying}
                text={keyboardShortcuts.join(' / ')}
                eventHandlers={eventHandlers}
              />
            );
          }
        }
      />
    );
  }
}

class TonePlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
    startNote: 'C3',
    endNote: 'C5',
    theNote: [],
    };
  }
  // TODO
  // add key-board support
  handleNotePlay(note){
    const theNote = this.state.theNote;
    theNote.push(note);
    this.setState({
      theNote: theNote,
    });
  }
  handleNoteStop(note){
    let theNote = this.state.theNote;
    let toRemove = theNote.indexOf(note);
    if (toRemove !== -1) {
      theNote.splice(toRemove, 1);
      this.setState({
        theNote: theNote,
      });
    }
  }
  renderNote(note) {
    return (
      <NoteDisplay
        note={note}
      />
    )
  }
  render() {
    const { classes } = this.props;
    return (
      <div className="TonePlayer">
        <Paper className="TonePlayerPaper" elevation={1}>
          <Paper className="NoteDisplayPaper" elevation={1}>
            <h1>A Musical Keyboard</h1>
            <h2>Use it to practice your ears!</h2>
            <div className="NoteDisplay">
              {this.renderNote(this.state.theNote)}
            </div>
          </Paper>
          <Paper className="PianoContainerPaper" elevation={1}>
            <PianoContainer>
              <ThePiano 
                handleNotePlay={(note) => this.handleNotePlay(note)}
                handleNoteStop={(note) => this.handleNoteStop(note)}
                startNote={this.state.startNote}
                endNote={this.state.endNote}
              />
            </PianoContainer>
          </Paper>
          {/* TODO: Add footer */}
       </Paper>
      </div>
    );
  }
}

export default TonePlayer;