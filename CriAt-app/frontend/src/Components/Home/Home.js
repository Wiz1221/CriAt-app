import React, { Component } from 'react';
import { connect } from 'react-redux';

import { changeDataset } from '../../Actions/DataAction';

import { line, curveStepAfter } from 'd3-shape';
import { scaleLinear, scaleTime, scaleOrdinal, schemeCategory10 } from 'd3-scale';
import { format } from 'd3-format';
import { timeMonth } from 'd3-time';
import { timeFormat } from 'd3-time-format';
import { axisBottom } from 'd3-axis';
import { min, max, extent, sum, bisector } from 'd3-array';
import { select, mouse } from 'd3-selection';
// import { transition } from 'd3-transition';

// Css
import './Home.css'

class Home extends Component {

    width = 0;
    height = 0;
    margin = { top: 20, right: 40, bottom: 20, left: 40 };
    legendMargin = { left: 100, right: 100 };
    legendHeight = 50;
    numOfTicks = 6;
    formatValue = format(".3r");
    lengthSum = 0;

    doTimeSeries = (_data, _xConfig, _yConfig) => {
        _data.forEach(function(d) {
            d.date = new Date(d.date);
        });

        this.width = 960 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom - this.legendHeight;

        let bisectDate = bisector((d) => d.date).left;

        // Add an SVG element with the desired dimensions and margin.
        const graph = select(this.node)
            .append("g")
            .attr('class', 'graph')
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

        // Scales and axes. Note the inverted domain for the y-scale: bigger is up!
        const xScale = scaleTime().range([0, this.width])
            .domain(extent(_data, (d) => d.date))
            .nice(timeMonth);

        this.setXAxis(xScale, graph);

        let axisWidth = {
            left: [],
            right: []
        };
        let legendItemWidths = [];
        let getClassValues = (key) => {
            return this[key];
        };

        this.setGrid(graph);

        let lineContainer = graph.append('g').attr('class', 'line-container');
        let tickContainer = graph.append('g').attr('class', 'tick-container');
        let tooltip = select(this.tooltip);
        let legend = graph.append("g")
            .attr("class", "legend")
            .attr('transform', 'translate(' + this.legendMargin.left + ',' + (this.height + this.legendHeight) + ')')

        const colors = scaleOrdinal(schemeCategory10);

        for (let i = 0; i < _yConfig.keys.length; i++) {
            let key = _yConfig.keys[i];
            let yAxisConfig = _yConfig.config[i];
            let yMax = max(_data, (d) => d[key]);
            let yMin = min(_data, (d) => d[key]);
            let color = (yAxisConfig.style && yAxisConfig.style.color) || colors(Math.random() * 50);
            let axisPlacement = yAxisConfig.placement || 'left';
            yAxisConfig.color = color;

            let yScale = scaleLinear()
                .range([this.height, 0])
                .domain([yMin, yMax])
                .nice();

            // Add the y-axis
            let params = {
                // domain: yScale.domain(),
                yScale: yScale,
                tickContainer: tickContainer,
                yAxisConfig: yAxisConfig,
                axisPlacement,
                callback: (_width) => { axisWidth[axisPlacement].push(_width) }
            }
            this.setYAxis(params);

            // A line generator for historical and currentQueue
            const lineFunc = line()
                .x((d) => xScale(d.date))
                .y((d) => yScale(d[key]));

            if (yAxisConfig.curveType === 'step') {
                lineFunc.curve(curveStepAfter);
            }

            // Draw lines
            lineContainer.selectAll('.line-' + key)
                .data([_data])
                .enter()
                .append('path')
                .attr('class', 'line-' + key)
                .style('stroke', color)
                .style('stroke-width', 2)
                .style('fill', 'none')
                //.attr('clip-path', 'url(#clip)')
                .attr('d', (d) => lineFunc(d));

            // add legend
            this.setLegendItem(legend, i, _yConfig, (_width) => {
                legendItemWidths.push(_width);
            });
        }

        // space each legend item equally
        this.setLegendItemPos(legend, legendItemWidths);

        // space each y axis equally
        this.setYAxisPos(tickContainer, axisWidth);

        // set tooltip
        select(this.node).append("rect")
            .attr("class", "overlay")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("transform", "translate(" + (this.margin.left) + "," + this.margin.top + ")")
            .attr('fill', 'transparent')
            .on('mouseover', function() {
                tooltip.style('display', 'block');
            })
            .on('mouseout', function() {
                lineContainer.select('.tooltip-line').remove();
                tooltip.style('display', 'none');
            })
            .on('mousemove', function() {
                let height = getClassValues('height');
                let margin = getClassValues('margin');
                let getFormatValue = getClassValues('getFormatValue');

                let xCoord = mouse(this)[0];
                let xValue = xScale.invert(xCoord);

                // get data value nearest to mouse
                let i = bisectDate(_data, xValue, 1);
                if (i === _data.length) {
                    i = _data.length - 1;
                }
                let d0 = _data[i - 1],
                    d1 = _data[i],
                    currData = xValue - d0.date > d1.date - xValue ? d1 : d0;
                let currXCoord = xScale(currData.date);

                // set tooltip text
                let tooltipText = '';
                tooltipText += timeFormat("%a %b %d %Y")(currData.date);

                for (let i = 0; i < _yConfig.keys.length; i++) {
                    let key = _yConfig.keys[i];
                    let label = _yConfig.labels[i];
                    let value = getFormatValue(currData[key], _yConfig.config[i]);
                    tooltipText += '<br><span style="color:' + _yConfig.config[i].color + ';">' + label + '</span> : ' + value;
                }
                tooltip.html(tooltipText);

                // set tooltip position
                tooltip
                    .style('top', (height / 2 + margin.top - tooltip.node().offsetHeight / 2) + 'px')
                    .style('left', (currXCoord - tooltip.node().offsetWidth / 2) + 'px')

                // draw tooltip line
                let tooltipLine = lineContainer.select('.tooltip-line');
                if (tooltipLine.empty()) {
                    tooltipLine = lineContainer
                        .append('line')
                        .attr('class', 'tooltip-line');
                }

                tooltipLine
                    .attr('x1', currXCoord)
                    .attr('x2', currXCoord)
                    .attr('y1', 0)
                    .attr('y2', height)
                    .style('stroke', '#DDDDDD')
                    .style('stroke-width', 1)
            });
    }

    setXAxis = (_xScale, _graph) => {
        let xAxis = axisBottom(_xScale)
            .tickFormat(timeFormat('%b %Y'))
            .ticks(timeMonth.every(2));

        // Add the x-axis.
        let xAxisContainer = _graph.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(xAxis);

        // move the text lower for ui purpose
        xAxisContainer.selectAll('text').attr('y', 10);
    }

    setGrid = (_graph) => {
        // draw grid container
        let grid = _graph.append("g").attr("class", "grid");
        // draw each grid lines
        for (var i = 1; i < this.numOfTicks + 1; i++) {
            let yCoord = this.height - (i * this.height / this.numOfTicks);
            grid.append('line')
                .attr('x1', 0)
                .attr('x2', this.width)
                .attr('y1', yCoord)
                .attr('y2', yCoord)
                .style('stroke', '#DDDDDD')
        }
    }

    setYAxis = (_params) => {
        let yAxisContainer = _params.tickContainer.append('g')
            .attr('class', 'y-axis y-axis-' + _params.axisPlacement)

        let tickValues = this.getTickValues(_params.yScale);
        for (var j = 0; j < tickValues.length; j++) {
            let tick = this.getFormatValue(tickValues[j], _params.yAxisConfig);
            yAxisContainer.append('g')
                .attr('class', 'tick')
                .attr('transform', 'translate(0,' + (this.height - (j * this.height / this.numOfTicks) - 5) + ')')
                .append('text')
                .text(tick)
                .attr('stroke', _params.yAxisConfig.color)
                .style('opacity', 0.4)
                .style('font-size', '15px !important');
        }
        _params.callback(yAxisContainer.node().getBBox().width);
    }

    setYAxisPos = (_tickContainer, _axisWidth) => {
        for (let placement in _axisWidth) {
            _tickContainer
                .selectAll('.y-axis-' + placement)
                .attr('transform', (d, i) => {
                    let value = this.getOffsetPos(i, 20, _axisWidth[placement]);
                    if (placement === 'right') value = this.width - value - _axisWidth[placement][i];
                    return 'translate(' + value + ',0)';
                });
        }
        this.lengthSum = 0;
    }

    setLegendItem = (_legend, _i, _yConfig, _callback) => {
        let legendItem = _legend
            .append('g')
            .attr('class', 'legend-item legend-item-' + _i);

        legendItem.append('line')
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('y1', 5)
            .attr('y2', 5)
            .style('stroke', _yConfig.config[_i].color)
            .style('stroke-width', 2);

        legendItem.append('text')
            .attr("x", 30)
            .attr("y", 10)
            //.attr("dy", ".35em")
            .text(_yConfig.labels[_i])
            .style("text-anchor", "start")
            .style("font-size", 15);

        _callback(legendItem.node().getBBox().width);
    }

    setLegendItemPos = (_legend, _legendItemWidths) => {
        let legendWidth = this.width - this.legendMargin.left - this.legendMargin.right;
        let legendOffset = (legendWidth - sum(_legendItemWidths)) / (_legendItemWidths.length - 1);
        _legend
            .selectAll('.legend-item')
            .attr('transform', (d, i) => {
                let value = this.getOffsetPos(i, legendOffset, _legendItemWidths);
                return 'translate(' + value + ',0)';
            });
        this.lengthSum = 0;
    }

    getOffsetPos = (_index, _offset, _widths) => {
        if (_index === 0) {
            this.lengthSum = _widths[_index] + _offset;
            return 0
        } else {
            let newdataL = this.lengthSum;
            this.lengthSum += _widths[_index] + _offset;
            return newdataL;
        }
    };

    getFormatValue = (_value, _config) => {
        let result = this.formatValue(_value);
        if (_config && _config.format) {
            result = _config.format.replace(/{y}/g, result);
        }
        return result;
    }

    getTickValues = (_yScale) => {
        // let domain = _yScale.domain();
        // let min = domain[0];
        // let max = domain[1];
        // if (typeof min === 'string') min = parseFloat(min);
        // if (typeof max === 'string') max = parseFloat(max);
        // let step = (max - min) / this.numOfTicks;
        let ticks = [];
        for (let i = 0; i < this.numOfTicks; i++) {
            let yCoord = this.height - (i * this.height / this.numOfTicks);
            let value = _yScale.invert(yCoord);
            ticks.push(value);
        }
        return ticks;
    }

    // DESTROY chart
    deleteTimeSeries = () => {
        const svg = select(this.node);
        svg.selectAll('.graph')
            .remove();
    }

    render() {
        return (
            <div className="criAt-chart">
                <svg ref={node => this.node = node} viewBox="0 0 960 500"></svg>
                <div className="chart-tooltip" ref={node => this.tooltip = node}></div>
            </div>
        );
    }
    //
    componentDidMount() {
        if (this.props.data && this.props.data.datasetOne) {
            this.doTimeSeries(this.props.data.datasetOne, this.props.data.config);
        }
        // , this.props.config);

    }

    componentDidUpdate() {
        if (this.props.data) {
            let activeDataset = Object.keys(this.props.data.datasetLabels)[0];
            this.doTimeSeries(this.props.data[activeDataset], this.props.data.x, this.props.data.y);
        }
    }

    componentWillUnMount() {
        this.deleteTimeSeries();
    }
}
//
const mapStateToProps = (state) => {
    return {
        data: state.data,
        // config: state.config
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        changeDataset: () => { dispatch(changeDataset()); }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);