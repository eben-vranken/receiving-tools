'use client'

import React from "react";
import { useState, ChangeEvent } from "react";

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

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const xmlData = e.target?.result as string;
        setXmlContent(xmlData);

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, "application/xml");

        // Access <table1> and get its attributes
        const table1 = xmlDoc.getElementsByTagName("table1")[0];
        if (table1) {
          const table1Attributes: Table1Data = {
            textbox25: table1.getAttribute("textbox25"),
            textbox5: table1.getAttribute("textbox5"),
          };
          setTable1Data(table1Attributes);
        }

        // Access <table1_Group1> and get the orders
        const groupElements = xmlDoc.getElementsByTagName("table1_Group1");
        const dataArray: DetailData[] = [];

        Array.from(groupElements).forEach((group) => {
          const iorOrder = group.getAttribute("textbox6");

          // Access <Detail> elements inside each group
          const details = group.getElementsByTagName("Detail");
          Array.from(details).forEach((detail) => {
            dataArray.push({
              itemNo: detail.getAttribute("Item_No_"),
              quantity: detail.getAttribute("Quantity"),
              binType: detail.getAttribute("BinType"),
              requiredLocations: detail.getAttribute("RequiredLocations"),
              zone: detail.getAttribute("Zone"),
              locations: detail.getAttribute("Locations"),
              iorOrder: iorOrder, // Link each detail to its IOR order
            });
          });
        });

        setParsedData(dataArray);
      };

      reader.readAsText(file);
    }
  };

  return (
    <section className="w-full h-full">
      {xmlContent ? (
        <section>
          {table1Data && (
            <section className="flex gap-x-2 font-bold text-xl m-3">
              <h1>{table1Data.textbox25}</h1>
              —
              <h1>{table1Data.textbox5}</h1>
            </section>
          )}

          {/* Search functionality */}
          <section>

          </section>

          <table className="min-w-full table-auto border-collapse my-5">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 border">Item No</th>
                <th className="px-4 py-2 border">Quantity</th>
                <th className="px-4 py-2 border">Bin Type</th>
                <th className="px-4 py-2 border">Required Locations</th>
                <th className="px-4 py-2 border">Zone</th>
                <th className="px-4 py-2 border">Locations</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map((detail, index) => {
                const prevDetail = parsedData[index - 1];
                const isNewOrder =
                  index === 0 || detail.iorOrder !== prevDetail?.iorOrder;

                return (
                  <React.Fragment key={index}>
                    {isNewOrder && (
                      <tr>
                        <td colSpan={6} className="px-4 py-2 font-bold bg-gray-500">
                          {detail.iorOrder}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b">
                      <td className="px-4 py-2 border">{detail.itemNo}</td>
                      <td className="px-4 py-2 border">{detail.quantity}</td>
                      <td className="px-4 py-2 border">{detail.binType}</td>
                      <td className="px-4 py-2 border">{detail.requiredLocations}</td>
                      <td className="px-4 py-2 border">{detail.zone}</td>
                      <td className="px-4 py-2 border">{detail.locations}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="h-full flex justify-center items-center">
          <form className="flex flex-col gap-y-1">
            <label htmlFor="xmlFile" className="font-bold text-xl">Upload XML File:</label>
            <input
              type="file"
              id="xmlFile"
              accept=".xml"
              onChange={handleFileUpload}
            />
          </form>
        </section>
      )}
    </section>
  );
}
