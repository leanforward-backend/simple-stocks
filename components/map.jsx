"use client";

import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// API key from https://www.alphavantage.co/support/#api-key
const API_KEY = "CGW23NEDJEYTE2O1";

// Symbol format (no .INDX needed)
const COUNTRY_INDICES = {
  "United States": { symbol: "SPY", name: "S&P 500 (SPY ETF)" },
  Germany: { symbol: "EWG", name: "Germany (iShares MSCI Germany ETF)" },
  Japan: { symbol: "EWJ", name: "Japan (iShares MSCI Japan ETF)" },
  "United Kingdom": {
    symbol: "EWU",
    name: "UK (iShares MSCI United Kingdom ETF)",
  },
  France: { symbol: "EWQ", name: "France (iShares MSCI France ETF)" },
  Australia: { symbol: "EWA", name: "Australia (iShares MSCI Australia ETF)" },
  Canada: { symbol: "EWC", name: "Canada (iShares MSCI Canada ETF)" },
};

export const MapComponent = () => {
  const [marketData, setMarketData] = useState({});
  const [selectedYear, setSelectedYear] = useState(2023);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const fetchMarketData = async () => {
    setLoading(true);
    setError("");
    const data = {};
    const countries = Object.entries(COUNTRY_INDICES);
    setProgress({ current: 0, total: countries.length });

    for (let i = 0; i < countries.length; i++) {
      const [country, index] = countries[i];

      try {
        setProgress({ current: i + 1, total: countries.length });

        // Fetch URL
        const response = await fetch(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${index.symbol}&outputsize=full&apikey=${API_KEY}`
        );

        const apiData = await response.json();

        // Log the full response for debugging
        console.log(`Response for ${country}:`, apiData);

        const timeSeries = apiData["Time Series (Daily)"];

        if (!timeSeries) {
          console.error(
            `API error for ${country}:`,
            apiData.Note ||
              apiData["Error Message"] ||
              apiData.Information ||
              "Unknown error"
          );
          continue;
        }

        // Convert object to array and filter by year
        const yearData = Object.entries(timeSeries)
          .filter(([date]) => date.startsWith(selectedYear.toString()))
          .map(([date, values]) => ({
            date,
            close: values["4. close"],
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (yearData.length < 2) {
          console.warn(`Insufficient data for ${country} in ${selectedYear}`);
          continue;
        }

        const startPrice = Number.parseFloat(yearData[0].close);
        const endPrice = Number.parseFloat(yearData.at(-1).close);
        const yearlyPerformance = ((endPrice - startPrice) / startPrice) * 100;

        // Calculate monthly returns (same logic as before)
        const monthlyReturns = [];
        for (let j = 1; j < Math.min(yearData.length, 6); j++) {
          const prevPrice = Number.parseFloat(yearData[j - 1].close);
          const currPrice = Number.parseFloat(yearData[j].close);
          const monthReturn = ((currPrice - prevPrice) / prevPrice) * 100;
          monthlyReturns.push({
            symbol: `${index.name} ${yearData[j].date.substring(5, 7)}/${selectedYear}`,
            name: `Month ${j}`,
            change: monthReturn.toFixed(2),
          });
        }

        // Add delay to respect rate limits (5 calls/min)
        await new Promise((resolve) => setTimeout(resolve, 12_000)); // 12 seconds between calls

        monthlyReturns.sort(
          (a, b) => Number.parseFloat(b.change) - Number.parseFloat(a.change)
        );

        data[country] = {
          indexName: index.name,
          yearlyPerformance: yearlyPerformance.toFixed(2),
          topStocks: monthlyReturns.slice(0, 5),
        };

        console.log(`✓ ${country}: ${yearlyPerformance.toFixed(2)}%`);
      } catch (error) {
        console.error(`Error fetching data for ${country}:`, error);
      }
    }

    setMarketData(data);
    setLoading(false);
    setProgress({ current: 0, total: 0 });
  };

  // Automatically fetch data when component loads
  useEffect(() => {
    fetchMarketData();
  }, []);

  const getTooltipContent = (countryName) => {
    const data = marketData[countryName];
    if (!data) {
      return `${countryName}\n\nNo market data available`;
    }

    const perfColor =
      Number.parseFloat(data.yearlyPerformance) >= 0 ? "🟢" : "🔴";
    const perfSign = Number.parseFloat(data.yearlyPerformance) >= 0 ? "+" : "";

    let content = `📊 ${countryName} - ${data.indexName}\n`;
    content += `\n${selectedYear} Performance: ${perfColor} ${perfSign}${data.yearlyPerformance}%\n`;
    content += "\n📈 Best Monthly Returns:\n";

    data.topStocks.forEach((stock, idx) => {
      const icon = Number.parseFloat(stock.change) >= 0 ? "📈" : "📉";
      content += `${idx + 1}. ${stock.symbol}: ${icon} ${stock.change}%\n`;
    });

    return content;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-xl">Loading market data...</div>
          <div className="text-gray-600">
            Fetching {progress.current} of {progress.total} markets
          </div>
          <div className="mx-auto mt-4 h-2 w-64 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all duration-300"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-auto bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-bold text-3xl text-gray-800">
              Global Stock Market Performance
            </h1>
            <p className="mt-1 text-gray-600">
              Hover over countries • {Object.keys(marketData).length} markets
              loaded
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4 rounded-lg bg-white p-4 shadow-lg">
          <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="rounded bg-green-50 p-3">
              <div className="text-gray-600 text-sm">Markets Tracked</div>
              <div className="font-bold text-2xl text-green-600">
                {Object.keys(marketData).length}
              </div>
            </div>
            <div className="rounded bg-blue-50 p-3">
              <div className="text-gray-600 text-sm">Avg Performance</div>
              <div className="font-bold text-2xl text-blue-600">
                {Object.values(marketData).length > 0
                  ? (
                      Object.values(marketData).reduce(
                        (sum, m) =>
                          sum + Number.parseFloat(m.yearlyPerformance),
                        0
                      ) / Object.values(marketData).length
                    ).toFixed(2)
                  : "0"}
                %
              </div>
            </div>
            <div className="rounded bg-purple-50 p-3">
              <div className="text-gray-600 text-sm">Best Performer</div>
              <div className="font-bold text-lg text-purple-600">
                {Object.entries(marketData).length > 0
                  ? Object.entries(marketData).reduce(
                      (best, [country, data]) =>
                        Number.parseFloat(data.yearlyPerformance) >
                        Number.parseFloat(best.perf)
                          ? { name: country, perf: data.yearlyPerformance }
                          : best,
                      { name: "", perf: Number.NEGATIVE_INFINITY }
                    ).name
                  : "N/A"}
              </div>
            </div>
          </div>

          <ComposableMap projectionConfig={{ scale: 147 }}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name;
                  const hasData = marketData[countryName];
                  const performance = hasData
                    ? Number.parseFloat(
                        marketData[countryName].yearlyPerformance
                      )
                    : 0;

                  let fillColor = "#D1D5DB";
                  if (hasData) {
                    if (performance > 15) fillColor = "#10B981";
                    else if (performance > 5) fillColor = "#34D399";
                    else if (performance > 0) fillColor = "#6EE7B7";
                    else if (performance > -5) fillColor = "#FCA5A5";
                    else fillColor = "#EF4444";
                  }

                  return (
                    <Geography
                      data-tooltip-content={getTooltipContent(countryName)}
                      data-tooltip-id="country-tooltip"
                      geography={geo}
                      key={geo.rsmKey}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: "#FFFFFF",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        hover: {
                          fill: hasData ? "#1D4ED8" : "#9CA3AF",
                          stroke: "#FFFFFF",
                          strokeWidth: 0.5,
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "#1E40AF",
                          stroke: "#FFFFFF",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-2 font-bold text-gray-800">Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-500" />
              <span>&gt;15%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-300" />
              <span>5-15%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-200" />
              <span>0-5%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-300" />
              <span>-5-0%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-500" />
              <span>&lt;-5%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gray-300" />
              <span>No data</span>
            </div>
          </div>
        </div>
      </div>

      <Tooltip
        id="country-tooltip"
        style={{
          backgroundColor: "#1F2937",
          color: "#F9FAFB",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "13px",
          whiteSpace: "pre-line",
          zIndex: 1000,
          maxWidth: "320px",
          lineHeight: "1.6",
        }}
      />
    </div>
  );
};
