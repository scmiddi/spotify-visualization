'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'track' | 'artist' | 'genre';
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  playlistIds?: string[];
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  type: 'track-artist' | 'artist-genre';
}

interface PlaylistGraphProps {
  tracks: Array<{
    id: string;
    name: string;
    artists: Array<{
      name: string;
      genres?: string[];
    }>;
    playlistId: string;
  }>;
}

export default function PlaylistGraph({ tracks }: PlaylistGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !tracks.length) return;

    const nodes: Node[] = [];
    const links: Link[] = [];
    const genreMap = new Map<string, string[]>();

    // Tracks und Artists zu Nodes hinzufügen
    tracks.forEach(track => {
      // Track Node
      const existingTrack = nodes.find(n => n.id === track.id);
      if (existingTrack) {
        existingTrack.playlistIds = [
          ...(existingTrack.playlistIds || []),
          track.playlistId
        ];
      } else {
        nodes.push({
          id: track.id,
          name: track.name,
          type: 'track',
          playlistIds: [track.playlistId]
        });
      }

      // Artist und Genre Nodes
      track.artists.forEach(artist => {
        // Artist Node
        if (!nodes.find(n => n.id === artist.name)) {
          nodes.push({
            id: artist.name,
            name: artist.name,
            type: 'artist'
          });
        }

        // Track-Artist Link
        links.push({
          source: track.id,
          target: artist.name,
          type: 'track-artist'
        });

        // Genres sammeln
        if (artist.genres) {
          artist.genres.forEach(genre => {
            const artists = genreMap.get(genre) || [];
            if (!artists.includes(artist.name)) {
              artists.push(artist.name);
              genreMap.set(genre, artists);
            }
          });
        }
      });
    });

    // Genre Nodes und Links hinzufügen
    genreMap.forEach((artists, genre) => {
      nodes.push({
        id: genre,
        name: genre,
        type: 'genre'
      });

      artists.forEach(artist => {
        links.push({
          source: artist,
          target: genre,
          type: 'artist-genre'
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

    // Zoom Setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    const container = svg.append('g');

    // Simulation Setup
    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Links zeichnen
    const link = container.append('g')
      .selectAll<SVGLineElement, Link>('line')
      .data(links)
      .join('line')
      .attr('stroke', d => d.type === 'track-artist' ? '#999' : '#666')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => d.type === 'track-artist' ? 1 : 0.5);

    // Nodes zeichnen
    const node = container.append('g')
      .selectAll<SVGGElement, Node>('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Node Styling
    node.append('circle')
      .attr('r', d => {
        switch (d.type) {
          case 'track': return d.playlistIds && d.playlistIds.length > 1 ? 8 : 5;
          case 'artist': return 6;
          case 'genre': return 4;
          default: return 5;
        }
      })
      .attr('fill', d => {
        switch (d.type) {
          case 'track': return d.playlistIds && d.playlistIds.length > 1 ? '#ff4444' : '#4CAF50';
          case 'artist': return '#2196F3';
          case 'genre': return '#9C27B0';
          default: return '#999';
        }
      });

    node.append('text')
      .attr('dx', 8)
      .attr('dy', '.35em')
      .text(d => d.name)
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