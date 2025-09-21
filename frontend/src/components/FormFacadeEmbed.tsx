import { useEffect, useRef } from "react";

interface FormFacadeEmbedProps {
  formFacadeURL: string;
  onSubmitForm?: () => void;
}

export function FormFacadeEmbed({
  formFacadeURL,
  onSubmitForm,
}: FormFacadeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create script element
    const script = document.createElement("script");
    script.src = formFacadeURL;
    script.async = true;

    // Add the script to the container
    containerRef.current.appendChild(script);

    // Listen for form submission
    const handleFormSubmit = () => {
      if (onSubmitForm) {
        onSubmitForm();
      }
    };

    // Add event listener for form submissions
    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "formfacade_submitted") {
        handleFormSubmit();
      }
    });

    // Cleanup
    return () => {
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      window.removeEventListener("message", handleFormSubmit);
    };
  }, [formFacadeURL, onSubmitForm]);

  return (
    <div
      ref={containerRef}
      id="ff-compose"
      className="w-full"
      data-testid="formfacade-embed"
    />
  );
}
