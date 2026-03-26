"use client";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types/dataTypes";
import { createUser } from "@/lib/actions/users";
import { useAuth } from "./roleContext";


const AddUserPopup = () => {

    const user = useAuth()

    const router = useRouter();

    const initialState: User = {
        name: "",
        email: "",
        mobile: "",
        password: "",
        role: "user"
    };

    const [data, setData] = useState<User>(initialState);

    const [open, setOpen] = useState(false)


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        const res = await createUser(data);

        if (!res.success) {
            alert("Failed to insert");
            return;
        }
        setData(initialState);
        setOpen(false);
        router.refresh();

    }

    return (
        <div>
            {user?.role === "admin" && <Button type="button" className="p-4" onClick={() => {
                setData(initialState);
                setOpen(true);
            }}>
                <Plus /> Add User
            </Button>
            }

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
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-xl">Add User Details</DialogTitle>
                            <DialogDescription>
                                Enter the details below to register a new user in the system.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-2">
                            <FieldGroup className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                                <Field>
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" placeholder="Full Name" required
                                        value={data.name
                                        }
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                name: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" placeholder="ex@example.com" required
                                        value={data.email}
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                email: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="mobile">Mobile</Label>
                                    <Input id="mobile" name="mobile" placeholder="999999XXXX" required
                                        value={data.mobile}
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                mobile: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" name="password" placeholder="password" required
                                        value={data.password}
                                        type="password"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                password: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="state">User Type</Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={(value) =>
                                            setData(prev => ({
                                                ...prev,
                                                role: value as "admin" | "accounts" | "user"
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="w-45">
                                            <SelectValue placeholder="Theme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="accounts">Accounts</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="user">User</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
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

export default AddUserPopup