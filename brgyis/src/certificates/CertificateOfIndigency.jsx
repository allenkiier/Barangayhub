import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// FIX: Add { request } to the function arguments
const CertificateOfIndigency = ({ request }) => {
  const { transactionId: urlId } = useParams(); 
  // Now 'request' is defined and we can check for the transaction_id
  const transactionId = request?.transaction_id || urlId;

  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) return;

    setLoading(true);
    fetch(`http://localhost:3001/api/indigency/${transactionId}`)
      .then(res => res.json())
      .then(data => {
        setCertData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching indigency data:", err);
        setLoading(false);
      });
  }, [transactionId]);

  if (!transactionId) return <div className="p-10 text-center text-red-500">No Transaction ID provided.</div>;
  if (loading) return <div className="p-10 text-center">Loading Certificate...</div>;
  if (!certData) return <div className="p-10 text-center text-red-500">Certificate Not Found.</div>;

  return (
    <div className="bg-gray-100 p-8 min-h-screen flex justify-center print:bg-white print:p-0">
      {/* Paper Container */}
      <div className="bg-white w-[210mm] h-[297mm] p-[20mm] shadow-lg border border-gray-200 relative text-gray-900 font-serif print:shadow-none print:border-none">
        
        {/* Header Section */}
        <header className="text-center mb-10">
          <p className="uppercase text-sm leading-tight">Republic of the Philippines [cite: 4]</p>
          <p className="text-sm leading-tight">Province of {certData.province || "Aklan"} [cite: 5]</p>
          <p className="text-sm leading-tight">Municipality of {certData.municipality || "Numancia"} [cite: 6]</p>
          <p className="font-bold text-md mt-1 italic">BARANGAY {certData.barangay?.toUpperCase() || "JOYAO-JOYAO"} [cite: 6]</p>
          <div className="h-[1px] bg-black w-full my-2"></div>
          <p className="font-semibold text-sm text-center">Office of the Punong Barangay [cite: 7]</p>
        </header>

        {/* Title Section */}
        <div className="text-center my-16">
          <h1 className="text-3xl font-bold tracking-widest uppercase underline underline-offset-4">Certificate [cite: 8]</h1>
          <h2 className="text-2xl font-bold tracking-widest uppercase">of Indigency [cite: 9]</h2>
        </div>

        <p className="font-bold uppercase text-sm mb-8">To Whom It May Concern: [cite: 10]</p>

        {/* Dynamic Body Content */}
        <div className="text-justify leading-relaxed indent-12 space-y-6">
          <p>
            This is to certify that <span className="font-bold border-b border-black uppercase">{certData.user_name}</span>, 
            of legal age, <span className="font-bold border-b border-black">{certData.sex}</span>, 
            <span className="font-bold border-b border-black">{certData.civil_status}</span> and 
            a duly resident of {certData.house_no} {certData.street}, Barangay {certData.barangay}, 
            {certData.municipality}, {certData.province} belongs to the indigent families.
          </p>
          
          <p>This certification is issued upon the request of the above mentioned-name for whatever legal purpose it may serve[cite: 12].</p>

          <p>Issued this <span className="font-bold">{certData.date_issued || "17th day of January 2025"}</span> at Barangay {certData.barangay}, {certData.municipality}, {certData.province} Philippines.</p>
        </div>

        {/* Signatory */}
        <div className="mt-28 flex flex-col items-end">
          <div className="text-center">
            <p className="font-bold text-lg uppercase underline decoration-1">PERCY M. RASGO [cite: 14]</p>
            <p className="text-sm">Punong Barangay [cite: 14]</p>
          </div>
        </div>

        {/* Seal and Footer */}
        <div className="absolute bottom-40 left-20 border-2 border-dashed border-gray-300 rounded-full w-32 h-32 flex items-center justify-center text-[10px] text-gray-400 text-center uppercase">
          Official Seal [cite: 15]
        </div>

        <footer className="absolute bottom-10 left-0 w-full text-center text-[10px] text-gray-500">
          <p>Joyao-Joyao Multi Purpose-Hall, Numancia 5604, Aklan Philippines [cite: 16]</p>
          <p>Blgu Joyao-Joyao | 265-3774 | Mblgujoyaojoyao03@gmail.com [cite: 17, 18]</p>
        </footer>
      </div>
    </div>
  );
};

export default CertificateOfIndigency;