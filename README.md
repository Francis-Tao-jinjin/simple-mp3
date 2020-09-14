# simple-mp3

`
npm i simple-mp3
`

A simple helper to encode audio file to mp3, hide all the complicated detail of calling lamejs.

## type and parameters
```javascript
simpleMp3(param: {
    channelData: Float32Array[];
    sampleRate: number;
    bytePerSample?: number;
    quality?: number;
}, onProgress?: (val: number) => any): ArrayBuffer[];
```
### channelData

an array that contain the channel data, you can get channel data from audioBuffer by calling `getChannelData`.

### sampleRate

the sample rate of the original audio, if you make this value different from the sampleRate of the original audio, then the output you get will turn out to has a different duration and the pitch of the sound will also be changed.

### bytePerSample

how many byte for each sample you want in the mp3 file. **It can only be 1, 2, or 4.** Default value is 2.

### quality

the Bit-Rate of the mp3 file. default value is 192.

## usage
```javascript
const { simpleMp3 } = require('simpleMp3');

...
...

const numberOfChannels = audioBuffer.numberOfChannels;
const channelData = [];
for (let i = 0; i < numberOfChannels; ++i) {
    channelData.push(audioBuffer.getChannelData(i));
}
const mp3Data = simpleMp3({
    channelData,
    sampleRate: audioBuffer.sampleRate,
}, (progress) => {
    console.log('encode progress:', progress);
});

// now download the mp3 file
const anchor = document.createElement('a');
document.body.appendChild(anchor);
anchor.style.display = 'none';
const blob = new window.Blob(data, { type: 'audio/mpeg' });
const url = URL.createObjectURL(blob);
anchor.href = url;
anchor.download = 'audio.mp3';
anchor.click();
URL_API.revokeObjectURL(url);
```
