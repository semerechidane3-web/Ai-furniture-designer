import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import * as THREE from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";

const sampleFurniture = [
  { id: 1, name: "Modern Sofa", img: "https://source.unsplash.com/400x300/?sofa" },
  { id: 2, name: "Wooden Chair", img: "https://source.unsplash.com/400x300/?chair" },
  { id: 3, name: "Luxury Bed", img: "https://source.unsplash.com/400x300/?bed" },
  { id: 4, name: "Dining Table", img: "https://source.unsplash.com/400x300/?table" },
];

export default function App() {
  const [selected, setSelected] = useState(null);
  const [generated, setGenerated] = useState(null);
  const [materialType, setMaterialType] = useState("fabric");
  const [prompt, setPrompt] = useState("");

  const [width, setWidth] = useState(3);
  const [depth, setDepth] = useState(1.5);
  const [height, setHeight] = useState(1);
  const [armThickness, setArmThickness] = useState(0.3);

  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  const generateDesign = () => {
    setGenerated({
      front: "https://source.unsplash.com/400x300/?furniture,front",
      top: "https://source.unsplash.com/400x300/?furniture,top",
      side: "https://source.unsplash.com/400x300/?furniture,side",
      realistic: "https://source.unsplash.com/400x300/?luxury,sofa"
    });
  };

  const exportSTL = () => {
    const exporter = new STLExporter();
    const data = exporter.parse(sceneRef.current);
    const blob = new Blob([data], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sofa_model.stl";
    link.click();
  };

  useEffect(() => {
    if (!generated || !mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(300, 300);
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    const material = new THREE.MeshStandardMaterial({ color: 0x8888aa });

    const group = new THREE.Group();

    const seat = new THREE.Mesh(new THREE.BoxGeometry(width, 0.5, depth), material);
    group.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.3), material);
    back.position.set(0, height / 2 + 0.25, -depth / 2 + 0.15);
    group.add(back);

    const armLeft = new THREE.Mesh(new THREE.BoxGeometry(armThickness, height, depth), material);
    armLeft.position.set(-width / 2 - armThickness / 2, height / 2, 0);

    const armRight = armLeft.clone();
    armRight.position.x = width / 2 + armThickness / 2;

    group.add(armLeft);
    group.add(armRight);

    scene.add(group);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    camera.position.z = 6;

    const animate = () => {
      requestAnimationFrame(animate);
      group.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current.innerHTML = "";
    };
  }, [generated, width, depth, height, armThickness]);

  if (selected) {
    return (
      <div className="p-4">
        <Button onClick={() => { setSelected(null); setGenerated(null); }}>← Back</Button>

        <motion.img src={selected.img} className="w-full h-64 object-cover rounded-2xl mt-4" />

        <h1 className="text-2xl font-bold mt-4">{selected.name}</h1>

        <Button className="mt-4" onClick={generateDesign}>Generate Full Design</Button>

        <div className="mt-6">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe changes..."
            className="w-full border p-2 rounded-xl"
          />
        </div>

        {generated && (
          <div className="mt-4">
            <Button onClick={exportSTL}>Export STL (3D File)</Button>
          </div>
        )}

        {generated && (
          <div className="mt-6">
            <div ref={mountRef} className="border rounded-2xl w-[300px] h-[300px]" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      {sampleFurniture.map((item) => (
        <motion.div key={item.id} whileHover={{ scale: 1.05 }}>
          <Card onClick={() => setSelected(item)} className="cursor-pointer">
            <CardContent className="p-2">
              <img src={item.img} className="w-full h-32 object-cover rounded-xl" />
              <p className="mt-2 font-medium">{item.name}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
