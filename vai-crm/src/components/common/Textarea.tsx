
export const Textarea = (props: any) => (
  <textarea
    {...props}
    className={`w-full rounded-xl border px-3 py-2 h-24 outline-none focus:ring-2 focus:ring-orange-400 ${
      props.className || ""
    }`}
  />
);