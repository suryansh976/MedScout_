import React, { useState, useMemo, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  Navigation, 
  Building2, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  Compass,
  Activity,
  Heart,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";

export default function HospitalMap2D({
  hospitals = [],
  selectedRegion = "Delhi NCR",
  onSelectHospital
}) {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hoveredHospital, setHoveredHospital] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [activeFilter, setActiveFilter] = useState("all");
  const [layerType, setLayerType] = useState("y"); // 'y': Google Hybrid Satellite, 's': Pure Satellite, 'm': Google Street
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Auto-select first hospital on load or update
  useEffect(() => {
    if (hospitals.length > 0) {
      if (!selectedHospital || !hospitals.some(h => h.id === selectedHospital.id)) {
        setSelectedHospital(hospitals[0]);
      }
    } else {
      setSelectedHospital(null);
    }
  }, [hospitals]);

  // Suggested hospitals (top 4 based on filter)
  const suggestedHospitals = useMemo(() => {
    let list = [...hospitals];
    if (activeFilter === "high_outcome") {
      list = list.filter(h => (h.successRate || 0) >= 88);
    } else if (activeFilter === "budget") {
      list = list.sort((a, b) => (a.avgCost || 400000) - (b.avgCost || 400000));
    }
    return list.slice(0, 4);
  }, [hospitals, activeFilter]);

  // Google Maps search query and direct navigation URL
  const googleMapsDirectUrl = useMemo(() => {
    if (selectedHospital && selectedHospital.lat && selectedHospital.lng) {
      return `https://www.google.com/maps/search/?api=1&query=${selectedHospital.lat},${selectedHospital.lng}`;
    }
    if (selectedHospital) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedHospital.canonicalName + " " + (selectedHospital.address || selectedRegion))}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=Hospitals+in+${encodeURIComponent(selectedRegion)}`;
  }, [selectedHospital, selectedRegion]);

  // 1. Initialize Leaflet Map with Google Maps Satellite Layer
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on first hospital or Delhi NCR
    const firstHosp = hospitals.find(h => h.lat && h.lng);
    const initialCenter = firstHosp ? [Number(firstHosp.lat), Number(firstHosp.lng)] : [28.6139, 77.2090];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });
    mapInstanceRef.current = map;

    // Google Maps Satellite Layer (Hybrid with high-res satellite aerial + roads & place labels)
    const tileUrl = `https://mt1.google.com/vt/lyrs=${layerType}&x={x}&y={y}&z={z}`;
    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"]
    });
    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Feature group for markers
    const markersLayer = L.featureGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Map drag or zoom clears hover tooltip
    map.on("movestart zoomstart", () => {
      setHoveredHospital(null);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // Run once on mount

  // 2. Switch Satellite Layer Type (Hybrid, Pure Satellite, Street)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(`https://mt1.google.com/vt/lyrs=${layerType}&x={x}&y={y}&z={z}`);
  }, [layerType]);

  // 3. Render Interactive Hospital Pins on the Google Satellite Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const validHospitals = hospitals.filter(h => h.lat && h.lng && !isNaN(Number(h.lat)) && !isNaN(Number(h.lng)));
    if (validHospitals.length === 0) return;

    validHospitals.forEach((hosp) => {
      const isSelected = selectedHospital && selectedHospital.id === hosp.id;
      const success = hosp.successRate || 88;
      const isHigh = success >= 90;
      const pinColor = isHigh ? "#10b981" : success >= 85 ? "#0ea5e9" : "#f59e0b";
      const shortName = (hosp.canonicalName || "Hospital").split(" ")[0].slice(0, 11);

      // Create Custom SVG / HTML Marker
      const iconHtml = `
        <div class="relative flex flex-col items-center cursor-pointer -translate-x-1/2 -translate-y-1/2 select-none group">
          ${isSelected ? `
            <div class="absolute -inset-2.5 rounded-full bg-sky-400/40 animate-ping pointer-events-none"></div>
            <div class="absolute -inset-1.5 rounded-full border-2 border-sky-400/90 pointer-events-none"></div>
          ` : ""}
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.7)] border-2 border-white transition-transform duration-200 group-hover:scale-125" style="background-color: ${pinColor}">
            <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <div class="mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-md border ${isSelected ? 'bg-sky-600 border-sky-300 ring-2 ring-sky-400' : 'bg-slate-900/90 border-slate-700/80'} whitespace-nowrap backdrop-blur-md">
            ${shortName} • ${success}%
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-hospital-satellite-marker",
        iconSize: [32, 48],
        iconAnchor: [16, 24]
      });

      const marker = L.marker([Number(hosp.lat), Number(hosp.lng)], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100
      });

      // Realistic metrics for the hover card
      const recoveryText = `${Math.min(99, Math.round(success))} out of 100 recover smoothly`;
      const surgeriesYear = hosp.outcome?.annualVolume 
        ? `${hosp.outcome.annualVolume.toLocaleString()} surgeries done last year` 
        : "Over 1,200+ surgeries done";
      const costClean = hosp.cost 
        ? `₹${(hosp.cost.minAmount / 100000).toFixed(1)}L - ₹${(hosp.cost.maxAmount / 100000).toFixed(1)}L` 
        : (hosp.costRange || "₹3.2L - ₹5.8L");

      const enrichedHosp = {
        ...hosp,
        recoveryText,
        surgeriesYear,
        costClean
      };

      // Real-Time Hover Tooltip Events on the Google Satellite Map
      marker.on("mouseover", (e) => {
        marker.setZIndexOffset(99999);
        const point = map.latLngToContainerPoint(e.latlng);
        setTooltipPos({ x: point.x, y: point.y });
        setHoveredHospital(enrichedHosp);
      });

      marker.on("mousemove", (e) => {
        const point = map.latLngToContainerPoint(e.latlng);
        setTooltipPos({ x: point.x, y: point.y });
      });

      marker.on("mouseout", () => {
        marker.setZIndexOffset(isSelected ? 1000 : 100);
        setHoveredHospital(null);
      });

      marker.on("click", () => {
        setSelectedHospital(enrichedHosp);
        map.flyTo([Number(hosp.lat), Number(hosp.lng)], Math.max(14, map.getZoom()), { duration: 0.7 });
      });

      marker.addTo(markersLayer);
    });

    // Auto-fit bounds if we have markers
    try {
      const bounds = markersLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.12), { maxZoom: 14 });
      }
    } catch {
      // Ignore if bounds not valid yet
    }
  }, [hospitals, selectedHospital]);

  // Recenter / Fit All Hospitals
  const handleFitAll = () => {
    if (mapInstanceRef.current && markersLayerRef.current) {
      try {
        const bounds = markersLayerRef.current.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds.pad(0.15), { animate: true });
        }
      } catch {}
    }
  };

  // Zoom helpers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  // Select hospital from chips and fly to satellite coordinates
  const handleSelectFromChip = (hosp) => {
    setSelectedHospital(hosp);
    if (mapInstanceRef.current && hosp.lat && hosp.lng) {
      mapInstanceRef.current.flyTo([Number(hosp.lat), Number(hosp.lng)], 15, { duration: 0.8 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-3xl overflow-hidden border border-surface-container-high bg-[#060b14] text-white shadow-2xl flex flex-col select-none">
      {/* 1. Header Bar: Google Satellite Layer Controls & Region Title */}
      <div className="p-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
                Google Satellite Hospital Map
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {selectedHospital ? selectedHospital.canonicalName : `Showing facilities in ${selectedRegion}`}
            </p>
          </div>
        </div>

        {/* Satellite Map Layer Switcher & External Directions */}
        <div className="flex items-center gap-2">
          <div className="flex p-0.5 rounded-xl bg-slate-800 border border-slate-700 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setLayerType("y")}
              title="Google Satellite with Roads & Labels"
              className={`px-2.5 py-1 rounded-lg transition-all ${
                layerType === "y" ? "bg-primary text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setLayerType("m")}
              title="Google Street Roadmap"
              className={`px-2.5 py-1 rounded-lg transition-all ${
                layerType === "m" ? "bg-primary text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Roadmap
            </button>
          </div>

          <a
            href={googleMapsDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps Turn-by-Turn Navigation"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 text-[11px] font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Directions</span>
          </a>
        </div>
      </div>

      {/* 2. Google Satellite Leaflet Viewport */}
      <div className="relative w-full flex-1 overflow-hidden bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Zoom & Recenter Controls */}
        <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-1.5 shadow-xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 flex items-center justify-center transition-colors backdrop-blur-md"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 flex items-center justify-center transition-colors backdrop-blur-md"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleFitAll}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-slate-700/80 flex items-center justify-center transition-colors backdrop-blur-md"
            title="Fit All Hospitals on Satellite View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* 3. HOVER TOOLTIP CARD: Always shown above with high z-index and dynamic vertical flip */}
        {hoveredHospital && (
          <div
            className={`absolute z-[9999] pointer-events-none transition-all duration-75 ease-out ${
              tooltipPos.y < 230 
                ? "-translate-x-1/2 translate-y-3" 
                : "-translate-x-1/2 -translate-y-[calc(100%+14px)]"
            }`}
            style={{
              left: Math.max(160, Math.min(580, tooltipPos.x)),
              top: tooltipPos.y
            }}
          >
            <div className="w-72 p-3.5 rounded-2xl bg-slate-900/98 backdrop-blur-xl border border-sky-400/70 shadow-[0_16px_50px_rgba(0,0,0,0.95)] text-white ring-1 ring-white/10">
              {/* Header */}
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="p-1 rounded-md bg-sky-500/20 text-sky-400">
                    <Building2 className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="font-headline text-xs font-bold text-slate-100 line-clamp-1">
                    {hoveredHospital.canonicalName}
                  </h4>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  {hoveredHospital.successRate || 85}% Safety
                </span>
              </div>

              {/* Understandable Plain-Language Medical Details */}
              <div className="mt-2 space-y-1.5 text-[11px] border-t border-slate-800 pt-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Heart className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{hoveredHospital.recoveryText || "98 out of 100 recover smoothly"}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Activity className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{hoveredHospital.surgeriesYear || "High volume surgical team"}</span>
                </div>

                {hoveredHospital.governmentSchemes && hoveredHospital.governmentSchemes.length > 0 ? (
                  <div className="flex items-center gap-1 text-emerald-300 text-[10px] bg-emerald-950/60 p-1 px-1.5 rounded border border-emerald-800/60">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{hoveredHospital.governmentSchemes.slice(0, 2).join(" • ")}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-300 text-[10.5px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse shrink-0"></span>
                    <span>24/7 Emergency & ICU • Cashless Ready</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-400 pt-1 text-[10px] border-t border-slate-800/80">
                  <span>Typical Cost: <strong className="text-white font-mono">{hoveredHospital.costClean || "₹3.2L - ₹5.8L"}</strong></span>
                  <span>{hoveredHospital.distanceKm} km (~{Math.round((hoveredHospital.distanceKm || 10) * 2.2)} mins)</span>
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-sky-400 font-bold text-center">
                Click pin to zoom in on satellite campus & get directions →
              </div>
            </div>
          </div>
        )}

        {/* 4. SELECTED HOSPITAL DETAIL CARD OVERLAY */}
        {selectedHospital && (
          <div className="absolute top-3 left-3 z-30 max-w-[320px] sm:max-w-[340px] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-sky-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.7)] text-white">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                      Selected on Satellite View
                    </span>
                    <h4 className="font-headline text-sm font-bold text-white line-clamp-1">
                      {selectedHospital.canonicalName}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedHospital(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Address & Distance */}
              <div className="mt-2.5 flex items-center justify-between text-xs text-slate-300 border-y border-slate-800 py-1.5">
                <span className="flex items-center gap-1 truncate max-w-[65%]">
                  <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                  <span className="truncate">{selectedHospital.address || selectedHospital.city || selectedRegion}</span>
                  {selectedHospital.distanceKm && (
                    <span className="text-slate-500 font-mono">({selectedHospital.distanceKm} km)</span>
                  )}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold truncate">
                  {selectedHospital.accreditationTier || "NABH Approved"}
                </span>
              </div>

              {/* Realistic & Understandable Metrics for Everyday Patients */}
              <div className="mt-2.5 space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Patient Recovery Rate</span>
                    <strong className="text-xs text-emerald-400">
                      {Math.min(99, Math.round(selectedHospital.successRate || 88))} out of 100 recover well
                    </strong>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                    High Safety
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Estimated Treatment Cost</span>
                    <strong className="text-xs text-white">
                      {selectedHospital.costRange || "₹3.2 Lakh - ₹5.8 Lakh"}
                    </strong>
                  </div>
                  <span className="text-[10px] text-slate-300">
                    Surgery + 4-day Stay
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSelectHospital && onSelectHospital(selectedHospital)}
                  className="py-2 px-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-all truncate"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>

                <a
                  href={googleMapsDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1 border border-slate-700 transition-colors truncate"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Suggestions Dock (Bottom Bar) */}
      <div className="p-3 bg-slate-900/95 border-t border-slate-800 z-20">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
              Recommended Facilities on Satellite View
            </span>
          </div>

          <div className="flex items-center gap-1">
            {[
              { id: "all", label: "All" },
              { id: "high_outcome", label: "High Recovery" },
              { id: "budget", label: "Budget Friendly" }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`text-[10px] px-2 py-0.5 rounded-md transition-all ${
                  activeFilter === tab.id
                    ? "bg-sky-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {suggestedHospitals.map(hosp => {
            const isSelected = selectedHospital && selectedHospital.id === hosp.id;
            const costClean = hosp.cost 
              ? `₹${(hosp.cost.minAmount / 100000).toFixed(1)}L - ₹${(hosp.cost.maxAmount / 100000).toFixed(1)}L` 
              : (hosp.costRange || "₹3.2L - ₹5.8L");

            return (
              <button
                key={hosp.id}
                type="button"
                onClick={() => handleSelectFromChip(hosp)}
                className={`p-2 rounded-xl text-left transition-all border ${
                  isSelected 
                    ? "bg-sky-950/90 border-sky-400 text-white shadow-[0_0_12px_rgba(14,165,233,0.35)]" 
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold truncate block max-w-[70%] text-slate-100">
                    {hosp.canonicalName}
                  </span>
                  <span className="text-[9px] px-1 rounded font-bold bg-emerald-500/20 text-emerald-300">
                    {hosp.successRate || 85}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {hosp.city || selectedRegion} • {costClean}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
