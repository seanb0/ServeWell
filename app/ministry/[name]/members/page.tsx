"use client";

import React, { useState, useEffect, useCallback } from "react";
import Spreadsheet from "react-spreadsheet";
import * as XLSX from "xlsx";
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement } from 'chart.js';
import { Alert, Snackbar, Menu, MenuItem } from "@mui/material";
import clsx from "clsx";
import "@/app/globals.css";
import { FaSearch, FaEnvelope, FaUsers } from 'react-icons/fa';
import { useRouter } from "next/navigation"; 
import { usePathname } from "next/navigation";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement);

export default function FinancesTrackingPage() {
    const [data, setData] = useState(() => generateData(5, 5));
    const [charts, setCharts] = useState([]);
    const [activeChart, setActiveChart] = useState(null);
    const [chartName, setChartName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chartLoading, setChartLoading] = useState(false);
    const [showChart, setShowChart] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [switchingView, setSwitchingView] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [chartType, setChartType] = useState("pie");
    const [chartData, setChartData] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [originalData, setOriginalData] = useState(null);
    const router = useRouter();
    const pathname = usePathname();
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [contactMessage, setContactMessage] = useState('');
    const [memberListOpen, setMemberListOpen] = useState(false);
    const [emailServiceModalOpen, setEmailServiceModalOpen] = useState(false);
    const [emailRecipient, setEmailRecipient] = useState(null);
    const [memberSearchQuery, setMemberSearchQuery] = useState("");

    // Function to generate initial data with specified rows and columns
    function generateData(rows, cols) {
        return Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => ({ value: "" }))
        );
    }

    const createNewChart = () => {
        if (!chartName.trim()) {
            setAlertOpen(true); // Show an alert if the name is empty
            return;
        }
    
        const newChart = {
            id: Date.now(),
            name: chartName.trim(),
            data: generateData(5, 5), // Initialize with a 5x5 grid
            chartType: "pie",
            chartData: null,
        };
    
        setCharts([...charts, newChart]);
        setActiveChart(newChart.id);
        setChartName("");
    };
    
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const formattedData = jsonData.map((row) =>
                row.map((cell) => ({ value: cell || "" }))
            );

            if (!activeChart) {
                // Generate automatic chart name
                const nextChartNumber = charts.length + 1;
                const newChartName = `Member Chart ${nextChartNumber}`;
                const newChart = {
                    id: Date.now(),
                    name: newChartName,
                    data: formattedData,
                    chartType: "pie",
                    chartData: null,
                };
                setCharts([...charts, newChart]);
                setActiveChart(newChart.id);
                updateChartData(newChart.id, formattedData);
            } else {
                setCharts(prevCharts => prevCharts.map(chart =>
                    chart.id === activeChart ? { ...chart, data: formattedData } : chart
                ));
                updateChartData(activeChart, formattedData);
            }
            setIsLoading(false);
        };

        reader.readAsArrayBuffer(file);
    };

    const handleSaveClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const saveToComputer = () => {
        if (activeChart) {
            const activeChartData = charts.find(chart => chart.id === activeChart);
            if (!activeChartData) return null; // Prevents errors
            const worksheetData = activeChartData.data.map(row => row.map(cell => cell.value));
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, `${charts.find(chart => chart.id === activeChart).name}.xlsx`);
        }
        handleClose();
    };

    const saveToCloud = async () => {
        if (activeChart) {
            const activeChartData = charts.find(chart => chart.id === activeChart);
            if (!activeChartData) return;
    
            const pathSegments = pathname.split('/');
            const ministry = pathSegments[2] || "defaultMinistry";
            const pageType = pathSegments[3] || "defaultPageType";
            const tabName = activeChartData.name; // Use the existing tab name
    
            if (!tabName) {
                alert("❌ Tab name is missing.");
                return;
            }
    
            console.log("📤 Uploading file for", ministry, "-", pageType, ":", tabName);
    
            const worksheetData = activeChartData.data.map(row => row.map(cell => cell.value));
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
            const fileBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([fileBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    
            const formData = new FormData();
            const file = new File([blob], `${tabName}.xlsx`, { type: blob.type });
    
            formData.append("file", file);
            formData.append("tab_name", tabName);
            formData.append("ministry", ministry);
            formData.append("page_type", pageType);
    
            try {
                const response = await fetch("/api/files", {
                    method: "POST",
                    body: formData,
                });
    
                const text = await response.text();
                const result = JSON.parse(text);
    
                if (result.success) {
                    console.log("✅ File uploaded successfully");
                    alert("✅ File uploaded successfully!");
                } else {
                    console.error("❌ Upload failed:", result.error);
                    alert("❌ Upload failed! " + result.error);
                }
            } catch (error) {
                console.error("❌ Error saving file:", error);
                alert("❌ Error saving file. See console for details.");
            }
        }
    };    
    
    const updateChartData = (chartId, spreadsheetData) => {
        console.log("📊 Received Data in updateChartData:", spreadsheetData);  // Confirm input
        if (spreadsheetData.length < 2) {
            console.warn("⚠️ Not enough data to update chart.");
            return;
        }
    
        const labels = spreadsheetData[0].map(cell => cell.value);
        const datasets = spreadsheetData[0].map((_, colIndex) =>
            spreadsheetData.slice(1).reduce((sum, row) => {
                const value = parseFloat(row[colIndex]?.value);
                return sum + (isNaN(value) ? 0 : value);
            }, 0)
        );
    
        console.log("📈 Labels:", labels);
        console.log("📊 Datasets:", datasets);
    
        setCharts(prevCharts => {
            console.log("📌 Previous Charts Before Update:", prevCharts); // Debugging previous state
    
            const updatedCharts = prevCharts.map(chart =>
                chart.id === chartId
                    ? {
                        ...chart,
                        chartData: {
                            labels,
                            datasets: [{
                                label: 'Data Representation',
                                data: datasets,
                                backgroundColor: ['rgba(255,99,132,0.2)', 'rgba(54,162,235,0.2)', 'rgba(255,206,86,0.2)'],
                                borderColor: ['rgba(255,99,132,1)', 'rgba(54,162,235,1)', 'rgba(255,206,86,1)'],
                                borderWidth: 1
                            }]
                        }
                    }
                    : chart
            );
    
            console.log("✅ Updated Charts:", updatedCharts); // Debugging updated state
            return updatedCharts;
        });
    };
    

    const handleChartTypeChange = (chartId, type) => {
        setChartLoading(true);
        setTimeout(() => {
            setCharts(prevCharts => prevCharts.map(chart =>
                chart.id === chartId ? { ...chart, chartType: type } : chart
            ));
            setChartLoading(false);
        }, 300);
    };
    
    const deleteChart = async (chartId, tabName) => {
        const pathSegments = pathname.split('/');
        const ministry = pathSegments[2] || "defaultMinistry";
        const pageType = pathSegments[3] || "defaultPageType";
    
        if (!tabName) {
            alert("❌ Tab name is missing.");
            return;
        }
    
        try {
            const response = await fetch("/api/files", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tab_name: tabName, ministry, page_type: pageType }),
            });
    
            const result = await response.json();
    
            if (result.success) {
                console.log("✅ File deleted successfully");
    
                setCharts(prevCharts => {
                    const updatedCharts = prevCharts.filter(chart => chart.id !== chartId);
                    
                    // Ensure we set a new active chart if the deleted chart was active
                    if (activeChart === chartId) {
                        setActiveChart(updatedCharts.length > 0 ? updatedCharts[0].id : null);
                    }
    
                    return updatedCharts;
                });
    
            } else {
                console.error("❌ Delete failed:", result.error);
                alert("❌ Delete failed! " + result.error);
            }
        } catch (error) {
            console.error("❌ Error deleting file:", error);
            alert("❌ Error deleting file. See console for details.");
        }
    };
    
    
    useEffect(() => {
        console.log("✅ useEffect is running");
    
        const pathSegments = pathname.split('/');
        const ministry = pathSegments[2] || "defaultMinistry";
        const pageType = pathSegments[3] || "defaultPageType";
    
        console.log(`📢 Fetching files for: Ministry = ${ministry}, Page Type = ${pageType}`);
    
        fetchStoredFiles(ministry, pageType);
    }, [router.isReady]);
    
    const fetchStoredFiles = async (ministry, pageType) => {
        const apiURL = `/api/files?ministry=${encodeURIComponent(ministry)}&page_type=${encodeURIComponent(pageType)}`;
    
        console.log("🌍 Attempting API request:", apiURL);
    
        try {
            const response = await fetch(apiURL);
            console.log("📡 Response Status:", response.status);
    
            if (!response.ok) {
                console.error(`❌ API Request Failed: ${response.statusText}`);
                return;
            }
    
            const result = await response.json();
            console.log("✅ API Response:", result);
    
            if (!result.success || !result.files) {
                console.warn("⚠️ No valid file data found.");
                return;
            }
    
            const newCharts = result.files.map((file, index) => {
                const byteCharacters = atob(file.fileData);
                const byteArray = new Uint8Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteArray[i] = byteCharacters.charCodeAt(i);
                }
    
                const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                const fileReader = new FileReader();
    
                return new Promise((resolve) => {
                    fileReader.onload = (e) => {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: "array" });
    
                        if (!workbook.SheetNames.length) {
                            console.error("❌ No sheets found in workbook.");
                            return;
                        }
    
                        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
                        const formattedData = jsonData.map(row =>
                            row.map(cell => ({ value: cell || "" }))
                        );
    
                        resolve({
                            id: Date.now() + index,
                            name: file.tabName || `Member Chart ${index + 1}`,
                            data: formattedData,
                            chartType: "pie",
                            chartData: null,
                        });
                    };
    
                    fileReader.readAsArrayBuffer(blob);
                });
            });
    
            const loadedCharts = await Promise.all(newCharts);
            setCharts(loadedCharts);
            if (loadedCharts.length > 0) {
                setActiveChart(loadedCharts[0].id);
            }
    
        } catch (error) {
            console.error("❌ Error fetching stored files:", error);
            alert(`Error fetching files: ${error.message}`);
        }
    }; 
    
    const toggleChart = () => {
        if (!activeChart || !charts.find(chart => chart.id === activeChart).data ||
            charts.find(chart => chart.id === activeChart).data.length === 0 ||
            charts.find(chart => chart.id === activeChart).data.every(row => row.every(cell => cell.value === ""))) {
            setAlertOpen(true);
            return;
        }

        setSwitchingView(true);
        setTimeout(() => {
            setShowChart(!showChart);
            setSwitchingView(false);
        }, 500);
    };

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
    );

    // Function to add a new row to the spreadsheet data
    const addRow = () => {
        if (activeChart) {
            setCharts(prevCharts =>
                prevCharts.map(chart =>
                    chart.id === activeChart
                        ? {
                            ...chart,
                            data: [...chart.data, Array(chart.data[0].length).fill({ value: "" })],
                        }
                        : chart
                )
            );
        }
    };

    // Function to add a new column to the spreadsheet data
    const addColumn = () => {
        if (activeChart) {
            setCharts(prevCharts =>
                prevCharts.map(chart =>
                    chart.id === activeChart
                        ? {
                            ...chart,
                            data: chart.data.map(row => [...row, { value: "" }]),
                        }
                        : chart
                )
            );
        }
    };

    // Update filtered data whenever search query changes
    useEffect(() => {
        if (!activeChart || !charts.find(chart => chart.id === activeChart)?.data) {
            return;
        }

        const currentChart = charts.find(chart => chart.id === activeChart);
        
        if (!searchQuery.trim()) {
            // If no search query, show all data
            setFilteredData(currentChart.data);
            return;
        }

        const searchTerm = searchQuery.toLowerCase();
        
        // Filter and highlight matching data
        const filtered = currentChart.data.filter(row =>
            row.some(cell => 
                cell.value?.toString().toLowerCase().includes(searchTerm)
            )
        ).map(row =>
            row.map(cell => ({
                ...cell,
                className: cell.value?.toString().toLowerCase().includes(searchTerm)
                    ? "bg-yellow-200"
                    : ""
            }))
        );

        setFilteredData(filtered);
    }, [searchQuery, activeChart, charts]);
    

    const handleContactMember = (rowIndex) => {
        if (!activeChart) return;
        
        const currentData = charts.find(chart => chart.id === activeChart).data;
        if (!currentData || !currentData[rowIndex]) return;
        
        // Get member's email
        const memberEmail = currentData[rowIndex][1]?.value || '';
        const memberName = currentData[rowIndex][0]?.value || '';
        
        if (!memberEmail) {
            alert("This member doesn't have an email address.");
            return;
        }
        
        // Close the member list modal and open email service selection modal
        setMemberListOpen(false);
        setEmailRecipient({
            email: memberEmail,
            name: memberName
        });
        setEmailServiceModalOpen(true);
    };
    
    const openMemberList = () => {
        setMemberListOpen(true);
    };
    
    const handleSendEmail = async () => {
        if (!selectedMember || !contactMessage.trim()) {
            alert("Please enter a message");
            return;
        }
        
        try {
            setIsLoading(true);
            
            // Here you would integrate with your actual email service
            const response = await fetch('/api/contact/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: selectedMember.email,
                    message: contactMessage,
                    memberName: selectedMember.name
                }),
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`Email sent to ${selectedMember.name} successfully!`);
                setContactModalOpen(false);
                setContactMessage('');
            } else {
                alert(`Error: ${result.error || 'Failed to send email'}`);
            }
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Failed to send email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Add this function to get alphabetically sorted members
    const getSortedMembers = () => {
        if (!activeChart) return [];
        
        const currentData = charts.find(chart => chart.id === activeChart).data;
        if (!currentData) return [];
        
        // Filter out rows without names and create member objects
        const members = currentData
            .filter(row => row[0]?.value)
            .map((row, index) => ({
                name: row[0]?.value || '',
                email: row[1]?.value || '',
                rowIndex: index
            }));
        
        // Sort alphabetically by name
        return members.sort((a, b) => 
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
    };

    const openEmailService = (service) => {
        if (!emailRecipient) return;
        
        // Create email parameters
        const subject = encodeURIComponent(`Message from ServeWell`);
        const body = encodeURIComponent(`Dear ${emailRecipient.name},\n\n`);
        
        let emailUrl;
        
        switch (service) {
            case "gmail":
                emailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailRecipient.email)}&su=${subject}&body=${body}`;
                break;
            case "yahoo":
                emailUrl = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(emailRecipient.email)}&subject=${subject}&body=${body}`;
                break;
            case "outlook":
                emailUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(emailRecipient.email)}&subject=${subject}&body=${body}`;
                break;
            case "default":
                emailUrl = `mailto:${encodeURIComponent(emailRecipient.email)}?subject=${subject}&body=${body}`;
                break;
        }
        
        // Open the email service in a new tab
        window.open(emailUrl, '_blank');
        
        // Close the modal
        setEmailServiceModalOpen(false);
    };

    return (
        <section className="h-screen flex flex-col">
            <style>
                {`
                    .highlighted-cell {
                        background-color: yellow !important;
                        transition: background-color 0.3s;
                    }
                `}
            </style>
            <div className="bg-white p-4 text-center">
                <h1 className="text-2xl font-bold text-gray-800">ServeWell</h1>
            </div>
    
            <div className="flex-1 flex flex-col bg-blue-500 justify-center">
                <div className={`bg-white rounded-lg shadow-md p-6 m-4 flex flex-col items-center overflow-auto ${
                    isFullScreen ? "fixed inset-0 z-50" : ""
                }`} style={{ maxHeight: isFullScreen ? '100vh' : '70vh', width: isFullScreen ? '100%' : '90%', margin: isFullScreen ? '0' : '0 auto' }}>
                    
                    <div className="flex justify-between items-center w-full mb-4">
                        <h1 className="text-xl font-semibold text-gray-700">Member SpreadSheet</h1>
                        
                        <div className="flex gap-4">
                            {/* Search Bar */}
                            <div className="relative flex items-center">
                                <button
                                    onClick={() => setShowSearch(!showSearch)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <FaSearch className="text-gray-600" />
                                </button>
                                {showSearch && (
                                    <input
                                        type="text"
                                        placeholder="Search members..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="absolute right-10 w-64 p-2 border rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                )}
                            </div>
    
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={showChart}
                                    onChange={toggleChart}
                                    className="mr-2"
                                />
                                Show Chart
                            </label>
                            <button
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            >
                                {isFullScreen ? "Exit Full Screen" : "Full Screen"}
                            </button>
                        </div>
                    </div>
    
                    {/* Chart Name Input & Create Button */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={chartName}
                            onChange={(e) => setChartName(e.target.value)}
                            placeholder="Chart Name"
                            className="border p-2 rounded-md"
                        />
                        <button 
                            onClick={createNewChart} 
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            disabled={!chartName.trim()} // Prevents empty chart names
                        >
                            Create Chart
                        </button>
                    </div>
    
                    {/* Chart Tabs */}
                    <div className="tabs-container border-b pb-2 h-12 flex-shrink-0">
                        {charts.map((chart) => (
                            <div
                                key={chart.id}
                                className={clsx("p-2 border rounded-md flex items-center mr-2", { "bg-gray-300": activeChart === chart.id })}

                                  >
                                <button onClick={() => setActiveChart(chart.id)} className="mr-2">{chart.name}</button>
                                <button onClick={() => deleteChart(chart.id, chart.name)} className="text-blue-500 font-bold text-lg">X</button>                      </div>
                        ))}
                    </div>
    
                    <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="mb-4" />
                    <button onClick={handleSaveClick} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Save File
                    </button>
    
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={saveToComputer}>Save to this computer</MenuItem>
                        <MenuItem onClick={saveToCloud}>Save to the cloud</MenuItem>
                    </Menu>
    
                    {isLoading || switchingView ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            {showChart && activeChart && charts.find(chart => chart.id === activeChart).chartData ? (
                                <div className="w-full h-96 flex flex-col items-center">
                                    <select
                                        className="mb-4 p-2 border rounded"
                                        value={charts.find(chart => chart.id === activeChart).chartType}
                                        onChange={(e) => handleChartTypeChange(activeChart, e.target.value)}
                                    >
                                        <option value="pie">Pie Chart</option>
                                        <option value="bar">Bar Chart</option>
                                        <option value="line">Line Chart</option>
                                    </select>
                                    {chartLoading ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <>
                                        {charts.find(chart => chart.id === activeChart).chartType === "pie" && <Pie data={charts.find(chart => chart.id === activeChart).chartData} />}
                                        {charts.find(chart => chart.id === activeChart).chartType === "bar" && <Bar data={charts.find(chart => chart.id === activeChart).chartData} />}
                                        {charts.find(chart => chart.id === activeChart).chartType === "line" && <Line data={charts.find(chart => chart.id === activeChart).chartData} />}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="w-full overflow-auto border border-gray-300 rounded-lg">
                                {/* Add a single email button above the spreadsheet */}
                                <div className="p-2 border-b flex justify-between items-center">
                                    <h3 className="text-lg font-medium">Member SpreadSheet</h3>
                                    <button 
                                        onClick={openMemberList}
                                        className="flex items-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                                    >
                                        <FaEnvelope className="mr-2" /> 
                                        Email Members
                                    </button>
                                </div>
                                
                                {/* Existing spreadsheet code */}
                                <div className="flex justify-end mb-2 p-2">
                                    <button onClick={addRow} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2">
                                        Add Row
                                    </button>
                                    <button onClick={addColumn} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-green-600">
                                        Add Column
                                    </button>
                                </div>
                                {activeChart && (
                                    <Spreadsheet
                                        data={searchQuery.trim() ? filteredData : charts.find(chart => chart.id === activeChart).data}
                                        onChange={(newData) => {
                                            setCharts(prevCharts => prevCharts.map(chart =>
                                                chart.id === activeChart ? { ...chart, data: newData } : chart
                                            ));
                                            updateChartData(activeChart, newData);
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
        <Snackbar open={alertOpen} autoHideDuration={3000} onClose={() => setAlertOpen(false)}>
            <Alert onClose={() => setAlertOpen(false)} severity="warning">
                {chartName.trim() ? "Upload data before showing charts!" : "Please enter a chart name!"}
            </Alert>
        </Snackbar>
        {/* Member List Modal with fixed search positioning */}
        {memberListOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center">
                            <FaUsers className="mr-2" /> Select Member to Email
                        </h2>
                        
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FaSearch className="text-gray-600" />
                        </button>
                    </div>
                    
                    {/* Search input in its own row */}
                    {showSearch && (
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={memberSearchQuery}
                                onChange={(e) => setMemberSearchQuery(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                    )}
                    
                    <div className="overflow-y-auto flex-grow">
                        <div className="divide-y">
                            {getSortedMembers()
                                .filter(member => 
                                    !memberSearchQuery || 
                                    member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                                    member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
                                )
                                .map((member, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => handleContactMember(member.rowIndex)}
                                        className="w-full text-left p-3 hover:bg-blue-50 flex justify-between items-center"
                                    >
                                        <span>{member.name}</span>
                                        <span className="text-gray-500 text-sm">{member.email}</span>
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => setMemberListOpen(false)}
                            className="px-4 py-2 border rounded-md hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
        {/* Email Service Selection Modal */}
        {emailServiceModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Choose Email Service</h2>
                    <p className="mb-4">Sending email to: {emailRecipient?.name} ({emailRecipient?.email})</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <button 
                            onClick={() => openEmailService("gmail")}
                            className="p-4 border rounded-lg hover:bg-blue-50 flex flex-col items-center"
                        >
                            <img src="https://www.google.com/gmail/about/static/images/logo-gmail.png" 
                                alt="Gmail" 
                                className="h-8 mb-2" 
                            />
                            <span>Gmail</span>
                        </button>
                        
                        <button 
                            onClick={() => openEmailService("yahoo")}
                            className="p-4 border rounded-lg hover:bg-blue-50 flex flex-col items-center"
                        >
                            <img src="https://s.yimg.com/rz/p/yahoo_frontpage_en-US_s_f_p_205x58_frontpage.png" 
                                alt="Yahoo Mail" 
                                className="h-8 mb-2" 
                            />
                            <span>Yahoo Mail</span>
                        </button>
                        
                        <button 
                            onClick={() => openEmailService("outlook")}
                            className="p-4 border rounded-lg hover:bg-blue-50 flex flex-col items-center"
                        >
                            <img src="https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b" 
                                alt="Outlook" 
                                className="h-8 mb-2" 
                            />
                            <span>Outlook</span>
                        </button>
                        
                        <button 
                            onClick={() => openEmailService("default")}
                            className="p-4 border rounded-lg hover:bg-blue-50 flex flex-col items-center"
                        >
                            <FaEnvelope className="text-2xl mb-2" />
                            <span>Default Email</span>
                        </button>
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            onClick={() => setEmailServiceModalOpen(false)}
                            className="px-4 py-2 border rounded-md hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
    </section>
    );
    