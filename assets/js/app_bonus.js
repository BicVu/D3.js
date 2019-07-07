// Note: You'll need to use `python -m http.server` to run the visualization. This will host the page at `localhost:8000` in your web browser.
var svgWidth = 800;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 60,
    bottom: 60,
    left: 60
};

// Subtract margin to determine usable area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// Update x-scale upon click
function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
            d3.max(data, d => d[chosenXAxis])*1.2
        ])
        .range([0, width]);
    return xLinearScale;
}

// Update xAxis var upon click
function renderAxes (newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// Update and trasition circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

// Update tooltiop
function updateToolTip(chosenXAxis, circleGroup) {
    if(chosenXAxis === "poverty") {
        var label = "Poverty:";
    }
    else {
        var label = "Age:";
    }
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.abbr}<br>Poverty: ${label}<br>Healthcare: ${d[chosenXAxis]}`);
        });
    
    circleGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });
    
    return circlesGroup;
}

// Import Data
d3.csv("assets/data/data.csv", function(err, data) {
    if (err) throw err;

    // Parse data
    data.forEach(function(d) {
        d.poverty = +d.poverty;
        d.age = +d.age;
        d.healthcare = +d.healthcare;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.healthcare)])
        .range([height, 0]);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    // append initial cirlcles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "15")
        .attr("fill", "#74b9ff")
        .attr("opacity", "1");

    // Create group for 2 x axis abels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 10)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("Poverty");

    var healthcareLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 10)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Healthcare");

    // append y axis
    // chartGroup.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - margin.left)
    //     .attr("dy", "1em")
    //     .classed("axis-text", true)
    //     .text("Number of Billboard 500 Hits");


    // append y axis
    chartGroup.append("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#192a56")
        .selectAll("tspan")
        .data(data)
        .enter()
        .append("tspan")
            .attr("x", function(data) {
                return xLinearScale(data.poverty - 0);
            })
            .attr("y", function(data) {
                return yLinearScale(data.healthcare - 0.2);
            })
            .text(function(data) {
                return data.abbr;
            });
    
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
                    
    labelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // replace chosenXAxis
                chosenXAxis = value;
                console.log(chosenXAxis)
                // updat x scale for new data
                xLinearScale = xScale(data, chosenXAxis);
                // update with transtion
                xAxis = renderAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
                // update tooltip
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                }    
            }
        });
    });

