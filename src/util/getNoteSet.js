function getNoteSet(startNote, endNote) {
  if(startNote==='C1' && endNote === 'C3') {
    return 0;
  } else if(startNote==='C2' && endNote === 'C4') {
    return 1;
  } else if(startNote==='C3' && endNote === 'C5') {
    return 2;
  } else if(startNote==='C4' && endNote === 'C6') {
    return 3;
  } else if(startNote==='C5' && endNote === 'C7') {
    return 4;
  } else if(startNote==='C6' && endNote === 'C8') {
    return 5;
  } else {
    return 6;
  }
}

export default getNoteSet;