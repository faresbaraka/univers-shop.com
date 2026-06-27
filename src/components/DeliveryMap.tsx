import React, { useEffect, useState, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { Truck, MapPin, Navigation, Compass, ShieldCheck, Layers, Map as MapIcon, RefreshCw, Info, HelpCircle } from 'lucide-react';
import { getRouteFromBainsRomains } from './Checkout';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Real coordinates for Google Maps
const ALGIERS_TO_BAINS_ROMAINS_PATH = [
  { lat: 36.7762, lng: 3.0586 }, // Place des Martyrs / Algiers Port
  { lat: 36.7812, lng: 3.0545 }, // Bab El Oued Coast
  { lat: 36.7845, lng: 3.0506 }, // Bab El Oued
  { lat: 36.7905, lng: 3.0450 }, // Bologhine Entrance
  { lat: 36.7997, lng: 3.0412 }, // Bologhine / Notre Dame area
  { lat: 36.8055, lng: 3.0320 }, // Bologhine Coast
  { lat: 36.8122, lng: 3.0195 }, // Raïs Hamidou Entrance
  { lat: 36.8142, lng: 3.0115 }, // Raïs Hamidou Center
  { lat: 36.8130, lng: 2.9920 }, // Miramar / Baïnem
  { lat: 36.8125, lng: 2.9691 }, // Hammamet
  { lat: 36.8095, lng: 2.9550 }, // Bains Romains Entrance
  { lat: 36.8078, lng: 2.9461 }  // Bains Romains Center (Destination)
];

// Coordinate path for beautiful vector fallback map (SVG coordinates)
const SVG_COASTAL_PATH = [
  { x: 700, y: 280, name: "Alger Centre / Port", desc: "Départ Entrepôt" },
  { x: 620, y: 230, name: "Bab El Oued", desc: "Front de Mer" },
  { x: 530, y: 170, name: "Bologhine", desc: "Notre Dame d'Afrique" },
  { x: 430, y: 130, name: "Raïs Hamidou", desc: "La Vigie" },
  { x: 320, y: 120, name: "Miramar", desc: "Forêt de Baïnem" },
  { x: 210, y: 140, name: "Hammamet", desc: "Plage & Corniche" },
  { x: 100, y: 190, name: "Bains Romains", desc: "Votre Adresse 🏠" }
];

const WILAYA_COORDINATES: Record<number, google.maps.LatLngLiteral> = {
  1: { lat: 27.8724, lng: -0.2830 },   // Adrar
  2: { lat: 36.1647, lng: 1.3317 },    // Chlef
  3: { lat: 33.8000, lng: 2.8667 },    // Laghouat
  4: { lat: 35.8754, lng: 7.1135 },    // Oum El Bouaghi
  5: { lat: 35.5560, lng: 6.1740 },    // Batna
  6: { lat: 36.7511, lng: 5.0642 },    // Béjaïa
  7: { lat: 34.8500, lng: 5.7333 },    // Biskra
  8: { lat: 31.6167, lng: -2.2167 },   // Béchar
  9: { lat: 36.4700, lng: 2.8300 },    // Blida
  10: { lat: 36.3749, lng: 3.9020 },   // Bouira
  11: { lat: 22.7850, lng: 5.5228 },   // Tamanrasset
  12: { lat: 35.4042, lng: 8.1242 },   // Tébessa
  13: { lat: 34.8783, lng: -1.3150 },  // Tlemcen
  14: { lat: 35.3710, lng: 1.3170 },   // Tiaret
  15: { lat: 36.7118, lng: 4.0459 },   // Tizi Ouzou
  16: { lat: 36.7525, lng: 3.0420 },   // Alger
  17: { lat: 34.6724, lng: 3.2630 },   // Djelfa
  18: { lat: 36.8206, lng: 5.7667 },   // Jijel
  19: { lat: 36.1900, lng: 5.4133 },   // Sétif
  20: { lat: 34.8303, lng: 0.1511 },   // Saïda
  21: { lat: 36.8773, lng: 6.9069 },   // Skikda
  22: { lat: 35.1899, lng: -0.6300 },  // Sidi Bel Abbès
  23: { lat: 36.9000, lng: 7.7667 },   // Annaba
  24: { lat: 36.4621, lng: 7.4261 },   // Guelma
  25: { lat: 36.3650, lng: 6.6147 },   // Constantine
  26: { lat: 36.2642, lng: 2.7539 },   // Médéa
  27: { lat: 35.9333, lng: 0.0833 },   // Mostaganem
  28: { lat: 35.7058, lng: 4.5419 },   // M'Sila
  29: { lat: 35.4000, lng: 0.1333 },   // Mascara
  30: { lat: 31.9493, lng: 5.3250 },   // Ouargla
  31: { lat: 35.6971, lng: -0.6308 },  // Oran
  32: { lat: 33.6831, lng: 1.0192 },   // El Bayadh
  33: { lat: 26.4833, lng: 8.4667 },   // Illizi
  34: { lat: 36.0667, lng: 4.7667 },   // Bordj Bou Arréridj
  35: { lat: 36.7591, lng: 3.4731 },   // Boumerdès
  36: { lat: 36.7667, lng: 8.3167 },   // El Tarf
  37: { lat: 27.6711, lng: -8.1472 },  // Tindouf
  38: { lat: 35.6000, lng: 1.8167 },   // Tissemsilt
  39: { lat: 33.3667, lng: 6.8500 },   // El Oued
  40: { lat: 35.4158, lng: 7.1433 },   // Khenchela
  41: { lat: 36.2811, lng: 7.9511 },   // Souk Ahras
  42: { lat: 36.5924, lng: 2.4473 },   // Tipaza
  43: { lat: 36.4501, lng: 6.2644 },   // Mila
  44: { lat: 36.2644, lng: 2.2203 },   // Aïn Defla
  45: { lat: 32.7500, lng: -0.3167 },  // Naâma
  46: { lat: 35.3000, lng: -1.1333 },  // Aïn Témouchent
  47: { lat: 32.4909, lng: 3.6735 },   // Ghardaïa
  48: { lat: 35.7333, lng: 0.5500 },   // Relizane
  49: { lat: 33.9500, lng: 5.9167 },   // El M'Ghair
  50: { lat: 30.5833, lng: 2.8833 },   // El Meniaa
  51: { lat: 34.3333, lng: 5.0667 },   // Ouled Djellal
  52: { lat: 21.3333, lng: 0.9500 },   // Bordj Baji Mokhtar
  53: { lat: 30.1333, lng: -2.1667 },  // Béni Abbès
  54: { lat: 29.2500, lng: 0.2500 },   // Timimoun
  55: { lat: 33.1000, lng: 6.0667 },   // Touggourt
  56: { lat: 24.5500, lng: 9.4833 },   // Djanet
  57: { lat: 27.1936, lng: 2.4815 },   // In Salah
  58: { lat: 20.1947, lng: 5.0333 }    // In Guezzam
};

// Helper Component to render the Polyline
function PathPolyline({ path }: { path: google.maps.LatLngLiteral[] }) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#0052FF',
      strokeOpacity: 0.8,
      strokeWeight: 5,
    });

    polyline.setMap(map);
    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
    };
  }, [map, path]);

  return null;
}

interface DeliveryMapProps {
  orderStatus: 'received' | 'processing' | 'shipped' | 'delivered' | 'returned';
  orderId: string;
  googleMapsApiKey?: string;
  customerWilaya?: string;
  customerAddress?: string;
}

export default function DeliveryMap({ orderStatus, orderId, googleMapsApiKey, customerWilaya, customerAddress }: DeliveryMapProps) {
  const finalApiKey = googleMapsApiKey || API_KEY;
  const hasValidApiKey = Boolean(finalApiKey) && finalApiKey !== 'YOUR_API_KEY' && finalApiKey.trim().length > 5;

  // Extract wilaya code dynamically
  const match = customerWilaya ? customerWilaya.match(/^(\d+)/) : null;
  const wilayaCode = match ? parseInt(match[1], 10) : 16; // default Alger

  // Extract commune/city from customerAddress if available (stored as "Commune - Street")
  const addressParts = customerAddress ? customerAddress.split(' - ') : [];
  const buyerCommune = addressParts.length > 0 ? addressParts[0].trim() : '';
  const finalDestinationName = buyerCommune || customerWilaya || 'Acheteur';

  const route = getRouteFromBainsRomains(wilayaCode, buyerCommune);
  const totalDistance = route.distanceKm;

  // Parse numeric duration from string (e.g. "50 minutes" or "2 heures 30 mins")
  const durationMatch = route.durationText.match(/^(\d+)\s+min/);
  const totalMinutes = durationMatch 
    ? parseInt(durationMatch[1], 10) 
    : route.durationText.includes("heure") 
      ? route.durationText.includes("2 heures") ? 150 : 60 
      : 30;

  // SELLER position (Bains Romains)
  const SELLER_COORDINATES = { lat: 36.8078, lng: 2.9461 };
  const buyerCoords = WILAYA_COORDINATES[wilayaCode] || SELLER_COORDINATES;

  // Generate dynamic Google Maps path
  const dynamicGooglePath = React.useMemo(() => {
    if (wilayaCode === 16) {
      return ALGIERS_TO_BAINS_ROMAINS_PATH;
    }
    // Generate curved inter-city route
    const path: google.maps.LatLngLiteral[] = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = SELLER_COORDINATES.lat + (buyerCoords.lat - SELLER_COORDINATES.lat) * t + Math.sin(t * Math.PI) * 0.05 * (buyerCoords.lng - SELLER_COORDINATES.lng);
      const lng = SELLER_COORDINATES.lng + (buyerCoords.lng - SELLER_COORDINATES.lng) * t;
      path.push({ lat, lng });
    }
    return path;
  }, [wilayaCode, buyerCoords]);

  // Parse route path parts for checkpoints
  const routeParts = route.routePath.split('→').map(s => s.trim());
  const dynamicCoastalPoints = React.useMemo(() => {
    return SVG_COASTAL_PATH.map((point, index) => {
      const isStart = index === 0;
      const isEnd = index === SVG_COASTAL_PATH.length - 1;
      let name = point.name;
      let desc = point.desc;
      if (isStart) {
        name = "Bains Romains";
        desc = "Vendeur (Départ)";
      } else if (isEnd) {
        name = finalDestinationName;
        desc = "Destination (Arrivée) 🏠";
      } else {
        const intermediateParts = routeParts.slice(1, -1);
        if (intermediateParts.length > 0) {
          const partIdx = Math.floor(((index - 1) / (SVG_COASTAL_PATH.length - 2)) * intermediateParts.length);
          name = intermediateParts[partIdx] || "Transit National";
          desc = "En déplacement...";
        } else {
          name = "Route Nationale";
          desc = "Acheminement...";
        }
      }
      return { ...point, name, desc };
    });
  }, [finalDestinationName, routeParts]);

  const [truckPos, setTruckPos] = useState<google.maps.LatLngLiteral>(dynamicGooglePath[0]);
  const [pathProgress, setPathProgress] = useState(0); // 0 to 100%
  const [estimatedMinutes, setEstimatedMinutes] = useState(totalMinutes);
  const [distanceKm, setDistanceKm] = useState(totalDistance);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  // For simulation loops
  const [simulatedStep, setSimulatedStep] = useState(0);

  // Reset or synchronize state when dynamic path or route changes
  useEffect(() => {
    if (orderStatus === 'received' || orderStatus === 'processing') {
      setTruckPos(dynamicGooglePath[0]);
      setPathProgress(0);
      setEstimatedMinutes(totalMinutes);
      setDistanceKm(totalDistance);
      setSimulatedStep(0);
    } else if (orderStatus === 'delivered' || orderStatus === 'returned') {
      setTruckPos(dynamicGooglePath[dynamicGooglePath.length - 1]);
      setPathProgress(100);
      setEstimatedMinutes(0);
      setDistanceKm(0);
      setSimulatedStep(dynamicCoastalPoints.length - 1);
    }
  }, [dynamicGooglePath, dynamicCoastalPoints, orderStatus, totalDistance, totalMinutes]);

  // Simulate real-time movement if the order is shipped
  useEffect(() => {
    if (orderStatus !== 'shipped') return;

    let intervalId: NodeJS.Timeout;
    let step = 0;

    const runSimulation = () => {
      const totalSteps = dynamicGooglePath.length;
      intervalId = setInterval(() => {
        step = (step + 1) % totalSteps;
        setSimulatedStep(step);
        
        const currentPos = dynamicGooglePath[step];
        setTruckPos(currentPos);
        
        const progress = Math.round((step / (totalSteps - 1)) * 100);
        setPathProgress(progress);

        const remainingDist = parseFloat((totalDistance * (1 - step / (totalSteps - 1))).toFixed(1));
        setDistanceKm(remainingDist);
        setEstimatedMinutes(Math.round(totalMinutes * (1 - step / (totalSteps - 1))));
      }, 3500);
    };

    runSimulation();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderStatus, dynamicGooglePath, totalDistance, totalMinutes]);

  // Calculate current SVG truck coordinates based on pathProgress
  const getSvgTruckCoords = () => {
    if (orderStatus === 'received' || orderStatus === 'processing') {
      return dynamicCoastalPoints[0];
    }
    if (orderStatus === 'delivered' || orderStatus === 'returned') {
      return dynamicCoastalPoints[dynamicCoastalPoints.length - 1];
    }
    // Interpolate points
    const indexFloat = (pathProgress / 100) * (dynamicCoastalPoints.length - 1);
    const indexLower = Math.floor(indexFloat);
    const indexUpper = Math.min(indexLower + 1, dynamicCoastalPoints.length - 1);
    const t = indexFloat - indexLower;
    
    const p1 = dynamicCoastalPoints[indexLower];
    const p2 = dynamicCoastalPoints[indexUpper];
    
    return {
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
      name: p1.name
    };
  };

  const svgTruck = getSvgTruckCoords();

  // Draw the SVG Coastline route
  const getSvgPathString = () => {
    return dynamicCoastalPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  // Generate HTML for fallback interactive SVG Map
  const renderFallbackMap = () => {
    return (
      <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-lg bg-slate-950 text-white relative font-sans animate-fade-in">
        {/* HUD Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>RADAR GPS INTERACTIF (ALGER OUEST)</span>
                <span className="text-[9px] text-sky-400 bg-sky-950 px-2 py-0.5 rounded font-bold font-mono">ID: {orderId}</span>
              </p>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                <span>Conseiller Transport : Sofiane</span>
                <span className="text-xs text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded font-black font-sans">
                  {orderStatus === 'shipped' ? '🚚 En Route' : orderStatus === 'delivered' ? '✅ Livré' : '⏳ Préparation'}
                </span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right border-r border-slate-800 pr-4">
              <span className="text-[9px] text-slate-400 block uppercase font-sans">Trajet RN11</span>
              <span className="text-white font-black">{distanceKm} km restant</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-400 block uppercase font-sans">Estimation</span>
              <span className="text-amber-400 font-black">{estimatedMinutes > 0 ? `${estimatedMinutes} min` : 'Arrivé'}</span>
            </div>
          </div>
        </div>

        {/* SVG Live Map */}
        <div className="relative w-full overflow-hidden bg-slate-950" style={{ height: '330px' }}>
          {/* Mediterranean Sea Water styling top part */}
          <div className="absolute top-0 left-0 w-full h-[130px] bg-sky-950/20 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 opacity-10 animate-pulse bg-gradient-to-b from-sky-400/20 to-transparent"></div>
            {/* Waves lines */}
            <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0 50 Q 150 40 300 50 T 600 50 T 900 50" fill="none" stroke="white" strokeWidth="2" className="animate-pulse" />
              <path d="M 0 90 Q 200 80 400 90 T 800 90" fill="none" stroke="white" strokeWidth="1.5" />
            </svg>
            <span className="absolute top-4 right-10 text-[10px] font-bold text-sky-400/30 uppercase tracking-widest font-mono select-none">
              MER MÉDITERRANÉE
            </span>
          </div>

          {/* SVG Canvas Map */}
          <svg 
            viewBox="0 0 800 330" 
            className="w-full h-full select-none" 
            style={{ minWidth: '600px' }}
          >
            {/* Grid Helper Lines */}
            <g opacity="0.04" stroke="currentColor">
              <line x1="0" y1="50" x2="800" y2="50" strokeWidth="1" />
              <line x1="0" y1="100" x2="800" y2="100" strokeWidth="1" />
              <line x1="0" y1="150" x2="800" y2="150" strokeWidth="1" />
              <line x1="0" y1="200" x2="800" y2="200" strokeWidth="1" />
              <line x1="0" y1="250" x2="800" y2="250" strokeWidth="1" />
              <line x1="100" y1="0" x2="100" y2="330" strokeWidth="1" />
              <line x1="200" y1="0" x2="200" y2="330" strokeWidth="1" />
              <line x1="300" y1="0" x2="300" y2="330" strokeWidth="1" />
              <line x1="400" y1="0" x2="400" y2="330" strokeWidth="1" />
              <line x1="500" y1="0" x2="500" y2="330" strokeWidth="1" />
              <line x1="600" y1="0" x2="600" y2="330" strokeWidth="1" />
              <line x1="700" y1="0" x2="700" y2="330" strokeWidth="1" />
            </g>

            {/* Mainland shadow below the path */}
            <path 
              d={`M 100 190 ${dynamicCoastalPoints.map(p => `L ${p.x} ${p.y}`).join(' ')} L 700 330 L 100 330 Z`} 
              fill="#0b1329" 
              opacity="0.6"
            />

            {/* Highlighted Coastal Route Glow */}
            <path 
              d={getSvgPathString()} 
              fill="none" 
              stroke="#0052FF" 
              strokeWidth="8" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              opacity="0.15" 
            />
            
            {/* Main Road line */}
            <path 
              d={getSvgPathString()} 
              fill="none" 
              stroke="#0052FF" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeDasharray="2,5"
              className="animate-[dash_10s_linear_infinite]"
            />

            {/* Landmark Nodes */}
            {dynamicCoastalPoints.map((point, index) => {
              const isStart = index === 0;
              const isEnd = index === dynamicCoastalPoints.length - 1;
              let color = "#38bdf8"; // standard coastal node
              if (isStart) color = "#6366f1"; // warehouse
              if (isEnd) color = "#10b981"; // customer home

              return (
                <g key={index} className="cursor-help group">
                  {/* Outer pulse for start, end or active point */}
                  {(isStart || isEnd) && (
                    <circle 
                      cx={point.x} 
                      cy={point.y} 
                      r="10" 
                      fill={color} 
                      opacity="0.3" 
                      className="animate-ping" 
                      style={{ animationDuration: isEnd ? '2s' : '3s' }}
                    />
                  )}

                  <circle 
                    cx={point.x} 
                    cy={point.y} 
                    r={isStart || isEnd ? "6" : "4"} 
                    fill={color} 
                    stroke="#020617" 
                    strokeWidth="2" 
                  />

                  {/* Text labels for landmarks */}
                  <text 
                    x={point.x} 
                    y={point.y + 22} 
                    textAnchor="middle" 
                    fill={isEnd ? "#10b981" : isStart ? "#c084fc" : "#94a3b8"} 
                    fontSize="9" 
                    fontWeight={isStart || isEnd ? "bold" : "normal"}
                    className="pointer-events-none select-none font-mono"
                  >
                    {point.name}
                  </text>
                </g>
              );
            })}

            {/* Animated Delivery Truck 🚚 Overlay */}
            {orderStatus === 'shipped' && (
              <g transform={`translate(${svgTruck.x - 14}, ${svgTruck.y - 14})`} className="animate-bounce">
                {/* Truck Pulse effect */}
                <circle cx="14" cy="14" r="16" fill="#f59e0b" opacity="0.2" className="animate-ping" style={{ animationDuration: '1.5s' }} />
                
                {/* Glowing Circle background */}
                <rect x="0" y="0" width="28" height="28" rx="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" className="shadow-lg" />
                
                {/* Delivery Truck icon replacement inside SVG */}
                <g transform="translate(6, 6) scale(0.65)" fill="white">
                  <path d="M19 10h-2V7h-7v3H4c-1.1 0-2 .9-2 2v5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM7 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </g>
              </g>
            )}

            {/* Delivered state at Bains Romains indicator */}
            {(orderStatus === 'delivered' || orderStatus === 'returned') && (
              <g transform={`translate(${dynamicCoastalPoints[dynamicCoastalPoints.length-1].x - 14}, ${dynamicCoastalPoints[dynamicCoastalPoints.length-1].y - 14})`}>
                <circle cx="14" cy="14" r="18" fill="#10b981" opacity="0.2" className="animate-ping" />
                <rect x="0" y="0" width="28" height="28" rx="8" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                <text x="14" y="19" textAnchor="middle" fontSize="12">🏠</text>
              </g>
            )}

            {/* Warehouse State indicator */}
            {(orderStatus === 'received' || orderStatus === 'processing') && (
              <g transform={`translate(${dynamicCoastalPoints[0].x - 14}, ${dynamicCoastalPoints[0].y - 14})`}>
                <rect x="0" y="0" width="28" height="28" rx="8" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                <text x="14" y="19" textAnchor="middle" fontSize="12">📦</text>
              </g>
            )}
          </svg>

          {/* Map Controls & Status Overlays */}
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sky-950 text-sky-400 rounded-lg flex items-center justify-center">
                <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-slate-200">Suivi : Bains Romains → {finalDestinationName}</p>
                <p className="text-[10px] text-slate-400">
                  {orderStatus === 'shipped' 
                    ? `Transit : ${route.routePath}` 
                    : orderStatus === 'delivered' 
                    ? `Arrivé à destination (${finalDestinationName})` 
                    : 'Préparation du paquet chez le vendeur (Bains Romains)'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-sky-950 text-sky-400 px-2 py-1 rounded">
                {pathProgress}% livré
              </span>
              <button 
                onClick={() => setShowConfigHelp(!showConfigHelp)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition text-slate-300"
                title="Comment configurer Google Maps ?"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic configuration helper panel */}
        {showConfigHelp && (
          <div className="bg-slate-900 border-t border-slate-800 p-5 space-y-3 animate-fade-in text-xs leading-relaxed text-slate-300">
            <div className="flex items-start gap-2 text-amber-400 font-bold">
              <Info className="w-4 h-4 mt-0.5" />
              <span>Comment activer la vraie carte satellite Google Maps ?</span>
            </div>
            <p>
              Ce radar interactif simule le trajet en temps réel. Pour basculer sur la carte Google Maps interactive, ajoutez votre clé dans les secrets de l'application :
            </p>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2 font-mono text-[11px] text-slate-400">
              <p className="text-white font-bold font-sans">Étapes simples :</p>
              <p>1. Cliquez sur l'icône de <strong className="text-white">rouage (Settings ⚙️)</strong> située tout en haut à droite de cet écran.</p>
              <p>2. Dans le panneau latéral qui s'ouvre, cliquez sur l'onglet <strong className="text-white">"Secrets"</strong>.</p>
              <p>3. Cliquez sur "Add Secret" ou modifiez un secret existant.</p>
              <p>4. Nommez-le exactement : <strong className="text-sky-400">GOOGLE_MAPS_PLATFORM_KEY</strong></p>
              <p>5. Collez votre clé API Google Maps et enregistrez.</p>
            </div>
            <div className="text-right">
              <button 
                onClick={() => setShowConfigHelp(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg"
              >
                Masquer l'aide
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!hasValidApiKey) {
    return renderFallbackMap();
  }

  // Google Maps implementation
  return (
    <div className="border border-slate-150 rounded-3xl overflow-hidden shadow-md bg-white relative">
      {/* Live HUD Header */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 relative z-20">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
              <span>SUIVI GOOGLE MAPS LIVE</span>
              <span className="text-[10px] text-sky-400 bg-sky-950 px-2 py-0.5 rounded font-bold">Commande : {orderId}</span>
            </p>
            <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
              {orderStatus === 'shipped' 
                ? '🚚 Le livreur est en déplacement sur la route côtière d\'Alger' 
                : orderStatus === 'delivered' 
                ? '✅ Commande livrée à Bains Romains' 
                : '📦 En attente de départ d\'Alger Centre'}
            </p>
          </div>
        </div>

        {/* Mini stats HUD */}
        <div className="flex items-center gap-4 text-xs font-mono font-medium">
          <div className="text-right border-r border-slate-800 pr-4">
            <span className="text-[10px] text-slate-400 block uppercase font-sans">Distance</span>
            <span className="text-white font-black">{distanceKm} km</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-sans">Temps estimé</span>
            <span className="text-white font-black">{estimatedMinutes > 0 ? `${estimatedMinutes} min` : 'Arrivé'}</span>
          </div>
        </div>
      </div>

      {/* Map View Frame */}
      <div className="w-full relative" style={{ height: '320px' }}>
        <APIProvider apiKey={finalApiKey} version="weekly">
          <Map
            defaultCenter={{ lat: (SELLER_COORDINATES.lat + buyerCoords.lat) / 2, lng: (SELLER_COORDINATES.lng + buyerCoords.lng) / 2 }}
            defaultZoom={wilayaCode === 16 ? 12 : 8}
            mapId="DEMO_MAP_ID"
            gestureHandling="cooperative"
            disableDefaultUI={true}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Draw the coastal route */}
            <PathPolyline path={dynamicGooglePath} />

            {/* Seller/Warehouse Location Marker */}
            <AdvancedMarker position={dynamicGooglePath[0]} title="Bains Romains (Vendeur)">
              <Pin background="#0052FF" glyphColor="#ffffff" scale={1.1}>
                <div className="text-[10px] font-black text-white">DZ</div>
              </Pin>
            </AdvancedMarker>

            {/* Customer Destination Marker */}
            <AdvancedMarker position={dynamicGooglePath[dynamicGooglePath.length - 1]} title={`Destination - ${finalDestinationName}`}>
              <Pin background="#10B981" glyphColor="#ffffff" scale={1.1}>
                <div className="text-xs">🏠</div>
              </Pin>
            </AdvancedMarker>

            {/* Live Moving Delivery Truck Marker */}
            {orderStatus === 'shipped' && (
              <AdvancedMarker position={truckPos} title="Votre livreur Univers Shop">
                <div className="bg-amber-500 text-white p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center animate-bounce cursor-pointer w-9 h-9">
                  <Truck className="w-4 h-4 text-white" />
                </div>
              </AdvancedMarker>
            )}
          </Map>
        </APIProvider>

        {/* Floating details overlay on Map */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between gap-3 z-10 font-sans">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#0052FF] animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">Sofiane (Livreur Univers Shop)</p>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                <span>📍 Actuellement à :</span>
                <span className="font-bold text-slate-700">
                  {pathProgress === 0 
                    ? 'Bains Romains' 
                    : pathProgress === 100 
                    ? finalDestinationName 
                    : `En route (${pathProgress}% du trajet)`}
                </span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-50 text-[#0052FF] rounded-md font-mono">
              {pathProgress}% livré
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
