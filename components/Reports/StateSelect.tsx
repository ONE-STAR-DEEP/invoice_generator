"use client";

import dynamic from "next/dynamic";

const Select = dynamic(() => import("react-select"), {
  ssr: false,
});
import { useRouter, useSearchParams } from "next/navigation";
import { State } from "country-state-city";
import { selectClassNames, selectStyles } from "../Invoice/addInvoicePopup";

export default function StateParamSelect() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentState = searchParams.get("state");

    const states = State.getStatesOfCountry("IN").map((s) => ({
        label: s.name,
        value: s.name,
    }));

    const selected =
        states.find((s) => s.value === currentState) || null;

    const handleChange = (val: any) => {
        const params = new URLSearchParams(searchParams.toString());

        if (val?.value) {
            params.set("state", val.value);
        } else {
            params.delete("state");
        }

        router.replace(`?${params.toString()}`);
    };

    return (
        <Select
            instanceId="state_search"
            options={states}
            value={selected}
            onChange={handleChange}
            placeholder="Select State"
            isClearable
            className="w-60"
            unstyled
            styles={selectStyles}
            classNames={selectClassNames}
        />
    );
}