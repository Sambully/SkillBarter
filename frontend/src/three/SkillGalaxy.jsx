import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";

export default function SkillGalaxy() {
    return (
        <Canvas style={{ height: 400 }}>
            <ambientLight />
            <Sphere args={[2, 32, 32]}>
                <meshStandardMaterial wireframe color="#7f5af0" />
            </Sphere>
            <OrbitControls />
        </Canvas>
    );
}
