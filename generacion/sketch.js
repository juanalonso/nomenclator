// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
LSTM Generator example with p5.js
This uses a pre-trained model on a corpus of Virginia Woolf
For more models see: https://github.com/ml5js/ml5-data-and-training/tree/master/models/charRNN
=== */

let charRNN;
let tempSlider;
let button;
let runningInference = false;

let temperatureText;

let resultText;

const textSeed = 'B';
const resultsLength = 250;


function setup() {

    // Create the LSTM Generator passing it the model directory
    charRNN = ml5.charRNN('./models/poblaciones/', modelReady);

    // Grab the DOM elements
    tempSlider = document.querySelector('#tempSlider');
    button = document.querySelector('#generate');
    temperatureText = document.querySelector('#temperature');
    resultText = document.querySelector('#result');

    // DOM element events
    button.addEventListener('click', generate);
    tempSlider.addEventListener('input', updateSlider);
}

setup();

// Update the slider values
function updateSlider() {
    temperatureText.innerHTML = parseFloat(tempSlider.value).toFixed(2);
}

function modelReady() {
    button.disabled = false;
}

// Generate new text
function generate() {
    // prevent starting inference if we've already started another instance
    // TODO: is there better JS way of doing this?
    if (!runningInference) {
        runningInference = true;
        button.disabled = true;

        // Update status
        button.innerHTML = 'Generando...';

        // Grab the seed
        //const textSeed = textInput.value;
        // Make it to lower case
        //const txt = textSeed.toUpperCase();

        const data = {
            seed: textSeed,
            temperature: tempSlider.value,
            length: resultsLength
        };

        // Generate text with the charRNN
        charRNN.generate(data, gotData);

        // When it's done
        function gotData(err, result) {
            // Update status
            var lines = result.sample.split(/\r\n|\r|\n/g);
            resultText.innerHTML = '';
            resultText.style.display = 'block';
            lines.shift();
            lines.pop();
            for (var f = 0; f < lines.length; f++) {
                resultText.innerHTML = resultText.innerHTML + lines[f] + '\n';
            }
            runningInference = false;
            button.disabled = false;
            button.innerHTML = 'Generar nombres';
        }

    }
}