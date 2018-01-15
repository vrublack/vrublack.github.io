// author: github.com/pachacamac
// source: https://gist.github.com/pachacamac/d7b3d667ecaa0cd39f36

var Recording = function (cb)
{
    var recorder = null;
    var recording = true;
    var audioInput = null;
    var volume = null;
    var audioContext = null;
    var callback = cb;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (navigator.getUserMedia)
    {
        navigator.getUserMedia({audio: true},
            function (e)
            { //success
                var AudioContext = window.AudioContext || window.webkitAudioContext;
                audioContext = new AudioContext();
                volume = audioContext.createGain(); // creates a gain node
                audioInput = audioContext.createMediaStreamSource(e); // creates an audio node from the mic stream
                audioInput.connect(volume);// connect the stream to the gain node
                recorder = audioContext.createScriptProcessor(2048, 1, 1);
                recorder.onaudioprocess = function (e)
                {
                    if (!recording) return;
                    var left = e.inputBuffer.getChannelData(0);
                    //var right = e.inputBuffer.getChannelData(1);
                    callback(new Float32Array(left));
                };
                volume.connect(recorder);// connect the recorder
                recorder.connect(audioContext.destination);

                console.log('Started listening...');
            },
            function (e)
            { //failure
                alert('Error capturing audio.');
            }
        );
    } else
    {
        alert('getUserMedia not supported in this browser.');
    }
};
var lastClap = (new Date()).getTime();

function detectClap(data)
{
    var t = (new Date()).getTime();
    if (t - lastClap < 100) return false; // TWEAK HERE
    var zeroCrossings = 0, highAmp = 0;
    for (var i = 1; i < data.length; i++)
    {
        if (Math.abs(data[i]) > 0.05) highAmp++; // TWEAK HERE
        if (data[i] > 0 && data[i - 1] < 0 || data[i] < 0 && data[i - 1] > 0) zeroCrossings++;
    }
    if (highAmp > 15 && zeroCrossings > 20)
    { // TWEAK HERE
        //console.log(highAmp+' / '+zeroCrossings);
        lastClap = t;
        return true;
    }
    return false;
}
