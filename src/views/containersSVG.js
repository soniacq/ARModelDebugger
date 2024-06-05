// Import D3
import * as d3 from 'd3';
import { get_margins } from './config';
let 
    // videoPath, 
    // selectedItems,
    // uniqueTrials, uniqueSubjects,
    // selectedScatterSource, selectedGroupby, selectedFilter, 
    scatterSvg, scatterGroup, 
    eventTimelineSvg , 
    eventTimelineGroup, 
    matrixSvg, matrixGroup, matrixTooltip,
    hl2Svg, hl2Group,
    predictionSessionsSvg, predictionSessionsGroup,
    timeDistSvg, timeDistGroup;

//initialise svgs
export function initialise_svgs(){

    let margins = get_margins();

    //eventtimeline
    let eventTimelineDiv= d3.select("#event-timeline-container")  
    eventTimelineSvg = eventTimelineDiv
        .append("svg")
        .attr("width", eventTimelineDiv.node().clientWidth)
        .attr("height", 200)
        
    eventTimelineGroup= eventTimelineSvg.append("g")
        .attr("transform", `translate(${margins.eventTimeline.left}, ${margins.eventTimeline.top})`)
        .attr("width", eventTimelineDiv.node().clientWidth -margins.eventTimeline.left - margins.eventTimeline.right )
        .attr("height", eventTimelineDiv.node().clientHeight - margins.eventTimeline.top - margins.eventTimeline.bottom);    

    //matrix
    let matrixDiv= d3.select("#matrix-container")  
    matrixSvg = matrixDiv
        .append("svg")
        .attr("width", matrixDiv.node().clientWidth)
        .attr("height", 200)
        
    matrixGroup = matrixSvg.append("g")
        .attr("transform", `translate(${margins.matrix.left}, ${margins.matrix.top})`)
        .attr("width", matrixDiv.node().clientWidth -margins.matrix.left - margins.matrix.right )
        .attr("height", matrixDiv.node().clientHeight - margins.matrix.top - margins.matrix.bottom);
    
    matrixTooltip =matrixDiv.append("div")
        .attr("class", "tooltip")
        .style("opacity",0.9)
        .style("visibility","hidden")
        .style("position", "absolute")
        .style("font-size","0.75em")
        //.style("width","150px")
        .style("z-index",1000)
        .style("background-color", "white")
        .style("padding", "8px")
        .style("border-radius", "5px")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)")
        .style("text-align", "left"); // Add text-align: left to align text left;
    //predictionsessions
    let predictionSessionsDiv= d3.select("#prediction-sessions-container")  
    
    predictionSessionsSvg = predictionSessionsDiv
        .append("svg")
        .attr("width", predictionSessionsDiv.node().clientWidth)
        .attr("height", 200)
        
    predictionSessionsGroup = predictionSessionsSvg.append("g")
        .attr("transform", `translate(${margins.predictionSessions.left}, ${margins.predictionSessions.top})`)
        .attr("width", predictionSessionsDiv.node().clientWidth -margins.predictionSessions.left - margins.predictionSessions.right )
        .attr("height", predictionSessionsDiv.node().clientHeight - margins.predictionSessions.top - margins.predictionSessions.bottom); 

    //hl2 details
    let hl2DetailsDiv= d3.select("#hl2-container")  

    hl2Svg = hl2DetailsDiv
        .append("svg")
        .attr("width", hl2DetailsDiv.node().clientWidth)
        .attr("height", 500)
        
    hl2Group = hl2Svg.append("g")
        .attr("transform", `translate(${margins.hl2.left}, ${margins.hl2.top})`)
        .attr("width", hl2DetailsDiv.node().clientWidth -margins.hl2.left - margins.hl2.right )
        .attr("height", hl2DetailsDiv.node().clientHeight - margins.hl2.top - margins.hl2.bottom); 
}
//  scatterplot
export function get_scatterSvg(){
    return scatterSvg;
}
export function get_scatterGroup(){
    return scatterGroup;
}

// timeline
export function get_eventTimelineSvg(){
    return eventTimelineSvg;
}
export function get_eventTimelineGroup(){
    return eventTimelineGroup;
}

// matrix
export function get_matrixSvg(){
    return matrixSvg;
}
export function get_matrixGroup(){
    return matrixGroup;
}
export function get_matrixTooltip(){
    return matrixTooltip;
}
// detail view
export function get_hl2Svg(){
    return hl2Svg;
}
export function get_hl2Group(){
    return hl2Group;
}
// prediction session
export function get_predictionSessionsSvg(){
    return predictionSessionsSvg;
}
export function get_predictionSessionsGroup(){
    return predictionSessionsGroup;
}
// time distribution
export function get_timeDistSvg(){
    return timeDistSvg;
}
export function get_timeDistGroup(){
    return timeDistGroup;
}