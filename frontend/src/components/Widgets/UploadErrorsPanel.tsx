export const UploadErrorsPanel = ({ errors }: { errors: string[] }) => (
  <div className="mt-6 p-4 rounded-xl bg-red-100 border border-red-300 text-red-700 shadow-sm">
    <strong className="block mb-1">Upload Errors:</strong>
    <ul className="list-disc ml-6 space-y-1">
      {errors.map((e, i) => (
        <li key={i}>{e}</li>
      ))}
    </ul>
  </div>
);
