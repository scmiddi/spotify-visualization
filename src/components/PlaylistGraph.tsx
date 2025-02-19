'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  name: string;
  type: 'track' | 'artist';
}

interface Link {
  source: string;
  target: string;
}

interface PlaylistGraphProps {
  tracks: {
    id: string;
    name: string;
    artists: { name: string; }[];
  }[];
}

export default function PlaylistGraph({ tracks }: PlaylistGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !tracks.length) return;

    // Daten vorbereiten
    const nodes: Node[] = [];
    const links: Link[] = [];

    // Tracks und Artists zu Nodes hinzufügen
    tracks.forEach(track => {
      nodes.push({
        id: track.id,
        name: track.name,
        type: 'track'
      });

      track.artists.forEach(artist => {
        // Prüfen ob Artist bereits existiert
        if (!nodes.find(node => node.id === artist.name)) {
          nodes.push({
            id: artist.name,
            name: artist.name,
            type: 'artist'
          });
        }

        // Link zwischen Track und Artist erstellen
        links.push({
          source: track.id,
          target: artist.name
        });
      });
    });

    // SVG Setup
    const width = 800;
    const height = 600;
    
    // SVG und Container für Zoom
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    // Zoom-Verhalten hinzufügen
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Container für den zoombare Inhalt
    const container = svg.append('g');

    // Simulation erstellen
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Links zeichnen
    const link = container.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6);

    // Nodes zeichnen
    const node = container.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Kreise für die Nodes
    node.append('circle')
      .attr('r', 5)
      .attr('fill', (d: Node) => d.type === 'track' ? '#4CAF50' : '#2196F3');

    // Text Labels
    node.append('text')
      .attr('dx', 8)
      .attr('dy', '.35em')
      .text((d: Node) => d.name)
      .attr('fill', 'white')
      .style('font-size', '12px');

    // Simulation Update
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag Funktionen
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Initial zoom to fit
    const bounds = (svg.node() as SVGSVGElement).getBBox();
    const fullWidth = bounds.width;
    const fullHeight = bounds.height;
    const scale = Math.min(width / fullWidth, height / fullHeight) * 0.9;
    const translateX = (width - fullWidth * scale) / 2;
    const translateY = (height - fullHeight * scale) / 2;
    
    svg.call(zoom.transform as any, d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(scale));

    return () => {
      simulation.stop();
    };
  }, [tracks]);

  return (
    <div className="w-full h-[600px] bg-zinc-900 rounded-lg overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
} 