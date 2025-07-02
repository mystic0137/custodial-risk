"use client";

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from "react";
import { createChart, ColorType } from "lightweight-charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from 'lucide-react';

// Dynamically import Joyride with SSR disabled
const Joyride = dynamic(() => import('react-joyride'), { ssr: false });

interface Order {
  id: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  price?: number;
  quantity: number;
  timestamp: Date;
}

function CEXSecuritySimulationComponent() {
  const [balance, setBalance] = useState(50000);
  const [currentPrice] = useState(85.42);
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [activeTab, setActiveTab] = useState<'market' | 'limit'>('market');
  const [orders, setOrders] = useState<Order[]>([]);
  const [breachDetected, setBreachDetected] = useState(false);
  const [draining, setDraining] = useState(false);
  const [fullyDrained, setFullyDrained] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Theme state - dark mode as default
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Tour state
  const [runTour, setRunTour] = useState(false);
  const [tourKey, setTourKey] = useState(0);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('cex-theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Save theme preference and apply to document
  useEffect(() => {
    localStorage.setItem('cex-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Theme toggle function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Tour steps configuration
  const tourSteps = [
    {
      target: '.tour-welcome',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Welcome to CEX Security Simulation! 🔐</h3>
          <p>This simulation demonstrates the **critical security risks** of centralized exchanges (CEX).</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>🎯 <strong>Learning Goal:</strong> Understand CEX vulnerabilities</p>
            <p>⚠️ <strong>Simulation:</strong> Experience a security breach firsthand</p>
            <p>💡 <strong>Takeaway:</strong> Why self-custody matters</p>
          </div>
          <p className="mt-2 text-blue-200 text-sm">Experience what happens when exchanges get hacked!</p>
        </div>
      ),
      placement: 'center' as const,
      disableBeacon: true,
    },
    {
      target: '.tour-theme-toggle',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Theme Toggle 🌙☀️</h3>
          <p>Switch between dark and light mode for comfortable viewing during the simulation.</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>🌙 <strong>Dark Mode:</strong> Easy on the eyes</p>
            <p>☀️ <strong>Light Mode:</strong> Classic bright interface</p>
            <p>💾 <strong>Persistent:</strong> Your preference is saved</p>
          </div>
        </div>
      ),
    },
    {
      target: '.tour-balance',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Your "Safe" Exchange Balance 💰</h3>
          <p><strong>CEX Reality:</strong> Your $50,000 is held by the exchange, not you.</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>🏦 <strong>Custodial Risk:</strong> Exchange controls your funds</p>
            <p>🔒 <strong>No Real Ownership:</strong> You only have an account balance</p>
            <p>⚡ <strong>Vulnerability:</strong> Single point of failure</p>
          </div>
          <p className="mt-2 text-yellow-200 text-sm">Watch what happens when you place an order!</p>
        </div>
      ),
    },
    {
      target: '.tour-price-chart',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Live Market Data 📈</h3>
          <p>Real-time price feed from the exchange's servers. Everything looks normal... for now.</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>📊 <strong>Centralized Data:</strong> All from exchange servers</p>
            <p>🎯 <strong>Current Price:</strong> SOL at $85.42</p>
            <p>🔴 <strong>Hidden Risk:</strong> Server vulnerabilities</p>
          </div>
        </div>
      ),
    },
    {
      target: '.tour-trading-tabs',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Trading Interface 📝</h3>
          <p>Standard CEX trading interface with Market and Limit order options.</p>
          <div className="mt-2 p-2 bg-red-50 rounded text-sm">
            <p>⚠️ <strong>Warning:</strong> Any trading activity will trigger the security breach simulation!</p>
          </div>
          <p className="mt-2 text-sm text-orange-200">This is where the vulnerability lies hidden...</p>
        </div>
      ),
    },
    {
      target: '.tour-quantity-input',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Order Entry Point 🎯</h3>
          <p>Enter any amount to place an order. This will <strong>trigger the security breach</strong>.</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>💡 <strong>Try it:</strong> Enter "10" to see what happens</p>
            <p>🔴 <strong>Simulation:</strong> Mimics real hack scenarios</p>
            <p>📚 <strong>Educational:</strong> Learn about CEX risks safely</p>
          </div>
        </div>
      ),
    },
    {
      target: '.tour-trade-buttons',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">The Vulnerability Trigger ⚡</h3>
          <p><strong>Critical Moment:</strong> Clicking any trade button will expose the exchange's security flaw.</p>
          <div className="mt-2 space-y-1 text-sm">
            <li>🔓 Simulates unauthorized access</li>
            <li>💸 Triggers automatic fund draining</li>
            <li>⚠️ Shows real-world hack scenarios</li>
            <li>🎓 Educational demonstration only</li>
          </div>
          <p className="mt-2 text-red-200 font-semibold">Ready to see how exchanges get compromised?</p>
        </div>
      ),
    },
    {
      target: '.tour-recent-orders',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Order History Tracking 📋</h3>
          <p>Your trading activity gets recorded here - including the order that triggers the breach.</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>📝 <strong>Order Logs:</strong> All trades recorded</p>
            <p>🕐 <strong>Timestamps:</strong> Exact timing preserved</p>
            <p>⚠️ <strong>Risk:</strong> Data vulnerable to attackers</p>
          </div>
        </div>
      ),
    },
    {
      target: '.tour-security-warning',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Security Breach Simulation 🚨</h3>
          <p>When you place an order, you'll see:</p>
          <ul className="text-sm mt-2 space-y-1">
            <li>🔓 <strong>Breach Alert:</strong> Unauthorized access detected</li>
            <li>📊 <strong>Progress Bar:</strong> Shows fund draining in real-time</li>
            <li>💸 <strong>Balance Drop:</strong> $10,000 drained every 0.5 seconds</li>
            <li>💥 <strong>Final Message:</strong> Complete loss of funds</li>
          </ul>
          <p className="mt-2 text-red-200 text-sm">This demonstrates real CEX hack scenarios!</p>
        </div>
      ),
    },
    {
      target: '.tour-educational-purpose',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Why This Simulation Matters 🎓</h3>
          <p>Real-world CEX hacks have resulted in billions of dollars lost:</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>💥 <strong>Mt. Gox (2014):</strong> 850,000 BTC stolen</p>
            <p>🔥 <strong>Coincheck (2018):</strong> $530 million drained</p>
            <p>⚡ <strong>FTX (2022):</strong> $8 billion user funds missing</p>
            <p>🛡️ <strong>Solution:</strong> Self-custody with hardware wallets</p>
          </div>
          <p className="mt-2 text-green-200 font-semibold">Not your keys, not your crypto!</p>
        </div>
      ),
    },
    {
      target: '.tour-help-button',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Ready to Experience the Hack! 💥</h3>
          <p>You now understand:</p>
          <ul className="text-sm mt-2 space-y-1">
            <li>✅ CEX security vulnerabilities</li>
            <li>✅ How exchange hacks happen</li>
            <li>✅ The importance of self-custody</li>
            <li>✅ Real-world hack examples</li>
          </ul>
          <p className="mt-2 text-orange-200 font-semibold">Go ahead and place an order to see the simulation!</p>
          <p className="mt-1 text-xs text-gray-300">Click this button anytime to restart the tour.</p>
        </div>
      ),
    },
  ];

  // Tour callback handler
  const handleTourCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses = ["finished", "skipped"];
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
    }
  };

  // Function to start/restart tour
  const startTour = () => {
    setRunTour(false);
    setTimeout(() => {
      setTourKey(prev => prev + 1);
      setRunTour(true);
    }, 100);
  };

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      layout: {
        background: { 
          color: isDarkMode ? "#1f2937" : "#ffffff", 
          type: ColorType.Solid 
        },
        textColor: isDarkMode ? "#e5e7eb" : "#1f2937",
      },
      width: 800,
      height: 400,
      grid: {
        vertLines: { color: isDarkMode ? "#374151" : "#f3f4f6" },
        horzLines: { color: isDarkMode ? "#374151" : "#f3f4f6" },
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    const data = [];
    let price = 85;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const open = price;
      const close = open + (Math.random() - 0.5) * 3;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;
      
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - (30 - i));
      const timeString = targetDate.toISOString().split('T')[0];
      
      data.push({
        time: timeString,
        open: Math.max(0, open),
        high: Math.max(0, high),
        low: Math.max(0, low),
        close: Math.max(0, close),
      });
      price = close;
    }

    series.setData(data);
    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [isDarkMode]);

  // Fixed draining logic: trigger final message when balance reaches 0
  useEffect(() => {
    if (draining && balance > 0) {
      const interval = setInterval(() => {
        setBalance((prev) => {
          const newBalance = prev > 10000 ? prev - 10000 : 0;
          return newBalance;
        });
      }, 500);

      return () => clearInterval(interval);
    } else if (draining && balance === 0) {
      // Show final message when balance reaches exactly 0
      const timeout = setTimeout(() => {
        setFullyDrained(true);
      }, 1000); // Small delay to show balance is 0
      
      return () => clearTimeout(timeout);
    }
  }, [draining, balance]);

  const handleTrade = (type: 'buy' | 'sell', orderType: 'market' | 'limit') => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return;

    // Check if funds are sufficient
    if (balance === 0) {
      setShowInsufficientBalance(true);
      // Auto-hide the popup after 3 seconds
      setTimeout(() => {
        setShowInsufficientBalance(false);
      }, 3000);
      return;
    }

    setBreachDetected(true);
    setDraining(true);

    const newOrder: Order = {
      id: Date.now().toString(),
      type,
      orderType,
      price: orderType === 'limit' ? parseFloat(limitPrice) : currentPrice,
      quantity: qty,
      timestamp: new Date(),
    };

    setOrders(prev => [newOrder, ...prev.slice(0, 4)]);
    setQuantity("");
    setLimitPrice("");
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Tour Component */}
      <Joyride
        key={tourKey}
        steps={tourSteps}
        run={runTour}
        callback={handleTourCallback}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        styles={{
          options: {
            arrowColor: "#ec4899",
            backgroundColor: isDarkMode ? "#1f2937" : "#ec4899",
            overlayColor: "rgba(236, 72, 153, 0.3)",
            primaryColor: "#ec4899",
            textColor: isDarkMode ? "#e5e7eb" : "#fff",
            width: 380,
            zIndex: 1000,
          },
          spotlight: {
            backgroundColor: "transparent",
            border: "2px solid #ec4899",
          },
        }}
        locale={{
          back: "← Back",
          close: "✕",
          last: "Experience the Hack!",
          next: "Next →",
          skip: "Skip Tour",
        }}
      />

      {/* Header */}
      <div className={`border rounded-lg p-4 mb-6 tour-welcome transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-pink-900/20 to-rose-900/20 border-pink-700' 
          : 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200'
      }`}>
        <div className="flex justify-between items-center">
          <div className="tour-educational-purpose">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              CryptoExchange Pro
            </h1>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Professional Trading Platform
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-red-400">
                <strong>⚠️ Security Simulation:</strong> Experience CEX vulnerability
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Educational demonstration of exchange security risks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className={`tour-theme-toggle p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDarkMode ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </motion.div>
            </Button>
            <Button
              onClick={startTour}
              className="tour-help-button bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🆘 Start Tour
            </Button>
            <div className={`text-right rounded-lg p-3 border tour-balance transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-pink-700' 
                : 'bg-white border-pink-200'
            }`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Balance
              </p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${balance.toLocaleString()}
              </p>
              <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                🏦 Held by Exchange
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <Card className={`tour-price-chart transition-colors duration-300 ${
            isDarkMode ? 'border-pink-700 bg-gray-800' : 'border-pink-200'
          }`}>
            <CardHeader className={`border-b transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-pink-900/20 border-pink-700' 
                : 'bg-pink-50 border-pink-200'
            }`}>
              <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                SOL/USDT
              </CardTitle>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-green-600">${currentPrice}</span>
                <span className="text-green-600 text-sm">+2.45%</span>
              </div>
              <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                📊 Live from exchange servers • 🔒 Seemingly secure...
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div ref={chartRef} className="w-full" />
            </CardContent>
          </Card>

          {/* Security Warning Panel */}
          <Card className={`mt-6 tour-security-warning transition-colors duration-300 ${
            isDarkMode ? 'border-red-700 bg-gray-800' : 'border-red-200'
          }`}>
            <CardHeader className={`border-b transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-red-900/20 border-red-700' 
                : 'bg-red-50 border-red-200'
            }`}>
              <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🚨 Security Risk Simulation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className={`border rounded-lg p-4 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-yellow-900/20 border-yellow-700' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start space-x-2">
                  <div className="text-yellow-600 text-lg">⚠️</div>
                  <div>
                    <div className={`font-semibold ${
                      isDarkMode ? 'text-yellow-400' : 'text-yellow-800'
                    }`}>
                      Educational Demo Alert
                    </div>
                    <div className={`text-sm mt-1 ${
                      isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                    }`}>
                      This simulation demonstrates how centralized exchanges can be compromised. 
                      Any trading action will trigger a security breach scenario showing fund drainage.
                    </div>
                    <div className={`text-xs mt-2 font-medium ${
                      isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`}>
                      🎓 Purpose: Learn about CEX risks • 💡 Takeaway: Self-custody importance
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className={`border rounded-lg p-3 transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-red-900/20 border-red-700' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="text-2xl font-bold text-red-600">$50,000</div>
                  <div className="text-sm text-red-600">At Risk</div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your exchange balance
                  </div>
                </div>
                <div className={`border rounded-lg p-3 transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-orange-900/20 border-orange-700' 
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="text-2xl font-bold text-orange-600">0.5s</div>
                  <div className="text-sm text-orange-600">Drain Speed</div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    $10K every half second
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trading Panel */}
        <div className="space-y-4">
          <Card className={`transition-colors duration-300 ${
            isDarkMode ? 'border-pink-700 bg-gray-800' : 'border-pink-200'
          }`}>
            <CardHeader className={`border-b transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-pink-900/20 border-pink-700' 
                : 'bg-pink-50 border-pink-200'
            }`}>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-black'}>
                Trading Panel
              </CardTitle>
              <p className="text-xs text-red-400">
                ⚠️ Any order triggers security breach simulation
              </p>
            </CardHeader>
            <CardContent className="p-4">
              {/* Custom Tabs */}
              <div className="w-full mb-4 tour-trading-tabs">
                <div className={`flex border-b ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <button
                    onClick={() => setActiveTab('market')}
                    className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-300 ${
                      activeTab === 'market'
                        ? 'border-pink-500 text-pink-400 bg-pink-900/20'
                        : isDarkMode 
                          ? 'border-transparent text-gray-400 hover:text-gray-300'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Market
                  </button>
                  <button
                    onClick={() => setActiveTab('limit')}
                    className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-300 ${
                      activeTab === 'limit'
                        ? 'border-pink-500 text-pink-400 bg-pink-900/20'
                        : isDarkMode 
                          ? 'border-transparent text-gray-400 hover:text-gray-300'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Limit
                  </button>
                </div>
              </div>
              
              {activeTab === 'market' && (
                <div className="space-y-4">
                  <div className="tour-quantity-input">
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Quantity (SOL)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter amount (e.g., 10)"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-black'
                      }`}
                    />
                    <div className="text-xs text-orange-400 mt-1">
                      ⚡ Entering any amount will trigger the breach simulation
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 tour-trade-buttons">
                    <Button 
                      onClick={() => handleTrade('buy', 'market')}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={!quantity}
                    >
                      🔓 Trigger Breach
                    </Button>
                    <Button 
                      onClick={() => handleTrade('sell', 'market')}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={!quantity}
                    >
                      🔓 Trigger Breach
                    </Button>
                  </div>
                </div>
              )}
              
              {activeTab === 'limit' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Price (USDT)
                    </label>
                    <input
                      type="number"
                      placeholder="85.00"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-black'
                      }`}
                    />
                  </div>
                  <div className="tour-quantity-input">
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Quantity (SOL)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter amount (e.g., 10)"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-black'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 tour-trade-buttons">
                    <Button 
                      onClick={() => handleTrade('buy', 'limit')}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={!quantity || !limitPrice}
                    >
                      🔓 Trigger Breach
                    </Button>
                    <Button 
                      onClick={() => handleTrade('sell', 'limit')}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={!quantity || !limitPrice}
                    >
                      🔓 Trigger Breach
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className={`tour-recent-orders transition-colors duration-300 ${
            isDarkMode ? 'border-pink-700 bg-gray-800' : 'border-pink-200'
          }`}>
            <CardHeader className={`border-b transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-pink-900/20 border-pink-700' 
                : 'bg-pink-50 border-pink-200'
            }`}>
              <CardTitle className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {orders.length === 0 ? (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No recent orders
                  </p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className={`text-xs p-2 rounded border-l-4 border-red-400 transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between">
                        <span className={order.type === 'buy' ? 'text-green-600' : 'text-red-600'}>
                          {order.type.toUpperCase()} {order.orderType}
                        </span>
                        <span className={isDarkMode ? 'text-white' : 'text-black'}>
                          {order.quantity} SOL
                        </span>
                      </div>
                      {order.price && (
                        <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                          @ ${order.price.toFixed(2)}
                        </div>
                      )}
                      <div className="text-red-400 text-xs mt-1">
                        ⚠️ Triggered security breach
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Small Security Breach Popup - Top Center */}
      <AnimatePresence>
        {breachDetected && !fullyDrained && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className={`w-80 border border-red-400 rounded-lg shadow-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
            }`}>
              <div className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-red-600">🔓</div>
                  <div className="flex-1">
                    <p className={`font-bold ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>
                      Security Breach Detected
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                      Unauthorized access detected...
                    </p>
                    <div className={`mt-2 w-full rounded-full h-2 ${
                      isDarkMode ? 'bg-red-800' : 'bg-red-200'
                    }`}>
                      <div 
                        className="bg-red-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${100 - (balance / 500)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-red-400 mt-1">
                      Funds draining: ${(50000 - balance).toLocaleString()} stolen
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insufficient Balance Popup - Top Right */}
      <AnimatePresence>
        {showInsufficientBalance && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`w-64 border border-orange-400 rounded-lg shadow-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'
            }`}>
              <div className="p-3">
                <div className="flex items-center space-x-2">
                  <div className="text-orange-600">⚠️</div>
                  <div>
                    <p className={`font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-800'}`}>
                      All Funds Drained
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                      Exchange completely compromised
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Hack Message */}
      <AnimatePresence>
        {fullyDrained && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className={`max-w-md border border-red-400 rounded-lg shadow-xl transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6 text-center">
                <div className="text-4xl mb-4">💥</div>
                <h2 className={`text-xl font-bold text-red-600 mb-2`}>
                  Exchange Hacked!
                </h2>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your exchange has been compromised. All $50,000 has been drained. 
                  This demonstrates why <strong>self-custody</strong> is crucial.
                </p>
                <div className={`border rounded p-3 mb-4 transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-yellow-900/20 border-yellow-700' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
                  }`}>
                    <strong>🎓 Learning Moment:</strong> This simulation shows real CEX risks. 
                    Always use hardware wallets for large amounts!
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={startTour}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    🆘 Restart Tour
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export with client-side only rendering
export default function CEXTradingDashboard() {
  return <CEXSecuritySimulationComponent />;
}
