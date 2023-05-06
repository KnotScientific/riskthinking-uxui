"use client";

import Leaflet from "leaflet";
import useSWR from "swr";
import * as Papa from "papaparse";
import { Marker, Popup, MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";

const icon = (n) =>
  Leaflet.icon({
    iconUrl: `/marker${n}.png`,
    shadowUrl: "/marker-shadow.png",
  });

enum Order {
  ASC = 1,
  DESC = -1,
}

const RiskMap = () => {
  const [data, setData] = useState([]);
  const [year, setYear] = useState(2030);
  const [filterOpen, setFilterOpen] = useState(false);
  const [inputYear, setInputYear] = useState(2030);
  const [set, setSet] = useState(new Set());
  const [sortKey, setSortKey] = useState("businessCategory");
  const [sortOrder, setSortOrder] = useState(Order.DESC); //Ascending = 1; Descending = -1

  const [filter, setFilter] = useState<Object<number[]>>({
    Drought: [0, 1],
    Earthquake: [0, 1],
    "Extreme cold": [0, 1],
    "Extreme heat": [0, 1],
    Flooding: [0, 1],
    Hurricane: [0, 1],
    "Sea level rise": [0, 1],
    Tornado: [0, 1],
    Volcano: [0, 1],
    Wildfire: [0, 1],
  });

  const [finalFilter, setFinalFilter] = useState<Object<number[]>>({
    Drought: [0, 1],
    Earthquake: [0, 1],
    "Extreme cold": [0, 1],
    "Extreme heat": [0, 1],
    Flooding: [0, 1],
    Hurricane: [0, 1],
    "Sea level rise": [0, 1],
    Tornado: [0, 1],
    Volcano: [0, 1],
    Wildfire: [0, 1],
  });

  const handleFilter = (
    event: Event,
    newValue: number | number[],
    factor: string
  ) => {
    setFilter((prev) => ({ ...prev, [factor]: newValue as number[] }));
  };

  const setSort = (key, order) => {
    setSortKey(key);
    setSortOrder(order);
  };

  const filterFunc = (arr) =>
    Object.keys(arr.riskFactors).every(
      (val) =>
        parseFloat(arr.riskFactors[val]) >= finalFilter[val][0] &&
        parseFloat(arr.riskFactors[val]) <= finalFilter[val][1]
    );

  useEffect(() => {
    if (!filterOpen) {
      setFinalFilter((prev) => ({ ...prev, ...filter }));
    }
  }, [filterOpen]);

  const fetcher = (...args) =>
    fetch(...args)
      .then((res) => res.text())
      .then((file) =>
        Papa.parse(file, {
          complete: function (results) {
            setData([
              ...data,
              ...results.data.slice(1).map((v, ix) => ({
                assetName: v[0],
                lat: v[1],
                long: v[2],
                businessCategory: v[3],
                riskRating: v[4],
                riskFactors: JSON.parse(v[5]),
                year: v[6],
              })),
            ]);
          },
        })
      )
      .catch((err) => console.log(err));

  const { csv, error } = useSWR(
    "/UI_UX Developer Work Sample Data - sample_data.csv",
    fetcher
  );

  const openFilter = () => setFilterOpen((prev) => !prev);

  if (error) return <div>Failed to load</div>;

  return (
    <div
      style={{
        // width: "100%",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div>
          <label>
            Enter Decade:
            <input
              className="rounded-md ml-4 p-1"
              type="number"
              name="Decade"
              step="10"
              placeholder={year.toString()}
              value={inputYear}
              onChange={(e) => setInputYear(e.target.value)}
            />
          </label>
          <input
            className="border border-slate-300 rounded-md hover:border-sky-950 bg-green-400 m-4 p-1 cursor-pointer"
            type="submit"
            value="Submit"
            onClick={() => {
              setInputYear(Math.floor(inputYear / 10) * 10);
              setYear(Math.floor(inputYear / 10) * 10);
            }}
          />
        </div>
        <MapContainer center={[40, -95]} zoom={4} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data && data.length ? (
            data
              .filter((d) => parseInt(d.year) % year < 10)
              .map((v, ix) => (
                <Marker
                  eventHandlers={{
                    mouseover: (event) => event.target.openPopup(),
                  }}
                  key={ix}
                  position={[parseFloat(v.lat), parseFloat(v.long)]}
                  icon={icon(Math.ceil(v.riskRating / 0.25))}
                >
                  <Popup>
                    <p>
                      <strong>Asset Name:</strong> {v.assetName}
                    </p>
                    <p>
                      <strong>Business Category:</strong> {v.businessCategory}
                    </p>
                  </Popup>
                </Marker>
              ))
          ) : (
            <></>
          )}
        </MapContainer>
      </div>
      <table className="table-auto border-4 border-black mt-4">
        <thead>
          <tr className="border-2 border-black">
            <th
              onClick={() => setSort("assetName", sortOrder * -1)}
              className="border-2 border-black cursor-pointer"
            >
              Asset Name{" "}
              {sortKey === "assetName"
                ? sortOrder === Order.ASC
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              onClick={() => setSort("lat", sortOrder * -1)}
              className="border-2 border-black cursor-pointer"
            >
              Lat{" "}
              {sortKey === "lat" ? (sortOrder === Order.ASC ? "▲" : "▼") : ""}
            </th>
            <th
              onClick={() => setSort("long", sortOrder * -1)}
              className="border-2 border-black cursor-pointer	"
            >
              Long{" "}
              {sortKey === "long" ? (sortOrder === Order.ASC ? "▲" : "▼") : ""}
            </th>
            <th
              onClick={() => setSort("businessCategory", sortOrder * -1)}
              className="border-2 border-black cursor-pointer	"
            >
              Business Category{" "}
              {sortKey === "businessCategory"
                ? sortOrder === Order.ASC
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th
              onClick={() => setSort("riskRating", sortOrder * -1)}
              className="border-2 border-black cursor-pointer	"
            >
              Risk Rating{" "}
              {sortKey === "riskRating"
                ? sortOrder === Order.ASC
                  ? "▲"
                  : "▼"
                : ""}
            </th>
            <th className="border-2 border-black cursor-pointer	">
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <p>Risk Factors</p>
                  <p onClick={openFilter}>🎚️</p>
                </div>
                {!filterOpen ? (
                  <></>
                ) : (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <label id="drought">Drought</label>
                      <div style={{ width: "50%" }}>
                        <Slider
                          max={1}
                          min={0}
                          step={0.01}
                          size={"small"}
                          getAriaLabel={() => "Drought"}
                          value={filter["Drought"]}
                          onChange={(e, v) => handleFilter(e, v, "Drought")}
                          valueLabelDisplay="auto"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <label id="earthquake">Earthquake</label>
                      <div style={{ width: "50%" }}>
                        <Slider
                          max={1}
                          min={0}
                          step={0.01}
                          size={"small"}
                          getAriaLabel={() => "Earthquake"}
                          value={filter["Earthquake"]}
                          onChange={(e, v) => handleFilter(e, v, "Earthquake")}
                          valueLabelDisplay="auto"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <label id="extreme-cold">Extreme cold</label>
                      <div style={{ width: "50%" }}>
                        <Slider
                          max={1}
                          min={0}
                          step={0.01}
                          size={"small"}
                          getAriaLabel={() => "Extreme cold"}
                          value={filter["Extreme cold"]}
                          onChange={(e, v) =>
                            handleFilter(e, v, "Extreme cold")
                          }
                          valueLabelDisplay="auto"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <label id="extreme-heat">Extreme heat</label>
                      <div style={{ width: "50%" }}>
                        <Slider
                          max={1}
                          min={0}
                          step={0.01}
                          size={"small"}
                          getAriaLabel={() => "Extreme heat"}
                          value={filter["Extreme heat"]}
                          onChange={(e, v) =>
                            handleFilter(e, v, "Extreme heat")
                          }
                          valueLabelDisplay="auto"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <label id="flooding">Flooding</label>
                      <div style={{ width: "50%" }}>
                        <Slider
                          max={1}
                          min={0}
                          step={0.01}
                          size={"small"}
                          getAriaLabel={() => "Flooding"}
                          value={filter["Flooding"]}
                          onChange={(e, v) => handleFilter(e, v, "Flooding")}
                          valueLabelDisplay="auto"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <label id="hurricane">Hurricane</label>
                      <div style={{ width: "50%" }}>
                        <Slider
                          max={1}
                          min={0}
                          step={0.01}
                          size={"small"}
                          getAriaLabel={() => "Hurricane"}
                          value={filter["Hurricane"]}
                          onChange={(e, v) => handleFilter(e, v, "Hurricane")}
                          valueLabelDisplay="auto"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <label id="sea-level-rise">Sea level rise</label>
                      <div style={{ width: "50%" }}>
                        <Slider
                          max={1}
                          min={0}
                          step={0.01}
                          size={"small"}
                          getAriaLabel={() => "Sea level rise"}
                          value={filter["Sea level rise"]}
                          onChange={(e, v) =>
                            handleFilter(e, v, "Sea level rise")
                          }
                          valueLabelDisplay="auto"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <label id="tornado">Tornado</label>
                      <div style={{ width: "50%" }}>
                        <Slider
                          max={1}
                          min={0}
                          step={0.01}
                          size={"small"}
                          getAriaLabel={() => "Tornado"}
                          value={filter["Tornado"]}
                          onChange={(e, v) => handleFilter(e, v, "Tornado")}
                          valueLabelDisplay="auto"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <label id="volcano">Volcano</label>
                      <div style={{ width: "50%" }}>
                        <Slider
                          max={1}
                          min={0}
                          step={0.01}
                          size={"small"}
                          getAriaLabel={() => "volcano"}
                          value={filter["Volcano"]}
                          onChange={(e, v) => handleFilter(e, v, "Volcano")}
                          valueLabelDisplay="auto"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <label id="wildfire">Wildfire</label>
                      <div style={{ width: "50%" }}>
                        <Slider
                          max={1}
                          min={0}
                          step={0.01}
                          size={"small"}
                          getAriaLabel={() => "Wildfire"}
                          value={filter["Wildfire"]}
                          onChange={(e, v) => handleFilter(e, v, "Wildfire")}
                          valueLabelDisplay="auto"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </th>
            <th
              onClick={() => setSort("year", sortOrder * -1)}
              className="border-2 border-black cursor-pointer	"
            >
              Year{" "}
              {sortKey === "year" ? (sortOrder === Order.ASC ? "▲" : "▼") : ""}
            </th>
          </tr>
        </thead>
        <tbody>
          {data && data.length ? (
            data
              .filter((d) => parseInt(d.year) % year < 10)
              .filter(filterFunc)
              .sort((a, b) => {
                if (a[sortKey] < b[sortKey]) {
                  return -1 * sortOrder;
                }
                if (a[sortKey] > b[sortKey]) {
                  return 1 * sortOrder;
                }
                return 0;
              })
              .map((v, ix) => (
                <tr key={ix} className="border-2 border-black">
                  <td className="border-2 border-black p-1">{v.assetName}</td>
                  <td className="border-2 border-black p-1">{v.lat}</td>
                  <td className="border-2 border-black p-1">{v.long}</td>
                  <td className="border-2 border-black p-1">
                    {v.businessCategory}
                  </td>
                  <td className="border-2 border-black p-1">{v.riskRating}</td>
                  <td className="border-2 border-black p-1">
                    {Object.entries(v.riskFactors).map((obj, ix) => (
                      <p>
                        {obj[0]}:{obj[1]}
                      </p>
                    ))}
                  </td>
                  <td className="border-2 border-black p-1">{v.year}</td>
                </tr>
              ))
          ) : (
            <></>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RiskMap;
