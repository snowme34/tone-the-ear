// import getNotesBetween from '../util/getNotesBetween'
import getNoteSet from '../util/getNoteSet'

export default function getKeyMap(startNote, endNote){
  const set = getNoteSet(startNote, endNote);
  switch (set) {
    case 0:
      return {
        'TAB': 'C1',
        1: 'C#1',
        Q: 'D1',
        2: 'D#1',
        W: 'E1',
        E: 'F1',
        4: 'F#1',
        R: 'G1',
        5: 'G#1',
        T: 'A1',
        6: 'A#1',
        Y: 'B1',
        U: 'C2',
        8: 'C#2',
        I: 'D2',
        9: 'D#2',
        O: 'E2',
        P: 'F2',
        '-': 'F#2',
        '[': 'G2',
        '=': 'G#2',
        ']': 'A2',
        'BACKSPACE': 'A#2',
        '\\': 'B2',
        'ENTER': 'C3',
      };
      break;
    case 1:
      return {
        'TAB': 'C2',
        1: 'C#2',
        Q: 'D2',
        2: 'D#2',
        W: 'E2',
        E: 'F2',
        4: 'F#2',
        R: 'G2',
        5: 'G#2',
        T: 'A2',
        6: 'A#2',
        Y: 'B2',
        U: 'C3',
        8: 'C#3',
        I: 'D3',
        9: 'D#3',
        O: 'E3',
        P: 'F3',
        '-': 'F#3',
        '[': 'G3',
        '=': 'G#3',
        ']': 'A3',
        'BACKSPACE': 'A#3',
        '\\': 'B3',
        'ENTER': 'C4',
      };
      break;
    // default as case 2
    case 3:
      return {
        'TAB': 'C4',
        1: 'C#4',
        Q: 'D4',
        2: 'D#4',
        W: 'E4',
        E: 'F4',
        4: 'F#4',
        R: 'G4',
        5: 'G#4',
        T: 'A4',
        6: 'A#4',
        Y: 'B4',
        U: 'C5',
        8: 'C#5',
        I: 'D5',
        9: 'D#5',
        O: 'E5',
        P: 'F5',
        '-': 'F#5',
        '[': 'G5',
        '=': 'G#5',
        ']': 'A5',
        'BACKSPACE': 'A#5',
        '\\': 'B5',
        'ENTER': 'C6',
      }
      break;
    case 4:
      return {
        'TAB': 'C5',
        1: 'C#5',
        Q: 'D5',
        2: 'D#5',
        W: 'E5',
        E: 'F5',
        4: 'F#5',
        R: 'G5',
        5: 'G#5',
        T: 'A5',
        6: 'A#5',
        Y: 'B5',
        U: 'C6',
        8: 'C#6',
        I: 'D6',
        9: 'D#6',
        O: 'E6',
        P: 'F6',
        '-': 'F#6',
        '[': 'G6',
        '=': 'G#6',
        ']': 'A6',
        'BACKSPACE': 'A#6',
        '\\': 'B6',
        'ENTER': 'C7',
      };
      break;
    case 5:
      return {
        'TAB': 'C6',
        1: 'C#6',
        Q: 'D6',
        2: 'D#6',
        W: 'E6',
        E: 'F6',
        4: 'F#6',
        R: 'G6',
        5: 'G#6',
        T: 'A6',
        6: 'A#6',
        Y: 'B6',
        U: 'C7',
        8: 'C#7',
        I: 'D7',
        9: 'D#7',
        O: 'E7',
        P: 'F7',
        '-': 'F#7',
        '[': 'G7',
        '=': 'G#7',
        ']': 'A7',
        'BACKSPACE': 'A#7',
        '\\': 'B7',
        'ENTER': 'C8',
      };
      break;
    default: // and case 2
      return {
        'TAB': 'C3',
        1: 'C#3',
        Q: 'D3',
        2: 'D#3',
        W: 'E3',
        E: 'F3',
        4: 'F#3',
        R: 'G3',
        5: 'G#3',
        T: 'A3',
        6: 'A#3',
        Y: 'B3',
        U: 'C4',
        8: 'C#4',
        I: 'D4',
        9: 'D#4',
        O: 'E4',
        P: 'F4',
        '-': 'F#4',
        '[': 'G4',
        '=': 'G#4',
        ']': 'A4',
        'BACKSPACE': 'A#4',
        '\\': 'B4',
        'ENTER': 'C5',
      };
      break;
  }
}

/*
function getKeyMap(startNote, endNote) {
  const n = getNotesBetween(startNote,endNote);
  let idx = 0, len = n.length - 1;
  return {
    'Q': n[Math.min(idx++,len)],
    '2': n[Math.min(idx++,len)],
    'W': n[Math.min(idx++,len)],
    '3': n[Math.min(idx++,len)],
    'E': n[Math.min(idx++,len)],
    '4': n[Math.min(idx++,len)],
    'R': n[Math.min(idx++,len)],
    '5': n[Math.min(idx++,len)],
    'T': n[Math.min(idx++,len)],
    '6': n[Math.min(idx++,len)],
    'Y': n[Math.min(idx++,len)],
    '7': n[Math.min(idx++,len)],
    'U': n[Math.min(idx++,len)],
    '8': n[Math.min(idx++,len)],
    'I': n[Math.min(idx++,len)],
    '9': n[Math.min(idx++,len)],
    'O': n[Math.min(idx++,len)],
    '0': n[Math.min(idx++,len)],
    'P': n[Math.min(idx++,len)],
    '-': n[Math.min(idx++,len)],
    '[': n[Math.min(idx++,len)],
    '=': n[Math.min(idx++,len)],
    ']': n[Math.min(idx++,len)],
    'Backspace': n[Math.min(idx++,len)],
    '\\': n[Math.min(idx++,len)],
    'Enter': n[Math.min(idx++,len)]
  };
}
*/