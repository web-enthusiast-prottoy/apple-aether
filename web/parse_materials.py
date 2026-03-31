import json
import struct

def print_gltf_materials():
    with open('public/aether-3d/apple-aether.glb', 'rb') as f:
        f.read(12) # skip header
        chunk0_len, chunk0_type = struct.unpack('<II', f.read(8))
        if chunk0_type != 0x4E4F534A: # 'JSON'
            print("Not JSON chunk!")
            return
        json_data = f.read(chunk0_len)
        try:
            gltf = json.loads(json_data.decode('utf-8'))
            materials = gltf.get('materials', [])
            print("Found {} materials.".format(len(materials)))
            for i, m in enumerate(materials):
                print(f"[{i}] {m.get('name', 'Unnamed')}")
        except Exception as e:
            print(f"Error parsing JSON: {e}")

if __name__ == '__main__':
    print_gltf_materials()
