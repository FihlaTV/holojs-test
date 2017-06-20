import { Geometry, BufferGeometry, Group, BufferAttribute, Mesh, Matrix4, Vector3, MeshPhongMaterial, Face3 } from 'three';

export class SpatialMap extends Group {

    constructor (material) {
        super();
        this._material = material ? material : new MeshPhongMaterial({ color: 0xFFFFFF });
        this._meshObjects = [];
    };

    clearMeshData (id) {
        if (id != undefined) {
            for (let meshIndex in this._meshObjects) {
                if (this._idEquals(this._meshObjects[meshIndex].id, id)) {
                    this.remove(this._meshObjects[meshIndex].mesh);
                    this._meshObjects[meshIndex].mesh.geometry.dispose();
                    this._meshObjects[meshIndex].mesh.material.dispose();
                    this._meshObjects.splice(meshIndex, 1);
                    break;
                }
            }
        }
    };

    setMeshData (surfaceData) {
        this.clearMeshData(surfaceData.id);
        let newMeshObject = this._createMeshObjectBuffered(surfaceData);
        this.add(newMeshObject.mesh);
        this._meshObjects.push(newMeshObject);
    };

    _idEquals (id1, id2) {
        if (id1.length != id2.length) {
            return false;
        }

        for (let i = 0; i < id1.length; i++) {
            if (id1[i] != id2[i]) {
                return false;
            }
        }

        return true;
    };

    _createMeshObjectBuffered (surface) {
        let geometry = new BufferGeometry();

        // Make copies of the incoming buffers; they get recycled after this returns
        let indices = new Uint16Array(surface.indices);
        let vertices = new Float32Array(surface.vertices);
        let normals = new Uint8Array(surface.normals);

        geometry.setIndex(new BufferAttribute(indices, 1));
        geometry.addAttribute('position', new BufferAttribute(vertices, 3));
        geometry.addAttribute('normal', new BufferAttribute(normals, 3, true));
        
        let vertexTransform = new Matrix4();
        vertexTransform.fromArray(surface.originToSurfaceTransform);
        geometry.applyMatrix(vertexTransform);

        return { id: surface.id, mesh: new Mesh(geometry, this._material) };
    };

}

export default SpatialMap;