let stream = null,
    audio = null,
    mixedStream = null,
    chunks = [],
    recorder = null,
    startBtn = null,
    endBtn = null,
    // downloadBtn = null,
    recorderVideo = null;

const setUpStream = async () => {
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
        });

        audio = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100,
            },
        });

        setUpVideoFeedback();
    } catch (error) {
        // TODO
        console.error(error);
    }
};

const setUpVideoFeedback = () => {
    if (stream) {
        const video = document.getElementById('videoFeedback');
        video.srcObject = stream;
        video.play();
    } else {
        console.warn('no stream...');
    }
};

const startRecording = async () => {
    await setUpStream();
    if (stream && audio) {
        startBtn.disabled = true;
        mixedStream = new MediaStream([
            ...stream.getTracks(),
            ...audio.getTracks(),
        ]);
        recorder = new MediaRecorder(mixedStream);
        recorder.ondataavailable = handleDataAvailable;
        recorder.onstop = handleStop;
        recorder.start(200);

        console.log('recording started');
        endBtn.disabled = false;
    } else {
        console.log('no stream or audio');
    }
};

const handleDataAvailable = (e) => {
    chunks.push(e.data);
};

const handleStop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    chunks = [];

    // downloadBtn.href = URL.createObjectURL(blob);
    // downloadBtn.download = 'video.mp4';
    // downloadBtn.disabled = false;

    recordedVideo.src = URL.createObjectURL(blob);
    recordedVideo.load();
    recordedVideo.onloadeddata = () => {
        const wrapper = document.querySelector('.recorded-video-wrapper');
        wrapper.classList.remove('hidden');

        recorderVideo.play();

        recordedVideo.scrollIntoView({ behavior: 'smooth' });
    };

    stream.getTracks().forEach((track) => track.stop());
    audio.getTracks().forEach((track) => track.stop());

    console.log('video prep for download');
};

const stopRecording = () => {
    recorder.stop();
    startBtn.disabled = false;
    endBtn.disabled = true;
    console.log('recording stopped');
};

const startRecordingCountdown = () => {
    const cdWrapper = document.querySelector('.countdown');
    const countLabel = cdWrapper.getElementsByTagName('h1');
    cdWrapper.classList.remove('hidden');

    let COUNT = 3;
    const timer = setInterval(() => {
        countLabel[0].innerHTML = COUNT;
        COUNT = COUNT - 1;

        if (COUNT < 0) {
            cdWrapper.classList.add('hidden');
            startRecording();
            clearInterval(timer)
        }
    }, 1000);
};

window.addEventListener('load', () => {
    console.log(2);

    startBtn = document.getElementById('startRecording');
    endBtn = document.getElementById('stopRecording');
    // downloadBtn = document.getElementById('downloadVideo');
    recorderVideo = document.getElementById('recordedVideo');

    startBtn.addEventListener('click', startRecordingCountdown);
    endBtn.addEventListener('click', stopRecording);
});
