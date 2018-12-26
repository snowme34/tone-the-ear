import os
from mido import MidiFile

midiNames = []
fileNames = []
filesWithMultipleTracks = []

# debug
# with open("input.js") as f:
#     content = f.readlines()
# content = [x.strip() for x in content][1:-1]
# wholeFile = ''.join(content)

for filename in os.listdir(os.getcwd()):
  try:
    mid = MidiFile(filename)
    midiNames.append(mid.tracks[0].name)
    fileNames.append(filename)
    if len(mid.tracks) > 1:
      filesWithMultipleTracks.append(filename)
      print(mid.tracks[1])
  except Exception as e:
    print("Error file:"+filename)

for f in filesWithMultipleTracks:
  print(f)

print(len(fileNames))
print(len(midiNames))

indexFile = open("MIDI_EXAMPLES.js", 'w')
indexFile.write("export const MIDI_EXAMPLES = {\n")

for i in range(len(fileNames)):
  indexFile.write("'" + fileNames[i] + "':'" + fileNames[i][:-4] + "(" + midiNames[i] + ")',\n")
  # if fileNames[i] not in wholeFile:
    # print(fileNames[i])

indexFile.write("};\n")
indexFile.close()