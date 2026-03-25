"use client";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";
// import { insertCompany } from "@/lib/actions/systemAdmin";
import { useRouter } from "next/navigation";
import { insertClient } from "@/lib/actions/clients";


const AddClientPopup = () => {

    const router = useRouter();

    const [data, setData] = useState({
        companyName: "",
        gstNumber: "",
        pan: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        email: "",
        phone: "",
        assignedPerson: "",
        designation: "",
        notes: "",
    })

    const [open, setOpen] = useState(false)


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        const res = await insertClient(data);

        if (!res.success) {
            alert("Failed to insert");
            return;
        }

        setOpen(false);
        router.refresh();

    }

    return (
        <div>
            <Button type="button" className="p-4" onClick={() => { setOpen(true) }}>
                <Plus /> Add Client
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
                    <form onSubmit={handleSubmit}>
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-xl">Add Client Details</DialogTitle>
                            <DialogDescription>
                                Enter the details below to register a new client in the system.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto px-6">

                            <FieldLabel className="text-lg mt-4 text-primary">
                                Company Details
                            </FieldLabel>
                            <FieldGroup className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

                                <Field>
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input id="companyName" name="companyName" placeholder="Company" required
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                companyName: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" placeholder="ex@example.com" required
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                email: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" name="phone" placeholder="999999XXXX" required
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                phone: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="gstNumber">GST Number</Label>
                                    <Input id="gstNumber" name="gstNumber" placeholder="22AAAAA0000A1Z5" required
                                        value={data.gstNumber}
                                        type="text"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                gstNumber: e.target.value.toUpperCase()
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="pan">Pan card</Label>
                                    <Input id="pan" name="pan" placeholder="ABCDE1234F" required
                                        value={data.pan}
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                pan: e.target.value.toUpperCase()
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" name="address" placeholder="Office Address"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                address: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" name="city" placeholder="City"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                city: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" name="state" placeholder="State"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                state: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="country">Country</Label>
                                    <Input id="country" name="country" placeholder="Country"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                country: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="pincode">Pincode</Label>
                                    <Input id="pincode" name="pincode" placeholder="000000"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                pincode: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                            </FieldGroup>

                            <FieldLabel className="text-lg mt-4 text-primary">
                                Person Details
                            </FieldLabel>

                            <FieldGroup className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

                                <Field>
                                    <Label htmlFor="assignedPerson">Person</Label>
                                    <Input id="assignedPerson" name="assignedPerson" placeholder="Full Name" required
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                assignedPerson: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="personDesignation">Person Designation</Label>
                                    <Input id="personDesignation" name="personDesignation" placeholder="Designation" required
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                designation: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="notes">Notes</Label>
                                    <Input id="notes" name="notes" placeholder="Notes" required
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                notes: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                            </FieldGroup>
                        </div>

                        {/* Clean Footer */}
                        <div className="p-6 pt-4 flex justify-end gap-3">
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Submit</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    )
}

export default AddClientPopup