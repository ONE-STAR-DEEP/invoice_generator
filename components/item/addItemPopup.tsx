"use client";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Button } from "../ui/button";
import { Camera, Edit, FileText, Lock, Plus } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PurchaseAdjustment } from "@/lib/types/dataTypes";
import { useAuth } from "../Users/roleContext";
import { itemInsert } from "@/lib/actions/taxCredit";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

const AddItemPopup = ({ id, mode }: {
    id?: number;
    mode: "new" | "update" | "renew";
}) => {

    const router = useRouter();
    const [open, setOpen] = useState(false)
    const [isLocked, setLocked] = useState(false);
    const [loading, setLoading] = useState(false);

    const user = useAuth()

    const initialData: PurchaseAdjustment = {
        bill_no: '',
        bill_date: null,
        bill_file: null,
        item_name: "",
        hsn_code: "",
        taxable_amount: null,
        cgst_amount: null,
        sgst_amount: null,
        igst_amount: null,
        total_amount: null,
        supplier_gstin: "",
    }

    const [data, setData] = useState<PurchaseAdjustment>(initialData)

    const resetForm = () => {
        setData(initialData)
    }

    useEffect(() => {

        if (!open) return
        if (mode === "update" && id) {

            const loadData = async () => {
            }
            loadData();
        }

    }, [open, mode, id]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (loading) return;
        setLoading(true);

        try {
            const hasCGST = !!data.cgst_amount
            const hasSGST = !!data.sgst_amount
            const hasIGST = !!data.igst_amount

            // ❌ Mixing IGST with CGST/SGST
            if ((hasCGST || hasSGST) && hasIGST) {
                alert("Use either CGST + SGST or IGST, not both.")
                return
            }

            // ❌ Partial CGST/SGST
            if (hasCGST !== hasSGST) {
                alert("CGST and SGST must be entered together.")
                return
            }

            // ❌ Nothing filled
            if (!hasIGST && !(hasCGST && hasSGST)) {
                alert("Enter either IGST or both CGST and SGST.")
                return
            }

            if ((!data.cgst_amount || !data.sgst_amount) && (!data.igst_amount)) {
                alert("Fill proper tax values");
                return
            }

            if (data.bill_file === null) {
                alert("Please attach a bill (PDF or image).")
                return;
            }

            if (mode === "new") {
                const res = await itemInsert(data);
                if (!res.success) {
                    alert(res.message)
                    return;
                }
            } else if (mode === "update" && id) {
                // const res = await updateInvoice(id, data, items, customTax);
                // if (!res.success) {
                //     alert(res.message)
                //     return;
                // }
            }
            resetForm();
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        multiple: false,
        accept: {
            "application/pdf": [],
            "image/*": []
        },

        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0]

            setData(prev => ({
                ...prev,
                bill_file: file || null
            }))
        },

        onDropRejected: () => {
            alert("Only PDF or image files are allowed")
        }
    })

    return (
        <div>
            {user?.role !== "user" &&
                <>
                    {mode === "new" ?
                        <Button type="button" className="p-4" onClick={() => { setOpen(true) }}>
                            <Plus /> Add Item
                        </Button>
                        :
                        <Edit size={28} className="text-primary hover:bg-secondary p-1 rounded-sm" onClick={() => { setOpen(true) }} />
                    }
                </>
            }

            <Dialog open={open} onOpenChange={(val) => {
                if (!val) resetForm()
                setOpen(val)
            }}>
                <DialogContent
                    className="
                        w-full
                            max-w-[95vw]
                            sm:max-w-md
                            lg:max-w-[50vw]
                            lg:h-[70vh]
                            max-h-[70vh] 
                            flex flex-col
                            p-4
                            overflow-y-auto
                            "
                >
                    <form onSubmit={handleSubmit}>
                        <DialogHeader className="p-2 pb-2">
                            <DialogTitle className="text-xl">Item Details</DialogTitle>
                            <DialogDescription>
                                Enter the details below to insert a new item in the system.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto flex flex-col justify-between px-6">

                            <FieldGroup className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                                <div className='text-12-regular h-36 flex cursor-pointer  flex-col items-center justify-center gap-3 rounded-md border border-dashed border-dark-500 bg-dark-400 p-4 my-2 w-full col-span-2' {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    {
                                        data.bill_file ?
                                            <div className='flex flex-col space-y-2 items-center justify-center'>
                                                <div className='rounded-full bg-slate-800 h-12 w-12 flex items-center justify-center'>
                                                    <FileText className="w-6 h-6 text-green-500" strokeWidth={1} />
                                                </div>
                                                <p className='text-14-regular'>{data.bill_file.name}</p>
                                                <Button className="h-0 hover:bg-transparent hover:text-red-500" variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent triggering file input

                                                        setData(prev => ({
                                                            ...prev,
                                                            bill_file: null
                                                        }))
                                                    }}>Cancel</Button>
                                            </div>
                                            :
                                            <div className='flex flex-col items-center justify-center file-upload_label'>
                                                <Image
                                                    src="/upload.svg"
                                                    width={40}
                                                    height={40}
                                                    alt="upload"
                                                />
                                                <p>Attach a copy of your bill along with the entry.</p>
                                                <p>PDF & Image files only.</p>
                                            </div>
                                    }
                                </div>


                                <Field>
                                    <Label htmlFor="bill_no">Bill No</Label>
                                    <div className="flex">
                                        <Input id="bill_no" name="bill_no" placeholder="Bill No/Invoice ID"
                                            value={data.bill_no}
                                            className="h-10 mb-0 pb-0"
                                            onChange={(e) =>
                                                setData(prev => ({
                                                    ...prev,
                                                    bill_no: e.target.value
                                                }))
                                            }
                                        />
                                    </div>
                                </Field>

                                <Field>
                                    <Label htmlFor="bill_date">Bill Date</Label>
                                    <Input id="bill_date" name="bill_date" type="date" required
                                        value={data.bill_date ? data.bill_date.slice(0, 10) : ""}
                                        className="h-10"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                bill_date: e.target.value
                                            }))
                                        }
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="item_name">Item Name</Label>
                                    <Input id="item_name" name="item_name" placeholder="Item Name" required
                                        value={data.item_name}
                                        className="h-10"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                item_name: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="hsn_code">HSN Code</Label>
                                    <Input
                                        type="text"
                                        className="h-10"
                                        placeholder="HSN code"
                                        value={data.hsn_code || ""}
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                hsn_code: e.target.value
                                            }))
                                        }
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="supplier_gstin">Supplier GST No</Label>
                                    <Input id="supplier_gstin" name="supplier_gstin" placeholder="22AAAAA0000A1Z5"
                                        value={data.supplier_gstin}
                                        className="h-10"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                supplier_gstin: e.target.value.toUpperCase()
                                            }))
                                        }
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="taxable_amount">Taxable Amount</Label>
                                    <Input id="taxable_amount" name="taxable_amount" placeholder="Taxable Amount" required
                                        value={data.taxable_amount || ""}
                                        className="h-10"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                taxable_amount: Number(e.target.value)
                                            }))
                                        }
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="cgst_amount">CGST Paid</Label>
                                    <Input id="cgst_amount" name="cgst_amount" placeholder="CGST Paid"
                                        value={data.cgst_amount || ""}
                                        className="h-10"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                cgst_amount: Number(e.target.value)
                                            }))
                                        }
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="sgst_amount">SGST Paid</Label>
                                    <Input id="sgst_amount" name="sgst_amount" placeholder="SGST Paid"
                                        value={data.sgst_amount || ""}
                                        className="h-10"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                sgst_amount: Number(e.target.value)
                                            }))
                                        }
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="igst_amount">IGST Paid</Label>
                                    <Input id="igst_amount" name="igst_amount" placeholder="IGST Paid"
                                        value={data.igst_amount || ""}
                                        className="h-10"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                igst_amount: Number(e.target.value)
                                            }))
                                        }
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="total_amount">Total Amount</Label>
                                    <Input id="total_amount" name="total_amount" placeholder="Total Amount" required
                                        value={data.total_amount || ""}
                                        className="h-10"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                total_amount: Number(e.target.value)
                                            }))
                                        }
                                    />
                                </Field>
                            </FieldGroup>

                            {/* Clean Footer */}
                            <div className="mt-4 flex justify-end gap-3">
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={loading}>Submit</Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    )
}

export default AddItemPopup