export default function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  small?: boolean;
}) {
  return (
    <label
      className={`relative p-[2px] w-10 h-5 block overflow-hidden rounded-full border cursor-pointer ${
        checked
          ? "bg-green-500 border-green-500"
          : "bg-neutral-800 border-neutral-600"
      }`}
    >
      <input
        type="checkbox"
        className={`absolute block w-[14px] h-[14px] rounded-full appearance-none cursor-pointer bg-white ${
          checked ? "right-[2px]" : "left-[2px]"
        }`}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        className={`uppercase text-[8px] font-bold font-mono ${
          checked ? "text-white" : "text-neutral-500"
        } absolute top-0 bottom-0 flex items-center ${
          checked ? "right-5" : "left-5"
        }`}
      >
        {checked ? "on" : "off"}
      </span>
    </label>
  );
}
