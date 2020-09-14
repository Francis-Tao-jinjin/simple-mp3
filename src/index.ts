const lamejs = require('./lame');

export function simpleMp3(
    param:{
        channelData:Float32Array[],
        sampleRate:number,
        bytePerSample?:number,
        quality?:number,
    },
    onProgress?:(val:number) => any) {

    const channelData = param.channelData;
    const sampleLength = channelData[0].length;
    if (channelData.length != 1 && channelData.length != 2) {
        throw new Error('simpleMp3 Error, do not support ' + channelData.length + ' channels.');
    }
    const sampleRate = param.sampleRate ? param.sampleRate : 44100;
    const bytePerSample = param.bytePerSample ? param.bytePerSample : 2;
    if (bytePerSample !== 1 && bytePerSample !== 2 && bytePerSample !== 4) {
        throw new Error('simpleMp3 Error, bytePerSample can only be 1, 2 or 4');
    }
    const quality = param.quality ? param.quality : 192;
    const lib = new lamejs();
    const mp3encoder = (new lib.Mp3Encoder(channelData.length, sampleRate, quality));
    const mp3Data:ArrayBuffer[] = [];
    const sampleBlockSize = 1152; // Should be multiple of 576 to make fast.
    const baseProgress = 0.1;
    onProgress && onProgress(baseProgress);

    let typedArrayConstructor;
    let clampMin;
    let clampMax;
    switch (bytePerSample) {
        case 1:
            clampMin = -127;
            clampMax = 128;
            typedArrayConstructor = Int8Array;
            break;
        case 2:
            clampMin = -32767;
            clampMax = 32768;
            typedArrayConstructor = Int16Array;
            break;
        case 4:
            clampMin = -2147483647;
            clampMax = 2147483648;
            typedArrayConstructor = Int32Array;
            break;
    }

    const typedChannelData:Int8Array[]|Int16Array[]|Int32Array[] = [];
    const positiveClampMin = 0 - clampMin;
    for (let i = 0; i < channelData.length; i++) {
        const newTypedArray = new typedArrayConstructor(channelData[i].length);
        const singleChannelData = channelData[i];
        for (let j = 0; j < sampleLength; ++j) {
            const scaledValue = singleChannelData[j] * (singleChannelData[j] < 0 ? positiveClampMin : clampMax);
            newTypedArray[j] = Math.max(clampMin, Math.min(clampMax, scaledValue));
        }
        typedChannelData.push(newTypedArray);
    }
    const encodeTotalProgress = 0.85;
    for (let i = 0; i < sampleLength; i += sampleBlockSize) {
        const subarraysToProcess:typeof typedChannelData = [];
        for (let j = 0; j < typedChannelData.length; ++j) {
            subarraysToProcess.push(typedChannelData[j].subarray(i, i + sampleBlockSize) as any);
        }
        const mp3buf =
            mp3encoder.encodeBuffer.apply(mp3encoder, subarraysToProcess as any);
        if (mp3buf && mp3buf.length > 0) {
            mp3Data.push(mp3buf.buffer);
        }
        onProgress && onProgress(baseProgress + encodeTotalProgress * i / sampleLength);
    }
    const lastBit = mp3encoder.flush();
    if (lastBit && lastBit.length > 0) {
        mp3Data.push(lastBit.buffer);
    }
    return mp3Data;
}