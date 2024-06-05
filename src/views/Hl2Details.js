import * as d3 from 'd3';
import { get_allTimestamps } from './config';
import { get_eventTimelineGroup, get_hl2Group } from './containersSVG';
import { addTimeUpdateListener, get_videoPlayer, reset_videoPlayer } from './videoPlayerUtils';
import { get_brushedSubject, get_brushedTrial, get_brushesAdded, get_vidEnd, get_vidStart } from './configHl2Details';
import { get_xEventTimelineScale } from './EventTimeline';
export function cleanUpdateHl2Details( brushedSubject ){
    // get svgs
    let hl2Group = get_hl2Group();

    hl2Group.selectAll('*').remove();
    d3.select("#confidence-header")
        .style("visibility","hidden")
    
    d3.select("#steppred-header")
        .style("visibility","hidden")

    d3.select("#error-title-header")
        .style("visibility","hidden")
    console.log("start initialization");
    
    if (brushedSubject == null){
        reset_videoPlayer()
        console.log("start return initialization");
        return
    }
}
export function updateHl2Details( dataFiles){

    console.log("updateHl2Details");

    // get svgs
    let eventTimelineGroup = get_eventTimelineGroup();
    let hl2Group = get_hl2Group();
    let brushedSubject = get_brushedSubject();
    let brushedTrial = get_brushedTrial();
    let brushesAdded = get_brushesAdded();
    let xEventTimelineScale= get_xEventTimelineScale();
    let vidStart = get_vidStart();
    let vidEnd = get_vidEnd();

    cleanUpdateHl2Details( brushedSubject );

    if (brushedSubject == null){
        return
    }

    console.log("end initialization");
    d3.select("#confidence-header")
        .style("visibility","visible")

    d3.select("#steppred-header")
        .style("visibility","visible")

    d3.select("#error-title-header")
        .style("visibility","visible")

    let allTimestamps = get_allTimestamps();

    let duration = allTimestamps['t'+brushedTrial+"-s"+brushedSubject]

    let xScaleHL2 = d3.scaleLinear()
        .domain([0, duration])
        .range([0,hl2Group.attr("width")])

    // Step and prediction line chart
    hl2Group.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, -5)`)
        .call(d3.axisTop(xScaleHL2)
            .tickValues([0, duration/2, duration])
            .tickFormat(d => Math.round(d/60) + "min"));

    // Confidence LineChart  
    hl2Group.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, 185)`)
        .call(d3.axisTop(xScaleHL2)
            .tickValues([0, duration/2, duration])
            .tickFormat(d => Math.round(d/60) + "min"));
    // Error
    hl2Group.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, 375)`)
        .call(d3.axisTop(xScaleHL2)
        .tickValues([0, duration/2, duration])
        .tickFormat(d => Math.round(d/60) + "min"));



    let xScaleHL2reverse =  d3.scaleLinear()
        .domain([0,hl2Group.attr("width")])
        .range([0, duration])

    // Confidence LineChart    
    let yScaleConfidence = d3.scaleLinear()
        .domain([1.0,0])
        .range([0, 120])
    
    const yScaleStepPred = d3.scaleLinear()
        .domain([0, 9]) //Step 0 to Step 9. Step 9 is No step. First step is step 1
        .range([0, 120])
    
    hl2Group.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(-10, 0)`)
        .call(d3.axisLeft(yScaleStepPred)
            .tickValues([ yScaleStepPred.domain()[1], (9+0)/2, yScaleStepPred.domain()[0]])
            .tickFormat(d=>Math.round(d)));

    // Labels ticks Confidence
    hl2Group.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(-10, 190)`)
        .call(d3.axisLeft(yScaleConfidence)
            .tickValues([0,1])
            .tickFormat(d=>Math.trunc(d)));


    /////////////////
    // RECTANGLE CONTAINERS
    // Step and Pred 
    hl2Group.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx",5)
        .attr("ry", 7)
        .attr("width", xScaleHL2.range()[1])
        .attr("height", 120)
        .style("stroke", "black")
        .style("stroke-width", "0.5px")
        .style("stroke-opacity", 0.7)
        .style("fill", "none")
        .style("fill-opacity", 0)

    // Confidence    
    hl2Group.append("rect")
        .attr("x", 0)
        .attr("y", 190)
        .attr("rx",5)
        .attr("ry", 7)
        .attr("width", xScaleHL2.range()[1])
        .attr("height", 120)
        .style("stroke", "black")
        .style("stroke-width", "0.5px")
        .style("stroke-opacity", 0.7)
        .style("fill", "none")
        .style("fill-opacity", 0)

    ////////////////////////////////////////    
    // Draw a dashed vertical line
    hl2Group.append("line")
        .attr("class","seekline")
        .attr("x1", xScaleHL2(get_videoPlayer().currentTime)) 
        .attr("y1", 0) 
        .attr("x2",  xScaleHL2(get_videoPlayer().currentTime)) 
        .attr("y2", 120) 
        .style("stroke", "black")
        .attr("stroke-width", 2)
        .style("stroke-dasharray", "5,5");

    // Confidence LineChart   
    hl2Group.append("line")
        .attr("class","seekline")
        .attr("x1", xScaleHL2(get_videoPlayer().currentTime))
        .attr("y1", 190) 
        .attr("x2",  xScaleHL2(get_videoPlayer().currentTime))
        .attr("y2", 310) 
        .style("stroke", "black")
        .attr("stroke-width", 2)
        .style("stroke-dasharray", "5,5");

    let steppred = d3.brushX()
        .extent([[0, 0], [ xScaleHL2.range()[1] , 120]])
        .on("end", hl2brushend);

    let confidencebrush = d3.brushX()
        .extent([[0, 190], [ xScaleHL2.range()[1] , 310]])
        .on("end", hl2brushend);
    
    let errorbrush = d3.brushX()
        .extent([[0, 380], [ xScaleHL2.range()[1] , 415]])
        .on("end", hl2brushend);

    // DATA
    let tempObject = dataFiles[0].filter(obj => obj.subject_id == brushedSubject && obj.trial_id == brushedTrial);
    let sessionToDisplay = tempObject[0]

    // Step and Pred line chart
    const stepLabels = {
        'Place tourniquet over affected extremity 2-3 inches above wound site.': 1,
        'Pull tourniquet tight.': 2,
        'Apply strap to strap body.': 3,
        'Turn windless clock wise or counter clockwise until hemorrhage is controlled.': 4,
        'Lock windless into the windless keeper.': 5,
        'Pull remaining strap over the windless keeper.': 6,
        'Secure strap and windless keeper with keeper securing device.': 7,
        'Mark time on securing device strap with permanent marker.': 8,
        'No step': 9,
    };

    const pathDataStep = sessionToDisplay.consolidatedStepData.step.flatMap(d => [
        { startTimestamp: d.startTimestamp, value: d.value },
        { startTimestamp: d.endTimestamp, value: d.value }
    ]);
    const pathDataPred = sessionToDisplay.consolidatedStepData.prediction.flatMap(d => [
        { startTimestamp: d.startTimestamp, value: d.value },
        { startTimestamp: d.endTimestamp, value: d.value }
    ]);

    // Step and Prediction line chart
    hl2Group.append("path")
        .datum(pathDataStep)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1)    
        .attr("stroke-opacity", 0.8)
        .attr("d", d3.line()
        .x(function(d) { return xScaleHL2(d.startTimestamp) })
        .y(function(d) { return yScaleStepPred(stepLabels[d.value])}))
    hl2Group.append("path")
        .datum(pathDataPred)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)    
        .attr("stroke-opacity", 0.8)
        .attr("d", d3.line()
        .x(function(d) { return xScaleHL2(d.startTimestamp) })
        .y(function(d) { return yScaleStepPred(stepLabels[d.value])}))

    // Confidence line chart
    let variableName= "Confidence" 
    hl2Group.append("path")
        .datum(sessionToDisplay.data.filter(function(d) { return d.seconds >= 0 && d.seconds<=duration }))
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)    
        .attr("stroke-opacity", 0.8)
        .attr("d", d3.line()
        .x(function(d) { return xScaleHL2(d.seconds) })
        .y(function(d) { return 190 + yScaleConfidence(d[variableName]) }))
    
    // ERROR bart chart
    if (tempObject.length==1){
        sessionToDisplay.consolidatedStepData.error.forEach(data => {
            hl2Group.append("rect")
                .attr("x", xScaleHL2(data.startTimestamp))
                .attr("y", 380)
                .attr("width", xScaleHL2(data.endTimestamp) - xScaleHL2(data.startTimestamp)) 
                .attr("height", 35)
                .style("fill", () => data.value == "error" || data.value == "Error" ? "black" : "#AEAEAE");
        });
    }

    //////////////////////////////
    // BRUSH
    let confidenceBrushGroup = hl2Group.append("g")
        .attr("class", "brush confidencebrush")
        .call(confidencebrush, [ xScaleHL2.range()[0],xScaleHL2.range()[1]]);

    let steppredBrushGroup = hl2Group.append("g")
        .attr("class", "brush steppred")
        .call(steppred);

    let errorBrushGroup = hl2Group.append("g")
        .attr("class", "brush errorbrush")
        .call(errorbrush);

    confidenceBrushGroup.call(confidencebrush.move, [ xScaleHL2(vidStart),xScaleHL2(vidEnd)]);
    steppredBrushGroup.call(steppred.move, [ xScaleHL2(vidStart),xScaleHL2(vidEnd)]);
    errorBrushGroup.call(errorbrush.move, [ xScaleHL2(vidStart),xScaleHL2(vidEnd)]);
    
    addTimeUpdateListener(vidStart, vidEnd, xScaleHL2);

    function hl2brushend(e){
        if (typeof e.sourceEvent != 'undefined') {          
            let newt1 = xScaleHL2reverse(e.selection[0])  
            let newt2 = xScaleHL2reverse(e.selection[1])
            let allBrushes = eventTimelineGroup.selectAll(".timelinebrush").nodes()
            allBrushes.forEach((eachBrush)=>{
                let className = "brush-t"+brushedTrial+"-s"+brushedSubject
                if (d3.select(eachBrush).classed(className)){
                    let curBrush = d3.select(eachBrush)
                    curBrush.call(brushesAdded[0].move, [xEventTimelineScale(newt1), xEventTimelineScale(newt2)]); 
                }
            })    
        }

    }
}

