const eduURL = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";

const geoURL = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";

var dataURL = [eduURL, geoURL];
var parsed = [];
const w = 1000;
const h = 720;


////////////////////////////////////////////

d3.select('body').
append('h1').
attr('id', 'title').
text('test');

////////////////////////////////////////////

const svg = d3.select('body').
append('svg').
attr('id', 'description');

const path = d3.geoPath();
////////////////////////////////////////////
const legend = d3.select('body').
append('svg').
attr('id', 'legend');

const colorScale = d3.scaleThreshold().
domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8)).
range(d3.schemePurples[9]);

const xColorScale = d3.scaleLinear().
domain([2.6, 75.1]).
range([0, 300]);


legend.selectAll('#legend').

data(colorScale.range().map(value => {
  var color = colorScale.invertExtent(value);
  if (color[0] == null) color[0] = xColorScale.domain()[0];
  if (color[1] == null) color[1] = xColorScale.domain()[1];
  return color;})).
enter().
append('rect').
attr('y', 0).
attr('x', d => xColorScale(d[0])).
attr('height', 20).
attr('width', d => xColorScale(d[1]) - xColorScale(d[0])).
attr('fill', d => colorScale(d[0]));

legend.append('g').
attr('transform', `translate(0,18)`).
call(d3.axisBottom(xColorScale).
tickValues(colorScale.domain()).
tickFormat(d => Math.round(d) + '%'));


///////////////////////////////////

const tooltip = d3.select('body').
append('div').
attr('id', 'tooltip');

/////////////////////////////////////

d3.queue(2).
defer(d3.json, eduURL).
defer(d3.json, geoURL).
await(createMap);

function createMap(err, eduData, geoData) {

  if (err) {console.log('Something is Wrong: ' + err);}



  svg.append('g').
  selectAll('path').
  data(topojson.feature(geoData, geoData.objects.counties).features).
  enter().
  append('path').
  attr('d', path).
  attr('class', 'county').
  attr('data-fips', d => d.id).
  attr('data-education',
  function (d) {
    var edu = eduData.filter(obj => d.id == obj.fips);
    if (edu[0]) {return edu[0].bachelorsOrHigher;} else
    {return 0;}
  }).

  attr('data-location', function (d) {
    var loc = eduData.filter(obj => d.id == obj.fips);
    return `${loc[0].state}, ${loc[0].area_name}`;
  }).
  attr('fill', function (d) {
    var col = eduData.filter(obj => d.id == obj.fips);
    if (col[0]) {
      return colorScale(col[0].bachelorsOrHigher);} else
    {colorScale(0);}

  }).
  on('mouseover', d => {
    tooltip.style('opacity', 0.85).
    style('left', d3.event.pageX + 15 + 'px').
    style('top', d3.event.pageY + 5 + 'px').
    attr('data-education', function () {
      var edu = eduData.filter(obj => d.id == obj.fips);
      if (edu[0]) {return edu[0].bachelorsOrHigher;} else
      {return 0;}
    });

    tooltip.html(function () {
      var edu = eduData.filter(obj => d.id == obj.fips);
      if (edu[0]) {

        return `${edu[0].state}, ${edu[0].area_name}: ${edu[0].bachelorsOrHigher}%`;} else
      {return 0;}
    });}).

  on('mouseleave', function () {
    tooltip.style('opacity', 0).
    attr('left', 0).
    attr('top', 0);

  });

}