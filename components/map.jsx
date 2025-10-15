"use client";

import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export const MapComponent = () => {
  const [countryData, setCountryData] = useState({});
  const [tooltipContent, setTooltipContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data for all countries
    fetch("https://restcountries.com/v3.1/all")
      .then((response) => response.json())
      .then((data) => {
        // Create a map of country name to country data
        const dataMap = {};
        for (const country of data) {
          dataMap[country.name.common] = {
            name: country.name.common,
            capital: country.capital?.[0] || "N/A",
            population: country.population?.toLocaleString() || "N/A",
            region: country.region || "N/A",
            flag: country.flag || "",
          };
        }
        setCountryData(dataMap);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching country data:", error);
        setLoading(false);
      });
  }, []);

  const handleMouseEnter = (geo) => {
    const countryName = geo.properties.name;
    const data = countryData[countryName];

    if (data) {
      setTooltipContent(
        `${data.flag} ${data.name}
Capital: ${data.capital}
Population: ${data.population}
Region: ${data.region}`
      );
    } else {
      setTooltipContent(countryName);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl">Loading country data...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-center font-bold text-3xl text-gray-800">
          Interactive World Map
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Hover over countries to see information
        </p>

        <div className="rounded-lg bg-white p-4 shadow-lg">
          <ComposableMap
            projectionConfig={{
              scale: 147,
            }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    data-tooltip-content={tooltipContent}
                    data-tooltip-id="country-tooltip"
                    geography={geo}
                    key={geo.rsmKey}
                    onMouseEnter={() => handleMouseEnter(geo)}
                    style={{
                      default: {
                        fill: "#3B82F6",
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill: "#1D4ED8",
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
                ))
              }
            </Geographies>
          </ComposableMap>
        </div>
      </div>

      <Tooltip
        id="country-tooltip"
        style={{
          backgroundColor: "#1F2937",
          color: "#F9FAFB",
          borderRadius: "8px",
          padding: "12px",
          fontSize: "14px",
          whiteSpace: "pre-line",
          zIndex: 1000,
        }}
      />
    </div>
  );
};
