"use client";

import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const API_KEY = "96dT7rbunW5ddozz10K564TXdtZSpGZ4";

// Using major index symbols that work with free tier
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const fetchMarketData = async () => {
    setLoading(true);
    setError("");
    const data = {};
    const countries = Object.entries(COUNTRY_INDICES);
    setProgress({ current: 0, total: countries.length });

    console.log("=== Starting FMP API Data Fetch (Free Tier) ===");
    console.log(`Total markets to fetch: ${countries.length}`);
    console.log("✓ Using /quote endpoint - available on free tier");

    for (let i = 0; i < countries.length; i++) {
      const [country, index] = countries[i];

      try {
        setProgress({ current: i + 1, total: countries.length });
        console.log(
          `\n[${i + 1}/${countries.length}] Fetching ${country} (${index.symbol})...`
        );

        // Use the quote endpoint which is available on free tier
        // This provides current price and day's change
        const url = `https://financialmodelingprep.com/api/v3/quote/${index.symbol}?apikey=${API_KEY}`;

        console.log(`Trying URL: ${url}`);

        const response = await fetch(url);
        const apiData = await response.json();

        console.log(
          `Raw Response for ${country}:`,
          JSON.stringify(apiData, null, 2)
        );

        // Check if we got an error message
        if (apiData["Error Message"] || apiData.error) {
          console.error(
            `❌ API error for ${country}:`,
            apiData["Error Message"] || apiData.error
          );
          continue;
        }

        // Quote endpoint returns an array with one object
        if (Array.isArray(apiData) && apiData.length > 0) {
          const quoteData = apiData[0];

          console.log(`✓ Received data for ${country}`);
          console.log(`  Price: $${quoteData.price}`);
          console.log(
            `  Change: ${quoteData.change} (${quoteData.changesPercentage}%)`
          );
          console.log(
            `  Day Range: $${quoteData.dayLow} - $${quoteData.dayHigh}`
          );
          console.log(
            `  52W Range: $${quoteData.yearLow} - $${quoteData.yearHigh}`
          );

          // Calculate year-to-date performance using yearLow and current price
          const ytdPerformance =
            quoteData.yearHigh && quoteData.yearLow
              ? ((quoteData.price - quoteData.yearLow) / quoteData.yearLow) *
                100
              : 0;

          // Create performance metrics from available data
          const performanceMetrics = [
            {
              symbol: `Today's Change`,
              name: "Daily Performance",
              change: quoteData.changesPercentage?.toFixed(2) || "0",
            },
            {
              symbol: "52W High Performance",
              name: "Vs 52W High",
              change: quoteData.yearHigh
                ? (
                    ((quoteData.price - quoteData.yearHigh) /
                      quoteData.yearHigh) *
                    100
                  ).toFixed(2)
                : "0",
            },
            {
              symbol: "52W Low Performance",
              name: "Vs 52W Low",
              change: quoteData.yearLow
                ? (
                    ((quoteData.price - quoteData.yearLow) /
                      quoteData.yearLow) *
                    100
                  ).toFixed(2)
                : "0",
            },
            {
              symbol: "Market Cap",
              name: "Market Cap",
              change: quoteData.marketCap
                ? `${(quoteData.marketCap / 1e9).toFixed(2)}B`
                : "N/A",
            },
            {
              symbol: "Volume",
              name: "Volume",
              change: quoteData.volume
                ? `${(quoteData.volume / 1e6).toFixed(2)}M`
                : "N/A",
            },
          ];

          data[country] = {
            indexName: index.name,
            yearlyPerformance: quoteData.changesPercentage?.toFixed(2) || "0",
            ytdPerformance: ytdPerformance.toFixed(2),
            currentPrice: quoteData.price?.toFixed(2) || "0",
            topStocks: performanceMetrics,
          };

          console.log(
            `✅ ${country}: ${quoteData.changesPercentage?.toFixed(2)}% (Daily)`
          );
        } else {
          console.error(`❌ Unexpected response format for ${country}`);
          continue;
        }

        // Rate limiting: free tier allows 5 calls per minute
        if (i < countries.length - 1) {
          console.log(
            "Waiting 12 seconds for rate limit (free tier: 5 calls/min)..."
          );
          await new Promise((resolve) => setTimeout(resolve, 12_000));
        }
      } catch (error) {
        console.error(`❌ Error fetching data for ${country}:`, error);
        console.error("Error details:", error.message);
      }
    }

    console.log("\n=== Final Market Data ===");
    console.log(JSON.stringify(data, null, 2));
    console.log(`\nSuccessfully loaded ${Object.keys(data).length} markets`);

    if (Object.keys(data).length === 0) {
      setError(
        "⚠️ Unable to fetch data. Possible reasons:\n" +
          "• Free tier daily limit (250 calls) reached\n" +
          "• API key may need activation (check FMP dashboard)\n" +
          "• Network connectivity issues\n\n" +
          "Try again later or check your API key status."
      );
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
    content += `\nCurrent Price: $${data.currentPrice}\n`;
    content += `Today's Performance: ${perfColor} ${perfSign}${data.yearlyPerformance}%\n`;
    content += `YTD from 52W Low: ${perfSign}${data.ytdPerformance}%\n`;
    content += "\n📈 Market Metrics:\n";

    data.topStocks.forEach((metric, idx) => {
      content += `${idx + 1}. ${metric.name}: ${metric.change}\n`;
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
          <p className="mt-2 text-gray-500 text-sm">
            Using free tier endpoints (12s delay between calls)
          </p>
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
              loaded • Live data
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 whitespace-pre-line rounded-lg bg-red-50 p-4 text-red-700">
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
              <div className="text-gray-600 text-sm">Avg Daily Change</div>
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
                    // Using daily performance for coloring
                    if (performance > 2) fillColor = "#10B981";
                    else if (performance > 0.5) fillColor = "#34D399";
                    else if (performance > 0) fillColor = "#6EE7B7";
                    else if (performance > -0.5) fillColor = "#FCA5A5";
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
          <h3 className="mb-2 font-bold text-gray-800">
            Legend (Daily Performance)
          </h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-500" />
              <span>&gt;2%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-300" />
              <span>0.5-2%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-200" />
              <span>0-0.5%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-300" />
              <span>-0.5-0%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-500" />
              <span>&lt;-0.5%</span>
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
