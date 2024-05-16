document.addEventListener('DOMContentLoaded', function(){

    addStyles_weeklyTrends();

    setupIntersectionObserver_weeklyTrends();

})

function addStyles_weeklyTrends(){
    const style_weeklyTrends = document.createElement('style');
    const cssStyles_weeklyTrends = `
        .plot{
            padding-left: 20px;
            padding-top: 20px;
        }
    `;
    style_weeklyTrends.textContent = cssStyles_weeklyTrends;
    document.head.appendChild(style_weeklyTrends);
}

function initializePlot_weeklyTrends() {
    const margin = {top: 20, right: 80, bottom: 80, left: 50},
    width = 550 - margin.left - margin.right,
    height = 380 - margin.top - margin.bottom;

    const svg = d3.select(".weeklyTrends")
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
        .text("Average Number of Crime Incidents (2016-2023)");

    d3.csv("./data/weekly_trends.csv", function(d) {
            d.YEAR = +d.YEAR;
            d.count = +d.count;
            d.date = d3.timeParse("%m-%d")(d.day_of_year);
            return d;
        }, function(error, data) {

            if (error) throw error;

            var sumstat = d3.nest()
                .key(function(d) { return d.YEAR; })
                .entries(data);
            
    
            const x = d3.scaleBand()
                .domain(data.map(d => d.DAY_OF_WEEK).filter((v, i, a) => a.indexOf(v) === i))
                .range([ 0, width ])
                .padding(0.2);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, function(d) { return d.average_cases; }) *1.7])
                .range([ height, 0 ]);

            const xAxis = svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(x).tickSize(2))
                .selectAll("text")
                .style("font-size", "14px")
                .style("font-family", "Roboto")

            svg.selectAll(".tick text")
                .style("font-size", "13px")
                .style("font-family", "Roboto")
                .attr("transform", "translate(-10,0)rotate(-35)")
                .style("text-anchor", "end");
        
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", width / 2 + margin.left)
                .attr("y", height + margin.top + 48)
                .text("Day of the Week")
                .style("fill", "black")
                .style("font-weight", "500")
                .style("font-size", "14px")
                .style("font-family", "Roboto");;

            const yAxis = svg.append("g")
                .call(d3.axisLeft(y).tickSize(2))
                .selectAll("text")
                .style("font-size", "13px")
                .style("font-family", "Roboto");

            // Y axis label
            /*
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 20)
                .attr("x", -height/3)
                .text("Average Number of Cases")
                .style("fill", "black")
                .style("font-size", "16px")
                .style("font-family", "Roboto");*/
        
            const years = sumstat.map(d => d.key); 
            //console.log(years)
        
            // color palette
            const color = d3.scaleOrdinal(d3.schemeCategory10).domain(years); 

            const line = d3.line()
                            .x(function(d) { return x(d.DAY_OF_WEEK) + x.bandwidth() / 2; })
                            .y(function(d) { return y(d.average_cases); });
        
            // Draw line
            svg.selectAll(".line")
                .data(sumstat)
                .enter()
                .append("path")
                .attr("class", "line")
                .attr("style", function(d, i) { 
                    return "stroke: " + color(d.key) + "; stroke-width: 1.8; fill: none;"})
                .attr("d", d => line(d.values))
                .attr("stroke-dasharray", function() {
                    const length = this.getTotalLength();
                    return `${length} ${length}`;
                })
                .attr("stroke-dashoffset", function() {
                    return this.getTotalLength();
                })
                .transition()
                .duration(3000)
                .attr("stroke-dashoffset", 0);

            // Legend
            const legend = svg.selectAll(".legend")
                .data(years)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", (d, i) => `translate(70,${i * 20})`);

            legend.append("rect")
                .attr("x", width - 15)
                .attr("width", 13)
                .attr("height", 13)
                .style("fill", d => color(d));

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 8)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text( d => d)
                .style("fill", "black")
                .style("font-size", "14px")
                .style("font-family", "Roboto");
    });

}

function setupIntersectionObserver_weeklyTrends() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initializePlot_weeklyTrends();
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.5
    });

    const target = document.querySelector('.weeklyTrends');
    observer.observe(target);
}

