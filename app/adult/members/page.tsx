"use client";

import React, { useState, useEffect } from "react";
import Spreadsheet from "react-spreadsheet";
import * as XLSX from "xlsx";
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement } from 'chart.js';
import { Alert, Snackbar } from "@mui/material";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement);

export default function FinancesTrackingPage() {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [data, setData] = useState(generateData(5, 5));
  const [isLoading, setIsLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState("pie");
  const [chartData, setChartData] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);

  function generateData(rows, cols) {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ value: "" }))
    );
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const formattedData = jsonData.map((row) =>
        row.map((cell) => ({ value: cell || "" }))
      );

      setData(formattedData);
      setRows(formattedData.length);
      setCols(formattedData[0]?.length || 0);
      updateChartData(formattedData);
      setIsLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  const updateChartData = (spreadsheetData) => {
    if (spreadsheetData.length < 2) return;

    setChartLoading(true);
    setTimeout(() => {
      const labels = spreadsheetData[0].map(cell => cell.value);
      const datasets = spreadsheetData[0].map((_, colIndex) => {
        return spreadsheetData.slice(1).reduce((sum, row) => {
          const value = parseFloat(row[colIndex]?.value);
          return sum + (isNaN(value) ? 0 : value);
        }, 0);
      });

      setChartData({
        labels,
        datasets: [
          {
            label: 'Data Representation',
            data: datasets,
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
            borderWidth: 1
          }
        ]
      });

      setChartLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (showChart) {
      if (!chartData) {
        setAlertOpen(true);
        setShowChart(false);
      } else {
        setChartLoading(true);
        updateChartData(data);
      }
    }
  }, [showChart]);

  return (
    <section className="h-screen flex flex-col">
      <div className="bg-white p-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">ServeWell</h1>
      </div>
      <div className="flex-1 flex flex-col bg-blue-500">
        <div className="bg-white rounded-lg shadow-md p-6 m-4 flex flex-col items-center overflow-auto w-full max-w-screen-lg mx-auto">
          <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="mb-4" />
          
          {isLoading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center w-full mb-4">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={showChart} onChange={() => setShowChart(!showChart)} className="mr-2" />
                  Show Chart
                </label>
              </div>

              {showChart && chartData ? (
                chartLoading ? (
                  <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="w-full h-96">
                    {chartType === "pie" && <Pie data={chartData} />}
                    {chartType === "bar" && <Bar data={chartData} />}
                    {chartType === "line" && <Line data={chartData} />}
                  </div>
                )
              ) : (
                <div className="w-full overflow-auto border border-gray-300 rounded-lg">
                  <Spreadsheet data={data} onChange={setData} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Snackbar open={alertOpen} autoHideDuration={3000} onClose={() => setAlertOpen(false)}>
        <Alert onClose={() => setAlertOpen(false)} severity="warning">
          Upload data before showing charts!
        </Alert>
      </Snackbar>
    </section>
  );
}
