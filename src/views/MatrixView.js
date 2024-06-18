import * as d3 from 'd3';
import { get_allTimestamps, get_stepColorScale, get_margins, get_unique_subjects, get_unique_trials, get_selectedFnirs, get_selectedItems, get_selectedGroupby} from './config.js'
import { get_matrixGroup, get_matrixSvg, get_matrixTooltip, get_scatterGroup, get_scatterSvg } from './containersSVG.js';
import { get_brushedSubject, get_brushedTrial } from './configHl2Details.js';

export function updateMatrix( dataFiles ){
    // Extract unique sources from the data
    let uniqueTrials = get_unique_trials();
    let uniqueSubjects = get_unique_subjects();

    console.log("updateScatterplot");  
    const margins = get_margins();
    let selectedItems = get_selectedItems();
    console.log(selectedItems);
    // get selected value from dropdown menus
    // let selectedScatterSource = get_selectedScatterSource();
    let selectedScatterSource = "all_sessions";
    let selectedGroupby = get_selectedGroupby(); // subject
    // let selectedFilter = get_selectedFilter();
    let selectedFilter = "10";

    let brushedTrial = get_brushedTrial();
    console.log("brushedTrial");
    console.log(brushedTrial);

    // get svgs
    let scatterGroup = get_scatterGroup();
    let scatterSvg = get_scatterSvg();
    
    
    margins.scatterplot.right=10;

    scatterGroup.attr("width", scatterSvg.attr("width")-margins.scatterplot.left - margins.scatterplot.right)

    function generateScaleScatter(data, accessor) {
        const uniqueValues = Array.from(new Set(data.map(d => d[accessor])));
        return d3.scaleOrdinal()
            .domain(uniqueValues)
            .range(d3.schemeAccent);
    }

    scatterGroup.selectAll("*").remove()
    scatterSvg.selectAll(".legendgroup").remove();
    scatterSvg.selectAll(".legendrect").remove();
    scatterGroup.append("rect")
        .attr("x",0)
        .attr("y",0)
        .attr("height", scatterGroup.attr("height"))
        .attr("width", scatterGroup.attr("width"))
        .attr("fill-opacity",0)
    let filteredData;
    if (brushedTrial == null){
        filteredData = dataFiles[2].filter(d => d.session === "all_sessions");
    } else {
        filteredData = dataFiles[2].filter(d => d.session === brushedTrial);
    }
    scatterSvg.selectAll('.lasso').remove();
    scatterGroup.selectAll('.unselectedscatter').attr("class","scatterpoints");

    // let scatterScaleEncoding = generateScaleScatter(filteredData, selectedGroupby);
    let scatterScaleEncoding = generateScaleScatter(filteredData, "label");


    let scatterplotDiv = d3.select("#scatterplot-container") 
    const xScaleScatter = d3.scaleLinear()
        .domain(d3.extent(filteredData, d => +d.x))
        .range([0, scatterplotDiv.node().clientWidth - margins.scatterplot.left - margins.scatterplot.right]);

    
    // Append tooltip
    let scatterTooltip =scatterplotDiv.append("div")
        .attr("class", "tooltip")
        .style("opacity",0.9)
        .style("visibility","hidden")
        .style("position", "absolute")
        //.style("width","150px")
        .style("background-color", "white")
        .style("padding", "8px")
        .style("border-radius", "5px")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)")
        .style("text-align", "left"); // Add text-align: left to align text left
        ;

    const yScaleScatter = d3.scaleLinear()
        .domain(d3.extent(filteredData, d => +d.y))
        .range([scatterplotDiv.node().clientHeight - margins.scatterplot.bottom - margins.scatterplot.top, 0]);
    
    // DRAW scatterplot
    scatterGroup.selectAll("circle")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("cx", d => xScaleScatter(+d.x))
        .attr("cy", d => yScaleScatter(+d.y))
        .attr("r", 2)
        .attr("fill", d => {return scatterScaleEncoding(d.label);})
        .attr("class", "scatterpoints")
        .on("mouseover", function(d) {
            scatterTooltip.transition()
                .duration(200)
                .style("visibility", "visible");
                scatterTooltip.html(`<strong>Skill:</strong> ${d.target.__data__.skill}<br><strong>Subject:</strong> ${d.target.__data__.session}<br><strong>Step:</strong> ${d.target.__data__.label}`)
                .style("left", (d.layerX + 10) + "px")
                .style("top", (d.layerY - 28) + "px");
        })
        .on("mouseout", function(d) {
            scatterTooltip.transition()
                .duration(500)
                .style("visibility", "hidden");
        });
}