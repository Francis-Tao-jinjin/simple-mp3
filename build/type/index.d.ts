export declare function simpleMp3(param: {
    channelData: Float32Array[];
    sampleRate: number;
    bytePerSample?: number;
    quality?: number;
}, onProgress?: (val: number) => any): ArrayBuffer[];
