import React, { useState, useEffect, useRef, useCallback } from "react";
import { Battery, Droplet, Leaf, CloudSun, Bug, Sprout, Thermometer, Wifi, AlertTriangle, Power, Info, Settings, Sun, Cloud, Zap, XCircle, ChevronDown, Bell, User, LogOut, Plus, Send, Calendar, MapPin, Target, MoveUp, MoveDown, MoveLeft, MoveRight, Eye, Layers, Wind, LineChart as LineChartIcon, Camera, Globe, Joystick, Square, Pause, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Save, Clock, Trash2, Undo, Map } from "lucide-react";

// --- REUSABLE UI COMPONENTS ---
const Card = ({ className, children }) => (
  <div className={`rounded-3xl p-6 bg-slate-800/50 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 ease-in-out hover:scale-[1.01] ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ title, icon: Icon, actions }) => (
  <div className="flex items-center justify-between mb-4 text-white">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-6 h-6 text-green-400" />}
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

// Inline SVG-based Circular Progressbar component for visual stats
const CircularProgressbar = ({ value, text, pathColor, trailColor, className }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={trailColor}
          strokeWidth="10"
          className="transition-all duration-500 ease-in-out"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={pathColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 60 60)"
          className="transition-all duration-500 ease-in-out"
        />
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-2xl font-bold"
          fill={pathColor}
        >
          {text}
        </text>
      </svg>
    </div>
  );
};

// Inline SVG-based LineChart component for analytics
const LineChart = ({ data, lines, width, height }) => {
  const chartHeight = height - 40;
  const chartWidth = width - 40;
  const maxVal = Math.max(...data.flatMap(d => lines.map(l => d[l.key])));

  const getPoints = (key) => {
    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * chartWidth;
      const y = chartHeight - (d[key] / maxVal) * chartHeight;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="flex flex-col items-center w-full">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <g transform="translate(20, 20)">
          {lines.map((line) => (
            <React.Fragment key={line.key}>
              <polyline
                points={getPoints(line.key)}
                fill="none"
                stroke={line.color}
                strokeWidth="2"
              />
              {data.map((d, idx) => (
                <circle
                  key={idx}
                  cx={(idx / (data.length - 1)) * chartWidth}
                  cy={chartHeight - (d[line.key] / maxVal) * chartHeight}
                  r="3"
                  fill={line.color}
                />
              ))}
            </React.Fragment>
          ))}
        </g>
      </svg>
    </div>
  );
};

// --- MOCK FARM DATA ---
const initialFarmData = Array.from({ length: 36 }, (_, i) => {
  const healthStatus = ['Healthy', 'Water Stress', 'Pest Detected', 'Nutrient Deficiency'];
  let crop = i < 18 ? 'Wheat' : 'Corn'; // First half Wheat, second half Corn
  let health = 'Healthy';
  if (i % 15 === 0) health = 'Pest Detected';
  else if (i % 7 === 0) health = 'Water Stress';
  else if (i % 11 === 0) health = 'Nutrient Deficiency';

  return {
    id: i,
    zone: `${String.fromCharCode(65 + Math.floor(i / 6))}-${(i % 6) + 1}`, // Adjusted for 6x6 grid
    crop: crop,
    health: health,
    soilMoisture: 40 + Math.floor(Math.random() * 40),
    temperature: 28 + (Math.random() - 0.5) * 5,
    humidity: 50 + (Math.random() - 0.5) * 20,
    lightIntensity: 5000 + Math.random() * 5000,
  };
});

// Mock data for individual drones
const mockDroneData = [
  { id: 1, battery: 85, pesticide: 65 },
  { id: 2, battery: 92, pesticide: 78 },
  { id: 3, battery: 73, pesticide: 91 },
  { id: 4, battery: 64, pesticide: 55 },
  { id: 5, battery: 88, pesticide: 72 },
];


// --- MAIN APP COMPONENT ---
export default function App() {
  const [alerts] = useState([
    { id: 1, type: "Severe", message: "Pest outbreak detected in Zone C-1.", time: "2m ago" },
    { id: 2, type: "Mild", message: "Low soil moisture in Zone A-7.", time: "15m ago" },
    { id: 3, type: "Info", message: "Drone #2 returning to base.", time: "30m ago" },
  ]);
  const [popup, setPopup] = useState(null);
  const [droneCoords, setDroneCoords] = useState({ x: 50, y: 50 });
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isDroneControlOpen, setDroneControlOpen] = useState(false);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isSensorModalOpen, setSensorModalOpen] = useState(false);
  const [isBatteryModalOpen, setBatteryModalOpen] = useState(false);
  const [isPesticideModalOpen, setPesticideModalOpen] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [soilMoisture, setSoilMoisture] = useState(42);
  const [temperature, setTemperature] = useState(32);
  const [pesticideLevel, setPesticideLevel] = useState(65);
  const [humidity, setHumidity] = useState(58);
  const [lightIntensity, setLightIntensity] = useState(8500);
  const [realTimeWeather, setRealTimeWeather] = useState({
    condition: 'Clear',
    temp: 28,
    wind: 12,
  });

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const droneControlRef = useRef(null);
  const scheduleModalRef = useRef(null);
  const sensorModalRef = useRef(null);
  const batteryModalRef = useRef(null);
  const pesticideModalRef = useRef(null);

  const useClickOutside = (ref, callback) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          callback();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callback]);
  };

  useClickOutside(profileRef, () => setProfileOpen(false));
  useClickOutside(notificationsRef, () => setNotificationsOpen(false));
  useClickOutside(droneControlRef, () => setDroneControlOpen(false));
  useClickOutside(scheduleModalRef, () => setScheduleModalOpen(false));
  useClickOutside(sensorModalRef, () => setSensorModalOpen(false));
  useClickOutside(batteryModalRef, () => setBatteryModalOpen(false));
  useClickOutside(pesticideModalRef, () => setPesticideModalOpen(false));


  // Function to handle clicking a sensor reading
  const handleSensorClick = (sensorName, value, unit, icon, color, historicalData) => {
    setSelectedSensor({ name: sensorName, value, unit, icon, color, historicalData });
    setSensorModalOpen(true);
  };
  
  const handlePopup = (title, message) => setPopup({ title, message });

  const getSoilMoistureStatus = (value) => {
    if (value > 60) return { text: "Optimal", color: "text-green-400" };
    if (value > 30) return { text: "Normal", color: "text-yellow-400" };
    return { text: "Dry", color: "text-red-400" };
  };

  const getPesticideLevelStatus = (value) => {
    if (value > 50) return { text: "High", color: "text-green-400" };
    if (value > 20) return { text: "Normal", color: "text-yellow-400" };
    return { text: "Low", color: "text-red-400" };
  };

  const historicalData = {
    moisture: [
      { day: 'Mon', value: 45 }, { day: 'Tue', value: 50 }, { day: 'Wed', value: 55 }, { day: 'Thu', value: 48 },
      { day: 'Fri', value: 42 }, { day: 'Sat', value: 47 }, { day: 'Sun', value: 60 }
    ],
    temperature: [
      { day: 'Mon', value: 28 }, { day: 'Tue', value: 26 }, { day: 'Wed', value: 25 }, { day: 'Thu', value: 24 },
      { day: 'Fri', value: 23 }, { day: 'Sat', value: 25 }, { day: 'Sun', value: 28 }
    ],
    humidity: [
      { day: 'Mon', value: 55 }, { day: 'Tue', value: 58 }, { day: 'Wed', value: 52 }, { day: 'Thu', value: 60 },
      { day: 'Fri', value: 65 }, { day: 'Sat', value: 62 }, { day: 'Sun', value: 58 }
    ],
    lightIntensity: [
      { day: 'Mon', value: 7000 }, { day: 'Tue', value: 8500 }, { day: 'Wed', value: 6000 }, { day: 'Thu', value: 7500 },
      { day: 'Fri', value: 8000 }, { day: 'Sat', value: 9000 }, { day: 'Sun', value: 8500 }
    ],
  };

  const quickActions = [
    { label: 'Deploy All', icon: Send, color: 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-300', action: () => handlePopup('Quick Action', 'Deploying all drones for a full field scan.') },
    { label: 'Activate All', icon: Droplet, color: 'bg-green-500/20 hover:bg-green-500/40 text-green-300', action: () => handlePopup('Quick Action', 'Activating all irrigation systems.') },
    { label: 'New Schedule', icon: Calendar, color: 'bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300', action: () => setScheduleModalOpen(true) },
    { label: 'Emergency Stop', icon: Power, color: 'bg-red-500/20 hover:bg-red-500/40 text-red-300', action: () => handlePopup('Quick Action', 'Emergency stop initiated for all systems.') },
  ];
  
  // Real-time weather data mock update
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeWeather(prev => ({
        ...prev,
        temp: 25 + Math.floor(Math.random() * 8),
        wind: 5 + Math.floor(Math.random() * 10),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="bg-slate-900 text-white font-sans min-h-screen relative overflow-hidden">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-fade-in-down { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
        }
        .animate-pulse-custom {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      
      {/* Particle Background */}
      <ParticleBackground />

      {/* Popup Modal */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm animate-fade-in">
          <div className="relative p-8 rounded-3xl bg-slate-800/80 backdrop-blur-md border border-white/10 shadow-2xl max-w-sm text-center">
            <button onClick={() => setPopup(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors" aria-label="Close"><XCircle className="w-8 h-8" /></button>
            <h4 className="text-2xl font-bold text-green-400 mb-4">{popup.title}</h4>
            <p className="text-lg text-gray-300">{popup.message}</p>
          </div>
        </div>
      )}

      {/* Sensor Detail Modal */}
      {isSensorModalOpen && selectedSensor && (
        <SensorDetailModal
          sensor={selectedSensor}
          onClose={() => setSensorModalOpen(false)}
        />
      )}

      {/* Drone Battery Modal */}
      {isBatteryModalOpen && (
        <InfoModal
          title="Drone Battery Status"
          icon={Battery}
          onClose={() => setBatteryModalOpen(false)}
          data={mockDroneData}
          valueKey="battery"
          unit="%"
          color="text-green-400"
        />
      )}

      {/* Pesticide Tank Modal */}
      {isPesticideModalOpen && (
        <InfoModal
          title="Pesticide Tank Levels"
          icon={Droplet}
          onClose={() => setPesticideModalOpen(false)}
          data={mockDroneData}
          valueKey="pesticide"
          unit="%"
          color="text-blue-400"
        />
      )}

      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 shadow-lg">
        <div className="px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-green-400 flex items-center gap-2"><Leaf /> STARKfly</div>
          </div>
          <div className="flex items-center gap-4">
            <input placeholder="Search..." className="hidden md:inline-block px-3 py-2 rounded-lg bg-white/10 border-none text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <div className="relative" ref={notificationsRef}>
              <button onClick={() => setNotificationsOpen(p => !p)} aria-label="notifications" className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                <Bell className="w-6 h-6 text-yellow-400" />
                {alerts.length > 0 && <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-900" />}
              </button>
              {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg animate-fade-in-down">
                  <div className="p-4 font-semibold border-b border-white/10">Notifications</div>
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {alerts.map(alert => (
                      <div key={alert.id} className={`p-3 rounded-lg flex items-start gap-3 mb-2 ${alert.type === 'Severe' ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
                        <div className="mt-1">{alert.type === 'Severe' ? <Bug className="w-5 h-5 text-red-500" /> : <Info className="w-5 h-5 text-yellow-500" />}</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-200">{alert.message}</p>
                          <p className="text-xs text-gray-400">{alert.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(p => !p)} className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors">
                <div className="w-9 h-9 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold border-2 border-slate-700">A</div>
                <span className="text-sm hidden md:block text-gray-300">Atharv P.</span>
                <ChevronDown className="w-5 h-5 text-gray-400 hidden md:block"/>
              </button>
              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-3 w-48 bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg animate-fade-in-down">
                  <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-green-500/20"><User className="w-5 h-5"/> Profile</a>
                  <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-green-500/20"><Settings className="w-5 h-5"/> Settings</a>
                  <div className="border-t border-white/10 my-1"></div>
                  <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/20"><LogOut className="w-5 h-5"/> Logout</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Left Column - Farm Map and Real-Time Stats */}
        <div className="lg:col-span-2 flex flex-col gap-4 md:gap-8">
          <InteractiveFarmMap droneCoords={droneCoords} setDroneCoords={setDroneCoords} farmData={initialFarmData} handlePopup={handlePopup} />
          
          {/* Real-Time Stats Panel - NEW COMPONENT */}
          <Card>
            <CardHeader title="Real-Time Stats" icon={Clock} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white/5 rounded-xl">
                <Cloud className="mx-auto w-10 h-10 text-gray-400 mb-2"/>
                <p className="text-sm text-gray-300">Condition</p>
                <p className="font-semibold text-lg">{realTimeWeather.condition}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <Thermometer className="mx-auto w-10 h-10 text-red-400 mb-2"/>
                <p className="text-sm text-gray-300">Temperature</p>
                <p className="font-semibold text-lg">{realTimeWeather.temp}°C</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <Wind className="mx-auto w-10 h-10 text-blue-400 mb-2"/>
                <p className="text-sm text-gray-300">Wind Speed</p>
                <p className="font-semibold text-lg">{realTimeWeather.wind} km/h</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Cards */}
        <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-8">
          
          {/* Drone Control Panel - NEW COMPONENT */}
          <DroneControlPanel handlePopup={handlePopup} setDroneControlOpen={setDroneControlOpen} />
          
          {/* Mission Control Panel - NEW COMPONENT */}
          <MissionControlPanel droneCoords={droneCoords} />

          {/* Farm Sensor Panel */}
          <Card>
            <CardHeader title="Farm Sensor Readings" icon={Globe} />
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleSensorClick('Soil Moisture', soilMoisture, '%', Droplet, 'text-blue-400', historicalData.moisture)} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl transition-all duration-200 hover:scale-105 hover:bg-white/10">
                <Sprout className="w-8 h-8 text-green-400 mb-2"/>
                <p className="text-sm text-gray-300">Moisture</p>
                <p className="font-semibold text-lg">{soilMoisture}%</p>
                <p className={`text-xs ${getSoilMoistureStatus(soilMoisture).color}`}>{getSoilMoistureStatus(soilMoisture).text}</p>
              </button>
              <button onClick={() => handleSensorClick('Temperature', temperature, '°C', Thermometer, 'text-red-400', historicalData.temperature)} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl transition-all duration-200 hover:scale-105 hover:bg-white/10">
                <Thermometer className="w-8 h-8 text-red-400 mb-2"/>
                <p className="text-sm text-gray-300">Temperature</p>
                <p className="font-semibold text-lg">{temperature}°C</p>
              </button>
              <button onClick={() => handleSensorClick('Humidity', humidity, '%', Droplet, 'text-blue-400', historicalData.humidity)} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl transition-all duration-200 hover:scale-105 hover:bg-white/10">
                <Droplet className="w-8 h-8 text-blue-400 mb-2"/>
                <p className="text-sm text-gray-300">Humidity</p>
                <p className="font-semibold text-lg">{humidity}%</p>
              </button>
              <button onClick={() => handleSensorClick('Light Intensity', lightIntensity, 'lx', Sun, 'text-yellow-400', historicalData.lightIntensity)} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl transition-all duration-200 hover:scale-105 hover:bg-white/10">
                <Sun className="w-8 h-8 text-yellow-400 mb-2"/>
                <p className="text-sm text-gray-300">Light</p>
                <p className="font-semibold text-lg">{lightIntensity/1000} klx</p>
              </button>
            </div>
          </Card>

          {/* System Status Panel with CircularProgressbar */}
          <Card>
            <CardHeader title="System Status" icon={Zap} />
            <div className="grid grid-cols-2 gap-6">
              <CircularProgressbar value={85} text="85%" pathColor="#34d399" trailColor="#4b5563" className="w-full h-auto"/>
              <CircularProgressbar value={pesticideLevel} text={`${pesticideLevel}%`} pathColor="#60a5fa" trailColor="#4b5563" className="w-full h-auto"/>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <button onClick={() => setBatteryModalOpen(true)} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-green-500/20 transition-colors cursor-pointer"><Battery className="w-5 h-5 text-green-400"/><span>Drone Battery: <span className="font-semibold text-green-400">85%</span></span></button>
                <button onClick={() => setPesticideModalOpen(true)} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer"><Droplet className="w-5 h-5 text-blue-400"/><span>Pesticide Tank: <span className="font-semibold text-blue-400">{pesticideLevel}%</span></span></button>
                <div className="col-span-2 flex items-center gap-2 p-2 bg-white/5 rounded-lg"><Wifi className="w-5 h-5 text-green-400"/><span>Connectivity: <span className="font-semibold text-green-400">Excellent</span></span></div>
            </div>
          </Card>

          {/* Historical Analytics Card */}
          <Card>
            <CardHeader title="Historical Analytics" icon={LineChartIcon} />
            <div className="w-full h-40">
              <LineChart
                data={historicalData.temperature}
                lines={[
                  { key: 'value', color: '#f87171' },
                ]}
                width={300}
                height={200}
              />
            </div>
            <div className="mt-4 flex justify-around text-xs font-semibold">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span>Temp.</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Moisture</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions Panel */}
          <Card>
            <CardHeader title="Quick Actions" icon={Plus}/>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(action => (
                <button key={action.label} onClick={action.action} className={`flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-200 ${action.color} transform hover:scale-105`}>
                  <action.icon className="w-8 h-8 mb-2"/>
                  <span className="text-sm font-semibold text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Weather Forecast Card */}
          <Card>
            <CardHeader title="Weather Forecast" icon={CloudSun} />
            <div className="grid grid-cols-2 gap-4 text-center">
              {[
                { day: 'Now', icon: Sun, temp: 28, condition: 'Sunny' }, { day: '3 Hr', icon: Cloud, temp: 26, condition: 'Cloudy' },
                { day: '6 Hr', icon: CloudSun, temp: 25, condition: 'Partly Cloudy' }, { day: 'Tomorrow', icon: Wind, temp: 24, condition: 'Windy' },
              ].map(day => (
                <div key={day.day} className="p-4 bg-white/5 rounded-xl">
                  <p className="font-semibold text-gray-300">{day.day}</p>
                  <day.icon className="mx-auto w-10 h-10 text-yellow-400 mt-2" />
                  <p className="text-xl font-bold mt-2">{day.temp}°C</p>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </main>
      
      {/* Drone Control Modal - NEW COMPONENT */}
      {isDroneControlOpen && (
        <DroneControlModal 
          handlePopup={handlePopup} 
          setDroneControlOpen={setDroneControlOpen}
          droneCoords={droneCoords}
          setDroneCoords={setDroneCoords}
        />
      )}

      {/* Schedule Creation Modal */}
      {isScheduleModalOpen && (
        <ScheduleCreationModal
          setScheduleModalOpen={setScheduleModalOpen}
          handlePopup={handlePopup}
        />
      )}
    </div>
  );
}

// --- PARTICLE BACKGROUND COMPONENT ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };
    
    // Particle class for the animation
    class Particle {
      constructor(width, height) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) this.size -= 0.01;
      }
      draw() {
        ctx.fillStyle = `rgba(52, 211, 153, ${this.size * 0.4})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].size <= 0.2) {
          particles.splice(i, 1);
          particles.push(new Particle(canvas.width, canvas.height));
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none"></canvas>;
};

// --- DEDICATED CHILD COMPONENTS FOR THE MAP ---

const InteractiveFarmMap = ({ droneCoords, setDroneCoords, farmData, handlePopup }) => {
  const [selectedPlot, setSelectedPlot] = useState(null);
  const mapRef = useRef(null);

  // Note: The user's new design uses a single color for all plots, so the `mapView` state is no longer visually represented.
  const [mapView, setMapView] = useState('health');
  
  const dispatchDrone = (plot) => {
    if (!mapRef.current) return;
    const mapRect = mapRef.current.getBoundingClientRect();
    const plotElement = mapRef.current.querySelector(`[data-plot-id='${plot.id}']`);
    if (!plotElement) return;
    const plotRect = plotElement.getBoundingClientRect();

    const x = ((plotRect.left + plotRect.width / 2 - mapRect.left) / mapRect.width) * 100;
    const y = ((plotRect.top + plotRect.height / 2 - mapRect.top) / mapRect.height) * 100;

    setDroneCoords({ x, y });
    handlePopup('Drone Dispatched', `Drone is now en route to Zone ${plot.zone} for inspection.`);
  };

  return (
    <Card className="h-full flex flex-col p-8">
      <CardHeader title="Farm Overview" icon={Map} />
      <div className="flex-grow w-full h-[600px] bg-green-950/20 rounded-2xl flex items-center justify-center relative overflow-hidden">
        
        {/* Farm Grid */}
        <div className="grid grid-cols-6 gap-2 w-full h-full p-4">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} data-plot-id={i} onClick={() => setSelectedPlot(farmData[i])}
              className={`w-full h-full rounded-md transition-colors cursor-pointer bg-green-700/50 hover:bg-green-600`}>
            </div>
          ))}
        </div>
        
        {/* Pulsing Drone SVG */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{
            transform: `translateX(${droneCoords.x}%) translateY(${droneCoords.y}%)`,
            transition: 'transform 1s ease-in-out'
          }}>
          <div className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-green-400 animate-pulse-custom">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" aria-hidden="true">
              <rect x="0" y="28" width="64" height="8" rx="2" fill="currentColor" opacity="0.12"></rect>
              <g transform="translate(6,6)" fill="currentColor">
                <circle cx="10" cy="10" r="6"></circle>
                <rect x="14" y="8" width="28" height="4" rx="2"></rect>
                <circle cx="50" cy="10" r="6"></circle>
                <circle cx="10" cy="42" r="6"></circle>
                <circle cx="50" cy="42" r="6"></circle>
              </g>
            </svg>
          </div>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 right-4 bg-white/10 px-4 py-2 rounded-xl text-sm text-gray-300">
          <div className="font-semibold">Map: Crop Zones</div>
          <div className="text-xs">Hover tiles for details</div>
        </div>
      </div>
      
      {/* Plot Info Panel */}
      <div className="mt-6">
        {selectedPlot ?
          <PlotInfoPanel plot={selectedPlot} dispatchDrone={dispatchDrone} clearSelection={() => setSelectedPlot(null)} handlePopup={handlePopup} /> :
          <div className="w-full flex flex-col items-center justify-center text-gray-400 bg-white/5 rounded-2xl p-4">
            <Eye className="w-12 h-12 mb-4"/>
            <h4 className="font-semibold text-lg">No Plot Selected</h4>
            <p className="text-sm text-center">Click on any plot in the map to view its detailed status and available actions.</p>
          </div>
        }
      </div>
    </Card>
  );
};

const MapLegend = ({ mapView }) => {
  let title = "Health Status";
  let items = [
    { color: 'bg-green-500', label: 'Healthy' },
    { color: 'bg-blue-400', label: 'Water Stress' },
    { color: 'bg-red-500', label: 'Pest Detected' },
    { color: 'bg-purple-500', label: 'Nutrient Deficiency' },
  ];

  if (mapView === 'crop') {
    title = "Crop Types";
    items = [
      { color: 'bg-yellow-500', label: 'Corn' },
      { color: 'bg-amber-600', label: 'Wheat' },
      { color: 'bg-lime-500', label: 'Soybean' },
      { color: 'bg-orange-700', label: 'Potatoes' },
    ];
  } else if (mapView === 'moisture') {
    title = "Soil Moisture";
    items = [
      { color: 'bg-blue-500', label: 'High (>70%)' },
      { color: 'bg-cyan-600', label: 'Normal (40-70%)' },
      { color: 'bg-teal-800', label: 'Low (<40%)' },
    ];
  }

  return (
    <div className="w-full md:w-52 p-4 bg-white/5 rounded-2xl flex-shrink-0">
      <h5 className="font-semibold text-gray-300 mb-4">{title}</h5>
      <ul className="space-y-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-3">
            <span className={`w-4 h-4 rounded-full ${item.color}`}></span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const PlotInfoPanel = ({ plot, dispatchDrone, clearSelection, handlePopup }) => {
  const isPestDetected = plot.health === 'Pest Detected';
  const isWaterStress = plot.health === 'Water Stress';

  const handleSpray = () => {
    handlePopup('Precision Spraying', `Drone is now spraying pesticides on Zone ${plot.zone} to target the detected pests.`);
  };
  
  const handleIrrigate = () => {
    handlePopup('Irrigation Activated', `Irrigation system activated for Zone ${plot.zone}.`);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white/5 rounded-2xl p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold text-green-300">Plot Details</h4>
        <button onClick={clearSelection} className="text-gray-400 hover:text-white"><XCircle className="w-6 h-6"/></button>
      </div>
      <div className="flex-grow space-y-3 text-sm overflow-y-auto">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Zone ID</span>
          <span className="font-mono px-2 py-1 bg-slate-700/50 rounded">{plot.zone}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Crop Type</span>
          <span className="font-semibold">{plot.crop}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Health Status</span>
          <span className={`font-semibold px-2 py-1 rounded text-xs ${
            plot.health === 'Healthy' ? 'bg-green-500/20 text-green-300' :
            plot.health === 'Pest Detected' ? 'bg-red-500/20 text-red-300' :
            plot.health === 'Water Stress' ? 'bg-blue-500/20 text-blue-300' :
            'bg-purple-500/20 text-purple-300'
          }`}>{plot.health}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Soil Moisture</span>
          <span>{plot.soilMoisture}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Temperature</span>
          <span>{plot.temperature.toFixed(1)}°C</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Humidity</span>
          <span>{plot.humidity.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Light Intensity</span>
          <span>{plot.lightIntensity.toFixed(0)} Lux</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <button onClick={() => dispatchDrone(plot)} className="w-full flex items-center justify-center gap-2 bg-blue-600/50 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
          <Target className="w-5 h-5" /> Dispatch Drone
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-green-600/50 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
          <Sprout className="w-5 h-5" /> View Growth History
        </button>
        {isPestDetected && (
          <button onClick={handleSpray} className="w-full flex items-center justify-center gap-2 bg-red-600/50 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
            <Bug className="w-5 h-5" /> Precision Spray
          </button>
        )}
        {isWaterStress && (
          <button onClick={handleIrrigate} className="w-full flex items-center justify-center gap-2 bg-cyan-600/50 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
            <Droplet className="w-5 h-5" /> Activate Irrigation
          </button>
        )}
      </div>
    </div>
  );
};

const SensorDetailModal = ({ sensor, onClose }) => {
  const modalRef = useRef(null);
  
  const historicalData = [
    { day: 'Mon', value: sensor.historicalData[0].value },
    { day: 'Tue', value: sensor.historicalData[1].value },
    { day: 'Wed', value: sensor.historicalData[2].value },
    { day: 'Thu', value: sensor.historicalData[3].value },
    { day: 'Fri', value: sensor.historicalData[4].value },
    { day: 'Sat', value: sensor.historicalData[5].value },
    { day: 'Sun', value: sensor.historicalData[6].value },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm animate-fade-in">
      <div ref={modalRef} className="relative p-8 rounded-3xl bg-slate-800/80 backdrop-blur-md border border-white/10 shadow-2xl max-w-2xl w-full">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors" aria-label="Close"><XCircle className="w-8 h-8" /></button>
        <h4 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">{React.createElement(sensor.icon, { className: 'w-6 h-6' })} {sensor.name} Analytics</h4>
        
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <p className="text-gray-300">Current Reading:</p>
          <p className={`font-bold text-4xl ${sensor.color}`}>{sensor.value}<span className="text-xl font-normal">{sensor.unit}</span></p>
        </div>

        <p className="text-gray-300 mb-2">Historical Data (Last 7 Days)</p>
        <div className="w-full h-64">
          <LineChart
            data={historicalData}
            lines={[
              { key: 'value', color: sensor.color === 'text-red-400' ? '#f87171' : (sensor.color === 'text-blue-400' ? '#60a5fa' : '#34d399') },
            ]}
            width={500}
            height={250}
          />
        </div>
      </div>
    </div>
  );
};

// --- NEW COMPONENTS FOR DRONE CONTROL ---

const DroneControlPanel = ({ setDroneControlOpen, handlePopup }) => (
  <Card>
    <CardHeader title="Drone Command Panel" icon={Joystick} />
    <div className="space-y-3">
      <button 
        onClick={() => setDroneControlOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-gray-300 px-6 py-4 rounded-xl font-semibold transition-colors transform hover:scale-105"
      >
        <Joystick className="w-6 h-6" /> Open Manual Control
      </button>
      <button 
        onClick={() => handlePopup("Spraying Activated", "Drone is now spraying all designated zones for pest control.")}
        className="w-full flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-6 py-4 rounded-xl font-semibold transition-colors transform hover:scale-105"
      >
        <Droplet className="w-6 h-6" /> Activate Full Spray
      </button>
    </div>
  </Card>
);

const DroneControlModal = ({ handlePopup, setDroneControlOpen, droneCoords, setDroneCoords }) => {
  const moveDrone = (direction) => {
    let newX = droneCoords.x;
    let newY = droneCoords.y;
    const step = 2; // Movement step in percentage

    switch (direction) {
      case 'up':
        newY = Math.max(0, newY - step);
        handlePopup("Drone Movement", "Drone moving up.");
        break;
      case 'down':
        newY = Math.min(100, newY + step);
        handlePopup("Drone Movement", "Drone moving down.");
        break;
      case 'left':
        newX = Math.max(0, newX - step);
        handlePopup("Drone Movement", "Drone moving left.");
        break;
      case 'right':
        newX = Math.min(100, newX + step);
        handlePopup("Drone Movement", "Drone moving right.");
        break;
      default:
        break;
    }
    setDroneCoords({ x: newX, y: newY });
  };

  const manualControlActions = [
    { label: 'Send to Base', icon: MapPin, color: 'bg-green-500/20 hover:bg-green-500/40 text-green-300', action: () => { setDroneCoords({ x: 50, y: 50 }); handlePopup("Drone Returning", "Drone is now returning to its base."); setDroneControlOpen(false); } },
    { label: 'Stop', icon: Square, color: 'bg-red-500/20 hover:bg-red-500/40 text-red-300', action: () => handlePopup("Drone Stopped", "The drone's current mission has been stopped.") },
    { label: 'Pause', icon: Pause, color: 'bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300', action: () => handlePopup("Drone Paused", "The drone's current mission has been paused.") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm animate-fade-in">
      <div className="relative p-8 rounded-3xl bg-slate-800/80 backdrop-blur-md border border-white/10 shadow-2xl max-w-lg w-full">
        <button onClick={() => setDroneControlOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors" aria-label="Close"><XCircle className="w-8 h-8" /></button>
        <h4 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2"><Joystick /> Drone Control Center</h4>
        
        <p className="text-gray-300 mb-6">Take manual control of the drone. Use the directional pad to move it across the map or the action buttons for specific commands.</p>

        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8">
          {/* Directional Pad */}
          <div className="flex flex-col items-center">
            <h5 className="font-semibold text-gray-300 mb-2">Manual Movement</h5>
            <div className="grid grid-cols-3 gap-1">
              <span className="col-start-2 row-start-1">
                <button onClick={() => moveDrone('up')} className="p-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-colors"><ArrowUp className="w-6 h-6" /></button>
              </span>
              <span className="col-start-1 row-start-2">
                <button onClick={() => moveDrone('left')} className="p-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
              </span>
              <span className="col-start-2 row-start-2 flex items-center justify-center w-14 h-14 rounded-full bg-slate-600/80"></span>
              <span className="col-start-3 row-start-2">
                <button onClick={() => moveDrone('right')} className="p-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-colors"><ArrowRight className="w-6 h-6" /></button>
              </span>
              <span className="col-start-2 row-start-3">
                <button onClick={() => moveDrone('down')} className="p-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-colors"><ArrowDown className="w-6 h-6" /></button>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <h5 className="font-semibold text-gray-300 mb-2">Action Commands</h5>
            {manualControlActions.map(action => (
              <button key={action.label} onClick={action.action} className={`flex items-center gap-2 px-6 py-4 rounded-xl font-semibold transition-colors ${action.color}`}>
                <action.icon className="w-5 h-5"/> {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- NEW COMPONENT FOR SCHEDULE CREATION ---
const ScheduleCreationModal = ({ setScheduleModalOpen, handlePopup }) => {
  const [waypoints, setWaypoints] = useState([]);
  const [newWaypoint, setNewWaypoint] = useState({ x: '', y: '', time: '' });

  const handleAddWaypoint = () => {
    const { x, y, time } = newWaypoint;
    if (x !== '' && y !== '' && time !== '') {
      setWaypoints([...waypoints, { ...newWaypoint }]);
      setNewWaypoint({ x: '', y: '' });
    }
  };

  const handleUndoWaypoint = () => {
    if (waypoints.length > 0) {
      setWaypoints(waypoints.slice(0, -1));
    }
  };

  const handleRemoveWaypoint = (index) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const handleSaveSchedule = () => {
    if (waypoints.length > 0) {
      handlePopup("Schedule Saved", `A new drone mission with ${waypoints.length} waypoints has been scheduled.`);
      setScheduleModalOpen(false);
    } else {
      handlePopup("Error", "Please add at least one waypoint to the schedule.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm animate-fade-in">
      <div className="relative p-8 rounded-3xl bg-slate-800/80 backdrop-blur-md border border-white/10 shadow-2xl max-w-2xl w-full">
        <button onClick={() => setScheduleModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors" aria-label="Close"><XCircle className="w-8 h-8" /></button>
        <h4 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2"><Calendar /> Create Drone Schedule</h4>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <h5 className="font-semibold text-gray-300">Add New Waypoint</h5>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm text-gray-400 mb-1">X Coordinate (%)</span>
                <input 
                  type="number" min="0" max="100" 
                  value={newWaypoint.x} 
                  onChange={(e) => setNewWaypoint({ ...newWaypoint, x: e.target.value })} 
                  className="bg-white/5 text-white px-4 py-2 rounded-lg"
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-400 mb-1">Y Coordinate (%)</span>
                <input 
                  type="number" min="0" max="100" 
                  value={newWaypoint.y} 
                  onChange={(e) => setNewWaypoint({ ...newWaypoint, y: e.target.value })} 
                  className="bg-white/5 text-white px-4 py-2 rounded-lg"
                />
              </label>
            </div>
            <label className="flex flex-col">
              <span className="text-sm text-gray-400 mb-1">Timestamp (HH:mm)</span>
              <input 
                type="text" 
                value={newWaypoint.time} 
                onChange={(e) => setNewWaypoint({ ...newWaypoint, time: e.target.value })} 
                placeholder="e.g., 09:30"
                className="bg-white/5 text-white px-4 py-2 rounded-lg"
              />
            </label>
            <div className="flex gap-2">
              <button onClick={handleAddWaypoint} className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/40 text-green-300 px-4 py-3 rounded-xl font-semibold transition-colors">
                <Plus className="w-5 h-5" /> Add Waypoint
              </button>
              <button onClick={handleUndoWaypoint} className="flex-1 flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-gray-300 px-4 py-3 rounded-xl font-semibold transition-colors">
                <Undo className="w-5 h-5" /> Undo Add
              </button>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <h5 className="font-semibold text-gray-300">Scheduled Waypoints</h5>
            <div className="h-40 bg-white/5 rounded-lg p-4 overflow-y-auto space-y-2">
              {waypoints.length > 0 ? (
                waypoints.map((point, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{point.time}</span>
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>({point.x}%, {point.y}%)</span>
                    </div>
                    <button onClick={() => handleRemoveWaypoint(index)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">No waypoints added yet.</div>
              )}
            </div>
            <button onClick={handleSaveSchedule} className="w-full flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-4 py-3 rounded-xl font-semibold transition-colors">
              <Save className="w-5 h-5" /> Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- NEW COMPONENT FOR MISSION CONTROL PANEL ---
const MissionControlPanel = ({ droneCoords }) => {
  const [selectedFeature, setSelectedFeature] = useState('live_feed');

  const renderMissionControlContent = () => {
    switch (selectedFeature) {
      case 'live_feed':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-gray-400 rounded-xl">
            <div className="w-full flex items-center justify-center relative h-32">
              <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute top-0 left-0">
                <rect x="0" y="0" width="100" height="100" fill="transparent" />
                {[...Array(9)].map((_, i) => (
                  <line key={`v-${i}`} x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="100" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2,2" />
                ))}
                {[...Array(9)].map((_, i) => (
                  <line key={`h-${i}`} x1="0" y1={(i + 1) * 10} x2="100" y2={(i + 1) * 10} stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2,2" />
                ))}
                <circle cx={droneCoords.x} cy={droneCoords.y} r="3" fill="#34d399" className="animate-pulse" />
              </svg>
            </div>
            <div className="text-sm font-semibold mt-4">
              Current Coordinates: <span className="text-green-400">({droneCoords.x.toFixed(2)}, {droneCoords.y.toFixed(2)})</span>
            </div>
          </div>
        );
      case 'drone_stats':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl text-white">
              <p className="font-bold">Total Flights</p>
              <p className="text-2xl text-green-400">45</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-white">
              <p className="font-bold">Distance Traveled</p>
              <p className="text-2xl text-green-400">80 km</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-white">
              <p className="font-bold">Total Missions</p>
              <p className="text-2xl text-green-400">22</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-white">
              <p className="font-bold">Operating Hours</p>
              <p className="text-2xl text-green-400">14.5 hrs</p>
            </div>
          </div>
        );
      case 'flight_logs':
        return (
          <div className="space-y-2 text-white overflow-y-auto max-h-48">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="font-semibold">Flight #125</span>
              <span className="text-sm text-gray-400">Completed 10m ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="font-semibold">Flight #124</span>
              <span className="text-sm text-gray-400">Completed 2 hrs ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="font-semibold">Flight #123</span>
              <span className="text-sm text-gray-400">Completed 1 day ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="font-semibold">Flight #122</span>
              <span className="text-sm text-gray-400">Completed 2 days ago</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader title="Drone Mission Control" icon={Target} />
      <div className="flex justify-between mb-4">
        <button 
          onClick={() => setSelectedFeature('live_feed')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${selectedFeature === 'live_feed' ? 'bg-green-500/20 text-green-300' : 'text-gray-400 hover:text-green-300'}`}
        >
          Live Feed
        </button>
        <button
          onClick={() => setSelectedFeature('drone_stats')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${selectedFeature === 'drone_stats' ? 'bg-green-500/20 text-green-300' : 'text-gray-400 hover:text-green-300'}`}
        >
          Stats
        </button>
        <button
          onClick={() => setSelectedFeature('flight_logs')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${selectedFeature === 'flight_logs' ? 'bg-green-500/20 text-green-300' : 'text-gray-400 hover:text-green-300'}`}
        >
          Logs
        </button>
      </div>
      <div className="flex-1 w-full flex items-center justify-center">
        {renderMissionControlContent()}
      </div>
    </Card>
  );
};

// --- NEW COMPONENT FOR MODAL WINDOW ---
const InfoModal = ({ title, icon: Icon, onClose, data, valueKey, unit, color }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm animate-fade-in">
      <div className="relative p-8 rounded-3xl bg-slate-800/80 backdrop-blur-md border border-white/10 shadow-2xl max-w-sm w-full">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors" aria-label="Close"><XCircle className="w-8 h-8" /></button>
        <h4 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">{Icon && <Icon className="w-6 h-6" />} {title}</h4>
        
        <div className="space-y-4">
          {data.map(item => (
            <div key={item.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5">
              <div className="font-semibold text-gray-300">Drone #{item.id}</div>
              <div className={`font-bold text-xl ${color}`}>
                {item[valueKey]}<span className="text-sm font-normal">{unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
