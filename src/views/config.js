
import * as d3 from 'd3';
let allTimestamps = {}
let maxTimestamp=0.0;

export function process_timestamps(dataFiles){
    //TIMESTAMP
    Object.keys(dataFiles[1]).forEach((subjectVal)=>{
        Object.keys(dataFiles[1][subjectVal]).forEach((trialVal)=>{
            allTimestamps['t'+trialVal+"-s"+subjectVal]=dataFiles[1][subjectVal][trialVal].duration_seconds
            maxTimestamp = Math.max(maxTimestamp,  dataFiles[1][subjectVal][trialVal].duration_seconds)
        })
    })
}

export function get_allTimestamps(){
    return allTimestamps;
}
export function get_maxTimestamp(){
    return maxTimestamp;
}



export function get_stepColorScale(){
    const allSteps = ["a", "b", "c", "d", "e", "f", "?", "*", "1", "2", "v"]

    let modifiedSchemePaired = d3.schemePaired
    modifiedSchemePaired.splice(4,2);
    modifiedSchemePaired.push("white")

    const stepColorScale = d3.scaleOrdinal()
        .domain(allSteps)
        .range(modifiedSchemePaired);

    return stepColorScale;
}

export function get_margins(){
    const margins={ 
        scatterplot:{ top:40, left:30, right:110, bottom:15},
        fnirs:{top:50, left:47, right:10, bottom:10},
        timeDist:{top:30, left:30, right:30, bottom: 10},
        eventTimeline:{top:25, left:55, right:16, bottom:20},
        matrix:{top:25, left:5, right:5, bottom:20},
        predictionSessions:{top:25, left:10, right:10, bottom:20},   
        hl2:{top:55, left:45, right:23, bottom:10},
        video:{ top:0, left:0, right:0, bottom:0},
    }
    return margins;
}

// Compute unique sources, trials and subjects
let sources, uniqueTrials, uniqueSubjects;
export function compute_unique_data(dataFiles){
    sources = [...new Set(dataFiles[0].map(entry => entry.subject_id))];
    uniqueSubjects = [...new Set(dataFiles[0].map(entry => entry.subject_id))];
    uniqueTrials = [...new Set(dataFiles[0].map(entry => entry.trial_id))];
}

export function get_unique_sources(){
    return sources;
}
export function get_unique_trials(){
    return uniqueTrials;
}
export function get_unique_subjects(){
    return uniqueSubjects;
}

// // get video path
export function get_videoPath(brushedSubject, brushedTrial){
    return `data/video/${String(brushedSubject).padStart(4, '')}/${brushedTrial}/hl2_rgb/codec_hl2_rgb_vfr.mp4`;
}


// return `data/video/${String(brushedSubject).padStart(4, '')}/${brushedTrial}/hl2_rgb/codec_hl2_rgb_vfr.mp4`;
// get video path
// export function get_videoPath(brushedSubject, brushedTrial){
//     return `http://172.24.113.193:9000/M2_Tourniquet/Data/alabama/${String(brushedTrial).padStart(4, '')}/${String(brushedTrial).padStart(4, '')}.mp4`;
// }

let selectedItems;
// Update selected items 
export function set_selectedItems(items){
    // Clone the items array to avoid mutability issues
    selectedItems = [...items];
}
export function get_selectedItems(){
    return selectedItems;
}

// Update selected ScatterSource 
let selectedScatterSource;
export function set_selectedScatterSource(option){
    selectedScatterSource = option;
}
export function get_selectedScatterSource(){
    return selectedScatterSource;
}

// Update selected Groupby 
let selectedGroupby;
export function set_selectedGroupby(option){
    selectedGroupby = option;
}
export function get_selectedGroupby(){
    return selectedGroupby;
}

// Update selected Filter
let selectedFilter;
export function set_selectedFilter(option){
    selectedFilter = option;
}
export function get_selectedFilter(){
    return selectedFilter;
}