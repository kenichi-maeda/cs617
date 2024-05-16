document.addEventListener('DOMContentLoaded', function(){

    addStyles_daytimeTotal();

    setupIntersectionOberver_daytimeTotal();

})

function addStyles_daytimeTotal(){
    const style_daytimeTotal = document.createElement('style');
    const cssStyles_daytimeTotal = `
        .plot{
            padding-left: 20px;
            padding-top: 20px;
        }
    `;
    style_daytimeTotal.textContent = cssStyles_daytimeTotal;
    document.head.appendChild(style_daytimeTotal);
}

function initializePlot_daytimeTotal() {
    const margin = {top: 20, right: 80, bottom: 50, left: 50},
    width = 700 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

    const svg = d3.select(".daytimeTotal")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("text")
        .attr("x", width/2-15)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-family", "Roboto")
        .attr("font-weight", "600") 
        .text("Total Number of Crime Incidents at Each Time (2023)");

    d3.csv("./data/daytime_total_data.csv", function(d) {
            d.count = +d.count;
            d.time = d3.timeParse("%H:%M")(d.time);
            return d;
        }, function(error, data) {
    
        // Add X axis
        var x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.time; }))
            .range([ 0, width ]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                    .ticks(d3.timeHour.every(1))
                    .tickFormat(d3.timeFormat('%H:%M'))
                    .tickSize(2));

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width / 2)
            .attr("y", height + margin.top + 20)
            .text("Time")
            .style("fill", "black")
            .style("font-size", "12px")
            .style("font-family", "Roboto")
            .style("font-weight", "500");

        svg.selectAll(".tick text")
            .style("font-size", "10px")
            .style("font-family", "Roboto")
            .attr("transform", "translate(-10,0)rotate(-35)")
            .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.count*1.1; })])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(2));

        // Line creation and animation
        const line = d3.line()
            .x(d => x(d.time))
            .y(d => y(d.count));

        const path = svg.append("path")
            .datum(data)
            .attr("style", "stroke: red; stroke-width: 2px; fill: none;")
            .attr("d", line);

        const totalLength = path.node().getTotalLength();

        path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(5000)
            .attr("stroke-dashoffset", 0);
    
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 16)
            .attr("x", -height/2)
            .text("Count")
            .style("fill", "black")
            .style("font-size", "14px")
            .style("font-family", "Roboto")
            .style("font-weight", "500");
    });
}

function setupIntersectionOberver_daytimeTotal() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initializePlot_daytimeTotal();
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.5
    });

    const target = document.querySelector('.daytimeTotal');
    observer.observe(target);
}
