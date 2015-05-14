function title(d) { return d.id+" "+d.insertions; }
function group(d) { return d.company; }

var color = d3.scale.category10();
function colorByGroup(d) { return color(group(d)); }

var width = 600,
    height = 350;

var svg = d3.select('#dev_rel')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

var node, link;

var voronoi = d3.geom.voronoi()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .clipExtent([[-10, -10], [width+10, height+10]]);

function recenterVoronoi(nodes) {
    var shapes = [];
    voronoi(nodes).forEach(function(d) {
        if ( !d.length ) return;
        var n = [];
        d.forEach(function(c){
            n.push([ c[0] - d.point.x, c[1] - d.point.y ]);
        });
        n.point = d.point;
        shapes.push(n);
    });
    return shapes;
}

var force = d3.layout.force()
    .charge(-300)
    .friction(0.2)
    .linkDistance(40)
    .size([width, height]);

force.on('tick', function() {
    node.attr('transform', function(d) { return 'translate('+d.x+','+d.y+')'; })
        .attr('clip-path', function(d) { return 'url(#clip-'+d.index+')'; });

    link.attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });

    var clip = svg.selectAll('.clip')
        .data( recenterVoronoi(node.data()), function(d) { return d.point.index; } );

    clip.enter().append('clipPath')
        .attr('id', function(d) { return 'clip-'+d.point.index; })
        .attr('class', 'clip');
    clip.exit().remove()

    clip.selectAll('path').remove();
    clip.append('path')
        .attr('d', function(d) { return 'M'+d.join(',')+'Z'; });
});

d3.json('developers.json', function(err, data) {

    data.nodes.forEach(function(d, i) {
        d.nid = i;
    });

    link = svg.selectAll('.link')
        .data( data.links )
      .enter().append('line')
        .attr('class', 'link')
        .style("stroke-width", function(d) { return Math.sqrt(d.value); });

    node = svg.selectAll('.node')
        .data( data.nodes )
      .enter().append('g')
        .attr('title', title)
        .attr('class', 'node')
        .call( force.drag );

    node.append('circle')
    .attr('r', function(d) {return Math.sqrt(d.insertions)+5})
        .attr('fill', 'gray')
        .attr('fill-opacity', 0.3);

    node.append('circle')
    .attr('r', 5)
        .attr('fill', colorByGroup);

    force
        .nodes( data.nodes )
        .links( data.links )
        .start();
});
