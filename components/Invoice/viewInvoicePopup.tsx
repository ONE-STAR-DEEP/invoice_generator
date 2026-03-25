"use client";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup, FieldLabel } from "@/components/ui/field"

import { Button } from "../ui/button";
import { Eye, Plus, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchInvoiceById } from "@/lib/actions/invoice";


const ViewInvoicePopup = ({ id }: { id: number }) => {

    const [open, setOpen] = useState(false)

    useEffect(()=>{
        if(!open) return;

        const fetchData = async ()=>{
            const res = await fetchInvoiceById(id);
            console.log(res)
        } 
        fetchData();
    },[open, id])

    return (
        <div>
            <Button type="button" variant={'ghost'} className="p-2" onClick={() => { setOpen(true) }}>
                <Eye />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="
                        w-full
                            max-w-[95vw]
                            sm:max-w-md
                            lg:max-w-[60vw]
                            lg:h-[70vh]
                            h-[80vh] 
                            flex flex-col
                            p-0
                            overflow-y-auto
                            "
                >
                        <DialogHeader className="p-6 pb-2">
                            <div className="flex items-center justify-start gap-2">
                                <DialogTitle className="text-xl">Invoice Details</DialogTitle>
                                <Printer size={28} className="text-primary hover:bg-secondary p-1 rounded-sm"/>
                            </div>
                            <DialogDescription>
                                Review complete invoice information including items, tax breakdown, and billing details.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto px-6">

                            <FieldLabel className="text-lg mt-4 text-primary">
                                Company Details
                            </FieldLabel>
                            <FieldGroup className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                            </FieldGroup>
                        </div>

                        {/* Clean Footer */}
                        <div className="p-6 pt-4 flex justify-end gap-3">
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Submit</Button>
                        </div>
                </DialogContent>
            </Dialog>
        </div >
    )
}

export default ViewInvoicePopup