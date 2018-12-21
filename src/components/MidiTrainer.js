import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { withFirebase } from 'react-redux-firebase'
// import { connect } from 'react-redux'
// import { compose } from 'redux'
// import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import * as mm from '@magenta/music'; // can we minimize this import?
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FilledInput from '@material-ui/core/FilledInput';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import StopIcon from '@material-ui/icons/Stop';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Switch from '@material-ui/core/Switch';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import pink from '@material-ui/core/colors/pink';
// import { Sampler } from 'tone';
// import {note, chord} from 'teoria';
import {instrument as soundfontInstrument} from 'soundfont-player';
import {OCTAVE_NUMBERS, TONES} from '../constants/NOTES';
import MIDI_EXAMPLES from '../constants/MIDI_EXAMPLES';
import './MidiTrainer.css';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
  progress: {
    margin: theme.spacing.unit * 2,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: 'fit-content',
  },
  formControl: {
    marginTop: theme.spacing.unit * 2,
    minWidth: 120,
  },
  formControlLabel: {
    marginTop: theme.spacing.unit,
  },
});

const ExampleMidiDialogMenu = (Object.keys(MIDI_EXAMPLES)).map(r=><MenuItem key={r} value={r}>{MIDI_EXAMPLES[r]}</MenuItem>);

function ExampleMidiDialog(props) {
  const { classes } = props;
  return(
    <React.Fragment>
      <Dialog
        // fullWidth={false}
        // maxWidth={sm}
        open={props.isExampleListOpen}
        onClose={props.handleExampleListClose}
        aria-labelledby="example-midi-list-dialog-title"
      >
        <DialogTitle id="example-midi-list-dialog-title">Choose a song</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can choose an example MIDI file from the list below. It's a huge list:
          </DialogContentText>

          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="fileMidiExample">Midi File</InputLabel>
              <Select
                value={props.fileMidiExample}
                onChange={props.handleExampleFileSelection}
                inputProps={{
                  name: 'fileMidiExample',
                  id: 'fileMidiExample',
                }}
              >
                {ExampleMidiDialogMenu}
              </Select>
            </FormControl>
            
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleExampleListClose} color="primary">
            Close
          </Button>
        </DialogActions>

      </Dialog>
      </React.Fragment>
  );
}

ExampleMidiDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  handleExampleListClose: PropTypes.func.isRequired,
};

class MidiTrainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 0: nothing
      // 1: existing example midi file -> fetch from db -> midi -> ns
      // 2: uploaded midi file -> midi -> ns
      // 3: uploaded non-midi file -> NN -> ns -> midi
      userDecision: 0, 

      isPlayerLoaded: false, // is the magenta player loaded
      isExampleListOpen: false, // is user hesitating over which example midi to use
      isUploading: false, // is the file uploading
      isTranscribing: false, // is the NN model working on transcribing
      isStarted: false,// has user started
      isModelLoaded: false, // is the magenta model loaded

      fileMidiExample: '', // example file name
    };
    this.initPlayer(); // load and init player at beginning
    this.visualizer = null;

    // upload file
    this.fileInputRef = React.createRef();
    this.fileInput = null;

    // don't touch until start
    this.ns = null;
    this.midi = null;

    // this.model = initModel(); // maybe not here
    // this.ac = new AudioContext();
    // soundfontInstrument(this.ac, 'acoustic_grand_piano', {
    //   soundfont: 'MusyngKite'
    // }).then((acoustic_grand_piano) => {
    //   this.somePiano = acoustic_grand_piano;
    //   this.setState({ isLoaded: true });
    // });
  }
  loadPlayer() {
    return new Promise(resolve => {
      // let p = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/salamander';
      resolve(new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/salamander'));
    });
  }
  async initPlayer() {
    // let player = await loadPlayer();
    // // TODO: fix some bug after magenta 1.1.15 I don't know what it is
    // player.callbackObject = {
    // };
    // this.player = player;
    // this.setState({
    //   isPlayerLoaded: true,
    // });
  }
  handleExampleListOpen = () => {
    this.setState({ isExampleListOpen: true });
  };
  handleExampleListClose = () => {
    this.setState({ isExampleListOpen: false });
  };
  handleSelection = event => {
    this.setState({ 
      [event.target.name]: event.target.value,
      userDecision: 1,
     });
    this.fileInput = null; // if selection made here, remove uploaded ones
  };
  handleUpload() {
    this.fileInput = null; // reset
    if(!this.fileInputRef.current.files || !this.fileInputRef.current.files[0]) {
      return alert("Error, failed to upload the file. Uploaded file non-exists.");
    }
    this.fileInput = this.fileInputRef.current.files[0];
    if(this.fileInput.type.indexOf('audio')===-1) {
      return alert("Error, file uploaded is not legal audio file. Please check the file's MIME type")
    }
    // // check file size
    // if(this.fileInputRef.current.files[0].size > MAX_UPLOAD_SIZE) {
    // }
    if(this.fileInput.type == ('audio/mid')) { // midi file
      this.midi = this.fileInputRef.current.files[0]; // blob or file ???
      this.setState({
        userDecision: 2,
      });
    } else { // normal audio file
      this.setState({
        userDecision: 3,
      });
    }
    this.fileInputRef.current.files = null; // reset
  }
  handleStart() {
    if(!this.state.userDecision) {
      // not likely to happen
      return alert("Please choose an input to proceed");
    }
    if(this.state.userDecision===1) {
      // fetch from db
    }
    // if any one not exists
    // this.midi =
    // this.ns = 
    this.fileInputRef.current.files = null; // clear input
  }
  handleAnew() {
  }
  async getTranscription() {
    this.setState({
      isTranscribing: true,
    });
    // initialize model
    this.model = new mm.OnsetsAndFrames('https://storage.googleapis.com/magentadata/js/checkpoints/transcription/onsets_frames_uni');
    this.model.initialize().then(() => {
      // resetUIState(); // ?
      this.setState({
        isModelLoaded: true,
      });

      // ?
      //// slow on Safari.
      // if (window.webkitOfflineAudioContext) {
      //   safariWarning.hidden = false;
      // }
      
      // // broken on ios12.
      // if (navigator.userAgent.indexOf('iPhone OS 12_0') >= 0) {
      //   iosError.hidden = false;
      //   buttons.hidden = true;
      // }

      // start transcribing
      this.model.transcribeFromAudioFile(this.fileInputRef.current.files[0]).then((ns) => {
        this.ns = ns;

        // this.midi = mm.sequenceProtoToMidi(ns); // TODO: should we return a Uint8Array or a blob
        this.midi = new Blob([mm.sequenceProtoToMidi(ns)]);

        this.setState({
          isTranscribing: false,
        });
      });

    });
  }
  async getVisualization() {
    // should not using player
    // this.player.loadSamples(this.ns).then(() => {
    //   this.visualizer = new mm.Visualizer(this.ns, canvas, {
    //       noteRGB: '255, 255, 255', 
    //       activeNoteRGB: '232, 69, 164', 
    //       pixelsPerTimeStep: window.innerWidth < 500 ? null: 80,
    //   });
    //   resetUIState();
    //   showVisualizer();
    // });

    // this.setState({
    //   isStarted: true,
    // });
  }
  render() {
    const { classes } = this.props;
    return (
      <div className='midi-trainer'>
        <h1>Transcription Practice</h1>
        <h2>Use your favorite music to practice transcription skill!</h2>
        <Grid
          container
          spacing={32}
          direction="column"
          alignItems="center"
          alignContent="center"
          // justify="center"
          style={{ minHeight: '70vh', width:'100%'}}
        >

          {/* Instruction */}
          <Grid item>
            <Typography variant="body1" align="center" className="midi-trainer-body">
              {
                !this.state.isStarted ? 
                "Upload an audio file or choose an existing midi file to begin" : 
                "Listen and select the note played"
              }
            </Typography>
          </Grid>

          {/* Welcome Menu */}
          {(!this.state.isStarted) && 
            <Grid item xs={"auto"}>
              <Grid container spacing={16} direction="row" alignContent="center" >

                <Grid item xs={6} sm={6}>
                  <input
                    accept="audio/*"
                    className={classes.input}
                    id="audioInputFileButton"
                    multiple
                    type="file"
                    ref={this.fileInputRef}
                    onChange={()=>this.handleUpload()}
                  />
                  <label htmlFor="audioInputFileButton">
                    <Button disabled={this.state.isUploading} fullWidth={true} color="secondary" variant="contained" component="span" className={classes.button}>
                      {!this.state.isUploading?"Upload":"Uploading"}
                    </Button>
                  </label>
                </Grid>

                <Grid item xs={6} sm={6}>
                  <Button fullWidth={true} variant="contained" className={classes.button} onClick={() => this.handleExampleListOpen()}>
                    Examples
                  </Button>
                    < ExampleMidiDialog 
                      fileMidiExample = { this.state.fileMidiExample }
                      handleExampleFileSelection = { this.handleSelection }
                      handleExampleListClose = { () => this.handleExampleListClose() }
                      isExampleListOpen = { this.state.isExampleListOpen }
                      classes = { classes }
                    />
                </Grid>

              </Grid>
            </Grid>
          }

          { /* Additional Instruction for New Users */ }
          {!this.state.isStarted && 
          <Grid item xs={6} sm={6} lg={6}>
            <Typography>
              You can upload a midi file or other audio file. <br/> If you upload a non-midi audio file, this app will use a NN to transcribe the music for you.
            </Typography>
          </Grid>
          }

          {/* Reactions to User's decision */}
          <Grid item xs={6} sm={6} lg={6}>
          { (!this.state.isStarted) && (this.state.userDecision > 0) &&
            <Typography variant="body1" align="center" className="midi-trainer-body">
              The file chosen is "{ (this.state.userDecision === 1) ? this.state.fileMidiExample : this.fileInput.name}"
            </Typography>
          }
          </Grid>

          {/* 
          {!this.state.isStarted ? ( 
            <Grid item xs={"auto"}>
            </Grid>
          ) : (
            <Grid item xs={6}>
            </Grid>
          )}

          {(this.state.isStarted) && 
            <Grid item xs={"auto"}>
            </Grid>
          }

          {(!this.state.isStarted) &&
            <Grid item>
              <Typography variant="h5">
              </Typography>
            </Grid>
          } 
          */}

          {/* The control button */}
          {(!this.state.isStarted)?(
            <Grid item xs={"auto"}>
              {(!this.state.isTranscribing)?(
                <Button disabled={!(this.state.userDecision && this.state.isPlayerLoaded)} variant="contained" color="secondary" className="button pitch-trainer-button" onClick={() => this.handleStart()}>
                  <ArrowRightIcon className="leftIcon pitch-trainer-leftIcon" />
                  {!(this.state.userDecision && this.state.isPlayerLoaded) ? (this.state.isPlayerLoaded ? "Waiting" : "Loading") : "Start"}
                </Button>
              ):(
                <Button disabled variant="contained" color="secondary" className="button pitch-trainer-button">
                  <CircularProgress className={classes.progress} />
                  Transcribing
                </Button>
              )}
            </Grid>
          ) : (
            <Grid item xs={"auto"}>

              {/* <FormControlLabel
                className={classes.formControlLabel}
                control={
                  <Switch
                    checked={this.state.fullWidth}
                    onChange={this.handleFullWidthChange}
                    value="fullWidth"
                  />
                }
                label="Full width"
              /> */}

              <Button variant="contained" color="secondary" className="button pitch-trainer-button" onClick={() => this.handleGameStop()}>
              <StopIcon className="leftIcon pitch-trainer-leftIcon" />
              End
              </Button>
            </Grid>
          )}

          {/* Additional reactions to User's decision if uploaded non-midi audio file */}
          { (!this.state.isStarted) && (this.state.userDecision===3) &&
            <Grid item xs={6} sm={6} lg={6}>
              <Typography variant="body1" align="center" className="midi-trainer-body">
                It seems that you uploaded a non-midi audio file. A piano transcription model will be used. <br/> The accuracy may decrease if the audio is played by different instruments. Please go to their document for more information about the <a href='https://magenta.tensorflow.org/oaf-js'>Magenta Project</a> used here to transcribe audio files
              </Typography>
            </Grid>
          }

        </Grid>
      </div>
    );
  }
}

MidiTrainer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MidiTrainer);
// export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(App)); // recompose?