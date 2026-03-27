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
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { insertClient } from "@/lib/actions/clients";
import { useAuth } from "../Users/roleContext";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { selectClassNames, selectStyles } from "../Invoice/addInvoicePopup";

type Option = {
    label: string;
    value: string;
};

const AddClientPopup = () => {

    const [country, setCountry] = useState<Option | null>(null);
    const [state, setState] = useState<Option | null>(null);
    const [city, setCity] = useState<Option | null>(null);

    const [countries, setCountries] = useState<Option[]>([]);
    const [states, setStates] = useState<Option[]>([]);
    const [cities, setCities] = useState<Option[]>([]);

    useEffect(() => {
        const allCountries = Country.getAllCountries().map((c) => ({
            label: c.name,
            value: c.isoCode,
        }));
        setCountries(allCountries);

        const india = allCountries.find((c) => c.value === "IN");
        if (india) setCountry(india);
    }, []);

    // Load states when country changes
    useEffect(() => {
        if (!country) return;

        const allStates = State.getStatesOfCountry(country.value).map((s) => ({
            label: s.name,
            value: s.isoCode,
        }));

        setStates(allStates);
        setState(null);
        setCities([]);
        setCity(null);
    }, [country]);

    // Load cities when state changes
    useEffect(() => {
        if (!country || !state) return;

        const allCities = City.getCitiesOfState(
            country.value,
            state.value
        ).map((c) => ({
            label: c.name,
            value: c.name,
        }));

        setCities(allCities);
        setCity(null);
    }, [state, country]);


    const router = useRouter();
    const user = useAuth()

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

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
            {user?.role !== "user" && <Button type="button" className="p-4" onClick={() => { setOpen(true) }}>
                <Plus /> Add Client
            </Button>}

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
                                        className="h-10"
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
                                        className="h-10"
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
                                        className="h-10"
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
                                        className="h-10"
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
                                        className="h-10"
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
                                        className="h-10"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                address: e.target.value
                                            }))
                                        }
                                    />
                                </Field>

                                <Field>
                                    <Label>Country</Label>
                                    <Select
                                    instanceId={"Country"}
                                        options={countries}
                                        value={country}
                                        placeholder="Select Country"
                                        onChange={(val) => {
                                            setCountry(val);

                                            setData((prev) => ({
                                                ...prev,
                                                country: val?.label || "",
                                                state: "",
                                                city: "",
                                            }));
                                        }}

                                        menuPortalTarget={mounted ? document.body : undefined}
                                        menuPosition="fixed"
                                        menuShouldBlockScroll={false}

                                        unstyled
                                        styles={selectStyles}
                                        classNames={selectClassNames}
                                    />
                                </Field>

                                <Field>
                                    <Label>State</Label>
                                    <Select
                                    instanceId={"state"}
                                        options={states}
                                        value={state}
                                        placeholder="Select State"
                                        isDisabled={!country}
                                        onChange={(val) => {
                                            setState(val);

                                            setData((prev) => ({
                                                ...prev,
                                                state: val?.label || "",
                                                city: "",
                                            }));
                                        }}

                                        menuPortalTarget={mounted ? document.body : undefined}
                                        menuPosition="fixed"
                                        menuShouldBlockScroll={false}

                                        unstyled
                                        styles={selectStyles}
                                        classNames={selectClassNames}
                                    />
                                </Field>

                                <Field>
                                    <Label>City</Label>
                                    <Select
                                    instanceId={"city"}
                                        options={cities}
                                        value={city}
                                        placeholder="Select City"
                                        isDisabled={!state}
                                        onChange={(val) => {
                                            setCity(val);

                                            setData((prev) => ({
                                                ...prev,
                                                city: val?.label || "",
                                            }));
                                        }}

                                        menuPortalTarget={mounted ? document.body : undefined}
                                        menuPosition="fixed"
                                        menuShouldBlockScroll={false}

                                        unstyled
                                        styles={selectStyles}
                                        classNames={selectClassNames}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="pincode">Pincode</Label>
                                    <Input id="pincode" name="pincode" placeholder="000000"
                                        className="h-10"
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
                                        className="h-10"
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
                                        className="h-10"
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
                                        className="h-10"
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