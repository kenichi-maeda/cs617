document.addEventListener('DOMContentLoaded', function(){

    addStyles_maCities();

    setupIntersectionObserver_maCities();

})

function addStyles_maCities(){
    const style_maCities = document.createElement('style');
    const cssStyles_maCities = `
        .plot{
            padding-left: 20px;
            padding-top: 20px;
        }
    `;
    style_maCities.textContent = cssStyles_maCities;
    document.head.appendChild(style_maCities);
}

function initializePlot_maCities() {
    const margin = {top: 20, right: 80, bottom: 80, left: 50},
    width = 550 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

    const svg = d3.select(".maCities")
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
        .text("Chances of being a victim of violent crime per 1000 residents (MA)");

    d3.csv("./data/maCities.csv", function(d) {
            d.count = +d.count;
            return d;
        }, function(error, data) {
    
        // X axis
        var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(d => d.city))
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
            .attr("y", height+70)
            .attr("x", width / 2 + 10)
            .attr("text-anchor", "middle")
            .text("Cities")
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
            .attr("x", d => x(d.city) + (x.bandwidth() * (1 - barWidthFactor) / 2))
            .attr("width", x.bandwidth()*barWidthFactor)
            .attr("fill", d => d.city === "Boston" ? "red" : "#42b9f5")
            .attr("height", function(d) { return height - y(0); })
            .attr("y", function(d) { return y(0); })

        // Animation
        svg.selectAll("rect")
            .transition()
            .duration(800)
            .attr("y", function(d) { return y(d.count); })
            .attr("height", function(d) { return height - y(d.count); })
            .delay((d, i) => i * 100)

        // Draw horizontal line
        svg.append("line")
            .attr("x1", 0)
            .attr("y1", y(3.22))
            .attr("x2", width)
            .attr("y2", y(3.22))
            .attr("stroke", "black")
            .attr("stroke-dasharray", "4")

        // Add label
        svg.append("text")
            .attr("x", 10)
            .attr("y", 160)
            .text("Massachusetts Median")
            .style("font-size", "15px")
            .style("fill", "black")
            .style("font-family", "Roboto");;
    });

}

function setupIntersectionObserver_maCities() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initializePlot_maCities();
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.5
    });

    const target = document.querySelector('.maCities');
    observer.observe(target);
}

