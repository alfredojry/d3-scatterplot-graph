document.addEventListener('DOMContentLoaded', function () {
  req = new XMLHttpRequest();
  req.open('GET', 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json', true);
  req.send();
  req.onload = function () {
    let dataset = JSON.parse(req.responseText);
    //console.log(dataset[0]);
    
    // Setting SVG dimentions
    const w = 900;
    const h = 400;
    const padding = 50;
    
    // #Define SVG
    svg = d3.select('#svg-container')
            .append('svg')
            .attr('width', w)
            .attr('height', h);
    
    // #Define the div for the tooltip
    let tooltip = d3.select('body')
                    .append('div')
                    .attr('class', 'div-tooltip')
                    .style('opacity', 0);
    
    // # Define the scales
    // ## Integer to date
    const yearToDate = num => new Date((new Date()).setFullYear(num));
    const minYear = d3.min(dataset, d => yearToDate(d.Year));
    const maxYear = d3.max(dataset, d => yearToDate(d.Year));
    const xScale = d3.scaleTime()
                     .domain([minYear, maxYear])
                     .range([padding, w - 1 * padding]);
    // ## String to date
    const strToDate = str => {
      let [min, sec] = str.split(':');
      min = parseInt(min);
      sec = parseInt(sec);
      return new Date(new Date(new Date(new Date(new Date().setHours(0))).setMinutes(min)).setSeconds(sec));
    };
    const minTime = d3.min(dataset, d => strToDate(d.Time));
    const maxTime = d3.max(dataset, d => strToDate(d.Time));
    const yScale = d3.scaleTime()
                     .domain([minTime, maxTime])
                     .range([h - padding, padding]);
    // ##Color scale
    const ordinalScale = d3.scaleOrdinal()
                           .domain([true, false])
                           .range(d3.schemePaired);
    
    // #Format data date to Date Objects | Allegations
    dataset.forEach(d => {
      d.YearToDate = yearToDate(d.Year);
      d.TimeToDate = strToDate(d.Time);
      d.Allegation = /^Alleged/.test(d.Doping);
    });
    
    // ##Define the scale to vertical axis visualization
    const yAxisScale = d3.scaleTime()
                         .domain([maxTime, minTime])
                         .range([h - padding, padding]);
    
    // #Append the circles to SVG
    svg.selectAll('circle')
       .data(dataset)
       .enter()
       .append('circle')
       .attr('class', 'dot')
       .attr('data-xvalue', d => d.YearToDate)
       .attr('data-yvalue', d => d.TimeToDate)
       .attr('cx', d => xScale(d.YearToDate))
       .attr('cy', d => h - yScale(d.TimeToDate))
       .attr('r', 5)
       .attr('fill', d => ordinalScale(d.Allegation))
       .on('mouseover' , d => {
         tooltip.attr('id', 'tooltip')
                .attr('data-year', d.YearToDate)
                .transition()
                .duration(200)
                .style('opacity', 0.9);
      tooltip.html(d.Name + ', ' + d.Nationality + '<br>Year: ' + d.Year + ', Time: ' + d.Time)
             .style('left', d3.event.pageX + 'px')
             .style('top', d3.event.pageY + 'px');
       })
      .on('mouseout', d => {
      tooltip.transition()
             .duration(200)
             .style('opacity', 0)
    });
    
    // #Add axes to visualization
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yAxisScale)
                    .tickFormat(d3.timeFormat('%M:%S'));
    svg.append('g')
       .attr('id', 'x-axis')
       .attr('transform', 'translate(0,' + (h - padding) + ')')
       .call(xAxis);
    svg.append('g')
       .attr('id', 'y-axis')
       .attr('transform', 'translate(' + padding + ',0)')
       .call(yAxis);
    
    // #Add legend
    legend = svg.selectAll('.legends')
                .data([false, true])
                .enter()
                .append('g')
                .attr('id', 'legend')
                .attr('transform',(d, i) => 'translate(0, ' + (h / 2 - i * 25) + ')');
    legend.append('rect')
          .attr('x', w - 20 - padding)
          .attr('width', 20)
          .attr('height', 20)
          .style('fill', d =>  ordinalScale(d));
    legend.append('text')
          .attr('x', w - 25 - padding)
          .attr('y', 12)
          .style('font-size', '10px')
          .style('text-anchor', 'end')
          .style('font-family', 'arial')
          .text(d => d ? 'Riders with doping allegations' : 'Riders without doping allegations');
    
    // Add text to axis
    d3.select('svg')
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -180)
    .attr('y', 14)
    .attr('class', 'text-axis')
    .attr('font-family', 'arial')
    .text('Time mm:ss');
  };
});