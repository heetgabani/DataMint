"use client";

import React, { useState } from "react";
import Papa from "papaparse"; // Import PapaParse

// Define type for each row in the table
type TableRow = {
  [key: string]: string;
};

const CSVUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableRow[]>([]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  // Upload file to backend
  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file");

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setUploading(false);
      setApiEndpoint(result.apiEndpoint);

      // Parse the CSV data using PapaParse
      Papa.parse(file, {
        complete: (parsedData) => {
          // This will give you the parsed CSV as an array of objects
          setTableData(parsedData.data as TableRow[]);
        },
        header: true, // Treat the first row as headers
        skipEmptyLines: true, // Skip empty lines in CSV
      });
    } catch (error) {
      console.error("Upload failed", error);
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Upload CSV File</h2>

      {/* File Input */}
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="border p-2 mb-4"
      />

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload CSV"}
      </button>

      {/* Show API Endpoint */}
      {apiEndpoint && (
        <p className="mt-4">
          🎉 API Generated:{" "}
          <a
            href={`http://localhost:5001${apiEndpoint}`}
            target="_blank"
            className="text-blue-500"
          >
            {`http://localhost:5001${apiEndpoint}`}
          </a>
        </p>
      )}

      {/* Show CSV Data in Table */}
      {tableData.length > 0 && (
        <table className="w-full mt-4 border">
          <thead>
            <tr className="bg-gray-200">
              {Object.keys(tableData[0]).map((key) => (
                <th key={key} className="border p-2">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className="border">
                {Object.values(row).map((cell, i) => (
                  <td key={i} className="border p-2">
                    {cell as string}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CSVUploader;
