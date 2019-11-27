if (navigator.mediaDevices) {
  console.log('getUserMedia supported.');

  var constraints = { audio: true,video:false };
  var chunks = [];

  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {

    var mediaRecorder = new MediaRecorder(stream);

    var record=document.getElementById('rec');
    var stop=document.getElementById('stop');

    record.onclick = function() {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("Memulai Rekaman ... ");
      record.style.background = "red";
      record.style.color = "black";
    }

    stop.onclick = function() {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("Rekaman berhenti ... ");
      record.style.background = "";
      record.style.color = "";
    }

    mediaRecorder.onstop = function(e) {
      console.log("data available after MediaRecorder.stop() called.");

      var clipName = prompt('Masukkan nama file rekaman : ');

      var clipContainer = document.createElement('article');
      var clipLabel = document.createElement('p');
      var audio = document.createElement('audio');
      var deleteButton = document.createElement('button');
      var downloadButton = document.createElement('button');
      var recordedChunks = [];
      var options = { mimeType: "video/webm; codecs=vp9" };
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start();

      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');
      deleteButton.innerHTML = "Hapus";
      deleteButton.setAttribute('class', 'btn btn-danger');
      deleteButton.setAttribute('type', 'button');
      downloadButton.innerHTML = "Download";
      downloadButton.setAttribute('class', 'btn btn-primary');
      downloadButton.setAttribute('type', 'button');
      clipLabel.innerHTML = clipName;

      clipContainer.appendChild(audio);
      clipContainer.appendChild(clipLabel);
      clipContainer.appendChild(deleteButton);
      clipContainer.appendChild(downloadButton);
      document.body.appendChild(clipContainer);

      audio.controls = true;
      var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      chunks = [];
      var audioURL = URL.createObjectURL(blob);
      audio.src = audioURL;
      console.log("Rekaman berhenti ... ");

      deleteButton.onclick = function(e) {
        evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
      }

      function handleDataAvailable(event) {
        console.log("data-available");
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
          console.log(recordedChunks);
          Download();
        } else {
        }
      }

      downloadButton.onclick = function(e) {
        var blob = new Blob(recordedChunks, {
          type: 'mp3'
        });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        a.href = url;
        a.download = clipName + '.mp3';
        a.click();
        window.URL.revokeObjectURL(url);
      }

      setTimeout(event => {
        console.log("stopping");
        mediaRecorder.stop();
      }, 9000);
    }

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    }
  })
  .catch(function(err) {
    console.log('The following error occurred: ' + err);
  })
}