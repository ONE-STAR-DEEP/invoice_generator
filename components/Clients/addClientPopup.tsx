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

type ClientData = {
    companyName: string;
    gstNumber: string;
    taxNumber: string;
    pan: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    email: string;
    phone: string;
    assignedPerson: string;
    designation: string;
    notes: string;
};

const AddClientPopup = () => {

    const [country, setCountry] = useState<Option | null>(null);
    const [state, setState] = useState<Option | null>(null);
    const [city, setCity] = useState<Option | null>(null);

    const [countries, setCountries] = useState<Option[]>([]);
    const [states, setStates] = useState<Option[]>([]);
    const [cities, setCities] = useState<Option[]>([]);

    type TaxKey = "gstNumber" | "taxNumber";

    const [taxType, setTaxType] = useState({
        value: "gstNumber" as TaxKey,
        label: "GSTIN"
    })

    type TaxOption = {
        value: TaxKey;
        label: string;
    };

    const taxOption: TaxOption[] = [
        { value: "gstNumber", label: "GSTIN" },
        { value: "taxNumber", label: "TAX Number" }
    ]

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

    const initialClientData: ClientData = {
        companyName: "",
        gstNumber: "",
        taxNumber: "",
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
    };

    const [data, setData] = useState<ClientData>(initialClientData);

    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (open) {
            setData({ ...initialClientData });
            setTaxType
        }
    }, [open]);

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
                        <div className="flex-1 overflow-y-auto px-6 py-2">

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
                                    <Input id="email" name="email" placeholder="ex@example.com"
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
                                    <Input id="phone" name="phone" placeholder="999999XXXX"
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
                                    <Label htmlFor="pan">PAN Number</Label>
                                    <Input id="pan" name="pan" placeholder="ABCDE1234F"
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
                                    <Label htmlFor="phone">Tax Identification Type</Label>
                                    <Select<TaxOption>
                                        required
                                        instanceId={"tax-id"}
                                        options={taxOption}
                                        defaultValue={{ value: "gstNumber", label: "GSTIN" }}
                                        placeholder="Select tax ID type"
                                        onChange={(val) => {
                                            if (!val) return;

                                            setData(prev => ({
                                                ...prev,
                                                taxNumber: "",
                                                gstNumber: ""
                                            }));

                                            setTaxType({
                                                value: val.value,
                                                label: val.label
                                            });
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
                                    <Label htmlFor={taxType.value}>{taxType.label}</Label>
                                    <Input id={taxType.value} name={taxType.value} placeholder={taxType.label}
                                        className="h-10"
                                        value={data[taxType.value as TaxKey]}
                                        type="text"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                [taxType.value as TaxKey]: e.target.value.toUpperCase()
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" name="address" placeholder="Office Address" required
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
                                        required
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
                                        required
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
                                        required
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
                                    <Input id="assignedPerson" name="assignedPerson" placeholder="Full Name"
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
                                    <Input id="personDesignation" name="personDesignation" placeholder="Designation"
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
                                    <Input id="notes" name="notes" placeholder="Notes"
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