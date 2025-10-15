"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map countries to their major stock indices
const COUNTRY_INDICES = {
  "United States": { symbol: "^GSPC", name: "S&P 500" },
  "United Kingdom": { symbol: "^FTSE", name: "FTSE 100" },
  Germany: { symbol: "^GDAXI", name: "DAX" },
  France: { symbol: "^FCHI", name: "CAC 40" },
  Japan: { symbol: "^N225", name: "Nikkei 225" },
  Australia: { symbol: "^AXJO", name: "ASX 200" },
  Canada: { symbol: "^GSPTSE", name: "TSX Composite" },
  China: { symbol: "000001.SS", name: "SSE Composite" },
  India: { symbol: "^BSESN", name: "BSE Sensex" },
  Brazil: { symbol: "^BVSP", name: "Bovespa" },
  "South Korea": { symbol: "^KS11", name: "KOSPI" },
  Spain: { symbol: "^IBEX", name: "IBEX 35" },
  Italy: { symbol: "FTSEMIB.MI", name: "FTSE MIB" },
  Netherlands: { symbol: "^AEX", name: "AEX" },
  Switzerland: { symbol: "^SSMI", name: "SMI" },
};

export default function MapComponent() {
  const [marketData, setMarketData] = useState({});
  const [selectedYear, setSelectedYear] = useState(2023);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [showApiInput, setShowApiInput] = useState(true);

  const fetchMarketData = async (key) => {
    setLoading(true);
    const data = {};

    const mockCountryData = {
      "United States": {
        performance: 12.5,
        companies: [
          { symbol: "AAPL", name: "Apple Inc.", change: 15.2 },
          { symbol: "MSFT", name: "Microsoft", change: 8.7 },
          { symbol: "GOOGL", name: "Alphabet", change: -2.1 },
          { symbol: "AMZN", name: "Amazon", change: 22.8 },
          { symbol: "TSLA", name: "Tesla", change: -8.4 },
        ],
      },
      "United Kingdom": {
        performance: -3.2,
        companies: [
          { symbol: "BP.L", name: "BP", change: 5.1 },
          { symbol: "HSBA.L", name: "HSBC", change: -1.8 },
          { symbol: "ULVR.L", name: "Unilever", change: 2.3 },
          { symbol: "AZN.L", name: "AstraZeneca", change: 12.7 },
          { symbol: "RIO.L", name: "Rio Tinto", change: -7.9 },
        ],
      },
      Germany: {
        performance: 8.9,
        companies: [
          { symbol: "SAP.DE", name: "SAP", change: 14.2 },
          { symbol: "SIE.DE", name: "Siemens", change: 6.8 },
          { symbol: "DTE.DE", name: "Deutsche Telekom", change: 3.1 },
          { symbol: "BMW.DE", name: "BMW", change: -4.5 },
          { symbol: "VOW.DE", name: "Volkswagen", change: 11.3 },
        ],
      },
      France: {
        performance: 6.7,
        companies: [
          { symbol: "MC.PA", name: "LVMH", change: 18.9 },
          { symbol: "OR.PA", name: "L'Oréal", change: 7.2 },
          { symbol: "SAN.PA", name: "Sanofi", change: -2.8 },
          { symbol: "DG.PA", name: "Vinci", change: 4.6 },
          { symbol: "AIR.PA", name: "Airbus", change: 9.4 },
        ],
      },
      Japan: {
        performance: -1.8,
        companies: [
          { symbol: "7203.T", name: "Toyota", change: 3.7 },
          { symbol: "6758.T", name: "Sony", change: -5.2 },
          { symbol: "9984.T", name: "SoftBank", change: 8.9 },
          { symbol: "8306.T", name: "Mitsubishi UFJ", change: -3.1 },
          { symbol: "9432.T", name: "NTT", change: 1.4 },
        ],
      },
      Australia: {
        performance: 4.3,
        companies: [
          { symbol: "CBA.AX", name: "Commonwealth Bank", change: 6.8 },
          { symbol: "BHP.AX", name: "BHP Group", change: -2.4 },
          { symbol: "CSL.AX", name: "CSL Limited", change: 12.1 },
          { symbol: "WBC.AX", name: "Westpac", change: 3.9 },
          { symbol: "ANZ.AX", name: "ANZ Bank", change: -1.7 },
        ],
      },
      Canada: {
        performance: 2.1,
        companies: [
          { symbol: "RY.TO", name: "Royal Bank of Canada", change: 4.7 },
          { symbol: "TD.TO", name: "TD Bank", change: 1.8 },
          { symbol: "SHOP.TO", name: "Shopify", change: 15.3 },
          { symbol: "ENB.TO", name: "Enbridge", change: -3.6 },
          { symbol: "CP.TO", name: "Canadian Pacific", change: 7.2 },
        ],
      },
      China: {
        performance: -8.7,
        companies: [
          { symbol: "600036.SS", name: "China Merchants Bank", change: -5.4 },
          { symbol: "000858.SZ", name: "Wuliangye", change: 8.2 },
          { symbol: "600519.SS", name: "Kweichow Moutai", change: -12.1 },
          { symbol: "000001.SZ", name: "Ping An Insurance", change: 2.7 },
          { symbol: "600000.SS", name: "Shanghai Pudong Bank", change: -6.8 },
        ],
      },
      India: {
        performance: 18.4,
        companies: [
          { symbol: "RELIANCE.NS", name: "Reliance Industries", change: 22.1 },
          { symbol: "TCS.NS", name: "TCS", change: 15.8 },
          { symbol: "HDFCBANK.NS", name: "HDFC Bank", change: 8.3 },
          { symbol: "ICICIBANK.NS", name: "ICICI Bank", change: 12.7 },
          { symbol: "INFY.NS", name: "Infosys", change: -2.9 },
        ],
      },
      Brazil: {
        performance: -4.5,
        companies: [
          { symbol: "PETR4.SA", name: "Petrobras", change: 7.3 },
          { symbol: "VALE3.SA", name: "Vale", change: -8.9 },
          { symbol: "ITUB4.SA", name: "Itaú Unibanco", change: 2.1 },
          { symbol: "ABEV3.SA", name: "Ambev", change: -5.7 },
          { symbol: "BBDC4.SA", name: "Banco Bradesco", change: 3.4 },
        ],
      },
      "South Korea": {
        performance: 7.2,
        companies: [
          { symbol: "005930.KS", name: "Samsung Electronics", change: 9.8 },
          { symbol: "000660.KS", name: "SK Hynix", change: 15.4 },
          { symbol: "035420.KS", name: "NAVER", change: -3.2 },
          { symbol: "051910.KS", name: "LG Chem", change: 6.7 },
          { symbol: "006400.KS", name: "Samsung SDI", change: 11.2 },
        ],
      },
      Spain: {
        performance: 3.8,
        companies: [
          { symbol: "SAN.MC", name: "Banco Santander", change: 5.6 },
          { symbol: "TEF.MC", name: "Telefónica", change: -2.1 },
          { symbol: "IBE.MC", name: "Iberdrola", change: 8.3 },
          { symbol: "ITX.MC", name: "Inditex", change: 12.7 },
          { symbol: "REP.MC", name: "Repsol", change: -4.8 },
        ],
      },
      Italy: {
        performance: -1.3,
        companies: [
          { symbol: "ENI.MI", name: "ENI", change: 3.4 },
          { symbol: "ENEL.MI", name: "Enel", change: -6.7 },
          { symbol: "UCG.MI", name: "UniCredit", change: 8.9 },
          { symbol: "ISP.MI", name: "Intesa Sanpaolo", change: 2.1 },
          { symbol: "RACE.MI", name: "Ferrari", change: 14.5 },
        ],
      },
      Netherlands: {
        performance: 9.6,
        companies: [
          { symbol: "ASML.AS", name: "ASML Holding", change: 18.2 },
          { symbol: "INGA.AS", name: "ING Group", change: 7.8 },
          { symbol: "AD.AS", name: "Koninklijke Ahold", change: 4.3 },
          { symbol: "HEIA.AS", name: "Heineken", change: -1.9 },
          { symbol: "PHIA.AS", name: "Philips", change: 6.5 },
        ],
      },
      Switzerland: {
        performance: 11.2,
        companies: [
          { symbol: "NESN.SW", name: "Nestlé", change: 8.7 },
          { symbol: "NOVN.SW", name: "Novartis", change: 5.4 },
          { symbol: "ROG.SW", name: "Roche", change: 12.8 },
          { symbol: "UBSG.SW", name: "UBS", change: -3.1 },
          { symbol: "ABBN.SW", name: "ABB", change: 9.6 },
        ],
      },
    };

    // Note: This uses Alpha Vantage as an example (free tier: 25 requests/day)
    // For production, use FMP (250 requests/day) or Twelve Data (800 requests/day)

    for (const [country, index] of Object.entries(COUNTRY_INDICES)) {
      // Simulating API call - Replace with actual API
      // Example for Alpha Vantage:
      // const response = await fetch(
      //   `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${index.symbol}&apikey=${key}`
      // );

      try {
        const countryData = mockCountryData[country];
        if (countryData) {
          // Use realistic data
          data[country] = {
            indexName: index.name,
            yearlyPerformance: countryData.performance.toFixed(2),
            topStocks: countryData.companies.sort(
              (a, b) => b.change - a.change
            ),
          };
        } else {
          // Fallback for countries not in mock data
          const mockPerformance = Math.random() * 40 - 10;
          const mockTopStocks = [
            {
              symbol: "STOCK1",
              name: "Company One",
              change: (Math.random() * 50 - 10).toFixed(2),
            },
            {
              symbol: "STOCK2",
              name: "Company Two",
              change: (Math.random() * 50 - 10).toFixed(2),
            },
            {
              symbol: "STOCK3",
              name: "Company Three",
              change: (Math.random() * 50 - 10).toFixed(2),
            },
            {
              symbol: "STOCK4",
              name: "Company Four",
              change: (Math.random() * 50 - 10).toFixed(2),
            },
            {
              symbol: "STOCK5",
              name: "Company Five",
              change: (Math.random() * 50 - 10).toFixed(2),
            },
          ].sort(
            (a, b) => Number.parseFloat(b.change) - Number.parseFloat(a.change)
          );

          data[country] = {
            indexName: index.name,
            yearlyPerformance: mockPerformance.toFixed(2),
            topStocks: mockTopStocks,
          };
        }

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error fetching data for ${country}:`, error);
      }
    }

    setMarketData(data);
    setLoading(false);
  };

  const handleApiSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setShowApiInput(false);
      fetchMarketData(apiKey);
    }
  };

  const handleMouseEnter = (geo) => {
    const countryName = geo.properties.name;
    return countryName;
  };

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
    content += "\n🏆 Top 5 Performers:\n";

    data.topStocks.forEach((stock, idx) => {
      const icon = Number.parseFloat(stock.change) >= 0 ? "📈" : "📉";
      content += `${idx + 1}. ${stock.symbol} - ${icon} ${stock.change}%\n`;
    });

    return content;
  };

  if (showApiInput) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md rounded-lg border border-border bg-background p-8 shadow-lg">
          <h2 className="mb-4 font-bold text-2xl text-foreground">
            Setup Required
          </h2>
          <p className="mb-4 text-muted-foreground">
            This demo uses mock data. To use real data, get a free API key from:
          </p>
          <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground text-sm">
            <li>
              <strong>Financial Modeling Prep</strong> (250 req/day):
              financialmodelingprep.com
            </li>
            <li>
              <strong>Twelve Data</strong> (800 req/day): twelvedata.com
            </li>
            <li>
              <strong>Alpha Vantage</strong> (25 req/day): alphavantage.co
            </li>
          </ul>
          <form onSubmit={handleApiSubmit}>
            <Input
              className="variant-ghost mb-4 w-full rounded-lg border border-border bg-transparent px-4 py-2 text-blackfocus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key"
              type="text"
              value={apiKey}
              variant="ghost"
            />
            <Button
              className="w-full rounded-lg bg-primary py-2 text-primary-foreground transition hover:bg-primary/90"
              type="submit"
            >
              Continue with {apiKey ? "API Key" : "Mock Data"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-xl">Loading market data...</div>
          <div className="text-gray-600">
            Fetching {Object.keys(COUNTRY_INDICES).length} markets
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl text-foreground">
              Global Stock Market Performance
            </h1>
            <p className="mt-1 text-muted-foreground">
              Hover over countries to see market data
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* <label className="font-medium text-gray-700">Year:</label> */}
            <select
              className="rounded-lg border border-border bg-primary/90 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              value={selectedYear}
            >
              {[2023, 2022, 2021, 2020, 2019, 2018].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-lg bg-background p-4 shadow">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                  ? Object.entries(marketData)
                      .reduce(
                        (best, [country, data]) =>
                          Number.parseFloat(data.yearlyPerformance) >
                          Number.parseFloat(best.perf)
                            ? { name: country, perf: data.yearlyPerformance }
                            : best,
                        { name: "", perf: Number.NEGATIVE_INFINITY }
                      )
                      .name.substring(0, 12)
                  : "N/A"}
              </div>
            </div>
            <div className="rounded bg-orange-50 p-3">
              <div className="text-gray-600 text-sm">Data Source</div>
              <div className="font-bold text-lg text-orange-600">Mock Data</div>
            </div>
          </div>

          <ComposableMap
            projectionConfig={{
              scale: 147,
            }}
          >
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

                  // Color based on performance
                  let fillColor = "#D1D5DB";
                  if (hasData) {
                    if (performance > 15)
                      fillColor = "#10B981"; // Green
                    else if (performance > 5) fillColor = "#34D399";
                    else if (performance > 0) fillColor = "#6EE7B7";
                    else if (performance > -5) fillColor = "#FCA5A5";
                    else fillColor = "#EF4444"; // Red
                  }

                  return (
                    <Geography
                      data-tooltip-content={getTooltipContent(countryName)}
                      data-tooltip-id="country-tooltip"
                      geography={geo}
                      key={geo.rsmKey}
                      onMouseEnter={() => handleMouseEnter(geo)}
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

        <div className="rounded-lg bg-background p-4 shadow">
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
          maxWidth: "300px",
          lineHeight: "1.6",
        }}
      />
    </div>
  );
}
