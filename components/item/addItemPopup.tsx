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
import { Camera, Edit, Lock, Plus } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PurchaseAdjustment } from "@/lib/types/dataTypes";
import { useAuth } from "../Users/roleContext";
import { itemInsert } from "@/lib/actions/taxCredit";

const AddItemPopup = ({ id, mode }: {
    id?: number;
    mode: "new" | "update" | "renew";
}) => {

    const router = useRouter();
    const [open, setOpen] = useState(false)
    const [isLocked, setLocked] = useState(false);

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

        if ((data.cgst_amount || data.sgst_amount) && (data.igst_amount)) {
            setData((prev) => ({
                ...prev,
                cgst_amount: null,
                sgst_amount: null,
                igst_amount: null,
            }))
            alert("You can enter CGST and SGST together, or IGST separately — not all three.");
            return
        }
        if ((!data.cgst_amount || !data.sgst_amount) && (!data.igst_amount)) {
            alert("Fill proper tax values");
            return
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
    }

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
                                    <Label htmlFor="bill_copy">Bill Copy</Label>
                                    <div className="flex">
                                        <Input id="bill_copy" name="bill_copy" placeholder="Bill Copy"
                                            type="file"
                                            className="h-10 mb-0 p-2"
                                            onChange={(e) =>
                                                setData(prev => ({
                                                    ...prev,
                                                    bill_file: e.target.files?.[0] ?? null
                                                }))
                                            }
                                        />
                                    </div>
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
                                <Button type="submit">Submit</Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    )
}

export default AddItemPopup