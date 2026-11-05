"use client";

import { useEffect } from "react";

export default function DeleteConfirmationGuard()
{
    useEffect(() =>
    {
        function handleSubmit(event: Event)
        {
            const submitEvent =
                event as SubmitEvent;

            const submitter =
                submitEvent.submitter as HTMLElement | null;

            if (!submitter)
            {
                return;
            }


            const buttonText =
                submitter.textContent
                    ?.trim()
                    .toLowerCase();


            // Only intercept Delete buttons.
            if (buttonText !== "delete")
            {
                return;
            }


            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this item? This action cannot be undone."
                );


            if (!confirmed)
            {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            }
        }


        document.addEventListener(
            "submit",
            handleSubmit,
            true
        );


        return () =>
        {
            document.removeEventListener(
                "submit",
                handleSubmit,
                true
            );
        };
    }, []);


    return null;
}