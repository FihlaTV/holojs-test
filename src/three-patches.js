import { ShaderChunk } from 'three';

// rename transpose shader function to avoid conflict with built-in GLES 3.0 function
for (var chunk in ShaderChunk) ShaderChunk[chunk] = ShaderChunk[chunk].replace('transpose', 'transpose2');