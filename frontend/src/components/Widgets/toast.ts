import { toast } from "react-toastify";

export async function runWithToasts<T>(fn: () => Promise<T>) {
  try {
    const result = await fn();

    toast.success("Debt Series saved successfully!", {
      position: "top-right",
      autoClose: 7000,
      pauseOnHover: true,
      closeOnClick: true,
    });

    return result;
  } catch (err) {
    console.error("Submit error:", err);

    toast.error("An error occurred while saving. Please try again.", {
      position: "top-right",
      autoClose: 7000,
      pauseOnHover: true,
      closeOnClick: true,
    });

    throw err; // still pass the error upward if caller needs it
  }
}
