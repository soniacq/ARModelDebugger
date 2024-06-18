// Import D3
import * as d3 from 'd3';
import { updateEventTimeline } from './views/EventTimeline.js'
import { compute_unique_data, get_unique_sources, set_selectedGroupby, set_selectedItems, set_stepColorScale } from './views/config.js'
import { initialise_svgs } from './views/containersSVG.js';
import { consolidate_data } from './views/utils.js';
import { updateMatrix } from './views/MatrixView.js';
let dataFiles; 

Promise.all([
        d3.json("data/formatted_mission_log_seconds_reduced_M2.json"), // 1 need
        d3.json("data/sessions_metadata_reduced_M2.json"), // 9 need
        d3.csv("data/all_sessions_tsne_results.csv"),
    ])
    
    .then(function(files) {
        dataFiles = consolidate_data(files);;
        initializeContainers();
        updateMatrix( dataFiles );
        updateEventTimeline( dataFiles );
    })
    .catch(function(err) {
    console.log(err)
    console.log("Data Files not loaded!")
})

function initializeContainers(){
    console.log("initializing")
    
    set_stepColorScale();
    // Extract unique sources from the data
    compute_unique_data(dataFiles);
    const sources = get_unique_sources();

    //set selected items
    const selectedItems = dataFiles[0].map(entry => ({
        
        trial: entry.trial_id,
        subject: entry.subject_id
    }));

    set_selectedItems(selectedItems);
    set_selectedGroupby('subject');

    //initialise svgs
    initialise_svgs();

    // fetch('http://172.24.113.193:5000/videos/getvideos')
    //     .then(response => {
    //         if (!response.ok) {
    //         throw new Error('Network response was not ok');
    //         }
    //         return response.json(); // Assuming response is JSON
    //     })
    //     .then(data => {
    //         // Work with JSON data here
    //         console.log(data);
    //     })
    //     .catch(error => {
    //         console.error('There was a problem with the fetch operation:', error);
    //     });

}
