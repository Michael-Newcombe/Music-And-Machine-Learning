//variable for p5js-osc web socket setup
let socket;
//variables for storing the hand data, x and y position and width and height
let handXpos;
let handYpos;
let handWidth;
let handHeight;


function setup() {
	createCanvas(500, 500);
    //initializing the input and output ports 
	setupOsc(3333, 6448);
    //initializing the hand data variables, if these variables are not initialized to a numerical value then they won't update in the wekiInputHelper
    handXpos = 0;
    handYpos = 0;
    handWidth = 0;
    handHeight = 0;
    
    //initializing the Handtrack.js model parameters 
    const modelParams = {
        flipHorizontal: true,   // flip video 
        maxNumBoxes: 1,        // maximum number of boxes to detect
        iouThreshold: 0.5,      // ioU threshold for non-max suppression
        scoreThreshold: 0.70,    // confidence threshold for predictions.
    }
      //setting up the webcam, this code only accesses the webcam for Google Chrome 
      navigator.getUserMedia = navigator.getUserMedia;
    
      //accessing the DOM elements 
      const video = document.getElementById('video'); 
      const canvas = document.getElementById('canvas');
      const context = canvas.getContext('2d');

      //variable for storing the model
      let model;
      
      //initializing webcam stream
      handTrack.startVideo(video)
      //status parameter to check that everything has loaded probably 
      .then(status =>{
        //if everything has load probably the following code is executed 
        if(status){
          //accessing the webcam device and streaming it into the html video and running the model through the runDetect function 
          navigator.getUserMedia({video: {}},stream =>{video.srcObject = stream; setInterval(runDetect)},err => console.log(err))
        }
      })
    
      //function for running the model detections
      function runDetect(){
        //calling the models detect method which returns an array of hand detection information
        model.detect(video).then(predictions => {
//           console.log('Predictions: ', predictions);
            //only grab the predictions array data when a hand has been detected. 
          if (predictions.length > 0){
            //accessing the bounding box information
            //accessing the x postion of the hand
            handXpos = predictions[0].bbox[0];
            //accessing the y postion of the hand
            handYpos = predictions[0].bbox[1];
            //accessing the width of the hand
            handWidth = predictions[0].bbox[2];
            //accessing the height of the hand
            handHeight = predictions[0].bbox[3];

//             console.log('xPos',handXpos);
//             console.log('yPos',handYpos);

          } 
         
           //rendering the bounding box onto the screen
           model.renderPredictions(predictions, canvas, context, video);
           context.font = "14px Arial";
           //drawing the bounding box x and y and width and height information onto the screen
           context.fillText("X: "+Math.round(handXpos),10,50);
           context.fillText("Y: "+Math.round(handYpos),10,70);
           context.fillText("W: "+Math.round(handWidth),10,90);
           context.fillText("H: "+Math.round(handHeight),10,110);

        });
      }
      // loading the model
      handTrack.load(modelParams).then(myModel => {
       
          model = myModel;

      });
}

function draw() {
//    console.log(handXpos);
    //gathering the hand data to send over to the wekiInputHelper through OSC
    socket.emit('message', ['/wek/inputs', handXpos,handYpos,handWidth,handHeight]);
}

function sendOsc(address, value) {
        //sending the data over OSC
		socket.emit('message', [address, value]);
}

//p5js-osc setup
function setupOsc(oscPortIn, oscPortOut) {
	socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
	socket.on('connect', function() {
		socket.emit('config', {	
			server: { port: oscPortIn,  host: '127.0.0.1'},
			client: { port: oscPortOut, host: '127.0.0.1'}
		});
	});
}