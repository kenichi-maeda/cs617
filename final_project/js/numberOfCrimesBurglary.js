document.addEventListener('DOMContentLoaded', function(){

    addStyles_numberOfCrimesBurglary();

    setupIntersectionObserver_numberOfCrimesBurglary();

})

function addStyles_numberOfCrimesBurglary(){
    const style_numberOfCrimesBurglary = document.createElement('style');
    const cssStyles_numberOfCrimesBurglary = `
        .plot{
            padding-left: 20px;
            padding-top: 20px;
        }
    `;
    style_numberOfCrimesBurglary.textContent = cssStyles_numberOfCrimesBurglary;
    document.head.appendChild(style_numberOfCrimesBurglary);
}

function initializePlot_numberOfCrimesBurglary() {
    const margin = {top: 20, right: 80, bottom: 80, left: 50},
    width = 550 - margin.left - margin.right,
    height = 380 - margin.top - margin.bottom;

    const svg = d3.select(".numberOfCrimesBurglary")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("text")
        .attr("x", width/2-2)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("font-family", "Roboto")
        .attr("font-weight", "600") 
        .text("Number of Burglary Incidents (2016-2023)");

    d3.csv("./data/numberOfCrimesOverYearsBurglary.csv", function(d) {
            d.count = +d.count;
            return d;
        }, function(error, data) {
    
        // X axis
        var x = d3.scaleBand()
                .range([ 0, width ])
                .domain(data.map(d => d.YEAR))
                .padding(0.1);

        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(2))
        
        svg.selectAll(".tick text")
            .style("font-size", "13px")
            .style("font-family", "Roboto")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");
            
        svg.append("text")
            .attr("class", "axis-label")
            .attr("y", height + 50)
            .attr("x", width / 2)
            .attr("text-anchor", "middle")
            .text("Year")
            .style("fill", "black")
            .style("font-size", "15px")
            .style("font-family", "Roboto")
            .style("font-weight", "500");

        // Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.count*1.1; })])
            .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(2));

        svg.selectAll(".tick text")
            .style("font-size", "13px")
            .style("font-family", "Roboto");


        const barWidthFactor = 0.6;
        
        // Bars
        svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
            .attr("x", d => x(d.YEAR) + (x.bandwidth() * (1 - barWidthFactor) / 2))
            .attr("width", x.bandwidth()*barWidthFactor)
            .attr("fill", "#4CB140")
            .attr("height", function(d) { return height - y(0); })
            .attr("y", function(d) { return y(0); })

        let transitionCount = data.length;

        // Animation
        svg.selectAll("rect")
            .transition()
            .duration(800)
            .attr("y", function(d) { return y(d.count); })
            .attr("height", function(d) { return height - y(d.count); })
            .delay((d, i) => i * 100)
            .on("end", () => {
                transitionCount--;
                if (transitionCount === 0) {
                    drawLine();
                }
            });

        // Line Graph
        function drawLine() {
            if (!svg.select(".trend-line").empty()) return;
            
            const line = d3.line()
                .x(d => x(d.YEAR) + x.bandwidth() / 2)
                .y(d => y(d.count))
                .curve(d3.curveMonotoneX);

            const path = svg.append("path")
                .datum(data)
                .attr("style", "stroke: red; stroke-width: 2px; fill: none;")
                .attr("d", line);

            const totalLength = path.node().getTotalLength();

            path.attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(1000)
                .attr("stroke-dashoffset", 0)
                .on("start", () => {
                    const audio = new Audio("data/pop.mp3");
                    const totalPoints = data.length;
                    const interval = 1000 / totalPoints;
                    let pointIndex = 0;
        
                    const playSoundAtPoints = () => {
                        if (pointIndex < totalPoints) {
                            const clone = audio.cloneNode();
                            clone.play();
                            pointIndex++;
                        }
                    };
        
                    const intervalId = setInterval(playSoundAtPoints, interval);
                    setTimeout(() => clearInterval(intervalId), 1000);
                });
        }
    });

}

function setupIntersectionObserver_numberOfCrimesBurglary() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initializePlot_numberOfCrimesBurglary();
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.5
    });

    const target = document.querySelector('.numberOfCrimesBurglary');
    observer.observe(target);
}

