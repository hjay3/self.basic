import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface IdentityData {
  Strength: number;
  Title?: string;
  Beliefs?: string;
  Style?: string;
}

interface SelfMapProps {
  data: Record<string, IdentityData>;
}

const SelfMapVisualization: React.FC<SelfMapProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !chartRef.current) return;

    // Clear any existing SVG
    d3.select(chartRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 60, right: 160, bottom: 60, left: 60 };
    const width = 900 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add gradient definition
    const defs = svg.append("defs");
    const gradient = defs.append("radialGradient")
      .attr("id", "point-gradient");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "white")
      .attr("stop-opacity", 0.3);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "white")
      .attr("stop-opacity", 0);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([-10, 10])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([-10, 10])
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
      .range(d3.schemeSet3);

    // Add grid
    const makeGrid = () => {
      svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${height/2})`)
        .call(d3.axisBottom(xScale)
          .tickSize(-height)
          .tickFormat(() => "")
        )
        .style("stroke", "#e5e7eb")
        .style("stroke-opacity", 0.5);

      svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${width/2}, 0)`)
        .call(d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => "")
        )
        .style("stroke", "#e5e7eb")
        .style("stroke-opacity", 0.5);
    };

    makeGrid();

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickSize(-5)
      .tickPadding(10);
    const yAxis = d3.axisLeft(yScale)
      .tickSize(-5)
      .tickPadding(10);

    svg.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0, ${height/2})`)
      .call(xAxis)
      .style("color", "#4b5563");

    svg.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${width/2}, 0)`)
      .call(yAxis)
      .style("color", "#4b5563");

    // Process data
    const processedData = Object.entries(data).map(([key, value]) => ({
      name: key,
      strength: value.Strength,
      details: value
    }));

    // Add connecting lines group
    const lineGroup = svg.append("g").attr("class", "connections");

    // Calculate positions helper functions
    const calculatePosition = (value: number, scale: d3.ScaleLinear<number, number>) => {
      if (value === 10) return scale(0);
      if (value >= 5) return scale(value / 2);
      return scale(value);
    };

    const calculateSize = (value: number) => {
      const baseSize = 7;
      if (value === 10) return baseSize * 1.8;
      if (value >= 5) return baseSize * 1.4;
      return baseSize;
    };

    // Add data points
    const points = svg.selectAll(".dot")
      .data(processedData)
      .enter()
      .append("g")
      .attr("class", "point-group");

    points.append("circle")
      .attr("class", "dot-glow")
      .attr("r", d => calculateSize(d.strength) * 2)
      .attr("cx", d => calculatePosition(d.strength, xScale))
      .attr("cy", d => calculatePosition(d.strength, yScale))
      .style("fill", "url(#point-gradient)");

    points.append("circle")
      .attr("class", "dot")
      .attr("r", d => calculateSize(d.strength))
      .attr("cx", d => calculatePosition(d.strength, xScale))
      .attr("cy", d => calculatePosition(d.strength, yScale))
      .style("fill", d => colorScale(d.name))
      .style("stroke", "white")
      .style("stroke-width", "2px")
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        const tooltip = d3.select("body")
          .append("div")
          .attr("class", "absolute bg-black bg-opacity-90 text-white p-3 rounded-lg pointer-events-none opacity-0 transition-opacity duration-300 text-sm max-w-xs shadow-lg");

        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", calculateSize(d.strength) * 1.2);

        const centerX = calculatePosition(d.strength, xScale);
        const centerY = calculatePosition(d.strength, yScale);
        
        lineGroup.selectAll(".connection-line")
          .data(processedData.filter(item => item !== d))
          .join("line")
          .attr("class", "connection-line")
          .attr("x1", centerX)
          .attr("y1", centerY)
          .attr("x2", item => calculatePosition(item.strength, xScale))
          .attr("y2", item => calculatePosition(item.strength, yScale))
          .style("stroke", colorScale(d.name))
          .style("stroke-width", "1px")
          .style("stroke-opacity", "0.2");

        tooltip.transition()
          .duration(200)
          .style("opacity", 1);
        
        tooltip.html(`
          <strong>${d.name}</strong><br>
          Strength: ${d.strength}/10<br>
          ${d.details.Title ? `Role: ${d.details.Title}<br>` : ''}
          ${d.details.Beliefs ? `Beliefs: ${d.details.Beliefs}<br>` : ''}
          ${d.details.Style ? `Style: ${d.details.Style}` : ''}
        `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", (d: any) => calculateSize(d.strength));

        lineGroup.selectAll(".connection-line").remove();
        d3.selectAll(".absolute").remove();
      });

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, 20)`);

    const legendItems = legend.selectAll(".legend-item")
      .data(processedData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    legendItems.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("rx", 4)
      .style("fill", d => colorScale(d.name));

    legendItems.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("fill", "#666")
      .style("font-size", "12px")
      .text(d => d.name);

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Personal Identity Map");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2 + 25)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#666")
      .text("Exploring the dimensions of self-identity and personal values");

  }, [data]);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <div 
        ref={chartRef}
        className="w-full"
        style={{ minHeight: '700px' }}
      />
    </div>
  );
};

export default SelfMapVisualization;