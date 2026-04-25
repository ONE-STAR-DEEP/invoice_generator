"use client"

import { FetchedAdjustment } from "@/lib/types/dataTypes"
import { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "../ui/button";
import { deleteItem } from "@/lib/actions/taxCredit";
import { Trash } from "lucide-react";

export const columns: ColumnDef<FetchedAdjustment>[] = [
    {
        accessorKey: "bill_no",
        header: "Bill No",
    },
    {
        accessorKey: "bill_date",
        header: "Bill Date",
        cell: ({ row }) => {
            const date = row.getValue("bill_date") as string;

            return (
                <span>
                    {new Date(date).toLocaleDateString("en-IN")}
                </span>
            );
        },
    },
    {
        accessorKey: "item_name",
        header: "Item Name",
    },
    {
        accessorKey: "hsn_code",
        header: "HSN Code",
    },
    {
        accessorKey: "supplier_gstin",
        header: "Supplier GST No",
    },
    {
        accessorKey: "taxable_amount",
        header: "Taxable Amount",
    },
    {
        accessorKey: "cgst_amount",
        header: "CGST Paid",
    },
    {
        accessorKey: "sgst_amount",
        header: "SGST Paid",
    },
    {
        accessorKey: "igst_amount",
        header: "IGST Paid",
    },
    {
        accessorKey: "total_amount",
        header: "Amount",
    },
    {
        accessorKey: "id",
        header: "Action",
        cell: ({ row }) => {
            const id = row.getValue("id") as number;
            const [deleteOpen, setDeleteOpen] = useState(false)
            const router = useRouter();

            const handelDelete = async () => {
                try {
                    const res = await deleteItem(id);
                    if (!res.success) {
                        alert(res.message);
                        return;
                    }
                    router.refresh()
                } catch (error) {
                    console.log(error)
                } finally {
                    setDeleteOpen(false);
                }
            }

            return (
                <div>
                    <Button onClick={() => setDeleteOpen(true)}><Trash size={16} /></Button>
                    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <DialogContent className="sm:max-w-sm">
                            <DialogHeader>
                                <DialogTitle className="text-red-500">Delete Item</DialogTitle>
                                <DialogDescription>
                                    Deleting this adjustment item will permanently remove it from the monthly invoice and alter the final calculation. This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" onClick={() => handelDelete()} variant={"destructive"}>Confirm</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            );
        },
    }
]