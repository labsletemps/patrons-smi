var data;
var resizeTimeout;
var currentCeo = null;
var stats = {};

function draw(column="salary", suffix='', ceoName='') {
  var xLabel = {
    'salary': 'millions de CHF',
    'experienceYears': 'années au poste de CEO',
    'stocksEvolution': '% d’évolution',
    'employees': 'milliers d’employés',
    // 'age': 'âge'
  };

  var containerWidth = $('#chart-container').width();
  var availableWidth = containerWidth; // limite: (containerWidth >= 460)? 460: containerWidth;
  var targetChart = "#" + column + "Chart";
  currentCeo = ceoName;

  // dimensions
  var margin = {top: 8, right: 40, bottom: 32, left: 50},
      width = availableWidth - margin.left - margin.right,
      height = 80 - margin.top - margin.bottom;

  d3.selectAll(targetChart + " *").remove();

  // on target le svg correspondant
  var svg = d3.select(targetChart)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // axe des x
    var y = d3.scaleBand()
      .range([ height, 0 ])
      .domain(["test"])
      .padding(.2);

    // max / min et axe des y (à rendre propre)
    var tempMax = stats[column][0]["value"]['max'];
    var tempMin = stats[column][0]["value"]['min'] < 0 ? stats[column][0]["value"]['min'] : 0;
    if(column == 'age'){
      tempMin = 42;
      tempMax = 66;
    }

    var x = d3.scaleLinear()
      .domain([tempMin, tempMax + (tempMax / 10)])
      .range([0, width])
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks())
      .select(".domain").remove() // pas de ligne moche

    // text label (millions, ...) pour axe des x
    svg.append("text")
      .attr("class", "xLabel")
        .attr("transform",
              "translate(" + (width) + " ," +
                             (height + margin.top + 20) + ")")
        .style("text-anchor", "end")
        .text(xLabel[column]);

    // moustaches
    svg
      .selectAll("vertLines")
      .data(stats[column])
      .enter()
      .append("line")
        .attr("x1", function(d){return(x(d.value.min))})
        .attr("x2", function(d){return(x(d.value.q1))})
        .attr("y1", function(d){return(y(d.key) + y.bandwidth()/2)})
        .attr("y2", function(d){return(y(d.key) + y.bandwidth()/2)})
        .attr("stroke", "black")
        .style("width", 40)

    svg
      .selectAll("vertLines")
      .data(stats[column])
      .enter()
      .append("line")
        .attr("x1", function(d){return(x(d.value.q3))})
        .attr("x2", function(d){return(x(d.value.max))})
        .attr("y1", function(d){return(y(d.key) + y.bandwidth()/2)})
        .attr("y2", function(d){return(y(d.key) + y.bandwidth()/2)})
        .attr("stroke", "black")
        .style("width", 40)

    // rectangle moustache
    svg
      .selectAll("boxes")
      .data(stats[column])
      .enter()
      .append("rect")
        .attr("class", "moustache")
          .attr("x", function(d){return(x(d.value.q1))})
          .attr("width", function(d){ return(x(d.value.q3)-x(d.value.q1))})
          .attr("y", function(d) { return y(d.key); })
          .attr("height", y.bandwidth() );


    svg
      .selectAll("boxes")
      .data(stats[column])
      .enter()
      .append("rect")
        .attr("class", "moustacheOuter")
          .attr("x", function(d){return(x(d.value.q1))})
          .attr("width", function(d){ return(x(d.value.q3)-x(d.value.q1))})
          .attr("y", function(d) { return y(d.key); })
          .attr("height", y.bandwidth() );

    // mediane
    svg
      .selectAll("medianLines")
      .data(stats[column])
      .enter()
      .append("line")
        .attr("class", "medianLines")
        .attr("y1", function(d){return(y(d.key))})
        .attr("y2", function(d){return(y(d.key) + y.bandwidth())})
        .attr("x1", function(d){return(x(d.value.median))})
        .attr("x2", function(d){return(x(d.value.median))})
        .style("width", 80)

    // tooltip caché
    var tooltip = d3.select(targetChart)
      .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");

    // afficher / masquer tooltip
    var mouseover = function(d) {
      var space = ' ';
      var prefix = '';
      if(suffix == '%'){
        space = '';
        if(d[column] > 0){
          prefix = '+';
        }
      }
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 1)
      tooltip
          .html('<span class="tooltip-ceo">' + d.Nom + ", " + d.Entreprise + ":</span> " + prefix + d[column] + space + suffix)
          .style("left", (d3.mouse(this)[0]+30) + "px")
          .style("top", (d3.mouse(this)[1]+30) + "px")
    }
    var mousemove = function(d) {
      tooltip
        .style("left", (d3.mouse(this)[0]+30) + "px")
        .style("top", (d3.mouse(this)[1]+30) + "px")
    }
    var mouseleave = function(d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
    }

    // points pour les autres CEO
    svg
      .selectAll("indPoints")
      .data(data.filter(function(d){ return d.Nom != ceoName; }).filter(function(d){ return d[column] != null; }))
      .enter()
      .append("circle")
        .attr("cx", function(d){ return(x(d[column]))})
        .attr("cy", function(d){ return( y(d.Species) + (y.bandwidth()/2))})
        .attr("r", 5)
        .attr("class", "ceo")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    // notre CEO
    var ceoData = data.filter(function(d){ return d.Nom == ceoName; }).filter(function(d){ return d[column] != null; });

    svg
      .selectAll("indPoints")
      .data(ceoData)
      .enter()
      .append("circle")
        .attr("cx", function(d){ return(x(d[column]))})
        .attr("cy", function(d){ return( y(d.Species) + (y.bandwidth()/2))})
        .attr("r", 8)
        .attr("class", "ceo active")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

      svg
        .selectAll("activeCeoLine")
        .data(ceoData)
        .enter()
        .append("line")
          .attr("x1", function(d){return(x(d[column]))})
          .attr("x2", function(d){return(x(d[column]))})
          .attr("y1", y.bandwidth()/8)
          .attr("y2", function(d){return(y(d.Species) + y.bandwidth()/4)})
          .attr("stroke", "#333");

      svg.append("text")
      .data(ceoData)
       .attr("y", y.bandwidth() / 10)
       .attr("x", function(d){return(x(d[column]))})
       .attr('text-anchor', 'middle')
       .attr("class", "activeCeoLabel")
       .text(ceoName);

}

d3.json("json/salaires.json", function(loadedData) {
  data = loadedData;
  var columns = ['salary', 'experienceYears', 'stocksEvolution', 'employees']; // , 'age'

  columns.forEach(function(col){

    var tempData = data.filter(function(d){ return d[col] != null; })
    // a nettoyer un jour
    try{
      stats[col] = d3.nest()
        .key(function(d) { return d.Species;})
        .rollup(function(d) {
          var q1 = d3.quantile(d.map(function(g) { return +g[col];}).sort(d3.ascending),.25);
          var median = d3.quantile(d.map(function(g) { return +g[col];}).sort(d3.ascending),.5);
          var q3 = d3.quantile(d.map(function(g) { return +g[col];}).sort(d3.ascending),.75);
          var interQuantileRange = q3 - q1;
          var min = d3.min(d.map(function(g) { return +g[col];}));
          var max = d3.max(d.map(function(g) { return +g[col];}));
          return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max});
        })
        .entries(tempData);
      }
      catch(err){
        console.log('Erreur: ' + err);
      }
  });

  // enlever quand tests terminés
  // cardObject = {'cardTitle': "Alain Dehaze"}
  // draw("salary", "millions de francs", cardObject.cardTitle);
  // draw("experienceYears", "ans", cardObject.cardTitle);
  // draw("stocksEvolution", "%", cardObject.cardTitle);
  // draw("employees", "employés", cardObject.cardTitle);
  // draw("age", "ans", "dd");

});

window.addEventListener("resize", function(){
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function(){
    draw("salary", "millions de francs", currentCeo);
    draw("experienceYears", "ans", currentCeo);
    draw("stocksEvolution", "%", currentCeo);
    draw("employees", "employés", currentCeo);
    // draw("age", "ans", currentCeo);

  }, 200);
});
