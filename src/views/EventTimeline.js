import * as d3 from 'd3';
import { get_allTimestamps, get_maxTimestamp, get_stepColorScale, get_margins, get_unique_subjects, get_unique_trials, get_videoPath, get_selectedItems, set_selectedItems, get_selectedGroupby} from './config.js'
import { updateHl2Details } from './Hl2Details.js'
import { get_eventTimelineGroup, get_eventTimelineSvg, get_matrixGroup } from './containersSVG.js';
import { playVideoWithStartTime } from './videoPlayerUtils.js';
import { get_brushedSubject, get_brushedTrial, get_vidEnd, get_vidStart, set_brushedSubject, set_brushedTrial, set_brushesAdded, set_vidEnd, set_vidStart } from './configHl2Details.js';
import { updateMatrix } from './MatrixView.js';

export function get_xEventTimelineScale(){
    let maxTimestamp = get_maxTimestamp();
    let margins = get_margins();
    let xEventTimelineScale= d3.scaleLinear()
    .domain([0.0, maxTimestamp])
    .range([0, d3.select("#event-timeline-container").node().clientWidth -margins.eventTimeline.left - margins.eventTimeline.right ])  
    return xEventTimelineScale;
}
export function updateEventTimeline( dataFiles ){   

    console.log("updateEventTimeline");
    // compute_unique_data(dataFiles);
    // Extract unique sources from the data
    let uniqueTrials = get_unique_trials();
    // let uniqueTrials = ['2', '11', '13', '16', '19', '20', '26', '27', '33', '4', '8', '6', '15', '17', '24', '7', '12', '31', '32', '3', '5', '9', '10', '14', '23'];
    let uniqueSubjects = get_unique_subjects();
    // let uniqueSubjects = ['293', '4352', '5482', '7921', '8101', '8708', '9636'];
    let selectedItems = get_selectedItems();
    // let selectedItems = [{trial: 2, subject: 293},
    //     {trial: 11, subject: 293},
    //     {trial: 13, subject: 293}, 
    //     {trial: 16, subject: 293},
    //     {trial: 19, subject: 293},
    //     {trial: 20, subject: 293},
    //     {trial: 26, subject: 293}];

    console.log("uniqueTrials");
    console.log(uniqueTrials);
    console.log("uniqueSubjects");
    console.log(uniqueSubjects);
    console.log("selectedItems");
    console.log(selectedItems);

    // get selected value from dropdown menus
    let selectedGroupby = get_selectedGroupby();

    // get svgs
    let eventTimelineGroup = get_eventTimelineGroup();
    let eventTimelineSvg = get_eventTimelineSvg();
    let matrixGroup = get_matrixGroup();

    let brushedTrial = get_brushedTrial();
    let brushedSubject = get_brushedSubject();
    let brushesAdded=[];
    let brushIndices=[];
    let xEventTimelineScale;
    let reverseTimelineScale;
    let vidStart = get_vidStart();
    let vidEnd = get_vidEnd();
    let maxTimestamp = get_maxTimestamp();
    let allTimestamps = get_allTimestamps();
    let stepColorScale = get_stepColorScale(); // Add by Sonia 
    const margins = get_margins();

    set_brushedTrial(null);
    set_brushedSubject(null);
    brushesAdded.splice(0, brushesAdded.length)
    brushIndices.splice(0, brushIndices.length)
    let brushCount = 0  
    eventTimelineGroup.selectAll('*').remove();

    d3.select("#model-dropdown")
        .style("visibility","hidden");

    d3.select("#corr-checkbox")
        .style("visibility","hidden");

    d3.select("#corr-checkbox-label")
        .style("visibility","hidden");

    if (selectedItems.length == 0){
        return;
    }

    d3.select("#model-dropdown")
        .style("visibility","visible");

    d3.select("#corr-checkbox")
        .style("visibility","visible");

    d3.select("#corr-checkbox-label")
        .style("visibility","visible");

    let filteredMissionData=[];
    let currentY = margins.eventTimeline.top
    let groupArray = uniqueSubjects
    if(selectedGroupby=="trial")
        groupArray = uniqueTrials
    
    let yScaleLine =  d3.scaleLinear()
                        .domain([1.0,0])
                        .range([1,25])
                         

    xEventTimelineScale= get_xEventTimelineScale();
    reverseTimelineScale = d3.scaleLinear()
        .domain([0, d3.select("#event-timeline-container").node().clientWidth -margins.eventTimeline.left - margins.eventTimeline.right ])
        .range([0.0, maxTimestamp])

    selectedItems.forEach((item)=>{
        //filter Mission File
        let tempObject = dataFiles[0].filter(obj => obj.subject_id == item.subject && obj.trial_id == item.trial);
        if (tempObject.length==0){
            console.log("ERROR:NO MATCH FOUND FOR SUBJECT AND TRIAL ID")
            tempObject= [{subject_id: item.subject, trial_id: item.trial, missing:true}]
        }
        else
            tempObject[0]["missing"]=false
        filteredMissionData.push(tempObject[0])
    })

    groupArray.forEach((id)=>{
        let groupedObj = filteredMissionData.filter(obj => obj.subject_id == id)
        if (selectedGroupby=="trial")
            groupedObj = filteredMissionData.filter(obj => obj.trial_id == id)
        if (groupedObj.length>0 && selectedGroupby=="trial")
            eventTimelineGroup.append("text").attr("x", xEventTimelineScale.range()[1]/2 - margins.eventTimeline.left/2).attr("y", currentY-24).text("Session "+ id).style("font-size", "16px").attr("text-anchor","middle").style("fill","black")
        else if (groupedObj.length>0 && selectedGroupby=="subject")
            eventTimelineGroup.append("text").attr("x", xEventTimelineScale.range()[1]/2 - margins.eventTimeline.left/2).attr("y", currentY-24).text(" "+ id).style("font-size", "16px").attr("text-anchor","middle").style("fill","black")
        else
            return

        currentY+=5
        eventTimelineGroup.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${currentY})`)
            .call(d3.axisTop(xEventTimelineScale)
                .tickValues([0, maxTimestamp/2, maxTimestamp])
                .tickFormat(d => Math.round(d/60) + "min"));
        
        currentY+=15

        groupedObj.forEach((sessionMission)=>{
            ////////////////////////////////////////
            // Session Title
            // - Recording Name
            let sessionTitle
            // Sonia Trial instead of S .text(" "+ sessionMission.trial_id)
            sessionTitle=eventTimelineGroup.append("text").attr("x", xEventTimelineScale.range()[0]-margins.eventTimeline.left + 6).attr("y", currentY+3).text(" "+ sessionMission.trial_id).style("font-size", "10px").attr("text-anchor","start").style("fill","black").attr("data-trial", sessionMission.trial_id).attr("data-subject", sessionMission.subject_id)
            .on("click",(event, d) =>{

                let trialToRemove;
                let subjectToRemove;
                if (typeof event.target != 'undefined') {
                    trialToRemove = event.srcElement.getAttribute("data-trial")
                    subjectToRemove = event.srcElement.getAttribute("data-subject")
                }
                else{    
                    return
                }
                selectedItems = selectedItems.filter(function(item) {
                    return !(item.trial == trialToRemove && item.subject == subjectToRemove);
                });
                set_selectedItems(selectedItems);
                updateEventTimeline( dataFiles )
                // updateMatrix( dataFiles )
                // updatepredictionSessions( dataFiles)
                updateHl2Details( dataFiles);
                
            })
            // - Box to hold recording Name
            let bbox = sessionTitle.node().getBBox();
            eventTimelineGroup.append("rect")
                .attr("x", bbox.x - 2)
                .attr("y", bbox.y - 2)
                .attr("width", bbox.width + 4)
                .attr("rx",5)
                .attr("ry",5)
                .attr("data-trial", sessionMission.trial_id)
                .attr("data-subject", sessionMission.subject_id)
                .attr("height", bbox.height + 4)
                .attr("stroke", "black")
                .style("fill", "none")
                .on("click", (event, d) => {
                    let trialToRemove;
                    let subjectToRemove;
                    if (typeof event.target != 'undefined') {
                        trialToRemove = event.srcElement.getAttribute("data-trial")
                        subjectToRemove = event.srcElement.getAttribute("data-subject")
                    }

                    else{
                        return
                    }
                    selectedItems = selectedItems.filter(function(item) {
                        return !(item.trial == trialToRemove && item.subject == subjectToRemove);
                    });
                    set_selectedItems(selectedItems);
                    updateEventTimeline( dataFiles )
                    // updateMatrix( dataFiles )
                    // updatepredictionSessions( dataFiles)
                    updateHl2Details( dataFiles);

                });

            
            ////////////////////////////////////////
            // Data for Bar Charts
            let stepData = sessionMission.consolidatedStepData.step;
            let errorData = sessionMission.consolidatedStepData.error;
            let predictionData = sessionMission.consolidatedStepData.prediction;
            
            ////////////////////////////////////////
            // Bar Names
            eventTimelineGroup.append("text").attr("x", xEventTimelineScale.range()[0] - 3).attr("y", currentY+18).text("Procedures").style("font-size", "9px").attr("text-anchor","end").style("fill","black")
            eventTimelineGroup.append("text").attr("x", xEventTimelineScale.range()[0]-3).attr("y", currentY+36).text("Errors").style("font-size", "9px").attr("text-anchor","end").style("fill","black")
            eventTimelineGroup.append("text").attr("x", xEventTimelineScale.range()[0]-3).attr("y", currentY+55).text("Prediction").style("font-size", "9px").attr("text-anchor","end").style("fill","black")
            
            ////////////////////////////////////////
            // Ground Truth Bar Chart
            stepData.forEach(data => {
                eventTimelineGroup.append("rect")
                    .attr("x", xEventTimelineScale(data.startTimestamp))
                    .attr("y", currentY)
                    .attr("width", xEventTimelineScale(data.endTimestamp) - xEventTimelineScale(data.startTimestamp)) 
                    .attr("height", 25)
                    .style("fill", stepColorScale(data.value));
            });

            
            currentY+=25;
            ////////////////////////////////////////
            // Error Bar Chart
            errorData.forEach(data => {
                eventTimelineGroup.append("rect")
                    .attr("x", xEventTimelineScale(data.startTimestamp))
                    .attr("y", currentY+1)
                    .attr("width", xEventTimelineScale(data.endTimestamp) - xEventTimelineScale(data.startTimestamp)) 
                    .attr("height", 14)
                    .style("fill", () => data.value == "error" || data.value == "Error" ? "black" : "#AEAEAE");
            });

            currentY+=15;
            ////////////////////////////////////////
            // Prediction Bar Chart
            predictionData.forEach(data => {
                eventTimelineGroup.append("rect")
                    .attr("x", xEventTimelineScale(data.startTimestamp))
                    .attr("y", currentY+1)
                    .attr("width", xEventTimelineScale(data.endTimestamp) - xEventTimelineScale(data.startTimestamp)) 
                    .attr("height", 24)
                    .style("fill", stepColorScale(data.value));
            });
            let variableName= "Confidence" 
            let duration= allTimestamps['t'+sessionMission.trial_id+"-s"+sessionMission.subject_id]
            // Add the confidence line
            eventTimelineGroup.append("path")
                .datum(sessionMission.data.filter(function(d) { return d.seconds >= 0 && d.seconds<=duration }))
                .attr("fill", "none")
                .attr("stroke", "black") // "#add8e6")
                .attr("stroke-width", 1)
                .attr("stroke-opacity", 0.8)
                .attr("d", d3.line()
                .x(function(d) { return xEventTimelineScale(d.seconds) })
                .y(function(d) { return currentY + yScaleLine(d[variableName]) }))
            
            currentY+=25;
            ////////////////////////////////////////
            // Phase Fligth removed
            
            currentY+=15
            ////////////////////////////////////////
            // Rectangle to hold individual summaries
            eventTimelineGroup.append("rect")
                .attr("x", 0)
                .attr("y", currentY-80)
                .attr("rx", 7)
                .attr("ry", 7)
                .attr("width", xEventTimelineScale.range()[1])
                .attr("height", 80)
                .style("stroke", "black")
                .style("stroke-width", "0.5px")
                .style("stroke-opacity", 0.7)
                .style("fill", "none")
                .style("fill-opacity", 0)
                //.style("stroke-dasharray", "10,10");

            ////////////////////////////////////////
            // BRUSH
            let brush = d3.brushX()
                .extent([[0, currentY-80], [xEventTimelineScale.range()[1] , currentY]])
                .on("start", brushstart)
                .on("end", brushended);
            
            brushesAdded.push(brush)
            brushIndices.push[{trial:sessionMission.trial_id, subject:sessionMission.subject_id, brushAt:brushCount}]
            brushCount+=1

            eventTimelineGroup.append("g")
                .attr("class", "brush timelinebrush brush-t"+sessionMission.trial_id+"-s"+sessionMission.subject_id)
                .attr("data-trial",sessionMission.trial_id)
                .attr("data-subject",sessionMission.subject_id)
                .datum({brush:brush})
                .call(brush);
            //clear all other brushes when brushing starts
            function brushstart(){
                let allBrushes = eventTimelineGroup.selectAll(".timelinebrush").nodes()
                allBrushes.forEach((eachBrush)=>{
                    if (eachBrush !=this)
                        d3.select(eachBrush).call(d3.brush().move, null); 
                })
            }   

            // Brushing end 
            function brushended (e){
                console.log("brush ended")

                matrixGroup.selectAll(".highlight-arcs")
                    .classed("highlight-arcs", false)

                matrixGroup.selectAll(".arc>path")
                    .style("fill-opacity",1)

                matrixGroup.selectAll(".circle")
                    .style("fill-opacity",1)


                if (e.selection == null){
                    set_brushedTrial(null);
                    set_brushedSubject(null);
                    d3.selectAll(".hide-bar")
                        .classed("hide-bar",false);
                        updateMatrix( dataFiles );
                        updateHl2Details( dataFiles);
                    return
                }

                if (typeof e.sourceEvent != 'undefined') {
                    brushedTrial = e.sourceEvent.srcElement.parentElement.getAttribute("data-trial")
                    brushedSubject = e.sourceEvent.srcElement.parentElement.getAttribute("data-subject")
                    set_brushedTrial(brushedTrial);
                    set_brushedSubject(brushedSubject);
                }
                brushedSubject = get_brushedSubject();
                brushedTrial = get_brushedTrial();  
                vidStart = reverseTimelineScale(e.selection[0])
                vidEnd = reverseTimelineScale(e.selection[1])
                set_vidStart(vidStart);
                set_vidEnd(vidEnd);
                let videoPath = get_videoPath(brushedSubject, brushedTrial);
                playVideoWithStartTime(videoPath, vidStart);

                d3.selectAll(".error-session-bar")
                    .classed("hide-bar",true);
                d3.selectAll(".prediction-session-bar")
                    .classed("hide-bar",true);
                d3.selectAll(".t"+brushedTrial+"-s"+brushedSubject)
                    .classed("hide-bar",false)

                let sessionObject = dataFiles[0].filter(obj => obj.subject_id == brushedSubject && obj.trial_id == brushedTrial)[0]
                let stepNames = new Set();
                sessionObject['consolidatedStepData'].step.forEach((step)=>{
                    if (step.startTimestamp > vidStart && step.startTimestamp < vidEnd)
                        stepNames.add(step.value)
                    else if (step.endTimestamp> vidStart && step.startTimestamp < vidEnd)
                        stepNames.add(step.value)
                })
                stepNames.forEach((name)=>{
                    let arcName = "arc-" + name + "-"+brushedSubject +"-" + brushedTrial;
                    let circleName = "circle-" + name + "-"+brushedSubject +"-" + brushedTrial;

                    let arcElements = document.getElementsByClassName(arcName)
                    if(arcElements.length==2){
                       arcElements[0].firstChild.classList.toggle("highlight-arcs") 
                       arcElements[1].firstChild.classList.toggle("highlight-arcs")   
                    } 

                    let circleElements = document.getElementsByClassName(circleName)
                    if(circleElements.length==1){
                        circleElements[0].classList.toggle("highlight-arcs")  
                    } 
                })
                matrixGroup.selectAll(".arc>path")
                    .style("fill-opacity",0.1)
                matrixGroup.selectAll(".circle")
                    .style("fill-opacity",0.1)
                matrixGroup.selectAll(".highlight-arcs")
                    .style("fill-opacity",1)
                updateMatrix( dataFiles );
                updateHl2Details( dataFiles);

            }

            currentY+=10

            if (eventTimelineSvg.attr("height")<=currentY+200){
                eventTimelineGroup.attr("height",currentY+200)
                eventTimelineSvg.attr("height",currentY+250+margins.eventTimeline.top+margins.eventTimeline.bottom)     
            }
        })
        currentY+=50
        if (eventTimelineSvg.attr("height")<=currentY+200){
            eventTimelineGroup.attr("height",currentY+200)
            eventTimelineSvg.attr("height",currentY+250+margins.eventTimeline.top+margins.eventTimeline.bottom)     
        }
    })
    set_brushesAdded(brushesAdded);
}