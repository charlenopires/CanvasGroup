import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// -- Types --
type NodeType = 'superior' | 'medio-a' | 'medio-b';

interface NodeData {
  id: string;
  type: NodeType;
  title: string;
  subtitle?: string; 
  status?: string;
  members: string[];
  leaderName?: string;
  avatar?: string;
}

interface EdgeData {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
}

const CanvasScreen: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // -- State --
  const [nodes, setNodes] = useState<NodeData[]>([
    {
      id: 'sup-1',
      type: 'superior',
      title: 'Group Alpha',
      status: 'Active',
      leaderName: 'John Doe',
      members: ['Sarah Connor', 'Kyle Reese', 'T-800'],
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjsrj2AYrmvULgtvtNwR-t7-g2JqUvhmeoBgtYBej6Z-pFC2EwvgMeTy3XNHj5oN_mK1WkpfSFqPwSkAxWDd1UK75LBs93xeMETxt8OsJyZ1QCvVlr46iiPOpw1WoFO7cRRJmtbUeaR6kyGa6FbU2XU51-Xdrjybx-LrB5XTJrncGnn9T5fcO3iofu-mXje_KHT-S3jdWmiGLe28sgc6haqowNigl57ORXTHmkb5kSqk77Zb0pDttrmyfuuKzSUy0Mj-_wTB0BdsUz'
    },
    {
      id: 'sup-2',
      type: 'superior',
      title: 'Group Beta',
      status: 'Pending',
      leaderName: 'Jane Smith',
      members: ['Ellen Ripley', 'Dallas Arthur'],
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXFvq4o1eV-sUoDdMnpyh0jmwARsEVLJqlv1mU-doXDOXZO2IdqRRDfr2qYBX1T4--wuGUJyXyL4U3c_jDdkNtUF5NJG1ebF_IKzqiboO-fCAhWkpw76Ph0ebmahn5s1weX2D8snWrvvGMLk3c4UjDC4N9BdjvjKoidivh9E7gs14vJOEyMslj0WHqSiuqusrESuXFmnM52C6fuOJ3TfvDvVeSNT0Q_W1PR8asUwfWAyRybKlesSqvFQX4doKMTP5hOsygaqHfavFf'
    },
    {
      id: 'med-a-1',
      type: 'medio-a',
      title: 'Team Rocket',
      subtitle: 'Project ID: #HS-A01',
      members: ['Jessie', 'James', 'Meowth']
    },
    {
      id: 'med-a-2',
      type: 'medio-a',
      title: 'Team Aqua',
      subtitle: 'Project ID: #HS-A02',
      members: ['Archie', 'Shelly', 'Matt']
    },
    {
      id: 'med-b-1',
      type: 'medio-b',
      title: 'Team Magma',
      subtitle: 'Project ID: #HS-B01',
      members: ['Maxie', 'Tabitha', 'Courtney']
    }
  ]);

  // Initial edges set to empty to remove "loose arrows"
  const [edges, setEdges] = useState<EdgeData[]>([]);

  // Dynamic Line Coordinates
  const [lineCoords, setLineCoords] = useState<Record<string, { x1: number, y1: number, x2: number, y2: number }>>({});
  
  // Linking State
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{source: string, target: string} | null>(null);
  const [appNameInput, setAppNameInput] = useState('');

  // -- Effects --
  
  // Calculate line positions based on DOM elements
  const updateLines = () => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newCoords: Record<string, any> = {};

    edges.forEach(edge => {
      const sourceEl = document.getElementById(edge.sourceId);
      const targetEl = document.getElementById(edge.targetId);

      if (sourceEl && targetEl) {
        const srcRect = sourceEl.getBoundingClientRect();
        const tgtRect = targetEl.getBoundingClientRect();
        
        const isMobile = window.innerWidth < 1024; // lg breakpoint

        let x1, y1, x2, y2;

        if (isMobile) {
            // Mobile: Source Bottom -> Target Top
            x1 = srcRect.left + srcRect.width / 2 - canvasRect.left;
            y1 = srcRect.bottom - canvasRect.top;
            x2 = tgtRect.left + tgtRect.width / 2 - canvasRect.left;
            y2 = tgtRect.top - canvasRect.top;
        } else {
            // Desktop: 
            // Source (Student/Right Side) connects from its LEFT edge
            // Target (Superior/Left Side) connects to its RIGHT edge
            
            x1 = srcRect.left - canvasRect.left; 
            y1 = srcRect.top + srcRect.height / 2 - canvasRect.top;
            
            x2 = tgtRect.right - canvasRect.left; 
            y2 = tgtRect.top + tgtRect.height / 2 - canvasRect.top;
        }

        newCoords[edge.id] = { x1, y1, x2, y2 };
      }
    });
    setLineCoords(newCoords);
  };

  useLayoutEffect(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [edges, nodes]); 

  // Mouse tracking for ghost line
  const handleMouseMove = (e: React.MouseEvent) => {
    if (connectingNodeId && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left + canvasRef.current.scrollLeft,
            y: e.clientY - rect.top + canvasRef.current.scrollTop
        });
    }
  };

  // -- Handlers --

  const startConnection = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingNodeId(nodeId);
    if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
             x: e.clientX - rect.left,
             y: e.clientY - rect.top
        });
    }
  };

  const handleNodeClick = (targetId: string, type: NodeType) => {
    if (!connectingNodeId) return;
    
    // Only allow Medio -> Superior
    if (type !== 'superior') {
        return;
    }

    setPendingConnection({ source: connectingNodeId, target: targetId });
    setAppNameInput('');
    setModalOpen(true);
    setConnectingNodeId(null);
  };

  const saveConnection = () => {
    if (pendingConnection && appNameInput.trim()) {
        const newEdge: EdgeData = {
            id: `e-${Date.now()}`,
            sourceId: pendingConnection.source,
            targetId: pendingConnection.target,
            label: appNameInput
        };
        setEdges([...edges, newEdge]);
        setModalOpen(false);
        setPendingConnection(null);
    }
  };

  const cancelConnection = () => {
    setConnectingNodeId(null);
  };

  // -- Helpers --
  const getPath = (x1: number, y1: number, x2: number, y2: number) => {
    const isMobile = window.innerWidth < 1024;
    
    if (isMobile) {
        const cpY = (y1 + y2) / 2;
        return `M ${x1} ${y1} C ${x1} ${cpY}, ${x2} ${cpY}, ${x2} ${y2}`;
    } else {
        const cpX = (x1 + x2) / 2;
        return `M ${x1} ${y1} C ${cpX} ${y1}, ${cpX} ${y2}, ${x2} ${y2}`;
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 py-3 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <div className="size-8 text-primary flex items-center justify-center rounded bg-primary/10">
            <span className="material-symbols-outlined text-2xl">schema</span>
          </div>
          <h1 className="text-lg font-bold leading-tight tracking-tight hidden md:block">Prof Charleno Canvas</h1>
          <h1 className="text-lg font-bold leading-tight tracking-tight md:hidden">Canvas</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors focus:outline-none">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden md:block">Prof. Charleno</span>
              <div 
                className="size-9 rounded-full bg-slate-200 bg-cover bg-center border border-slate-200 dark:border-slate-700" 
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBIX3q3PNKCGHAMBd02IEPi-ddMKqCrlB35Brcn4-4CwaNQfSOTFzg0Enys5lPshOS-KqoT5TT2Y8kuzcTsDO2pGnnaCWUsxDSovJp9Rq8OHWT-u-F3CXiJJDFbUFMIJ_h6uGSBSa5gLK3A8mdH2X_EqJiUiubnj8w1CerVww7m7k-LeRxIF7YO6-Uzhgp0LKUZUlr9zbTSKcOjWMtlcQZHz8BsFOcwj8exPQP8RdmgT55wx59azX25McFVq93NmKRn4ymsBDmfYpjF")' }}
              ></div>
              <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-100 dark:border-slate-800 hidden group-focus-within:block hover:block z-50">
              <div className="p-1">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors w-full text-left">
                  <span className="material-symbols-outlined text-lg">logout</span> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex flex-1 relative overflow-hidden">
        {/* Toolbar - Hidden on small mobile */}
        <aside className="hidden sm:flex w-16 flex-col items-center gap-4 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 z-20 shadow-sm shrink-0">
          <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 transition-colors" title="Select">
            <span className="material-symbols-outlined">arrow_selector_tool</span>
          </button>
          <button className="p-2 rounded-lg bg-primary/10 text-primary dark:bg-primary/20" title="Add Node">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          <div className="h-px w-8 bg-slate-200 dark:bg-slate-700 my-2"></div>
          <button className={`p-2 rounded-lg transition-colors ${connectingNodeId ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`} onClick={cancelConnection}>
            <span className="material-symbols-outlined">polyline</span>
          </button>
        </aside>
        
        {/* Canvas Area */}
        <div 
            ref={canvasRef}
            className="flex-1 relative bg-background-light dark:bg-background-dark bg-dot-pattern overflow-auto no-scrollbar p-6 lg:p-12"
            onClick={cancelConnection}
            onMouseMove={handleMouseMove}
        >
          {/* SVG Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" style={{ minWidth: '100%', minHeight: '100%' }}>
            <defs>
              <marker id="arrowhead-primary" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
                <polygon fill="#1997f0" points="0 0, 10 3.5, 0 7"></polygon>
              </marker>
            </defs>
            {/* Draw Edges */}
            {edges.map(edge => {
                const coords = lineCoords[edge.id];
                if (!coords) return null;
                const path = getPath(coords.x1, coords.y1, coords.x2, coords.y2);
                const midX = (coords.x1 + coords.x2) / 2;
                const midY = (coords.y1 + coords.y2) / 2;

                return (
                    <g key={edge.id}>
                        <path d={path} fill="none" stroke="#1997f0" strokeDasharray="5,5" strokeWidth="2" markerEnd="url(#arrowhead-primary)" className="animate-[dash_60s_linear_infinite]" />
                        <rect x={midX - 50} y={midY - 14} width="100" height="28" rx="6" fill="#1997f0" className="dark:fill-blue-900" />
                        <text x={midX} y={midY} dy="5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{edge.label}</text>
                    </g>
                );
            })}
            {/* Ghost Edge */}
            {connectingNodeId && (
                (() => {
                    const sourceEl = document.getElementById(connectingNodeId);
                    if (!sourceEl) return null;
                    const rect = sourceEl.getBoundingClientRect();
                    const canvasRect = canvasRef.current?.getBoundingClientRect();
                    if (!canvasRect) return null;
                    
                    const isMobile = window.innerWidth < 1024;
                    // Source start point depends on mobile/desktop
                    const sx = isMobile ? rect.left + rect.width / 2 - canvasRect.left : rect.left - canvasRect.left;
                    const sy = isMobile ? rect.bottom - canvasRect.top : rect.top + rect.height / 2 - canvasRect.top;
                    
                    return (
                        <path d={`M ${sx} ${sy} L ${mousePos.x} ${mousePos.y}`} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />
                    );
                })()
            )}
          </svg>

          {/* Nodes Container - Responsive Grid/Flex */}
          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12 lg:gap-32 max-w-7xl mx-auto min-h-[80vh]">
            
            {/* Superior Column (Left on Desktop) */}
            <div className="flex-1 flex flex-col gap-[14px]">
                <div className="flex items-center justify-between mb-2 px-2 sticky top-0 bg-background-light dark:bg-background-dark z-10 py-2">
                    <h2 className="text-base font-bold text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">school</span>
                        Ensino Superior
                    </h2>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">Mentors</span>
                </div>
                {nodes.filter(n => n.type === 'superior').map(node => (
                    <div 
                        id={node.id}
                        key={node.id}
                        onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id, node.type); }}
                        className={`group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 transition-all duration-200 ${
                            connectingNodeId ? 'ring-2 ring-emerald-400/50 cursor-pointer hover:ring-emerald-500 hover:scale-[1.01] bg-emerald-50/10 dark:bg-emerald-900/10' : 'hover:shadow-md'
                        }`}
                    >
                         {/* Visual Anchor for Incoming (Right side on desktop) */}
                         <div className={`hidden lg:block absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 transition-colors ${connectingNodeId ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>

                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{node.title}</h3>
                            <span className="text-xs font-semibold bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded">{node.status}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-4 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="size-8 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${node.avatar}")` }}></div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Group Leader</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{node.leaderName}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            {node.members.map((m, i) => (
                                <div key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[14px] text-slate-400">person</span> {m}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Ensino Medio Column (Right on Desktop) */}
            <div className="flex-1 flex flex-col gap-8">
                
                {/* Class A Section */}
                <div className="flex flex-col gap-[14px]">
                    <div className="flex items-center justify-between mb-2 px-2 sticky top-0 bg-background-light dark:bg-background-dark z-10 py-2">
                         <h2 className="text-base font-bold text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-500">book</span>
                            Ensino Médio - 2º Ano A
                        </h2>
                    </div>
                    {nodes.filter(n => n.type === 'medio-a').map(node => (
                        <div 
                            id={node.id}
                            key={node.id}
                            className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 transition-all duration-200 hover:shadow-md border-l-4 border-l-orange-400"
                        >
                            {/* Link Handle (Left side on desktop) */}
                            <button
                                onClick={(e) => startConnection(e, node.id)}
                                className="absolute lg:-left-4 lg:top-1/2 lg:-translate-y-1/2 left-1/2 -bottom-4 -translate-x-1/2 lg:translate-x-0 w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all z-20"
                                title="Link to University"
                            >
                                <span className="material-symbols-outlined text-[18px]">link</span>
                            </button>

                            <div className="mb-2">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{node.title}</h3>
                                <p className="text-xs text-slate-500">{node.subtitle}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {node.members.map((m, i) => (
                                    <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Class B Section */}
                <div className="flex flex-col gap-[14px]">
                     <div className="flex items-center justify-between mb-2 px-2 sticky top-0 bg-background-light dark:bg-background-dark z-10 py-2">
                         <h2 className="text-base font-bold text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-500">science</span>
                            Ensino Médio - 2º Ano B
                        </h2>
                    </div>
                    {nodes.filter(n => n.type === 'medio-b').map(node => (
                        <div 
                            id={node.id}
                            key={node.id}
                            className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 transition-all duration-200 hover:shadow-md border-l-4 border-l-purple-400"
                        >
                            {/* Link Handle (Left side on desktop) */}
                            <button
                                onClick={(e) => startConnection(e, node.id)}
                                className="absolute lg:-left-4 lg:top-1/2 lg:-translate-y-1/2 left-1/2 -bottom-4 -translate-x-1/2 lg:translate-x-0 w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all z-20"
                                title="Link to University"
                            >
                                <span className="material-symbols-outlined text-[18px]">link</span>
                            </button>

                            <div className="mb-2">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{node.title}</h3>
                                <p className="text-xs text-slate-500">{node.subtitle}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {node.members.map((m, i) => (
                                    <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          
          {/* Zoom Controls (Fixed) */}
          <div className="fixed bottom-6 right-6 hidden md:flex items-center bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700 p-1 z-30">
             <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
               <span className="material-symbols-outlined text-xl">remove</span>
             </button>
             <span className="text-sm font-semibold px-2 text-slate-700 dark:text-slate-200 w-12 text-center">100%</span>
             <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
               <span className="material-symbols-outlined text-xl">add</span>
             </button>
           </div>
        </div>

        {/* Modal */}
        {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-sm transform transition-all scale-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Connect Groups</h3>
                  <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 flex gap-3">
                        <span className="material-symbols-outlined text-primary">info</span>
                        <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                            Establishing a partnership between the student group and the university mentor.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Application / Project Name</label>
                        <input 
                            autoFocus
                            className="w-full text-sm rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary p-3 border shadow-sm" 
                            placeholder="e.g. Solar Energy Tracker" 
                            type="text" 
                            value={appNameInput}
                            onChange={(e) => setAppNameInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveConnection()}
                        />
                    </div>
                    <button 
                        onClick={saveConnection}
                        disabled={!appNameInput.trim()}
                        className="w-full bg-primary disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg p-3 hover:bg-blue-600 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-lg">link</span>
                        Create Partnership
                    </button>
                </div>
              </div>
            </div>
          )}

      </main>
    </div>
  );
};

export default CanvasScreen;