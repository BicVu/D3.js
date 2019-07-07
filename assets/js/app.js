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

// Import Data
// RUN PROGRAM from parent folder, not js folder. 
// Direct to data from where the file is being run.
d3.csv("assets/data/data.csv") 
    .then(function(data) {
        // Parse data
        data.forEach(function(d) {
            d.poverty = +d.poverty;
            d.healthcare = +d.healthcare;
        });

        // Create scale functions to scale data to svg frame.
        var xLinearScale = d3.scaleLinear()
            // 10 is the size of the graph on top of the svg frame
            .domain([8, d3.max(data, d => d.poverty)])
            .range([0, width]);
        var yLinearScale = d3.scaleLinear()
            .domain([2, d3.max(data, d => d.healthcare)])
            .range([height, 0]);

        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Axis functions
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
        chartGroup.append("g")
            .call(leftAxis);

        // Create Circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", "15")
            .attr("fill", "#74b9ff")
            .attr("opacity", "1");

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
                

            // Add text to bubble
            // chartGroup.selectAll("text")
            //     .data(data)
            //     .enter()
            //     .append("text")
            //     .attr("x", d => xLinearScale(d.poverty)) // coords for text
            //     .attr("y", d => yLinearScale(d.healthcare))
            //     .attr("dy", "1em")
            //     // .attr("class", "axisText")
            //     .text(`${d.abbr}`);

            // toolTips are the pop-up labels
            var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function(d) {
              return (`${d.abbr}<br>Poverty: ${d.poverty}<br>Healthcare: ${d.healthcare}`);
            });

            chartGroup.call(toolTip);

            circlesGroup.on("click", function(data) {
                toolTip.show(data, this);
              })
                // onmouseout event
                .on("mouseout", function(data, index) {
                  toolTip.hide(data);
                });
                
            // Create axes labels
            chartGroup.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", margin.left - 100)
                .attr("x", 0 - (height/1.5))
                .style("font-size", "1.5em")
                // .attr("dy", "1em")
                .attr("class", "axisText")
                .text("Lacks Healtcare (%)");
        
                chartGroup.append("text")
                    .attr("transform", `translate(${width /2.5}, ${height + margin.top + 30})`)
                    .attr("class", "axisText")
                    .style("font-size", "1.5em")
                    .text("In Poverty (%)");


    });

