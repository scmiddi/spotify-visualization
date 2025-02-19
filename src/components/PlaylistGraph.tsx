'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'track' | 'artist';
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
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
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    // Zoom-Verhalten
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    const container = svg.append('g');

    // Simulation
    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Links
    const link = container.append('g')
      .selectAll<SVGLineElement, Link>('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6);

    // Nodes
    const node = container.append('g')
      .selectAll<SVGGElement, Node>('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

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
        .attr('x1', d => (d.source as Node).x ?? 0)
        .attr('y1', d => (d.source as Node).y ?? 0)
        .attr('x2', d => (d.target as Node).x ?? 0)
        .attr('y2', d => (d.target as Node).y ?? 0);

      node
        .attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Drag Funktionen
    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
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
    
    svg.call(zoom.transform, d3.zoomIdentity
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