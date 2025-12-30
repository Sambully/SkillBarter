import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Stars, Float, Text3D, Center } from "@react-three/drei";
import { Suspense } from "react";

const FloatingTitle = () => {
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Center>
                {/* 
                 For simplicity without loading fonts, we will use standard HTML overlay or 
                 try to use basic geometry. Text3D requires a font file path which we don't have easily locally.
                 So we will stick to HTML overlay for text and use 3D for background elements.
                */}
                <mesh>
                    <torusKnotGeometry args={[10, 3, 100, 16]} />
                    <meshStandardMaterial color="#6366f1" wireframe />
                </mesh>
            </Center>
        </Float>
    );
};

export default function LandingPage() {
    return (
        <div className="relative w-full h-screen bg-black text-white overflow-hidden">
            {/* 3D Background */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 30] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Suspense fallback={null}>
                        <FloatingTitle />
                    </Suspense>
                </Canvas>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none">
                <div className="text-center pointer-events-auto max-w-4xl px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
                            SkillBarter
                        </h1>
                        <p className="text-2xl text-gray-300 mb-8 font-light tracking-wide">
                            The Hyper-Local Knowledge Exchange. <br />
                            Teach what you know. Learn what you need.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="flex gap-6 justify-center"
                    >
                        <Link
                            to="/signup"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold px-8 py-4 rounded-full transition shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_40px_rgba(37,99,235,0.7)]"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/signin"
                            className="bg-transparent border border-white/20 hover:bg-white/10 text-white text-lg font-bold px-8 py-4 rounded-full transition backdrop-blur-sm"
                        >
                            Sign In
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    className="absolute bottom-10 left-0 w-full text-center text-gray-500 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    Powered by Google Gemini & React Three Fiber
                </motion.div>
            </div>
        </div>
    );
}
