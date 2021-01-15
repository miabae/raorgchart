const dimensions = { height: 350, width: 900 };

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dimensions.width + 50)
    .attr('height', dimensions.height + 150);

const graph = svg.append('g')
    .attr('transform', 'translate(50, 50)');

// data stratify
const stratify = d3.stratify()
    .id(d => d.name)
    .parentId(d => d.parent);

const tree = d3.tree()
    .size([dimensions.width, dimensions.height]);

const colour = d3.scaleOrdinal([
    '#540804', '#81171b', '#ad2e24', '#c75146', '#ea8c55',
    '#5e0b15', '#90323d', '#d9cab3', '#bc8034', '#8c7a6b'
]);

// update function
const update = (data) => {
    graph.selectAll('.node').remove();
    graph.selectAll('.link').remove();

    colour.domain(data.map(item => item.department));

    const rootNode = stratify(data);
    const treeData = tree(rootNode);

    const nodes = graph.selectAll('.node')
        .data(treeData.descendants());

    const links = graph.selectAll('.link')
        .data(treeData.links());

    links.enter()
        .append('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', '#1d2d44')
        .attr('stroke-width', 1)
        .attr('d', d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
        );

    const enterNodes = nodes.enter()
        .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x}, ${d.y})`);

    enterNodes.append('rect')
        .attr('fill', d => colour(d.data.department))
        .attr('stroke', '#1d2d44')
        .attr('stroke-width', 1)
        .attr('height', 25)
        .attr('width', d => d.data.name.length * 8)
        .attr('transform', d => {
            var x = d.data.name.length * 4
            return `translate(${-x}, -16)`
        });

    enterNodes.append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .text(d => d.data.name);
};

// data and firestore
var data = [];

db.collection('rafamily').onSnapshot(res => {
    res.docChanges().forEach(change => {
        const doc = {...change.doc.data(), id: change.doc.id};
        switch (change.type) {
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                const index = data.findIndex(item => item.id == doc.id);
                data[index] = doc;
                break;
            case 'removed':
                data = data.filter(item => item.id !== doc.id);
                break;
            default:
                break;
        }
    });

    update(data);
});