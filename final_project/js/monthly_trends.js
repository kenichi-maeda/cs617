document.addEventListener('DOMContentLoaded', function(){

    addStyles_monthly_trends();

    setupIntersectionOberver_monthly_trends();

})

function addStyles_monthly_trends(){
    const style_monthlyTrends = document.createElement('style');
    const cssStyles_monthlyTrends = `
        .plot{
            padding-left: 20px;
            padding-top: 20px;
        }
    `;
    style_monthlyTrends.textContent = cssStyles_monthlyTrends;
    document.head.appendChild(style_monthlyTrends);
}

function initializePlot_monthly_trends() {
    const margin = {top: 20, right: 80, bottom: 50, left: 50},
    width = 700 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

    const svg = d3.select(".monthlyTrends")
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
        .text("Number of Crime Incidents (2015-2024)");

    d3.csv("./data/monthly_trends.csv", function(d) {
            d.YEAR = +d.YEAR;
            d.count = +d.count;
            d.date = d3.timeParse("%m-%d")(d.day_of_year);
            return d;
        }, function(error, data) {
    
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.count)])
            .range([height, 0]);

        const color = d3.scaleOrdinal(d3.schemeCategory10);
        
        const circles = svg.selectAll("dot")
                    .data(data)
                    .enter().append("circle")
                    .attr("r", 4)
                    .attr("cx", d => x(d.date))
                    .attr("cy", d => y(d.count))
                    .style("fill", d => color(d.YEAR))
                    .style("opacity", 0.8)
                    .style("opacity", 0);

        circles.transition()
            .delay((d, i) => i * 10) 
            .duration(500)
            .style("opacity", 0.8);

        svg.select(".x.axis") 
            .selectAll("text") 
            .style("font-size", "18px");

        svg.select(".y.axis")
            .selectAll("text")
            .style("font-size", "12px");

        // X axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x)
                    .ticks(d3.timeMonth)
                    .tickFormat(d3.timeFormat("%b"))
                    .tickSize(2) 
                )
        
        svg.selectAll(".tick text")
            .style("font-size", "13px")
            .style("font-family", "Roboto");
            
        svg.append("text")
            .attr("class", "axis-label")
            .attr("y", height+40)
            .attr("x", width / 2)
            .attr("text-anchor", "middle")
            .text("Months")
            .style("fill", "black")
            .style("font-size", "15px")
            .style("font-family", "Roboto")
            .style("font-weight", "500");

        // Y axis
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(2) )

        svg.selectAll(".tick text")
            .style("font-size", "13px")
            .style("font-family", "Roboto");

        svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("x", -height / 2)
            .attr("dy", "1em")
            .attr("text-anchor", "middle")
            .text("Number of Crime Incidents")
            .style("fill", "black")
            .style("font-size", "15px")
            .style("font-family", "Roboto")
            .style("font-weight", "500");


        // Legend
        const legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(70,${i * 20})`);

        legend.append("rect")
            .attr("x", width - 15)
            .attr("width", 13)
            .attr("height", 13)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 8)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(d => d)
            .style("fill", "black")
            .style("font-size", "14px")
            .style("font-family", "Roboto");
    });
}

function setupIntersectionOberver_monthly_trends() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initializePlot_monthly_trends();
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.5
    });

    const target = document.querySelector('.monthlyTrends');
    observer.observe(target);
}
