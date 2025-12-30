import React, { useEffect, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { fetchGraph } from "../api";
import { useNavigate } from "react-router-dom";

export default function KnowledgeGraph() {
    const [data, setData] = useState({ nodes: [], links: [] });
    const navigate = useNavigate();

    useEffect(() => {
        fetchGraph().then(res => setData(res.data)).catch(console.error);
    }, []);

    return (
        <div className="w-full h-screen bg-black relative">
            <button
                onClick={() => navigate("/")}
                className="absolute top-4 left-4 z-50 bg-gray-800 text-white px-4 py-2 rounded"
            >
                Back to Dashboard
            </button>
            <ForceGraph3D
                graphData={data}
                nodeAutoColorBy="group"
                nodeLabel="name"
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={d => d.value * 0.001}
                backgroundColor="#000000"
                onNodeClick={node => {
                    // Navigate to dashboard with search query for this user to trigger chat
                    // Or ideally open chat directly. For now, let's search for them.
                    navigate(`/dashboard?search=${node.name}`);
                }}
            />
        </div>
    );
}
