"use client";

import React, { useState, ChangeEvent } from "react";

interface Table1Data {
  textbox25: string | null;
  textbox5: string | null;
}

interface DetailData {
  itemNo: string | null;
  quantity: string | null;
  binType: string | null;
  requiredLocations: string | null;
  zone: string | null;
  locations: string | null;
  iorOrder: string | null;
}

export default function Home() {
  const [xmlContent, setXmlContent] = useState<string>("");
  const [parsedData, setParsedData] = useState<DetailData[]>([]);
  const [table1Data, setTable1Data] = useState<Table1Data | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<string[][]>([]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const xmlData = e.target?.result as string;
        setXmlContent(xmlData);

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, "application/xml");

        const table1 = xmlDoc.getElementsByTagName("table1")[0];
        if (table1) {
          const table1Attributes: Table1Data = {
            textbox25: table1.getAttribute("textbox25"),
            textbox5: table1.getAttribute("textbox5"),
          };
          setTable1Data(table1Attributes);
        }

        const groupElements = xmlDoc.getElementsByTagName("table1_Group1");
        const dataArray: DetailData[] = [];

        Array.from(groupElements).forEach((group) => {
          const iorOrder = group.getAttribute("textbox6");

          const details = group.getElementsByTagName("Detail");
          Array.from(details).forEach((detail) => {
            dataArray.push({
              itemNo: detail.getAttribute("Item_No_"),
              quantity: detail.getAttribute("Quantity"),
              binType: detail.getAttribute("BinType"),
              requiredLocations: detail.getAttribute("RequiredLocations"),
              zone: detail.getAttribute("Zone"),
              locations: detail.getAttribute("Locations") || "",
              iorOrder: iorOrder,
            });
          });
        });

        setParsedData(dataArray);
        const uniqueIorOrders = Array.from(new Set(dataArray.map(item => item.iorOrder)));
        setSelectedRows(uniqueIorOrders.map(() => []));
      };

      reader.readAsText(file);
    }
  };

  const filteredData = parsedData.filter(
    (detail) =>
      detail.itemNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.quantity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.binType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.requiredLocations
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      detail.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.locations?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckboxChange = (itemNo: string, iorOrder: string | null) => {
    setSelectedRows((prevSelectedRows) => {
      const newSelectedRows = [...prevSelectedRows];
      const orderIndex = parsedData.findIndex(item => item.iorOrder === iorOrder);

      if (orderIndex === -1) {
        console.error("Order not found");
        return prevSelectedRows;
      }

      const isCurrentlySelected = newSelectedRows[orderIndex].includes(itemNo);

      if (isCurrentlySelected) {
        // Unselect
        newSelectedRows[orderIndex] = newSelectedRows[orderIndex].filter(item => item !== itemNo);
        console.log("Unselected", itemNo);
      } else {
        // Select
        newSelectedRows[orderIndex] = [...newSelectedRows[orderIndex], itemNo];
        console.log("Selected", itemNo);
      }

      return newSelectedRows;
    });
  };

  const printTable = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const tableRowsHtml = filteredData
        .map((detail) => {
          const orderIndex = parsedData.findIndex(item => item.iorOrder === detail.iorOrder);
          const isSelected = selectedRows[orderIndex]?.includes(detail.itemNo || "") || false;
          return `
          <tr class="${isSelected ? "bg-green-500 text-black" : ""}">
            <td>${isSelected
              ? '<input type="checkbox" checked />'
              : '<input type="checkbox" />'
            }</td>
            <td>${detail.itemNo}</td>
            <td>${detail.quantity}</td>
            <td>${detail.binType}</td>
            <td>${detail.requiredLocations}</td>
            <td>${detail.zone}</td>
            <td>${detail.locations}</td>
          </tr>
        `;
        })
        .join("");

      const printContent = `
        <html>
          <head>
            <style >
              @page {
                size: landscape;
                margin: 20px;
              }
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                overflow: hidden;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
              }
              th, td {
                border: 1px solid black;
                padding: 12px;
                text-align: left;
                vertical-align: top;
              }
              th {
                background-color: #f2f2f2;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
            </style>
          </head>
          <body>
            <h1>${table1Data?.textbox25} - ${table1Data?.textbox5}</h1>
            <table>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Item No</th>
                  <th>Quantity</th>
                  <th>Bin Type</th>
                  <th>Required Locations</th>
                  <th>Zone</th>
                  <th>Locations</th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHtml}
              </tbody>
            </table>
            <script>
              window.print();
              window.close();
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(printContent);
    }
  };

  return (
    <section className="w-full h-full px-5">
      {xmlContent ? (
        <section>
          {table1Data && (
            <section className="flex gap-x-2 font-bold text-xl py-2">
              <h1>{table1Data.textbox25}</h1>—<h1>{table1Data.textbox5}</h1>
            </section>
          )}

          {/* Search Functionality */}
          <section className="">
            <h1 className="font-bold">Search</h1>
            <section>
              <input
                type="text"
                className="border bg-transparent rounded px-2 py-1 w-[300px]"
                placeholder="Item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </section>
            <button
              onClick={printTable}
              className="px-3 py-1 bg-blue-500 text-white rounded my-4"
            >
              Print Table
            </button>
          </section>

          <table
            id="printableTable"
            className="px-4 min-w-full table-auto border-collapse my-5"
          >
            <thead>
              <tr className="border-b">
                <th className="py-2 border">Select</th>
                <th className="py-2 border">Item No</th>
                <th className="py-2 border">Quantity</th>
                <th className="py-2 border">Bin Type</th>
                <th className="py-2 border">Required Locations</th>
                <th className="py-2 border">Zone</th>
                <th className="py-2 border">Locations</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((detail, index) => {
                const prevDetail = filteredData[index - 1];
                const isNewOrder =
                  index === 0 || detail.iorOrder !== prevDetail?.iorOrder;

                const orderIndex = parsedData.findIndex(item => item.iorOrder === detail.iorOrder);
                const isSelected = selectedRows[orderIndex]?.includes(detail.itemNo || "") || false;

                return (
                  <React.Fragment key={index}>
                    {isNewOrder && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-2 font-bold bg-gray-500"
                        >
                          {detail.iorOrder}
                        </td>
                      </tr>
                    )}
                    <tr
                      className={`border-b [&>*]:px-4 ${isSelected ? "bg-green-500 text-black border-black" : ""
                        }`}
                    >
                      <td className="py-2 border">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            handleCheckboxChange(
                              detail.itemNo || "",
                              detail.iorOrder || ""
                            )
                          }
                        />
                      </td>
                      <td className="py-2 border">{detail.itemNo}</td>
                      <td className="py-2 border">{detail.quantity}</td>
                      <td className="py-2 border">{detail.binType}</td>
                      <td className="py-2 border">
                        {detail.requiredLocations}
                      </td>
                      <td className="py-2 border">{detail.zone}</td>
                      <td className="py-2 border">{detail.locations}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="h-full flex flex-col items-center justify-center">
          <section>
            <h1 className="font-bold text-2xl">Upload ontvangst XML</h1>
            <input
              type="file"
              accept=".xml"
              onChange={handleFileUpload}
              className="px-4 py-2"
            />
          </section>
        </section>
      )}
    </section>
  );
}