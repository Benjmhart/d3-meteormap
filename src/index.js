/*global fetch*/

import * as d3 from "d3";
import 'd3-selection-multi'

import styles from './index.scss'

const height = window.innerHeight
const width = window.innerWidth

const svg = d3.select('body').append('svg')
    .attrs({
        height,
        width
    })

const projection =  d3.geoMercator()
      .scale(width / 2 / Math.PI)
      //.scale(100)
      .translate([width / 2, height / 2])
      
const path = d3.geoPath()
      .projection(projection);
      
const url = "http://enjalot.github.io/wwsd/data/world/world-110m.geojson";
    d3.json(url, function(err, geojson) {
        if(err){console.log(err)}
      svg.append("path")
        .attr("d", path(geojson))
    })
      
fetch('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json')
    .then(r => r.json())
    .then(j => {
        console.log(j)
        const data = j.features
        const sizes = data.map(x => Number(x.properties.mass))
        
        const sizeScale = d3.scaleLinear()
            .domain([0, d3.max(sizes)])
            .range([2, 20])
        
        const timeParse = (str)=> str.substring(0,4)
        
        const colorScale = (i) => {
            const colors = ["red", "blue", "green", "orange", "purple", "lime", "aqua", "orange", "coral", "pink" ]
            return colors[i % colors.length]
        }
        
        const handleMouseOver = (d) => {
            const fo = svg.append('foreignObject')
                .attrs({
                    "class": "tooltip",
                    x: width * 0.4,
                    y: height * 0.6,
                    width: 200,
                    height:200
                })
            const div = fo.append("xhtml:div")
                .append('div')
                .attrs({
                    "class": "tooldiv"
                })
            div.append('p')
                .text(`Name: ${d.properties.name}`)
            div.append('p')
                .text(`Mass: ${d.properties.mass}`)
            div.append('p')
                .text(`Fall: ${d.properties.fall}`)
            div.append('p')
                .text(`Recclass: ${d.properties.recclass}`)
            div.append('p')
                .text(`Year:${timeParse(d.properties.year)}`)
            
        }
        
        const handleMouseOut = () => {
            d3.select('.tooltip').remove()
        }
        
        const datapoints = svg.selectAll('circle.datapoint')
            .data(data)
            .enter()
            .append('circle')
            .attrs({
                "class": "datapoint",
                cx: d => {
                    if(d.geometry === null){return 0}
                    return projection(d.geometry.coordinates)[0]},
                cy: d => {
                    if(d.geometry === null){return 0}
                    return projection(d.geometry.coordinates)[1]},
                r: d =>sizeScale(d.properties.mass),
                fill: (d, i) => colorScale(i),
                stroke: "white",
                "stroke-width": 1

            })
        datapoints.on('mouseover', d => handleMouseOver(d))
        datapoints.on('mouseout', () => handleMouseOut())
    })