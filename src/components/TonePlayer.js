import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
// import Input from '@material-ui/core/Input';
// import OutlinedInput from '@material-ui/core/OutlinedInput';
// import FilledInput from '@material-ui/core/FilledInput';
// import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
// import Grid from '@material-ui/core/Grid';
// import { Sampler } from 'tone';
// import {note, chord} from 'teoria'
import Piano from 'react-piano-component';
import NoteDisplay from '../components/NoteDisplay'
import getKeyMap from '../util/getKeyMap'
// import KEY2MAP from '../constants/KEY2MAP'
// import getNotesBetween from '../util/getNotesBetween'
import RANGES from '../constants/RANGES'
// import NOTERANGES from '../constants/NOTERANGES'
import './TonePlayer.css'

/**
 * Copyright (c) 2016-present, Udilia Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

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

// beautify the key text
function getUnicodeText(text) {
  switch (text) {
    case 'BACKSPACE':
      return '\u232B';
    case 'ENTER':
      return '\u23CE';
    default:
      return text;
  }
}

function AccidentalKey({ isPlaying, text, eventHandlers }) {
  let content = getUnicodeText(text);
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

function NaturalKey({ isPlaying, text, eventHandlers }) {
  let content = getUnicodeText(text);
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

// TODO
// improve keyboard support
// note of keyboard should be displayed and properly stopped
// TODO
// use a function for ThePiano if available
class ThePiano extends Component {
  render() {
    const startNote = this.props.startNote, endNote = this.props.endNote;
    let handleNotePlay = (note) => this.props.handleNotePlay(note), handleNoteStop = (note) => this.props.handleNoteStop(note);
    let keyMapping = getKeyMap(startNote,endNote);
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
    range:'C3-C5',
    };
    this.RANGE_LIST = RANGES.map((r) => <MenuItem key={r[1]} value={r}>{r}</MenuItem>);
  }
  handleRangeChange = event => {
    this.setState({ 
      [event.target.name]: event.target.value,
      startNote: event.target.value.substring(0,2),
      endNote: event.target.value.substring(3),
     });
  };
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
    // const { classes } = this.props;
    return (
      <div className='tone-player'>
        <Paper className='tone-player-paper' elevation={1}>
          <Paper className='note-display-paper' elevation={1}>
            <h1>A Musical Keyboard</h1>
            <h2>Use it to practice your ears!</h2>

            <form className='tone-player-form' autoComplete='off'>
              <FormControl className='tone-player-range-form-control'>
                <Select
                  value={this.state.range}
                  onChange={this.handleRangeChange}
                  displayEmpty
                  name='range'
                  className='tone-player-range-select'
                >
                  {this.RANGE_LIST}
                </Select>
                <FormHelperText>Select the first note and the last note</FormHelperText>
              </FormControl>
            </form>

            <div className='note-display'>
              {this.renderNote(this.state.theNote)}
            </div>
          </Paper>
          <Paper className='piano-container-paper' elevation={1}>
            <PianoContainer>
              <ThePiano 
                handleNotePlay={(note) => this.handleNotePlay(note)}
                handleNoteStop={(note) => this.handleNoteStop(note)}
                startNote={this.state.startNote}
                endNote={this.state.endNote}
              />
            </PianoContainer>
          </Paper>
       </Paper>
      </div>
    );
  }
}

export default TonePlayer;