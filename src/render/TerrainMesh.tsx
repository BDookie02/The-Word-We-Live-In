import { useMemo } from 'react';
import * as THREE from 'three';
import { BIOME_COLOR, BIOMES, biomeForHeight, type TerrainData } from '../sim';

/**
 * Builds a faceted low-poly terrain mesh from a {@link TerrainData} heightmap. Geometry is
 * non-indexed (vertices are not shared between triangles) and each triangle is flat-coloured
 * by the biome at its average height — this gives crisp facets and clean colour bands rather
 * than smooth gradients. Recomputed only when the terrain data changes (it's static per world).
 */
export default function TerrainMesh({ data }: { data: TerrainData }) {
  const geometry = useMemo(() => {
    const { size, worldSize, heights, waterLevel, maxHeight } = data;
    const verts = size + 1;
    const cell = worldSize / size;
    const half = worldSize / 2;

    const h = (i: number, j: number) => heights[j * verts + i];
    const wx = (i: number) => -half + i * cell;
    const wz = (j: number) => -half + j * cell;

    const positions: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color();

    const pushTri = (
      ax: number,
      ay: number,
      az: number,
      bx: number,
      by: number,
      bz: number,
      cx: number,
      cy: number,
      cz: number,
    ) => {
      positions.push(ax, ay, az, bx, by, bz, cx, cy, cz);
      const avg = (ay + by + cy) / 3;
      const biome = BIOMES[biomeForHeight(avg, waterLevel, maxHeight)];
      color.set(BIOME_COLOR[biome]);
      for (let k = 0; k < 3; k++) colors.push(color.r, color.g, color.b);
    };

    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        const x0 = wx(i);
        const x1 = wx(i + 1);
        const z0 = wz(j);
        const z1 = wz(j + 1);
        const h00 = h(i, j);
        const h10 = h(i + 1, j);
        const h01 = h(i, j + 1);
        const h11 = h(i + 1, j + 1);
        // Two triangles per cell (winding chosen so normals face up).
        pushTri(x0, h00, z0, x0, h01, z1, x1, h10, z0);
        pushTri(x1, h10, z0, x0, h01, z1, x1, h11, z1);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [data]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial vertexColors flatShading />
    </mesh>
  );
}
