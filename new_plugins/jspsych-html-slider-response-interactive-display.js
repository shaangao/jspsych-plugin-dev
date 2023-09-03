// adapted from jsPsych 6.0.0 html-slider-response by Shan Gao



jsPsych.plugins['html-slider-response-interactive-display'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'html-slider-response-interactive-display',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      min: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Min slider',
        default: 0,
        description: 'Sets the minimum value of the slider.'
      },
      max: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Max slider',
        default: 100,
        description: 'Sets the maximum value of the slider',
      },
      start: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Slider starting value',
        default: 50,
        description: 'Sets the starting value of the slider',
      },
      step: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Step',
        default: 1,
        description: 'Sets the step of the slider'
      },
      ticks: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Tick positions',
        default: [],
        array: true,
        description: 'Tick/label positions of the slider.'
      },
      labels: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name:'Labels',
        default: [],
        array: true,
        description: 'Labels of the slider.',
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        array: false,
        description: 'Label of the button to advance.'
      },
      min_viewing: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Minimum viewing duration',
        default: 0,  // in milliseconds
        description: 'How long to wait before enabling continue buttom'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the slider.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when user makes a response.'
      },
    }
  }


  plugin.trial = function(display_element, trial) {


    ///////////  build html string //////////////
    var html = '<div id="jspsych-html-slider-response-wrapper" style="margin: 100px 0px;">';

    // stimulus
    html += '<div id="jspsych-html-slider-response-stimulus">' + trial.stimulus + '</div>';

    // slider bar
    html += '<div class="jspsych-html-slider-response-container" style="position:relative; width: 100%;">';
    html += '<input type="range" value="'+trial.start+'" min="'+trial.min+'" max="'+trial.max+'" step="'+trial.step+'" \
              style="width: 100%;" id="jspsych-html-slider-response-response" \
              list="rangers" onmousedown="return false;">';  // make the slider undraggable

    // slider ticks
    html += '<datalist id="rangers">';
    for (var tick of trial.ticks) {
      // console.log('tick ', tick);
      html += '<option value="'+tick+'"/>'
    }
    html += '</datalist>';
    html += '</input>';

    // slider labels
    spacing = 2;
    html += '<div>'
    if (trial.ticks.length - 1 == trial.labels.length) { // label the bin between every 2 ticks
      for(var j=0; j < trial.labels.length; j++){
        var xLeft = trial.ticks[j] + spacing;
        var xRight = trial.ticks[j+1] - spacing;
        var width = xRight - xLeft;
        html += '<div style="display: inline-block; position: absolute; left:'+xLeft+'%; text-align: center; width: '+width+'%; line-height: .2em;" disabled>';
        //////// highlight selected bin ////////
        if (j == trial.labels.length-1 && trial.start >= trial.ticks[j] && trial.start <= trial.ticks[j+1]) {
          html += '<span id="label'+j+'" style="text-align: center; font-size: 40%; color: DodgerBlue">'+trial.labels[j]+'</span>';
        }
        else if (trial.start >= trial.ticks[j] && trial.start < trial.ticks[j+1]) {
          html += '<span id="label'+j+'" style="text-align: center; font-size: 40%; color: DodgerBlue">'+trial.labels[j]+'</span>';
        } else {
          html += '<span id="label'+j+'" style="text-align: center; font-size: 40%; color: black">'+trial.labels[j]+'</span>';
        };
        ////////////////////////////////////////
        // html += '<span id="label'+j+'" style="text-align: center; font-size: 50%;">'+trial.labels[j]+'</span>';
        html += '</div>'
      }      
    } else { // evenly distributed labels
      for(var j=0; j < trial.labels.length; j++){
        var width = 100/(trial.labels.length-1);
        var left_offset = (j * width) - (width/2);
        html += '<div style="display: inline-block; position: absolute; left:'+left_offset+'%; text-align: center; width: '+width+'%; line-height: .4em;">';
        html += '<span style="text-align: center; font-size: 20%;">'+trial.labels[j]+'</span>';
        html += '</div>'
      }
    }
    html += '</div>';  // end slider labels
    html += '</div>';  // end jspsych-html-slider-response-container (slider bar)
    html += '</div>';  // end jspsych-html-slider-response-wrapper


    // html += '<div></div>';
    // html += '<div></div>';

    // prompt is displayed BELOW the slider
    if (trial.prompt !== null){
      html += trial.prompt;
    }

    // add submit button
    html +=
    '<button id="jspsych-html-slider-response-next" class="jspsych-btn" ' +
        ((trial.min_viewing>0) ? "disabled" : "") +   // disable button for now if min_viewing > 0
        ">" +
        trial.button_label +
        "</button>";


    /////////// render html //////////////
    display_element.innerHTML = html;

    
    // ///////////// interactive score display ///////////////
    // // const outvalue = display_element.querySelector("#value");   // value to be interactively displayed
    // const input = display_element.querySelector("#jspsych-html-slider-response-response");    // input: slider params (slider current value, min and max values)
    
    // // // set initial value to display
    // // outvalue.textContent = input.value;    // input.value is the "value" field in "input" obj, different from the "value" variable here
    
    // if (trial.ticks.length - 1 == trial.labels.length) {  // if binned

    //   labelObjs = display_element.querySelectorAll("span[id^='label']");
    //   // highlight initial selected bin
    //   for (let j=0; j < labelObjs.length; j++) {
    //     if (j == labelObjs.length-1 && input.value >= trial.ticks[j] && input.value <= trial.ticks[j+1]) {
    //       labelObjs[j].style.color = "DodgerBlue";
    //     }
    //     else if (input.value >= trial.ticks[j] && input.value < trial.ticks[j+1]) {
    //       labelObjs[j].style.color = "DodgerBlue";
    //     } else {
    //       labelObjs[j].style.color = "black";
    //     };
    //   };
    //   // // add slider change listener
    //   // input.addEventListener("input", (event) => {
    //   //   let newValue = event.target.value;
    //   //   // // change displayed value whenever slider input changes
    //   //   // outvalue.textContent =  newValue;
    //   //   // highlight selected bin's label
    //   //   for (let j=0; j < labelObjs.length; j++) {
    //   //     if (j == labelObjs.length-1 && newValue >= trial.ticks[j] && newValue <= trial.ticks[j+1]) {
    //   //       labelObjs[j].style.color = "DodgerBlue";
    //   //     }
    //   //     else if (newValue >= trial.ticks[j] && newValue < trial.ticks[j+1]) {
    //   //       labelObjs[j].style.color = "DodgerBlue";
    //   //     } else {
    //   //       labelObjs[j].style.color = "black";
    //   //     };
    //   //   };
    //   // });

    // } 
    // // else {
      
    // //   input.addEventListener("input", (event) => {
    // //     // change displayed value whenever slider input changes
    // //     outvalue.textContent = event.target.value; 
    // //   });

    // // };
    // ///////////////////////////////////////////////////////


    var response = {
      rt: null,
      response: null
    };


    ///////////// enable button if min_viewing duration reached ///////////
    if (trial.min_viewing > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        // enable_button
        display_element.querySelector("#jspsych-html-slider-response-next").disabled = false;
      }, trial.min_viewing);
    }
    /////////////////////////////////////////////////////////////////////



    // add button click listener
    display_element.querySelector('#jspsych-html-slider-response-next').addEventListener('click', function() {
      // measure response time
      var endTime = (new Date()).getTime();
      response.rt = endTime - startTime;
      response.response = display_element.querySelector('#jspsych-html-slider-response-response').value;

      if(trial.response_ends_trial){
        end_trial();
      } else {
        display_element.querySelector('#jspsych-html-slider-response-next').disabled = true;
      }

    });


    ////// end trial function //////
    function end_trial(){

      jsPsych.pluginAPI.clearAllTimeouts();

      // save data
      var trialdata = {
        "rt": response.rt,
        "response": response.response,
        "stimulus": trial.stimulus
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    }
    /////////////////////////////////


    // force stimuli viewing for certain duration
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-slider-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

    // get start time
    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
