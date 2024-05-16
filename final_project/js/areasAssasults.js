document.addEventListener('DOMContentLoaded', function(){
    const style1 = document.createElement('style');
    const cssStyles1 = `
        path {
            fill: #ccc;
            stroke: #fff;
            stroke-width: .5px;
        }
        .legend {
            font-size: 12px;
            color: black;
        }
        .plot{
            padding-left: 10px;
            padding-top: 10px;
        }.legend.axis line, .legend.axis path {
            display: none;
        } .legend.axis {
            font-family: "Roboto";
        } 
    `;
    style1.textContent = cssStyles1;
    document.head.appendChild(style1);

    const svg = d3.select(".areaAssaults");
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    svg.append("text")
        .attr("x", width/2-15)
        .attr("y", height-2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-family", "Roboto")
        .attr("font-weight", "600") 
        .text("Number of Assaults in 2023");

    var projection = d3.geoMercator()
                        .scale(50000)
                        .center([-71.0589, 42.3101])
                        .translate([width / 2, height / 2]);
        
    var path = d3.geoPath().projection(projection);

    // Load both GeoJSON and CSV data
    d3.queue()
        .defer(d3.json, "./data/Police_Districts.geojson")
        .defer(d3.csv, "./data/mapData_assault_2023.csv")
        .await(function(error, geoData, csvData) {
            if (error) throw error;

            // Map CSV data to GeoJSON
            var dataMap = {};
            csvData.forEach(function(d) {
                dataMap[d.DISTRICT] = +d.COUNT;
            });

            geoData.features.forEach(function(d) {
                d.properties.COUNT = dataMap[d.properties.DISTRICT] || 0;
            });

            var colorScale = d3.scaleLinear()
                               .domain([0, d3.max(csvData, function(d) { return d.COUNT; })])
                               .range(["#fff", "#000"]); 

            function isLight(d) {
                const count = d.properties.COUNT;
                const color = colorScale(count);
                const rgb = d3.rgb(color);
                // Calculate brightness
                const brightness = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114);
                return brightness > 166;
            }

            // Define gradient for legend
            var defs = svg.append("defs")
            var grad = defs.append("linearGradient")
                            .attr("id", "legend-gradient")
                            .attr("x1", "0%")
                            .attr("x2", "0%")
                            .attr("y1", "100%")
                            .attr("y2", "0%");

             grad.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "white")
             grad.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "black")


            // Draw paths
            svg.selectAll("path")
               .data(geoData.features)
               .enter().append("path")
               .attr("d", path)
               .style("fill", function(d) {
                    return colorScale(d.properties.COUNT);
               });

            // Add labels
            var texts = svg.selectAll(".district-label")
            .data(geoData.features)

            texts.enter().append("text")
                .attr("class", "distrcit-label")
                .merge(texts)
                .attr("x", function(d) { 
                    if (d.properties.DISTRICT == "A7") return path.centroid(d)[0]-14;
                    else return path.centroid(d)[0]-2; })
                .attr("y", function(d) { return path.centroid(d)[1]; })
                .attr("text-anchor", "middle")
                .attr("font-size", "9px")
                .attr("font-weight", "600") 
                .attr("font-family", "Roboto")
                .attr("fill", function(d) { return isLight(d) ? 'black' : 'white'; })
                .text(function(d) { return d.properties.DISTRICT; });

            // Add a color legend
            var legend = svg.append("rect")
                            .attr("class", "legend")
                            .attr("x", 160)
                            .attr("y", 170) 
                            .attr("width", 15)
                            .attr("height", 110) 
                            .style("fill", "url(#legend-gradient)");

            var legendScale = d3.scaleLinear()
                                .domain([0, d3.max(csvData, function(d) { return d.COUNT; })])
                                .range([100, 0])
                                .nice();

            var legendAxis = d3.axisRight(legendScale)
                                .ticks(5)
                                .tickSize(0);

            svg.append("g")
               .attr("class", "legend axis")
               .attr("transform", "translate(176, 173)")
               .call(legendAxis);
        });
})