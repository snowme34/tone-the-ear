import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { withFirebase } from 'react-redux-firebase'
// import { connect } from 'react-redux'
import { compose } from 'redux'
// import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import { firebaseConnect } from 'react-redux-firebase'
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
import CanvasCard from '../components/CanvasCard'
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

// Dialog for user to choose an existing midi file
// TODO: use virtualized component to improve efficiency
function ExampleMidiDialog(props) {
  const { classes } = props;
  return(
    <React.Fragment>
      <Dialog
        open={props.isExampleListOpen}
        onClose={props.handleExampleListClose}
        aria-labelledby="example-midi-list-dialog-title"
      >
        <DialogTitle id="example-midi-list-dialog-title">Choose a song</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can choose an example MIDI file from the <b>huge</b> list below:
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

      // isAnonymousUserSignedIn: false,
      isPlayerLoaded: false, // is the magenta player loaded
      isExampleListOpen: false, // is user hesitating over which example midi to use
      isUploading: false, // is the file uploading // TODO: remove if unnecessary
      isLoading: false,
      isTranscribing: false, // is the NN model working on transcribing
      isStarted: false,// has user started
      isModelLoaded: false, // is the magenta model loaded
      isPlaying: false, // is the player playing

      fileMidiExample: '', // example file name
    };
    this.initPlayer(); // load and init player at beginning
    this.visualizer = null;
    this.mmCanvasRef = React.createRef();
    this.waveCanvasRef = React.createRef();

    // upload file
    this.fileInputRef = React.createRef();
    this.fileInput = null;

    // don't touch until start
    this.ns = null;
    this.midi = null;

    // only use if user uploaded a non-midi audio
    this.model = null;

    // file reader for blob manipulation
    this.fileReader = new FileReader(); 
  }
  // anonymous sign in for later
  // componentDidMount() {
  //   this.props.firebase.auth().signInAnonymously().catch(function(error) {
  //       // Handle Errors here.
  //       var errorCode = error.code;
  //       var errorMessage = error.message;
  //       console.log(errorMessage);
  //       return alert("Firebase sign in error, code: " + String(errorCode));
  //   });
  //   this.props.firebase.auth().onAuthStateChanged(user => this.authObserver(user));
  // }
  // authObserver (user) {
  //   if (user && user.isAnonymous) {
  //     this.setState({isAnonymousUserSignedIn:true});
  //   } else { // User is signed out or not anonymous
  //     this.setState({isAnonymousUserSignedIn:false});
  //   }
  // }
  // loadPlayer() {
  //   return new Promise(resolve => {
  //     // let p = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/salamander';
  //     resolve(new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/salamander'));
  //   });
  // }
  async initPlayer() {
    this.player = await (() => new Promise(resolve=>{resolve(new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/salamander'));}))();
    // let player = await this.loadPlayer();
    // TODO: fix some bug after magenta 1.1.15 but I don't know what that is
    this.player.callbackObject = {
      // run: (note) => {
      //   const currentNotePosition = this.visualizer.redraw(note);
      //   // See if we need to scroll the container.
      //   const containerWidth = container.getBoundingClientRect().width;
      //   if (currentNotePosition > (container.scrollLeft + containerWidth)) {
      //     container.scrollLeft = currentNotePosition - 20;
      //   }
      // },
      stop: () => {this.state.setState({isPlaying:false});}
    };
    return this.setState({
      isPlayerLoaded: true,
    });
  }
  handleExampleListOpen = () => {
    this.setState({ isExampleListOpen: true });
  };
  handleExampleListClose = () => {
    this.setState({ isExampleListOpen: false });
  };
  handleSelection = event => {
    this.setState({ [event.target.name]: event.target.value, userDecision: 1, });
    this.fileInput = null; // if selection made here, remove uploaded ones
  };
  handleUpload() {
    this.fileInput = null; // reset
    if(!this.fileInputRef.current.files || !this.fileInputRef.current.files[0]) {
      this.fileInputRef.current.files = null; // reset
      return alert("Error, failed to upload the file. Uploaded file non-exists.");
    }
    this.fileInput = this.fileInputRef.current.files[0];
    if(this.fileInput.type.indexOf('audio')===-1) {
      this.fileInputRef.current.files = null; // reset
      return alert("Error, file uploaded is not legal audio file. Please check the file's MIME type")
    }
    // // check file size
    // if(this.fileInput.size > MAX_UPLOAD_SIZE) {
    // }
    if(this.fileInput.type === ('audio/mid')) { // midi file
      this.midi = this.fileInput; // blob
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
  async handleStart() {
    this.setState({isLoading: true});
    if(!this.state.userDecision) { // unlikely to happen
      return alert("Please choose an input to proceed");
    }
    if(this.state.userDecision===1) { // fetch midi from storage

      let midiFileRef = this.props.firebase.storage().ref('midi-samples/'+this.state.fileMidiExample);
      midiFileRef.getDownloadURL().then(async url => {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = async event => {
          this.midi = xhr.response;
          this.fileReader.onload = async () => {
            this.ns = mm.midiToSequenceProto(this.fileReader.result); // string
            await this.setUpContent();
          }
          this.fileReader.readAsBinaryString(xhr.response);
        };
        xhr.open('GET', url);
        xhr.send();
      }).catch(error => {
        // TODO: more graceful error handling
        console.log(error);
      });

    } else if(this.state.userDecision===2) { // uploaded midi

      this.midi = this.fileInput;
      this.fileReader.onload = async () => {
        this.ns = mm.midiToSequenceProto(this.fileReader.result); // string
        await this.setUpContent();
      }
      this.fileReader.readAsBinaryString(this.fileInput);

    } else if(this.state.userDecision===3) { // uploaded non-midi

      await this.transcribeAudioFile(); // will set this.ns
      await this.setUpContent();

    }
    // set started and clear fileInput in setUpContent()
  }
  handleAnew() { // give user an option to start over
  }
  async transcribeAudioFile() {
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
        this.midi = new Blob([mm.sequenceProtoToMidi(ns)]);
        this.setState({
          isTranscribing: false,
        });
      });
    });
  }
  async setUpContent() {
    this.setState({isStarted: true});
    this.player.loadSamples(this.ns).then(() => {
      this.visualizer = new mm.Visualizer(this.ns, this.mmCanvasRef.current, {
        noteRGB: '255, 255, 255', 
        activeNoteRGB: '232, 69, 164', 
        pixelsPerTimeStep: window.innerWidth < 500 ? null: 80,
      });

      // ???
      // resetUIState();
      // showVisualizer();

      // reset
      this.fileInput = null;
      this.state.fileMidiExample = '';

      this.setState({
        isLoading: false,
      });
    });
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
                "Start or stop the audio play"
              }
            </Typography>
          </Grid>

          {/* Main Content */}
          {(!this.state.isStarted) ? ( 
            <React.Fragment>

            {/* Welcome Menu */}
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
                  <Button fullWidth={true} color="secondary" variant="contained" className={classes.button} onClick={() => this.handleExampleListOpen()}>
                    Examples
                  </Button>
                    <ExampleMidiDialog 
                      fileMidiExample = { this.state.fileMidiExample }
                      handleExampleFileSelection = { this.handleSelection }
                      handleExampleListClose = { () => this.handleExampleListClose() }
                      isExampleListOpen = { this.state.isExampleListOpen }
                      classes = { classes }
                    />
                </Grid>

              </Grid>
            </Grid>

            { /* Additional Instruction for New Users */ }
            <Grid item xs={6} sm={6} lg={6}>
              <Typography>
                You can upload a midi file or other audio file. <br/> If you upload a non-midi audio file, this app will use a NN to transcribe the music for you.
              </Typography>
            </Grid>

            {/* Reactions to User's decision */}
            <Grid item xs={6} sm={6} lg={6}>
            { (this.state.userDecision > 0) &&
              <Typography variant="body1" align="center" className="midi-trainer-body">
                The file chosen is: <br/> "{ (this.state.userDecision === 1) ? this.state.fileMidiExample : this.fileInput.name}"
              </Typography>
            }
            </Grid>

            </React.Fragment>
          ) : (
            <React.Fragment>
              {/* <CanvasCard canvasId="mm-canvas" canvasRef={this.mmCanvasRef} /> */}
              <canvas ref={this.mmCanvasRef}> </canvas>
            </React.Fragment>
          )}

          {/* The control button */}
          {(!this.state.isStarted)?(
            <React.Fragment>

            <Grid item xs={"auto"}>
              {(!this.state.isTranscribing)?(
                <Button disabled={!(this.state.userDecision && this.state.isPlayerLoaded) || (this.state.isLoading)} variant="contained" color="secondary" className="button pitch-trainer-button" onClick={() => this.handleStart()}>
                  <ArrowRightIcon className="leftIcon pitch-trainer-leftIcon" />
                  {!(this.state.userDecision && this.state.isPlayerLoaded) ? (!this.state.isPlayerLoaded ? "Loading" : "Waiting") : ( (this.state.isLoading) ? "Loading" : "Start")}
                </Button>
              ):(
                <Button disabled variant="contained" color="secondary" className="button pitch-trainer-button">
                  {/* TODO: test progress */}
                  <CircularProgress className={classes.progress} />
                  Transcribing
                </Button>
              )}
            </Grid>

            {/* Additional reactions to User's decision if uploaded non-midi audio file */}
            { (this.state.userDecision===3) &&
                <Grid item xs={6} sm={6} lg={6}>
                  <Typography variant="body1" align="center" className="midi-trainer-body">
                    A non-midi audio file is detected. This app uses a piano transcription neural network model. <br/>
                    The accuracy may decrease if the file contains different instruments or is very complicated. <br/> <br/>
                  </Typography>
                  <Typography variant="subtitle2" align="center" className="midi-trainer-body">
                    All happens locally in your browser using <a href="https://g.co/magenta">Magenta.js</a> and <a href="https://js.tensorflow.org/">TensorFlow.js</a>.
                  </Typography>
                </Grid>
            }

            </React.Fragment>
          ) : (
            <Grid item xs={"auto"}>

              <Button variant="contained" color="secondary" className="button pitch-trainer-button" onClick={() => this.handleAnew()}>
              <StopIcon className="leftIcon pitch-trainer-leftIcon" />
              Restart
              </Button>

            </Grid>
          )}

        </Grid>
      </div>
    );
  }
}

MidiTrainer.propTypes = {
  classes: PropTypes.object.isRequired,
  firebase: PropTypes.shape({
    storage: PropTypes.func.isRequired
  })
};

const enhance = compose(
  withStyles(styles),
  firebaseConnect()
);

// export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(App)); // recompose?
export default enhance(MidiTrainer);