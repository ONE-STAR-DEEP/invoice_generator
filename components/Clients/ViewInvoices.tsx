"use client";

import { useEffect, useState } from 'react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '../ui/button';
import { fetchFullClientDetails } from '@/lib/actions/clients';
import { FullClientDetails } from '@/lib/types/dataTypes';
import { DataTable } from '../dataTable';
import { columns } from './InvoiceTable';


export const triggerClientRefresh = () => {
    window.dispatchEvent(new Event("client-refresh"));
};

const ViewInvoices = ({ id }: { id: number }) => {

    const [open, setOpen] = useState(false);
    const [refreshToken, setRefreshToken] = useState(0);
    const [data, setData] = useState<FullClientDetails | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!open) return;

            const res = await fetchFullClientDetails(id);
            if (!res.success) {
                alert("Failed to fetch")
            }
            setData(res.data)
            console.log(res.data)
        }
        loadData();

    }, [id, open, refreshToken]);

    useEffect(() => {
        const handleRefresh = () => {
            setRefreshToken((prev) => prev + 1);
        };

        window.addEventListener("client-refresh", handleRefresh);

        return () => {
            window.removeEventListener("client-refresh", handleRefresh);
        };
    }, []);

    return (
        <div>
            <Button onClick={() => { setOpen(true) }}>View</Button>
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
                            <DialogTitle className="text-xl">Client Record</DialogTitle>
                        </div>
                        <DialogDescription>
                            Access detailed client records including invoice history, total invoices,
                            paid and pending amounts, outstanding balances, and complete billing insights.
                        </DialogDescription>
                    </DialogHeader>

                    <main className='px-6'>

                        <section>
                            <h1 className='text-2xl font-bold'>{data?.client?.company_name}
                                ({data?.client?.gst_number ? <span className="text-blue-700">{data?.client?.gst_number}</span> : data?.client?.tax_number ? <span className="text-green-700">{data?.client?.tax_number}</span> : <span>NA</span>})
                            </h1>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

                                <div className='p-2 space-y-2'>
                                    <div className='flex items-center justify-between w-full border rounded-lg p-4'>
                                        <p className='text-md font-bold'>Total Amount</p>
                                        <p className='text-2xl font-bold'>₹ {data?.summary.total_amount}</p>
                                    </div>

                                    <div className='flex items-center justify-between w-full border rounded-lg p-4'>
                                        <p className='text-md font-bold'>
                                            Pending Amount
                                        </p>
                                        <p className='text-xl font-bold text-orange-400'>₹ {data?.summary?.pending_amount}</p>
                                    </div>

                                    <div className='flex items-center justify-between w-full border rounded-lg p-4'>
                                        <p className='text-md font-bold'>
                                            Paid Amount
                                        </p>
                                        <p className='text-xl font-bold text-emerald-500'>₹ {data?.summary?.paid_amount}</p>
                                    </div>

                                    <div className='flex items-center justify-between w-full border rounded-lg p-4'>
                                        <p className='text-md font-bold'>
                                            Total Invoices
                                        </p>
                                        <p className='text-xl font-bold'>{data?.summary?.total_invoices}</p>
                                    </div>

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">

                                    {/* Contact Info */}
                                    <div>
                                        <p className="text-muted-foreground">Phone</p>
                                        <p className="font-medium">{data?.client?.phone || "-"}</p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-muted-foreground">Email</p>
                                        <a
                                            href={`mailto:${data?.client?.email}`}
                                            className="font-medium truncate max-w-55 block hover:underline"
                                            title={data?.client?.email}
                                        >
                                            {data?.client?.email || "-"}
                                        </a>
                                    </div>

                                    {/* Business Info */}
                                    <div>
                                        <p className="text-muted-foreground">PAN Card</p>
                                        <p className="font-medium">{data?.client?.pan || "-"}</p>
                                    </div>

                                    <div>
                                        <p className="text-muted-foreground">Assigned Person</p>
                                        <p className="font-medium">{data?.client?.assigned_person || "-"}</p>
                                    </div>

                                    <div>
                                        <p className="text-muted-foreground">Designation</p>
                                        <p className="font-medium">{data?.client?.designation || "-"}</p>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <p className="text-muted-foreground">Date Added</p>
                                        <p className="font-medium">
                                            {data?.client?.created_at
                                                ? new Intl.DateTimeFormat("en-IN", {
                                                    timeZone: "Asia/Kolkata",
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                }).format(new Date(data.client.created_at))
                                                : "-"}
                                        </p>
                                    </div>

                                    {/* Address - full width */}
                                    <div className="md:col-span-2">
                                        <p className="text-muted-foreground">Address</p>
                                        <p className="font-medium">
                                            {[
                                                data?.client?.address,
                                                data?.client?.city,
                                                data?.client?.state,
                                                data?.client?.country,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}{" "}
                                            {data?.client?.pincode && `- ${data.client.pincode}`}
                                        </p>
                                    </div>

                                    {/* Notes */}
                                    <div className="md:col-span-2">
                                        <p className="text-muted-foreground">Notes</p>
                                        <p className="font-medium">{data?.client?.notes || "-"}</p>
                                    </div>
                                </div>
                            </div>

                        </section>

                        <section className='p-4 space-y-2'>
                            <h2 className='text-lg font-bold'>Invoice Record</h2>
                            <DataTable data={data?.invoices ?? []} columns={columns} />
                        </section>

                    </main>

                </DialogContent>
            </Dialog>

        </div>
    )
}

export default ViewInvoices