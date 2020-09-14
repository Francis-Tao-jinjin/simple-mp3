const { simpleMp3 } = require('./build/simpleMp3');

console.log(simpleMp3);

const URL_API = (typeof window === 'undefined') ? null : (window.URL || (window).webkitURL || null);

function export_to_audio_file(filename, data) {
    if (!URL_API) {
        return;
    }
    const anchor = document.createElement('a');
    document.body.appendChild(anchor);
    anchor.style.display = 'none';
    const blob = new window.Blob(data, {
        type: 'audio/mpeg',
    });
    const url = URL_API.createObjectURL(blob);
    anchor.href = url;
    anchor.download = `${filename}.mp3`;
    anchor.click();
    URL_API.revokeObjectURL(url);
}
function triggerAttackRelease(ctx, frequency, time, duration) {
    const osc = ctx.createOscillator(); 
    osc.frequency.value = frequency;

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.exponentialRampToValueAtTime(1, time + 0.1);
    envelope.gain.exponentialRampToValueAtTime(0.5, time + 0.15);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + 1.15);
    osc.connect(envelope).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + duration);
}

const audioCtx = new AudioContext();

function render() {
    const offlineCtx = new OfflineAudioContext(2, 44100 * 2, 44100);
    const now = offlineCtx.currentTime;
    triggerAttackRelease(offlineCtx, 293.66, now, 0.25);
    triggerAttackRelease(offlineCtx, 329.63, now + 0.25, 0.25);
    triggerAttackRelease(offlineCtx, 293.66, now + 0.5, 0.25);
    triggerAttackRelease(offlineCtx, 329.63, now + 0.75, 0.25);

    triggerAttackRelease(offlineCtx, 293.66, now + 1, 0.25);
    triggerAttackRelease(offlineCtx, 329.63, now + 1.25, 0.25);
    triggerAttackRelease(offlineCtx, 261.63, now + 1.5, 0.5);

    offlineCtx.startRendering().then(function(renderedBuffer) {
        console.log(renderedBuffer);
        var song = audioCtx.createBufferSource();
        song.buffer = renderedBuffer;
        song.connect(audioCtx.destination);
        song.start();

        console.log('offline rendering finished');
        const numberOfChannels = renderedBuffer.numberOfChannels;
        const channelData = [];
        for (let i = 0; i < numberOfChannels; ++i) {
            channelData.push(renderedBuffer.getChannelData(i));
        }
        const mp3Data = simpleMp3({
            channelData,
            sampleRate: renderedBuffer.sampleRate,
        }, (progress) => {
            console.log('encode progress:', progress);
        });
        export_to_audio_file('test', mp3Data);
    });
}

const Button = document.createElement('button');
Button.innerText = 'test';
window.document.body.append(Button);

Button.onclick = () => {
    render();
}