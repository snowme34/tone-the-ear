import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose'
import { firebaseConnect } from 'react-redux-firebase'
import * as mm from '@magenta/music'; // can we minimize this import?
import * as tf from '@tensorflow/tfjs'; // necessary?
import WaveSurfer from 'wavesurfer.js';
import { parse as MidiConvertParse } from 'midiconvert';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import StopIcon from '@material-ui/icons/Stop';
import PauseIcon from '@material-ui/icons/Pause';
import RefreshIcon from '@material-ui/icons/Refresh';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CanvasCard from '../components/CanvasCard'
import ReactVirtualizedTable from '../components/ReactVirtualizedTable'
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
  CanvasCardGrid: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    [theme.breakpoints.up('md')]: {
      width: '80%',
    },
    [theme.breakpoints.up('lg')]: {
      width: '80%',
    },
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
            You can choose an example MIDI file from the <b>huge</b> list below: <br/>
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

          <DialogContentText style={{ align:'center'}}>
            <br/>(Files from <a href="http://www.piano-midi.de/midi_files.htm">www.piano-midi.de</a> by Bernd Krueger. All the information extracted from those files and playbacks are licensed under the <a href="https://creativecommons.org/licenses/by-sa/3.0/de/deed.en">cc-by-sa Germany License</a>)
          </DialogContentText>

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

// const PROPER_UPLOAD_SIZE = 

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
      isPaused: false, // is the player paused

      tfBackend: 'webgl',

      fileMidiExample: '', // example file name
    };
    this.initPlayer(); // load and init player at beginning
    this.visualizer = null;
    this.wavesurfer = null;
    this.mmCanvasRef = React.createRef();
    this.spCanvasRef = React.createRef();
    this.nsCanvasRef = React.createRef();

    // upload file
    this.fileInputRef = React.createRef();
    this.fileInput = null;

    // don't touch until start
    this.ns = null;
    this.midi = null;
    this.midiJSON = null;
    this.noteTableRows = null;

    // only use if user uploaded a non-midi audio
    this.model = null;

    // file reader for blob manipulation
    this.fileReader = new FileReader(); 

    this.noteTableCols = [
      {
        width: 200,
        label: 'Note Name',
        dataKey: 'name',
      },
      {
        width: 200,
        flexGrow: 1.0,
        label: 'Start Time',
        dataKey: 'time',
        numeric: true,
      },
      {
        width: 200,
        flexGrow: 1.0,
        label: 'Duration',
        dataKey: 'duration',
        numeric: true,
      },
      {
        width: 200,
        flexGrow: 1.0,
        label: 'Velocity',
        dataKey: 'velocity',
        numeric: true,
      },
    ];
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
  async initPlayer() {
    this.player = await (() => new Promise(resolve=>{resolve(new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/salamander'));}))();
    // TODO: fix some bug after magenta 1.1.15 but I don't know what that is https://glitch.com/edit/#!/piano-scribe?path=app.js:154:40
    this.player.callbackObject = {
      run: (note) => {
        const currentNotePosition = this.visualizer.redraw(note);
      //   // See if we need to scroll the container.
      //   const containerWidth = container.getBoundingClientRect().width;
      //   if (currentNotePosition > (container.scrollLeft + containerWidth)) {
      //     container.scrollLeft = currentNotePosition - 20;
      //   }
      },
      // stop: () => {this.state.setState({isPlaying:false});}
    };
    this.setState({
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
  handleChangeTfBackend() {
    const tfBackend = (this.state.tfBackend==='cpu')?'webgl':'cpu';
    this.setState({ tfBackend, });
  }
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
    // if(this.fileInput.size > PROPER_UPLOAD_SIZE) {
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
    if(!this.state.userDecision) { // unlikely to happen
      return alert("Please choose an input to proceed");
    }
    this.setState({isLoading: true});
    if(this.state.userDecision===1) { // fetch midi from storage
      try {
        let midiFileUrl = await this.props.firebase.storage().ref('midi-samples/'+this.state.fileMidiExample).getDownloadURL();
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = async event => {
          this.midi = xhr.response;
          this.fileReader.onload = async () => {
            this.ns = await mm.midiToSequenceProto(this.fileReader.result); // string
            this.midiJSON = await MidiConvertParse(this.fileReader.result);
            this.setUpContent();
          }
          this.fileReader.readAsBinaryString(xhr.response);
        };
        xhr.open('GET', midiFileUrl);
        xhr.send();
      } catch(error) {
        console.log(error); // TODO: more graceful error handling
      };
    } else if(this.state.userDecision===2) { // uploaded midi
      this.midi = this.fileInput;
      this.fileReader.onload = async () => {
        this.ns = mm.midiToSequenceProto(this.fileReader.result); // string
        this.midiJSON = await MidiConvertParse(this.fileReader.result);
        this.setUpContent();
      }
      this.fileReader.readAsBinaryString(this.fileInput);
    } else if(this.state.userDecision===3) { // uploaded non-midi
      this.setState({ isTranscribing: true, });
      const ns = await this.getNSFromTranscribeAudioFile();
      const midiInArray = mm.sequenceProtoToMidi(ns); //uint8array
      this.ns = ns; this.midi = new Blob([midiInArray]);
      this.fileReader.onload = async () => {
        this.midiJSON = await MidiConvertParse(this.fileReader.result);
        this.setState({ isTranscribing: false, });
        this.setUpContent();
      }
      this.fileReader.readAsBinaryString(this.midi);
    }
    // set started and clear fileInput in setUpContent()
  }
  handleAnew() { // give user an option to start over
    if(this.state.isModelLoaded) this.model.dispose();
    this.setState({
      userDecision: 0, 
      // isAnonymousUserSignedIn: false,
      isExampleListOpen: false,
      isUploading: false,
      isLoading: false,
      isTranscribing: false,
      isStarted: false,
      isModelLoaded: false,
      isPlaying: false,
      isPaused: false,
      tfBackend: 'webgl',
      fileMidiExample: '',
    });
    this.visualizer = null;
    this.wavesurfer = null;
    this.fileInput = null;
    this.ns = null;
    this.midi = null;
    this.midiJSON = null;
    this.noteTableRows = null;
    this.handlePlayerStop();
  }
  handlePlayerStart() {
    // user can 'restart' at any time
    this.setState({isPlaying:true, isPaused:false,});
    this.player.start(this.ns);
    if(this.wavesurfer) { this.wavesurfer.play(); }
  }
  handlePlayerResumePause() {
    if(!this.state.isPlaying && this.state.isPaused) { 
      this.setState({isPlaying:true, isPaused:false,});
      this.player.resume();
      if(this.wavesurfer) { this.wavesurfer.playPause(); }
    } else if(this.state.isPlaying && !this.state.isPaused) {
      this.setState({isPlaying:false, isPaused:true,});
      this.player.pause();
      if(this.wavesurfer) { this.wavesurfer.playPause(); }
    }
  }
  handlePlayerStop() {
    if(this.state.isPlaying) {
      this.setState({isPlaying:false, isPaused:false,});
      this.player.stop();
      if(this.wavesurfer) { this.wavesurfer.stop(); }
    }
  }
  async getNSFromTranscribeAudioFile() {
    if(this.state.tfBackend!==tf.getBackend()) tf.setBackend(this.state.tfBackend);
    // don't reinitialize model
    if(this.state.isModelLoaded) {
      this.model.dispose();
    } else {
      this.model = new mm.OnsetsAndFrames('https://storage.googleapis.com/magentadata/js/checkpoints/transcription/onsets_frames_uni');
      await this.model.initialize();
    }
    this.setState({ isModelLoaded: true, });

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
    return this.model.transcribeFromAudioFile(this.fileInputRef.current.files[0]);
  }
  async getNoteTableRows() {
    let id = 0, rows = [], note;
    const numTracks = this.midiJSON["tracks"].length;
    for(let trackIdx = 0; trackIdx < numTracks; ++trackIdx) {
      const numNotes = this.midiJSON["tracks"][trackIdx].length;
      for(let noteIdx = 0; noteIdx < numNotes; ++noteIdx) {
        note = this.midiJSON["tracks"][trackIdx]["notes"][noteIdx];
        id += 1;
        rows.push({
          id,
          name: note["name"],
          time: note["time"],
          duration: note["duration"],
          velocity: note["velocity"],
        });
      }
    }
    return rows;
  }
  async setUpContent() {
    this.noteTableRows = await this.getNoteTableRows();
    this.setState({isStarted: true});
    await this.player.loadSamples(this.ns);
    this.visualizer = new mm.Visualizer(this.ns, this.mmCanvasRef.current, {
      noteRGB: '66, 165, 245', 
      activeNoteRGB: '236, 64, 122', 
      // activeNoteRGB: '232, 69, 164', 
      pixelsPerTimeStep: window.innerWidth < 500 ? null: 80,
    });

    // TODO: figure out a way to output midi waveform
    if(this.state.userDecision===3) {
      this.wavesurfer = WaveSurfer.create({
        container: '#sp-container',
        waveColor: '#64B5F6',
        progressColor: '#BA68C8'
      });
      this.wavesurfer.loadBlob(this.fileInput);
    }

    this.setState({ isLoading: false, });
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
          // justify="center"
          style={{margin: 'auto', minHeight: '70vh', width:'100%'}}
        >

          {/* Instruction */}
          <Grid item>
            {!this.state.isStarted ? (
              <Typography variant="body1" align="center" className="midi-trainer-body">
                  Upload an audio file or choose an existing midi file to begin
              </Typography>
            ) : (
              <Typography variant="body1" align="center" className="midi-trainer-body">
                The file using is: <br/> "{ (this.state.userDecision === 1) ? this.state.fileMidiExample : this.fileInput.name}"
              </Typography>
            )}
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
                You can upload a midi file or other audio file. <br/> <br/>
                If you upload a non-midi audio file, this app will use a NN to transcribe the music for you. <br/> <br/>
                Currently the maximum duration supported is around 220 seconds. Will improve in the future.
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

            <Grid item xs={10} sm={10} lg={10}>
              <Grid container spacing={16} direction="row" align="center" justify="center" style={{margin: 'auto', width:'100%'}}>

                <Grid item xs={4} sm={4}>
                  <Button fullWidth={true} disabled={!this.state.isPlaying} variant="contained" color="secondary" className="button midi-trainer-button" onClick={() => this.handlePlayerStop()}>
                  <StopIcon className="leftIcon midi-trainer-leftIcon" />
                  Stop
                  </Button>
                </Grid>

                <Grid item xs={4} sm={4}>
                  <Button fullWidth={true} variant="contained" color="secondary" className="button midi-trainer-button" onClick={() => this.handlePlayerStart()}>
                  <PlayArrowIcon className="leftIcon midi-trainer-leftIcon" />
                  Play
                  </Button>
                </Grid>

                <Grid item xs={4} sm={4}>
                  <Button fullWidth={true} disabled={!this.state.isPlaying && !this.state.isPaused} variant="contained" className="button midi-trainer-button" onClick={() => this.handlePlayerResumePause()}>
                    {(this.state.isPaused) ? 
                      (<PlayArrowIcon className="leftIcon midi-trainer-leftIcon" />) :
                      (<PauseIcon className="leftIcon midi-trainer-leftIcon" />)
                    }
                    {(this.state.isPaused) ? ("Resume") : ("Pause")}
                  </Button>
                </Grid>

              </Grid>
            </Grid>

            <Grid item xs={10} sm={10} lg={10} className={classes.CanvasCardGrid}>
                <CanvasCard 
                  className={classes.CanvasCard}
                  title="Visualization of Notes"
                  subheader=""
                  canvasID="mm-canvas"
                  ref={this.mmCanvasRef}
                  footText='Using the visualizer from Magenta.js'
                  // onMount={() => {console.log("Mounted!");if(this.visualizer) this.visualizer.redraw();}}
                  // onCanvasClick={() => {console.log("Clicked!"); this.visualizer.redraw();}}
                 />
            </Grid>
            {/* TODO: prompt user that spectrum will be available if uploaded non-midi audio */}
            { (this.state.userDecision===3) &&
              <Grid item xs={10} sm={10} lg={10} className={classes.CanvasCardGrid}>
                  <CanvasCard
                    className={classes.CanvasCard}
                    title="Spectrum of Audio"
                    subheader=""
                    noCanvas={true}
                  >
                    <div id="sp-container"> </div>
                  </CanvasCard>
              </Grid>
            }
            <Grid item xs={10} sm={10} lg={10} className={classes.CanvasCardGrid}>
                  <CanvasCard
                    className={classes.CanvasCard}
                    title="Table of Notes"
                    subheader=""
                    noCanvas={true}
                  >
                  <ReactVirtualizedTable rows={this.noteTableRows} cols={this.noteTableCols}/>
                  </CanvasCard>
            </Grid>

            </React.Fragment>
          )}

          {/* The control button */}
          {(!this.state.isStarted)?(
            <React.Fragment>

            <Grid item xs={"auto"}>
              {(!this.state.isTranscribing)?(
                <Button disabled={!(this.state.userDecision && this.state.isPlayerLoaded) || (this.state.isLoading)} variant="contained" color="secondary" className="button midi-trainer-button" onClick={() => this.handleStart()}>
                  <ArrowRightIcon className="leftIcon midi-trainer-leftIcon" />
                  {!(this.state.userDecision && this.state.isPlayerLoaded) ? (!this.state.isPlayerLoaded ? "Loading" : "Waiting") : ( (this.state.isLoading) ? "Loading" : "Start")}
                </Button>
              ):(
                <Button disabled variant="contained" color="secondary" className="button midi-trainer-button">
                  {/* TODO: test progress */}
                  <CircularProgress className={classes.progress} />
                  Transcribing
                </Button>
              )}
            </Grid>

            {/* Additional reactions to User's decision if uploaded midi audio file */}
            { (this.state.userDecision===2) &&
                <Grid item xs={6} sm={6} lg={6}>
                  <Typography variant="body1" align="center" className="midi-trainer-body">
                    A midi file is detected. This app uses a piano soundfont to play the music. <br/>
                    It does not make sense to covert everything to piano. <br/>
                    So, the non-piano part of your midi file might not be properly played later. <br/>
                    But the analysis will work as usual.
                  </Typography>
                </Grid>
            }

            {/* Additional reactions to User's decision if uploaded non-midi audio file */}
            { (this.state.userDecision===3) &&
                <Grid item xs={6} sm={6} lg={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        disabled={this.state.isModelLoaded || this.state.isTranscribing || this.state.isStarted}
                        checked={this.state.tfBackend==='cpu'}
                        onChange={()=>this.handleChangeTfBackend()}
                        value="tfBackend"
                      />
                    }
                    label="Use CPU as Tensorflow backend"
                  />
                  <Typography variant="body1" align="center" className="midi-trainer-body">
                    A non-midi audio file is detected. This app uses a piano transcription neural network model.
                    Use the switch above to toggle tensorflow backend of the neural network model.
                    Use CPU if the file is very large (longer than 2.5 min for mp3 file).
                    But CPU backend will be around 10 times slower. (It takes CPU backend around 700s to transcribe a 3 min mp3 file) <a href="https://github.com/snowme34/tone-the-ear/issues/21">Why</a>?<br/>
                    The accuracy may decrease if the file contains different instruments or is very complicated.  <br/> <br/>
                  </Typography>
                  <Typography variant="subtitle2" align="center" className="midi-trainer-body">
                    All happens locally in your browser using <a href="https://g.co/magenta">Magenta.js</a> and <a href="https://js.tensorflow.org/">TensorFlow.js</a>.
                  </Typography>
                </Grid>
            }

            </React.Fragment>
          ) : (
            <Grid item xs={"auto"}>
              <Button variant="contained" color="secondary" className="button midi-trainer-button" onClick={() => this.handleAnew()}>
              <RefreshIcon className="leftIcon midi-trainer-leftIcon" />
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

export default compose(
  withStyles(styles),
  firebaseConnect()
)(MidiTrainer);