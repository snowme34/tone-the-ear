import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  Redirect
} from "react-router-dom";
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
// import Paper from '@material-ui/core/Paper';
// import Input from '@material-ui/core/Input';
// import OutlinedInput from '@material-ui/core/OutlinedInput';
// import FilledInput from '@material-ui/core/FilledInput';
// import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
// import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import StopIcon from '@material-ui/icons/Stop';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import SkipNextIcon from '@material-ui/icons/SkipNext';
// import pink from '@material-ui/core/colors/pink';
// import { Sampler } from 'tone';
// import {note, chord} from 'teoria';
import {TONES} from '../constants/NOTES';
import shuffleArray from '../util/shuffleArray'
import './PitchTrainer.css';

function TonesCheckboxes(props){
  return(
    <div className="tones-check-boxes-container">
      <FormLabel component="legend">
        Choose the notes to test, you can change anytime
      </FormLabel>
      <FormGroup row>
        {TONES.map((t) => 
          <FormControlLabel
            key={t}
            control={
              <Checkbox
                checked={props.tones[TONES.indexOf(t)]}
                onChange={props.handleSelection(t)}
                value={t}
              />
            }
            label={t}
          />
        )}
      </FormGroup>
    </div>
  );
}

function PitchTrainerStart(props) {
  return (
    <Grid
        container
        spacing={32}
        direction="column"
        alignItems="center"
        // justify="center"
        style={{ minHeight: '70vh' }}
      >
      <Grid item xs={"auto"}>
       <h2>Customize the training</h2>
      </Grid>
      <Grid item xs={"auto"}>
        <TonesCheckboxes tones={props.tones} handleSelection={(name) => props.handleSelection(name)}/>
      </Grid>
      <Grid item xs={"auto"}>
        <form className='pitch-trainer-num-choices-form' autoComplete='off'>
          <FormLabel component="legend">
            Choose the number of candidates for each question
          </FormLabel>
          <FormControl className='pitch-trainer-num-choices-form-control'>
            <Select
              value={props.numChoices}
              onChange={props.handleNumChoices}
              displayEmpty
              name='numChoices'
              className='pitch-trainer-num-choices-select'
            >
              {props.NUM_CHOICES_LIST}
            </Select>
            {/* <FormHelperText>Select the number of candidates for each note practice round</FormHelperText> */}
          </FormControl>
        </form>
      </Grid>
      <Grid item xs={"auto"}>
        <Button variant="contained" color="secondary" className="button pitch-trainer-button" onClick={() => props.handleGameStart()}>
        <ArrowRightIcon className="leftIcon pitch-trainer-leftIcon" />
        Start
        </Button>
      </Grid>
    </Grid>
  );
}

function TonesAnswerButtons(props) {
  let answers = [props.notePlaying], tonesChosen = [], numAns;
  for(let i = 0; i < props.tones.length; ++i){ if(props.tones[i] && TONES[i]!==props.notePlaying) tonesChosen.push(TONES[i]); }
  numAns = Math.min(props.numChoices-1, tonesChosen.length);
  tonesChosen = shuffleArray(tonesChosen);
  while (numAns--) { answers.push(tonesChosen.pop()); }
  answers = shuffleArray(answers);
  const answerButtons = answers.map((r) => <Grid key={r} item xs={"auto"}><Button key={r} color="default" className="pitch-trainer-button"> {r} </Button></Grid>);
  return (
    <Grid
        container
        spacing={8}
        direction="row"
        alignItems="center"
        // justify="center"
        // style={{ minHeight: '70vh' }}
      >
      {answerButtons}
    </Grid>
  );
}

function PitchTrainerGame(props) {
  return (
    <Grid
        container
        spacing={32}
        direction="column"
        alignItems="center"
        // justify="center"
        style={{ minHeight: '70vh' }}
      >
      <Grid item xs={"auto"}>
       <h2>Listen and select the note played</h2>
      </Grid>
      <Grid item xs={"auto"}>
        <TonesCheckboxes tones={props.tones} handleSelection={(name) => props.handleSelection(name)}/>
      </Grid>
      <Grid container spacing={16} direction="row" justify="center">
        <Grid item xs={1}>
          <Button fullWidth={true} variant="contained" className="button pitch-trainer-button" onClick={() => props.handlePlayNote()}>
          <MusicNoteIcon className="leftIcon pitch-trainer-leftIcon" />
          Play
          </Button>
        </Grid>
        <Grid item xs={1}>
          <Button fullWidth={true} variant="contained" className="button pitch-trainer-button" onClick={() => props.handleSkipNote()}>
          <SkipNextIcon className="leftIcon pitch-trainer-leftIcon" />
          Skip
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={"auto"}>
        <TonesAnswerButtons numChoices={props.numChoices} tones={props.tones} notePlaying={props.notePlaying}/>
      </Grid>
      <Grid item xs={"auto"}>
        <Button variant="contained" color="secondary" className="button pitch-trainer-button" onClick={() => props.handleGameStop()}>
        <StopIcon className="leftIcon pitch-trainer-leftIcon" />
        End
        </Button>
      </Grid>
    </Grid>
  );
}

// TODO
// Maybe using note from Teoria is better?
class PitchTrainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //     ['C',  'C#', 'D', 'D#',  'E',  'F', 'F#', 'G', 'G#',  'A','A#',  'B']
      tones: [true,false,true,false,false,false,false,true,false,true,false,false],
      isStarted: false,
      numChoices: 3,
      notePlaying: 'C',
      // hasTimer: false,
      // statistics for last game if not first game
      isFirstGame: true,
      tries: [0,0,0,0,0,0,0,0,0,0,0,0],
      triesTime: [0,0,0,0,0,0,0,0,0,0,0,0],
      triesCorrect: [0,0,0,0,0,0,0,0,0,0,0,0],
    };
    this.NUM_CHOICES_LIST = Array.apply(null, {length: TONES.length}).map(Number.call, Number).map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>).slice(3);
  }
  handleSelection = name => event => {
    let t = this.state.tones;
    t[TONES.indexOf(name)] = event.target.checked;
    this.setState({ tones: t });
  };
  handleGameStart() {
    this.setState({isStarted: true});
  }
  handleGameStop() {
    this.setState({
      isStarted: false,
      isFirstGame: false
    });
  }
  handleNumChoices = event => {
    this.setState({
      [event.target.name]: event.target.value,
     });
  };

  // TODO
  getNextNote() {
    return null;
  }
  handlePlayNote() {
    return null;
  }
  handleSkipNote() {
    return null;
  }

  render() {
    // const { classes } = this.props;
    return (
      <div className='pitch-trainer'>
        <h1>Pitch Listening Practice</h1>
        {
          !this.state.isStarted ? 
            <PitchTrainerStart
              tones = {this.state.tones}
              numChoices = {this.state.numChoices}
              NUM_CHOICES_LIST = {this.NUM_CHOICES_LIST}
              handleNumChoices = {(event) => this.handleNumChoices(event)}
              handleSelection = {(name) => this.handleSelection(name)}
              handleGameStart = {() => this.handleGameStart()}
            /> :
            <PitchTrainerGame 
              tones = {this.state.tones}
              numChoices = {this.state.numChoices}
              notePlaying = {this.state.notePlaying}
              handleSelection = {(name) => this.handleSelection(name)}
              handleGameStop = {() => this.handleGameStop()}
              handlePlayNote = {() => this.handlePlayNote()}
              handleSkipNote = {() => this.handleSkipNote()}
            />
        }
    </div>
    );
  }
}

export default PitchTrainer;