import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../Api/API_URL";

const LogEntry = () => {
  const [Log, setLog] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(8);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}api/logs`);
        setLog(response.data);
        setFilteredLogs(response.data);
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const formatDate = (dateString) => {
    console.log("Input dateString:", dateString); 
    const date = new Date(dateString);
    console.log("Parsed date object:", date); 
    if (isNaN(date)) {
        console.error("Invalid date:", dateString); 
        return "Invalid Date";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    return formattedDate;
};


  const handleFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert("Start date cannot be after end date.");
      return;
    }

    const filtered = Log.filter((log) => {
      const logDate = new Date(log.Date);
      return logDate >= start && logDate <= end;
    });

    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to the first page after filtering
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center mt-10">
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center mt-10">
          <p className="text-lg font-semibold text-red-600">{error}</p>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <div className="mt-4 px-4">
          {/* Date Range Filter */}
          <div className="flex justify-center mb-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-4 py-2 mr-2 rounded"
            />
            <span className="mx-2 mt-2 text-gray-600 font-medium">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-4 py-2 mr-2 rounded"
            />
            <button
              onClick={handleFilter}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Filter
            </button>
            <button
                onClick={() => {
                setStartDate("");
                setEndDate("");
                setFilteredLogs(Log); // Reset to show all logs
                setCurrentPage(1); // Reset pagination to the first page
                }}
                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
            >
                Reset
            </button>
          </div>

          {/* Logs Table */}
          <div className="max-w-8xl mx-auto bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 whitespace-nowrap">
                <tr>
                  <th className="p-4 text-center text-sm font-medium text-white">
                    Date
                  </th>
                  <th className="p-4 text-center text-sm font-medium text-white">
                    Project Name
                  </th>
                  <th className="p-4 text-center text-sm font-medium text-white">
                    Task Name
                  </th>
                  <th className="p-4 text-center text-sm font-medium text-white">
                    Spent Hours
                  </th>
                  <th className="p-4 text-center text-sm font-medium text-white">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="whitespace-nowrap">
                {currentLogs.length > 0 ? (
                  currentLogs.map((log, index) => (
                    <tr key={index} className="even:bg-blue-50">
                      <td className="p-4 text-sm text-center text-black">
                        {formatDate(log.Date)}
                      </td>
                      <td className="p-4 text-sm text-center text-black">
                        {log.projectName}
                      </td>
                      <td className="p-4 text-sm text-center text-black">
                        {log.taskName}
                      </td>
                      <td className="p-4 text-sm text-center text-black">
                        {log.spentHour}
                      </td>
                      <td className="p-4 text-center text-sm">
                        <span
                          className={`w-[68px] block mx-auto text-center py-1 border rounded text-xs ${
                            log.taskStatus === "Pending"
                              ? "border-red-500 text-red-600"
                              : log.taskStatus === "In Progress"
                              ? "border-yellow-500 text-yellow-600"
                              : "border-green-500 text-green-600"
                          }`}
                        >
                          {log.taskStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-black">
                      No data present.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredLogs.length > 0 && (
            <div className="flex justify-center mt-4">
              <nav>
                <ul className="flex space-x-2">
                  {/* Previous Button */}
                  <li>
                    <button
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        currentPage === 1
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-white text-blue-600"
                      }`}
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                  </li>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <li key={index}>
                      <button
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          currentPage === index + 1
                            ? "bg-blue-600 text-white"
                            : "bg-white text-blue-600"
                        }`}
                        onClick={() => paginate(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}

                  {/* Next Button */}
                  <li>
                    <button
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-white text-blue-600"
                      }`}
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LogEntry;
