// https://github.com/lillydinhle/react-piano-component/blob/master/src/lib/constants/NOTES.js
export const TONES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const OCTAVE_NUMBERS = [1, 2, 3, 4, 5, 6, 7];

export default OCTAVE_NUMBERS.reduce((notes, octaveNumber) => {
  const notesInOctave = TONES.map(tone => `${tone}${octaveNumber}`);
  return [...notes, ...notesInOctave];
}, []);