import { Button } from "./ui/button";
import { Mic, Pause } from "lucide-react";
import { useState } from "react";


export const VoiceRecorder = ()=>{
    const [isLoading, setLoading] = useState(false)
    const [media, setMedia] = useState<MediaRecorder>();
    const [mediaState, setMediaState] = useState<RecordingState>();
    
    const getMedia = ()=>{
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

            console.log("getUserMedia supported.");
            navigator.mediaDevices
              .getUserMedia(
                // constraints - only audio needed for this app
                {
                  audio: true,
                },
              )
          
              // Success callback
              .then((stream) => {
                console.log("streaming");
                
                setLoading(true)
                
                const mediaRecorder = new MediaRecorder(stream);
                setMedia(mediaRecorder)
                
                mediaRecorder.start()
                let chunks:Blob[] = [];
                console.log(mediaRecorder.state);
                setMediaState(mediaRecorder.state)
                
                mediaRecorder.ondataavailable = (e) => {
                    setMediaState(mediaRecorder.state)
                    chunks.push(e.data);
                };
                

                mediaRecorder.onstop = ()=>{
                    console.log("stoped");
                    setMediaState(mediaRecorder.state)
                    
                    const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
                    const audioUrl = URL.createObjectURL(blob);
                    const audio = new Audio(audioUrl);

                    audio.play().then(() => {
                        console.log("Audio is playing.");
                    }).catch(error => {
                        console.error("Error playing audio:", error);
                    });
                }
                setLoading(false)
              })
          
              // Error callback
              .catch((err) => {
                console.error(`The following getUserMedia error occurred: ${err}`);
              });


          } else {
            console.log("getUserMedia not supported on your browser!");
          }
          
    }

    const stopAudio = ()=> {
       media?.stop()
    }
    return mediaState !== "recording" ?
                <Button
        className="rounded-full p-1.5 h-fit absolute bottom-2 right-11 m-0.5 dark:border-zinc-700"
        onClick={(event) => {
            event.preventDefault()
          getMedia()
        }}
        variant="outline"
        disabled={isLoading}
      >
         <Mic size={32} onClick={stopAudio} />
      </Button>
      : 
      <Button
      className="rounded-full p-1.5 h-fit absolute bottom-2 right-11 m-0.5 dark:border-zinc-700"
      variant="outline"
        
        onClick={(event) => {
            event.preventDefault()
            stopAudio()
        }}
      >
      <Pause size={32} />
      </Button>
          
        
}