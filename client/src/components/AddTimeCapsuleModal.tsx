import { useState, useRef } from "react";

interface AddTimeCapsuleModalProps {
    onClose: () => void;
    onAdd: (name: string, description: string | null) => void;
    title?: string;
    submitLabel?: string;
    initialName?: string;
    initialDescription?: string;
    dateCapsule?: string;
    timeCapsule?: string;
}

function AddTimeCapsuleModal({
    onClose,
    onAdd,
    title = "New time capsule",
    submitLabel = "Tell something you'd want yourself to hear in the future",
    initialName = "",
    initialDescription = "",
    dateCapsule = "",
    timeCapsulte = "",
}: AddTimeCapsuleModalProps) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const formRef = useRef<HTMLFormElement>(null);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) return;
        onAdd(trimmedName, description.trim() || null);
    }
    function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onClose();
            return;
        }

        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            formRef.current?.requestSubmit();
        })

        return (
            <div
           className= "fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
        onMouseDown = { onClose }
            >
            <div
            className="w-full max-w-md rounded-lg border border-[#D8D0C2] bg-[#FFFCF5] p-6"
        onMouseDown = { (event) => event.stopPropagation()
    }
    onkeydown = { handleKeyDown }
        >
        <h2 className="text-xl font-semibold text-[#292824]" > { title } </h2
            >
        <form ref={ formRef } onSubmit = { handleSubmit } className = "mt-6" > <labl htmlFor="capsule-name" className = "text-sm text-[#716D63]"
            >
    }
)

