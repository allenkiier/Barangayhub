import React from 'react';
import type { Document, Resident } from '@/types/database';
// Ensure no custom Image import is present. Use only the standard HTML <img> tag.

interface PrintableDocumentProps {
  document: Document;
  resident?: Resident;
}

interface PrintableSettings {
  barangayName?: string;
  municipality?: string;
  province?: string;
  officeTitle?: string;
  punongBarangayName?: string;
  indigencyPurok?: string;
  printIcon?: string;
  printLogoLeft?: string;
  printLogoRight?: string;
}

const PRINT_LOGO_LEFT_KEY = 'barangay_print_logo_left';
const PRINT_LOGO_RIGHT_KEY = 'barangay_print_logo_right';

const PrintableDocument = React.forwardRef<HTMLDivElement, PrintableDocumentProps>(
  ({ document, resident }, ref) => {
    const contentLines = (document.content || '').split('\n');
    const parsedDocumentFields = parseDocumentFields(document.content || '');
    const purpose =
      parsedDocumentFields.purpose ||
      contentLines.find((line) => line.toLowerCase().startsWith('purpose:'))?.replace(/purpose:\s*/i, '') ||
      'N/A';
    const remarks =
      parsedDocumentFields.remarks ||
      contentLines.find((line) => line.toLowerCase().startsWith('remarks:'))?.replace(/remarks:\s*/i, '') ||
      '';
    const documentTypeLower = document.type.toLowerCase();
    const isIndigencyCertificate = documentTypeLower.includes('indigency');
    const isClearanceDocument = documentTypeLower.includes('clearance');
    const residentFullName = resident
      ? `${resident.firstName.toUpperCase()} ${resident.middleName ? `${resident.middleName.charAt(0).toUpperCase()}. ` : ''}${resident.lastName.toUpperCase()}`
      : (parsedDocumentFields.requester || parsedDocumentFields.fullname || '____________________________').toUpperCase();
    const residentAge = resident?.dateOfBirth ? `${calculateAge(resident.dateOfBirth)}` : '_____';
    const residentSex =
      resident?.gender
        ? resident.gender.toUpperCase()
        : (parsedDocumentFields.sex || parsedDocumentFields.gender || '_____').toUpperCase();
    const residentCivilStatus =
      resident?.civilStatus
        ? resident.civilStatus.toUpperCase()
        : (parsedDocumentFields.civilstatus || parsedDocumentFields['civil status'] || '_____').toUpperCase();
    const residentAddress = resident?.address || parsedDocumentFields.address || '____________________________';
    const residentDob = resident?.dateOfBirth
      ? new Date(resident.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '____________________________';
    const residentPob =
      parsedDocumentFields.placeofbirth ||
      parsedDocumentFields['place of birth'] ||
      parsedDocumentFields.pob ||
      '____________________________';
    const settings = getPrintableSettings();
    const officeTitle = settings.officeTitle || 'Office of the Punong Barangay';
    const barangayName = settings.barangayName || 'Barangay Joyao-Joyao';
    const municipality = settings.municipality || 'Numancia';
    const province = settings.province || 'Aklan';
    const punongBarangayName = settings.punongBarangayName || 'PERCY M. RASGO';
    const indigencyPurok = settings.indigencyPurok || 'Purok 2';
    const printImageLeft = normalizePrintImageSrc('/images/js/image 2.png');
    const printImageRight = normalizePrintImageSrc('/images/image.png');
    const printBackgroundImage = normalizePrintImageSrc('/images/js/bry.png');
    const printSignatureFrontImage = normalizePrintImageSrc('/images/js/blog.jpg');
    const fallbackImage = normalizePrintImageSrc('/placeholder.svg');
    const dateIssued = new Date(document.issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const dateExpired = document.expiryDate
      ? new Date(document.expiryDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '____________________________';
    const timeIssued = formatTimeIssued(document.issueDate);
    const orNo = parsedDocumentFields.orno || parsedDocumentFields['or no'] || parsedDocumentFields['or no.'] || `CLR-${document.id.slice(0, 8).toUpperCase()}`;

    return (
      <div ref={ref} className="print-content" style={{ display: 'none' }}>
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              margin: 0;
              padding: 0;
            }
            .print-document {
              width: 100%;
              max-width: 100%;
              min-height: 100%;
              margin: 0;
              padding: 0.5in 0.3in 0.5in 0.15in;
              background: white;
              box-sizing: border-box;
            }
            .print-header {
              text-align: center;
              border-bottom: 3px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .print-logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 10px;
            }
            .print-title {
              font-size: 22px;
              font-weight: bold;
              margin: 10px 0 5px;
              text-transform: uppercase;
            }
            .print-header-row {
              display: grid;
              grid-template-columns: 100px 1fr 100px;
              align-items: center;
              gap: 10px;
            }
            .print-header-image {
              width: 100px;
              height: 100px;
              object-fit: contain;
              justify-self: center;
            }
            .print-header-center {
              text-align: center;
            }
            .print-subtitle {
              font-size: 13px;
              color: #666;
            }
            .print-doc-type {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin: 25px 0;
              text-transform: uppercase;
              text-decoration: underline;
            }
            .print-body {
              line-height: 1.6;
              font-size: 13px;
              text-align: justify;
              margin: 25px 0;
              word-wrap: break-word;
            }
            .print-info {
              margin: 15px 0;
            }
            .print-info-row {
              display: flex;
              margin: 8px 0;
              page-break-inside: avoid;
              word-wrap: break-word;
            }
            .print-info-label {
              font-weight: bold;
              min-width: 130px;
              flex-shrink: 0;
            }
            .print-info-value {
              flex: 1;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .print-footer {
              margin-top: 40px;
              page-break-inside: avoid;
            }
            .print-signature {
              margin-top: 35px;
              text-align: right;
            }
            .print-signature-line {
              border-top: 1px solid #000;
              width: 220px;
              margin: 25px 0 5px auto;
            }
            .print-date {
              margin-top: 25px;
              text-align: left;
            }
            .clearance-certificate {
              width: 100%;
              max-width: 7.05in;
              margin: 0 auto;
              border: none;
              padding: 0.22in;
              font-family: 'Times New Roman', serif;
              color: #000;
            }
            .clearance-header {
              text-align: center;
              line-height: 1.35;
            }
            .clearance-header-table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }
            .clearance-header-cell-logo {
              width: 100px;
              vertical-align: top;
              text-align: center;
            }
            .clearance-header-text {
              text-align: center;
              vertical-align: top;
            }
            .clearance-header-image {
              width: 100px;
              height: 100px;
              object-fit: contain;
              flex: 0 0 100px;
              margin-top: 2px;
            }
            .clearance-title {
              font-size: 24px;
              font-weight: bold;
              margin-top: 14px;
              letter-spacing: 1px;
            }
            .clearance-field {
              margin-top: 10px;
              font-size: 16px;
              line-height: 1.35;
            }
            .clearance-line {
              border-bottom: 1px solid #000;
              width: 58%;
              min-width: 180px;
              display: inline-block;
              vertical-align: bottom;
              min-height: 20px;
              padding: 0 4px;
            }
            .clearance-signature-section {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              gap: 20px;
            }
            .clearance-photo-box {
              width: 96px;
              height: 96px;
              border: 1px solid #000;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              font-size: 11px;
              line-height: 1.2;
              flex-shrink: 0;
            }
            .clearance-signature-box {
              text-align: center;
              flex: 1;
              font-size: 14px;
            }
            .clearance-thumb-oval {
              width: 78px;
              height: 96px;
              border: 1px solid #000;
              border-radius: 50%;
              margin: 10px auto 8px;
            }
            .clearance-footer {
              margin-top: 20px;
              font-size: 16px;
              line-height: 1.4;
            }
            .clearance-punong {
              text-align: right;
              margin-top: 12px;
              font-size: 16px;
            }
            .clearance-punong-signature-image {
              margin: 6px 0 0 auto;
              width: 900px;
              max-width: 900px;
              height: auto;
              object-fit: contain;
              display: block;
            }
            @media (max-width: 900px) {
              .clearance-certificate {
                padding: 20px;
              }
              .clearance-field,
              .clearance-footer,
              .clearance-punong {
                font-size: 16px;
              }
              .clearance-title {
                font-size: 24px;
              }
              .clearance-signature-section {
                gap: 12px;
              }
            }
            * {
              box-sizing: border-box;
            }
          }
        `}</style>
        
        <div className="print-document">
          {isIndigencyCertificate ? (
            <>
              <div
                style={{
                  width: '100%',
                  maxWidth: '7.5in',
                  margin: '0 auto',
                  fontFamily: '"Times New Roman", serif',
                  fontSize: '18px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', marginBottom: '10px', marginTop: '10px' }}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <img
                    {...({
                      src: printImageLeft,
                      alt: 'Barangay Logo Left',
                      style: { width: '100px', height: '100px', objectFit: 'contain' },
                      onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        (e.currentTarget as HTMLImageElement).onerror = null;
                        (e.currentTarget as HTMLImageElement).src = fallbackImage;
                      },
                    } as any)}
                  />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <img
                    {...({
                      src: printImageRight,
                      alt: 'Barangay Logo Right',
                      style: { width: '100px', height: '100px', objectFit: 'contain' },
                      onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        (e.currentTarget as HTMLImageElement).onerror = null;
                        (e.currentTarget as HTMLImageElement).src = fallbackImage;
                      },
                    } as any)}
                  />
                </div>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '20px', letterSpacing: '1px' }}>Republic of the Philippines</div>
                  <div style={{ fontSize: '18px' }}>Province of Aklan</div>
                  <div style={{ fontSize: '18px' }}>Municipality of Numancia</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '2px', margin: '5px 0' }}>BARANGAY JOYAO-JOYAO</div>
                </div>
                <h2 style={{ marginTop: '20px', textAlign: 'center', letterSpacing: '3px', position: 'relative', zIndex: 1 }}>
                  CERTIFICATE OF INDIGENCY
                </h2>

                <div style={{ marginTop: '40px', fontSize: '18px', textAlign: 'justify', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                  <p><strong>TO WHOM IT MAY CONCERN:</strong></p>

                  <p>
                    This is to certify that <strong>{residentFullName}</strong>, <strong>{residentAge}</strong>, <strong>{residentSex}</strong>, <strong>{residentCivilStatus}</strong> and a duly resident of {indigencyPurok} {barangayName}, {municipality}, {province} belongs to the indigent families.
                  </p>

                  <p>
                    This certification is issued upon the request of the above mentioned name for whatever legal purpose it may serve.
                  </p>

                  <p>
                    Issued this {formatIssuedDate(new Date(document.issueDate))} at {barangayName}, {municipality}, {province} Philippines.
                  </p>
                </div>

                <div style={{ margin: '100px 0 0 auto', textAlign: 'right', width: '100%', maxWidth: '100%' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{punongBarangayName.toUpperCase()}</p>
                  <p style={{ margin: 0 }}>Punong Barangay</p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <img
                    {...({
                      src: printSignatureFrontImage,
                      alt: 'Front Signature Image',
                      style: { margin: '10px 0 0 auto', width: '1100px', maxWidth: '100%', height: 'auto', objectFit: 'contain', display: 'block' },
                      onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        (e.currentTarget as HTMLImageElement).onerror = null;
                        (e.currentTarget as HTMLImageElement).src = fallbackImage;
                      },
                    } as any)}
                  />
                </div>

                <div style={{ clear: 'both' }} />
              </div>
            </>
          ) : isClearanceDocument ? (
            <>
              <div className="clearance-certificate">
                <div className="clearance-header">
                  <div className="clearance-header-row">
                    <table className="clearance-header-table" role="presentation">
                      <tbody>
                        <tr>
                          <td className="clearance-header-cell-logo">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <img
                              {...({
                                className: 'clearance-header-image',
                                src: printImageLeft,
                                alt: 'Left Header Image',
                                onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                  (e.currentTarget as HTMLImageElement).onerror = null;
                                  (e.currentTarget as HTMLImageElement).src = fallbackImage;
                                },
                              } as any)}
                            />
                          </td>
                          <td className="clearance-header-text">
                            Republic of the Philippines<br />
                            Province of {province}<br />
                            Municipality of {municipality}<br />
                            <b>{barangayName.toUpperCase()}</b><br />
                            <br />
                            {officeTitle}
                          </td>
                          <td className="clearance-header-cell-logo">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <img
                              {...({
                                className: 'clearance-header-image',
                                src: printImageRight,
                                alt: 'Right Header Image',
                                onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                  (e.currentTarget as HTMLImageElement).onerror = null;
                                  (e.currentTarget as HTMLImageElement).src = fallbackImage;
                                },
                              } as any)}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="clearance-title">BARANGAY CLEARANCE</div>
                </div>

                <p className="clearance-field">
                  This is to certify that the person whose name, picture and signature appear hereon has requested a clearance from this office.
                </p>

                <div className="clearance-field">Name: <span className="clearance-line">{residentFullName}</span></div>
                <div className="clearance-field">Address: <span className="clearance-line">{residentAddress}</span></div>
                <div className="clearance-field">Age: <span className="clearance-line">{residentAge}</span></div>
                <div className="clearance-field">Sex: <span className="clearance-line">{residentSex}</span></div>
                <div className="clearance-field">Civil Status: <span className="clearance-line">{residentCivilStatus}</span></div>
                <div className="clearance-field">Date of Birth: <span className="clearance-line">{residentDob}</span></div>
                <div className="clearance-field">Place of Birth: <span className="clearance-line">{residentPob}</span></div>

                <div className="clearance-field">Purpose: <span className="clearance-line">{purpose}</span></div>

                <div className="clearance-signature-section">
                  <div className="clearance-photo-box">1x1 ID PHOTO</div>

                  <div className="clearance-signature-box">
                    Signature
                    <br />
                    <br />
                    ____________________
                  </div>

                  <div className="clearance-signature-box">
                    Left Thumbmark
                    <br />
                    <br />
                    <div className="clearance-thumb-oval" />
                    ____________________
                  </div>

                  <div className="clearance-signature-box">
                    Right Thumbmark
                    <br />
                    <br />
                    <div className="clearance-thumb-oval" />
                    ____________________
                  </div>
                </div>

                <p className="clearance-field">
                  This is to certify that he/she is known to me of good moral character and is a law abiding citizen. He/She has no pending case nor derogatory record in this office.
                </p>

                <div className="clearance-footer">
                  Amount Paid: PHP 50.00 <br />
                  O.R No: {orNo} <br />
                  <br />
                  Time Issued: {timeIssued} <br />
                  Date Issued: {dateIssued} <br />
                  Date Expired: {dateExpired}
                </div>

                <div className="clearance-punong">
                  <b>{punongBarangayName.toUpperCase()}</b><br />Punong Barangay<br />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <img
                    {...({
                      className: 'clearance-punong-signature-image',
                      src: printSignatureFrontImage,
                      alt: 'Punong Barangay Signature',
                      width: 900,
                      style: { width: '900px', maxWidth: '900px', height: 'auto', objectFit: 'contain', display: 'block', marginLeft: 'auto', marginTop: '6px' },
                      onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        (e.currentTarget as HTMLImageElement).onerror = null;
                        (e.currentTarget as HTMLImageElement).src = fallbackImage;
                      },
                    } as any)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Header */}
              <div className="print-header">
                <div className="print-header-row">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <img
                    {...({
                      className: 'print-header-image',
                      src: printImageLeft,
                      alt: 'Left Header Image',
                      onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = fallbackImage;
                      },
                    } as any)}
                  />
                  <div className="print-header-center">
                    <div className="print-title">Republic of the Philippines</div>
                    <div className="print-subtitle">Barangay Management System</div>
                    <div className="print-subtitle">Office of the Barangay Captain</div>
                  </div>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <img
                    {...({
                      className: 'print-header-image',
                      src: printImageRight,
                      alt: 'Right Header Image',
                      onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = fallbackImage;
                      },
                    } as any)}
                  />
                </div>
              </div>

              {/* Document Type */}
              <div className="print-doc-type">{document.type}</div>

              {/* Document Body */}
              <div className="print-body">
                <p style={{ textIndent: '50px' }}>
                  TO WHOM IT MAY CONCERN:
                </p>
                
                <p style={{ textIndent: '50px', marginTop: '20px' }}>
                  This is to certify that{' '}
                  {resident ? (
                    <strong>
                      {resident.firstName.toUpperCase()} {resident.middleName ? resident.middleName.charAt(0).toUpperCase() + '. ' : ''}
                      {resident.lastName.toUpperCase()}
                    </strong>
                  ) : (
                    <strong>THE BEARER OF THIS DOCUMENT</strong>
                  )}, 
                  {resident?.dateOfBirth && ` ${calculateAge(resident.dateOfBirth)} years old,`}
                  {resident?.gender && ` ${resident.gender},`}
                  {resident?.civilStatus && ` ${resident.civilStatus},`}
                  {resident?.address && ` is a bonafide resident of ${resident.address}.`}
                </p>

                <div className="print-info">
                  <div className="print-info-row">
                    <div className="print-info-label">Purpose:</div>
                    <div className="print-info-value">{purpose}</div>
                  </div>
                  {remarks && (
                    <div className="print-info-row">
                      <div className="print-info-label">Remarks:</div>
                      <div className="print-info-value">{remarks}</div>
                    </div>
                  )}
                  <div className="print-info-row">
                    <div className="print-info-label">Date Issued:</div>
                    <div className="print-info-value">{new Date(document.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div className="print-info-row">
                    <div className="print-info-label">Valid Until:</div>
                    <div className="print-info-value">{new Date(document.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div className="print-info-row">
                    <div className="print-info-label">Document ID:</div>
                    <div className="print-info-value" style={{ fontSize: '10px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{document.id}</div>
                  </div>
                </div>

                <p style={{ textIndent: '50px', marginTop: '30px' }}>
                  This certification is issued upon the request of the above-named person for whatever legal purpose it may serve.
                </p>
              </div>

              {/* Footer */}
              <div className="print-footer">
                <div className="print-date">
                  Issued this{' '}
                  {new Date(document.issueDate).toLocaleDateString('en-US', { 
                    day: 'numeric',
                    month: 'long', 
                    year: 'numeric' 
                  })}.
                </div>

                <div className="print-signature">
                  <div className="print-signature-line"></div>
                  <div style={{ fontWeight: 'bold' }}>Barangay Captain</div>
                  <div style={{ fontSize: '12px' }}>Barangay Management System</div>
                </div>
              </div>

              {/* Document Number at bottom */}
              <div style={{ marginTop: '40px', fontSize: '10px', textAlign: 'center', color: '#666' }}>
                Document Control No: {document.id}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);

PrintableDocument.displayName = 'PrintableDocument';

// Helper function to calculate age
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function formatIssuedDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  return `${day}${getOrdinalSuffix(day)} day of ${month} ${year}`;
}

function formatTimeIssued(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '____________________________';
  }

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function parseDocumentFields(content: string): Record<string, string> {
  const fields: Record<string, string> = {};

  content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) {
        return;
      }

      const rawKey = line.slice(0, separatorIndex).trim().toLowerCase();
      const normalizedKey = rawKey.replace(/\s+/g, '');
      const value = line.slice(separatorIndex + 1).trim();

      if (value) {
        fields[rawKey] = value;
        fields[normalizedKey] = value;
      }
    });

  return fields;
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function getPrintableSettings(): PrintableSettings {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const rawSettings = localStorage.getItem('barangaySettings');
    const parsed = rawSettings ? JSON.parse(rawSettings) : {};
    const settingsObject = parsed && typeof parsed === 'object' ? parsed : {};
    const logoLeft = localStorage.getItem(PRINT_LOGO_LEFT_KEY);
    const logoRight = localStorage.getItem(PRINT_LOGO_RIGHT_KEY);

    return {
      ...settingsObject,
      printLogoLeft: logoLeft || settingsObject.printLogoLeft,
      printLogoRight: logoRight || settingsObject.printLogoRight,
    };
  } catch {
    return {};
  }
}

export default PrintableDocument;

function normalizePrintImageSrc(value: string): string {
  if (!value) return '';
  const trimmedValue = value.trim();
  if (!trimmedValue) return '';

  if (
    trimmedValue.startsWith('data:image') ||
    trimmedValue.startsWith('blob:') ||
    /^https?:\/\//i.test(trimmedValue)
  ) {
    return trimmedValue;
  }

  const normalizedPath = trimmedValue.startsWith('/') ? trimmedValue.slice(1) : trimmedValue;
  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const basePath = normalizedBase === '/' ? '' : normalizedBase.replace(/\/$/, '');
  const appRelativePath = `${basePath}/${normalizedPath}`;
  const encodedPath = encodeURI(appRelativePath);
  const absolutePath = typeof window !== 'undefined' ? `${window.location.origin}${encodedPath}` : encodedPath;
  const stamp = Date.now();
  return absolutePath.includes('?') ? `${absolutePath}&t=${stamp}` : `${absolutePath}?t=${stamp}`;
}
