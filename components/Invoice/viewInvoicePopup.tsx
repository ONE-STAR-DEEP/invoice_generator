"use client";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "../ui/button";
import { Eye, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchInvoiceById } from "@/lib/actions/invoice";
import { BankAccount, FetchedInvoice, SellerCompany } from "@/lib/types/dataTypes";
import Image from "next/image";
import { fetchBankAccountData, fetchCompanyData } from "@/lib/actions/users";
import Link from "next/link";

const now = new Date();

const formatted = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
});

export const formatIST = (date?: string | Date) => {
    if (!date) return "";

    // handle both string + Date
    const parsed =
        typeof date === "string"
            ? new Date(date.replace(" ", "T")) // fix non-ISO format
            : date;

    return parsed
        .toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
        .replace(",", "")
        .toUpperCase();
};

export const formatDateOnly = (date?: string | Date) => {
    if (!date) return "-";

    const parsed =
        typeof date === "string"
            ? new Date(date.replace(" ", "T"))
            : date;

    return parsed.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatCurrency = (num?: number) =>
    num?.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    });

export const numberToWords = (num: number): string => {
    if (num === 0) return "Zero";

    const ones = [
        "", "One", "Two", "Three", "Four", "Five", "Six",
        "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
        "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"
    ];

    const tens = [
        "", "", "Twenty", "Thirty", "Forty",
        "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    const getWords = (n: number): string => {
        if (n < 20) return ones[n];
        if (n < 100)
            return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
        if (n < 1000)
            return (
                ones[Math.floor(n / 100)] +
                " Hundred" +
                (n % 100 ? " " + getWords(n % 100) : "")
            );
        return "";
    };

    let result = "";

    const crore = Math.floor(num / 10000000);
    num %= 10000000;

    const lakh = Math.floor(num / 100000);
    num %= 100000;

    const thousand = Math.floor(num / 1000);
    num %= 1000;

    const hundred = num;

    if (crore) result += getWords(crore) + " Crore ";
    if (lakh) result += getWords(lakh) + " Lakh ";
    if (thousand) result += getWords(thousand) + " Thousand ";
    if (hundred) result += getWords(hundred);

    return result.trim() + " Only";
};

const ViewInvoicePopup = ({ id }: { id: number }) => {

    const [open, setOpen] = useState(false)
    const [invoiceData, setInvoiceData] = useState<FetchedInvoice | null>(null)
    const [companyData, setCompanyData] = useState<SellerCompany | null>(null)
    const [accountData, setAccountData] = useState<BankAccount | null>(null)

    useEffect(() => {
        if (!open) return;

        const fetchData = async () => {
            const [invoiceRes, companyRes, accountRes] = await Promise.all([
                fetchInvoiceById(id),
                fetchCompanyData(),
                fetchBankAccountData()
            ]);
            if (invoiceRes.data && companyRes.data && accountRes.data) {
                setInvoiceData(invoiceRes.data.invoice);
                setCompanyData(companyRes.data);
                setAccountData(accountRes.data)
            }
            else {
                console.error("Failed to fetch data");
            }
        }
        fetchData();
    }, [open, id])

    const handlePrint = () => {
        const content = document.getElementById("invoice-print")?.innerHTML;

        const printWindow = window.open("", "_blank");
        if (!printWindow || !content) return;

        const styles = Array.from(document.styleSheets)
            .map((styleSheet) => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map((rule) => rule.cssText)
                        .join("");
                } catch {
                    return "";
                }
            })
            .join("");

        printWindow.document.write(`
    <html>
      <head>
        <title>Invoice</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Zain:ital,wght@0,200;0,300;0,400;0,700;0,800;0,900;1,300;1,400&display=swap" rel="stylesheet">

        <!-- Tailwind + existing styles -->
        <style>${styles}</style>

        <!-- 🔥 PRINT LOCK STYLES -->
        <style>
  @page {
    size: A4;
    margin: 10mm;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Nunito Sans', sans-serif;
  }

  #companyName {
  font-weight: 700;
  font-size: 20px;   /* slightly reduced for print */
  line-height: 1;
}

#tagline {
  font-style: italic;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: -0.02em;
  line-height: 1;
  margin-left: -8px;
}

  #invoice-print {
    width: 100%;
    font-size: 12px !important;
    line-height: 1.4 !important;
  }

  #invoice-print {
  font-size: 12px;
  line-height: 1.4;
}

  /* headings */
  #invoice-print h1 { font-size: 20px !important; }
  #invoice-print h2 { font-size: 16px !important; }
  #invoice-print h3 { font-size: 14px !important; }

  /* table */
  #invoice-print table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px !important;
  }

  #invoice-print th,
  #invoice-print td {
    padding: 6px;
    font-size: 11px !important;
    border: 1px solid #cbd5e1;
  }

  thead {
    display: table-header-group;
  }

  tr {
    page-break-inside: avoid;
  }

  #invoice-print p {
    margin: 2px 0;
  }

  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
</style>
      </head>

      <body>
        <div id="invoice-print">
          ${content}
        </div>
      </body>
    </html>
  `);

        printWindow.document.close();

        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    //     invoice {
    //     "id": 1,
    //     "cgst": 0,
    //     "igst": 17100,
    //     "sgst": 0,
    //     "items": [
    //         {
    //             "id": 1,
    //             "hsn": "123456",
    //             "cgst": 0,
    //             "cost": 25000,
    //             "igst": 4500,
    //             "sgst": 0,
    //             "expiry": null,
    //             "service": "Web Development",
    //             "serviceId": 1
    //         },
    //         {
    //             "id": 2,
    //             "hsn": "234567",
    //             "cgst": 0,
    //             "cost": 50000,
    //             "igst": 9000,
    //             "sgst": 0,
    //             "expiry": null,
    //             "service": "Hosting",
    //             "serviceId": 2
    //         },
    //         {
    //             "id": 3,
    //             "hsn": "345678",
    //             "cgst": 0,
    //             "cost": 20000,
    //             "igst": 3600,
    //             "sgst": 0,
    //             "expiry": null,
    //             "service": "Maintainance",
    //             "serviceId": 3
    //         }
    //     ],
    //     "client": {
    //         "id": 1,
    //         "city": "GZB",
    //         "email": "a@ex.com",
    //         "phone": "9988776655",
    //         "state": "UP",
    //         "address": "21-A Block",
    //         "pincode": "201009",
    //         "gstNumber": "22AAAAAA99009k",
    //         "companyName": "Company A"
    //     },
    //     "subTotal": 95000,
    //     "createdAt": "2026-03-24 16:26:47.000000",
    //     "invoiceId": "IN25261",
    //     "grandTotal": 112100
    // }


    // {
    //     "success": true,
    //     "data": {
    //         "id": 1,
    //         "name": "Thavertech Pvt. Ltd.",
    //         "address_line1": "A-1524, Sec-43",
    //         "address_line2": null,
    //         "city": "Faridabad",
    //         "state": "Haryana",
    //         "pincode": "121003",
    //         "country": "India",
    //         "phone": "+91 1234567890",
    //         "email": "mailus@thavertech.com",
    //         "cin": "U29128123045UTAR",
    //         "gst": "06AADCT9079L1ZO",
    //         "pan": "51564651AFE",
    //         "created_at": "2026-03-21T06:27:50.000Z",
    //         "updated_at": "2026-03-21T06:27:50.000Z"
    //     }
    // }


    // {
    //     "success": true,
    //     "data": {
    //         "id": 1,
    //         "company_id": 1,
    //         "account_name": "INTELLITEST SOLUTIONS PVT. LTD.",
    //         "account_number": "10005222222",
    //         "ifsc_code": "IDFB0021314",
    //         "bank_name": "IDFC First Bank",
    //         "branch": "Sector -21, Faridabad",
    //         "created_at": "2026-03-21T06:29:22.000Z",
    //         "updated_at": "2026-03-21T06:29:22.000Z"
    //     }
    // }
    return (
        <div>
            <Button type="button" variant={'ghost'} className="no-print p-2" onClick={() => { setOpen(true) }}>
                <Eye />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="
                        w-full
                            max-w-[95vw]
                            sm:max-w-md
                            lg:max-w-[60vw]
                            lg:h-[90vh]
                            h-[90vh] 
                            flex flex-col
                            p-0
                            overflow-y-auto
                            "
                >
                    <DialogHeader className="no-print p-6 pb-2">
                        <div className="flex items-center justify-start gap-2">
                            <DialogTitle className="text-xl">Invoice Details</DialogTitle>
                            <Printer onClick={handlePrint} size={28} className="text-primary hover:bg-secondary p-1 rounded-sm" />
                        </div>
                        <DialogDescription>
                            Review complete invoice information including items, tax breakdown, and billing details.
                        </DialogDescription>
                    </DialogHeader>

                    <div id="invoice-print" className="p-10 print:p-0">
                        {/* Scrollable Body */}
                        <div className="flex-1">

                            {/* HEADER */}
                            <header className="flex flex-col items-center pb-4 mb-4 print:no-break">
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center font-medium">
                                        <div className="flex items-center justify-center rounded-md text-primary">
                                            <Image
                                                src="/logo.png"
                                                height={60}
                                                width={60}
                                                alt="logo"
                                            />
                                        </div>

                                        <div className="flex flex-col space-y-0">
                                            <p id="companyName" className="font-bold text-2xl leading-none">
                                                Thaver<span className="text-red-700">tech</span>
                                            </p>
                                            <p id="tagline" className="italic font-semibold text-xs tracking-tight leading-none -ml-2">
                                                Your Thought Our Invention
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-light">Website: <Link href="https://www.thavertech.com/">www.thavertech.com</Link></p>
                                </div>

                                <div className="mt-2">
                                    <h1 className="text-3xl font-semibold">Tax Invoice</h1>
                                </div>

                                {/* <div className="flex flex-col items-center mt-2">
                                    <h1 className="text-xl">{companyData?.name.toUpperCase()}</h1>
                                    <p className="text-sm font-light">{companyData?.address_line1}, {companyData?.city}-{companyData?.pincode}</p>
                                    <a
                                        href={`mailto:${companyData?.email}`}
                                        className="text-sm font-ligh"
                                    >
                                        Email: {companyData?.email}
                                    </a>
                                    <p className="text-sm font-light">Website: <Link href="https://www.thavertech.com/">www.thavertech.com</Link></p>
                                </div> */}
                            </header>

                            <section className="grid grid-cols-2 border divide-x justify-between mb-8 print:no-break">
                                <div className="p-2">
                                    {/* Seller Details */}
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-[125px_1fr] gap-y-1 text-sm">
                                            <span className="font-medium">Name:</span>
                                            <span className="font-bold">{companyData?.name}</span>

                                            <span className="font-medium">Address:</span>
                                            <span>
                                                {companyData?.address_line1}, {companyData?.city}-{companyData?.pincode}
                                            </span>

                                            <span className="font-medium">Phone:</span>
                                            <span>{companyData?.phone}</span>

                                            <span className="font-medium">Email:</span>
                                            <span>
                                                <a href={`mailto:${companyData?.email}`}>
                                                    {companyData?.email}
                                                </a>
                                            </span>

                                            <span className="font-medium">CIN:</span>
                                            <span>{companyData?.cin}</span>

                                            <span className="font-medium">GST:</span>
                                            <span>{companyData?.gst}</span>
                                        </div>

                                        <div className="w-full border-b border-gray-300"></div>

                                        <div className="grid grid-cols-[125px_1fr] gap-y-1 text-sm">
                                            <span className="font-medium">Account Name:</span>
                                            <span className="">{accountData?.account_name}</span>

                                            <span className="font-medium">Account No:</span>
                                            <span>{accountData?.account_number}</span>

                                            <span className="font-medium">IFSC:</span>
                                            <span>{accountData?.ifsc_code}</span>

                                            <span className="font-medium">Bank Name:</span>
                                            <span>{accountData?.bank_name}</span>

                                            <span className="font-medium">Branch:</span>
                                            <span>{accountData?.branch}</span>
                                        </div>
                                    </div>
                                </div>


                                <div className="p-2">
                                    <div className="space-y-3">

                                        <div className="grid grid-cols-[125px_1fr] gap-y-1 text-sm">
                                            <span className="font-medium">Invoice No:</span>
                                            <span className="font-bold">{invoiceData?.invoiceId}</span>

                                            <span className="font-medium">Invoice Date:</span>
                                            <span>
                                                {formatIST(invoiceData?.createdAt)}
                                            </span>

                                            <span className="font-medium">GST No:</span>
                                            <span>{invoiceData?.client.gstNumber}</span>

                                            <span className="font-medium">PO No:</span>
                                            <span>
                                                {invoiceData?.poNo}
                                            </span>

                                            <span className="font-medium">PO Date:</span>
                                            <span>{formatDateOnly(invoiceData?.poDate)}</span>

                                            <span className="font-medium">Reference:</span>
                                            <span>{invoiceData?.reference}</span>
                                        </div>

                                        <div className="w-full border-b border-gray-300"></div>

                                        {/* Bank Details */}
                                        <div>
                                            <p className="font-semibold mb-2">Buyer / Bill to</p>
                                            <span className="font-bold">{invoiceData?.client.companyName}</span>
                                            <div className="grid grid-cols-[125px_1fr] gap-y-1 text-sm">

                                                <span className="font-medium">Address:</span>
                                                <span>{invoiceData?.client.address}, {invoiceData?.client.city}, {invoiceData?.client.state}, {invoiceData?.client.pincode}</span>

                                                <span className="font-medium">Phone</span>
                                                <span>{invoiceData?.client.phone}</span>

                                                <span className="font-medium">Email:</span>
                                                <span>{invoiceData?.client.email}</span>

                                            </div>

                                        </div>
                                    </div>
                                </div>


                            </section>

                            {/* TABLE */}
                            <section className="mt-4">
                                <table className="w-full border border-collapse">
                                    <thead className="bg-secondary">
                                        <tr>
                                            <th className="border p-2">S No</th>
                                            <th className="border p-2 text-left">Service</th>
                                            <th className="border p-2">HSN Code</th>

                                            <th className="border p-2">Cost</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {invoiceData?.items.map((item, i) => (
                                            <tr key={i} className="text-center print:break-inside-avoid">
                                                <td className="border p-2">{i + 1}</td>
                                                <td className="border p-2 text-left">{item.service}</td>
                                                <td className="border p-2">{item.hsn}</td>
                                                <td className="border p-2 text-right">{formatCurrency(item.cost)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>

                            {/* TOTALS */}
                            <section className="border mt-6 print:no-break">
                                <div className="border-b flex justify-end">
                                    <div className="border-l p-2 w-1/3">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(invoiceData?.subTotal)}</span>
                                        </div>
                                        {invoiceData?.igst === 0 ?
                                            <>
                                                <div className="flex justify-between">
                                                    <span>CGST</span>
                                                    <span>{formatCurrency(invoiceData?.cgst)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>SGST</span>
                                                    <span>{formatCurrency(invoiceData?.sgst)}</span>
                                                </div>

                                            </>
                                            :
                                            <div className="flex justify-between">
                                                <span>IGST</span>
                                                <span>{formatCurrency(invoiceData?.igst)}</span>
                                            </div>
                                        }
                                        <div className="flex justify-between font-bold">
                                            <span>Total</span>
                                            <span>{formatCurrency(invoiceData?.grandTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full flex flex-col items-end p-2">
                                    <p>Grand Total Payable(in words)</p>
                                    <p className="font-bold">INR(₹): {numberToWords(invoiceData?.grandTotal || 0)}</p>
                                </div>

                            </section>

                        </div>
                    </div>

                    {/* Clean Footer */}
                    <div className="no-print p-6 pt-4 flex justify-end gap-3">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="button" onClick={handlePrint}>
                            Print
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    )
}

export default ViewInvoicePopup